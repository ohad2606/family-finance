from datetime import date, timedelta
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import async_session
from app.models.finance import RecurringRule, Transaction

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


def start_scheduler():
    scheduler.add_job(fire_recurring, "cron", hour=6, minute=0, id="recurring_daily", replace_existing=True)
    scheduler.start()
    logger.info("Scheduler started")
