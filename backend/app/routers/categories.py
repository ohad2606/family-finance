from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_household, verify_csrf
from app.models.finance import Category
from app.schemas.finance import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])

DEFAULT_CATEGORIES = [
    ("משכורת", "income", "💼", "#2F6B4F"),
    ("הכנסה אחרת", "income", "💰", "#2F6B4F"),
    ("מזון וקניות", "expense", "🛒", "#B0573C"),
    ("דיור", "expense", "🏠", "#B0573C"),
    ("תחבורה", "expense", "🚗", "#B0573C"),
    ("בריאות", "expense", "🏥", "#B0573C"),
    ("חינוך", "expense", "📚", "#B0573C"),
    ("בילויים", "expense", "🎭", "#C9A23F"),
    ("ביגוד", "expense", "👕", "#B0573C"),
    ("תקשורת", "expense", "📱", "#B0573C"),
    ("חשמל ומים", "expense", "💡", "#B0573C"),
    ("ביטוח", "expense", "🛡️", "#B0573C"),
    ("חיסכון", "expense", "🏦", "#2F6B4F"),
    ("הוצאה אחרת", "expense", "📋", "#6B746E"),
]


async def seed_default_categories(db: AsyncSession, household_id: int) -> None:
    for name, kind, icon, color in DEFAULT_CATEGORIES:
        db.add(Category(household_id=household_id, name=name, kind=kind, icon=icon, color=color))
    await db.commit()


@router.get("", response_model=list[CategoryOut])
async def list_categories(ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Category).where(Category.household_id == household.id).order_by(Category.kind, Category.name))
    return result.scalars().all()


@router.post("", response_model=CategoryOut, status_code=201, dependencies=[Depends(verify_csrf)])
async def create_category(body: CategoryCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    cat = Category(household_id=household.id, **body.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.patch("/{cat_id}", response_model=CategoryOut, dependencies=[Depends(verify_csrf)])
async def update_category(cat_id: int, body: CategoryCreate, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Category).where(Category.id == cat_id, Category.household_id == household.id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, "קטגוריה לא נמצאה")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=204, dependencies=[Depends(verify_csrf)])
async def delete_category(cat_id: int, ctx=Depends(get_current_household), db: AsyncSession = Depends(get_db)):
    _, household = ctx
    result = await db.execute(select(Category).where(Category.id == cat_id, Category.household_id == household.id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, "קטגוריה לא נמצאה")
    await db.delete(cat)
    await db.commit()
