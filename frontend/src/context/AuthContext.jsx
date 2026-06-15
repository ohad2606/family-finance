import { createContext, useContext } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const signOut = async () => {
    try { await apiLogout() } catch {}
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
