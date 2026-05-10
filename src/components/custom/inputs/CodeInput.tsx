import { useRef } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

type CodeInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  label: string;
  length?: number;
  disabled?: boolean;
};

export function CodeInput<T extends FieldValues>({
  name,
  control,
  rules,
  label,
  length = 6,
  disabled,
}: CodeInputProps<T>) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const value = String(field.value ?? "").replace(/\D/g, "").slice(0, length);
        const digits = Array.from({ length }, (_, index) => value[index] ?? "");

        const updateCode = (startIndex: number, rawValue: string) => {
          const typedDigits = rawValue.replace(/\D/g, "").slice(0, length - startIndex);
          const nextDigits = [...digits];

          if (!typedDigits) {
            nextDigits[startIndex] = "";
            field.onChange(nextDigits.join(""));
            return;
          }

          typedDigits.split("").forEach((digit, offset) => {
            nextDigits[startIndex + offset] = digit;
          });
          field.onChange(nextDigits.join(""));

          const nextFocusIndex = Math.min(startIndex + typedDigits.length, length - 1);
          inputRefs.current[nextFocusIndex]?.focus();
        };

        return (
          <div className="flex flex-col gap-2">
            <label className={error ? "text-red-500 text-base pl-2.5" : "text-black/80 text-base pl-2.5"}>
              {label}
            </label>

            <div className="flex justify-between gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  disabled={disabled}
                  value={digit}
                  onBlur={field.onBlur}
                  onChange={(event) => updateCode(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !digits[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    updateCode(index, event.clipboardData.getData("text"));
                  }}
                  className={`h-12 w-full rounded-lg border bg-white text-center text-xl font-bold text-black focus:outline-none ${
                    error
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-black/60"
                  }`}
                />
              ))}
            </div>

            {error && (
              <span className="pl-2.5 text-red-500 text-sm">{error.message}</span>
            )}
          </div>
        );
      }}
    />
  );
}
