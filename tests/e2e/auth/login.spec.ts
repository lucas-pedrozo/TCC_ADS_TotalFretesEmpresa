import { expect, test } from "@playwright/test";

import { getRequiredEnv, loadE2EEnv } from "../helpers/env";

loadE2EEnv();

test.describe("Autenticação empresa", () => {
  test("redireciona para login ao acessar rota privada sem sessão", async ({ page }) => {
    await page.goto("/Home");

    await expect(page).toHaveURL(/\/Login$/);
    await expect(page.getByTestId("auth-submit-button")).toBeVisible();
  });

  test("realiza login com sucesso", async ({ page }) => {
    await page.goto("/Login");

    await page.getByTestId("auth-email-input").fill(getRequiredEnv("E2E_COMPANY_EMAIL"));
    await page.getByTestId("auth-password-input").fill(getRequiredEnv("E2E_COMPANY_PASSWORD"));
    await page.getByTestId("auth-submit-button").click();

    await expect(page.getByTestId("sidebar-nav-home")).toBeVisible({ timeout: 20_000 });
  });

  test("exibe erro para credencial inválida", async ({ page }) => {
    await page.goto("/Login");

    await page.getByTestId("auth-email-input").fill(getRequiredEnv("E2E_COMPANY_EMAIL"));
    await page
      .getByTestId("auth-password-input")
      .fill(process.env.E2E_INVALID_PASSWORD ?? "credencial-invalida");
    await page.getByTestId("auth-submit-button").click();

    await expect(page).toHaveURL(/\/Login$/);
    await expect(page.getByTestId("auth-submit-button")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-home")).toHaveCount(0);
  });

  test("realiza logout após login", async ({ page }) => {
    await page.goto("/Login");

    await page.getByTestId("auth-email-input").fill(getRequiredEnv("E2E_COMPANY_EMAIL"));
    await page.getByTestId("auth-password-input").fill(getRequiredEnv("E2E_COMPANY_PASSWORD"));
    await page.getByTestId("auth-submit-button").click();
    await expect(page.getByTestId("sidebar-logout-button")).toBeVisible({ timeout: 20_000 });

    await page.getByTestId("sidebar-logout-button").click();

    await expect(page).toHaveURL(/\/Login$/);
    await expect(page.getByTestId("auth-submit-button")).toBeVisible();
  });
});
