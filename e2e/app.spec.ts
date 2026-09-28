import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when accessing dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should login as student', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'alice.wambui@student.kcau.ac.ke');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should login as technician', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'j.kamau@kcau.ac.ke');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should login as director', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'director@kcau.ac.ke');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('Student Ticket Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'alice.wambui@student.kcau.ac.ke');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create a new ticket', async ({ page }) => {
    await page.goto('/tickets/new');
    await page.fill('input[name="title"]', 'Test Ticket from E2E');
    await page.fill('textarea[name="description"]', 'This is a test ticket created during E2E testing. It should have enough characters to pass validation.');
    await page.selectOption('select[name="category"]', 'HARDWARE');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    await page.fill('input[name="deviceInfo"]', 'Test Device');
    await page.fill('input[name="location"]', 'Test Location');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*tickets\/HD-/);
  });

  test('should view ticket list', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page.locator('text=My Tickets')).toBeVisible();
  });
});

test.describe('Technician Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'j.kamau@kcau.ac.ke');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should view technician queue', async ({ page }) => {
    await page.goto('/tickets?view=queue');
    await expect(page.locator('text=My Queue')).toBeVisible();
  });
});

test.describe('Director Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'director@kcau.ac.ke');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should view director dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should view all tickets', async ({ page }) => {
    await page.goto('/tickets?view=all');
    await expect(page.locator('text=All Tickets')).toBeVisible();
  });

  test('should view user management', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('text=User Management')).toBeVisible();
  });
});