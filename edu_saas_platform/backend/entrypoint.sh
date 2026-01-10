#!/bin/sh

# Wait for Database to start
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."
    # ✅ FIX: Use POSTGRES_HOST and POSTGRES_PORT (matches docker-compose.yml)
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 0.1
    done
    echo "PostgreSQL started"
fi

# Auto-run Migrations
echo "Running Shared Migrations..."
python manage.py migrate_schemas --shared
echo "Running Tenant Migrations..."
python manage.py migrate_schemas --tenant

# Collect Static Files
python manage.py collectstatic --noinput

# Start Server
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3