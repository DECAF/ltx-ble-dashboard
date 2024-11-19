FROM php:8.2-apache

LABEL org.opencontainers.image.source='https://github.com/DECAF/ltx-ble-dashboard'
LABEL org.opencontainers.image.url='https://decaf.de'
LABEL org.opencontainers.image.vendor='DECAF'

RUN usermod --shell /bin/bash www-data
RUN mkdir -p /var/www/html
RUN chown -R www-data.www-data /var/www
RUN chmod -R 775 /var/www

USER www-data

COPY --chown=www-data:www-data . /var/www/html

ENV HISTCONTROL="ignoredups"