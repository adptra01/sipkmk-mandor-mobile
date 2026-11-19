import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

test.describe('Pemakaian', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/sync/usages', async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    await login(page);
  });

  test('halaman pemakaian tampil setelah login', async ({ page }) => {
    await page.goto('/pemakaian');
    await expect(page.getByText('Catat Pemakaian Material')).toBeVisible();
  });

  test('form memiliki field proyek, gudang, tujuan, material', async ({ page }) => {
    await page.goto('/pemakaian');
    await expect(page.getByTestId('project-select')).toBeVisible();
    await expect(page.getByTestId('warehouse-input')).toBeVisible();
    await expect(page.getByTestId('dest-type-select')).toBeVisible();
    await expect(page.getByTestId('material-select').first()).toBeVisible();
  });

  test('isi form & simpan muncul di daftar antrean dengan status Menunggu', async ({ page }) => {
    await page.goto('/pemakaian');
    await expect(page.getByRole('option', { name: /Proyek Perumahan Demo/ })).toBeAttached();

    await page.getByTestId('project-select').selectOption('1');
    await page.getByTestId('dest-id-input').fill('1');
    await expect(page.getByRole('option', { name: /Semen/ })).toBeAttached();
    await page.getByTestId('material-select').first().selectOption('1');
    await page.getByTestId('qty-input').first().fill('2');

    await page.getByRole('button', { name: /Simpan ke Antrean/ }).click();
    await expect(page.getByText(/Tersimpan\. Menunggu sinkronisasi\./)).toBeVisible();
    await expect(page.getByText('Menunggu').first()).toBeVisible();
  });
});
