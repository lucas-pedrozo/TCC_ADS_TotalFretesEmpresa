import type { MapPinValue } from "@/components/maps/AddressMapPicker";
import type { FreightCargoStepBody, FreightCreateBody } from "@/types/freight";

export type CompanyAddressSeed = {
  country?: string | null;
  cep?: string | null;
  street?: string | null;
  district?: string | null;
  number?: string | null;
  city?: string | null;
  state?: string | null;
};

export function formatCompanyAddressLine(c: CompanyAddressSeed | null): string | null {
  if (!c) return null;
  try {
    const rawCep = c.cep != null ? String(c.cep) : "";
    const cepDigits = rawCep.replace(/\D/g, "");
    const cepFormatted =
      cepDigits.length === 8
        ? `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`
        : rawCep.trim();
    const street = c.street != null ? String(c.street).trim() : "";
    const number = c.number != null ? String(c.number).trim() : "";
    const line1 = street && number ? `${street}, ${number}` : street || number || "";
    const district = c.district != null ? String(c.district).trim() : "";
    const city = c.city != null ? String(c.city).trim() : "";
    const state = c.state != null ? String(c.state).trim() : "";
    const cityState = [city, state].filter(Boolean).join(", ");
    const countryCode = (c.country ?? "BR").trim().toUpperCase();
    const countryLabel = countryCode === "BR" ? "Brazil" : countryCode;
    const core = [line1, district, cityState, cepFormatted]
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (core.length === 0) return null;
    const s = [...core, countryLabel].join(", ");
    return s.length > 2 ? s : null;
  } catch {
    return null;
  }
}

export function isValidMapPin(v: MapPinValue | null): v is MapPinValue {
  if (!v?.label?.trim()) return false;
  return (
    Number.isFinite(v.lat) &&
    Number.isFinite(v.lng) &&
    v.lat >= -90 &&
    v.lat <= 90 &&
    v.lng >= -180 &&
    v.lng <= 180
  );
}

export function isSameMapPin(a: MapPinValue | null, b: MapPinValue | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.label === b.label && a.lat === b.lat && a.lng === b.lng;
}

export function buildFreightCreateBody(
  cargo: FreightCargoStepBody,
  origin: MapPinValue,
  destination: MapPinValue
): FreightCreateBody {
  return {
    ...cargo,
    origin_label: origin.label.trim(),
    origin_lat: origin.lat,
    origin_lng: origin.lng,
    destination_label: destination.label.trim(),
    destination_lat: destination.lat,
    destination_lng: destination.lng,
  };
}
