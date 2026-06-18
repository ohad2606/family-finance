from datetime import date
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import Loan
from app.schemas.finance import LoanCreate, LoanUpdate, LoanOut, AmortizationRow

router = APIRouter(prefix="/loans", tags=["loans"])


def _monthly_payment(principal: float, annual_rate: float, term_months: int, annual_cpi: float = 0.0) -> float:
    r = annual_rate / 100 / 12
    if annual_cpi > 0:
        # real rate for CPI-linked: (1+r_nominal)/(1+cpi_monthly) - 1
        cpi_m = (1 + annual_cpi / 100) ** (1 / 12) - 1
        r = (1 + r) / (1 + cpi_m) - 1
    if r == 0:
        return principal / term_months
    return principal * r * (1 + r) ** term_months / ((1 + r) ** term_months - 1)


def _amortize(loan: Loan) -> list[AmortizationRow]:
    cpi_m = (1 + float(loan.cpi_rate) / 100) ** (1 / 12) - 1 if (loan.interest_type == 'cpi_linked' and loan.cpi_rate) else 0.0
    annual_cpi = float(loan.cpi_rate) if (loan.interest_type == 'cpi_linked' and loan.cpi_rate) else 0.0
    payment = float(loan.monthly_payment) if loan.monthly_payment else _monthly_payment(
        float(loan.principal), float(loan.interest_rate), loan.term_months, annual_cpi
    )
    first_payment = float(loan.first_payment) if loan.first_payment else None
    r = float(loan.interest_rate) / 100 / 12
    balance = float(loan.principal)
    rows = []
    for i in range(1, loan.term_months + 1):
        if cpi_m > 0:
            balance = balance * (1 + cpi_m)  # CPI-adjust balance
        interest_part = balance * r
        if i == loan.term_months:
            actual_payment = balance + interest_part  # close balance exactly
        elif i == 1 and first_payment is not None:
            actual_payment = first_payment
        else:
            base = payment * (1 + cpi_m) ** (i - 1) if cpi_m > 0 else payment
            actual_payment = base
        principal_part = actual_payment - interest_part
        balance = max(balance - principal_part, 0)
        payment_date = loan.start_date + relativedelta(months=i)
        rows.append(AmortizationRow(
            month_num=i,
            payment_date=payment_date,
            payment=round(actual_payment, 2),
            principal_part=round(principal_part, 2),
            interest_part=round(interest_part, 2),
            balance=round(balance, 2),
        ))
    return rows


def _to_out(loan: Loan) -> LoanOut:
    today = date.today()
    cpi_m = (1 + float(loan.cpi_rate) / 100) ** (1 / 12) - 1 if (loan.interest_type == 'cpi_linked' and loan.cpi_rate) else 0.0
    annual_cpi = float(loan.cpi_rate) if (loan.interest_type == 'cpi_linked' and loan.cpi_rate) else 0.0
    payment = float(loan.monthly_payment) if loan.monthly_payment else _monthly_payment(
        float(loan.principal), float(loan.interest_rate), loan.term_months, annual_cpi
    )
    first_payment = float(loan.first_payment) if loan.first_payment else None
    r = float(loan.interest_rate) / 100 / 12
    balance = float(loan.principal)
    months_elapsed = 0
    balance_remaining = float(loan.principal)
    total_interest = 0.0

    for i in range(1, loan.term_months + 1):
        payment_date = loan.start_date + relativedelta(months=i)
        if cpi_m > 0:
            balance = balance * (1 + cpi_m)  # CPI-adjust balance
        interest_part = balance * r
        if i == loan.term_months:
            actual_payment = balance + interest_part
        elif i == 1 and first_payment is not None:
            actual_payment = first_payment
        else:
            base = payment * (1 + cpi_m) ** (i - 1) if cpi_m > 0 else payment
            actual_payment = base
        principal_part = actual_payment - interest_part
        total_interest += interest_part
        balance = max(balance - principal_part, 0)
        if payment_date <= today:
            months_elapsed += 1
            balance_remaining = balance

    months_remaining = max(loan.term_months - months_elapsed, 0)

    return LoanOut(
        id=loan.id,
        name=loan.name,
        loan_type=loan.loan_type,
        principal=float(loan.principal),
        interest_rate=float(loan.interest_rate),
        term_months=loan.term_months,
        start_date=loan.start_date,
        monthly_payment=round(payment, 2),
        first_payment=round(first_payment, 2) if first_payment else None,
        payment_day=loan.payment_day or loan.start_date.day,
        interest_type=loan.interest_type,
        cpi_rate=float(loan.cpi_rate) if loan.cpi_rate is not None else None,
        notes=loan.notes,
        is_active=loan.is_active,
        months_elapsed=months_elapsed,
        balance_remaining=round(balance_remaining, 2),
        months_remaining=months_remaining,
        total_interest=round(total_interest, 2),
    )


@router.get("", response_model=list[LoanOut])
async def list_loans(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(Loan).where(Loan.household_id == household.id).order_by(Loan.start_date.desc())
    )
    return [_to_out(l) for l in result.scalars().all()]


@router.post("", response_model=LoanOut, status_code=201, dependencies=[Depends(verify_csrf)])
async def create_loan(body: LoanCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    loan = Loan(household_id=household.id, **body.model_dump())
    db.add(loan)
    await db.commit()
    await db.refresh(loan)
    return _to_out(loan)


@router.patch("/{loan_id}", response_model=LoanOut, dependencies=[Depends(verify_csrf)])
async def update_loan(loan_id: int, body: LoanUpdate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Loan).where(Loan.id == loan_id, Loan.household_id == household.id))
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(404, "הלוואה לא נמצאה")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(loan, k, v)
    await db.commit()
    await db.refresh(loan)
    return _to_out(loan)


@router.delete("/{loan_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def delete_loan(loan_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Loan).where(Loan.id == loan_id, Loan.household_id == household.id))
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(404, "הלוואה לא נמצאה")
    await db.delete(loan)
    await db.commit()


@router.get("/{loan_id}/schedule", response_model=list[AmortizationRow])
async def get_schedule(loan_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Loan).where(Loan.id == loan_id, Loan.household_id == household.id))
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(404, "הלוואה לא נמצאה")
    return _amortize(loan)
