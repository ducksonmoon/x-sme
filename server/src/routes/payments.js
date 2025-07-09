const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Payment gateway configurations
const PAYMENT_GATEWAYS = {
  PASARGAD: {
    name: 'Pasargad',
    apiUrl: 'https://pep.shaparak.ir/Api/v1',
    merchantId: process.env.PASARGAD_MERCHANT_ID,
    privateKey: process.env.PASARGAD_PRIVATE_KEY
  },
  SAMAN: {
    name: 'Saman',
    apiUrl: 'https://sep.shaparak.ir/api/v1',
    merchantId: process.env.SAMAN_MERCHANT_ID
  },
  ZARINPAL: {
    name: 'Zarinpal',
    apiUrl: 'https://api.zarinpal.com/pg/v4',
    merchantId: process.env.ZARINPAL_MERCHANT_ID
  }
};

// Validation middleware
const validatePayment = [
  body('bookingId').isString().withMessage('Booking ID is required'),
  body('gateway').isIn(['PASARGAD', 'SAMAN', 'ZARINPAL']).withMessage('Invalid payment gateway'),
  body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least 1,000 IRR')
];

// @desc    Get payment status
// @route   GET /api/payments/:id/status
// @access  Public
router.get('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
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
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Initiate payment
// @route   POST /api/payments/initiate
// @access  Public
router.post('/initiate', validatePayment, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { bookingId, gateway, amount } = req.body;

    // Check if booking exists and is pending
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: { select: { name: true } },
        service: { select: { name: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Booking is not in pending status'
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        gateway,
        status: 'PENDING'
      }
    });

    // Generate payment URL based on gateway
    let paymentUrl;
    let gatewayRef;

    try {
      switch (gateway) {
        case 'PASARGAD':
          const pasargadResult = await initiatePasargadPayment(payment, booking);
          paymentUrl = pasargadResult.url;
          gatewayRef = pasargadResult.ref;
          break;

        case 'SAMAN':
          const samanResult = await initiateSamanPayment(payment, booking);
          paymentUrl = samanResult.url;
          gatewayRef = samanResult.ref;
          break;

        case 'ZARINPAL':
          const zarinpalResult = await initiateZarinpalPayment(payment, booking);
          paymentUrl = zarinpalResult.url;
          gatewayRef = zarinpalResult.ref;
          break;

        default:
          throw new Error('Unsupported payment gateway');
      }

      // Update payment with gateway reference
      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayRef }
      });

      res.json({
        success: true,
        paymentUrl,
        transactionId: gatewayRef,
        paymentId: payment.id,
        gateway,
        amount
      });
    } catch (gatewayError) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          metadata: { error: gatewayError.message }
        }
      });

      throw gatewayError;
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Public
router.post('/verify', async (req, res, next) => {
  try {
    const { paymentId, gateway, refNum, resNum } = req.body;

    if (!paymentId || !gateway || !refNum) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID, gateway, and reference number are required'
      });
    }

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
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status === 'SUCCESS') {
      return res.json({
        success: true,
        data: payment,
        message: 'Payment already verified'
      });
    }

    // Verify payment with gateway
    let verificationResult;
    try {
      switch (gateway) {
        case 'PASARGAD':
          verificationResult = await verifyPasargadPayment(payment, refNum, resNum);
          break;

        case 'SAMAN':
          verificationResult = await verifySamanPayment(payment, refNum);
          break;

        case 'ZARINPAL':
          verificationResult = await verifyZarinpalPayment(payment, refNum);
          break;

        default:
          throw new Error('Unsupported payment gateway');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: verificationResult.success ? 'SUCCESS' : 'FAILED',
          transactionId: verificationResult.transactionId,
          metadata: verificationResult.metadata
        }
      });

      // Update booking status if payment successful
      if (verificationResult.success) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        });
      }

      res.json({
        success: true,
        data: updatedPayment,
        message: verificationResult.success ? 'Payment verified successfully' : 'Payment verification failed'
      });
    } catch (verificationError) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          metadata: { error: verificationError.message }
        }
      });

      throw verificationError;
    }
  } catch (error) {
    next(error);
  }
});

