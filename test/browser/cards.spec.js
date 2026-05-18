// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Conversation Starter Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with title', async ({ page }) => {
    await expect(page).toHaveTitle('Conversation Starter Cards');
    await expect(page.locator('h1')).toHaveText('Conversation Starter Cards');
  });

  test('draw button shows a question', async ({ page }) => {
    await page.click('#draw-btn');
    // Wait for fade-in animation
    await page.waitForTimeout(500);

    const questionText = await page.locator('#question-text').textContent();
    expect(questionText).toBeTruthy();
    expect(questionText.length).toBeGreaterThan(10);

    const categoryLabel = await page.locator('#category-label').textContent();
    expect(categoryLabel).toBeTruthy();
  });

  test('space key draws a new card', async ({ page }) => {
    // First draw
    await page.click('#draw-btn');
    await page.waitForTimeout(500);
    const firstQuestion = await page.locator('#question-text').textContent();

    // Draw several times with space to ensure we get a different question
    let gotDifferent = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      const newQuestion = await page.locator('#question-text').textContent();
      if (newQuestion !== firstQuestion) {
        gotDifferent = true;
        break;
      }
    }
    expect(gotDifferent).toBe(true);
  });

  test('category filter populates options', async ({ page }) => {
    const options = page.locator('#category-filter option');
    // "All Categories" + at least 10 real categories
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(11);

    // First option is "All Categories"
    await expect(options.first()).toHaveText('All Categories');
  });

  test('category filter restricts questions', async ({ page }) => {
    // Select a specific category
    await page.selectOption('#category-filter', { index: 1 });
    await page.waitForTimeout(500);

    const category = await page.locator('#category-label').textContent();

    // Draw multiple cards - all should be from the same category
    for (let i = 0; i < 5; i++) {
      await page.click('#draw-btn');
      await page.waitForTimeout(400);
      await expect(page.locator('#category-label')).toHaveText(category);
    }
  });

  test('card has fade animation classes', async ({ page }) => {
    await page.click('#draw-btn');

    // During animation, card should have fade-out class briefly
    // After animation, should have fade-in
    await page.waitForTimeout(500);
    await expect(page.locator('#card')).toHaveClass(/fade-in/);
  });

  test('full page screenshot', async ({ page }) => {
    // Draw a card first
    await page.click('#draw-btn');
    await page.waitForTimeout(600);

    await page.screenshot({ path: 'screenshots/full-page.png', fullPage: true });
  });

  test('mobile viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('#draw-btn');
    await page.waitForTimeout(600);

    await page.screenshot({ path: 'screenshots/mobile.png', fullPage: true });
  });
});
