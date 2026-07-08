import { test, expect } from '@playwright/test';

test.describe('ArogyaOS Smoke Tests', () => {
  test('Landing page loads', async ({ page }) => {
    await page.goto('/');
    // Check for some expected content, usually a title or main heading
    await expect(page).toHaveTitle(/Arogya/i);
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    // Check if login form is present
    await expect(page.locator('form')).toBeVisible();
  });

  test('Authentication redirect for dashboard', async ({ page }) => {
    // Unauthenticated user trying to access dashboard should be redirected to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('404 page is handled correctly', async ({ page }) => {
    const response = await page.goto('/some-non-existent-route-12345');
    // Assuming next.js returns 404 for unknown routes
    expect(response?.status()).toBe(404);
  });

  test('AI route accessibility returns 401 for unauthenticated requests', async ({ request }) => {
    // Test that the AI endpoint is protected
    const response = await request.post('/api/ai/chat', {
      data: {}
    });
    expect(response.status()).toBe(401);
  });
});
