import { expect, test } from "@playwright/test";

import { loginAsCompany } from "../helpers/auth";
import { loadE2EEnv } from "../helpers/env";
import { expectAnyVisible } from "../helpers/ui";

loadE2EEnv();

test.describe("Empresa - Freights", () => {
  test("navega, busca e usa filtros básicos", async ({ page }) => {
    await loginAsCompany(page);

    await page.getByTestId("sidebar-nav-freights").click();
    await expect(page.getByTestId("freights-page")).toBeVisible();

    await page.getByTestId("freights-search-input").fill("teste");
    await page.getByTestId("freights-filter-trigger").click();
    await page.getByTestId("freights-filter-status").selectOption({ index: 0 });
    await page.getByTestId("freights-filter-clear").click();

    await expectAnyVisible(page, ["freights-list", "freights-empty-state"]);
  });

  test("acessa tela de novo frete e mantém paginação disponível", async ({ page }) => {
    await loginAsCompany(page);

    await page.getByTestId("sidebar-nav-freights").click();
    await expect(page.getByTestId("freights-page")).toBeVisible();

    await expect(page.getByTestId("freights-pagination-prev")).toBeVisible();
    await expect(page.getByTestId("freights-pagination-next")).toBeVisible();

    await page.getByTestId("freights-new-button").click();
    await expect(page).toHaveURL(/\/Freights\/new$/);
  });
});
