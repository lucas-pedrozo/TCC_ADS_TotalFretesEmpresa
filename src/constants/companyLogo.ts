export const COMPANY_LOGO_WIDTH = 200;
export const COMPANY_LOGO_HEIGHT = 83;
export const COMPANY_LOGO_ASPECT = COMPANY_LOGO_WIDTH / COMPANY_LOGO_HEIGHT;
export const COMPANY_LOGO_MIME = "image/png";
export const COMPANY_LOGO_MAX_BYTES = 5 * 1024 * 1024;

export const COMPANY_LOGO_ACCEPTED_SOURCE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const COMPANY_LOGO_ACCEPT_ATTR =
  "image/png,image/jpeg,image/webp,image/gif";

/** Superfície clara/neutra para logos PNG (incl. fundo transparente) com bom contraste. */
export const companyLogoSurfaceClassName =
  "border border-border/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-border dark:bg-zinc-950 dark:ring-white/10";
