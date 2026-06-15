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


def _monthly_payment(principal: float, annual_rate: float, term_months: int) -> float:
    if annual_rate == 0:
        return principal / term_months
    r = annual_rate / 100 / 12
    return principal * r * (1 + r) ** term_months / ((1 + r) ** term_months - 1)


def _amortize(loan: Loan) -> list[AmortizationRow]:
    payment = float(loan.monthly_payment) if loan.monthly_payment else _monthly_payment(
        float(loan.principal), float(loan.interest_rate), loan.term_months
    )
    r = float(loan.interest_rate) / 100 / 12
    balance = float(loan.principal)
    rows = []
    for i in range(1, loan.term_months + 1):
        interest_part = balance * r
        principal_part = payment - interest_part
        balance = max(balance - principal_part, 0)
        payment_date = loan.start_date + relativedelta(months=i)
        rows.append(AmortizationRow(
            month_num=i,
            payment_date=payment_date,
            payment=round(payment, 2),
            principal_part=round(principal_part, 2),
            interest_part=round(interest_part, 2),
            balance=round(balance, 2),
        ))
    return rows


def _to_out(loan: Loan) -> LoanOut:
    today = date.today()
    payment = float(loan.monthly_payment) if loan.monthly_payment else _monthly_payment(
        float(loan.principal), float(loan.interest_rate), loan.term_months
    )
    r = float(loan.interest_rate) / 100 / 12
    balance = float(loan.principal)
    months_elapsed = 0
    cur = loan.start_date + relativedelta(months=1)
    while cur <= today and months_elapsed < loan.term_months:
        interest_part = balance * r
        balance = max(balance - (payment - interest_part), 0)
        months_elapsed += 1
        cur += relativedelta(months=1)

    months_remaining = max(loan.term_months - months_elapsed, 0)
    total_interest = round(payment * loan.term_months - float(loan.principal), 2)

    return LoanOut(
        id=loan.id,
        name=loan.name,
        loan_type=loan.loan_type,
        principal=float(loan.principal),
        interest_rate=float(loan.interest_rate),
        term_months=loan.term_months,
        start_date=loan.start_date,
        monthly_payment=round(payment, 2),
        notes=loan.notes,
        is_active=loan.is_active,
        months_elapsed=months_elapsed,
        balance_remaining=round(balance, 2),
        months_remaining=months_remaining,
        total_interest=total_interest,
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
