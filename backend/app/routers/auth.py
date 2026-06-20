import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status

logger = logging.getLogger(__name__)
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.email import send_reset_email
from app.core.limiter import limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    generate_csrf_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.audit import AuditLog
from app.models.household import Household, HouseholdMember
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserOut
from app.routers.categories import seed_default_categories

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_OPTS = dict(httponly=True, secure=True, samesite="strict", path="/")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str, csrf_token: str) -> None:
    response.set_cookie("access_token", access_token, max_age=3600, **COOKIE_OPTS)
    response.set_cookie("refresh_token", refresh_token, max_age=86400 * 30, **COOKIE_OPTS)
    response.set_cookie("csrf_token", csrf_token, max_age=3600, httponly=False, secure=True, samesite="strict", path="/")


def _clear_auth_cookies(response: Response) -> None:
    for name in ("access_token", "refresh_token", "csrf_token"):
        response.delete_cookie(name, path="/")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="כתובת מייל כבר קיימת")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
    )
    db.add(user)
    await db.flush()

    household = Household(name=body.household_name)
    db.add(household)
    await db.flush()

    member = HouseholdMember(household_id=household.id, user_id=user.id, role="owner")
    db.add(member)
    await db.flush()
    await seed_default_categories(db, household.id)

    db.add(AuditLog(
        household_id=household.id,
        user_id=user.id,
        action="create",
        entity_type="user",
        entity_id=user.id,
        detail=f"רישום משתמש חדש: {user.email}",
        ip_address=_client_ip(request),
        user_agent=request.headers.get("User-Agent", "")[:500],
    ))

    await db.commit()

    access_token = create_access_token(str(user.id), household.id, user.token_version)
    refresh_token = create_refresh_token(str(user.id), user.token_version)
    csrf_token = generate_csrf_token()
    _set_auth_cookies(response, access_token, refresh_token, csrf_token)

    return UserOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        household_id=household.id,
        household_name=household.name,
        role="owner",
    )


@router.post("/login", response_model=UserOut)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email, User.is_active == True))
    user = result.scalar_one_or_none()

    ip = _client_ip(request)
    ua = request.headers.get("User-Agent", "")[:500]

    if not user or not verify_password(body.password, user.password_hash or ""):
        db.add(AuditLog(
            action="login_failed",
            entity_type="user",
            detail=body.email,
            ip_address=ip,
            user_agent=ua,
        ))
        await db.commit()
        raise HTTPException(status_code=401, detail="פרטי התחברות שגויים")

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

    user.last_login_at = datetime.now(timezone.utc)
    db.add(AuditLog(
        household_id=household.id,
        user_id=user.id,
        action="login",
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

    return UserOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        household_id=household.id,
        household_name=household.name,
        role=member.role,
    )


@router.post("/refresh")
@limiter.limit("20/minute")
async def refresh(request: Request, response: Response, refresh_token: str | None = Cookie(default=None), db: AsyncSession = Depends(get_db)):
    creds_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="לא מחובר")
    if not refresh_token:
        raise creds_error
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise creds_error
        user_id = int(payload.get("sub"))
        token_version = payload.get("tv", 1)
    except (JWTError, TypeError, ValueError):
        raise creds_error

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or user.token_version != token_version:
        raise creds_error

    member_result = await db.execute(
        select(HouseholdMember)
        .where(HouseholdMember.user_id == user.id)
        .limit(1)
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise creds_error

    new_access = create_access_token(str(user.id), member.household_id, user.token_version)
    new_refresh = create_refresh_token(str(user.id), user.token_version)
    csrf = generate_csrf_token()
    _set_auth_cookies(response, new_access, new_refresh, csrf)
    return {"ok": True}


@router.post("/logout")
async def logout(
    response: Response,
    access_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    if access_token:
        try:
            payload = decode_token(access_token)
            user_id = int(payload.get("sub", 0))
            token_version = payload.get("tv", 1)
            result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
            user = result.scalar_one_or_none()
            if user and user.token_version == token_version:
                user.token_version = user.token_version + 1
                await db.commit()
        except Exception:
            pass
    _clear_auth_cookies(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(ctx: tuple = Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    member_result = await db.execute(
        select(HouseholdMember).where(
            HouseholdMember.user_id == user.id,
            HouseholdMember.household_id == household.id,
        )
    )
    member = member_result.scalar_one()
    return UserOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        household_id=household.id,
        household_name=household.name,
        role=member.role,
    )


@router.patch("/me", response_model=UserOut, dependencies=[Depends(verify_csrf)])
async def update_me(body: dict, ctx: tuple = Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    name = (body.get("display_name") or "").strip()
    if not name:
        raise HTTPException(400, "שם לא יכול להיות ריק")
    result = await db.execute(select(User).where(User.id == user.id))
    u = result.scalar_one()
    u.display_name = name
    await db.commit()
    member_result = await db.execute(
        select(HouseholdMember).where(HouseholdMember.user_id == u.id, HouseholdMember.household_id == household.id)
    )
    member = member_result.scalar_one()
    return UserOut(id=u.id, email=u.email, display_name=u.display_name,
                   household_id=household.id, household_name=household.name, role=member.role)


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: dict, db: AsyncSession = Depends(get_db)):
    email = (body.get("email") or "").strip().lower()
    # Always return 200 to avoid user enumeration
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))
    user = result.scalar_one_or_none()
    if user and user.password_hash:
        try:
            token = create_reset_token(user.id)
            link = f"https://family-finance.net/reset-password?token={token}"
            await send_reset_email(email, link)
        except Exception as exc:
            logger.error("Failed to send reset email to %s: %s", email, exc)
    elif user and not user.password_hash:
        logger.info("Reset requested for Google-only account: %s", email)
    return {"ok": True}


@router.post("/reset-password")
async def reset_password(body: dict, db: AsyncSession = Depends(get_db)):
    token = (body.get("token") or "").strip()
    new_password = (body.get("password") or "")
    try:
        validate_password_strength(new_password)
    except ValueError as e:
        raise HTTPException(400, str(e))
    try:
        payload = decode_token(token)
        if payload.get("type") != "reset":
            raise HTTPException(400, "קישור לא תקין")
        user_id = int(payload["sub"])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "הקישור פג תוקף או לא תקין")
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(400, "משתמש לא נמצא")
    user.password_hash = hash_password(new_password)
    user.token_version = user.token_version + 1
    await db.commit()
    return {"ok": True}


@router.post("/change-password", dependencies=[Depends(verify_csrf)])
async def change_password(body: dict, ctx: tuple = Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, _ = ctx
    result = await db.execute(select(User).where(User.id == user.id))
    u = result.scalar_one()
    if not u.password_hash:
        raise HTTPException(400, "חשבון זה משתמש בגוגל — לא ניתן לשנות סיסמה")
    current = (body.get("current_password") or "")
    new_pw = (body.get("new_password") or "")
    if not verify_password(current, u.password_hash):
        raise HTTPException(400, "הסיסמה הנוכחית שגויה")
    try:
        validate_password_strength(new_pw)
    except ValueError as e:
        raise HTTPException(400, str(e))
    u.password_hash = hash_password(new_pw)
    u.token_version = u.token_version + 1
    await db.commit()
    return {"ok": True}
