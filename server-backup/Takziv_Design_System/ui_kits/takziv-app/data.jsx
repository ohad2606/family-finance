// Takziv UI kit — mock household data (matches the real app's shapes)
const TAKZIV_DATA = {
  user: { display_name: 'דנה כהן', household_name: 'משפחת כהן' },

  summary: {
    net_worth: 127430,
    total_assets: 158000,
    total_liabilities: 30570,
    month_income: 14200,
    month_expense: 9840,
  },

  netWorthHistory: [
    98000, 101200, 99800, 104500, 108300, 110100,
    113900, 116200, 119000, 121800, 124600, 127430,
  ],

  health: {
    score: 78,
    savings_rate:    { value: 31, status: 'excellent', label: 'שיעור חיסכון' },
    budget_adherence:{ value: 88, status: 'good',      label: 'עמידה בתקציב' },
    runway_months:   { value: 5,  status: 'fair',      label: 'חודשי כרית' },
    debt_burden:     { value: 22, status: 'good',      label: 'נטל חוב' },
  },

  cashflow: [
    { month: '2026-01', income: 13800, expense: 9200 },
    { month: '2026-02', income: 14100, expense: 10400 },
    { month: '2026-03', income: 13900, expense: 8800 },
    { month: '2026-04', income: 15200, expense: 11200 },
    { month: '2026-05', income: 14000, expense: 9100 },
    { month: '2026-06', income: 14200, expense: 9840 },
  ],

  spending: [
    { category_name: 'דיור',     category_icon: '🏠', pct: 0.34 },
    { category_name: 'מזון',     category_icon: '🛒', pct: 0.22 },
    { category_name: 'תחבורה',   category_icon: '🚗', pct: 0.14 },
    { category_name: 'מסעדות',   category_icon: '🍽', pct: 0.12 },
    { category_name: 'חינוך',    category_icon: '🎓', pct: 0.10 },
    { category_name: 'אחר',      category_icon: '📦', pct: 0.08 },
  ],

  overBudget: [{ category_name: 'מסעדות' }],

  upcoming: [
    { id: 1, description: 'שכירות',  next_date: '18.6', days: 2, amount: 3800, kind: 'expense' },
    { id: 2, description: 'מנוי Netflix', next_date: '20.6', days: 4, amount: 55, kind: 'expense' },
    { id: 3, description: 'משכורת',  next_date: '28.6', days: 12, amount: 14200, kind: 'income' },
  ],

  savings: [
    { id: 1, name: 'חופשה ביוון', icon: '🏖', current: 6400, target: 10000, color: 'var(--cat-7)', months_left: 4 },
    { id: 2, name: 'קרן חירום',  icon: '🛟', current: 22000, target: 30000, color: 'var(--income)', months_left: 8 },
    { id: 3, name: 'רכב חדש',    icon: '🚗', current: 9000, target: 45000, color: 'var(--brass)', months_left: 20 },
  ],

  loans: [
    { id: 1, name: 'משכנתא', type: '🏠', months_remaining: 214, monthly_payment: 4200, balance: 612000 },
    { id: 2, name: 'הלוואת רכב', type: '🚗', months_remaining: 28, monthly_payment: 1450, balance: 38600 },
  ],

  accounts: [
    { id: 1, name: 'עו״ש משותף', type: 'עו״ש',   institution: 'לאומי', balance: 24300 },
    { id: 2, name: 'חיסכון',     type: 'חיסכון', institution: 'הפועלים', balance: 88000 },
    { id: 3, name: 'אשראי',      type: 'אשראי',  institution: 'ויזה', balance: -4180 },
    { id: 4, name: 'מזומן',      type: 'מזומן',  institution: '', balance: 1200 },
  ],

  transactions: [
    { id: 1, desc: 'משכורת',  account: 'עו״ש משותף', date: '12.6.2026', amount: 14200, kind: 'income' },
    { id: 2, desc: 'סופר רמי לוי', account: 'אשראי', date: '11.6.2026', amount: 642, kind: 'expense' },
    { id: 3, desc: 'דלק פז',  account: 'אשראי', date: '10.6.2026', amount: 310, kind: 'expense' },
    { id: 4, desc: 'מסעדה איטלקית', account: 'אשראי', date: '9.6.2026', amount: 280, kind: 'expense' },
    { id: 5, desc: 'החזר חבר', account: 'עו״ש משותף', date: '8.6.2026', amount: 150, kind: 'income' },
  ],

  accountOptions: ['עו״ש משותף', 'חיסכון', 'אשראי', 'מזומן'],
  categoryOptions: {
    expense: ['🏠 דיור', '🛒 מזון', '🚗 תחבורה', '🍽 מסעדות', '🎓 חינוך'],
    income: ['💼 משכורת', '🎁 מתנה', '📈 השקעות'],
  },
}

window.TAKZIV_DATA = TAKZIV_DATA
