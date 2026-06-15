import { Loader2 } from 'lucide-react'

type ButtonDefaultProps = {
  type: "submit" | "button" | "reset"
  dataTestid?: string
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
  color?: "default" | "primary" | "secondary" | "tertiary" | "danger"
}

const BUTTON_STYLES = {
  default:
    "bg-brand-green border border-brand-green-dark text-white font-bold p-2 rounded-md w-full hover:bg-brand-green-dark hover:text-white transition-all duration-200",
  primary:
    "bg-background border border-border text-foreground font-bold p-2 rounded-md w-full hover:bg-muted transition-all duration-200",
  secondary:
    "bg-muted border border-border text-foreground font-bold py-2 px-4 rounded hover:bg-muted/80 transition-all duration-200",
  tertiary:
    "bg-green-1 border border-brand-green-dark text-white font-bold p-2 rounded-md w-full hover:bg-green-2 transition-all duration-200",
  danger:
    "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-all duration-200",
} as const

export const ButtonDefault = (props: ButtonDefaultProps) => {
  const { isLoading, disabled } = props

  return (
    <div className={props.className}>
      <button
        type={props.type}
        data-testid={props.dataTestid}
        disabled={disabled || isLoading}
        onClick={props.onClick}
        className={`${BUTTON_STYLES[props.color || "default"]} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {props.children}
      </button>
    </div>
  )
}