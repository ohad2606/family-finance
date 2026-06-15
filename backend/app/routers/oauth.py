import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, generate_csrf_token
from app.database import get_db
from app.models.audit import AuditLog
from app.models.household import Household, HouseholdMember
from app.models.user import User
from app.routers.categories import seed_default_categories

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

FRONTEND_URL = "https://myzuzim.net"
STATE_COOKIE = "oauth_state"
_COOKIE = dict(httponly=True, secure=True, samesite="strict", path="/")
_STATE_COOKIE = dict(httponly=True, secure=True, samesite="lax", path="/")


@router.get("/google")
async def google_login():
    state = secrets.token_urlsafe(32)
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    resp = RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")
    resp.set_cookie(STATE_COOKIE, state, max_age=600, **_STATE_COOKIE)
    return resp


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    p = request.query_params
    code, state, error = p.get("code"), p.get("state"), p.get("error")

    if error or not code or not state:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=oauth_cancelled")

    if request.cookies.get(STATE_COOKIE) != state:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=invalid_state")

    # Exchange code → tokens → user info
    async with httpx.AsyncClient(timeout=10) as client:
        tok = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        if tok.status_code != 200:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=token_exchange")

        ui = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {tok.json()['access_token']}"},
        )
        if ui.status_code != 200:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=userinfo")

    info = ui.json()
    google_id = info.get("sub")
    email = info.get("email")
    display_name = info.get("name") or (email.split("@")[0] if email else "משתמש")

    if not google_id or not email:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=missing_info")

    # Find or create user
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if not user:
        # Try linking by email (existing password-based account)
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.google_id = google_id
        else:
            user = User(email=email, display_name=display_name, google_id=google_id)
            db.add(user)
            await db.flush()

            household = Household(name=f"בית {display_name}")
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
                detail=f"רישום משתמש דרך גוגל: {email}",
            ))

    member_row = await db.execute(
        select(HouseholdMember, Household)
        .join(Household, Household.id == HouseholdMember.household_id)
        .where(HouseholdMember.user_id == user.id)
        .limit(1)
    )
    row = member_row.first()
    if not row:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_household")

    _, household = row
    await db.commit()

    access_token = create_access_token(str(user.id), household.id)
    refresh_token = create_refresh_token(str(user.id))
    csrf = generate_csrf_token()

    resp = RedirectResponse(url=FRONTEND_URL)
    resp.set_cookie("access_token", access_token, max_age=3600, **_COOKIE)
    resp.set_cookie("refresh_token", refresh_token, max_age=86400 * 30, **_COOKIE)
    resp.set_cookie("csrf_token", csrf, max_age=3600, httponly=False, secure=True, samesite="strict", path="/")
    resp.delete_cookie(STATE_COOKIE, path="/", samesite="lax")
    return resp
