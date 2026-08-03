#!/bin/sh

set -eu

cd /var/www/html

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

if [ "${LARAVEL_OPTIMIZE:-true}" = "true" ]; then
    echo "Optimizing Laravel..."

    php artisan optimize
fi

php artisan migrate

exec "$@"
