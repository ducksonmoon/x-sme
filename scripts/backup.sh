#!/bin/bash

# Database and file backup script for X-SME
# This script creates backups of the database and uploads directory

set -e

# Configuration
BACKUP_DIR="/backups"
DB_NAME="x_sme_db"
DB_USER="x_sme_user"
DB_HOST="postgres"
UPLOADS_DIR="/app/uploads"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# Database backup
echo "Creating database backup..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --format=custom --compress=9 > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# File backup (if uploads directory exists)
if [ -d "$UPLOADS_DIR" ]; then
    echo "Creating uploads backup..."
    tar -czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" -C "$UPLOADS_DIR" .
else
    echo "Uploads directory not found, skipping file backup"
fi

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully at $(date)"
echo "Backup files:"
ls -la "$BACKUP_DIR"/*"$TIMESTAMP"* 