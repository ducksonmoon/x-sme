const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const reminderService = require('./reminderService');
const slotService = require('./slotService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class CronService {
  constructor() {
    this.jobs = new Map();
    this.lastRunTimes = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize all cron jobs
   */
  async initialize() {
    if (this.isInitialized) {
      logger.info('Cron service already initialized');
      return;
    }

    try {
      logger.info('Initializing cron service...');

      // Process reminders every 5 minutes
      this.scheduleReminderProcessing();

      // Generate time slots daily at 2 AM
      this.scheduleSlotGeneration();

      // Clean up old data weekly on Sunday at 3 AM
      this.scheduleDataCleanup();

      // Process failed payments every 10 minutes
      this.scheduleFailedPaymentRetry();

      // Health check every hour
      this.scheduleHealthCheck();

      this.isInitialized = true;
      logger.info('Cron service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize cron service:', error);
      throw error;
    }
  }

  /**
   * Schedule reminder processing
   */
  scheduleReminderProcessing() {
    const job = cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('Processing reminders...');
        this.lastRunTimes.set('reminderProcessing', new Date());
        await this.processReminders();
      } catch (error) {
        logger.error('Error processing reminders:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Tehran'
    });

    this.jobs.set('reminderProcessing', job);
    job.start();
    logger.info('Reminder processing job scheduled');
  }

  /**
   * Schedule slot generation
   */
  scheduleSlotGeneration() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Generating time slots...');
        this.lastRunTimes.set('slotGeneration', new Date());
        await this.generateTimeSlots();
      } catch (error) {
        logger.error('Error generating time slots:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Tehran'
    });

    this.jobs.set('slotGeneration', job);
    job.start();
    logger.info('Slot generation job scheduled');
  }

  /**
   * Schedule data cleanup
   */
  scheduleDataCleanup() {
    const job = cron.schedule('0 3 * * 0', async () => {
      try {
        logger.info('Cleaning up old data...');
        this.lastRunTimes.set('dataCleanup', new Date());
        await this.cleanupOldData();
      } catch (error) {
        logger.error('Error cleaning up old data:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Tehran'
    });

    this.jobs.set('dataCleanup', job);
    job.start();
    logger.info('Data cleanup job scheduled');
  }

  /**
   * Schedule failed payment retry
   */
  scheduleFailedPaymentRetry() {
    const job = cron.schedule('*/10 * * * *', async () => {
      try {
        logger.info('Retrying failed payments...');
        this.lastRunTimes.set('failedPaymentRetry', new Date());
        await this.retryFailedPayments();
      } catch (error) {
        logger.error('Error retrying failed payments:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Tehran'
    });

    this.jobs.set('failedPaymentRetry', job);
    job.start();
    logger.info('Failed payment retry job scheduled');
  }

  /**
   * Schedule health check
   */
  scheduleHealthCheck() {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running health check...');
        this.lastRunTimes.set('healthCheck', new Date());
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Error during health check:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Tehran'
    });

    this.jobs.set('healthCheck', job);
    job.start();
    logger.info('Health check job scheduled');
  }

  /**
   * Process pending reminders
   */
  async processReminders() {
    const now = new Date();
    
    try {
      // Get pending reminders that are due
      const pendingReminders = await prisma.reminder.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: {
            lte: now
          }
        },
        include: {
          booking: {
            include: {
              business: true,
              service: true
            }
          }
        }
      });

      logger.info(`Processing ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        try {
          await reminderService.sendReminder(reminder);
          
          // Update reminder status
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
              status: 'SENT',
              sentAt: now
            }
          });

          logger.info(`Reminder ${reminder.id} sent successfully`);
        } catch (error) {
          logger.error(`Failed to send reminder ${reminder.id}:`, error);
          
          // Update reminder status to failed
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
              status: 'FAILED',
              error: error.message
            }
          });
        }
      }
    } catch (error) {
      logger.error('Error in processReminders:', error);
      throw error;
    }
  }

  /**
   * Generate time slots for active businesses
   */
  async generateTimeSlots() {
    try {
      const activeBusinesses = await prisma.business.findMany({
        where: { isActive: true },
        include: {
          services: {
            where: { isActive: true }
          },
          workingHours: {
            where: { isActive: true }
          }
        }
      });

      logger.info(`Generating slots for ${activeBusinesses.length} businesses`);

      for (const business of activeBusinesses) {
        try {
          await slotService.generateSlotsForBusiness(business.id, 30); // Generate for next 30 days
          logger.info(`Generated slots for business ${business.id}`);
        } catch (error) {
          logger.error(`Failed to generate slots for business ${business.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in generateTimeSlots:', error);
      throw error;
    }
  }

  /**
   * Clean up old data
   */
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up old completed bookings
      const deletedBookings = await prisma.booking.deleteMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      // Clean up old failed payments
      const deletedPayments = await prisma.payment.deleteMany({
        where: {
          status: 'FAILED',
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      // Clean up old sent reminders
      const deletedReminders = await prisma.reminder.deleteMany({
        where: {
          status: 'SENT',
          sentAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      logger.info(`Cleanup completed: ${deletedBookings.count} bookings, ${deletedPayments.count} payments, ${deletedReminders.count} reminders`);
    } catch (error) {
      logger.error('Error in cleanupOldData:', error);
      throw error;
    }
  }

  /**
   * Retry failed payments
   */
  async retryFailedPayments() {
    try {
      const failedPayments = await prisma.payment.findMany({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: {
          booking: true
        }
      });

      logger.info(`Retrying ${failedPayments.length} failed payments`);

      for (const payment of failedPayments) {
        try {
          // Implement payment retry logic here
          // This would depend on your payment service implementation
          logger.info(`Retrying payment ${payment.id}`);
        } catch (error) {
          logger.error(`Failed to retry payment ${payment.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in retryFailedPayments:', error);
      throw error;
    }
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check active businesses
      const activeBusinesses = await prisma.business.count({
        where: { isActive: true }
      });

      // Check pending reminders
      const pendingReminders = await prisma.reminder.count({
        where: { status: 'PENDING' }
      });

      // Check failed payments
      const failedPayments = await prisma.payment.count({
        where: { status: 'FAILED' }
      });

      logger.info(`Health check: ${activeBusinesses} active businesses, ${pendingReminders} pending reminders, ${failedPayments} failed payments`);
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    logger.info('Stopping all cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    }
    
    this.jobs.clear();
    this.isInitialized = false;
    logger.info('All cron jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    const status = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        lastRun: this.lastRunTimes.get(name) || null,
        nextRun: job.nextDate ? job.nextDate() : null
      };
    }
    
    return status;
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService; 