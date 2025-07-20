const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// Payment gateway configurations
const PAYMENT_GATEWAYS = {
  TEST: {
    name: 'Test Mode',
    apiUrl: 'http://localhost:3001',
    merchantId: 'test-merchant-id'
  },
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
const validateSubscriptionPayment = [
  body('planId').isString().withMessage('Plan ID is required'),
  body('billingCycle').isIn(['MONTHLY', 'YEARLY']).withMessage('Invalid billing cycle'),
  body('gateway').isIn(['TEST', 'PASARGAD', 'SAMAN', 'ZARINPAL']).withMessage('Invalid payment gateway')
];

// @desc    Create subscription upgrade payment
// @route   POST /api/subscription-payments/create
// @access  Private
router.post('/create', [
  ...validateSubscriptionPayment,
  require('../middleware/auth').authenticate,
  require('../middleware/auth').authorize('BUSINESS_OWNER')
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

    const { planId, billingCycle, gateway } = req.body;

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

    // Calculate payment amount
    const paymentAmount = billingCycle === 'YEARLY' ? 
      newPlan.yearlyFee || newPlan.monthlyFee * 12 : 
      newPlan.monthlyFee;

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount'
      });
    }

    // Create subscription payment record
    const subscriptionPayment = await prisma.subscriptionPayment.create({
      data: {
        businessId: req.user.businessId,
        currentPlanId: currentSubscription.planId,
        newPlanId: planId,
        billingCycle,
        amount: paymentAmount,
        gateway: gateway === 'TEST' ? 'ZARINPAL' : gateway, // Temporarily use ZARINPAL for TEST
        status: 'PENDING',
        metadata: {
          currentPlan: currentSubscription.plan.name,
          newPlan: newPlan.name,
          upgradeType: 'PLAN_CHANGE',
          originalGateway: gateway // Store original gateway in metadata
        }
      }
    });

    // Generate payment URL based on gateway
    let paymentUrl;
    let gatewayRef;

          try {
        const originalGateway = gateway;
        const effectiveGateway = gateway === 'TEST' ? 'ZARINPAL' : gateway;
        
        console.log('Payment initiation:', {
          originalGateway,
          effectiveGateway,
          paymentId: subscriptionPayment.id,
          amount: paymentAmount
        });
        
        switch (effectiveGateway) {
          case 'TEST':
            const testResult = await initiateTestSubscriptionPayment(subscriptionPayment, newPlan);
            paymentUrl = testResult.url;
            gatewayRef = testResult.ref;
            break;

          case 'PASARGAD':
            const pasargadResult = await initiatePasargadSubscriptionPayment(subscriptionPayment, newPlan);
            paymentUrl = pasargadResult.url;
            gatewayRef = pasargadResult.ref;
            break;

          case 'SAMAN':
            const samanResult = await initiateSamanSubscriptionPayment(subscriptionPayment, newPlan);
            paymentUrl = samanResult.url;
            gatewayRef = samanResult.ref;
            break;

          case 'ZARINPAL':
            if (originalGateway === 'TEST') {
              // Use test mode for Zarinpal
              const testResult = await initiateTestSubscriptionPayment(subscriptionPayment, newPlan);
              paymentUrl = testResult.url;
              gatewayRef = testResult.ref;
            } else {
              const zarinpalResult = await initiateZarinpalSubscriptionPayment(subscriptionPayment, newPlan);
              paymentUrl = zarinpalResult.url;
              gatewayRef = zarinpalResult.ref;
            }
            break;

          default:
            throw new Error('Unsupported payment gateway');
        }

      // Ensure paymentUrl is defined
      if (!paymentUrl) {
        throw new Error('Payment URL could not be generated');
      }

      // Update payment with gateway reference
      await prisma.subscriptionPayment.update({
        where: { id: subscriptionPayment.id },
        data: { 
          gatewayRef,
          metadata: {
            ...subscriptionPayment.metadata,
            gatewayRef,
            paymentUrl
          }
        }
      });

      res.json({
        success: true,
        paymentUrl,
        transactionId: gatewayRef,
        paymentId: subscriptionPayment.id,
        gateway,
        amount: paymentAmount,
        planName: newPlan.name,
        billingCycle
      });
    } catch (gatewayError) {
      // Update payment status to failed
      await prisma.subscriptionPayment.update({
        where: { id: subscriptionPayment.id },
        data: { 
          status: 'FAILED',
          metadata: { 
            ...subscriptionPayment.metadata,
            error: gatewayError.message 
          }
        }
      });

      throw gatewayError;
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Verify subscription payment
// @route   POST /api/subscription-payments/verify
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

    const subscriptionPayment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: {
        currentPlan: true,
        newPlan: true,
        business: true
      }
    });

    if (!subscriptionPayment) {
      return res.status(404).json({
        success: false,
        error: 'Subscription payment not found'
      });
    }

    if (subscriptionPayment.status === 'SUCCESS') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: subscriptionPayment
      });
    }

    // Verify payment with gateway
    let verificationResult;
          try {
        // Check if this was originally a TEST payment
        const originalGateway = subscriptionPayment.metadata?.originalGateway;
        const effectiveGateway = originalGateway === 'TEST' ? 'TEST' : gateway;
        
        switch (effectiveGateway) {
          case 'TEST':
            verificationResult = await verifyTestSubscriptionPayment(subscriptionPayment, refNum);
            break;

          case 'PASARGAD':
            verificationResult = await verifyPasargadSubscriptionPayment(subscriptionPayment, refNum, resNum);
            break;

          case 'SAMAN':
            verificationResult = await verifySamanSubscriptionPayment(subscriptionPayment, refNum);
            break;

          case 'ZARINPAL':
            if (originalGateway === 'TEST') {
              verificationResult = await verifyTestSubscriptionPayment(subscriptionPayment, refNum);
            } else {
              verificationResult = await verifyZarinpalSubscriptionPayment(subscriptionPayment, refNum);
            }
            break;

          default:
            throw new Error('Unsupported payment gateway');
        }
    } catch (verificationError) {
      // Update payment status to failed
      await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { 
          status: 'FAILED',
          metadata: { 
            ...subscriptionPayment.metadata,
            verificationError: verificationError.message 
          }
        }
      });

      throw verificationError;
    }

    if (verificationResult.success) {
      // Update payment status to success
      await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { 
          status: 'SUCCESS',
          paidAt: new Date(),
          metadata: { 
            ...subscriptionPayment.metadata,
            verificationResult
          }
        }
      });

      // Update subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { businessId: subscriptionPayment.businessId },
        data: {
          planId: subscriptionPayment.newPlanId,
          billingCycle: subscriptionPayment.billingCycle,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: subscriptionPayment.billingCycle === 'YEARLY' ?
            moment().add(1, 'year').toDate() :
            moment().add(1, 'month').toDate()
        },
        include: { plan: true }
      });

      // Create invoice for the payment
      await prisma.invoice.create({
        data: {
          subscriptionId: updatedSubscription.id,
          number: `INV-${Date.now()}`,
          amount: subscriptionPayment.amount,
          totalAmount: subscriptionPayment.amount,
          currency: 'IRR',
          status: 'PAID',
          paidAt: new Date(),
          dueDate: new Date(),
          description: `Plan upgrade to ${subscriptionPayment.newPlan.name} - ${subscriptionPayment.billingCycle.toLowerCase()}`
        }
      });

      res.json({
        success: true,
        message: 'Payment verified and subscription upgraded successfully',
        data: {
          subscription: updatedSubscription,
          payment: subscriptionPayment
        }
      });
    } else {
      // Update payment status to failed
      await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { 
          status: 'FAILED',
          metadata: { 
            ...subscriptionPayment.metadata,
            verificationResult
          }
        }
      });

      res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        data: verificationResult
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get subscription payment status
// @route   GET /api/subscription-payments/:id/status
// @access  Private
router.get('/:id/status', [
  require('../middleware/auth').authenticate,
  require('../middleware/auth').authorize('BUSINESS_OWNER')
], async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscriptionPayment = await prisma.subscriptionPayment.findUnique({
      where: { id },
      include: {
        currentPlan: true,
        newPlan: true,
        business: true
      }
    });

    if (!subscriptionPayment) {
      return res.status(404).json({
        success: false,
        error: 'Subscription payment not found'
      });
    }

    // Check if user owns this business
    if (subscriptionPayment.businessId !== req.user.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: subscriptionPayment
    });
  } catch (error) {
    next(error);
  }
});

