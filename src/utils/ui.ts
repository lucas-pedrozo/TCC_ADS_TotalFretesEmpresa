import { cn } from '@/lib/utils'

export const FADE_DURATION_MS = 300

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
