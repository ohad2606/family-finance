// Takziv — main-screen redesign: shared data
// Hero concept: "פנוי להוצאה" = liquid balance minus fixed obligations still
// pending this month. Framed daily + monthly, with category budgets up front.
window.TZ_REDESIGN = {
  user: { name: 'דנה' },

  available: 4360,        // liquid (9,200) − pending fixed (4,840)
  liquid: 9200,
  pendingFixed: 4840,
  daysLeft: 20,
  perDay: 218,            // available / daysLeft
  todayAllowance: 218,
  todaySpent: 12,         // spent so far today

  month: { income: 14200, expense: 9840 },

  budgets: [
    { name: 'אוכל',    icon: '🛒', planned: 2000, spent: 1640 },
    { name: 'מסעדות',  icon: '🍽', planned: 600,  spent: 720  }, // over
    { name: 'תחבורה',  icon: '🚗', planned: 900,  spent: 540  },
    { name: 'פנאי',    icon: '🎬', planned: 500,  spent: 180  },
    { name: 'דיור',    icon: '🏠', planned: 3800, spent: 3800 }, // fixed
    { name: 'אחר',     icon: '📦', planned: 400,  spent: 260  },
  ],

  upcoming: [
    { id: 1, name: 'שכירות', icon: '🏠', date: '18.6', days: 2, amount: 3800 },
    { id: 2, name: 'חשמל',   icon: '⚡', date: '22.6', days: 6, amount: 340 },
    { id: 3, name: 'Netflix', icon: '🎬', date: '24.6', days: 8, amount: 55 },
  ],

  transactions: [
    { id: 1, desc: 'סופר רמי לוי', icon: '🛒', date: 'היום',  amount: 642,   kind: 'expense' },
    { id: 2, desc: 'דלק פז',       icon: '🚗', date: 'אתמול', amount: 310,   kind: 'expense' },
    { id: 3, desc: 'משכורת',       icon: '💼', date: '12.6',  amount: 14200, kind: 'income' },
    { id: 4, desc: 'קפה ארומה',    icon: '☕', date: '12.6',  amount: 18,    kind: 'expense' },
  ],

  overBudget: ['מסעדות'],

  categoryOptions: ['🛒 אוכל', '🍽 מסעדות', '🚗 תחבורה', '🎬 פנאי', '🏠 דיור', '📦 אחר'],
  accountOptions: ['עו״ש משותף', 'אשראי', 'מזומן'],
}
