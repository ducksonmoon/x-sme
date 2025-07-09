const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const moment = require('moment');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// @desc    Get system overview
// @route   GET /api/admin/overview
// @access  Admin only
router.get('/overview', async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

    // Get key metrics
    const [
      totalBusinesses,
      totalBookings,
      totalRevenue
    ] = await Promise.all([
      prisma.business.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      totalBusinesses,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system overview dashboard
// @route   GET /api/admin/dashboard
// @access  Admin only
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();

    // Get key metrics
    const [
      totalBusinesses,
      activeBusinesses,
      totalBookings,
      recentBookings,
      totalRevenue,
      recentRevenue,
      totalPayments,
      pendingPayments
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'SUCCESS',
          createdAt: { gte: sevenDaysAgo }
        },
        _sum: { amount: true }
      }),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
      prisma.payment.count({ where: { status: 'PENDING' } })
    ]);

    // Get top performing businesses
    const topBusinesses = await prisma.business.findMany({
      take: 5,
      include: {
        _count: {
          select: { bookings: true }
        },
        bookings: {
          where: { createdAt: { gte: thirtyDaysAgo } },
          include: {
            payments: {
              where: { status: 'SUCCESS' },
              select: { amount: true }
            }
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      }
    });

    // Get recent activities
    const recentActivities = await prisma.booking.findMany({
      take: 10,
      include: {
        business: { select: { name: true } },
        service: { select: { name: true } },
        payments: { select: { status: true, amount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBusinesses,
          activeBusinesses,
          totalBookings,
          recentBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
          recentRevenue: recentRevenue._sum.amount || 0,
          totalPayments,
          pendingPayments
        },
        topBusinesses: topBusinesses.map(business => ({
          id: business.id,
          name: business.name,
          totalBookings: business._count.bookings,
          recentBookings: business.bookings.length,
          revenue: business.bookings.reduce((sum, booking) => 
            sum + booking.payments.reduce((pSum, payment) => pSum + Number(payment.amount), 0), 0
          )
        })),
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Admin only
router.get('/analytics', async (req, res, next) => {
  try {
    const { period = '30d', businessId } = req.query;
    
    // Handle different period formats
    let days;
    if (period === '7d' || period === 'week') {
      days = 7;
    } else if (period === '30d' || period === 'month') {
      days = 30;
    } else if (period === '90d' || period === 'quarter') {
      days = 90;
    } else {
      days = 30; // default
    }
    
    const startDate = moment().subtract(days, 'days').toDate();

    const where = {
      createdAt: { gte: startDate }
    };

    if (businessId) {
      where.businessId = businessId;
    }

    // Booking trends - using Prisma's findMany instead of raw SQL
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(businessId && { businessId })
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Group bookings by date
    const bookingTrends = [];
    const bookingMap = new Map();
    
    bookings.forEach(booking => {
      const date = moment(booking.createdAt).format('YYYY-MM-DD');
      if (!bookingMap.has(date)) {
        bookingMap.set(date, { date, bookings: 0, confirmed: 0, cancelled: 0 });
      }
      const stats = bookingMap.get(date);
      stats.bookings++;
      if (booking.status === 'CONFIRMED') stats.confirmed++;
      if (booking.status === 'CANCELLED') stats.cancelled++;
    });

    // Convert map to array and sort by date
    bookingTrends.push(...Array.from(bookingMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

    // Revenue trends - using Prisma's findMany instead of raw SQL
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate },
        ...(businessId && {
          booking: { businessId }
        })
      },
      select: {
        createdAt: true,
        amount: true
      }
    });

    // Group payments by date
    const revenueTrends = [];
    const revenueMap = new Map();
    
    payments.forEach(payment => {
      const date = moment(payment.createdAt).format('YYYY-MM-DD');
      if (!revenueMap.has(date)) {
        revenueMap.set(date, { date, revenue: 0, transactions: 0 });
      }
      const stats = revenueMap.get(date);
      stats.revenue += Number(payment.amount);
      stats.transactions++;
    });

    // Convert map to array and sort by date
    revenueTrends.push(...Array.from(revenueMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

    // Service popularity
    const serviceStats = await prisma.service.findMany({
      where: businessId ? { businessId } : {},
      include: {
        _count: {
          select: { bookings: true }
        },
        bookings: {
          where: { createdAt: { gte: startDate } },
          include: {
            payments: {
              where: { status: 'SUCCESS' },
              select: { amount: true }
            }
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Payment gateway stats
    const gatewayStats = await prisma.payment.groupBy({
      by: ['gateway', 'status'],
      where: {
        createdAt: { gte: startDate },
        ...(businessId && {
          booking: { businessId }
        })
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        bookingTrends,
        revenueTrends,
        serviceStats: serviceStats.map(service => ({
          id: service.id,
          name: service.name,
          totalBookings: service._count.bookings,
          recentBookings: service.bookings.length,
          revenue: service.bookings.reduce((sum, booking) => 
            sum + booking.payments.reduce((pSum, payment) => pSum + Number(payment.amount), 0), 0
          )
        })),
        gatewayStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get business details
// @route   GET /api/admin/businesses/:id
// @access  Admin only
router.get('/businesses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('Fetching business with ID:', id);

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true, services: true }
        },
        users: {
          select: { 
            id: true,
            firstName: true, 
            lastName: true, 
            email: true,
            role: true,
            isActive: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true
          },
          take: 5 // Limit to 5 services for preview
        },
        bookings: {
          select: {
            id: true,
            customerName: true,
            status: true,
            totalAmount: true,
            createdAt: true
          },
          take: 5, // Limit to 5 recent bookings
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log('Found business:', business);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // Transform the data to include owner information
    const transformedBusiness = {
      ...business,
      owner: business.users.find(user => user.role === 'BUSINESS_OWNER') || business.users[0] || null,
      recentServices: business.services,
      recentBookings: business.bookings
    };

    console.log('Transformed business:', transformedBusiness);

    res.json({
      success: true,
      data: transformedBusiness
    });
  } catch (error) {
    console.error('Error fetching business details:', error);
    next(error);
  }
});

// @desc    Get all businesses
// @route   GET /api/admin/businesses
// @access  Admin only
router.get('/businesses', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.isActive = status === 'active';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          _count: {
            select: { bookings: true, services: true }
          },
          users: {
            select: { 
              id: true,
              firstName: true, 
              lastName: true, 
              email: true,
              role: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.business.count({ where })
    ]);

    // Transform the data to include owner information
    const transformedBusinesses = businesses.map(business => ({
      ...business,
      owner: business.users.find(user => user.role === 'BUSINESS_OWNER') || business.users[0] || null
    }));

    res.json({
      success: true,
      businesses: transformedBusinesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update business status
// @route   PATCH /api/admin/businesses/:id/status
// @access  Admin only
router.patch('/businesses/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const business = await prisma.business.update({
      where: { id },
      data: { isActive }
    });

    res.json({
      success: true,
      ...business
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Change business owner
// @route   PATCH /api/admin/businesses/:id/owner
// @access  Admin only
router.patch('/businesses/:id/owner', [
  body('ownerId').isString().withMessage('Owner ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { ownerId } = req.body;

    // Verify the new owner exists and is active
    const newOwner = await prisma.user.findFirst({
      where: {
        id: ownerId,
        isActive: true
      }
    });

    if (!newOwner) {
      return res.status(400).json({
        success: false,
        error: 'Selected owner does not exist or is not active'
      });
    }

    // Update owner in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove current owner from this business
      await tx.user.updateMany({
        where: { businessId: id },
        data: { businessId: null }
      });

      // If the new owner is already assigned to another business, remove them from that business
      if (newOwner.businessId && newOwner.businessId !== id) {
        await tx.user.update({
          where: { id: ownerId },
          data: { businessId: null }
        });
      }

      // Assign new owner to this business
      await tx.user.update({
        where: { id: ownerId },
        data: { 
          businessId: id,
          role: 'BUSINESS_OWNER'
        }
      });
    });

    res.json({
      success: true,
      message: 'Business owner updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Admin only
router.get('/settings', async (req, res, next) => {
  try {
    // In a real app, you'd have a settings table
    // For now, return environment-based settings
    const settings = {
      platformFee: process.env.PLATFORM_FEE || 10,
      maxBusinesses: process.env.MAX_BUSINESSES || 1000,
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      smsEnabled: process.env.SMS_ENABLED === 'true',
      telegramEnabled: process.env.TELEGRAM_ENABLED === 'true',
      paymentGateways: {
        pasargad: !!process.env.PASARGAD_MERCHANT_ID,
        saman: !!process.env.SAMAN_MERCHANT_ID,
        zarinpal: !!process.env.ZARINPAL_MERCHANT_ID
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Admin only
router.put('/settings', [
  body('platformFee').optional().isFloat({ min: 0, max: 100 }).withMessage('Platform fee must be between 0 and 100'),
  body('maintenanceMode').optional().isBoolean().withMessage('Maintenance mode must be a boolean')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // In a real app, you'd update a settings table
    // For now, just return the updated settings
    const settings = {
      platformFee: req.body.platformFee || process.env.PLATFORM_FEE || 10,
      maintenanceMode: req.body.maintenanceMode || process.env.MAINTENANCE_MODE === 'true'
    };

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          business: {
            select: {
              id: true,
              name: true,
              _count: {
                select: { bookings: true, services: true }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Transform the data to include business stats
    const transformedUsers = users.map(user => ({
      ...user,
      businessCount: user.business ? 1 : 0,
      bookingCount: user.business?._count?.bookings || 0,
      serviceCount: user.business?._count?.services || 0,
      businessName: user.business?.name || null
    }));

    res.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Admin only
router.post('/users', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional(),
  body('role').isIn(['USER', 'BUSINESS_OWNER', 'STAFF', 'ADMIN']).withMessage('Invalid role')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, role = 'BUSINESS_OWNER' } = req.body;

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin only
router.put('/users/:id/role', [
  body('role').isIn(['USER', 'BUSINESS_OWNER', 'ADMIN']).withMessage('Invalid role')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get available users for business assignment
// @route   GET /api/admin/users/available
// @access  Admin only
router.get('/users/available', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['BUSINESS_OWNER', 'STAFF'] },
        businessId: null, // Only users not already assigned to a business
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users for owner assignment
// @route   GET /api/admin/users/all-for-assignment
// @access  Admin only
router.get('/users/all-for-assignment', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['BUSINESS_OWNER', 'STAFF', 'ADMIN'] },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        business: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to show current business assignment
    const transformedUsers = users.map(user => ({
      ...user,
      currentBusiness: user.business ? `${user.business.name} (${user.business.id})` : 'بدون کسب‌وکار'
    }));

    res.json({
      success: true,
      data: transformedUsers
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new business
// @route   POST /api/admin/businesses
// @access  Admin only
router.post('/businesses', [
  body('name').notEmpty().withMessage('Business name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').optional(),
  body('website').optional().custom((value) => {
    if (value && value.trim() !== '') {
      // Only validate URL if a value is provided
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(value)) {
        throw new Error('Website must be a valid URL starting with http:// or https://');
      }
    }
    return true;
  }),
  body('description').optional(),
  body('ownerId').optional().isString().withMessage('Owner ID must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, phone, address, website, description, ownerId } = req.body;

    // Check if business with this email already exists
    const existingBusiness = await prisma.business.findFirst({
      where: { email }
    });

    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        error: 'Business with this email already exists'
      });
    }

    // If ownerId is provided, verify the user exists and is available
    if (ownerId) {
      const owner = await prisma.user.findFirst({
        where: {
          id: ownerId,
          businessId: null, // Not already assigned to another business
          isActive: true
        }
      });

      if (!owner) {
        return res.status(400).json({
          success: false,
          error: 'Selected owner is not available or does not exist'
        });
      }
    }

    // Create business and assign owner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name,
          email,
          phone,
          address,
          website,
          description,
          isActive: true
        },
        include: {
          _count: {
            select: { bookings: true, services: true }
          },
          users: {
            select: { 
              id: true,
              firstName: true, 
              lastName: true, 
              email: true,
              role: true
            }
          }
        }
      });

      // Assign owner if provided
      if (ownerId) {
        await tx.user.update({
          where: { id: ownerId },
          data: { 
            businessId: business.id,
            role: 'BUSINESS_OWNER' // Ensure they have the correct role
          }
        });
      }

      return business;
    });

    // Transform the data to include owner information
    const transformedBusiness = {
      ...result,
      owner: result.users.find(user => user.role === 'BUSINESS_OWNER') || result.users[0] || null
    };

    res.status(201).json({
      success: true,
      data: transformedBusiness,
      message: 'Business created successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 