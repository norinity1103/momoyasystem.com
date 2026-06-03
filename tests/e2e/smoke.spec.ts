import { test, expect } from "@playwright/test";

// 公開サイトの最低限の健全性（smoke）。R002 品質ゲート準拠。
test.describe("smoke", () => {
  test("トップが200系で表示される", async ({ page }) => {
    const res = await page.goto("/");
    expect(res).toBeTruthy();
    expect(res!.status()).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
  });

  test("titleが設定されている", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });

  test("内部リンクが存在する", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("a[href]").count()).toBeGreaterThan(0);
  });
});
