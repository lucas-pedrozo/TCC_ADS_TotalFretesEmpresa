import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js'
import { maskCnpjInRfb2229 } from '@/utils/cnpjInRfb2229'

const DEFAULT_PHONE_COUNTRY = 'BR'
const MAX_PHONE_DIGITS = 15

export const normalizePhoneInput = (value: string) => {
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, '').slice(0, MAX_PHONE_DIGITS)

  if (!digits) return ''

  return trimmed.startsWith('+') ? `+${digits}` : digits
}

export const normalizePhoneDigits = (value: string) => {
  const normalizedInput = normalizePhoneInput(value)
  return normalizedInput.replace(/\D/g, '')
}

export const normalizePhoneForStorage = (value: string) => {
  const normalizedInput = normalizePhoneInput(value)

  if (!normalizedInput) return ''

  const parsed = parsePhoneNumberFromString(normalizedInput, DEFAULT_PHONE_COUNTRY)

  if (parsed) {
    return parsed.number.replace(/\D/g, '')
  }

  return normalizePhoneDigits(normalizedInput)
}

export const maskPhone = (value: string) => {
  const normalizedInput = normalizePhoneInput(value)

  if (!normalizedInput) return ''

  const parsed = parsePhoneNumberFromString(normalizedInput, DEFAULT_PHONE_COUNTRY)
  if (parsed) return parsed.formatInternational()

  if (normalizedInput.startsWith('+')) {
    return new AsYouType().input(normalizedInput)
  }

  return new AsYouType(DEFAULT_PHONE_COUNTRY).input(normalizedInput)
}

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
