const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

const prisma = new PrismaClient();

class PaymentService {
  constructor() {
    this.gateways = {
      PASARGAD: {
        name: 'Pasargad',
        apiUrl: 'https://pep.shaparak.ir/Api/v1',
        merchantId: process.env.PASARGAD_MERCHANT_ID,
        privateKey: process.env.PASARGAD_PRIVATE_KEY,
        callbackUrl: `${process.env.BASE_URL}/api/payments/callback/pasargad`
      },
      SAMAN: {
        name: 'Saman',
        apiUrl: 'https://sep.shaparak.ir/api/v1',
        merchantId: process.env.SAMAN_MERCHANT_ID,
        callbackUrl: `${process.env.BASE_URL}/api/payments/callback/saman`
      },
      ZARINPAL: {
        name: 'Zarinpal',
        apiUrl: 'https://api.zarinpal.com/pg/v4',
        merchantId: process.env.ZARINPAL_MERCHANT_ID,
        callbackUrl: `${process.env.BASE_URL}/api/payments/callback/zarinpal`
      }
    };
  }

  // Initiate payment with retry logic
  async initiatePayment(bookingId, gateway, amount, metadata = {}) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            bookingId,
            amount,
            gateway,
            status: 'PENDING',
            metadata: {
              ...metadata,
              attempts: attempt,
              initiatedAt: new Date().toISOString()
            }
          },
          include: {
            booking: {
              include: {
                business: { select: { name: true } },
                service: { select: { name: true } }
              }
            }
          }
        });

        // Generate payment URL
        const result = await this.generatePaymentUrl(payment, gateway);

        // Update payment with gateway reference
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            gatewayRef: result.ref,
            metadata: {
              ...payment.metadata,
              gatewayRef: result.ref,
              paymentUrl: result.url
            }
          }
        });

        return {
          success: true,
          paymentId: payment.id,
          paymentUrl: result.url,
          gateway,
          amount
        };
      } catch (error) {
        lastError = error;
        console.error(`Payment initiation attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await this.delay(1000 * Math.pow(2, attempt - 1));
        }
      }
    }

    throw new Error(`Payment initiation failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  // Generate payment URL based on gateway
  async generatePaymentUrl(payment, gateway) {
    const gatewayConfig = this.gateways[gateway];
    
    if (!gatewayConfig) {
      throw new Error(`Unsupported payment gateway: ${gateway}`);
    }

    switch (gateway) {
      case 'PASARGAD':
        return await this.generatePasargadUrl(payment, gatewayConfig);
      case 'SAMAN':
        return await this.generateSamanUrl(payment, gatewayConfig);
      case 'ZARINPAL':
        return await this.generateZarinpalUrl(payment, gatewayConfig);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  // Generate Pasargad payment URL
  async generatePasargadUrl(payment, config) {
    if (!config.merchantId || !config.privateKey) {
      throw new Error('Pasargad configuration not found');
    }

    const invoiceNumber = `INV-${payment.id}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    const amount = payment.amount.toString();
    const terminalCode = config.merchantId;
    const merchantCode = config.merchantId;

    // Create signature
    const signString = `${invoiceNumber};${invoiceDate};${amount}`;
    const signature = crypto.createSign('SHA256').update(signString).sign(config.privateKey, 'base64');

    const requestData = {
      InvoiceNumber: invoiceNumber,
      InvoiceDate: invoiceDate,
      Amount: amount,
      TerminalCode: terminalCode,
      MerchantCode: merchantCode,
      RedirectAddress: config.callbackUrl,
      Timestamp: new Date().toISOString(),
      Sign: signature
    };

    try {
      const response = await axios.post(`${config.apiUrl}/Payment/GetToken`, requestData, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.IsSuccess) {
        return {
          url: `${config.apiUrl}/Payment/GoToBank?Token=${response.data.Token}`,
          ref: response.data.Token
        };
      } else {
        throw new Error(response.data.Message || 'Failed to generate Pasargad payment URL');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Pasargad API error: ${error.response.data.Message || error.response.statusText}`);
      }
      throw new Error(`Pasargad request failed: ${error.message}`);
    }
  }

  // Generate Saman payment URL
  async generateSamanUrl(payment, config) {
    if (!config.merchantId) {
      throw new Error('Saman configuration not found');
    }

    const amount = payment.amount.toString();
    const resNum = payment.id;
    const terminalId = config.merchantId;

    const requestData = {
      Amount: amount,
      ResNum: resNum,
      TerminalId: terminalId,
      RedirectURL: config.callbackUrl
    };

    try {
      const response = await axios.post(`${config.apiUrl}/Token`, requestData, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === 1) {
        return {
          url: `${config.apiUrl}/Pay?Token=${response.data.token}`,
          ref: response.data.token
        };
      } else {
        throw new Error(response.data.errorDesc || 'Failed to generate Saman payment URL');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Saman API error: ${error.response.data.errorDesc || error.response.statusText}`);
      }
      throw new Error(`Saman request failed: ${error.message}`);
    }
  }

  // Generate Zarinpal payment URL
  async generateZarinpalUrl(payment, config) {
    if (!config.merchantId) {
      throw new Error('Zarinpal configuration not found');
    }

    const amount = payment.amount.toString();
    const description = `Booking payment for ${payment.booking.service.name}`;

    const requestData = {
      merchant_id: config.merchantId,
      amount: amount,
      description: description,
      callback_url: config.callbackUrl,
      metadata: {
        payment_id: payment.id,
        booking_id: payment.bookingId
      }
    };

    try {
      const response = await axios.post(`${config.apiUrl}/payment/request.json`, requestData, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.data.code === 100) {
        const authority = response.data.data.authority;
        return {
          url: `https://www.zarinpal.com/pg/StartPay/${authority}`,
          ref: authority
        };
      } else {
        throw new Error(response.data.errors.message || 'Failed to generate Zarinpal payment URL');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`Zarinpal API error: ${error.response.data.errors?.message || error.response.statusText}`);
      }
      throw new Error(`Zarinpal request failed: ${error.message}`);
    }
  }

  // Verify payment with retry logic
  async verifyPayment(paymentId, gateway, refNum, resNum = null) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            booking: {
              include: {
                business: { select: { name: true } },
                service: { select: { name: true } }
              }
            }
          }
        });

        if (!payment) {
          throw new Error('Payment not found');
        }

        if (payment.status === 'SUCCESS') {
          return {
            success: true,
            payment,
            message: 'Payment already verified'
          };
        }

        // Verify with gateway
        const verificationResult = await this.verifyWithGateway(payment, gateway, refNum, resNum);

        // Update payment status
        const updatedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: verificationResult.success ? 'SUCCESS' : 'FAILED',
            transactionId: verificationResult.transactionId,
            metadata: {
              ...payment.metadata,
              verificationAttempt: attempt,
              verifiedAt: new Date().toISOString(),
              gatewayResponse: verificationResult.metadata
            }
          }
        });

        // Update booking status if payment successful
        if (verificationResult.success) {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' }
          });
        }

        return {
          success: verificationResult.success,
          payment: updatedPayment,
          message: verificationResult.success ? 'Payment verified successfully' : 'Payment verification failed'
        };
      } catch (error) {
        lastError = error;
        console.error(`Payment verification attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          await this.delay(1000 * Math.pow(2, attempt - 1));
        }
      }
    }

    throw new Error(`Payment verification failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  // Verify payment with specific gateway
  async verifyWithGateway(payment, gateway, refNum, resNum) {
    const gatewayConfig = this.gateways[gateway];
    
    if (!gatewayConfig) {
      throw new Error(`Unsupported payment gateway: ${gateway}`);
    }

    switch (gateway) {
      case 'PASARGAD':
        return await this.verifyPasargadPayment(payment, gatewayConfig, refNum, resNum);
      case 'SAMAN':
        return await this.verifySamanPayment(payment, gatewayConfig, refNum);
      case 'ZARINPAL':
        return await this.verifyZarinpalPayment(payment, gatewayConfig, refNum);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  // Verify Pasargad payment
  async verifyPasargadPayment(payment, config, refNum, resNum) {
    const requestData = {
      InvoiceNumber: `INV-${payment.id}`,
      InvoiceDate: new Date().toISOString().split('T')[0],
      TerminalCode: config.merchantId,
      MerchantCode: config.merchantId,
      Amount: payment.amount.toString(),
      Timestamp: new Date().toISOString(),
      Sign: refNum
    };

    try {
      const response = await axios.post(`${config.apiUrl}/Payment/VerifyPayment`, requestData, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: response.data.IsSuccess,
        transactionId: resNum,
        metadata: response.data
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Pasargad verification error: ${error.response.data.Message || error.response.statusText}`);
      }
      throw new Error(`Pasargad verification failed: ${error.message}`);
    }
  }

  // Verify Saman payment
  async verifySamanPayment(payment, config, refNum) {
    try {
      const response = await axios.post(`${config.apiUrl}/Verify`, {
        RefNum: refNum,
        TerminalId: config.merchantId
      }, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: response.data.resultCode === '0',
        transactionId: refNum,
        metadata: response.data
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Saman verification error: ${error.response.data.errorDesc || error.response.statusText}`);
      }
      throw new Error(`Saman verification failed: ${error.message}`);
    }
  }

  // Verify Zarinpal payment
  async verifyZarinpalPayment(payment, config, refNum) {
    const requestData = {
      merchant_id: config.merchantId,
      authority: refNum,
      amount: payment.amount.toString()
    };

    try {
      const response = await axios.post(`${config.apiUrl}/payment/verify.json`, requestData, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: response.data.data.code === 100,
        transactionId: response.data.data.ref_id,
        metadata: response.data
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Zarinpal verification error: ${error.response.data.errors?.message || error.response.statusText}`);
      }
      throw new Error(`Zarinpal verification failed: ${error.message}`);
    }
  }

  // Get payment statistics
  async getPaymentStats(businessId = null, period = '30d') {
    try {
      const startDate = moment().subtract(period === '7d' ? 7 : period === '30d' ? 30 : 90, 'days').toDate();

      const where = {
        createdAt: { gte: startDate }
      };

      if (businessId) {
        where.booking = { businessId };
      }

      const stats = await prisma.payment.groupBy({
        by: ['status', 'gateway'],
        where,
        _count: { id: true },
        _sum: { amount: true }
      });

      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return [];
    }
  }

  // Refund payment (placeholder for future implementation)
  async refundPayment(paymentId, amount = null) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'SUCCESS') {
        throw new Error('Payment is not successful');
      }

      // TODO: Implement refund logic for each gateway
      console.log('Refund functionality not implemented yet');
      
      return {
        success: false,
        message: 'Refund functionality not implemented yet'
      };
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  // Utility function for delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new PaymentService(); 