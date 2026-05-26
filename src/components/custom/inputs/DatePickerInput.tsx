import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatDateInputDisplay,
  maskTypedDateDisplay,
  normalizeDateInputValue,
  normalizeTypedDateValue,
  parseDateInputValue,
} from "@/utils/dateFormat";

type DatePickerInputProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(left: Date | null, right: Date) {
  return !!left && left.toDateString() === right.toDateString();
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const offset = (firstDayOfMonth.getDay() + 6) % 7;
  const firstVisibleDay = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });
}

function formatMonthLabel(date: Date, locale: "pt-BR" | "en-US") {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getWeekdayLabels(locale: "pt-BR" | "en-US") {
  const monday = new Date(2024, 0, 1, 12);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);

    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(day)
      .replace(".", "")
      .slice(0, 3);
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function DatePickerInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  className,
}: DatePickerInputProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-US" : "pt-BR";
  const appLocale = locale === "en-US" ? "en" : "pt-BR";
  const selectedDate = useMemo(
    () => parseDateInputValue(normalizeDateInputValue(value)),
    [value]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? new Date());
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const displayValue = formatDateInputDisplay(value, appLocale);

  useEffect(() => {
    if (isEditing) return;

    setDraftValue(displayValue || value || "");
  }, [displayValue, isEditing, value]);

  const handleSelectDate = (date: Date) => {
    const normalizedValue = toDateInputValue(date);

    onChange(normalizedValue);
    setDraftValue(formatDateInputDisplay(normalizedValue, appLocale));
    onBlur?.();
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    setIsEditing(false);

    const normalizedValue = normalizeTypedDateValue(draftValue, appLocale);

    if (!draftValue.trim()) {
      onChange("");
      onBlur?.();
      return;
    }

    if (normalizedValue) {
      onChange(normalizedValue);
      setDraftValue(formatDateInputDisplay(normalizedValue, appLocale));
      onBlur?.();
      return;
    }

    onChange(draftValue);
    onBlur?.();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative w-full">
        <Input
          id={id}
          type="text"
          disabled={disabled}
          value={draftValue}
          onFocus={() => setIsEditing(true)}
          onChange={(event) => {
            setIsEditing(true);
            setDraftValue(maskTypedDateDisplay(event.target.value));
          }}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          inputMode="numeric"
          className={cn("pr-11", className)}
        />

        <PopoverTrigger
          render={
            <button
              type="button"
              disabled={disabled}
              className="absolute inset-y-1.5 right-1.5 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Abrir calendário"
            >
              <CalendarDays className="size-4 shrink-0" aria-hidden />
            </button>
          }
        />

        <PopoverContent
          className="w-[min(calc(100vw-2rem),20rem)] max-w-none rounded-2xl p-3"
          align="start"
          sideOffset={8}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() =>
                setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
              aria-label={locale === "en-US" ? "Previous month" : "Mês anterior"}
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-sm font-semibold capitalize text-foreground">
              {formatMonthLabel(viewDate, locale)}
            </span>

            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() =>
                setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
              aria-label={locale === "en-US" ? "Next month" : "Próximo mês"}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {weekdayLabels.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const isCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = isSameDay(selectedDate, day);
              const isToday = isSameDay(today, day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                    isSelected
                      ? "bg-brand-green-dark font-semibold text-white hover:bg-brand-green-dark/90"
                      : "text-foreground hover:bg-muted",
                    !isCurrentMonth && !isSelected && "text-muted-foreground/55",
                    isToday && !isSelected && "ring-1 ring-brand-green/40"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}
