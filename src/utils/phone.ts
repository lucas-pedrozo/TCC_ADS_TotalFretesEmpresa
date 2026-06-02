import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

import type { SelectOption } from "@/components/custom/inputs/SelectDefault";
import { DEFAULT_COUNTRY } from "@/utils/address";

type PhoneCountryOption = {
  value: string;
  label: string;
  country: CountryCode;
  countryCode: string;
};

export type PhoneParts = {
  phoneCountryCode: string;
  phoneNumber: string;
  e164: string;
  country?: CountryCode;
  isValid: boolean;
};

const PHONE_COUNTRY_OPTIONS: PhoneCountryOption[] = [
  { value: "BR", label: "Brasil (+55)", country: "BR", countryCode: "55" },
  { value: "US", label: "Estados Unidos (+1)", country: "US", countryCode: "1" },
  { value: "PT", label: "Portugal (+351)", country: "PT", countryCode: "351" },
];

const DEFAULT_PHONE_COUNTRY = DEFAULT_COUNTRY as CountryCode;
const MAX_PHONE_DIGITS = 15;
const MAX_PHONE_COUNTRY_CODE_DIGITS = 3;

export const PHONE_COUNTRY_CODE_OPTIONS: SelectOption[] = PHONE_COUNTRY_OPTIONS.map(
  ({ countryCode, label }) => ({
    value: countryCode,
    label,
  })
);

export const DEFAULT_PHONE_COUNTRY_CODE =
  PHONE_COUNTRY_OPTIONS.find((option) => option.country === DEFAULT_PHONE_COUNTRY)?.countryCode ??
  "55";

