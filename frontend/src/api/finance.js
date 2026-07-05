import api from './client'

export const getAccounts = () => api.get('/accounts').then(r => r.data)
export const createAccount = (data) => api.post('/accounts', data).then(r => r.data)
export const updateAccount = (id, data) => api.patch(`/accounts/${id}`, data).then(r => r.data)
export const deleteAccount = (id) => api.delete(`/accounts/${id}`)

export const getCategories = () => api.get('/categories').then(r => r.data)
export const createCategory = (data) => api.post('/categories', data).then(r => r.data)
export const updateCategory = (id, data) => api.patch(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data)
export const createTransaction = (data) => api.post('/transactions', data).then(r => r.data)
export const updateTransaction = (id, data) => api.patch(`/transactions/${id}`, data).then(r => r.data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)
export const getPlannedTransactions = () => api.get('/transactions', { params: { is_planned: true } }).then(r => r.data)
export const confirmPlannedTransaction = (id) => api.post(`/transactions/${id}/confirm`).then(r => r.data)

export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data)

export const getBudget = (month) => api.get('/budgets', { params: { month } }).then(r => r.data)
export const upsertBudget = (data) => api.put('/budgets', data).then(r => r.data)
export const copyBudget = (from_month, to_month) => api.post('/budgets/copy', null, { params: { from_month, to_month } }).then(r => r.data)

export const getCashflow = (months = 6) => api.get('/dashboard/cashflow', { params: { months } }).then(r => r.data)
export const getSpending = (month, kind = 'expense') => api.get('/dashboard/spending', { params: { month, kind } }).then(r => r.data)
export const getAnnualReport = (year) => api.get('/dashboard/annual', { params: { year } }).then(r => r.data)
export const getNetWorthHistory = (months = 12) => api.get('/dashboard/networth-history', { params: { months } }).then(r => r.data)
export const getFinancialHealth = () => api.get('/dashboard/health').then(r => r.data)

export const getUpcomingRecurring = (days = 7) => api.get('/recurring/upcoming', { params: { days } }).then(r => r.data)

export const getRecurring = () => api.get('/recurring').then(r => r.data)
export const createRecurring = (data) => api.post('/recurring', data).then(r => r.data)
export const updateRecurring = (id, data) => api.patch(`/recurring/${id}`, data).then(r => r.data)
export const deleteRecurring = (id) => api.delete(`/recurring/${id}`)

export const getSavings = () => api.get('/savings').then(r => r.data)
export const createSavings = (data) => api.post('/savings', data).then(r => r.data)
export const updateSavings = (id, data) => api.patch(`/savings/${id}`, data).then(r => r.data)
export const deleteSavings = (id) => api.delete(`/savings/${id}`)

export const bulkImportTransactions = (rows) => api.post('/transactions/bulk', { rows }).then(r => r.data)

export const getHousehold = () => api.get('/household').then(r => r.data)
export const createInvite = () => api.post('/household/invite').then(r => r.data)
export const getInviteInfo = (token) => api.get(`/household/invite/${token}`).then(r => r.data)
export const joinHousehold = (token) => api.post(`/household/join/${token}`).then(r => r.data)
export const removeMember = (memberId) => api.delete(`/household/members/${memberId}`)
export const updateHouseholdName = (name) => api.patch('/household/name', { name }).then(r => r.data)

export const getLoans = () => api.get('/loans').then(r => r.data)
export const createLoan = (data) => api.post('/loans', data).then(r => r.data)
export const updateLoan = (id, data) => api.patch(`/loans/${id}`, data).then(r => r.data)
export const deleteLoan = (id) => api.delete(`/loans/${id}`)
export const getLoanSchedule = (id) => api.get(`/loans/${id}/schedule`).then(r => r.data)

export const getBankSyncStatus = () => api.get('/bank-sync/status').then(r => r.data)
export const triggerBankSync = () => api.post('/bank-sync/trigger').then(r => r.data)

export const getAiInsights = () => api.get('/ai/insights').then(r => r.data)

export const getMonthLedger = (month) => api.get('/dashboard/month-ledger', { params: { month } }).then(r => r.data)
export const getRecurringOccurrences = (month) => api.get('/recurring/occurrences', { params: { month } }).then(r => r.data)
export const skipOccurrence = (id) => api.post(`/recurring/occurrences/${id}/skip`).then(r => r.data)
