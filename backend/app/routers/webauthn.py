import json
from datetime import datetime, timedelta, timezone

import webauthn
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from webauthn import base64url_to_bytes, options_to_json
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_csrf_token,
)
from app.database import get_db
from app.deps import get_current_user, verify_csrf
from app.models.audit import AuditLog
from app.models.household import Household, HouseholdMember
from app.models.user import User
from app.models.webauthn import WebAuthnCredential
from app.routers.auth import _set_auth_cookies

router = APIRouter(prefix="/auth/webauthn", tags=["webauthn"])

RP_ID = "family-finance.net"
RP_NAME = "תקציב"
ORIGIN = "https://family-finance.net"

_CHALLENGE_COOKIE = "webauthn_ch"
_CHALLENGE_COOKIE_OPTS = dict(
    httponly=True,
    secure=True,
    samesite="strict",
    path="/api/auth/webauthn",
    max_age=300,
)


def _encode_challenge(challenge: bytes, user_id: int | None = None) -> str:
    import base64
    ch_b64 = base64.urlsafe_b64encode(challenge).rstrip(b"=").decode()
    payload: dict = {
        "ch": ch_b64,
        "iss": "webauthn",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    if user_id is not None:
        payload["sub"] = str(user_id)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def _decode_challenge(token: str) -> tuple[bytes, int | None]:
    import base64
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("iss") != "webauthn":
            raise HTTPException(status_code=400, detail="challenge לא תקין")
        ch_b64 = payload["ch"]
        # Restore padding
        padding = 4 - len(ch_b64) % 4
        if padding != 4:
            ch_b64 += "=" * padding
        challenge = base64.urlsafe_b64decode(ch_b64)
        sub = payload.get("sub")
        user_id = int(sub) if sub is not None else None
        return challenge, user_id
    except (JWTError, KeyError, Exception) as e:
        raise HTTPException(status_code=400, detail="challenge לא תקין או פג תוקף")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.get("/register/begin")
async def register_begin(
    response: Response,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WebAuthnCredential).where(WebAuthnCredential.user_id == user.id)
    )
    existing = result.scalars().all()

    options = webauthn.generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_id=str(user.id).encode(),
        user_name=user.email,
        user_display_name=user.display_name,
        authenticator_selection=AuthenticatorSelectionCriteria(
            user_verification=UserVerificationRequirement.REQUIRED,
            resident_key=ResidentKeyRequirement.PREFERRED,
        ),
        exclude_credentials=[
            PublicKeyCredentialDescriptor(id=c.credential_id)
            for c in existing
        ],
    )

    ch_token = _encode_challenge(options.challenge, user.id)
    response.set_cookie(_CHALLENGE_COOKIE, ch_token, **_CHALLENGE_COOKIE_OPTS)

    return json.loads(options_to_json(options))


@router.post("/register/complete", dependencies=[Depends(verify_csrf)])
async def register_complete(
    body: dict,
    response: Response,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    webauthn_ch: str | None = Cookie(default=None),
):
    if not webauthn_ch:
        raise HTTPException(status_code=400, detail="challenge חסר")

    challenge, challenge_user_id = _decode_challenge(webauthn_ch)

    if challenge_user_id != user.id:
        raise HTTPException(status_code=400, detail="challenge לא תואם")

    try:
        verification = webauthn.verify_registration_response(
            credential=body,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"אימות נכשל: {str(e)}")

    cred_name = (body.get("name") or "טביעת אצבע")[:100]

    cred = WebAuthnCredential(
        user_id=user.id,
        credential_id=verification.credential_id,
        public_key=verification.credential_public_key,
        sign_count=verification.sign_count,
        name=cred_name,
    )
    db.add(cred)
    await db.commit()
    await db.refresh(cred)

    response.delete_cookie(_CHALLENGE_COOKIE, path="/api/auth/webauthn")

    return {
        "id": cred.id,
        "name": cred.name,
        "created_at": cred.created_at.isoformat() if cred.created_at else None,
    }


@router.post("/login/begin")
async def login_begin(response: Response):
    options = webauthn.generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=[],
        user_verification=UserVerificationRequirement.REQUIRED,
    )

    ch_token = _encode_challenge(options.challenge)
    response.set_cookie(_CHALLENGE_COOKIE, ch_token, **_CHALLENGE_COOKIE_OPTS)

    return json.loads(options_to_json(options))


@router.post("/login/complete")
async def login_complete(
    request: Request,
    body: dict,
    response: Response,
    db: AsyncSession = Depends(get_db),
    webauthn_ch: str | None = Cookie(default=None),
):
    if not webauthn_ch:
        raise HTTPException(status_code=400, detail="challenge חסר")

    challenge, _ = _decode_challenge(webauthn_ch)

    raw_id = body.get("rawId")
    if not raw_id:
        raise HTTPException(status_code=400, detail="credential לא תקין")

    cred_id_bytes = base64url_to_bytes(raw_id)

    result = await db.execute(
        select(WebAuthnCredential)
        .where(WebAuthnCredential.credential_id == cred_id_bytes)
    )
    stored_cred = result.scalar_one_or_none()

    if not stored_cred:
        raise HTTPException(status_code=401, detail="Passkey לא זוהה")

    try:
        verification = webauthn.verify_authentication_response(
            credential=body,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
            credential_public_key=stored_cred.public_key,
            credential_current_sign_count=stored_cred.sign_count,
            require_user_verification=True,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"אימות נכשל: {str(e)}")

    stored_cred.sign_count = verification.new_sign_count
    stored_cred.last_used_at = datetime.now(timezone.utc)

    user_result = await db.execute(
        select(User).where(User.id == stored_cred.user_id, User.is_active == True)
    )
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="משתמש לא פעיל")

    member_result = await db.execute(
        select(HouseholdMember, Household)
        .join(Household, Household.id == HouseholdMember.household_id)
        .where(HouseholdMember.user_id == user.id)
        .limit(1)
    )
    row = member_result.first()
    if not row:
        raise HTTPException(status_code=403, detail="אין משק בית משויך")
    member, household = row

    ip = _client_ip(request)
    ua = request.headers.get("User-Agent", "")[:500]

    db.add(AuditLog(
        household_id=household.id,
        user_id=user.id,
        action="webauthn_login",
        entity_type="user",
        entity_id=user.id,
        ip_address=ip,
        user_agent=ua,
    ))
    await db.commit()

    access_token = create_access_token(str(user.id), household.id, user.token_version)
    refresh_token = create_refresh_token(str(user.id), user.token_version)
    csrf_token = generate_csrf_token()
    _set_auth_cookies(response, access_token, refresh_token, csrf_token)

    response.delete_cookie(_CHALLENGE_COOKIE, path="/api/auth/webauthn")

    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "household_id": household.id,
        "household_name": household.name,
        "role": member.role,
    }


@router.get("/credentials")
async def list_credentials(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WebAuthnCredential)
        .where(WebAuthnCredential.user_id == user.id)
        .order_by(WebAuthnCredential.created_at)
    )
    creds = result.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "last_used_at": c.last_used_at.isoformat() if c.last_used_at else None,
        }
        for c in creds
    ]


@router.delete("/credentials/{cred_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(verify_csrf)])
async def delete_credential(
    cred_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WebAuthnCredential).where(
            WebAuthnCredential.id == cred_id,
            WebAuthnCredential.user_id == user.id,
        )
    )
    cred = result.scalar_one_or_none()
    if not cred:
        raise HTTPException(status_code=404, detail="Passkey לא נמצא")
    await db.delete(cred)
    await db.commit()
