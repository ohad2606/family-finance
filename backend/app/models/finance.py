from datetime import date, datetime

from sqlalchemy import (
    Boolean, Date, DateTime, Enum, ForeignKey,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BankSyncLog(Base):
    __tablename__ = "bank_sync_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # "ok" | "error"
    accounts_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    txns_created: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    txns_skipped: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    scraped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BankSyncCommand(Base):
    __tablename__ = "bank_sync_commands"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)  # None = all configured sources
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending|running|done|error
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("checking", "savings", "cash", "credit", "investment", name="account_type"),
        nullable=False,
    )
    institution: Mapped[str | None] = mapped_column(String(100), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="ILS", nullable=False)
    opening_balance: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    bank_balance: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    bank_balance_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    nickname: Mapped[str | None] = mapped_column(String(100), nullable=True)
    credit_limit: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    show_on_dashboard: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    include_in_totals: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="account")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    kind: Mapped[str] = mapped_column(Enum("income", "expense", name="category_kind"), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    kind: Mapped[str] = mapped_column(Enum("income", "expense", name="transaction_kind"), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    source: Mapped[str] = mapped_column(
        Enum("manual", "recurring", "bank_sync", "import", name="transaction_source"),
        default="manual",
        nullable=False,
    )
    external_ref: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    account: Mapped["Account"] = relationship(back_populates="transactions")
    category: Mapped["Category | None"] = relationship(back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    month: Mapped[date] = mapped_column(Date, nullable=False)  # always 1st of month
    amount_planned: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    category: Mapped["Category"] = relationship()


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    target_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    current_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    loan_type: Mapped[str] = mapped_column(
        Enum("mortgage", "personal", "car", "student", "other", name="loan_type"),
        nullable=False,
    )
    principal: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    interest_rate: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)  # annual %
    term_months: Mapped[int] = mapped_column(Integer, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    monthly_payment: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)  # override
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RecurringRule(Base):
    __tablename__ = "recurring_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), nullable=False, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    kind: Mapped[str] = mapped_column(Enum("income", "expense", name="rr_kind"), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    frequency: Mapped[str] = mapped_column(
        Enum("weekly", "monthly", "yearly", name="rr_frequency"), nullable=False
    )
    next_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    account: Mapped["Account"] = relationship()
    category: Mapped["Category | None"] = relationship()
