FROM php:8.2-cli

# Install dependencies yang dibutuhkan Laravel
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Copy Composer resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install paket composer
RUN composer install --no-dev --optimize-autoloader

# Jalankan database migration otomatis
RUN php artisan migrate --force

EXPOSE 10000

CMD php artisan serve --host 0.0.0.0 --port 10000