# X-SME Backend API

A comprehensive backend API for the X-SME Localized Booking & Payment Widget, designed for Iranian SMEs including beauty salons, clinics, and language institutes.

## 🚀 Features

### Core Functionality

- **Real-time Availability Management** - Dynamic slot generation and conflict detection
- **Multi-Gateway Payment Processing** - Support for Pasargad, Saman, and Zarinpal
- **Automated Reminders** - SMS and Telegram notifications with retry logic
- **Role-based Authentication** - Admin, Business Owner, and Staff roles
- **Advanced Analytics** - Business insights, trends, and performance metrics

### Enhanced Features

- **Cron Job Management** - Automated tasks for reminders, slot generation, and cleanup
- **Comprehensive Logging** - Structured logging with Winston and file rotation
- **Rate Limiting** - API protection with configurable limits
- **Health Monitoring** - System health checks and status monitoring
- **Data Validation** - Input validation with express-validator and Joi
- **Error Handling** - Centralized error handling with detailed logging

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Logging**: Winston with file rotation
- **Scheduling**: node-cron
- **Validation**: express-validator, Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for caching)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to server directory
cd server

# Run the automated setup script
npm run setup
```

The setup script will:

- Create necessary directories
- Install dependencies
- Generate Prisma client
- Run database migrations
- Create default admin user
- Create sample data
- Run tests

### 2. Environment Configuration

Copy the environment example and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your actual configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/x_sme_db"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Payment Gateways
PASARGAD_MERCHANT_ID=your-pasargad-merchant-id
SAMAN_MERCHANT_ID=your-saman-merchant-id
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id

# SMS Service
SMS_PROVIDER=melipayamak
MELIPAYAMAK_USERNAME=your-username
MELIPAYAMAK_PASSWORD=your-password

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📊 API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+989123456789"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Business Management

#### Create Business

```http
POST /api/businesses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Beauty Salon",
  "description": "Professional beauty services",
  "phone": "+989123456789",
  "email": "info@beautysalon.com",
  "address": "Tehran, Iran"
}
```

#### Get Business

```http
GET /api/businesses/:id
```

### Booking Management

#### Create Booking

```http
POST /api/bookings
Content-Type: application/json

{
  "businessId": "business-id",
  "serviceId": "service-id",
  "customerName": "Customer Name",
  "customerPhone": "+989123456789",
  "customerEmail": "customer@example.com",
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "totalAmount": 150000
}
```

#### Get Business Bookings

```http
GET /api/bookings/business/:businessId
Authorization: Bearer <token>
```

### Payment Processing

#### Initiate Payment

```http
POST /api/payments/initiate
Content-Type: application/json

{
  "bookingId": "booking-id",
  "amount": 150000,
  "gateway": "ZARINPAL"
}
```

#### Verify Payment

```http
POST /api/payments/verify
Content-Type: application/json

{
  "paymentId": "payment-id",
  "gateway": "ZARINPAL",
  "transactionId": "transaction-id"
}
```

### Admin Routes

#### System Overview

```http
GET /api/admin/overview
Authorization: Bearer <admin-token>
```

#### Manage Businesses

```http
GET /api/admin/businesses
PATCH /api/admin/businesses/:id/status
Authorization: Bearer <admin-token>
```

### Analytics

#### Business Dashboard

```http
GET /api/analytics/dashboard/:businessId
Authorization: Bearer <token>
```

#### Booking Trends

```http
GET /api/analytics/trends/:businessId?period=7d
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables

| Variable                       | Description                    | Default                 |
| ------------------------------ | ------------------------------ | ----------------------- |
| `NODE_ENV`                     | Environment mode               | `development`           |
| `PORT`                         | Server port                    | `3001`                  |
| `DATABASE_URL`                 | PostgreSQL connection string   | -                       |
| `JWT_SECRET`                   | JWT signing secret             | -                       |
| `JWT_EXPIRES_IN`               | JWT expiration time            | `7d`                    |
| `ALLOWED_ORIGINS`              | CORS allowed origins           | `http://localhost:3000` |
| `RATE_LIMIT_MAX_REQUESTS`      | Rate limit requests per window | `100`                   |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Auth rate limit                | `5`                     |

