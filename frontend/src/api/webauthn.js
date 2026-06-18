import api from './client'

export const passkeyRegisterBegin = () =>
  api.get('/auth/webauthn/register/begin').then(r => r.data)

export const passkeyRegisterComplete = (credential, name) =>
  api.post('/auth/webauthn/register/complete', { ...credential, name }).then(r => r.data)

export const passkeyLoginBegin = () =>
  api.post('/auth/webauthn/login/begin').then(r => r.data)

export const passkeyLoginComplete = (credential) =>
  api.post('/auth/webauthn/login/complete', credential).then(r => r.data)

export const listCredentials = () =>
  api.get('/auth/webauthn/credentials').then(r => r.data)

export const deleteCredential = (id) =>
  api.delete(`/auth/webauthn/credentials/${id}`).then(r => r.data)
