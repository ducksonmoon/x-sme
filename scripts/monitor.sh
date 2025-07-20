#!/bin/bash

# X-SME Production Monitoring Script
# This script monitors the health of all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="x-sme"
DOCKER_COMPOSE_FILE="docker-compose.yml"
LOG_FILE="monitoring.log"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check Docker services
check_docker_services() {
    print_info "Checking Docker services..."
    
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        print_error "Some Docker services are not running"
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps
        log_message "ERROR: Docker services check failed"
        return 1
    fi
    
    print_status "All Docker services are running"
    log_message "INFO: Docker services check passed"
}

# Function to check database connectivity
check_database() {
    print_info "Checking database connectivity..."
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U x_sme_user > /dev/null 2>&1; then
        print_status "Database is accessible"
        log_message "INFO: Database connectivity check passed"
    else
        print_error "Database is not accessible"
        log_message "ERROR: Database connectivity check failed"
        return 1
    fi
}

# Function to check Redis connectivity
check_redis() {
    print_info "Checking Redis connectivity..."
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli --raw incr ping > /dev/null 2>&1; then
        print_status "Redis is accessible"
        log_message "INFO: Redis connectivity check passed"
    else
        print_error "Redis is not accessible"
        log_message "ERROR: Redis connectivity check failed"
        return 1
    fi
}

# Function to check API health
check_api_health() {
    print_info "Checking API health..."
    
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        print_status "API health check passed"
        log_message "INFO: API health check passed"
    else
        print_error "API health check failed (HTTP $response)"
        log_message "ERROR: API health check failed with HTTP $response"
        return 1
    fi
}

# Function to check frontend health
check_frontend_health() {
    print_info "Checking frontend health..."
    
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        print_status "Frontend health check passed"
        log_message "INFO: Frontend health check passed"
    else
        print_error "Frontend health check failed (HTTP $response)"
        log_message "ERROR: Frontend health check failed with HTTP $response"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    print_info "Checking disk space..."
    
    local usage
    usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        print_status "Disk space is adequate ($usage% used)"
        log_message "INFO: Disk space check passed ($usage% used)"
    else
        print_warning "Disk space is running low ($usage% used)"
        log_message "WARNING: Disk space is running low ($usage% used)"
    fi
}

# Function to check memory usage
check_memory_usage() {
    print_info "Checking memory usage..."
    
    local usage
    usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$usage" -lt 80 ]; then
        print_status "Memory usage is normal ($usage% used)"
        log_message "INFO: Memory usage check passed ($usage% used)"
    else
        print_warning "Memory usage is high ($usage% used)"
        log_message "WARNING: Memory usage is high ($usage% used)"
    fi
}

# Function to check container resource usage
check_container_resources() {
    print_info "Checking container resource usage..."
    
    local containers
    containers=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q)
    
    for container in $containers; do
        local stats
        stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" "$container" | tail -1)
        
        if [ -n "$stats" ]; then
            local cpu_usage
            cpu_usage=$(echo "$stats" | awk '{print $2}' | sed 's/%//')
            local mem_usage
            mem_usage=$(echo "$stats" | awk '{print $3}' | sed 's/%//')
            
            if [ "$cpu_usage" -gt 80 ] || [ "$mem_usage" -gt 80 ]; then
                print_warning "Container $container: CPU $cpu_usage%, Memory $mem_usage%"
                log_message "WARNING: Container $container high resource usage - CPU $cpu_usage%, Memory $mem_usage%"
            else
                print_status "Container $container: CPU $cpu_usage%, Memory $mem_usage%"
            fi
        fi
    done
}

# Function to check log files for errors
check_logs() {
    print_info "Checking recent logs for errors..."
    
    local error_count
    error_count=$(docker-compose -f "$DOCKER_COMPOSE_FILE" logs --since="1h" 2>/dev/null | grep -i "error\|exception\|fatal" | wc -l)
    
    if [ "$error_count" -eq 0 ]; then
        print_status "No errors found in recent logs"
        log_message "INFO: No errors found in recent logs"
    else
        print_warning "Found $error_count errors in recent logs"
        log_message "WARNING: Found $error_count errors in recent logs"
        
        # Show recent errors
        echo "Recent errors:"
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs --since="1h" 2>/dev/null | grep -i "error\|exception\|fatal" | tail -5
    fi
}

# Function to check backup status
check_backups() {
    print_info "Checking backup status..."
    
    local backup_dir="server/backups"
    local latest_backup
    
    if [ -d "$backup_dir" ]; then
        latest_backup=$(find "$backup_dir" -name "db_backup_*.sql" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [ -n "$latest_backup" ]; then
            local backup_age
            backup_age=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 3600 ))
            
            if [ "$backup_age" -lt 25 ]; then
                print_status "Recent backup found (${backup_age}h ago)"
                log_message "INFO: Recent backup found (${backup_age}h ago)"
            else
                print_warning "Backup is old (${backup_age}h ago)"
                log_message "WARNING: Backup is old (${backup_age}h ago)"
            fi
        else
            print_warning "No database backups found"
            log_message "WARNING: No database backups found"
        fi
    else
        print_warning "Backup directory not found"
        log_message "WARNING: Backup directory not found"
    fi
}

# Function to generate system report
generate_report() {
    print_info "Generating system report..."
    
    echo "=== X-SME System Report ===" > system_report.txt
    echo "Generated: $(date)" >> system_report.txt
    echo "" >> system_report.txt
    
    echo "=== Docker Services ===" >> system_report.txt
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps >> system_report.txt
    echo "" >> system_report.txt
    
    echo "=== System Resources ===" >> system_report.txt
    df -h >> system_report.txt
    echo "" >> system_report.txt
    free -h >> system_report.txt
    echo "" >> system_report.txt
    
    echo "=== Container Resources ===" >> system_report.txt
    docker stats --no-stream >> system_report.txt
    echo "" >> system_report.txt
    
    echo "=== Recent Logs ===" >> system_report.txt
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --since="1h" | tail -50 >> system_report.txt
    
    print_status "System report generated: system_report.txt"
}

# Function to send alert (placeholder for integration with monitoring services)
send_alert() {
    local message="$1"
    local level="$2"
    
    # Placeholder for alert integration
    # You can integrate with services like:
    # - Email notifications
    # - Slack webhooks
    # - SMS services
    # - Monitoring platforms (Prometheus, Grafana, etc.)
    
    log_message "ALERT [$level]: $message"
    echo "ALERT [$level]: $message"
}

# Main monitoring function
main() {
    local exit_code=0
    
    print_info "Starting X-SME monitoring check..."
    log_message "INFO: Starting monitoring check"
    
    # Run all checks
    check_docker_services || exit_code=1
    check_database || exit_code=1
    check_redis || exit_code=1
    check_api_health || exit_code=1
    check_frontend_health || exit_code=1
    check_disk_space
    check_memory_usage
    check_container_resources
    check_logs
    check_backups
    
    # Generate report
    generate_report
    
    # Summary
    if [ $exit_code -eq 0 ]; then
        print_status "All critical checks passed"
        log_message "INFO: All critical checks passed"
    else
        print_error "Some critical checks failed"
        log_message "ERROR: Some critical checks failed"
        send_alert "X-SME monitoring detected issues" "ERROR"
    fi
    
    return $exit_code
}

# Handle script arguments
case "${1:-}" in
    "report")
        generate_report
        ;;
    "logs")
        check_logs
        ;;
    "resources")
        check_container_resources
        ;;
    "health")
        check_api_health
        check_frontend_health
        ;;
    *)
        main
        ;;
esac 