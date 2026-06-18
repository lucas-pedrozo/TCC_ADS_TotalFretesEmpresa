import { expect, type Page } from "@playwright/test";

export async function expectAnyVisible(page: Page, testIds: string[]) {
  await expect
    .poll(
      async () => {
        for (const testId of testIds) {
          if ((await page.getByTestId(testId).count()) > 0) return true;
        }
        return false;
      },
      { timeout: 15_000 }
    )
    .toBeTruthy();
}
