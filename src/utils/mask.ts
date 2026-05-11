import { maskCnpjInRfb2229 } from '@/utils/cnpjInRfb2229'

export const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

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
