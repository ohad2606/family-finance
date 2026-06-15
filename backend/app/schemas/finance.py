from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# --- Account ---

class AccountCreate(BaseModel):
    name: str
    type: str
    institution: Optional[str] = None
    opening_balance: float = 0
    currency: str = "ILS"


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    opening_balance: Optional[float] = None
    is_active: Optional[bool] = None


class AccountOut(BaseModel):
    id: int
    name: str
    type: str
    institution: Optional[str]
    currency: str
    opening_balance: float
    is_active: bool
    balance: float = 0

    model_config = {"from_attributes": True}


# --- Category ---

class CategoryCreate(BaseModel):
    name: str
    kind: str
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    kind: str
    parent_id: Optional[int]
    icon: Optional[str]
    color: Optional[str]

    model_config = {"from_attributes": True}


# --- Transaction ---

class TransactionCreate(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    amount: float
    kind: str
    description: Optional[str] = None
    transaction_date: date


class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = None
    kind: Optional[str] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None


class TransactionOut(BaseModel):
    id: int
    account_id: int
    account_name: str
    category_id: Optional[int]
    category_name: Optional[str]
    category_icon: Optional[str]
    amount: float
    kind: str
    description: Optional[str]
    transaction_date: date
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Savings Goals ---

class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    target_date: Optional[date] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[date] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_completed: Optional[bool] = None


class SavingsGoalOut(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    target_date: Optional[date]
    icon: Optional[str]
    color: Optional[str]
    is_completed: bool
    pct: float          # 0–1
    months_left: Optional[int]
    monthly_needed: Optional[float]

    model_config = {"from_attributes": True}


# --- Loans ---

class LoanCreate(BaseModel):
    name: str
    loan_type: str
    principal: float
    interest_rate: float   # annual %
    term_months: int
    start_date: date
    monthly_payment: Optional[float] = None
    notes: Optional[str] = None


class LoanUpdate(BaseModel):
    name: Optional[str] = None
    interest_rate: Optional[float] = None
    monthly_payment: Optional[float] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class AmortizationRow(BaseModel):
    month_num: int
    payment_date: date
    payment: float
    principal_part: float
    interest_part: float
    balance: float


class LoanOut(BaseModel):
    id: int
    name: str
    loan_type: str
    principal: float
    interest_rate: float
    term_months: int
    start_date: date
    monthly_payment: float
    notes: Optional[str]
    is_active: bool
    # computed
    months_elapsed: int
    balance_remaining: float
    months_remaining: int
    total_interest: float

    model_config = {"from_attributes": True}


# --- Recurring Rules ---

class RecurringRuleCreate(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    amount: float
    kind: str
    description: Optional[str] = None
    frequency: str
    next_date: date
    end_date: Optional[date] = None


class RecurringRuleUpdate(BaseModel):
    amount: Optional[float] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    next_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class RecurringRuleOut(BaseModel):
    id: int
    account_id: int
    account_name: str
    category_id: Optional[int]
    category_name: Optional[str]
    category_icon: Optional[str]
    amount: float
    kind: str
    description: Optional[str]
    frequency: str
    next_date: date
    end_date: Optional[date]
    is_active: bool

    model_config = {"from_attributes": True}


# --- Budget ---

class BudgetUpsert(BaseModel):
    category_id: int
    month: date
    amount_planned: float


class BudgetLineOut(BaseModel):
    category_id: int
    category_name: str
    category_icon: Optional[str]
    amount_planned: float
    amount_actual: float

    model_config = {"from_attributes": True}


# --- Dashboard ---

class CashflowMonth(BaseModel):
    month: str   # "YYYY-MM"
    income: float
    expense: float


class DashboardSummary(BaseModel):
    total_assets: float
    total_liabilities: float
    net_worth: float
    month_income: float
    month_expense: float
    month_balance: float
