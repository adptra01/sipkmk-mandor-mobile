import { test, expect } from '@playwright/test';
import { setupTechCookie } from './helpers.js';

test('halaman login tampil dengan form email & password', async ({ page }) => {
  await setupTechCookie(page);
  await page.goto('/');
  await expect(page.getByTestId('email-input')).toBeVisible();
  await expect(page.getByTestId('password-input')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
});

test('login kredensial salah menampilkan pesan error', async ({ page }) => {
  await setupTechCookie(page);
  await page.goto('/');
  await page.getByTestId('email-input').fill('mandor@sipkmk.local');
  await page.getByTestId('password-input').fill('salah');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByText(/Kredensial tidak valid/)).toBeVisible();
});

test('login kredensial benar redirect ke home dan tampil nama user', async ({ page }) => {
  await setupTechCookie(page);
  await page.goto('/');
  await page.getByTestId('email-input').fill('mandor@sipkmk.local');
  await page.getByTestId('password-input').fill('password');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL('/');
  await expect(page.getByText('Mandor Lapangan').first()).toBeVisible();
});

test('logout kembali ke login', async ({ page }) => {
  await setupTechCookie(page);
  await page.goto('/');
  await page.getByTestId('email-input').fill('mandor@sipkmk.local');
  await page.getByTestId('password-input').fill('password');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL('/');
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
});
