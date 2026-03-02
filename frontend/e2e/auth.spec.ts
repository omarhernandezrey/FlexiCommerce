import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/auth');

    await page.getByPlaceholder(/email/i).fill('wrong@example.com');
    await page.getByPlaceholder(/contraseña/i).first().fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Debe mostrar mensaje de error
    const errorEl = page.getByRole('alert').or(page.locator('[class*=error]')).first();
    await expect(errorEl).toBeVisible({ timeout: 5000 });
  });

  test('usuario no autenticado puede acceder a /auth', async ({ page }) => {
    await page.goto('/auth');

    // La página de auth debe cargarse para usuarios no autenticados
    await expect(page).toHaveURL('/auth');
    await expect(page.locator('main, form')).toBeVisible();
  });

  test('/auth redirige a / si hay cookie de sesión válida', async ({ page, context }) => {
    // Establecer una cookie de sesión falsa (la protección de middleware verifica la cookie)
    await context.addCookies([
      {
        name: 'auth-token',
        // JWT vacío (header.payload.signature) que decodeBase64 puede parsear
        value: 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiQ1VTVE9NRVIifQ.fake',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/auth');

    // Con cookie de sesión, debe redirigir fuera de /auth
    await expect(page).not.toHaveURL('/auth');
  });
});
