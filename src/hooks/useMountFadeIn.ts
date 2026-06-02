import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { fadeTransitionBaseClassName } from '@/utils/ui'

type UseMountFadeInOptions = {
  className?: string
  /** Quando true, força fade-out (ex.: voltar com `navigateWithFade`). */
  isExiting?: boolean
}

export function useMountFadeIn(options?: UseMountFadeInOptions) {
  const [visible, setVisible] = useState(false)
  const isExiting = options?.isExiting ?? false

  useEffect(() => {
    let cancelled = false
    let innerFrame = 0
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (!cancelled) setVisible(true)
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
    }
  }, [])

  return cn(
    fadeTransitionBaseClassName(),
    isExiting || !visible ? 'opacity-0' : 'opacity-100',
    isExiting && 'pointer-events-none',
    options?.className,
  )
}
