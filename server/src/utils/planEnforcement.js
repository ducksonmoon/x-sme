const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

/**
 * Check if a business has reached its booking limits based on subscription plan
 * @param {string} businessId - The business ID to check
 * @returns {Promise<{allowed: boolean, reason?: string, usage?: object}>}
 */
async function checkBookingLimit(businessId) {
  try {
    // Get business subscription
    const subscription = await prisma.subscription.findFirst({
      where: { 
        businessId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      include: {
        plan: true
      }
    });

    // If no active subscription found, allow with basic limits
    if (!subscription || !subscription.plan) {
      console.log(`No active subscription found for business ${businessId}, allowing with basic limits`);
      return {
        allowed: true,
        reason: 'No active subscription found, using basic limits',
        usage: {
          current: monthlyBookings,
          limit: 'unlimited',
          percentage: 0
        }
      };
    }

    const plan = subscription.plan;
    const currentMonth = moment().startOf('month');
    const nextMonth = moment().add(1, 'month').startOf('month');

    // Count bookings for current month
    const monthlyBookings = await prisma.booking.count({
      where: {
        businessId,
        createdAt: {
          gte: currentMonth.toDate(),
          lt: nextMonth.toDate()
        },
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      }
    });

    // Check booking limits
    if (plan.bookingsLimit && plan.bookingsLimit > 0) {
      if (monthlyBookings >= plan.bookingsLimit) {
        return {
          allowed: false,
          reason: `Monthly booking limit of ${plan.bookingsLimit} reached. Current: ${monthlyBookings}`,
          usage: {
            current: monthlyBookings,
            limit: plan.bookingsLimit,
            percentage: Math.round((monthlyBookings / plan.bookingsLimit) * 100)
          }
        };
      }
    }

    // Check if trial period has expired
    if (subscription.status === 'TRIAL' && subscription.trialEnd) {
      const trialEndDate = moment(subscription.trialEnd);
      if (moment().isAfter(trialEndDate)) {
        return {
          allowed: false,
          reason: 'Trial period has expired. Please upgrade your subscription.',
          usage: {
            current: monthlyBookings,
            limit: plan.bookingsLimit || 'unlimited'
          }
        };
      }
    }

    // Check if subscription is past due
    if (subscription.status === 'PAST_DUE' || subscription.status === 'CANCELLED') {
      return {
        allowed: false,
        reason: 'Subscription is past due or cancelled. Please update your payment method.',
        usage: {
          current: monthlyBookings,
          limit: plan.bookingsLimit || 'unlimited'
        }
      };
    }

    // All checks passed
    return {
      allowed: true,
      usage: {
        current: monthlyBookings,
        limit: plan.bookingsLimit || 'unlimited',
        percentage: plan.bookingsLimit ? Math.round((monthlyBookings / plan.bookingsLimit) * 100) : 0
      }
    };

  } catch (error) {
    console.error('Error checking booking limit:', error);
    // In case of error, allow the booking but log the issue
    return {
      allowed: true,
      reason: 'Error checking limits, allowing booking'
    };
  }
}

/**
 * Track usage for subscription billing and analytics
 * @param {string} businessId - The business ID
 * @param {string} type - Type of usage (e.g., 'booking', 'sms', 'email')
 * @param {number} amount - Amount or value to track
 * @returns {Promise<void>}
 */
async function trackUsage(businessId, type, amount = 1) {
  try {
    const currentDate = moment();
    const month = currentDate.month() + 1; // moment months are 0-indexed
    const year = currentDate.year();

    // Get subscription for this business
    const subscription = await prisma.subscription.findFirst({
      where: {
        businessId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    });

    if (!subscription) {
      console.log(`No active subscription found for business ${businessId}`);
      return;
    }

    // Update usage stats based on type
    const updateData = {};
    if (type === 'booking') {
      updateData.bookingsCount = { increment: 1 };
      updateData.revenueAmount = { increment: amount };
    } else if (type === 'sms') {
      updateData.smsCount = { increment: 1 };
    }

    // Find or create usage stats for this month
    await prisma.usageStats.upsert({
      where: {
        businessId_subscriptionId_month_year: {
          businessId,
          subscriptionId: subscription.id,
          month,
          year
        }
      },
      update: updateData,
      create: {
        businessId,
        subscriptionId: subscription.id,
        month,
        year,
        bookingsCount: type === 'booking' ? 1 : 0,
        smsCount: type === 'sms' ? 1 : 0,
        revenueAmount: type === 'booking' ? amount : 0,
        commissionOwed: 0
      }
    });

    console.log(`Usage tracked: ${type} for business ${businessId}, amount: ${amount}`);

  } catch (error) {
    console.error('Error tracking usage:', error);
    // Don't throw error to avoid blocking the main operation
  }
}

/**
 * Check SMS limits for a business
 * @param {string} businessId - The business ID to check
 * @returns {Promise<{allowed: boolean, reason?: string, usage?: object}>}
 */
async function checkSmsLimit(businessId) {
  try {
    // Get business subscription
    const subscription = await prisma.subscription.findFirst({
      where: { 
        businessId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      include: {
        plan: true
      }
    });

    if (!subscription || !subscription.plan) {
      return { allowed: true };
    }

    const plan = subscription.plan;
    const currentDate = moment();
    const month = currentDate.month() + 1;
    const year = currentDate.year();

    // Get SMS usage for current month
    const usageStats = await prisma.usageStats.findFirst({
      where: {
        businessId,
        subscriptionId: subscription.id,
        month,
        year
      }
    });

    const currentUsage = usageStats ? usageStats.smsCount : 0;

    // Check SMS limits
    if (plan.smsLimit && plan.smsLimit > 0) {
      if (currentUsage >= plan.smsLimit) {
        return {
          allowed: false,
          reason: `Monthly SMS limit of ${plan.smsLimit} reached. Current: ${currentUsage}`,
          usage: {
            current: currentUsage,
            limit: plan.smsLimit,
            percentage: Math.round((currentUsage / plan.smsLimit) * 100)
          }
        };
      }
    }

    return {
      allowed: true,
      usage: {
        current: currentUsage,
        limit: plan.smsLimit || 'unlimited',
        percentage: plan.smsLimit ? Math.round((currentUsage / plan.smsLimit) * 100) : 0
      }
    };

  } catch (error) {
    console.error('Error checking SMS limit:', error);
    return { allowed: true };
  }
}

/**
 * Check if a business has reached its service limits based on subscription plan
 * @param {string} businessId - The business ID to check
 * @returns {Promise<{allowed: boolean, reason?: string, usage?: object}>}
 */
async function checkServiceLimit(businessId) {
  try {
    // Get business subscription
    const subscription = await prisma.subscription.findFirst({
      where: { 
        businessId,
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      include: {
        plan: true
      }
    });

    // If no active subscription found, allow with basic limits
    if (!subscription || !subscription.plan) {
      console.log(`No active subscription found for business ${businessId}, allowing service creation with basic limits`);
      return {
        allowed: true,
        reason: 'No active subscription found, using basic limits'
      };
    }

    const plan = subscription.plan;

    // Count current active services
    const currentServices = await prisma.service.count({
      where: {
        businessId,
        isActive: true
      }
    });

    // Check service limits
    if (plan.servicesLimit && plan.servicesLimit > 0) {
      if (currentServices >= plan.servicesLimit) {
        return {
          allowed: false,
          reason: `Service limit of ${plan.servicesLimit} reached. Current: ${currentServices}`,
          usage: {
            current: currentServices,
            limit: plan.servicesLimit,
            percentage: Math.round((currentServices / plan.servicesLimit) * 100)
          }
        };
      }
    }

    // Check if trial period has expired
    if (subscription.status === 'TRIAL' && subscription.trialEnd) {
      const trialEndDate = moment(subscription.trialEnd);
      if (moment().isAfter(trialEndDate)) {
        return {
          allowed: false,
          reason: 'Trial period has expired. Please upgrade your subscription.',
          usage: {
            current: currentServices,
            limit: plan.servicesLimit || 'unlimited'
          }
        };
      }
    }

    // Check if subscription is past due
    if (subscription.status === 'PAST_DUE' || subscription.status === 'CANCELLED') {
      return {
        allowed: false,
        reason: 'Subscription is past due or cancelled. Please update your payment method.',
        usage: {
          current: currentServices,
          limit: plan.servicesLimit || 'unlimited'
        }
      };
    }

    // All checks passed
    return {
      allowed: true,
      usage: {
        current: currentServices,
        limit: plan.servicesLimit || 'unlimited',
        percentage: plan.servicesLimit ? Math.round((currentServices / plan.servicesLimit) * 100) : 0
      }
    };

  } catch (error) {
    console.error('Error checking service limit:', error);
    // In case of error, allow the service creation but log the issue
    return {
      allowed: true,
      reason: 'Error checking limits, allowing service creation'
    };
  }
}

/**
 * Get usage statistics for a business
 * @param {string} businessId - The business ID
 * @param {string} period - Period to get stats for ('month', 'year')
 * @returns {Promise<object>}
 */
async function getUsageStats(businessId, period = 'month') {
  try {
    const currentDate = moment();
    
    if (period === 'month') {
      // Get current month stats
      const month = currentDate.month() + 1;
      const year = currentDate.year();
      
      const usageStats = await prisma.usageStats.findFirst({
        where: {
          businessId,
          month,
          year
        }
      });

      return {
        bookings: usageStats ? usageStats.bookingsCount : 0,
        sms: usageStats ? usageStats.smsCount : 0,
        revenue: usageStats ? Number(usageStats.revenueAmount) : 0,
        commissionOwed: usageStats ? Number(usageStats.commissionOwed) : 0,
        period: 'month',
        month,
        year
      };
    } else {
      // Get year stats (sum of all months in current year)
      const year = currentDate.year();
      
      const yearStats = await prisma.usageStats.aggregate({
        where: {
          businessId,
          year
        },
        _sum: {
          bookingsCount: true,
          smsCount: true,
          revenueAmount: true,
          commissionOwed: true
        }
      });

      return {
        bookings: yearStats._sum.bookingsCount || 0,
        sms: yearStats._sum.smsCount || 0,
        revenue: Number(yearStats._sum.revenueAmount) || 0,
        commissionOwed: Number(yearStats._sum.commissionOwed) || 0,
        period: 'year',
        year
      };
    }

  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {
      bookings: 0,
      sms: 0,
      revenue: 0,
      commissionOwed: 0,
      period: period
    };
  }
}

module.exports = {
  checkBookingLimit,
  trackUsage,
  checkSmsLimit,
  checkServiceLimit,
  getUsageStats
}; 