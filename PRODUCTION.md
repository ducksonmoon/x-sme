# X-SME Production Deployment Guide

This guide will help you deploy the X-SME application to production using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git
- At least 4GB RAM and 20GB disk space
- Domain name (for SSL certificates)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd x-sme
   ```

2. **Set up environment variables**

   ```bash
   cp env.production .env
   # Edit .env with your production values
   ```

3. **Deploy the application**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

## Detailed Setup

### 1. Environment Configuration

Copy the production environment template and configure it:

```bash
cp env.production .env
```

**Important variables to configure:**

- `JWT_SECRET`: Generate a strong random string (at least 32 characters)
- `JWT_REFRESH_SECRET`: Generate another strong random string
- `ALLOWED_ORIGINS`: Your domain(s) for CORS
- `DATABASE_URL`: PostgreSQL connection string
- Payment gateway credentials (Pasargad, Saman, Zarinpal)
- SMS service credentials
- Email configuration

**Generate secure secrets:**

```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

### 2. SSL Certificates

For production, you need proper SSL certificates. You can use Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $USER:$USER nginx/ssl/
```

### 3. Database Setup

The application uses PostgreSQL. The Docker setup will create the database automatically:

**Automatic Database Creation:**

- The PostgreSQL container automatically creates the `x_sme_db` database on first startup
- Database schema is created when Prisma migrations run
- No manual database creation required

**Database Creation Timeline:**

```bash
# 1. Database container starts → x_sme_db created automatically
docker-compose up -d postgres

# 2. Wait for database readiness (health check)
# 3. Run migrations → Schema created
docker-compose exec server npx prisma migrate deploy

# 4. Optional: Seed data
docker-compose exec server npm run db:seed
```

**External Database (Optional):**
If using an external database, update DATABASE_URL in .env:

```bash
DATABASE_URL=postgresql://username:password@your-db-host:5432/x_sme_db?schema=public
```

### 4. Payment Gateway Setup

Configure your payment gateways in the `.env` file:

**Pasargad Bank:**

- Get merchant ID and terminal ID from Pasargad
- Generate private key and place it in `server/keys/pasargad-private-key.pem`
- Update callback URLs

**Saman Bank:**

- Get merchant ID from Saman
- Update callback URLs

**Zarinpal:**

- Get merchant ID from Zarinpal
- Set `ZARINPAL_SANDBOX=false` for production

### 5. SMS Service Setup

Configure SMS service for notifications:

**Melipayamak:**

```
SMS_PROVIDER=melipayamak
MELIPAYAMAK_USERNAME=your-username
MELIPAYAMAK_PASSWORD=your-password
MELIPAYAMAK_FROM_NUMBER=your-sender-number
```

**Alternative providers:**

- Kavenegar: Set `KAVENEGAR_API_KEY`
- Ghasedak: Set `GHASEDAK_API_KEY`

### 6. Email Configuration

Set up email for notifications:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com
```

## Deployment

### Using the Deployment Script

```bash
# Full deployment
./scripts/deploy.sh

# Check status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs

# Stop services
./scripts/deploy.sh stop

# Restart services
./scripts/deploy.sh restart

# Create backup
./scripts/deploy.sh backup
```

### Manual Deployment

```bash
# Build and start services
docker-compose up -d --build

# Run database migrations
docker-compose exec server npx prisma migrate deploy

# Seed database (optional)
docker-compose exec server npm run db:seed

# Check deployment status
docker-compose ps
```

### Production Build Configuration

The application includes optimized production builds:

**Frontend:**

- Production-optimized Vite configuration (`vite.config.production.ts`)
- Code splitting and tree shaking
- Console.log removal and minification
- Optimized bundle sizes with manual chunking

**Backend:**

- Production-ready Docker configuration
- Optimized Node.js settings
- Health checks and graceful shutdown
- Security headers and rate limiting

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:

- Frontend: `http://your-domain.com/health`
- API: `http://your-domain.com/api/health`
- Server: `http://your-domain.com:3001/health`

You can also use the monitoring script:

```bash
./scripts/monitor.sh
```

### Logs

View application logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f nginx
```

### Backups

Automatic backups are configured to run daily at 2 AM. Manual backups:

```bash
# Using deployment script
./scripts/deploy.sh backup

# Using monitoring script
./scripts/monitor.sh

# Direct backup
docker-compose run --rm backup
```

Backup files are stored in `server/backups/` with automatic cleanup after 30 days.

### Updates

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec server npx prisma migrate deploy
```

## Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT tokens
- Rotate secrets regularly
- Use environment-specific configurations

### SSL/TLS

- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers
- Use secure cipher suites

### Database Security

- Use strong database passwords
- Limit database access to application servers
- Enable SSL for database connections
- Regular security updates

### Application Security

- Keep dependencies updated
- Enable rate limiting
- Configure proper CORS policies
- Use security headers
- Monitor for vulnerabilities

## Performance Optimization

### Caching

- Redis is configured for session storage and caching
- Static assets are cached with long expiration
- API responses can be cached where appropriate

### Database Optimization

- Regular database maintenance
- Monitor query performance
- Use database indexes
- Regular backups

### CDN

Consider using a CDN for static assets:

```bash
# Configure CDN in nginx
location /static/ {
    proxy_pass https://your-cdn.com;
}
```

## Troubleshooting

### Common Issues

1. **Database connection failed**

   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **SSL certificate errors**

   - Check certificate paths in nginx/ssl/
   - Verify certificate validity
   - Check file permissions

3. **Payment gateway errors**

   - Verify merchant credentials
   - Check callback URLs
   - Test in sandbox mode first

4. **SMS/Email not working**
   - Verify service credentials
   - Check network connectivity
   - Review service logs

### Debug Mode

For troubleshooting, you can enable debug mode:

```bash
# In .env
DEBUG=true
LOG_LEVEL=debug
```

### Support

For additional support:

1. Check application logs
2. Review Docker container logs
3. Verify environment configuration
4. Test individual services

## Scaling

### Horizontal Scaling

To scale the application:

```bash
# Scale server instances
docker-compose up -d --scale server=3

# Use load balancer
# Configure nginx upstream with multiple server instances
```

### Database Scaling

- Consider read replicas for heavy read workloads
- Use connection pooling
- Monitor database performance

### Monitoring

The application includes comprehensive monitoring capabilities:

```bash
# Full system health check
./scripts/monitor.sh

# Generate system report
./scripts/monitor.sh report

# Check resource usage
./scripts/monitor.sh resources

# View recent logs
./scripts/monitor.sh logs

# Health check only
./scripts/monitor.sh health
```

Monitor for:

- Application performance
- Database metrics
- Server resources
- Error rates
- Response times
- Container resource usage
- Backup status

## Backup and Recovery

### Automated Backups

Backups are automatically created daily and stored for 30 days by default.

### Manual Recovery

To restore from backup:

```bash
# Stop services
docker-compose down

# Restore database
docker-compose exec postgres pg_restore -U x_sme_user -d x_sme_db backup_file.sql

# Restore files
tar -xzf uploads_backup_file.tar.gz -C server/uploads/

# Restart services
docker-compose up -d

# Verify restoration
./scripts/monitor.sh health
```

## Maintenance Schedule

- **Daily**: Monitor logs and health checks using `./scripts/monitor.sh`
- **Weekly**: Review performance metrics and system reports
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Full security audit and backup verification
- **Annually**: Infrastructure review and planning

### Automated Tasks

The system includes automated maintenance:

- Daily backups at 2 AM
- Automatic log rotation
- Health check monitoring
- Resource usage tracking
