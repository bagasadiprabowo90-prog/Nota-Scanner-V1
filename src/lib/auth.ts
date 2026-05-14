export const AUTH_COOKIE = "nota_scanner_session";
export const AUTH_EMAIL_DOMAIN = "@blpbeauty.com";

export function isAllowedEmail(email: string) {
  return email.trim().toLowerCase().endsWith(AUTH_EMAIL_DOMAIN);
}
