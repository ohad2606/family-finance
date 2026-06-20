import re
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

_PW_RE = re.compile(r'^(?=.*[A-Z])(?=.*\d).{10,}$')


def validate_password_strength(password: str) -> str:
    if not _PW_RE.match(password):
        raise ValueError("הסיסמה חייבת להכיל לפחות 10 תווים, ספרה אחת ואות גדולה אחת באנגלית")
    return password


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, household_id: int, token_version: int = 1) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    data = {"sub": subject, "hid": household_id, "exp": expire, "type": "access", "tv": token_version}
    return jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")


def create_refresh_token(subject: str, token_version: int = 1) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    data = {"sub": subject, "exp": expire, "type": "refresh", "tv": token_version}
    return jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


def create_reset_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    data = {"sub": str(user_id), "exp": expire, "type": "reset"}
    return jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")


def generate_csrf_token() -> str:
    return secrets.token_hex(32)
