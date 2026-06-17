from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.routers import auth, accounts, categories, transactions, dashboard, oauth, budgets, recurring, loans, savings, household, bank_sync
from app.scheduler import start_scheduler, scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    scheduler.shutdown()


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="כספי API",
    version="0.1.0",
    docs_url="/api/docs" if not settings.is_production else None,
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-CSRF-Token"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(oauth.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(recurring.router, prefix="/api")
app.include_router(loans.router, prefix="/api")
app.include_router(savings.router, prefix="/api")
app.include_router(household.router, prefix="/api")
app.include_router(bank_sync.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "takziv"}
