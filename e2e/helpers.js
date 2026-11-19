export const BACKEND = 'curious-lime-sloth.101-50-1-74.cpanel.site';

export async function setupTechCookie(page) {
  await page.context().addCookies([
    { name: 'cpanel_tech_domain', value: '1', domain: BACKEND, path: '/' },
  ]);
}

export async function login(page, email = 'mandor@sipkmk.local', password = 'password') {
  await setupTechCookie(page);
  await page.goto('/');
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL('/');
  await page.getByText('Mandor Lapangan').first().waitFor();
}
