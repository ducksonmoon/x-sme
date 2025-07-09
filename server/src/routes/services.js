const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, authorizeBusiness } = require('../middleware/auth');
const { checkServiceLimit } = require('../utils/planEnforcement');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateService = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('businessId').notEmpty().withMessage('Business ID is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// @desc    Get all services for a business
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { businessId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(businessId && { businessId })
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          business: {
            select: { id: true, name: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.service.count({ where })
    ]);

    res.json({
      success: true,
      data: services,
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

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        business: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create service
// @route   POST /api/services
// @access  Private (Business owners and staff only)
router.post('/', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), validateService, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name,
      description,
      duration,
      price,
      businessId
    } = req.body;

    // Verify user has access to this business
    if (req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this business'
      });
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // **BUSINESS LOGIC: Check service limits based on subscription plan**
    const serviceLimitCheck = await checkServiceLimit(businessId);
    if (!serviceLimitCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: serviceLimitCheck.reason,
        ...(serviceLimitCheck.usage && { usage: serviceLimitCheck.usage })
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        businessId
      },
      include: {
        business: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Business owners and staff only)
router.put('/:id', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), validateService, async (req, res, next) => {
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
    const updateData = req.body;

    // Get the service to check business ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      select: { businessId: true }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Verify user has access to this business
    if (req.user.businessId !== existingService.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this service'
      });
    }

    // Remove businessId from update data if present
    delete updateData.businessId;

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        business: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Business owners and staff only)
router.delete('/:id', authenticate, authorize('BUSINESS_OWNER', 'STAFF'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the service to check business ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      select: { businessId: true }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Verify user has access to this business
    if (req.user.businessId !== existingService.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this service'
      });
    }

    // Check if service has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        serviceId: id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeBookings) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete service with active bookings'
      });
    }

    await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Service deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 