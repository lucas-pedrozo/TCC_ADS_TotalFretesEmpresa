export const SIGNUP_PAYMENT_TOKEN_KEY = "signupPaymentToken";

export function setPaymentToken(token: string) {
  sessionStorage.setItem(SIGNUP_PAYMENT_TOKEN_KEY, token);
}

export function getPaymentToken() {
  return sessionStorage.getItem(SIGNUP_PAYMENT_TOKEN_KEY);
}

export function clearPaymentToken() {
  sessionStorage.removeItem(SIGNUP_PAYMENT_TOKEN_KEY);
}

export function hasPaymentToken() {
  return Boolean(getPaymentToken());
}
