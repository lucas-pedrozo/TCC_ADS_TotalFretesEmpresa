import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form"
import type { ReactNode } from "react"
import { maskCnpj, maskPhone } from "@/utils/mask"

type InputDefaultProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  rules?: RegisterOptions<T>
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  mask?: "default" | "phone" | "cnpj"
  rightElement?: ReactNode
}

export const INPUT_STYLES = {
  default: {
    label: "text-black/80 text-base pl-2.5",
    input:
      "w-full p-2 text-black text-base bg-white border border-black/60 rounded-lg placeholder:text-black/60 focus:outline-none",
  },
  error: {
    label: "text-red-500 text-base pl-2.5",
    input:
      "w-full p-2.5 text-black text-base bg-white border border-black/60 rounded-lg placeholder:text-black/60 focus:outline-none border-red-500 focus:ring-1 focus:ring-red-500",
  },
  disabled: {
    label: "text-black/80 text-base pl-2.5 opacity-70",
    input:
      "w-full p-2.5 text-black text-base bg-white border border-black/60 rounded-lg placeholder:text-black/60 focus:outline-none opacity-70 cursor-not-allowed",
  },
} as const

const MASKS = {
  default: (value: string) => value,
  phone: maskPhone,
  cnpj: maskCnpj,
}

export const UNMASKS = {
  default: (value: string) => value,
  phone: (value: string) => value.replace(/\D/g, ""),
  cnpj: (value: string) => value.replace(/\D/g, ""),
}

export function InputDefault<T extends FieldValues>({
  name,
  control,
  rules,
  label,
  type = "text",
  placeholder,
  maxLength,
  disabled,
  mask = "default",
  rightElement,
}: InputDefaultProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const inputClassName = disabled
          ? INPUT_STYLES.disabled.input
          : error
            ? INPUT_STYLES.error.input
            : INPUT_STYLES.default.input

        return (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={name}
              className={
                disabled
                  ? INPUT_STYLES.disabled.label
                  : error
                    ? INPUT_STYLES.error.label
                    : INPUT_STYLES.default.label
              }
            >
              {label}
            </label>

            <div className="relative">
              <input
                id={name}
                type={type}
                placeholder={placeholder}
                onChange={(e) => {
                  const masked = MASKS[mask](e.target.value)
                  field.onChange(UNMASKS[mask](masked))
                }}
                onBlur={field.onBlur}
                value={MASKS[mask](field.value ?? "")}
                ref={field.ref}
                maxLength={maxLength}
                disabled={disabled}
                className={`${inputClassName} ${rightElement ? "pr-10" : ""}`}
              />

              {rightElement && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {rightElement}
                </div>
              )}
            </div>

            {error && (
              <span className="pl-2.5 text-red-500 text-sm">{error.message}</span>
            )}
          </div>
        )
      }}
    />
  )
}