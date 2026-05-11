import { cn } from '@/lib/utils'

export const FADE_DURATION_MS = 300

/** Tempo de exibição do toast antes do fade + navegação (login / logout). */
export const AUTH_REDIRECT_DELAY_MS = 3000

export function fadeTransitionBaseClassName() {
  return `transition-opacity ease-out will-change-opacity duration-[${FADE_DURATION_MS}ms]`
}

export function fadeExitClassName(isExiting: boolean, className?: string) {
  return cn(
    fadeTransitionBaseClassName(),
    isExiting && 'pointer-events-none opacity-0',
    className,
  )
}
