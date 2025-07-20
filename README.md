# X-SME - Booking Widget Platform

A comprehensive booking and appointment management platform designed for small and medium enterprises (SMEs) in Iran, featuring a customizable widget that can be embedded on any website.

## 🚀 Features

- **Multi-business Support**: Manage multiple businesses from a single dashboard
- **Customizable Widget**: Embed booking widget on any website
- **Payment Integration**: Support for Iranian payment gateways (Pasargad, Saman, Zarinpal)
- **Staff Management**: Role-based access control and staff scheduling
- **Real-time Notifications**: SMS and email notifications
- **Analytics Dashboard**: Comprehensive business insights
- **Persian Calendar**: Full support for Persian (Jalali) calendar
- **Responsive Design**: Works on all devices
- **API-First Architecture**: RESTful API for integrations

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS + Radix UI
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git
- At least 4GB RAM and 20GB disk space

## 🚀 Quick Start (Development)

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd x-sme
   ```

2. **Set up environment variables**

   ```bash
   cp server/env.example server/.env
   # Edit server/.env with your configuration
   ```

3. **Start development servers**

   ```bash
   # Start backend
   cd server
   npm install
   npm run db:migrate
   npm run db:seed
   npm run dev

   # Start frontend (in another terminal)
   cd client
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database Studio: http://localhost:5555

## 🚀 Production Deployment

For production deployment, see the comprehensive [Production Guide](PRODUCTION.md).

### Quick Production Setup

1. **Configure environment**

   ```bash
   cp env.production .env
   # Edit .env with your production values
   ```

2. **Deploy with Docker**

   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

3. **Monitor the application**
   ```bash
   chmod +x scripts/monitor.sh
   ./scripts/monitor.sh
   ```

## 📁 Project Structure

```
x-sme/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema
│   └── scripts/           # Database scripts
├── nginx/                 # Nginx configuration
├── scripts/               # Deployment scripts
├── docker-compose.yml     # Docker services
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

Key environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# JWT Secrets (generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Payment Gateways
PASARGAD_MERCHANT_ID=your-merchant-id
SAMAN_MERCHANT_ID=your-merchant-id
ZARINPAL_MERCHANT_ID=your-merchant-id

# SMS Service
SMS_PROVIDER=melipayamak
MELIPAYAMAK_USERNAME=your-username
MELIPAYAMAK_PASSWORD=your-password

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Payment Gateway Setup

The platform supports multiple Iranian payment gateways:

1. **Pasargad Bank**: Requires merchant ID, terminal ID, and private key
2. **Saman Bank**: Requires merchant ID
3. **Zarinpal**: Requires merchant ID

### SMS Service Setup

Configure SMS notifications with:

- **Melipayamak**: Username/password authentication
- **Kavenegar**: API key authentication
- **Ghasedak**: API key authentication

## 🛠️ Development

### Available Scripts

**Frontend (client/)**

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:production # Build with production optimizations
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run test             # Run tests
npm run analyze          # Analyze bundle size
```

**Backend (server/)**

```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run test             # Run tests
npm run lint             # Run ESLint
npm run health-check     # Check API health
```

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## 🔒 Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection with helmet
- CSRF protection

## 📊 Monitoring

The application includes comprehensive monitoring:

- Health check endpoints
- Application logging with Winston
- Error tracking and reporting
- Performance monitoring
- Automated backups
- Resource usage tracking

### Monitoring Commands

```bash
# Check system health
./scripts/monitor.sh

# View logs
docker-compose logs -f

# Generate system report
./scripts/monitor.sh report

# Check resource usage
./scripts/monitor.sh resources
```

## 🔄 Backup and Recovery

Automated backups are configured to run daily:

```bash
# Manual backup
./scripts/deploy.sh backup

# Backup files are stored in server/backups/
```

## 🚀 Deployment Options

### Docker Compose (Recommended)

The easiest way to deploy with all services included:

```bash
docker-compose up -d
```

### Manual Deployment

For custom deployment scenarios:

1. **Database**: Set up PostgreSQL
2. **Backend**: Deploy Node.js application
3. **Frontend**: Build and serve static files
4. **Cache**: Set up Redis
5. **Reverse Proxy**: Configure Nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Production Guide](PRODUCTION.md)
2. Review the [Troubleshooting](PRODUCTION.md#troubleshooting) section
3. Check application logs
4. Create an issue on GitHub

## 🔄 Updates

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec server npm run db:migrate:deploy
```

## 📈 Performance

The application is optimized for performance:

- Code splitting and lazy loading
- Static asset optimization
- Database query optimization
- Redis caching
- Gzip compression
- CDN-ready static assets

## 🌐 Internationalization

- Persian (Farsi) language support
- Jalali calendar integration
- RTL layout support
- Localized date/time formatting

---

**X-SME** - Empowering Iranian SMEs with modern booking solutions.
