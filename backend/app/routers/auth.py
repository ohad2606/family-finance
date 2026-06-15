from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_csrf_token,
    hash_password,
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


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str, csrf_token: str) -> None:
    response.set_cookie("access_token", access_token, max_age=3600, **COOKIE_OPTS)
    response.set_cookie("refresh_token", refresh_token, max_age=86400 * 30, **COOKIE_OPTS)
    response.set_cookie("csrf_token", csrf_token, max_age=3600, httponly=False, secure=True, samesite="strict", path="/")


def _clear_auth_cookies(response: Response) -> None:
    for name in ("access_token", "refresh_token", "csrf_token"):
        response.delete_cookie(name, path="/")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
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
    ))

    await db.commit()

    access_token = create_access_token(str(user.id), household.id)
    refresh_token = create_refresh_token(str(user.id))
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
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email, User.is_active == True))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
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
    ))
    await db.commit()

    access_token = create_access_token(str(user.id), household.id)
    refresh_token = create_refresh_token(str(user.id))
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


@router.post("/logout", dependencies=[Depends(verify_csrf)])
async def logout(response: Response):
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
