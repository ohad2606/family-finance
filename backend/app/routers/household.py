import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_household, get_current_user, verify_csrf
from app.models.household import Household, HouseholdInvite, HouseholdMember
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/household", tags=["household"])

INVITE_TTL_DAYS = 7


class MemberOut(BaseModel):
    id: int
    user_id: int
    display_name: str
    email: str
    role: str
    joined_at: datetime


class HouseholdOut(BaseModel):
    id: int
    name: str
    currency: str
    members: list[MemberOut]


class InviteOut(BaseModel):
    token: str
    url: str
    expires_at: datetime


class InviteInfoOut(BaseModel):
    household_name: str
    expires_at: datetime
    valid: bool


@router.get("", response_model=HouseholdOut)
async def get_household(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(HouseholdMember)
        .where(HouseholdMember.household_id == household.id)
        .options(selectinload(HouseholdMember.user))
    )
    members = result.scalars().all()
    return HouseholdOut(
        id=household.id,
        name=household.name,
        currency=household.currency,
        members=[
            MemberOut(
                id=m.id,
                user_id=m.user_id,
                display_name=m.user.display_name,
                email=m.user.email,
                role=m.role,
                joined_at=m.joined_at,
            )
            for m in members
        ],
    )


@router.post("/invite", response_model=InviteOut, dependencies=[Depends(verify_csrf)])
async def create_invite(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=INVITE_TTL_DAYS)
    invite = HouseholdInvite(
        household_id=household.id,
        token=token,
        created_by=user.id,
        expires_at=expires_at,
    )
    db.add(invite)
    await db.commit()
    base = settings.GOOGLE_REDIRECT_URI.replace("/api/auth/google/callback", "")
    url = f"{base}/join?token={token}"
    return InviteOut(token=token, url=url, expires_at=expires_at)


@router.get("/invite/{token}", response_model=InviteInfoOut)
async def get_invite_info(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HouseholdInvite)
        .where(HouseholdInvite.token == token)
        .options(selectinload(HouseholdInvite.household))
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(404, "קישור הזמנה לא נמצא")
    valid = invite.used_at is None and invite.expires_at > datetime.now(timezone.utc)
    return InviteInfoOut(
        household_name=invite.household.name,
        expires_at=invite.expires_at,
        valid=valid,
    )


@router.post("/join/{token}", dependencies=[Depends(verify_csrf)])
async def join_household(token: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(HouseholdInvite)
        .where(HouseholdInvite.token == token)
        .options(selectinload(HouseholdInvite.household))
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(404, "קישור הזמנה לא נמצא")
    if invite.used_at is not None:
        raise HTTPException(400, "קישור ההזמנה כבר שומש")
    if invite.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "קישור ההזמנה פג תוקף")

    existing = await db.execute(
        select(HouseholdMember).where(
            HouseholdMember.user_id == user.id,
            HouseholdMember.household_id == invite.household_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "כבר חבר במשק הבית הזה")

    member = HouseholdMember(
        household_id=invite.household_id,
        user_id=user.id,
        role="member",
    )
    db.add(member)
    invite.used_at = datetime.now(timezone.utc)
    invite.used_by = user.id
    await db.commit()
    return {"household_id": invite.household_id, "household_name": invite.household.name}


@router.patch("/name", dependencies=[Depends(verify_csrf)])
async def update_household_name(
    body: dict,
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "שם לא יכול להיות ריק")
    result = await db.execute(select(Household).where(Household.id == household.id))
    hh = result.scalar_one()
    hh.name = name
    await db.commit()
    return {"name": hh.name}


@router.delete("/members/{member_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def remove_member(member_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    result = await db.execute(
        select(HouseholdMember).where(
            HouseholdMember.id == member_id,
            HouseholdMember.household_id == household.id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(404, "חבר לא נמצא")
    if member.user_id == user.id:
        raise HTTPException(400, "לא ניתן להסיר את עצמך")
    await db.delete(member)
    await db.commit()
