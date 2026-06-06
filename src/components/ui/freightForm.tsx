import { useEffect, useRef, useState } from "react";
import { Banknote, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppLanguage } from "@/i18n/resources";
import type {
  CargoTypeDto,
  FreightCargoStepBody,
  FreightCreateBody,
  FreightStatusTypeDto,
} from "@/types/freight";
import {
  amountToCentsDigits,
  centsDigitsToAmount,
  currencyInputPlaceholder,
  formatCurrencyInputDisplay,
  formatFreightWeightAmount,
  kgToWeightDigits,
  sanitizeCurrencyCentsInput,
  sanitizeWeightDigitsInput,
  weightDigitsToKg,
  weightInputPlaceholder,
} from "@/utils/freightFormat";
import { cn } from "@/lib/utils";
import { CargoTypePicker } from "@/components/freights/CargoTypePicker";

type FreightFormBase = {
  cargoTypes: CargoTypeDto[];
  statusTypes?: FreightStatusTypeDto[];
  showStatus?: boolean;
  initial?: Partial<FreightCreateBody> & { status_id?: number | null };
  submitLabel: string;
  isSubmitting?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

export type FreightFormProps =
  | (FreightFormBase & {
      cargoFieldsOnly?: false;
      onSubmit: (body: FreightCreateBody) => Promise<void>;
    })
  | (FreightFormBase & {
      cargoFieldsOnly: true;
      onSubmit: (body: FreightCargoStepBody) => Promise<void>;
    });

type MaskedFieldProps = {
  id: string;
  label: string;
  fieldClass: string;
  touchInput: string;
  required?: boolean;
};

type CurrencyFieldProps = MaskedFieldProps & {
  lang: AppLanguage;
  valueCentsDigits: string;
  onChange: (digits: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function CurrencyField({
  id,
  label,
  fieldClass,
  touchInput,
  lang,
  valueCentsDigits,
  onChange,
  inputRef,
  required = true,
}: CurrencyFieldProps) {
  const currencyPrefix = lang === "en" ? "$" : "R$";

  return (
    <div className={fieldClass}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3 text-muted-foreground"
          aria-hidden
        >
          <Banknote className="size-4 shrink-0" strokeWidth={2} />
          <span className="text-sm font-semibold tabular-nums text-foreground/80">{currencyPrefix}</span>
        </div>
        <Input
          id={id}
          ref={inputRef}
          required={required}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cn(touchInput, "pl-[4.75rem] tabular-nums")}
          placeholder={currencyInputPlaceholder(lang)}
          value={formatCurrencyInputDisplay(valueCentsDigits, lang)}
          onChange={(e) => onChange(sanitizeCurrencyCentsInput(e.target.value))}
        />
      </div>
    </div>
  );
}

type WeightFieldProps = MaskedFieldProps & {
  lang: AppLanguage;
  weightDigits: string;
  onChange: (digits: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function WeightField({
  id,
  label,
  fieldClass,
  touchInput,
  lang,
  weightDigits,
  onChange,
  inputRef,
  required = true,
}: WeightFieldProps) {
  return (
    <div className={fieldClass}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"
          aria-hidden
        >
          <Scale className="size-4 shrink-0" strokeWidth={2} />
        </div>
        <Input
          id={id}
          ref={inputRef}
          required={required}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cn(touchInput, "pl-10 pr-11 tabular-nums")}
          placeholder={weightInputPlaceholder(lang)}
          value={
            weightDigits
              ? formatFreightWeightAmount(weightDigitsToKg(weightDigits), lang)
              : ""
          }
          onChange={(e) => onChange(sanitizeWeightDigitsInput(e.target.value))}
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-semibold tabular-nums text-foreground/80"
          aria-hidden
        >
          kg
        </span>
      </div>
    </div>
  );
}

export function FreightForm(props: FreightFormProps) {
  const {
    cargoTypes,
    statusTypes = [],
    showStatus = false,
    initial,
    submitLabel,
    isSubmitting = false,
    secondaryAction,
  } = props;
  const cargoFieldsOnly = props.cargoFieldsOnly === true;
  const onSubmit = props.onSubmit;

  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const valueInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const [cargoType_id, setCargoTypeId] = useState(
    String(initial?.cargoType_id ?? "")
  );
  const [freightName, setFreightName] = useState(initial?.name?.trim() ?? "");
  const [origin_label, setOriginLabel] = useState(initial?.origin_label ?? "");
  const [origin_lat, setOriginLat] = useState(
    initial?.origin_lat != null ? String(initial.origin_lat) : ""
  );
  const [origin_lng, setOriginLng] = useState(
    initial?.origin_lng != null ? String(initial.origin_lng) : ""
  );
  const [destination_label, setDestinationLabel] = useState(
    initial?.destination_label ?? ""
  );
  const [destination_lat, setDestinationLat] = useState(
    initial?.destination_lat != null ? String(initial.destination_lat) : ""
  );
  const [destination_lng, setDestinationLng] = useState(
    initial?.destination_lng != null ? String(initial.destination_lng) : ""
  );
  const [valueCentsDigits, setValueCentsDigits] = useState(
    initial?.originalValue != null && Number.isFinite(initial.originalValue)
      ? amountToCentsDigits(initial.originalValue)
      : ""
  );
  const [weightDigits, setWeightDigits] = useState(
    initial?.weight != null && Number.isFinite(initial.weight)
      ? kgToWeightDigits(initial.weight)
      : ""
  );
  const [daysLimit, setDaysLimit] = useState(
    initial?.daysLimit != null ? String(initial.daysLimit) : ""
  );
  const [status_id, setStatusId] = useState(
    initial?.status_id != null ? String(initial.status_id) : ""
  );

  useEffect(() => {
    if (!initial) return;
    /* Sincroniza o formulário quando `initial` chega da API (ex.: edição de frete). */
    /* eslint-disable react-hooks/set-state-in-effect */
    setCargoTypeId(
      initial.cargoType_id != null ? String(initial.cargoType_id) : ""
    );
    setFreightName(initial.name != null ? String(initial.name).trim() : "");
    setValueCentsDigits(
      initial.originalValue != null && Number.isFinite(initial.originalValue)
        ? amountToCentsDigits(initial.originalValue)
        : ""
    );
    setWeightDigits(
      initial.weight != null && Number.isFinite(initial.weight)
        ? kgToWeightDigits(initial.weight)
        : ""
    );
    setDaysLimit(
      initial.daysLimit != null ? String(initial.daysLimit) : ""
    );
    setStatusId(
      initial.status_id != null ? String(initial.status_id) : ""
    );
    if (cargoFieldsOnly) return;
    setOriginLabel(initial.origin_label ?? "");
    setOriginLat(
      initial.origin_lat != null ? String(initial.origin_lat) : ""
    );
    setOriginLng(
      initial.origin_lng != null ? String(initial.origin_lng) : ""
    );
    setDestinationLabel(initial.destination_label ?? "");
    setDestinationLat(
      initial.destination_lat != null ? String(initial.destination_lat) : ""
    );
    setDestinationLng(
      initial.destination_lng != null ? String(initial.destination_lng) : ""
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initial, cargoFieldsOnly]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    valueInputRef.current?.setCustomValidity("");
    weightInputRef.current?.setCustomValidity("");

    const cid = Number(cargoType_id);
    const val = centsDigitsToAmount(valueCentsDigits);
    const wkg = weightDigitsToKg(weightDigits);
    const dl = daysLimit.trim() ? Number(daysLimit) : undefined;
    const sid = status_id.trim() ? Number(status_id) : undefined;

    if (Number.isNaN(val) || val <= 0) {
      valueInputRef.current?.setCustomValidity(t("pages.freightForm.invalidOriginalValue"));
      valueInputRef.current?.reportValidity();
      return;
    }
    if (Number.isNaN(wkg) || wkg <= 0) {
      weightInputRef.current?.setCustomValidity(t("pages.freightForm.invalidWeight"));
      weightInputRef.current?.reportValidity();
      return;
    }
    if (cargoFieldsOnly) {
      const body: FreightCargoStepBody = {
        cargoType_id: cid,
        name: freightName.trim(),
        originalValue: val,
        weight: wkg,
      };
      if (dl !== undefined && !Number.isNaN(dl)) body.daysLimit = dl;
      if (showStatus && sid !== undefined && !Number.isNaN(sid)) {
        body.status_id = sid;
      }
      const submitCargo = onSubmit as (b: FreightCargoStepBody) => Promise<void>;
      await submitCargo(body);
      return;
    }

    const olat = Number(origin_lat);
    const olng = Number(origin_lng);
    const dlat = Number(destination_lat);
    const dlng = Number(destination_lng);

    const body: FreightCreateBody = {
      cargoType_id: cid,
      name: freightName.trim(),
      origin_label: origin_label.trim(),
      origin_lat: olat,
      origin_lng: olng,
      destination_label: destination_label.trim(),
      destination_lat: dlat,
      destination_lng: dlng,
      originalValue: val,
      weight: wkg,
    };
    if (dl !== undefined && !Number.isNaN(dl)) body.daysLimit = dl;
    if (showStatus && sid !== undefined && !Number.isNaN(sid)) {
      body.status_id = sid;
    }
    const submitFull = onSubmit as (b: FreightCreateBody) => Promise<void>;
    await submitFull(body);
  }

  const field =
    "flex min-w-0 flex-col gap-1.5 md:col-span-1 [&_input]:rounded-lg [&_select]:rounded-lg";
  const touchInput = "min-h-11 touch-manipulation md:min-h-9";
  const selectClass =
    "flex w-full min-w-0 min-h-11 touch-manipulation rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 md:min-h-9 md:py-1 md:text-sm";

  const cargoSectionShell =
    "rounded-xl border border-border/80 bg-muted/25 p-4 shadow-sm md:col-span-2";
  const sectionTitle =
    "mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4"
    >
      {cargoFieldsOnly ? (
        <>
          <div className={cargoSectionShell}>
            <p className={sectionTitle}>{t("pages.freightForm.sectionMain")}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={`${field} md:col-span-2`}>
                <Label htmlFor="freight-name">{t("pages.freightForm.freightName")}</Label>
                <Input
                  id="freight-name"
                  required
                  maxLength={255}
                  autoComplete="off"
                  className={touchInput}
                  value={freightName}
                  onChange={(e) => setFreightName(e.target.value)}
                  placeholder={t("pages.freightForm.freightNamePlaceholder")}
                />
              </div>
              <div className={field}>
                <CargoTypePicker
                  cargoTypes={cargoTypes}
                  value={cargoType_id}
                  onChange={setCargoTypeId}
                  required
                  disabled={isSubmitting}
                  selectClassName={selectClass}
                />
              </div>
              {showStatus ? (
                <div className={field}>
                  <Label htmlFor="freight-status">{t("pages.freightForm.status")}</Label>
                  <select
                    id="freight-status"
                    value={status_id}
                    onChange={(e) => setStatusId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">{t("pages.freightForm.selectStatus")}</option>
                    {statusTypes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          <div className={cargoSectionShell}>
            <p className={sectionTitle}>{t("pages.freightForm.sectionAmounts")}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CurrencyField
                id="freight-value"
                label={t("pages.freightForm.originalValue")}
                fieldClass={field}
                touchInput={touchInput}
                lang={lang}
                valueCentsDigits={valueCentsDigits}
                onChange={setValueCentsDigits}
                inputRef={valueInputRef}
              />
              <WeightField
                id="freight-weight"
                label={t("pages.freightForm.weightKg")}
                fieldClass={field}
                touchInput={touchInput}
                lang={lang}
                weightDigits={weightDigits}
                onChange={setWeightDigits}
                inputRef={weightInputRef}
              />
              <div className={`${field} md:col-span-2`}>
                <Label htmlFor="freight-days">{t("pages.freightForm.daysLimit")}</Label>
                <Input
                  id="freight-days"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="—"
                  className={touchInput}
                  value={daysLimit}
                  onChange={(e) => setDaysLimit(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-[1] mt-4 flex flex-col gap-3 border-t border-border/80 bg-card/95 pt-3 pb-1 backdrop-blur-sm supports-[backdrop-filter]:bg-card/85 md:static md:mt-1 md:border-t-0 md:bg-transparent md:pt-0 md:backdrop-blur-none md:col-span-2 md:flex-row md:flex-wrap">
            <Button
              type="submit"
              disabled={isSubmitting || cargoTypes.length === 0}
              className="min-h-11 w-full rounded-lg bg-brand-green text-white hover:bg-brand-green-dark md:min-h-9 md:w-auto"
            >
              {submitLabel}
            </Button>
            {secondaryAction ? (
              <Button
                type="button"
                variant="outline"
                disabled={secondaryAction.disabled ?? isSubmitting}
                onClick={secondaryAction.onClick}
                className="min-h-11 w-full rounded-lg md:min-h-9 md:w-auto"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className={`${field} md:col-span-2`}>
            <Label htmlFor="freight-name-full">{t("pages.freightForm.freightName")}</Label>
            <Input
              id="freight-name-full"
              required
              maxLength={255}
              autoComplete="off"
              className={touchInput}
              value={freightName}
              onChange={(e) => setFreightName(e.target.value)}
              placeholder={t("pages.freightForm.freightNamePlaceholder")}
            />
          </div>
          <div className={field}>
            <CargoTypePicker
              cargoTypes={cargoTypes}
              value={cargoType_id}
              onChange={setCargoTypeId}
              required
              disabled={isSubmitting}
              selectClassName={selectClass}
            />
          </div>

          {showStatus ? (
            <div className={field}>
              <Label htmlFor="freight-status">{t("pages.freightForm.status")}</Label>
              <select
                id="freight-status"
                value={status_id}
                onChange={(e) => setStatusId(e.target.value)}
                className={selectClass}
              >
                <option value="">{t("pages.freightForm.selectStatus")}</option>
                {statusTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={`${field} md:col-span-2`}>
            <Label htmlFor="freight-origin-label">{t("pages.freightForm.originLabel")}</Label>
            <Input
              id="freight-origin-label"
              required
              className={touchInput}
              value={origin_label}
              onChange={(e) => setOriginLabel(e.target.value)}
            />
          </div>
          <div className={field}>
            <Label htmlFor="freight-origin-lat">{t("pages.freightForm.originLat")}</Label>
            <Input
              id="freight-origin-lat"
              required
              type="number"
              step="any"
              className={touchInput}
              value={origin_lat}
              onChange={(e) => setOriginLat(e.target.value)}
            />
          </div>
          <div className={field}>
            <Label htmlFor="freight-origin-lng">{t("pages.freightForm.originLng")}</Label>
            <Input
              id="freight-origin-lng"
              required
              type="number"
              step="any"
              className={touchInput}
              value={origin_lng}
              onChange={(e) => setOriginLng(e.target.value)}
            />
          </div>

          <div className={`${field} md:col-span-2`}>
            <Label htmlFor="freight-dest-label">{t("pages.freightForm.destinationLabel")}</Label>
            <Input
              id="freight-dest-label"
              required
              className={touchInput}
              value={destination_label}
              onChange={(e) => setDestinationLabel(e.target.value)}
            />
          </div>
          <div className={field}>
            <Label htmlFor="freight-dest-lat">{t("pages.freightForm.destinationLat")}</Label>
            <Input
              id="freight-dest-lat"
              required
              type="number"
              step="any"
              className={touchInput}
              value={destination_lat}
              onChange={(e) => setDestinationLat(e.target.value)}
            />
          </div>
          <div className={field}>
            <Label htmlFor="freight-dest-lng">{t("pages.freightForm.destinationLng")}</Label>
            <Input
              id="freight-dest-lng"
              required
              type="number"
              step="any"
              className={touchInput}
              value={destination_lng}
              onChange={(e) => setDestinationLng(e.target.value)}
            />
          </div>

          <CurrencyField
            id="freight-value-full"
            label={t("pages.freightForm.originalValue")}
            fieldClass={field}
            touchInput={touchInput}
            lang={lang}
            valueCentsDigits={valueCentsDigits}
            onChange={setValueCentsDigits}
            inputRef={valueInputRef}
          />
          <WeightField
            id="freight-weight-full"
            label={t("pages.freightForm.weightKg")}
            fieldClass={field}
            touchInput={touchInput}
            lang={lang}
            weightDigits={weightDigits}
            onChange={setWeightDigits}
            inputRef={weightInputRef}
          />
          <div className={field}>
            <Label htmlFor="freight-days">{t("pages.freightForm.daysLimit")}</Label>
            <Input
              id="freight-days"
              type="number"
              min={1}
              step={1}
              placeholder="—"
              className={touchInput}
              value={daysLimit}
              onChange={(e) => setDaysLimit(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 pt-1 md:col-span-2 md:flex-row md:flex-wrap md:pt-0">
            <Button
              type="submit"
              disabled={isSubmitting || cargoTypes.length === 0}
              className="min-h-11 w-full rounded-lg bg-brand-green text-white hover:bg-brand-green-dark md:min-h-9 md:w-auto"
            >
              {submitLabel}
            </Button>
            {secondaryAction ? (
              <Button
                type="button"
                variant="outline"
                disabled={secondaryAction.disabled ?? isSubmitting}
                onClick={secondaryAction.onClick}
                className="min-h-11 w-full rounded-lg md:min-h-9 md:w-auto"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </form>
  );
}
