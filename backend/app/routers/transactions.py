from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import Account, Category, Transaction
from app.models.audit import AuditLog
from app.schemas.finance import TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _to_out(t: Transaction) -> TransactionOut:
    return TransactionOut(
        id=t.id,
        account_id=t.account_id,
        account_name=t.account.name if t.account else "",
        category_id=t.category_id,
        category_name=t.category.name if t.category else None,
        category_icon=t.category.icon if t.category else None,
        amount=float(t.amount),
        kind=t.kind,
        description=t.description,
        transaction_date=t.transaction_date,
        source=t.source,
        created_at=t.created_at,
    )


@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    account_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    kind: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    _, household = ctx
    filters = [Transaction.household_id == household.id]
    if from_date:
        filters.append(Transaction.transaction_date >= from_date)
    if to_date:
        filters.append(Transaction.transaction_date <= to_date)
    if account_id:
        filters.append(Transaction.account_id == account_id)
    if category_id:
        filters.append(Transaction.category_id == category_id)
    if kind:
        filters.append(Transaction.kind == kind)

    result = await db.execute(
        select(Transaction)
        .where(and_(*filters))
        .order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .limit(limit).offset(offset)
        .options(__import__("sqlalchemy.orm", fromlist=["selectinload"]).selectinload(Transaction.account),
                 __import__("sqlalchemy.orm", fromlist=["selectinload"]).selectinload(Transaction.category))
    )
    return [_to_out(t) for t in result.scalars().all()]


@router.post("", response_model=TransactionOut, status_code=201, dependencies=[Depends(verify_csrf)])
async def create_transaction(body: TransactionCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx

    acc_result = await db.execute(select(Account).where(Account.id == body.account_id, Account.household_id == household.id))
    if not acc_result.scalar_one_or_none():
        raise HTTPException(404, "חשבון לא נמצא")

    t = Transaction(household_id=household.id, created_by=user.id, **body.model_dump())
    db.add(t)
    db.add(AuditLog(household_id=household.id, user_id=user.id, action="create", entity_type="transaction", detail=str(body.amount)))
    await db.commit()

    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == t.id)
        .options(__import__("sqlalchemy.orm", fromlist=["selectinload"]).selectinload(Transaction.account),
                 __import__("sqlalchemy.orm", fromlist=["selectinload"]).selectinload(Transaction.category))
    )
    return _to_out(result.scalar_one())


@router.patch("/{tx_id}", response_model=TransactionOut, dependencies=[Depends(verify_csrf)])
async def update_transaction(tx_id: int, body: TransactionUpdate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == tx_id, Transaction.household_id == household.id)
        .options(__import__("sqlalchemy.orm", fromlist=["selectinload"]).selectinload(Transaction.account),
                 __import__("sqlalchemy.orm", fromlist=["selectinload"]).selectinload(Transaction.category))
    )
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "תנועה לא נמצאה")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(t, k, v)
    db.add(AuditLog(household_id=household.id, user_id=user.id, action="update", entity_type="transaction", entity_id=tx_id))
    await db.commit()
    await db.refresh(t)
    return _to_out(t)


@router.delete("/{tx_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def delete_transaction(tx_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    user, household = ctx
    result = await db.execute(select(Transaction).where(Transaction.id == tx_id, Transaction.household_id == household.id))
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "תנועה לא נמצאה")
    db.add(AuditLog(household_id=household.id, user_id=user.id, action="delete", entity_type="transaction", entity_id=tx_id))
    await db.delete(t)
    await db.commit()


class BulkImportRow(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    amount: float
    kind: str
    description: Optional[str] = None
    transaction_date: date


class BulkImportBody(BaseModel):
    rows: list[BulkImportRow]


@router.post("/bulk", dependencies=[Depends(verify_csrf)])
async def bulk_import_transactions(
    body: BulkImportBody,
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    user, household = ctx

    if not body.rows:
        return {"imported": 0}
    if len(body.rows) > 2000:
        raise HTTPException(400, "מקסימום 2000 שורות ביבוא אחד")

    account_ids = {r.account_id for r in body.rows}
    acc_result = await db.execute(
        select(Account.id).where(Account.id.in_(account_ids), Account.household_id == household.id)
    )
    valid_accounts = {row[0] for row in acc_result.all()}
    invalid = account_ids - valid_accounts
    if invalid:
        raise HTTPException(400, f"חשבון לא נמצא: {invalid}")

    for row in body.rows:
        db.add(Transaction(
            household_id=household.id,
            created_by=user.id,
            source="import",
            **row.model_dump(),
        ))

    db.add(AuditLog(
        household_id=household.id,
        user_id=user.id,
        action="bulk_import",
        entity_type="transaction",
        detail=str(len(body.rows)),
    ))
    await db.commit()
    return {"imported": len(body.rows)}
