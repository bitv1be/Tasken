ARG PHP_VERSION=8.5

# -------------------------------------------------------
# Base PHP image
# -------------------------------------------------------
FROM php:${PHP_VERSION}-fpm-alpine AS php-base

WORKDIR /var/www/html

# Runtime libraries + temporary build dependencies
RUN apk add --no-cache \
        icu-libs \
        fcgi \
        libzip \
	    libpq \
        && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libzip-dev \
	postgresql-dev \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        pcntl \
        zip \
    && apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

COPY docker/production.ini \
    /usr/local/etc/php/conf.d/99-production.ini


# -------------------------------------------------------
# Composer dependencies
# -------------------------------------------------------
FROM php-base AS deps

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache

# Сначала копируем только Composer-файлы для кэширования слоя
COPY composer.json composer.lock ./

RUN --mount=type=cache,target=/tmp/composer-cache \
    composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --optimize-autoloader \
        --no-scripts

# Затем исходный код
COPY . .

# Запускает Laravel post-autoload-dump и package discovery
RUN composer dump-autoload \
        --no-dev \
        --optimize \
        --no-interaction


# -------------------------------------------------------
# Production image
# -------------------------------------------------------
FROM php-base AS production

ARG APP_VERSION=dev
ARG APP_COMMIT=unknown
ARG APP_BUILD_TIME=unknown

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    APP_VERSION="${APP_VERSION}" \
    APP_COMMIT="${APP_COMMIT}" \
    APP_BUILD_TIME="${APP_BUILD_TIME}" \
    LARAVEL_OPTIMIZE=true

LABEL org.opencontainers.image.title="Tasken API" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${APP_COMMIT}" \
      org.opencontainers.image.created="${APP_BUILD_TIME}"

COPY --from=deps --chown=www-data:www-data \
    /var/www/html /var/www/html

COPY --chown=www-data:www-data \
    docker/entrypoint.sh /usr/local/bin/docker-entrypoint

RUN chmod +x /usr/local/bin/docker-entrypoint \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data \
        storage \
        bootstrap/cache \
    && chmod -R ug+rwX \
        storage \
        bootstrap/cache

RUN printf '%s\n' \
    '[www]' \
    'ping.path = /ping' \
    'ping.response = pong' \
    > /usr/local/etc/php-fpm.d/zz-healthcheck.conf

USER www-data

EXPOSE 9000

STOPSIGNAL SIGQUIT

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm", "-F"]
