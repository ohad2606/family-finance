import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// attach CSRF token from cookie to every mutating request
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrf = document.cookie
      .split('; ')
      .find((c) => c.startsWith('csrf_token='))
      ?.split('=')[1]
    if (csrf) config.headers['X-CSRF-Token'] = csrf
  }
  return config
})

export default api
