import httpx
from app.core.config import settings

RESEND_URL = "https://api.resend.com/emails"


async def send_reset_email(to_email: str, reset_link: str) -> None:
    html = f"""
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#1B2A27">איפוס סיסמה — תקציב</h2>
      <p>קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור להמשך:</p>
      <a href="{reset_link}"
         style="display:inline-block;padding:12px 24px;background:#C9A23F;color:#fff;
                border-radius:10px;text-decoration:none;font-weight:700;margin:16px 0">
        איפוס סיסמה
      </a>
      <p style="color:#6B746E;font-size:0.85rem">
        הקישור בתוקף לשעה אחת.<br>
        אם לא ביקשת איפוס — אפשר להתעלם מהמייל הזה.
      </p>
    </div>
    """
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(
            RESEND_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": f"תקציב <{settings.FROM_EMAIL}>",
                "to": [to_email],
                "subject": "איפוס סיסמה — תקציב",
                "html": html,
            },
        )
