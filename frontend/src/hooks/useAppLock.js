import { useState, useEffect, useCallback, useRef } from 'react'

const LOCK_TIMEOUT = 30 * 60 * 1000
export const LAST_ACTIVE_KEY = 'app_last_active'

export function useAppLock(active) {
  const [isLocked, setIsLocked] = useState(false)
  const throttleRef = useRef(null)

  const updateActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
  }, [])

  const checkLock = useCallback(() => {
    const last = localStorage.getItem(LAST_ACTIVE_KEY)
    if (!last) {
      updateActivity()
      return
    }
    if (Date.now() - parseInt(last, 10) > LOCK_TIMEOUT) {
      setIsLocked(true)
    }
  }, [updateActivity])

  const unlock = useCallback(() => {
    updateActivity()
    setIsLocked(false)
  }, [updateActivity])

  useEffect(() => {
    if (!active) return

    checkLock()

    const onVisible = () => { if (!document.hidden) checkLock() }
    document.addEventListener('visibilitychange', onVisible)

    const onActivity = () => {
      if (throttleRef.current) return
      throttleRef.current = setTimeout(() => {
        updateActivity()
        throttleRef.current = null
      }, 10_000)
    }
    window.addEventListener('click', onActivity)
    window.addEventListener('touchstart', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity)
    window.addEventListener('scroll', onActivity, { passive: true })

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('click', onActivity)
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('scroll', onActivity)
      if (throttleRef.current) clearTimeout(throttleRef.current)
    }
  }, [active, checkLock, updateActivity])

  return { isLocked, unlock }
}
