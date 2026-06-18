import { expect, test } from "@playwright/test";

import { loginAsCompany } from "../helpers/auth";
import { loadE2EEnv } from "../helpers/env";
import { expectAnyVisible } from "../helpers/ui";

loadE2EEnv();

test.describe("Empresa - History", () => {
  test("navega no histórico e alterna período", async ({ page }) => {
    await loginAsCompany(page);

    await page.goto("/History");
    await expect(page.getByTestId("history-page")).toBeVisible();

    await page.getByTestId("history-period-7d").click();
    await page.getByTestId("history-period-30d").click();
    await expect(page.getByTestId("history-export-button")).toBeVisible();
    await expect(page.getByTestId("history-table-section")).toBeVisible();

    await page.getByTestId("history-table-filter-trigger").click();
    await page.getByTestId("history-table-filter-cargo").selectOption({ index: 0 });

    await expectAnyVisible(page, ["history-table-container", "history-empty-state"]);
  });

  test("permite busca na tabela e exibe paginação do histórico", async ({ page }) => {
    await loginAsCompany(page);

    await page.goto("/History");
    await expect(page.getByTestId("history-page")).toBeVisible();

    await page.getByTestId("history-table-search-input").fill("TF-");
    await expect(page.getByTestId("history-table-pagination-prev")).toBeVisible();
    await expect(page.getByTestId("history-table-pagination-next")).toBeVisible();
  });
});
