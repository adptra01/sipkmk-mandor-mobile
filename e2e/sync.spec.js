import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

test.describe('Sinkronisasi', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('halaman sinkronisasi tampil', async ({ page }) => {
    await page.goto('/sinkronisasi');
    await expect(page.getByText('Sinkronisasi Data')).toBeVisible();
  });

  test('tombol Sinkronkan Sekarang ada', async ({ page }) => {
    await page.goto('/sinkronisasi');
    await expect(page.getByRole('button', { name: /Sinkronkan Sekarang/ })).toBeVisible();
  });

  test('jumlah antrean pending tampil', async ({ page }) => {
    await page.goto('/sinkronisasi');
    await expect(page.getByText(/Semua Antrean \(\d+\)/)).toBeVisible();
  });
});
