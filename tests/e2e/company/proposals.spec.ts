import { expect, test } from "@playwright/test";

import { loginAsCompany } from "../helpers/auth";
import { loadE2EEnv } from "../helpers/env";
import { expectAnyVisible } from "../helpers/ui";

loadE2EEnv();

test.describe("Empresa - Proposals", () => {
  test("navega e filtra propostas por status", async ({ page }) => {
    await loginAsCompany(page);

    await page.getByTestId("sidebar-nav-proposals").click();
    await expect(page.getByTestId("proposals-page")).toBeVisible();

    await page.getByTestId("proposals-search-input").fill("frete");
    await page.getByTestId("proposals-filter-trigger").click();
    await page.getByTestId("proposals-filter-status").selectOption("enviada");

    const clearFilterButton = page.getByTestId("proposals-filter-clear");
    if (await clearFilterButton.isEnabled()) {
      await clearFilterButton.click();
    }

    await expectAnyVisible(page, ["proposals-list", "proposals-empty-state"]);
  });

  test("exibe controles de paginação após abrir propostas", async ({ page }) => {
    await loginAsCompany(page);

    await page.getByTestId("sidebar-nav-proposals").click();
    await expect(page.getByTestId("proposals-page")).toBeVisible();

    await expect(page.getByTestId("proposals-pagination-prev")).toBeVisible();
    await expect(page.getByTestId("proposals-pagination-next")).toBeVisible();
  });
});
