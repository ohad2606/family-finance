from datetime import date, datetime, timedelta, timezone
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal as async_session
from app.models.finance import ExpectedOccurrence, RecurringRule, Transaction
from app.models.household import Household

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone="Asia/Jerusalem")


def _advance(rule: RecurringRule) -> date:
    d = rule.next_date
    if rule.frequency == "weekly":
        return d + timedelta(weeks=1)
    elif rule.frequency == "monthly":
        month = d.month + 1 if d.month < 12 else 1
        year = d.year if d.month < 12 else d.year + 1
        last_day = (date(year, month % 12 + 1, 1) - timedelta(days=1)).day if month < 12 else 31
        return date(year, month, min(d.day, last_day))
    else:  # yearly
        try:
            return d.replace(year=d.year + 1)
        except ValueError:
            return d.replace(year=d.year + 1, day=28)


async def generate_occurrences():
    """Ensure the next 2 occurrences exist for every active rule with a match_pattern."""
    async with async_session() as db:
        result = await db.execute(
            select(RecurringRule).where(
                RecurringRule.is_active == True,
                RecurringRule.match_pattern.isnot(None),
                RecurringRule.match_pattern != "",
            )
        )
        rules = result.scalars().all()
        created = 0
        for rule in rules:
            # Generate next_date and the one after (lookahead = 2 occurrences)
            dates_to_ensure = [rule.next_date, _advance(rule)]
            for due in dates_to_ensure:
                existing = await db.execute(
                    select(ExpectedOccurrence.id).where(
                        ExpectedOccurrence.rule_id == rule.id,
                        ExpectedOccurrence.due_date == due,
                    )
                )
                if existing.scalar_one_or_none() is not None:
                    continue
                occ = ExpectedOccurrence(
                    household_id=rule.household_id,
                    rule_id=rule.id,
                    due_date=due,
                    expected_amount=rule.amount,
                    kind=rule.kind,
                    status="pending",
                )
                db.add(occ)
                created += 1
        await db.commit()
        if created:
            logger.info(f"generate_occurrences: created {created} new occurrences")


async def fire_recurring():
    today = date.today()
    async with async_session() as db:
        result = await db.execute(
            select(RecurringRule)
            .where(RecurringRule.is_active == True, RecurringRule.next_date <= today)
            .options(selectinload(RecurringRule.account))
        )
        rules = result.scalars().all()
        fired = 0
        for rule in rules:
            if rule.end_date and today > rule.end_date:
                rule.is_active = False
                continue

            if rule.match_pattern:
                # Smart rules: don't auto-create transactions.
                # next_date advances only after the occurrence is matched/overdue (handled in matching).
                # But if the occurrence is already closed, advance here too.
                occ_result = await db.execute(
                    select(ExpectedOccurrence).where(
                        ExpectedOccurrence.rule_id == rule.id,
                        ExpectedOccurrence.due_date == rule.next_date,
                    )
                )
                occ = occ_result.scalar_one_or_none()
                if occ and occ.status in ("matched", "overdue", "skipped"):
                    rule.next_date = _advance(rule)
                # If no occurrence yet, generate_occurrences will create it
                continue

            tx = Transaction(
                household_id=rule.household_id,
                account_id=rule.account_id,
                category_id=rule.category_id,
                amount=rule.amount,
                kind=rule.kind,
                description=rule.description,
                transaction_date=rule.next_date,
                source="recurring",
                created_by=rule.created_by,
            )
            db.add(tx)
            rule.next_date = _advance(rule)
            fired += 1
        await db.commit()
        if fired:
            logger.info(f"Recurring: fired {fired} transactions")


async def mark_overdue():
    """Mark pending occurrences whose due_date + grace_days has passed."""
    today = date.today()
    async with async_session() as db:
        result = await db.execute(
            select(ExpectedOccurrence)
            .options(selectinload(ExpectedOccurrence.rule))
            .where(ExpectedOccurrence.status == "pending")
        )
        occs = result.scalars().all()
        marked = 0
        for occ in occs:
            deadline = occ.due_date + timedelta(days=occ.rule.grace_days)
            if today > deadline:
                occ.status = "overdue"
                # Advance rule.next_date so it doesn't get stuck
                if occ.rule.next_date == occ.due_date:
                    occ.rule.next_date = _advance(occ.rule)
                marked += 1
        await db.commit()
        if marked:
            logger.info(f"mark_overdue: marked {marked} occurrences as overdue")


async def run_matching_all_households():
    """Daily safety net: run matching for all households."""
    from app.services.matching import run_matching
    async with async_session() as db:
        result = await db.execute(select(Household.id))
        household_ids = [row[0] for row in result.all()]
    for hid in household_ids:
        async with async_session() as db:
            count = await run_matching(db, hid)
            if count:
                logger.info(f"Daily matching: household {hid} -> {count} matches")


def start_scheduler():
    scheduler.add_job(fire_recurring, "cron", hour=6, minute=0, id="recurring_daily", replace_existing=True)
    scheduler.add_job(generate_occurrences, "cron", hour=6, minute=5, id="generate_occurrences", replace_existing=True)
    scheduler.add_job(mark_overdue, "cron", hour=6, minute=10, id="mark_overdue", replace_existing=True)
    scheduler.add_job(run_matching_all_households, "cron", hour=6, minute=15, id="daily_matching", replace_existing=True)
    scheduler.start()
    logger.info("Scheduler started")
