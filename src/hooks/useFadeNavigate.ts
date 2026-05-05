import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, type NavigateOptions, type To } from 'react-router'
import { FADE_DURATION_MS } from '@/utils/ui'

export function useFadeNavigate() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)
  const exitingRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigateWithFade = useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (exitingRef.current) return
      exitingRef.current = true
      setIsExiting(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        if (typeof to === 'number') {
          navigate(to)
        } else {
          navigate(to, options)
        }
      }, FADE_DURATION_MS)
    },
    [navigate],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { isExiting, navigateWithFade }
}
