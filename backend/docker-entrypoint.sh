#!/bin/sh
set -e

# Aplica las migraciones pendientes antes de arrancar el servidor.
# Desactivable con RUN_MIGRATIONS=false (p. ej. si se ejecutan en CI/CD).
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "▶ Aplicando migraciones de Prisma..."
  npx prisma migrate deploy
fi

exec "$@"