// Payment gateway functions
async function initiateTestSubscriptionPayment(payment, plan) {
  // Simulate payment initiation for testing
  const testRef = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const paymentUrl = `${frontendUrl}/dashboard/payment/callback?paymentId=${payment.id}&Authority=${testRef}&Status=OK`;
  
  console.log('Test payment initiated:', {
    paymentId: payment.id,
    testRef,
    paymentUrl
  });
  
  return {
    url: paymentUrl,
    ref: testRef
  };
}

async function verifyTestSubscriptionPayment(payment, refNum) {
  // Simulate successful payment verification for testing
  return {
    success: true,
    refNum: refNum,
    amount: payment.amount
  };
}

async function initiatePasargadSubscriptionPayment(payment, plan) {
  // Implementation for Pasargad payment initiation
  // This would integrate with Pasargad's API
  throw new Error('Pasargad integration not implemented');
}

async function verifyPasargadSubscriptionPayment(payment, refNum, resNum) {
  // Implementation for Pasargad payment verification
  throw new Error('Pasargad verification not implemented');
}

async function initiateSamanSubscriptionPayment(payment, plan) {
  // Implementation for Saman payment initiation
  throw new Error('Saman integration not implemented');
}

async function verifySamanSubscriptionPayment(payment, refNum) {
  // Implementation for Saman payment verification
  throw new Error('Saman verification not implemented');
}

