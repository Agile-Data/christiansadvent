import { test, expect } from '@playwright/test';
test('profile menu shows identity and sign out as its last action', async ({ page }) => {
  await page.route('**/auth/profile', r => r.fulfill({ json: { sub: 'profile-test', name: 'Test User', email: 'test@example.com' } }));
  await page.route('**/api/v1/profile/avatar', r => r.fulfill({ json: { avatar: '' } }));
  await page.route('**/api/v1/advent/calendars', r => r.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open profile menu' }).click();
  await expect(page.getByText('test@example.com')).toBeVisible();
  await expect(page.getByRole('menuitem',{name:'Profile',exact:true})).toHaveAttribute('href','/profile');
  await expect(page.getByRole('menuitem').last()).toHaveText('Sign out');
  await expect(page.getByRole('menuitem').last()).toHaveAttribute('href', '/auth/logout');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open profile menu' })).toBeFocused();
});
test('anonymous users have no account menu', async ({ page }) => {
  await page.route('**/auth/profile', r => r.fulfill({ status: 401 }));
  await page.route('**/api/v1/advent/calendars', r => r.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Christmas, together.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open profile menu' })).toHaveCount(0);
});
