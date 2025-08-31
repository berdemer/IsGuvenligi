#!/bin/bash

# Automated Disk Cleanup Script for Database Backup Failure Prevention
# This script prevents "Database Backup Failure" incidents by proactive disk management

set -e

echo "🗑️ Starting Automated Disk Cleanup..."

# Configuration
DISK_WARNING_THRESHOLD=80
DISK_CRITICAL_THRESHOLD=90
BACKUP_DIR="/var/backups/postgresql"
LOG_DIR="/var/log"
TEMP_DIR="/tmp"

# Get current disk usage
CURRENT_DISK_USAGE=$(df / | awk 'NR==2 {print int($5)}')
echo "💾 Current disk usage: ${CURRENT_DISK_USAGE}%"

# Check if cleanup is needed
if [ $CURRENT_DISK_USAGE -lt $DISK_WARNING_THRESHOLD ]; then
    echo "✅ Disk usage is healthy (${CURRENT_DISK_USAGE}% < ${DISK_WARNING_THRESHOLD}%)"
    exit 0
fi

echo "⚠️ Disk usage is ${CURRENT_DISK_USAGE}% - Starting cleanup..."

FREED_SPACE=0

# 1. Clean old backup files (keep last 7 days)
echo "🗂️ Cleaning old backup files..."
if [ -d "$BACKUP_DIR" ]; then
    BEFORE_SIZE=$(du -s "$BACKUP_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar" -mtime +7 -delete 2>/dev/null || true
    AFTER_SIZE=$(du -s "$BACKUP_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    BACKUP_FREED=$((BEFORE_SIZE - AFTER_SIZE))
    FREED_SPACE=$((FREED_SPACE + BACKUP_FREED))
    echo "   Freed: ${BACKUP_FREED}KB from old backups"
fi

# 2. Clean log files (keep last 30 days)
echo "📋 Cleaning old log files..."
if [ -d "$LOG_DIR" ]; then
    BEFORE_SIZE=$(du -s "$LOG_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
    find "$LOG_DIR" -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
    # Truncate large log files instead of deleting
    find "$LOG_DIR" -name "*.log" -size +100M -exec truncate -s 50M {} \; 2>/dev/null || true
    AFTER_SIZE=$(du -s "$LOG_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    LOG_FREED=$((BEFORE_SIZE - AFTER_SIZE))
    FREED_SPACE=$((FREED_SPACE + LOG_FREED))
    echo "   Freed: ${LOG_FREED}KB from old logs"
fi

# 3. Clean temporary files
echo "📁 Cleaning temporary files..."
if [ -d "$TEMP_DIR" ]; then
    BEFORE_SIZE=$(du -s "$TEMP_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    find "$TEMP_DIR" -type f -mtime +1 -delete 2>/dev/null || true
    AFTER_SIZE=$(du -s "$TEMP_DIR" 2>/dev/null | awk '{print $1}' || echo 0)
    TEMP_FREED=$((BEFORE_SIZE - AFTER_SIZE))
    FREED_SPACE=$((FREED_SPACE + TEMP_FREED))
    echo "   Freed: ${TEMP_FREED}KB from temp files"
fi

# 4. Clean Docker unused images and containers
echo "🐳 Cleaning Docker resources..."
if command -v docker >/dev/null 2>&1; then
    BEFORE_SIZE=$(docker system df --format "table {{.Size}}" | tail -n +2 | head -1 | awk '{print $1}' || echo 0)
    docker system prune -f >/dev/null 2>&1 || true
    docker image prune -f >/dev/null 2>&1 || true
    AFTER_SIZE=$(docker system df --format "table {{.Size}}" | tail -n +2 | head -1 | awk '{print $1}' || echo 0)
    echo "   Docker cleanup completed"
fi

# 5. Clean package manager cache
echo "📦 Cleaning package caches..."
if command -v apt-get >/dev/null 2>&1; then
    apt-get clean >/dev/null 2>&1 || true
    echo "   APT cache cleaned"
elif command -v yum >/dev/null 2>&1; then
    yum clean all >/dev/null 2>&1 || true
    echo "   YUM cache cleaned"
fi

# Get final disk usage
FINAL_DISK_USAGE=$(df / | awk 'NR==2 {print int($5)}')
DISK_FREED=$((CURRENT_DISK_USAGE - FINAL_DISK_USAGE))

echo ""
echo "🎯 Cleanup Summary:"
echo "   Total space freed: ${FREED_SPACE}KB (~$((FREED_SPACE / 1024))MB)"
echo "   Disk usage: ${CURRENT_DISK_USAGE}% → ${FINAL_DISK_USAGE}% (${DISK_FREED}% freed)"

# Check if cleanup was sufficient
if [ $FINAL_DISK_USAGE -lt $DISK_WARNING_THRESHOLD ]; then
    echo "✅ Cleanup successful - Disk usage now healthy"
    
    # Update monitoring system
    curl -s -X POST http://localhost:3000/api/monitoring/auto-remediation \
        -H "Content-Type: application/json" \
        -d "{
            \"action\": \"cleanup_disk_space\",
            \"success\": true,
            \"message\": \"Disk cleanup freed ${DISK_FREED}% disk space\",
            \"autoExecute\": true
        }" >/dev/null 2>&1 || true
        
elif [ $FINAL_DISK_USAGE -lt $DISK_CRITICAL_THRESHOLD ]; then
    echo "⚠️ Cleanup helped but disk usage still at warning level"
    echo "💡 Consider manual cleanup of application data"
else
    echo "🚨 CRITICAL: Disk usage still above ${DISK_CRITICAL_THRESHOLD}%"
    echo "🆘 Manual intervention required immediately"
    exit 1
fi

echo ""
echo "📅 Next scheduled cleanup: $(date -d '+1 day' '+%Y-%m-%d %H:%M:%S')"
echo "✅ Disk cleanup completed successfully"