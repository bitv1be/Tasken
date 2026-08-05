#!/bin/sh

set -eu

php artisan optimize:clear

php artisan optimize

exec "$@"
