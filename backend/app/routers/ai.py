"""
Financial insights — all computation runs locally on this server.
No data is sent to any external service.
"""
import logging
import re
from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household
from app.models.finance import Category, Transaction

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

_STRIP_RE = re.compile(r'\s+')


def _normalize(desc: str) -> str:
    return _STRIP_RE.sub(' ', (desc or '').strip().lower())[:60]


def _format_month(ym: str) -> str:
    months_he = {
        '01': 'ינואר', '02': 'פברואר', '03': 'מרץ', '04': 'אפריל',
        '05': 'מאי', '06': 'יוני', '07': 'יולי', '08': 'אוגוסט',
        '09': 'ספטמבר', '10': 'אוקטובר', '11': 'נובמבר', '12': 'דצמבר',
    }
    year, month = ym.split('-')
    return f"{months_he.get(month, month)} {year}"


async def _collect(household_id: int, db: AsyncSession):
    since = date.today() - timedelta(days=92)
    rows = await db.execute(
        select(Transaction, Category.name.label("cat_name"))
        .outerjoin(Category, Category.id == Transaction.category_id)
        .where(
            Transaction.household_id == household_id,
            Transaction.transaction_date >= since,
        )
    )
    return rows.all()


def _analyze(rows) -> dict:
    monthly_expenses: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    monthly_income: dict[str, float] = defaultdict(float)
    desc_by_month: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))

    for txn, cat_name in rows:
        month = txn.transaction_date.strftime("%Y-%m")
        cat = cat_name or "ללא קטגוריה"
        amount = float(txn.amount)
        if txn.kind == "expense":
            monthly_expenses[month][cat] += amount
            key = _normalize(txn.description or "")
            if key and len(key) > 3:
                desc_by_month[key][month].append(amount)
        else:
            monthly_income[month] += amount

    months = sorted(monthly_expenses.keys())

    # ── Recurring payments ─────────────────────────────────────────────────────
    recurring = []
    for desc, month_map in desc_by_month.items():
        if len(month_map) < 2:
            continue
        all_amounts = [a for amts in month_map.values() for a in amts]
        avg = sum(all_amounts) / len(all_amounts)
        if avg < 5:
            continue
        variance = max(all_amounts) / min(all_amounts) if min(all_amounts) > 0 else 999
        if variance > 3:
            continue
        frequency = "חודשי" if len(month_map) >= 2 else "תקופתי"
        recurring.append({
            "name": desc.title(),
            "amount": round(avg, 2),
            "frequency": frequency,
        })
    recurring.sort(key=lambda x: -x["amount"])
    recurring = recurring[:10]

    # ── Anomalies: category spending spiked ────────────────────────────────────
    anomalies = []
    if len(months) >= 2:
        latest = months[-1]
        prev_months = months[:-1]
        all_cats = set()
        for m in months:
            all_cats |= set(monthly_expenses[m].keys())

        for cat in all_cats:
            latest_val = monthly_expenses[latest].get(cat, 0)
            prev_vals = [monthly_expenses[m].get(cat, 0) for m in prev_months]
            prev_avg = sum(prev_vals) / len(prev_vals) if prev_vals else 0
            if prev_avg > 50 and latest_val > prev_avg * 1.5:
                pct = round((latest_val - prev_avg) / prev_avg * 100)
                anomalies.append({
                    "description": f"הוצאות ב{cat} עלו ב-{pct}% לעומת הממוצע ({_format_month(latest)}): ₪{latest_val:,.0f} לעומת ממוצע של ₪{prev_avg:,.0f}"
                })
            elif prev_avg > 50 and latest_val < prev_avg * 0.4:
                pct = round((prev_avg - latest_val) / prev_avg * 100)
                anomalies.append({
                    "description": f"הוצאות ב{cat} ירדו ב-{pct}% לעומת הממוצע ({_format_month(latest)})"
                })

    anomalies = anomalies[:4]

    # ── Advice (rule-based) ────────────────────────────────────────────────────
    advice = []
    if months:
        latest = months[-1]
        total_exp = sum(monthly_expenses[latest].values())
        total_inc = monthly_income.get(latest, 0)

        if total_exp > 0:
            top_cat = max(monthly_expenses[latest], key=lambda c: monthly_expenses[latest][c])
            top_pct = monthly_expenses[latest][top_cat] / total_exp * 100
            if top_pct > 35:
                advice.append(f'הקטגוריה "{top_cat}" מהווה {top_pct:.0f}% מסך ההוצאות החודש — שווה לבדוק אם יש מקום לצמצום.')

        if total_inc > 0 and total_exp > total_inc:
            deficit = total_exp - total_inc
            advice.append(f"ההוצאות עלו על ההכנסות החודש ב-₪{deficit:,.0f} — מומלץ לבדוק אילו הוצאות ניתן לדחות.")
        elif total_inc > 0 and total_exp < total_inc * 0.8:
            surplus = total_inc - total_exp
            advice.append(f"יש לך עודף של ₪{surplus:,.0f} החודש — שקול להעביר חלק לחיסכון.")

        if len(recurring) >= 5:
            recurring_total = sum(r["amount"] for r in recurring)
            advice.append(f"זוהו {len(recurring)} תשלומים חוזרים בסכום כולל של ₪{recurring_total:,.0f} לחודש — בדוק אם כולם עדיין נחוצים.")

        if len(months) >= 2:
            prev = months[-2]
            prev_total = sum(monthly_expenses[prev].values())
            if prev_total > 0 and total_exp > prev_total * 1.15:
                pct = round((total_exp - prev_total) / prev_total * 100)
                advice.append(f"ההוצאות עלו ב-{pct}% לעומת החודש הקודם — בדוק מה גרם לעלייה.")

    if not advice:
        advice.append("המשך לעקוב אחר ההוצאות מדי חודש — ניתוח עקבי הוא הבסיס לניהול כלכלי טוב.")

    # ── Summary ────────────────────────────────────────────────────────────────
    summary_parts = []
    if months:
        latest = months[-1]
        total_exp = sum(monthly_expenses[latest].values())
        total_inc = monthly_income.get(latest, 0)
        month_label = _format_month(latest)
        if total_inc > 0:
            balance = total_inc - total_exp
            direction = "עודף" if balance >= 0 else "גירעון"
            summary_parts.append(
                f"ב{month_label}: הכנסות ₪{total_inc:,.0f}, הוצאות ₪{total_exp:,.0f} — {direction} של ₪{abs(balance):,.0f}."
            )
        else:
            summary_parts.append(f"ב{month_label}: סך הוצאות ₪{total_exp:,.0f}.")

        if len(months) >= 2:
            prev = months[-2]
            prev_total = sum(monthly_expenses[prev].values())
            if prev_total > 0:
                delta_pct = (total_exp - prev_total) / prev_total * 100
                word = "עלו" if delta_pct > 0 else "ירדו"
                summary_parts.append(f"ההוצאות {word} ב-{abs(delta_pct):.0f}% לעומת {_format_month(prev)}.")

    if len(months) == 0:
        summary_parts = ["לא נמצאו נתונים לניתוח. יש לסנכרן תנועות בנק תחילה."]

    return {
        "summary": " ".join(summary_parts),
        "recurring": recurring,
        "anomalies": anomalies,
        "advice": advice,
    }


@router.get("/insights")
async def ai_insights(
    ctx=Depends(get_current_household),
    db: AsyncSession = Depends(get_db),
):
    _, household = ctx
    rows = await _collect(household.id, db)

    if not rows:
        raise HTTPException(status_code=422, detail="אין מספיק נתונים לניתוח — יש לסנכרן תנועות בנק תחילה")

    return _analyze(rows)
