import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CargoTypeDto,
  FreightCreateBody,
  FreightStatusTypeDto,
} from "@/types/freight";

export type FreightFormProps = {
  cargoTypes: CargoTypeDto[];
  statusTypes?: FreightStatusTypeDto[];
  showStatus?: boolean;
  initial?: Partial<FreightCreateBody> & { status_id?: number | null };
  onSubmit: (body: FreightCreateBody) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
};

export function FreightForm({
  cargoTypes,
  statusTypes = [],
  showStatus = false,
  initial,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: FreightFormProps) {
  const { t } = useTranslation();
  const [cargoType_id, setCargoTypeId] = useState(
    String(initial?.cargoType_id ?? "")
  );
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
  const [originalValue, setOriginalValue] = useState(
    initial?.originalValue != null ? String(initial.originalValue) : ""
  );
  const [weight, setWeight] = useState(
    initial?.weight != null ? String(initial.weight) : ""
  );
  const [daysLimit, setDaysLimit] = useState(
    initial?.daysLimit != null ? String(initial.daysLimit) : ""
  );
  const [status_id, setStatusId] = useState(
    initial?.status_id != null ? String(initial.status_id) : ""
  );

  useEffect(() => {
    if (!initial) return;
    setCargoTypeId(
      initial.cargoType_id != null ? String(initial.cargoType_id) : ""
    );
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
    setOriginalValue(
      initial.originalValue != null ? String(initial.originalValue) : ""
    );
    setWeight(initial.weight != null ? String(initial.weight) : "");
    setDaysLimit(
      initial.daysLimit != null ? String(initial.daysLimit) : ""
    );
    setStatusId(
      initial.status_id != null ? String(initial.status_id) : ""
    );
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cid = Number(cargoType_id);
    const olat = Number(origin_lat);
    const olng = Number(origin_lng);
    const dlat = Number(destination_lat);
    const dlng = Number(destination_lng);
    const val = Number(originalValue);
    const wkg = Number(weight);
    const dl = daysLimit.trim() ? Number(daysLimit) : undefined;
    const sid = status_id.trim() ? Number(status_id) : undefined;

    const body: FreightCreateBody = {
      cargoType_id: cid,
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
    await onSubmit(body);
  }

  const field =
    "flex min-w-0 flex-col gap-1.5 sm:col-span-1 [&_input]:rounded-lg [&_select]:rounded-lg";

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className={field}>
        <Label htmlFor="freight-cargo-type">{t("pages.freightForm.cargoType")}</Label>
        <select
          id="freight-cargo-type"
          required
          value={cargoType_id}
          onChange={(e) => setCargoTypeId(e.target.value)}
          className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <option value="">{t("pages.freightForm.selectCargoType")}</option>
          {cargoTypes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {showStatus ? (
        <div className={field}>
          <Label htmlFor="freight-status">{t("pages.freightForm.status")}</Label>
          <select
            id="freight-status"
            value={status_id}
            onChange={(e) => setStatusId(e.target.value)}
            className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
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

      <div className={field + " sm:col-span-2"}>
        <Label htmlFor="freight-origin-label">{t("pages.freightForm.originLabel")}</Label>
        <Input
          id="freight-origin-label"
          required
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
          value={origin_lng}
          onChange={(e) => setOriginLng(e.target.value)}
        />
      </div>

      <div className={field + " sm:col-span-2"}>
        <Label htmlFor="freight-dest-label">{t("pages.freightForm.destinationLabel")}</Label>
        <Input
          id="freight-dest-label"
          required
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
          value={destination_lng}
          onChange={(e) => setDestinationLng(e.target.value)}
        />
      </div>

      <div className={field}>
        <Label htmlFor="freight-value">{t("pages.freightForm.originalValue")}</Label>
        <Input
          id="freight-value"
          required
          type="number"
          min={0}
          step="0.01"
          value={originalValue}
          onChange={(e) => setOriginalValue(e.target.value)}
        />
      </div>
      <div className={field}>
        <Label htmlFor="freight-weight">{t("pages.freightForm.weightKg")}</Label>
        <Input
          id="freight-weight"
          required
          type="number"
          min={0.01}
          step="any"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <div className={field}>
        <Label htmlFor="freight-days">{t("pages.freightForm.daysLimit")}</Label>
        <Input
          id="freight-days"
          type="number"
          min={1}
          step={1}
          placeholder="—"
          value={daysLimit}
          onChange={(e) => setDaysLimit(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button
          type="submit"
          disabled={isSubmitting || cargoTypes.length === 0}
          className="rounded-lg bg-brand-green text-white hover:bg-brand-green-dark"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
