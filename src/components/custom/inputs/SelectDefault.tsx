import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { INPUT_STYLES } from "@/components/custom/inputs/InputDefault";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectDefaultProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  options: SelectOption[];
};

export function SelectDefault<T extends FieldValues>({
  name,
  control,
  rules,
  label,
  placeholder,
  disabled,
  options,
}: SelectDefaultProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const selectClassName = disabled
          ? INPUT_STYLES.disabled.input
          : error
            ? INPUT_STYLES.error.input
            : INPUT_STYLES.default.input;

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

            <select
              id={name}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={disabled}
              className={selectClassName}
            >
              {placeholder && <option value="">{placeholder}</option>}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {error && (
              <span className="pl-2.5 text-red-500 text-sm">{error.message}</span>
            )}
          </div>
        );
      }}
    />
  );
}
