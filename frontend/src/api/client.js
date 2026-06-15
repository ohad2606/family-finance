import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

const getCsrf = () =>
  document.cookie.split('; ').find(c => c.startsWith('csrf_token='))?.split('=')[1]

// Attach CSRF token to mutating requests
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrf = getCsrf()
    if (csrf) config.headers['X-CSRF-Token'] = csrf
  }
  return config
})

let refreshing = null

// Auto-refresh on 401 (except for auth endpoints themselves)
api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    const skipRefresh = orig.url?.includes('/auth/refresh')
    if (err.response?.status === 401 && !orig._retried && !skipRefresh) {
      orig._retried = true
      try {
        if (!refreshing) {
          refreshing = axios.post('/api/auth/refresh', null, { withCredentials: true })
            .finally(() => { refreshing = null })
        }
        await refreshing
        // CSRF cookie updated — re-read before retry
        const csrf = getCsrf()
        if (csrf && ['post', 'put', 'patch', 'delete'].includes(orig.method)) {
          orig.headers['X-CSRF-Token'] = csrf
        }
        return api(orig)
      } catch {
        // refresh failed — caller gets the 401
      }
    }
    return Promise.reject(err)
  }
)

export default api
