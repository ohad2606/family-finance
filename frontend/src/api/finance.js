import api from './client'

export const getAccounts = () => api.get('/accounts').then(r => r.data)
export const createAccount = (data) => api.post('/accounts', data).then(r => r.data)
export const updateAccount = (id, data) => api.patch(`/accounts/${id}`, data).then(r => r.data)
export const deleteAccount = (id) => api.delete(`/accounts/${id}`)

export const getCategories = () => api.get('/categories').then(r => r.data)
export const createCategory = (data) => api.post('/categories', data).then(r => r.data)

export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data)
export const createTransaction = (data) => api.post('/transactions', data).then(r => r.data)
export const updateTransaction = (id, data) => api.patch(`/transactions/${id}`, data).then(r => r.data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)

export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data)

export const getBudget = (month) => api.get('/budgets', { params: { month } }).then(r => r.data)
export const upsertBudget = (data) => api.put('/budgets', data).then(r => r.data)

export const getCashflow = (months = 6) => api.get('/dashboard/cashflow', { params: { months } }).then(r => r.data)
export const getSpending = (month, kind = 'expense') => api.get('/dashboard/spending', { params: { month, kind } }).then(r => r.data)

export const getRecurring = () => api.get('/recurring').then(r => r.data)
export const createRecurring = (data) => api.post('/recurring', data).then(r => r.data)
export const updateRecurring = (id, data) => api.patch(`/recurring/${id}`, data).then(r => r.data)
export const deleteRecurring = (id) => api.delete(`/recurring/${id}`)

export const getSavings = () => api.get('/savings').then(r => r.data)
export const createSavings = (data) => api.post('/savings', data).then(r => r.data)
export const updateSavings = (id, data) => api.patch(`/savings/${id}`, data).then(r => r.data)
export const deleteSavings = (id) => api.delete(`/savings/${id}`)

export const getLoans = () => api.get('/loans').then(r => r.data)
export const createLoan = (data) => api.post('/loans', data).then(r => r.data)
export const updateLoan = (id, data) => api.patch(`/loans/${id}`, data).then(r => r.data)
export const deleteLoan = (id) => api.delete(`/loans/${id}`)
export const getLoanSchedule = (id) => api.get(`/loans/${id}/schedule`).then(r => r.data)
