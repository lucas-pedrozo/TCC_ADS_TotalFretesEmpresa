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
  default: "bg-black text-white font-bold p-2 rounded-md w-full hover:opacity-80",
  primary: "bg-white border-1 border-black text-black font-bold p-2   rounded-md w-full hover:opacity-80",
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
        className={BUTTON_STYLES[props.color || "default"]}
      >
        {props.children}
      </button>
    </div>
  )
}