async function initiateZarinpalSubscriptionPayment(payment, plan) {
  try {
    // For testing purposes, use sandbox environment
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.zarinpal.com/pg/v4'
      : 'https://sandbox.zarinpal.com/pg/v4';

    const requestData = {
      merchant_id: PAYMENT_GATEWAYS.ZARINPAL.merchantId || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      amount: Math.round(payment.amount), // Zarinpal expects integer amount in Tomans
      description: `Upgrade to ${plan.name} plan - ${payment.billingCycle.toLowerCase()}`,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/callback?paymentId=${payment.id}`,
      metadata: {
        paymentId: payment.id,
        planId: plan.id,
        businessId: payment.businessId
      }
    };

    console.log('Zarinpal request data:', requestData);

    const response = await axios.post(`${apiUrl}/payment/request.json`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Zarinpal response:', response.data);

    if (response.data.data && response.data.data.code === 100) {
      const paymentUrl = process.env.NODE_ENV === 'production'
        ? `https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`
        : `https://sandbox.zarinpal.com/pg/StartPay/${response.data.data.authority}`;
      
      return {
        url: paymentUrl,
        ref: response.data.data.authority
      };
    } else {
      const errorMessage = response.data.errors?.message || 'Unknown Zarinpal error';
      throw new Error(`Zarinpal error: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Zarinpal payment initiation error:', error.response?.data || error.message);
    throw new Error(`Zarinpal payment initiation failed: ${error.message}`);
  }
}

async function verifyZarinpalSubscriptionPayment(payment, refNum) {
  try {
    // For testing purposes, use sandbox environment
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.zarinpal.com/pg/v4'
      : 'https://sandbox.zarinpal.com/pg/v4';

    const requestData = {
      merchant_id: PAYMENT_GATEWAYS.ZARINPAL.merchantId || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      authority: refNum,
      amount: Math.round(payment.amount) // Zarinpal expects integer amount in Tomans
    };

    console.log('Zarinpal verification request:', requestData);

    const response = await axios.post(`${apiUrl}/payment/verify.json`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Zarinpal verification response:', response.data);

    if (response.data.data && response.data.data.code === 100) {
      return {
        success: true,
        refNum: response.data.data.ref_id,
        amount: response.data.data.amount
      };
    } else {
      const errorMessage = response.data.errors?.message || 'Unknown Zarinpal error';
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error) {
    console.error('Zarinpal verification error:', error.response?.data || error.message);
    throw new Error(`Zarinpal payment verification failed: ${error.message}`);
  }
}

module.exports = router; 