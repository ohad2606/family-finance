import hashlib
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database import get_db
from app.deps import get_current_household
from app.models.finance import Account, BankSyncCommand, BankSyncLog, Transaction

router = APIRouter(prefix="/bank-sync", tags=["bank-sync"])

SUPPORTED_SOURCES = {"discount", "isracard", "max"}


def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    if not settings.BANK_SYNC_API_KEY or x_api_key != settings.BANK_SYNC_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


# ── Pydantic models ────────────────────────────────────────────────────────────

class TxnIn(BaseModel):
    date: str
    description: str | None = None
    charged_amount: float
    current_balance: float | None = None
    status: str | None = None
    identifier: str | None = None


class AccountIn(BaseModel):
    account_number: str
    type: str | None = None
    balance: float | None = None
    txns: list[TxnIn] = []


class BankSyncPayload(BaseModel):
    household_id: int
    source: str
    accounts: list[AccountIn]
    scraped_at: str | None = None


class CommandUpdate(BaseModel):
    status: str  # "done" | "error"
    result: str | None = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _external_ref(source: str, account_number: str, txn: TxnIn) -> str:
    if txn.identifier:
        return f"{source}:{account_number}:{txn.identifier}"
    fingerprint = f"{source}:{account_number}:{txn.date}:{txn.charged_amount}:{(txn.description or '')[:50]}"
    return hashlib.sha256(fingerprint.encode()).hexdigest()[:32]


def _parse_date(raw: str) -> date:
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(raw[:len(fmt)], fmt).date()
        except ValueError:
            continue
    return datetime.fromisoformat(raw[:19]).date()


def _parse_scraped_at(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except Exception:
        return None


# ── Push endpoint (called by home server) ─────────────────────────────────────

@router.post("")
async def bank_sync(
    payload: BankSyncPayload,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(verify_api_key),
):
    if payload.source not in SUPPORTED_SOURCES:
        raise HTTPException(status_code=400, detail=f"Unknown source: {payload.source}")

    stats = {"accounts_found": 0, "txns_created": 0, "txns_skipped": 0}

    for acc_in in payload.accounts:
        result = await db.execute(
            select(Account).where(
                Account.household_id == payload.household_id,
                Account.institution == payload.source,
                Account.name.contains(acc_in.account_number[-4:]),
            )
        )
        account = result.scalar_one_or_none()

        if account is None:
            acc_type = "credit" if payload.source in ("isracard", "max") else "checking"
            account = Account(
                household_id=payload.household_id,
                name=f"{payload.source.title()} {acc_in.account_number[-4:]}",
                type=acc_type,
                institution=payload.source,
                currency="ILS",
                opening_balance=0,
            )
            db.add(account)
            await db.flush()

        stats["accounts_found"] += 1

        for txn_in in acc_in.txns:
            ext_ref = _external_ref(payload.source, acc_in.account_number, txn_in)
            exists = await db.execute(
                select(Transaction.id).where(Transaction.external_ref == ext_ref)
            )
            if exists.scalar_one_or_none() is not None:
                stats["txns_skipped"] += 1
                continue

            txn = Transaction(
                household_id=payload.household_id,
                account_id=account.id,
                amount=abs(txn_in.charged_amount),
                kind="expense" if txn_in.charged_amount < 0 else "income",
                description=txn_in.description or "",
                transaction_date=_parse_date(txn_in.date),
                source="bank_sync",
                external_ref=ext_ref,
            )
            db.add(txn)
            stats["txns_created"] += 1

    db.add(BankSyncLog(
        household_id=payload.household_id,
        source=payload.source,
        status="ok",
        accounts_found=stats["accounts_found"],
        txns_created=stats["txns_created"],
        txns_skipped=stats["txns_skipped"],
        scraped_at=_parse_scraped_at(payload.scraped_at),
    ))

    await db.commit()
    return {"ok": True, "source": payload.source, **stats}


# ── Command queue endpoints ────────────────────────────────────────────────────

@router.post("/trigger", status_code=201)
async def trigger_sync(
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    """App user requests an on-demand sync."""
    user, household = ctx
    cmd = BankSyncCommand(
        household_id=household.id,
        created_by=user.id,
        status="pending",
    )
    db.add(cmd)
    await db.commit()
    await db.refresh(cmd)
    return {"id": cmd.id, "status": cmd.status, "created_at": cmd.created_at.isoformat()}


@router.get("/commands/pending")
async def poll_commands(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(verify_api_key),
):
    """Home server polls this endpoint to claim pending commands."""
    result = await db.execute(
        select(BankSyncCommand)
        .where(BankSyncCommand.status == "pending")
        .with_for_update(skip_locked=True)
        .limit(5)
    )
    commands = result.scalars().all()

    now = datetime.now(timezone.utc)
    for cmd in commands:
        cmd.status = "running"
        cmd.started_at = now

    await db.commit()

    return [
        {"id": cmd.id, "household_id": cmd.household_id, "source": cmd.source}
        for cmd in commands
    ]


@router.patch("/commands/{command_id}")
async def update_command(
    command_id: int,
    body: CommandUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(verify_api_key),
):
    """Home server marks a command done or errored."""
    result = await db.execute(
        select(BankSyncCommand).where(BankSyncCommand.id == command_id)
    )
    cmd = result.scalar_one_or_none()
    if cmd is None:
        raise HTTPException(status_code=404, detail="Command not found")

    cmd.status = body.status
    cmd.result = body.result
    cmd.completed_at = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}


# ── Status endpoint (shown in dashboard) ──────────────────────────────────────

@router.get("/status")
async def bank_sync_status(
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    hid = household.id

    rows = await db.execute(
        select(BankSyncLog)
        .where(BankSyncLog.household_id == hid)
        .order_by(desc(BankSyncLog.created_at))
        .limit(20)
    )
    logs = rows.scalars().all()

    seen: set[str] = set()
    result = []
    for log in logs:
        if log.source not in seen:
            seen.add(log.source)
            result.append({
                "source": log.source,
                "status": log.status,
                "accounts_found": log.accounts_found,
                "txns_created": log.txns_created,
                "txns_skipped": log.txns_skipped,
                "error_message": log.error_message,
                "scraped_at": log.scraped_at.isoformat() if log.scraped_at else None,
                "synced_at": log.created_at.isoformat() if log.created_at else None,
            })

    pending = await db.execute(
        select(BankSyncCommand.id)
        .where(
            BankSyncCommand.household_id == hid,
            BankSyncCommand.status.in_(["pending", "running"]),
        )
        .limit(1)
    )
    has_pending = pending.scalar_one_or_none() is not None

    for item in result:
        item["has_pending"] = has_pending

    return {"syncs": result, "has_pending": has_pending}