function normalizeDigits(value: string, maxDigits: number) {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

export function normalizeInternationalPhoneInput(value: string) {
  const trimmed = value.trim();
  const digits = normalizeDigits(trimmed, MAX_PHONE_DIGITS);

  if (!digits) return "";

  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function normalizePhoneCountryCodeInput(value: string) {
  return normalizeDigits(value ?? "", MAX_PHONE_COUNTRY_CODE_DIGITS);
}

export function formatPhoneCountryCode(value: string) {
  const normalized = normalizePhoneCountryCodeInput(value);
  return normalized ? `+${normalized}` : "";
}

export function getPhoneCountryOptionByCountry(country?: string | null) {
  const normalizedCountry = (country ?? "").trim().toUpperCase();
  return PHONE_COUNTRY_OPTIONS.find((option) => option.country === normalizedCountry);
}

export function getPhoneCountryOptionByCountryCode(countryCode: string) {
  const normalizedCountryCode = normalizePhoneCountryCodeInput(countryCode);
  return PHONE_COUNTRY_OPTIONS.find((option) => option.countryCode === normalizedCountryCode);
}

export function getDefaultPhoneCountryCodeByCountry(country?: string | null) {
  return getPhoneCountryOptionByCountry(country)?.countryCode ?? DEFAULT_PHONE_COUNTRY_CODE;
}

function getAllowedNationalDigits(countryCode: string) {
  const normalizedCountryCode = normalizePhoneCountryCodeInput(countryCode);

  if (!normalizedCountryCode) return MAX_PHONE_DIGITS;

  return Math.max(MAX_PHONE_DIGITS - normalizedCountryCode.length, 0);
}

export function normalizePhoneNationalNumberInput(value: string, countryCode = "") {
  return normalizeDigits(value ?? "", getAllowedNationalDigits(countryCode));
}

export function buildPhoneE164(phoneCountryCode: string, phoneNumber: string) {
  const normalizedCountryCode = normalizePhoneCountryCodeInput(phoneCountryCode);
  const normalizedPhoneNumber = normalizePhoneNationalNumberInput(phoneNumber, normalizedCountryCode);

  if (!normalizedCountryCode || !normalizedPhoneNumber) return "";

  return `+${normalizedCountryCode}${normalizedPhoneNumber}`;
}

function toPhoneParts(parsed: NonNullable<ReturnType<typeof parsePhoneNumberFromString>>): PhoneParts {
  return {
    phoneCountryCode: parsed.countryCallingCode,
    phoneNumber: parsed.nationalNumber,
    e164: parsed.number,
    country: parsed.country,
    isValid: parsed.isValid(),
  };
}

function getFallbackPhoneParts(rawValue: string, fallbackCountry: string): PhoneParts {
  const digits = normalizeDigits(rawValue, MAX_PHONE_DIGITS);

  if (!digits) {
    return {
      phoneCountryCode: "",
      phoneNumber: "",
      e164: "",
      isValid: false,
    };
  }

  const fallbackCountryCode = getDefaultPhoneCountryCodeByCountry(fallbackCountry);
  const fallbackOption = getPhoneCountryOptionByCountryCode(fallbackCountryCode);

  if (digits.startsWith(fallbackCountryCode) && digits.length > fallbackCountryCode.length) {
    const phoneNumber = normalizePhoneNationalNumberInput(
      digits.slice(fallbackCountryCode.length),
      fallbackCountryCode
    );

    return {
      phoneCountryCode: fallbackCountryCode,
      phoneNumber,
      e164: buildPhoneE164(fallbackCountryCode, phoneNumber),
      country: fallbackOption?.country,
      isValid: false,
    };
  }

  const phoneNumber = normalizePhoneNationalNumberInput(digits, fallbackCountryCode);

  return {
    phoneCountryCode: fallbackCountryCode,
    phoneNumber,
    e164: buildPhoneE164(fallbackCountryCode, phoneNumber),
    country: fallbackOption?.country,
    isValid: false,
  };
}

export function parsePhoneParts(rawValue: string, fallbackCountry: string = DEFAULT_PHONE_COUNTRY): PhoneParts {
  const trimmed = rawValue.trim();
  const normalizedInternational = normalizeInternationalPhoneInput(trimmed);
  const digits = normalizeDigits(trimmed, MAX_PHONE_DIGITS);

  if (!digits) {
    return {
      phoneCountryCode: "",
      phoneNumber: "",
      e164: "",
      isValid: false,
    };
  }

  if (trimmed.startsWith("+")) {
    const parsedInternational = parsePhoneNumberFromString(normalizedInternational);

    if (parsedInternational?.isValid()) {
      return toPhoneParts(parsedInternational);
    }
  } else {
    const parsedMissingPlus = parsePhoneNumberFromString(`+${digits}`);

    if (parsedMissingPlus?.isValid()) {
      return toPhoneParts(parsedMissingPlus);
    }

    const fallbackOption = getPhoneCountryOptionByCountry(fallbackCountry);
    const parsedNational = parsePhoneNumberFromString(
      digits,
      fallbackOption?.country ?? DEFAULT_PHONE_COUNTRY
    );

    if (parsedNational?.isValid()) {
      return toPhoneParts(parsedNational);
    }
  }

  return getFallbackPhoneParts(digits, fallbackCountry);
}

export function validatePhoneParts(phoneCountryCode: string, phoneNumber: string) {
  const e164 = buildPhoneE164(phoneCountryCode, phoneNumber);

  if (!e164) return false;

  const parsed = parsePhoneNumberFromString(e164);
  return parsed?.isValid() ?? false;
}

export function maskPhoneNationalNumber(value: string, phoneCountryCode: string) {
  const normalizedPhoneNumber = normalizePhoneNationalNumberInput(value, phoneCountryCode);

  if (!normalizedPhoneNumber) return "";

  const e164 = buildPhoneE164(phoneCountryCode, normalizedPhoneNumber);
  const parsed = e164 ? parsePhoneNumberFromString(e164) : undefined;

  if (parsed?.isValid()) {
    return parsed.formatNational();
  }

  const option = getPhoneCountryOptionByCountryCode(phoneCountryCode);

  if (option) {
    return new AsYouType(option.country).input(normalizedPhoneNumber);
  }

  return normalizedPhoneNumber;
}

export function formatPhoneNumberForDisplay(
  value: string,
  fallbackCountry: string = DEFAULT_PHONE_COUNTRY
) {
  const parsedParts = parsePhoneParts(value, fallbackCountry);

  if (!parsedParts.phoneCountryCode && !parsedParts.phoneNumber) return "";

  const parsed = parsedParts.e164 ? parsePhoneNumberFromString(parsedParts.e164) : undefined;

  if (parsed) {
    return parsed.formatInternational();
  }

  if (parsedParts.e164) {
    return new AsYouType().input(parsedParts.e164);
  }

  return [
    formatPhoneCountryCode(parsedParts.phoneCountryCode),
    maskPhoneNationalNumber(parsedParts.phoneNumber, parsedParts.phoneCountryCode),
  ]
    .filter(Boolean)
    .join(" ");
}
