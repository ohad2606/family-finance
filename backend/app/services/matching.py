from datetime import datetime, timedelta, timezone
import logging

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.finance import ExpectedOccurrence, RecurringRule, Transaction
from app.scheduler import _advance, generate_occurrences

logger = logging.getLogger(__name__)


async def run_matching(db: AsyncSession, household_id: int) -> int:
    """
    Match pending/overdue occurrences against unmatched bank transactions.
    Idempotent: safe to run multiple times.
    Returns the number of new matches made.
    """
    # Load all open occurrences for this household with their rules
    occ_result = await db.execute(
        select(ExpectedOccurrence)
        .options(selectinload(ExpectedOccurrence.rule))
        .where(
            ExpectedOccurrence.household_id == household_id,
            ExpectedOccurrence.status.in_(["pending", "overdue"]),
        )
    )
    occurrences = occ_result.scalars().all()
    if not occurrences:
        return 0

    # Load all unmatched transactions for this household (not planned, not yet linked)
    # We use a subquery to exclude already-matched transaction IDs
    matched_ids_result = await db.execute(
        select(ExpectedOccurrence.matched_transaction_id).where(
            ExpectedOccurrence.household_id == household_id,
            ExpectedOccurrence.matched_transaction_id.isnot(None),
        )
    )
    already_matched = {row[0] for row in matched_ids_result.all()}

    matched_count = 0

    for occ in occurrences:
        rule = occ.rule
        if not rule.match_pattern:
            continue

        pattern = rule.match_pattern.strip()
        window_start = occ.due_date - timedelta(days=rule.match_window_days)
        window_end = occ.due_date + timedelta(days=rule.grace_days)
        tol = float(rule.amount_tolerance_pct) / 100
        min_amount = float(occ.expected_amount) * (1 - tol)
        max_amount = float(occ.expected_amount) * (1 + tol)

        # Fetch candidate transactions
        txn_result = await db.execute(
            select(Transaction).where(
                and_(
                    Transaction.household_id == household_id,
                    Transaction.account_id == rule.account_id,
                    Transaction.is_planned == False,
                    Transaction.kind == rule.kind,
                    Transaction.description.ilike(f"%{pattern}%"),
                    Transaction.transaction_date >= window_start,
                    Transaction.transaction_date <= window_end,
                    Transaction.amount >= min_amount,
                    Transaction.amount <= max_amount,
                )
            )
        )
        candidates = [t for t in txn_result.scalars().all() if t.id not in already_matched]

        if not candidates:
            continue

        # Pick best: closest date to due_date, tie-break by closest amount
        best = min(
            candidates,
            key=lambda t: (
                abs((t.transaction_date - occ.due_date).days),
                abs(float(t.amount) - float(occ.expected_amount)),
            ),
        )

        occ.status = "matched"
        occ.matched_transaction_id = best.id
        occ.matched_at = datetime.now(timezone.utc)
        already_matched.add(best.id)

        # Advance rule.next_date and generate the next occurrence
        if rule.next_date == occ.due_date:
            rule.next_date = _advance(rule)

        matched_count += 1
        logger.info(
            f"Matched occurrence {occ.id} (rule={rule.id}, due={occ.due_date}) "
            f"-> txn {best.id} (date={best.transaction_date}, amount={best.amount})"
        )

    if matched_count:
        await db.commit()
        # Generate the next occurrence for newly-advanced rules
        await generate_occurrences()

    return matched_count
