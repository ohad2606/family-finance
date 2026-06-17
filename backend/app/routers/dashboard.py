from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household
from app.models.finance import Account, Category, Transaction, Budget, Loan
from app.schemas.finance import DashboardSummary, CashflowMonth, CategorySpend, AnnualReport, NetWorthPoint, FinancialHealth, HealthMetric

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def summary(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    hid = household.id
    today = date.today()
    month_start = today.replace(day=1)

    included_ids = select(Account.id).where(Account.household_id == hid, Account.include_in_totals == True)

    # יתרות חשבונות הנכללים בחישוב
    acc_result = await db.execute(
        select(Account).where(Account.household_id == hid, Account.is_active == True, Account.include_in_totals == True)
    )
    accounts = acc_result.scalars().all()

    tx_result = await db.execute(
        select(
            Transaction.account_id,
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        )
        .where(Transaction.household_id == hid, Transaction.account_id.in_(included_ids))
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
            Transaction.account_id.in_(included_ids),
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

    included_ids = select(Account.id).where(Account.household_id == household.id, Account.include_in_totals == True)

    result = await db.execute(
        select(
            extract("year", Transaction.transaction_date).label("yr"),
            extract("month", Transaction.transaction_date).label("mo"),
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("income"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("expense"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.account_id.in_(included_ids),
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


@router.get("/annual", response_model=AnnualReport)
async def annual_report(
    year: int = Query(None),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    if year is None:
        year = date.today().year
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)
    included_ids = select(Account.id).where(Account.household_id == household.id, Account.include_in_totals == True)

    # Monthly income/expense
    monthly = await db.execute(
        select(
            extract("month", Transaction.transaction_date).label("mo"),
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("income"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("expense"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.account_id.in_(included_ids),
            Transaction.transaction_date >= year_start,
            Transaction.transaction_date <= year_end,
        )
        .group_by("mo")
        .order_by("mo")
    )
    row_map = {int(r.mo): r for r in monthly.all()}
    months = []
    for m in range(1, 13):
        r = row_map.get(m)
        months.append(CashflowMonth(
            month=f"{year}-{m:02d}",
            income=float(r.income) if r else 0.0,
            expense=float(r.expense) if r else 0.0,
        ))

    total_income = sum(m.income for m in months)
    total_expense = sum(m.expense for m in months)
    net = total_income - total_expense
    savings_rate = round(net / total_income, 4) if total_income > 0 else 0.0

    # Top expense categories for the year
    cat_rows = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.account_id.in_(included_ids),
            Transaction.kind == "expense",
            Transaction.transaction_date >= year_start,
            Transaction.transaction_date <= year_end,
        )
        .group_by(Transaction.category_id)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(8)
    )
    cat_data = cat_rows.all()
    cat_ids = [r.category_id for r in cat_data if r.category_id]
    cats = {}
    if cat_ids:
        cat_result = await db.execute(select(Category).where(Category.id.in_(cat_ids)))
        cats = {c.id: c for c in cat_result.scalars().all()}

    top_expenses = [
        CategorySpend(
            category_id=r.category_id,
            category_name=cats[r.category_id].name if r.category_id in cats else "ללא קטגוריה",
            category_icon=cats[r.category_id].icon if r.category_id in cats else None,
            amount=round(float(r.total), 2),
            pct=round(float(r.total) / total_expense, 4) if total_expense else 0,
        )
        for r in cat_data
    ]

    return AnnualReport(
        year=year,
        months=months,
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        net=round(net, 2),
        savings_rate=savings_rate,
        top_expenses=top_expenses,
    )


@router.get("/networth-history", response_model=list[NetWorthPoint])
async def networth_history(
    months: int = Query(12, ge=3, le=36),
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    today = date.today()

    # Window: first day of (months) months ago
    window_start = today.replace(day=1)
    for _ in range(months - 1):
        window_start = (window_start - timedelta(days=1)).replace(day=1)

    included_ids = select(Account.id).where(Account.household_id == household.id, Account.include_in_totals == True)

    # Opening balances across included active accounts
    acc_result = await db.execute(
        select(Account).where(Account.household_id == household.id, Account.is_active == True, Account.include_in_totals == True)
    )
    accounts = acc_result.scalars().all()
    opening_total = sum(float(a.opening_balance) for a in accounts)

    # All transactions before window: gives us the base net worth at window_start
    pre = await db.execute(
        select(
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        ).where(
            Transaction.household_id == household.id,
            Transaction.account_id.in_(included_ids),
            Transaction.transaction_date < window_start,
        )
    )
    pre_row = pre.first()
    base = opening_total + float(pre_row.inc or 0) - float(pre_row.exp or 0)

    # Monthly income/expense within the window
    monthly = await db.execute(
        select(
            extract("year", Transaction.transaction_date).label("yr"),
            extract("month", Transaction.transaction_date).label("mo"),
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("income"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("expense"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.account_id.in_(included_ids),
            Transaction.transaction_date >= window_start,
            Transaction.transaction_date <= today,
        )
        .group_by("yr", "mo")
        .order_by("yr", "mo")
    )
    row_map = {(int(r.yr), int(r.mo)): r for r in monthly.all()}

    out = []
    running = base
    cur = window_start
    for _ in range(months):
        r = row_map.get((cur.year, cur.month))
        inc = float(r.income) if r else 0.0
        exp = float(r.expense) if r else 0.0
        running += inc - exp
        out.append(NetWorthPoint(
            month=cur.strftime("%Y-%m"),
            net_worth=round(running, 2),
            income=round(inc, 2),
            expense=round(exp, 2),
        ))
        cur = (cur.replace(day=28) + timedelta(days=4)).replace(day=1)
    return out


def _status(value, thresholds, labels=("excellent","good","fair","poor")):
    for t, lbl in zip(thresholds, labels):
        if value >= t:
            return lbl
    return labels[-1]


@router.get("/health", response_model=FinancialHealth)
async def financial_health(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    hid = household.id
    today = date.today()
    month_start = today.replace(day=1)

    included_ids = select(Account.id).where(Account.household_id == hid, Account.include_in_totals == True)

    # ── 1. Current month income / expense ──
    month_row = (await db.execute(
        select(
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        ).where(Transaction.household_id == hid,
                Transaction.account_id.in_(included_ids),
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= today)
    )).first()
    month_income = float(month_row.inc or 0)
    month_expense = float(month_row.exp or 0)

    # ── 2. 3-month avg expense (for runway) and avg income (for debt burden) ──
    three_ago = (month_start - timedelta(days=1)).replace(day=1)
    three_ago = (three_ago - timedelta(days=1)).replace(day=1)
    three_ago = (three_ago - timedelta(days=1)).replace(day=1)
    hist_row = (await db.execute(
        select(
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        ).where(Transaction.household_id == hid,
                Transaction.account_id.in_(included_ids),
                Transaction.transaction_date >= three_ago,
                Transaction.transaction_date < month_start)
    )).first()
    avg_income  = float(hist_row.inc or 0) / 3
    avg_expense = float(hist_row.exp or 0) / 3

    # ── 3. Net worth (opening balances + all transactions) ──
    accs = (await db.execute(
        select(Account).where(Account.household_id == hid, Account.is_active == True, Account.include_in_totals == True)
    )).scalars().all()
    opening = sum(float(a.opening_balance) for a in accs)
    tx_row = (await db.execute(
        select(
            func.sum(case((Transaction.kind == "income", Transaction.amount), else_=0)).label("inc"),
            func.sum(case((Transaction.kind == "expense", Transaction.amount), else_=0)).label("exp"),
        ).where(Transaction.household_id == hid, Transaction.account_id.in_(included_ids))
    )).first()
    net_worth = opening + float(tx_row.inc or 0) - float(tx_row.exp or 0)

    # ── 4. Budget adherence this month ──
    budgets = (await db.execute(
        select(Budget).where(Budget.household_id == hid, Budget.month == month_start)
    )).scalars().all()
    adherence_score = None
    if budgets:
        cat_actuals_rows = (await db.execute(
            select(Transaction.category_id,
                   func.sum(Transaction.amount).label("actual"))
            .where(Transaction.household_id == hid,
                   Transaction.kind == "expense",
                   Transaction.transaction_date >= month_start,
                   Transaction.transaction_date <= today,
                   Transaction.category_id.in_([b.category_id for b in budgets]))
            .group_by(Transaction.category_id)
        )).all()
        actuals = {r.category_id: float(r.actual) for r in cat_actuals_rows}
        within = sum(1 for b in budgets if actuals.get(b.category_id, 0) <= float(b.amount_planned))
        adherence_score = within / len(budgets)

    # ── 5. Monthly loan payments ──
    loans = (await db.execute(
        select(Loan).where(Loan.household_id == hid, Loan.is_active == True)
    )).scalars().all()
    total_loan_payment = 0.0
    for loan in loans:
        if loan.monthly_payment:
            total_loan_payment += float(loan.monthly_payment)
        else:
            r = float(loan.interest_rate) / 100 / 12
            n = int(loan.term_months)
            p = float(loan.principal)
            if r > 0:
                total_loan_payment += p * r * (1+r)**n / ((1+r)**n - 1)
            elif n > 0:
                total_loan_payment += p / n

    # ── Build metrics ──
    # Savings rate
    sr = (month_income - month_expense) / month_income if month_income > 0 else 0
    sr_status = _status(sr, [0.20, 0.10, 0.01], ["excellent","good","fair"]) if month_income > 0 else "n/a"

    # Budget adherence
    ba = adherence_score if adherence_score is not None else -1
    ba_status = _status(ba, [1.0, 0.75, 0.50], ["excellent","good","fair"]) if ba >= 0 else "n/a"

    # Runway months
    ref_expense = avg_expense if avg_expense > 0 else month_expense
    runway = (net_worth / ref_expense) if ref_expense > 0 else 0
    runway_status = _status(runway, [6, 3, 1], ["excellent","good","fair"]) if ref_expense > 0 else "n/a"

    # Debt burden
    ref_income = avg_income if avg_income > 0 else month_income
    debt_ratio = total_loan_payment / ref_income if ref_income > 0 and total_loan_payment > 0 else 0
    debt_status = _status(1 - debt_ratio, [0.80, 0.65, 0.50], ["excellent","good","fair"]) if ref_income > 0 else "n/a"

    # Weighted score (only include metrics with data)
    pts, weight = 0.0, 0.0
    grade = {"excellent":100,"good":70,"fair":40,"poor":10}
    for val, w in [(sr_status,35),(ba_status,25),(runway_status,25),(debt_status,15)]:
        if val != "n/a":
            pts += grade.get(val, 10) * w
            weight += w
    score = round(pts / weight) if weight > 0 else 0

    return FinancialHealth(
        score=score,
        savings_rate=HealthMetric(value=round(sr*100,1), status=sr_status, label="שיעור חיסכון חודשי"),
        budget_adherence=HealthMetric(value=round((ba if ba>=0 else 0)*100,1), status=ba_status, label="עמידה בתקציב"),
        runway_months=HealthMetric(value=round(runway,1), status=runway_status, label="חודשי מזומן"),
        debt_burden=HealthMetric(value=round(debt_ratio*100,1), status=debt_status, label="יחס חוב להכנסה"),
    )


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

    included_ids = select(Account.id).where(Account.household_id == household.id, Account.include_in_totals == True)

    result = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total"),
        )
        .where(
            Transaction.household_id == household.id,
            Transaction.account_id.in_(included_ids),
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
