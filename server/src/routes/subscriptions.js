const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { getUsageStats } = require('../utils/planEnforcement');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all available plans
// @route   GET /api/subscriptions/plans
// @access  Public
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { 
        isActive: true,
        // Filter out old plans
        name: {
          not: {
            contains: '(Old)'
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get subscription by business ID
// @route   GET /api/subscriptions/business/:businessId
// @access  Private
router.get('/business/:businessId', authenticate, async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Verify user has access to this business
    if (req.user.role !== 'ADMIN' && req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
      include: {
        plan: true,
        business: {
          select: { name: true, email: true }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Get current month usage using planEnforcement utility
    const usageStats = await getUsageStats(businessId, 'month');

    // Get services count for this business
    const servicesCount = await prisma.service.count({
      where: {
        businessId,
        isActive: true
      }
    });

    // Calculate commission owed for commission-based plans
    const commissionOwed = subscription.plan.commissionRate > 0 ? 
      usageStats.revenue * subscription.plan.commissionRate : 0;

    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        trialEndsAt: subscription.trialEnd,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: subscription.plan,
        usage: {
          bookingsThisMonth: usageStats.bookings,
          servicesCreated: servicesCount,
          smsUsed: usageStats.sms,
          revenueThisMonth: usageStats.revenue.toString(), // Convert to string to match expected format
          commissionOwed: usageStats.commissionOwed || commissionOwed
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
// @access  Private
router.get('/current', authenticate, async (req, res, next) => {
  try {
    if (!req.user.businessId) {
      return res.status(404).json({
        success: false,
        error: 'No business assigned to user'
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { businessId: req.user.businessId },
      include: {
        plan: true,
        business: {
          select: { name: true, email: true }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Get current month usage using planEnforcement utility
    const usageStats = await getUsageStats(req.user.businessId, 'month');

    // Convert to expected format
    const currentUsage = {
      bookingsCount: usageStats.bookings,
      smsCount: usageStats.sms,
      revenueAmount: usageStats.revenue
    };

    const usagePercentage = {
      bookings: subscription.plan.bookingsLimit ? 
        (currentUsage.bookingsCount / subscription.plan.bookingsLimit) * 100 : 0,
      sms: subscription.plan.smsLimit ?
        (currentUsage.smsCount / subscription.plan.smsLimit) * 100 : 0
    };

    res.json({
      success: true,
      data: {
        ...subscription,
        currentUsage,
        usagePercentage
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create subscription with plan
// @route   POST /api/subscriptions
// @access  Private
router.post('/', [
  authenticate,
  body('planId').isString().withMessage('Plan ID is required'),
  body('billingCycle').isIn(['MONTHLY', 'YEARLY']).withMessage('Invalid billing cycle'),
  body('businessData').isObject().withMessage('Business data is required'),
  body('businessData.name').trim().isLength({ min: 2 }).withMessage('Business name is required'),
  body('businessData.phone').matches(/^(\+98|0)?9\d{9}$/).withMessage('Invalid phone number'),
  body('businessData.email').isEmail().withMessage('Valid email is required')
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

    const { planId, billingCycle, businessData } = req.body;

    // Check if user already has a business/subscription
    if (req.user.businessId) {
      return res.status(400).json({
        success: false,
        error: 'User already has a business subscription'
      });
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive || plan.name.includes('(Old)')) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found or inactive'
      });
    }

    // Create business and subscription in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create business
      const business = await tx.business.create({
        data: {
          ...businessData,
          theme: 'light',
          timezone: 'Asia/Tehran',
          isActive: true
        }
      });

      // Create business settings
      await tx.businessSettings.create({
        data: {
          businessId: business.id,
          depositRequired: false,
          paymentRequired: false,
          paymentGateways: {
            zarinpal: { enabled: true, merchantId: '' }
          },
          currency: 'toman',
          cancellationPolicy: '24h',
          reminderTime: 60,
          smsEnabled: true,
          telegramEnabled: false
        }
      });

      // Calculate trial period (14 days)
      const trialStart = moment();
      const trialEnd = moment().add(14, 'days');
      const currentPeriodStart = trialStart.toDate();
      const currentPeriodEnd = billingCycle === 'YEARLY' ? 
        trialEnd.clone().add(1, 'year').toDate() : 
        trialEnd.clone().add(1, 'month').toDate();

      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          businessId: business.id,
          userId: req.user.id,
          planId,
          status: 'TRIAL',
          billingCycle,
          currentPeriodStart,
          currentPeriodEnd,
          trialStart: trialStart.toDate(),
          trialEnd: trialEnd.toDate()
        },
        include: {
          plan: true
        }
      });

      // Update user's businessId
      await tx.user.update({
        where: { id: req.user.id },
        data: { businessId: business.id }
      });

      // Create initial usage stats
      await tx.usageStats.create({
        data: {
          businessId: business.id,
          subscriptionId: subscription.id,
          month: moment().month() + 1,
          year: moment().year()
        }
      });

      return { business, subscription };
    });

    res.status(201).json({
      success: true,
      data: result.subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update subscription plan
// @route   PUT /api/subscriptions/plan
// @access  Private
router.put('/plan', [
  authenticate,
  authorize('BUSINESS_OWNER'),
  body('planId').isString().withMessage('Plan ID is required'),
  body('billingCycle').optional().isIn(['MONTHLY', 'YEARLY']).withMessage('Invalid billing cycle')
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

    const { planId, billingCycle } = req.body;

    if (!req.user.businessId) {
      return res.status(404).json({
        success: false,
        error: 'No business found'
      });
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { businessId: req.user.businessId },
      include: { plan: true }
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Get new plan
    const newPlan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!newPlan || !newPlan.isActive || newPlan.name.includes('(Old)')) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found or inactive'
      });
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { businessId: req.user.businessId },
      data: {
        planId,
        ...(billingCycle && { billingCycle }),
        // Reset period if upgrading from trial
        ...(currentSubscription.status === 'TRIAL' && {
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: billingCycle === 'YEARLY' ?
            moment().add(1, 'year').toDate() :
            moment().add(1, 'month').toDate()
        })
      },
      include: {
        plan: true
      }
    });

    // Create invoice for plan change if not in trial
    if (currentSubscription.status !== 'TRIAL') {
      const invoiceAmount = billingCycle === 'YEARLY' ? 
        newPlan.yearlyFee || newPlan.monthlyFee * 12 : 
        newPlan.monthlyFee;

      await createInvoice(updatedSubscription.id, {
        amount: invoiceAmount,
        monthlyFee: billingCycle === 'MONTHLY' ? newPlan.monthlyFee : null,
        description: `Plan change to ${newPlan.name} - ${billingCycle.toLowerCase()}`
      });
    }

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private
router.put('/cancel', authenticate, authorize('BUSINESS_OWNER'), async (req, res, next) => {
  try {
    if (!req.user.businessId) {
      return res.status(404).json({
        success: false,
        error: 'No business found'
      });
    }

    const subscription = await prisma.subscription.update({
      where: { businessId: req.user.businessId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      },
      include: { plan: true }
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get usage statistics
// @route   GET /api/subscriptions/usage
// @access  Private
router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const { period = '6m' } = req.query;

    if (!req.user.businessId) {
      return res.status(404).json({
        success: false,
        error: 'No business found'
      });
    }

    const monthsBack = period === '1y' ? 12 : 6;
    const startDate = moment().subtract(monthsBack, 'months');

    const usageStats = await prisma.usageStats.findMany({
      where: {
        businessId: req.user.businessId,
        OR: [
          {
            year: { gte: startDate.year() },
            month: { gte: startDate.month() + 1 }
          },
          {
            year: { gt: startDate.year() }
          }
        ]
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: usageStats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get invoices
// @route   GET /api/subscriptions/invoices
// @access  Private
router.get('/invoices', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    if (!req.user.businessId) {
      return res.status(404).json({
        success: false,
        error: 'No business found'
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { businessId: req.user.businessId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { subscriptionId: subscription.id },
        include: {
          payments: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.invoice.count({
        where: { subscriptionId: subscription.id }
      })
    ]);

    res.json({
      success: true,
      data: invoices,
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

// Helper function to create invoice
async function createInvoice(subscriptionId, data) {
  const invoiceNumber = `INV-${moment().format('YYYY')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  
  return await prisma.invoice.create({
    data: {
      subscriptionId,
      number: invoiceNumber,
      amount: data.amount,
      setupFee: data.setupFee || null,
      monthlyFee: data.monthlyFee || null,
      commissionFee: data.commissionFee || null,
      totalAmount: data.amount,
      dueDate: moment().add(7, 'days').toDate(),
      description: data.description || 'Subscription payment'
    }
  });
}

// @desc    Track usage (called by booking system)
// @route   POST /api/subscriptions/track-usage
// @access  Private
router.post('/track-usage', [
  authenticate,
  body('type').isIn(['booking', 'sms']).withMessage('Invalid usage type'),
  body('businessId').isString().withMessage('Business ID is required'),
  body('amount').optional().isNumeric().withMessage('Amount must be numeric')
], async (req, res, next) => {
  try {
    const { type, businessId, amount = 0 } = req.body;

    // Get subscription for this business
    const subscription = await prisma.subscription.findFirst({
      where: {
        businessId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found for this business'
      });
    }

    const currentMonth = moment().month() + 1;
    const currentYear = moment().year();

    // Get or create usage stats for current month
    const usageStats = await prisma.usageStats.upsert({
      where: {
        businessId_subscriptionId_month_year: {
          businessId,
          subscriptionId: subscription.id,
          month: currentMonth,
          year: currentYear
        }
      },
      update: {
        ...(type === 'booking' && {
          bookingsCount: { increment: 1 },
          revenueAmount: { increment: amount }
        }),
        ...(type === 'sms' && {
          smsCount: { increment: 1 }
        })
      },
      create: {
        businessId,
        subscriptionId: subscription.id,
        month: currentMonth,
        year: currentYear,
        ...(type === 'booking' && {
          bookingsCount: 1,
          revenueAmount: amount
        }),
        ...(type === 'sms' && {
          smsCount: 1
        })
      }
    });

    res.json({
      success: true,
      data: usageStats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 