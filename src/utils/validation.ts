import { z } from "zod";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { isValidPhoneNumber } from "libphonenumber-js";

// @param email - user@exemplo.com
export const validateEmail = (email: string): boolean => {
  return z.email().safeParse(email).success;
};

// @param password - must be at least 6 characters
export const validatePassword = (password: string): boolean => {
  return z.string().min(6).safeParse(password).success;
};

// @param phone - (00) 00000-0000 or 00000-0000
export const validatePhone = (phone: string): boolean => {
  return isValidPhoneNumber(phone, "BR");
};

// @param date - must be in ISO format (YYYY-MM-DD)
export const validateDate = (date: string): boolean => {
  return z.iso.date().safeParse(date).success;
};

// @param cpf - 000.000.000-00 or 00000000000
export const validateCPF = (value: string): boolean => {
  return cpf.isValid(value);
};

// @param cnpj - 00.000.000/0000-00 or 00000000000000
export const validateCNPJ = (value: string): boolean => {
  return cnpj.isValid(value);
};