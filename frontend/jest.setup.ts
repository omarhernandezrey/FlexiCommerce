import '@testing-library/jest-dom';
import { configureAxe } from 'jest-axe';

// Configurar jest-axe para usar las reglas de WCAG 2.1 AA
configureAxe({
  rules: {
    // Desactivar reglas que requieren contexto de página completa
    region: { enabled: false },
  },
});