// Payment gateway helper functions
async function initiatePasargadPayment(payment, booking) {
  const config = PAYMENT_GATEWAYS.PASARGAD;
  
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
    RedirectAddress: `${process.env.BASE_URL}/payment/callback?paymentId=${payment.id}`,
    Timestamp: new Date().toISOString(),
    Sign: signature
  };

  try {
    const response = await axios.post(`${config.apiUrl}/Payment/GetToken`, requestData);
    
    if (response.data.IsSuccess) {
      return {
        url: `${config.apiUrl}/Payment/GoToBank?Token=${response.data.Token}`,
        ref: response.data.Token
      };
    } else {
      throw new Error(response.data.Message || 'Failed to initiate Pasargad payment');
    }
  } catch (error) {
    throw new Error(`Pasargad payment initiation failed: ${error.message}`);
  }
}

async function verifyPasargadPayment(payment, refNum, resNum) {
  const config = PAYMENT_GATEWAYS.PASARGAD;
  
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
    const response = await axios.post(`${config.apiUrl}/Payment/VerifyPayment`, requestData);
    
    return {
      success: response.data.IsSuccess,
      transactionId: resNum,
      metadata: response.data
    };
  } catch (error) {
    throw new Error(`Pasargad payment verification failed: ${error.message}`);
  }
}

async function initiateSamanPayment(payment, booking) {
  const config = PAYMENT_GATEWAYS.SAMAN;
  
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
    RedirectURL: `${process.env.BASE_URL}/payment/callback?paymentId=${payment.id}`
  };

  try {
    const response = await axios.post(`${config.apiUrl}/Token`, requestData);
    
    if (response.data.status === 1) {
      return {
        url: `${config.apiUrl}/Pay?Token=${response.data.token}`,
        ref: response.data.token
      };
    } else {
      throw new Error(response.data.errorDesc || 'Failed to initiate Saman payment');
    }
  } catch (error) {
    throw new Error(`Saman payment initiation failed: ${error.message}`);
  }
}

async function verifySamanPayment(payment, refNum) {
  const config = PAYMENT_GATEWAYS.SAMAN;
  
  try {
    const response = await axios.post(`${config.apiUrl}/Verify`, {
      RefNum: refNum,
      TerminalId: config.merchantId
    });
    
    return {
      success: response.data.resultCode === '0',
      transactionId: refNum,
      metadata: response.data
    };
  } catch (error) {
    throw new Error(`Saman payment verification failed: ${error.message}`);
  }
}

async function initiateZarinpalPayment(payment, booking) {
  const config = PAYMENT_GATEWAYS.ZARINPAL;
  
  if (!config.merchantId) {
    throw new Error('Zarinpal configuration not found');
  }

  const amount = payment.amount.toString();
  const description = `Booking payment for ${booking.service.name}`;

  const requestData = {
    merchant_id: config.merchantId,
    amount: amount,
    description: description,
    callback_url: `${process.env.BASE_URL}/payment/callback?paymentId=${payment.id}`,
    metadata: {
      payment_id: payment.id,
      booking_id: payment.bookingId
    }
  };

  try {
    const response = await axios.post(`${config.apiUrl}/payment/request.json`, requestData);
    
    if (response.data.data.code === 100) {
      const authority = response.data.data.authority;
      return {
        url: `https://www.zarinpal.com/pg/StartPay/${authority}`,
        ref: authority
      };
    } else {
      throw new Error(response.data.errors.message || 'Failed to initiate Zarinpal payment');
    }
  } catch (error) {
    throw new Error(`Zarinpal payment initiation failed: ${error.message}`);
  }
}

async function verifyZarinpalPayment(payment, refNum) {
  const config = PAYMENT_GATEWAYS.ZARINPAL;
  
  const requestData = {
    merchant_id: config.merchantId,
    authority: refNum,
    amount: payment.amount.toString()
  };

  try {
    const response = await axios.post(`${config.apiUrl}/payment/verify.json`, requestData);
    
    return {
      success: response.data.data.code === 100,
      transactionId: response.data.data.ref_id,
      metadata: response.data
    };
  } catch (error) {
    throw new Error(`Zarinpal payment verification failed: ${error.message}`);
  }
}

module.exports = router; 