from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import Account, Transaction
from app.schemas.finance import AccountCreate, AccountOut, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["accounts"])


async def _account_balance(db: AsyncSession, account: Account) -> float:
    result = await db.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.kind == "income", Transaction.amount),
                        else_=-Transaction.amount,
                    )
                ),
                0,
            )
        ).where(Transaction.account_id == account.id)
    )
    delta = result.scalar() or 0
    return float(account.opening_balance) + float(delta)


@router.get("", response_model=list[AccountOut])
async def list_accounts(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(
        select(Account).where(Account.household_id == household.id, Account.is_active == True)
    )
    accounts = result.scalars().all()
    out = []
    for acc in accounts:
        bal = await _account_balance(db, acc)
        out.append(AccountOut(
            id=acc.id, name=acc.name, type=acc.type, institution=acc.institution,
            currency=acc.currency, opening_balance=float(acc.opening_balance),
            is_active=acc.is_active, balance=bal,
        ))
    return out


@router.post("", response_model=AccountOut, status_code=201, dependencies=[Depends(verify_csrf)])
async def create_account(body: AccountCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    acc = Account(household_id=household.id, **body.model_dump())
    db.add(acc)
    await db.commit()
    await db.refresh(acc)
    return AccountOut(**acc.__dict__, balance=float(acc.opening_balance))


@router.patch("/{account_id}", response_model=AccountOut, dependencies=[Depends(verify_csrf)])
async def update_account(account_id: int, body: AccountUpdate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Account).where(Account.id == account_id, Account.household_id == household.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(404, "חשבון לא נמצא")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(acc, k, v)
    await db.commit()
    await db.refresh(acc)
    bal = await _account_balance(db, acc)
    return AccountOut(**acc.__dict__, balance=bal)


@router.delete("/{account_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def delete_account(account_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Account).where(Account.id == account_id, Account.household_id == household.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(404, "חשבון לא נמצא")
    acc.is_active = False
    await db.commit()
