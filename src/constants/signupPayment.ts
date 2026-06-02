export const SIGNUP_PAYMENT_ALLOWED_KEY = "signupPaymentAllowed";

export function setSignupPaymentAllowed() {
  sessionStorage.setItem(SIGNUP_PAYMENT_ALLOWED_KEY, "1");
}

export function clearSignupPaymentAllowed() {
  sessionStorage.removeItem(SIGNUP_PAYMENT_ALLOWED_KEY);
}

export function isSignupPaymentAllowed() {
  return sessionStorage.getItem(SIGNUP_PAYMENT_ALLOWED_KEY) === "1";
}
