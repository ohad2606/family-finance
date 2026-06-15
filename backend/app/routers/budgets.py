from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import Budget, Category, Transaction
from app.schemas.finance import BudgetUpsert, BudgetLineOut

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _first_of_month(d: date) -> date:
    return d.replace(day=1)


@router.get("", response_model=list[BudgetLineOut])
async def get_budget(
    month: date = Query(...),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    month_start = _first_of_month(month)
    month_end = month_start.replace(month=month_start.month % 12 + 1, day=1) if month_start.month < 12 \
        else month_start.replace(year=month_start.year + 1, month=1, day=1)

    # All expense categories for this household
    cats_result = await db.execute(
        select(Category).where(
            Category.household_id == household.id,
            Category.kind == "expense",
        )
    )
    categories = cats_result.scalars().all()

    # Budgets set for this month
    budgets_result = await db.execute(
        select(Budget).where(
            Budget.household_id == household.id,
            Budget.month == month_start,
        ).options(selectinload(Budget.category))
    )
    budgets = {b.category_id: b for b in budgets_result.scalars().all()}

    # Actual spending per category this month
    actuals_result = await db.execute(
        select(Transaction.category_id, func.sum(Transaction.amount))
        .where(
            Transaction.household_id == household.id,
            Transaction.kind == "expense",
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date < month_end,
        )
        .group_by(Transaction.category_id)
    )
    actuals = {row[0]: float(row[1]) for row in actuals_result.all()}

    lines = []
    for cat in categories:
        actual = actuals.get(cat.id, 0.0)
        planned = float(budgets[cat.id].amount_planned) if cat.id in budgets else 0.0
        if planned == 0 and actual == 0:
            continue
        lines.append(BudgetLineOut(
            category_id=cat.id,
            category_name=cat.name,
            category_icon=cat.icon,
            amount_planned=planned,
            amount_actual=actual,
        ))

    # Sort: over-budget first, then by actual desc
    lines.sort(key=lambda l: (-(l.amount_actual > l.amount_planned), -l.amount_actual))
    return lines


@router.put("", response_model=BudgetLineOut, dependencies=[Depends(verify_csrf)])
async def upsert_budget(
    body: BudgetUpsert,
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    month_start = _first_of_month(body.month)

    result = await db.execute(
        select(Budget).where(
            Budget.household_id == household.id,
            Budget.category_id == body.category_id,
            Budget.month == month_start,
        ).options(selectinload(Budget.category))
    )
    budget = result.scalar_one_or_none()

    if budget:
        budget.amount_planned = body.amount_planned
    else:
        budget = Budget(
            household_id=household.id,
            category_id=body.category_id,
            month=month_start,
            amount_planned=body.amount_planned,
        )
        db.add(budget)

    await db.commit()
    await db.refresh(budget)

    # Load category for response
    cat_result = await db.execute(select(Category).where(Category.id == body.category_id))
    cat = cat_result.scalar_one()

    month_end = month_start.replace(month=month_start.month % 12 + 1, day=1) if month_start.month < 12 \
        else month_start.replace(year=month_start.year + 1, month=1, day=1)

    actual_result = await db.execute(
        select(func.sum(Transaction.amount)).where(
            Transaction.household_id == household.id,
            Transaction.category_id == body.category_id,
            Transaction.kind == "expense",
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date < month_end,
        )
    )
    actual = float(actual_result.scalar() or 0)

    return BudgetLineOut(
        category_id=cat.id,
        category_name=cat.name,
        category_icon=cat.icon,
        amount_planned=body.amount_planned,
        amount_actual=actual,
    )
