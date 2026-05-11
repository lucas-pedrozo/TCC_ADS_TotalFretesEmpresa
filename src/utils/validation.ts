import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";
import { isValidCnpjInRfb2229 } from "./cnpjInRfb2229";
import { isValidPhoneNumber } from "libphonenumber-js";


// @param name - must be between 2 and 100 characters || example: "João da Silva"
export const validateName = (name: string): boolean => {
  return z.string().min(2).max(100).safeParse(name).success;
}

// @param email - user@exemplo.com
export const validateEmail = (email: string): boolean => {
  return z.email().safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return z.string().min(8).safeParse(password).success;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

// @param phone - (00) 00000-0000
export const validatePhone = (phone: string): boolean => {
  return isValidPhoneNumber(phone, "BR");
};

// @param date - must be in ISO format (YYYY-MM-DD)
export const validateDate = (date: string): boolean => {
  return z.iso.date().safeParse(date).success;
};

export const validateCode = (code: string): boolean => {
  return z.string().regex(/^\d{6}$/).safeParse(code).success;
};

export const validateRequired = (value: string): boolean => {
  return z.string().trim().min(1).safeParse(value).success;
};

export const validateCep = (cep: string): boolean => {
  return z.string().regex(/^\d{8}$/).safeParse(cep).success;
};

export const validateCountry = (country: string): boolean => {
  return z.string().trim().min(2).safeParse(country).success;
};

export const validateCepByCountry = (cep: string, country: string): boolean => {
  if (country === "BR") return validateCep(cep);
  return validateRequired(cep);
};

export const validateUf = (uf: string): boolean => {
  return z.string().regex(/^[A-Z]{2}$/).safeParse(uf).success;
};

// @param cpf - 000.000.000-00 or 00000000000
export const validateCPF = (value: string): boolean => {
  return cpf.isValid(value);
};

// @param cnpj — numérico (legado) ou alfanumérico (IN RFB nº 2.229/2024)
export const validateCNPJ = (value: string): boolean => {
  return isValidCnpjInRfb2229(value);
};