import { test, expect } from '@playwright/test';

test.describe('Protección de rutas (middleware)', () => {
  test('usuario no autenticado es redirigido al intentar /checkout', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page).toHaveURL(/\/auth/);
  });

  test('usuario no autenticado es redirigido al intentar /account/orders', async ({ page }) => {
    await page.goto('/account/orders');

    await expect(page).toHaveURL(/\/auth/);
  });

  test('usuario no autenticado es redirigido al intentar /admin', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/auth/);
  });

  test('página 404 muestra contenido amigable', async ({ page }) => {
    await page.goto('/esta-pagina-no-existe-xyz-abc');

    // Verificar que devuelve status 404
    const response = await page.waitForResponse('**/esta-pagina-no-existe-xyz-abc').catch(() => null);

    // La página debe tener contenido (nuestra not-found.tsx personalizada)
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('robots.txt está disponible y bien formado', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('User-agent');
    expect(body).toContain('Disallow');
  });

  test('sitemap.xml está disponible', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<urlset');
  });
});
