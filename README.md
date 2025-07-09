# X-SME Booking & Payment Widget

A localized booking and payment widget designed specifically for Iranian SMEs (beauty salons, clinics, language institutes) with integrated domestic payment gateways.

## Features

- **Real-time Availability**: Show available time slots dynamically
- **Local Payment Gateways**: Integrated support for Pasargad, Saman, and Zarinpal
- **Multi-channel Reminders**: SMS and Telegram notifications
- **Embeddable Widget**: Simple script tag integration
- **Responsive Design**: Works on all devices
- **Multi-language Support**: Persian and English

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Payment**: Pasargad, Saman, Zarinpal APIs
- **Notifications**: SMS and Telegram APIs

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd x-sme
```

2. Install dependencies:

```bash
npm run install:all
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

```bash
npm run db:generate
npm run db:migrate
```

5. Start development servers:

```bash
npm run dev
```

## Widget Integration

Add this script tag to your website:

```html
<script src="https://your-domain.com/widget.js"></script>
<div
  id="x-sme-booking-widget"
  data-business-id="your-business-id"
  data-theme="light"
></div>
```

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xsme_db"

# Payment Gateways
PASARGAD_MERCHANT_ID="your-pasargad-id"
PASARGAD_PRIVATE_KEY="your-private-key"
SAMAN_MERCHANT_ID="your-saman-id"
ZARINPAL_MERCHANT_ID="your-zarinpal-id"

# SMS Gateway
SMS_API_KEY="your-sms-api-key"
SMS_API_URL="https://api.sms-gateway.com"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-bot-token"

# JWT Secret
JWT_SECRET="your-jwt-secret"

# Server
PORT=3001
NODE_ENV=development
```

## API Documentation

### Business Endpoints

- `POST /api/businesses` - Register new business
- `GET /api/businesses/:id` - Get business details
- `PUT /api/businesses/:id` - Update business settings

### Booking Endpoints

- `GET /api/businesses/:id/availability` - Get available slots
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payment Endpoints

- `POST /api/payments/initiate` - Start payment process
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:id/status` - Get payment status

## Project Structure

```
x-sme/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Widget components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Prisma models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
├── shared/                # Shared types and utilities
└── docs/                  # Documentation
```

## Monetization

- **One-time Installation**: 10-20M IRR setup fee
- **Transaction Fee**: Optional 10% on booking fees
- **Premium Features**: Advanced analytics, custom branding

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact:

- Email: support@x-sme.com
- Telegram: @xsme_support
