const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, authorizeBusiness } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// All analytics routes require authentication
router.use(authenticate);

// @desc    Get business dashboard analytics
// @route   GET /api/analytics/dashboard/:businessId
// @access  Business owner, Staff, Admin
router.get('/dashboard/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();
    const today = moment().startOf('day').toDate();
    const tomorrow = moment().endOf('day').toDate();

    // Get key metrics
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      averageBookingValue,
      totalCustomers,
      repeatCustomers,
      todayBookings
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          businessId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'CANCELLED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.aggregate({
        where: {
          booking: { businessId },
          status: 'SUCCESS',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          booking: { businessId },
          status: 'SUCCESS',
          createdAt: { gte: startDate }
        },
        _avg: { amount: true }
      }),
      prisma.booking.groupBy({
        by: ['customerPhone'],
        where: {
          businessId,
          createdAt: { gte: startDate }
        },
        _count: { id: true }
      }),
      prisma.booking.groupBy({
        by: ['customerPhone'],
        where: {
          businessId,
          createdAt: { gte: startDate }
        },
        having: {
          customerPhone: {
            _count: { gt: 1 }
          }
        }
      }),
      prisma.booking.count({
        where: {
          businessId,
          date: { gte: today, lt: tomorrow }
        }
      })
    ]);

    // Get top performing services
    const topServices = await prisma.service.findMany({
      where: {
        businessId,
        isActive: true
      },
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
      take: 5
    });

    // Get recent activities
    const recentActivities = await prisma.booking.findMany({
      where: {
        businessId,
        createdAt: { gte: startDate }
      },
      include: {
        service: { select: { name: true } },
        payments: { select: { status: true, amount: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: 0, // TODO: Implement rating system
      confirmedBookings,
      cancelledBookings,
      averageBookingValue: averageBookingValue._avg.amount || 0,
      totalCustomers: totalCustomers.length,
      repeatCustomers: repeatCustomers.length,
      todayBookings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get booking trends
// @route   GET /api/analytics/trends/:businessId
// @access  Business owner, Staff, Admin
router.get('/trends/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '7d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();

    const trends = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled
      FROM bookings 
      WHERE business_id = ${businessId} AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue/:businessId
// @access  Business owner, Staff, Admin
router.get('/revenue/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '30d', groupBy = 'day' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();

    let revenueTrends;
    
    if (groupBy === 'day') {
      revenueTrends = await prisma.$queryRaw`
        SELECT 
          DATE(p.created_at) as date,
          SUM(p.amount) as revenue,
          COUNT(p.id) as transactions,
          AVG(p.amount) as average_transaction
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE b.business_id = ${businessId} 
          AND p.status = 'SUCCESS' 
          AND p.created_at >= ${startDate}
        GROUP BY DATE(p.created_at)
        ORDER BY date
      `;
    } else if (groupBy === 'week') {
      revenueTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', p.created_at) as week_start,
          SUM(p.amount) as revenue,
          COUNT(p.id) as transactions
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE b.business_id = ${businessId} 
          AND p.status = 'SUCCESS' 
          AND p.created_at >= ${startDate}
        GROUP BY DATE_TRUNC('week', p.created_at)
        ORDER BY week_start
      `;
    } else {
      revenueTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', p.created_at) as month_start,
          SUM(p.amount) as revenue,
          COUNT(p.id) as transactions
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE b.business_id = ${businessId} 
          AND p.status = 'SUCCESS' 
          AND p.created_at >= ${startDate}
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY month_start
      `;
    }

    // Get payment gateway distribution
    const gatewayStats = await prisma.payment.groupBy({
      by: ['gateway'],
      where: {
        booking: { businessId },
        status: 'SUCCESS',
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        revenueTrends,
        gatewayStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get customer analytics
// @route   GET /api/analytics/customers/:businessId
// @access  Business owner, Staff, Admin
router.get('/customers/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();

    // Get customer statistics
    const customerStats = await prisma.$queryRaw`
      SELECT 
        customer_phone,
        customer_name,
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END) as total_spent,
        MIN(created_at) as first_booking,
        MAX(created_at) as last_booking
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.business_id = ${businessId} AND b.created_at >= ${startDate}
      GROUP BY customer_phone, customer_name
      ORDER BY total_spent DESC
    `;

    // Get new vs returning customers
    const customerTypes = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN COUNT(*) = 1 THEN 'New'
          ELSE 'Returning'
        END as customer_type,
        COUNT(*) as count
      FROM (
        SELECT customer_phone
        FROM bookings
        WHERE business_id = ${businessId} AND created_at >= ${startDate}
        GROUP BY customer_phone
      ) customer_counts
      GROUP BY customer_type
    `;

    res.json({
      success: true,
      data: {
        customerStats,
        customerTypes
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get service performance
// @route   GET /api/analytics/services/:businessId
// @access  Business owner, Staff, Admin
router.get('/services/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();

    const services = await prisma.service.findMany({
      where: {
        businessId,
        isActive: true
      },
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
      }
    });

    res.json({
      success: true,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        totalBookings: service._count.bookings,
        recentBookings: service.bookings.length,
        revenue: service.bookings.reduce((sum, booking) => 
          sum + booking.payments.reduce((pSum, payment) => pSum + Number(payment.amount), 0), 0
        )
      }))
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get capacity utilization analytics
// @route   GET /api/analytics/capacity/:businessId
// @access  Business owner, Staff, Admin
router.get('/capacity/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();

    // Get daily capacity utilization
    const capacityUtilization = await prisma.$queryRaw`
      SELECT 
        DATE(b.date) as date,
        COUNT(b.id) as booked_slots,
        COUNT(DISTINCT b.service_id) as services_used,
        AVG(s.duration) as avg_service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.business_id = ${businessId} 
        AND b.date >= ${startDate}
        AND b.status IN ('PENDING', 'CONFIRMED')
      GROUP BY DATE(b.date)
      ORDER BY date
    `;

    // Get peak hours analysis
    const peakHours = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM b.start_time::time) as hour,
        COUNT(*) as bookings
      FROM bookings b
      WHERE b.business_id = ${businessId} 
        AND b.created_at >= ${startDate}
        AND b.status IN ('PENDING', 'CONFIRMED')
      GROUP BY EXTRACT(HOUR FROM b.start_time::time)
      ORDER BY bookings DESC
    `;

    res.json({
      success: true,
      data: {
        capacityUtilization,
        peakHours
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get basic business analytics
// @route   GET /api/analytics/:businessId
// @access  Business owner, Staff, Admin
router.get('/:businessId', authorizeBusiness, async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').toDate();
    const today = moment().startOf('day').toDate();
    const tomorrow = moment().endOf('day').toDate();

    // Get key metrics
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      averageBookingValue,
      totalCustomers,
      repeatCustomers,
      todayBookings
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          businessId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'CANCELLED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.payment.aggregate({
        where: {
          booking: { businessId },
          status: 'SUCCESS',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          booking: { businessId },
          status: 'SUCCESS',
          createdAt: { gte: startDate }
        },
        _avg: { amount: true }
      }),
      prisma.booking.groupBy({
        by: ['customerPhone'],
        where: {
          businessId,
          createdAt: { gte: startDate }
        },
        _count: { id: true }
      }),
      prisma.booking.groupBy({
        by: ['customerPhone'],
        where: {
          businessId,
          createdAt: { gte: startDate }
        },
        having: {
          customerPhone: {
            _count: { gt: 1 }
          }
        }
      }),
      prisma.booking.count({
        where: {
          businessId,
          date: { gte: today, lt: tomorrow }
        }
      })
    ]);

    res.json({
      success: true,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: 0, // TODO: Implement rating system
      confirmedBookings,
      cancelledBookings,
      averageBookingValue: averageBookingValue._avg.amount || 0,
      totalCustomers: totalCustomers.length,
      repeatCustomers: repeatCustomers.length,
      todayBookings
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 