from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household
from app.models.finance import Account, Category, Transaction
from app.schemas.finance import DashboardSummary, CashflowMonth, CategorySpend

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def summary(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    hid = household.id
    today = date.today()
    month_start = today.replace(day=1)

    # יתרות כל החשבונות
    acc_result = await db.execute(select(Account).where(Account.household_id == hid, Account.is_active == True))
    accounts = acc_result.scalars().all()

    tx_result = await db.execute(
        select(
            Transaction.account_id,
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        )
        .where(Transaction.household_id == hid)
        .group_by(Transaction.account_id)
    )
    tx_by_account = {row.account_id: (float(row.inc), float(row.exp)) for row in tx_result}

    total_assets = 0.0
    total_liabilities = 0.0
    for acc in accounts:
        inc, exp = tx_by_account.get(acc.id, (0.0, 0.0))
        balance = float(acc.opening_balance) + inc - exp
        if acc.type == "credit":
            total_liabilities += max(0, -balance)
        else:
            if balance >= 0:
                total_assets += balance
            else:
                total_liabilities += -balance

    # הכנסות והוצאות החודש
    month_result = await db.execute(
        select(
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        )
        .where(
            Transaction.household_id == hid,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= today,
        )
    )
    row = month_result.first()
    month_income = float(row.inc or 0)
    month_expense = float(row.exp or 0)

    return DashboardSummary(
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=total_assets - total_liabilities,
        month_income=month_income,
        month_expense=month_expense,
        month_balance=month_income - month_expense,
    )


@router.get("/cashflow", response_model=list[CashflowMonth])
async def cashflow(
    months: int = Query(6, ge=1, le=24),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    today = date.today()
    # First day of the earliest month we want
    start = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    for _ in range(months - 1):
        start = (start - timedelta(days=1)).replace(day=1)

    result = await db.execute(
        select(
            extract("year", Transaction.transaction_date).label("yr"),
            extract("month", Transaction.transaction_date).label("mo"),
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("income"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("expense"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= today,
        )
        .group_by("yr", "mo")
        .order_by("yr", "mo")
    )

    rows = result.all()
    # Build a full list including months with no data
    out = []
    cur = start
    row_map = {(int(r.yr), int(r.mo)): r for r in rows}
    for _ in range(months):
        key = (cur.year, cur.month)
        r = row_map.get(key)
        out.append(CashflowMonth(
            month=cur.strftime("%Y-%m"),
            income=float(r.income) if r else 0.0,
            expense=float(r.expense) if r else 0.0,
        ))
        # advance one month
        if cur.month == 12:
            cur = cur.replace(year=cur.year + 1, month=1)
        else:
            cur = cur.replace(month=cur.month + 1)
    return out


@router.get("/spending", response_model=list[CategorySpend])
async def spending_by_category(
    month: date = Query(...),
    kind: str = Query("expense"),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    month_start = month.replace(day=1)
    if month_start.month == 12:
        month_end = month_start.replace(year=month_start.year + 1, month=1)
    else:
        month_end = month_start.replace(month=month_start.month + 1)

    result = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.kind == kind,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date < month_end,
        )
        .group_by(Transaction.category_id)
        .order_by(func.sum(Transaction.amount).desc())
    )
    rows = result.all()
    if not rows:
        return []

    total = sum(float(r.total) for r in rows)

    # fetch category details
    cat_ids = [r.category_id for r in rows if r.category_id]
    cats = {}
    if cat_ids:
        cat_result = await db.execute(select(Category).where(Category.id.in_(cat_ids)))
        cats = {c.id: c for c in cat_result.scalars().all()}

    return [
        CategorySpend(
            category_id=r.category_id,
            category_name=cats[r.category_id].name if r.category_id and r.category_id in cats else "ללא קטגוריה",
            category_icon=cats[r.category_id].icon if r.category_id and r.category_id in cats else None,
            amount=round(float(r.total), 2),
            pct=round(float(r.total) / total, 4) if total else 0,
        )
        for r in rows
    ]
