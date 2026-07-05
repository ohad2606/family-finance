from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import ExpectedOccurrence, RecurringRule, Account
from app.schemas.finance import ExpectedOccurrenceOut, RecurringRuleCreate, RecurringRuleUpdate, RecurringRuleOut
from app.scheduler import generate_occurrences

router = APIRouter(prefix="/recurring", tags=["recurring"])


def _to_out(r: RecurringRule) -> RecurringRuleOut:
    return RecurringRuleOut(
        id=r.id,
        account_id=r.account_id,
        account_name=r.account.name if r.account else "",
        category_id=r.category_id,
        category_name=r.category.name if r.category else None,
        category_icon=r.category.icon if r.category else None,
        amount=float(r.amount),
        kind=r.kind,
        description=r.description,
        frequency=r.frequency,
        next_date=r.next_date,
        end_date=r.end_date,
        is_active=r.is_active,
        match_pattern=r.match_pattern,
        amount_tolerance_pct=float(r.amount_tolerance_pct) if r.amount_tolerance_pct is not None else None,
        match_window_days=r.match_window_days,
        grace_days=r.grace_days,
    )


def _opts():
    return [
        selectinload(RecurringRule.account),
        selectinload(RecurringRule.category),
    ]


@router.get("", response_model=list[RecurringRuleOut])
async def list_rules(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(RecurringRule)
        .where(RecurringRule.household_id == household.id)
        .order_by(RecurringRule.next_date)
        .options(*_opts())
    )
    return [_to_out(r) for r in result.scalars().all()]


@router.post("", response_model=RecurringRuleOut, status_code=201, dependencies=[Depends(verify_csrf)])
async def create_rule(body: RecurringRuleCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    acc = await db.execute(select(Account).where(Account.id == body.account_id, Account.household_id == household.id))
    if not acc.scalar_one_or_none():
        raise HTTPException(404, "חשבון לא נמצא")
    rule = RecurringRule(household_id=household.id, created_by=user.id, **body.model_dump())
    db.add(rule)
    await db.commit()
    await generate_occurrences()
    result = await db.execute(select(RecurringRule).where(RecurringRule.id == rule.id).options(*_opts()))
    return _to_out(result.scalar_one())


@router.patch("/{rule_id}", response_model=RecurringRuleOut, dependencies=[Depends(verify_csrf)])
async def update_rule(rule_id: int, body: RecurringRuleUpdate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(RecurringRule).where(RecurringRule.id == rule_id, RecurringRule.household_id == household.id).options(*_opts())
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, "כלל לא נמצא")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(rule, k, v)
    await db.commit()
    if body.match_pattern is not None:
        await generate_occurrences()
    result = await db.execute(select(RecurringRule).where(RecurringRule.id == rule_id).options(*_opts()))
    return _to_out(result.scalar_one())


@router.delete("/{rule_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def delete_rule(rule_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(RecurringRule).where(RecurringRule.id == rule_id, RecurringRule.household_id == household.id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, "כלל לא נמצא")
    await db.delete(rule)
    await db.commit()


@router.get("/upcoming", response_model=list[RecurringRuleOut])
async def upcoming_rules(
    days: int = Query(7, ge=1, le=30),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    cutoff = date.today() + timedelta(days=days)
    result = await db.execute(
        select(RecurringRule)
        .where(
            and_(
                RecurringRule.household_id == household.id,
                RecurringRule.is_active == True,
                RecurringRule.next_date <= cutoff,
            )
        )
        .order_by(RecurringRule.next_date)
        .options(*_opts())
    )
    return [_to_out(r) for r in result.scalars().all()]


@router.get("/occurrences", response_model=list[ExpectedOccurrenceOut])
async def list_occurrences(
    month: str = Query(..., description="YYYY-MM"),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    try:
        year, mon = int(month[:4]), int(month[5:7])
        start = date(year, mon, 1)
        end = date(year, mon + 1, 1) if mon < 12 else date(year + 1, 1, 1)
    except Exception:
        raise HTTPException(400, "פורמט חודש לא תקין, השתמש ב-YYYY-MM")
    result = await db.execute(
        select(ExpectedOccurrence).where(
            ExpectedOccurrence.household_id == household.id,
            ExpectedOccurrence.due_date >= start,
            ExpectedOccurrence.due_date < end,
        ).order_by(ExpectedOccurrence.due_date)
    )
    return result.scalars().all()


@router.post("/occurrences/{occ_id}/skip", dependencies=[Depends(verify_csrf)])
async def skip_occurrence(occ_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(ExpectedOccurrence)
        .options(selectinload(ExpectedOccurrence.rule))
        .where(ExpectedOccurrence.id == occ_id, ExpectedOccurrence.household_id == household.id)
    )
    occ = result.scalar_one_or_none()
    if not occ:
        raise HTTPException(404, "מופע לא נמצא")
    if occ.status == "matched":
        raise HTTPException(400, "לא ניתן לדלג על מופע שכבר בוצע")
    occ.status = "skipped"
    # Advance rule so it generates the next cycle
    if occ.rule.next_date == occ.due_date:
        from app.scheduler import _advance
        occ.rule.next_date = _advance(occ.rule)
    await db.commit()
    await generate_occurrences()
    return {"ok": True}