### Payment Gateway Configuration

#### Pasargad Bank

```env
PASARGAD_MERCHANT_ID=your-merchant-id
PASARGAD_TERMINAL_ID=your-terminal-id
PASARGAD_PRIVATE_KEY_PATH=./keys/pasargad-private-key.pem
PASARGAD_CALLBACK_URL=https://your-domain.com/api/payments/pasargad/callback
```

#### Saman Bank

```env
SAMAN_MERCHANT_ID=your-merchant-id
SAMAN_CALLBACK_URL=https://your-domain.com/api/payments/saman/callback
```

#### Zarinpal

```env
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_CALLBACK_URL=https://your-domain.com/api/payments/zarinpal/callback
ZARINPAL_SANDBOX=true
```

## 📁 Project Structure

```
server/
├── src/
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # Authentication & authorization
│   │   ├── errorHandler.js # Error handling
│   │   └── notFound.js     # 404 handler
│   ├── routes/             # API routes
│   │   ├── admin.js        # Admin endpoints
│   │   ├── analytics.js    # Analytics endpoints
│   │   ├── bookings.js     # Booking management
│   │   ├── businesses.js   # Business management
│   │   ├── payments.js     # Payment processing
│   │   ├── services.js     # Service management
│   │   └── availability.js # Availability management
│   ├── services/           # Business logic
│   │   ├── cronService.js  # Scheduled tasks
│   │   ├── paymentService.js # Payment processing
│   │   ├── reminderService.js # Notification service
│   │   └── slotService.js  # Time slot management
│   ├── utils/              # Utilities
│   │   └── logger.js       # Logging configuration
│   ├── tests/              # Test files
│   └── index.js            # Main server file
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   └── setup.js            # Setup script
├── logs/                   # Log files
├── uploads/                # File uploads
├── backups/                # Database backups
└── keys/                   # SSL/encryption keys
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- integration.test.js
```

## 📊 Monitoring

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "cronStatus": {
    "reminderProcessing": {
      "running": true,
      "lastRun": "2024-01-15T10:25:00.000Z",
      "nextRun": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Logs

```bash
# View combined logs
npm run logs:view

# View error logs
npm run logs:error
```

## 🔄 Cron Jobs

The system includes automated cron jobs:

- **Reminder Processing** - Every 5 minutes
- **Slot Generation** - Daily at 2 AM
- **Data Cleanup** - Weekly on Sunday at 3 AM
- **Failed Payment Retry** - Every 10 minutes
- **Health Check** - Every hour

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Authorization** (Admin, Business Owner, Staff)
- **Rate Limiting** with different limits for auth endpoints
- **Input Validation** with express-validator and Joi
- **CORS Protection** with configurable origins
- **Helmet Security Headers**
- **SQL Injection Protection** via Prisma ORM
- **XSS Protection** with content security policy

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**

   - Set `NODE_ENV=production`
   - Configure all required environment variables
   - Use strong JWT secrets

2. **Database**

   - Set up PostgreSQL with proper credentials
   - Run migrations: `npm run db:migrate`
   - Create database indexes for performance

3. **Security**

   - Configure CORS origins
   - Set up SSL/TLS certificates
   - Configure firewall rules
   - Set up monitoring and alerting

4. **Performance**
   - Enable compression
   - Configure Redis for caching (optional)
   - Set up CDN for static assets
   - Configure load balancing

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run db:generate

EXPOSE 3001

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples

## 🔄 Changelog

### v1.0.0

- Initial release with core booking functionality
- Payment gateway integration
- Basic authentication and authorization
- Admin dashboard
- Analytics and reporting
- Automated reminders and cron jobs
- Comprehensive logging and monitoring
