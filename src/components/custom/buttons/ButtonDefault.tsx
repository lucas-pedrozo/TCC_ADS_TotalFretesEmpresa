type ButtonDefaultProps = {
  type: "submit" | "button" | "reset"
  dataTestid?: string
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
  color?: "default" | "primary" | "secondary" | "danger"
}

const BUTTON_STYLES = {
  default: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",
  primary: "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded",
  danger: "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
} as const

export const ButtonDefault = (props: ButtonDefaultProps) => {
  return (
    <div className={props.className}>
      <button
        type={props.type}
        data-testid={props.dataTestid}
        disabled={props.disabled}
        onClick={props.onClick}
        className={props.disabled ? "bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed" : BUTTON_STYLES[props.color || "default"]}
      >
        {props.children}
      </button>
    </div>
  )
}