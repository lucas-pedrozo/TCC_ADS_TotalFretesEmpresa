import { maskCnpjInRfb2229 } from '@/utils/cnpjInRfb2229'
import {
  formatPhoneNumberForDisplay,
  parsePhoneParts,
  normalizeInternationalPhoneInput,
} from '@/utils/phone'

export const normalizePhoneInput = normalizeInternationalPhoneInput

export const normalizePhoneDigits = (value: string) => {
  const normalizedInput = normalizePhoneInput(value)
  return normalizedInput.replace(/\D/g, '')
}

export const normalizePhoneForStorage = (value: string) => {
  return parsePhoneParts(value).e164 || normalizePhoneInput(value)
}

export const maskPhone = formatPhoneNumberForDisplay

export const maskCnpj = (value: string) => maskCnpjInRfb2229(value ?? '')

export const maskCep = (value: string) => {
  const digits = normalizeCepInput(value);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const maskEmail = (value: string) => {
  return value.trim().toLowerCase().replace(/\s/g, '');
};

export const maskUf = (value: string) => {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const normalizeCpfInput = (value: string) => onlyDigits(value).slice(0, 11);

export const maskCpf = (value: string) => {
  const digits = normalizeCpfInput(value);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const normalizeCnhInput = (value: string) => onlyDigits(value).slice(0, 11);

export const maskCnhNumber = (value: string) => normalizeCnhInput(value);

export const normalizeBrazilianPhoneInput = (value: string) => onlyDigits(value).slice(0, 11);

export const maskBrazilianPhone = (value: string) => {
  const digits = normalizeBrazilianPhoneInput(value);

  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const normalizeCepInput = (value: string) => onlyDigits(value).slice(0, 8);

export const normalizePlateInput = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);

export const maskPlate = (value: string) => {
  const raw = normalizePlateInput(value);
  if (raw.length <= 3) return raw;
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
};
