from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import SavingsGoal
from app.schemas.finance import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalOut

router = APIRouter(prefix="/savings", tags=["savings"])


def _to_out(g: SavingsGoal) -> SavingsGoalOut:
    target = float(g.target_amount)
    current = float(g.current_amount)
    pct = min(current / target, 1.0) if target > 0 else 0.0

    months_left = None
    monthly_needed = None
    if g.target_date and not g.is_completed:
        today = date.today()
        if g.target_date > today:
            delta = (g.target_date.year - today.year) * 12 + (g.target_date.month - today.month)
            months_left = max(delta, 1)
            remaining = max(target - current, 0)
            monthly_needed = round(remaining / months_left, 2) if months_left > 0 else remaining

    return SavingsGoalOut(
        id=g.id,
        name=g.name,
        target_amount=target,
        current_amount=current,
        target_date=g.target_date,
        icon=g.icon,
        color=g.color,
        is_completed=g.is_completed,
        pct=round(pct, 4),
        months_left=months_left,
        monthly_needed=monthly_needed,
    )


@router.get("", response_model=list[SavingsGoalOut])
async def list_goals(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(SavingsGoal)
        .where(SavingsGoal.household_id == household.id)
        .order_by(SavingsGoal.is_completed, SavingsGoal.target_date.nulls_last(), SavingsGoal.id)
    )
    return [_to_out(g) for g in result.scalars().all()]


@router.post("", response_model=SavingsGoalOut, status_code=201, dependencies=[Depends(verify_csrf)])
async def create_goal(body: SavingsGoalCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    goal = SavingsGoal(household_id=household.id, **body.model_dump())
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return _to_out(goal)


@router.patch("/{goal_id}", response_model=SavingsGoalOut, dependencies=[Depends(verify_csrf)])
async def update_goal(goal_id: int, body: SavingsGoalUpdate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.household_id == household.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(404, "יעד לא נמצא")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(goal, k, v)
    await db.commit()
    await db.refresh(goal)
    return _to_out(goal)


@router.delete("/{goal_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def delete_goal(goal_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.household_id == household.id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(404, "יעד לא נמצא")
    await db.delete(goal)
    await db.commit()
