const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../index');

const prisma = new PrismaClient();

describe('X-SME Backend Integration Tests', () => {
  let adminToken;
  let businessOwnerToken;
  let testBusiness;
  let testUser;
  let testService;

  beforeAll(async () => {
    // Clean up database
    await prisma.reminder.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.service.deleteMany();
    await prisma.workingHour.deleteMany();
    await prisma.holiday.deleteMany();
    await prisma.businessSettings.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();

    // Create test admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: await bcrypt.hash('admin123', 12),
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });

    adminToken = jwt.sign(
      { userId: adminUser.id, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test business owner
    const businessOwner = await prisma.user.create({
      data: {
        email: 'owner@test.com',
        password: await bcrypt.hash('owner123', 12),
        firstName: 'Business',
        lastName: 'Owner',
        role: 'BUSINESS_OWNER',
        isActive: true
      }
    });

    businessOwnerToken = jwt.sign(
      { userId: businessOwner.id, role: businessOwner.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test business
    testBusiness = await prisma.business.create({
      data: {
        name: 'Test Beauty Salon',
        description: 'A test beauty salon',
        phone: '+989123456789',
        email: 'test@beautysalon.com',
        address: 'Test Address, Tehran',
        isActive: true,
        ownerId: businessOwner.id
      }
    });

    // Update business owner with business
    await prisma.user.update({
      where: { id: businessOwner.id },
      data: { businessId: testBusiness.id }
    });

    // Create test service
    testService = await prisma.service.create({
      data: {
        businessId: testBusiness.id,
        name: 'Hair Cut',
        description: 'Professional hair cutting service',
        duration: 60,
        price: 150000,
        isActive: true
      }
    });

    // Create business settings
    await prisma.businessSettings.create({
      data: {
        businessId: testBusiness.id,
        depositRequired: true,
        depositPercentage: 20,
        cancellationPolicy: '24h',
        reminderTime: 60,
        smsEnabled: true,
        telegramEnabled: false
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          phone: '+989123456789'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    test('should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@test.com',
          password: 'owner123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Admin Routes', () => {
    test('should get system overview', async () => {
      const response = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalBusinesses');
      expect(response.body).toHaveProperty('totalBookings');
      expect(response.body).toHaveProperty('totalRevenue');
    });

    test('should get all businesses', async () => {
      const response = await request(app)
        .get('/api/admin/businesses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.businesses)).toBe(true);
    });

    test('should update business status', async () => {
      const response = await request(app)
        .patch(`/api/admin/businesses/${testBusiness.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(false);
    });

    test('should reject non-admin access', async () => {
      const response = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${businessOwnerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Analytics Routes', () => {
    test('should get business dashboard', async () => {
      const response = await request(app)
        .get(`/api/analytics/dashboard/${testBusiness.id}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalBookings');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('averageRating');
    });

    test('should get booking trends', async () => {
      const response = await request(app)
        .get(`/api/analytics/trends/${testBusiness.id}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .query({ period: '7d' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trends');
    });

    test('should get service performance', async () => {
      const response = await request(app)
        .get(`/api/analytics/services/${testBusiness.id}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.services)).toBe(true);
    });
  });

  describe('Booking Management', () => {
    test('should create a new booking', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          businessId: testBusiness.id,
          serviceId: testService.id,
          customerName: 'Test Customer',
          customerPhone: '+989123456789',
          customerEmail: 'customer@test.com',
          date: '2024-01-15',
          startTime: '10:00',
          endTime: '11:00',
          totalAmount: 150000
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.customerName).toBe('Test Customer');
    });

    test('should get business bookings', async () => {
      const response = await request(app)
        .get(`/api/bookings/business/${testBusiness.id}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    test('should update booking status', async () => {
      const booking = await prisma.booking.findFirst({
        where: { businessId: testBusiness.id }
      });

      const response = await request(app)
        .patch(`/api/bookings/${booking.id}/status`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({ status: 'CONFIRMED' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CONFIRMED');
    });
  });

  describe('Payment Processing', () => {
    test('should initiate payment', async () => {
      const booking = await prisma.booking.findFirst({
        where: { businessId: testBusiness.id }
      });

      const response = await request(app)
        .post('/api/payments/initiate')
        .send({
          bookingId: booking.id,
          amount: 150000,
          gateway: 'ZARINPAL'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('paymentUrl');
      expect(response.body).toHaveProperty('transactionId');
    });

    test('should verify payment', async () => {
      const payment = await prisma.payment.findFirst({
        where: { status: 'PENDING' }
      });

      if (!payment) {
        // Skip test if no payment exists
        return;
      }

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          paymentId: payment.id,
          gateway: 'ZARINPAL',
          transactionId: 'test-transaction-id'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Availability Management', () => {
    test('should get available slots', async () => {
      const response = await request(app)
        .get(`/api/availability/${testBusiness.id}`)
        .query({
          serviceId: testService.id,
          date: '2024-01-15'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('availableSlots');
    });

    test('should generate time slots', async () => {
      const response = await request(app)
        .post(`/api/availability/generate/${testBusiness.id}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({
          days: 7,
          startTime: '09:00',
          endTime: '18:00'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('generatedSlots');
    });
  });

  describe('Service Management', () => {
    test('should create new service', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({
          businessId: testBusiness.id,
          name: 'Manicure',
          description: 'Professional manicure service',
          duration: 45,
          price: 80000,
          isActive: true
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Manicure');
    });

    test('should update service', async () => {
      const response = await request(app)
        .put(`/api/services/${testService.id}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({
          name: 'Updated Hair Cut',
          price: 180000
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Hair Cut');
      expect(response.body.price).toBe(180000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid business ID', async () => {
      const response = await request(app)
        .get('/api/businesses/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          businessId: testBusiness.id
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('details');
    });

    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/admin/overview');

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@test.com',
            password: 'password'
          })
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
}); 