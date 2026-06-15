from fastapi import Cookie, Depends, Header, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.database import get_db
from app.models.household import Household, HouseholdMember
from app.models.user import User


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    access_token: str | None = Cookie(default=None),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="לא מחובר",
    )
    if not access_token:
        raise credentials_error
    try:
        payload = decode_token(access_token)
        if payload.get("type") != "access":
            raise credentials_error
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_error
    except JWTError:
        raise credentials_error

    result = await db.execute(select(User).where(User.id == int(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_error
    return user


async def get_current_household(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    access_token: str | None = Cookie(default=None),
) -> tuple[User, Household]:
    try:
        payload = decode_token(access_token)
        household_id = payload.get("hid")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="לא מחובר")

    result = await db.execute(
        select(Household)
        .join(HouseholdMember, HouseholdMember.household_id == Household.id)
        .where(
            HouseholdMember.user_id == current_user.id,
            Household.id == household_id,
        )
    )
    household = result.scalar_one_or_none()
    if not household:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="אין גישה")
    return current_user, household


async def verify_csrf(
    x_csrf_token: str | None = Header(default=None),
    csrf_token: str | None = Cookie(default=None),
) -> None:
    if not x_csrf_token or not csrf_token or x_csrf_token != csrf_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token שגוי")
