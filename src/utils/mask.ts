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
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const maskEmail = (value: string) => {
  return value.trim().toLowerCase().replace(/\s/g, '');
};

export const maskUf = (value: string) => {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
};
