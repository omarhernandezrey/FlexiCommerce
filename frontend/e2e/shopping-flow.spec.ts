import { test, expect } from '@playwright/test';

test.describe('Flujo de compra', () => {
  test('página principal carga con contenido principal', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('usuario puede buscar un producto', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('laptop');
    await searchInput.press('Enter');

    // Debe navegar a la página de búsqueda
    await expect(page).toHaveURL(/\/search/);
  });

  test('usuario puede ver el catálogo de productos', async ({ page }) => {
    await page.goto('/products');

    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('carrito redirige a /auth si no está logueado', async ({ page }) => {
    await page.goto('/cart');

    // El middleware debe redirigir a /auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('skip-to-content link está presente para accesibilidad', async ({ page }) => {
    await page.goto('/');

    // Verificar que existe el skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });
});
