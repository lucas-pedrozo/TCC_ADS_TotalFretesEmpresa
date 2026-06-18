import { expect, type Page } from "@playwright/test";

import { getRequiredEnv } from "./env";

export async function loginAsCompany(page: Page) {
  const email = getRequiredEnv("E2E_COMPANY_EMAIL");
  const password = getRequiredEnv("E2E_COMPANY_PASSWORD");

  await page.goto("/Login");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.getByTestId("auth-email-input").fill(email);
    await page.getByTestId("auth-password-input").fill(password);
    await page.getByTestId("auth-submit-button").click();

    try {
      await expect(page.getByTestId("sidebar-nav-home")).toBeVisible({ timeout: 20_000 });
      return;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
}
