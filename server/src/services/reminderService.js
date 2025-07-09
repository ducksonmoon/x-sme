const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const moment = require('moment');

const prisma = new PrismaClient();

class ReminderService {
  constructor() {
    this.smsConfig = {
      apiKey: process.env.SMS_API_KEY,
      apiUrl: process.env.SMS_API_URL,
      sender: process.env.SMS_SENDER || 'X-SME'
    };

    this.telegramConfig = {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      apiUrl: 'https://api.telegram.org/bot'
    };
  }

  // Create reminder for a booking
  async createReminder(bookingId, type, channel, scheduledAt) {
    try {
      const reminder = await prisma.reminder.create({
        data: {
          bookingId,
          type,
          channel,
          scheduledAt: new Date(scheduledAt),
          status: 'PENDING'
        }
      });

      console.log(`Reminder created: ${reminder.id} for booking ${bookingId}`);
      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  // Process pending reminders
  async processPendingReminders() {
    try {
      const pendingReminders = await prisma.reminder.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: {
            lte: new Date()
          }
        },
        include: {
          booking: {
            include: {
              business: {
                include: { settings: true }
              },
              service: true
            }
          }
        }
      });

      console.log(`Processing ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        await this.sendReminder(reminder);
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }

  // Send reminder
  async sendReminder(reminder) {
    try {
      const { booking } = reminder;
      const message = this.generateMessage(reminder.type, booking);

      let success = false;
      let error = null;

      switch (reminder.channel) {
        case 'SMS':
          success = await this.sendSMS(booking.customerPhone, message);
          break;
        case 'TELEGRAM':
          success = await this.sendTelegram(booking.business.settings.telegramChatId, message);
          break;
        case 'EMAIL':
          success = await this.sendEmail(booking.customerEmail, message);
          break;
        default:
          error = 'Unsupported channel';
      }

      // Update reminder status
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null,
          error: error || (success ? null : 'Failed to send')
        }
      });

      if (success) {
        console.log(`Reminder sent successfully: ${reminder.id}`);
      } else {
        console.error(`Failed to send reminder: ${reminder.id}`, error);
      }

      return success;
    } catch (error) {
      console.error('Error sending reminder:', error);
      
      // Update reminder status to failed
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });

      return false;
    }
  }

  // Generate message based on reminder type
  generateMessage(type, booking) {
    const business = booking.business;
    const service = booking.service;
    const date = moment(booking.date).format('YYYY/MM/DD');
    const time = booking.startTime;

    switch (type) {
      case 'CONFIRMATION':
        return `سلام ${booking.customerName} عزیز،
رزرو شما در ${business.name} برای ${service.name} در تاریخ ${date} ساعت ${time} تایید شد.
مبلغ قابل پرداخت: ${booking.totalAmount.toLocaleString()} تومان
برای لغو رزرو تا 24 ساعت قبل از موعد اقدام کنید.
${business.phone}`;

      case 'REMINDER':
        return `سلام ${booking.customerName} عزیز،
یادآوری: رزرو شما در ${business.name} برای ${service.name} فردا ${date} ساعت ${time} می‌باشد.
لطفا 10 دقیقه قبل از موعد حضور داشته باشید.
${business.phone}`;

      case 'CANCELLATION':
        return `سلام ${booking.customerName} عزیز،
رزرو شما در ${business.name} برای ${service.name} در تاریخ ${date} ساعت ${time} لغو شد.
برای رزرو مجدد با ما تماس بگیرید.
${business.phone}`;

      default:
        return `سلام ${booking.customerName} عزیز،
اطلاعات رزرو شما در ${business.name}:
سرویس: ${service.name}
تاریخ: ${date}
ساعت: ${time}
${business.phone}`;
    }
  }

  // Send SMS
  async sendSMS(phoneNumber, message) {
    if (!this.smsConfig.apiKey || !this.smsConfig.apiUrl) {
      console.warn('SMS configuration not found');
      return false;
    }

    try {
      const response = await axios.post(this.smsConfig.apiUrl, {
        api_key: this.smsConfig.apiKey,
        sender: this.smsConfig.sender,
        recipient: phoneNumber,
        message: message
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if SMS was sent successfully
      // This depends on your SMS provider's response format
      return response.data.success || response.data.status === 'success';
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return false;
    }
  }

  // Send Telegram message
  async sendTelegram(chatId, message) {
    if (!this.telegramConfig.botToken || !chatId) {
      console.warn('Telegram configuration not found');
      return false;
    }

    try {
      const response = await axios.post(`${this.telegramConfig.apiUrl}${this.telegramConfig.botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }, {
        timeout: 10000
      });

      return response.data.ok;
    } catch (error) {
      console.error('Telegram sending failed:', error.message);
      return false;
    }
  }

  // Send Email (placeholder for future implementation)
  async sendEmail(email, message) {
    if (!email) {
      console.warn('Email address not provided');
      return false;
    }

    // TODO: Implement email sending logic
    console.log('Email sending not implemented yet');
    return false;
  }

  // Retry failed reminders
  async retryFailedReminders() {
    try {
      const failedReminders = await prisma.reminder.findMany({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: moment().subtract(24, 'hours').toDate()
          }
        },
        include: {
          booking: {
            include: {
              business: {
                include: { settings: true }
              },
              service: true
            }
          }
        }
      });

      console.log(`Retrying ${failedReminders.length} failed reminders`);

      for (const reminder of failedReminders) {
        // Only retry if the booking is still valid
        if (reminder.booking.status === 'CONFIRMED') {
          await this.sendReminder(reminder);
        }
      }
    } catch (error) {
      console.error('Error retrying failed reminders:', error);
    }
  }

  // Get reminder statistics
  async getReminderStats(businessId = null, period = '30d') {
    try {
      const startDate = moment().subtract(period === '7d' ? 7 : period === '30d' ? 30 : 90, 'days').toDate();

      const where = {
        createdAt: { gte: startDate }
      };

      if (businessId) {
        where.booking = { businessId };
      }

      const stats = await prisma.reminder.groupBy({
        by: ['status', 'channel', 'type'],
        where,
        _count: { id: true }
      });

      return stats;
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return [];
    }
  }

  // Clean up old reminders
  async cleanupOldReminders(days = 90) {
    try {
      const cutoffDate = moment().subtract(days, 'days').toDate();

      const deletedCount = await prisma.reminder.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: ['SENT', 'FAILED'] }
        }
      });

      console.log(`Cleaned up ${deletedCount.count} old reminders`);
      return deletedCount.count;
    } catch (error) {
      console.error('Error cleaning up old reminders:', error);
      return 0;
    }
  }
}

module.exports = new ReminderService(); 