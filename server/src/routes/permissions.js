const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getStaffPermissions, 
  setDefaultPermissions, 
  updateStaffPermissions,
  AVAILABLE_PAGES 
} = require('../middleware/permissions');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validatePermissions = [
  body('permissions').isObject().withMessage('Permissions must be an object'),
];

// @desc    Get available pages and actions
// @route   GET /api/permissions/available
// @access  Private (Admin and Business Owners only)
router.get('/available', authenticate, authorize('ADMIN', 'BUSINESS_OWNER'), async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: AVAILABLE_PAGES
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get staff permissions
// @route   GET /api/permissions/staff/:staffId
// @access  Private (Admin and Business Owners only)
router.get('/staff/:staffId', authenticate, authorize('ADMIN', 'BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { staffId } = req.params;

    // Check if staff exists and belongs to the business
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        staff_permissions: true,
        businesses: {
          select: { id: true, name: true }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Business owners can only manage their own staff
    if (req.user.role === 'BUSINESS_OWNER' && staff.businessId !== req.user.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this staff member'
      });
    }

    const permissions = await getStaffPermissions(staffId);

    res.json({
      success: true,
      data: {
        staff: {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          specialization: staff.specialization,
          business: staff.businesses
        },
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update staff permissions
// @route   PUT /api/permissions/staff/:staffId
// @access  Private (Admin and Business Owners only)
router.put('/staff/:staffId', authenticate, authorize('ADMIN', 'BUSINESS_OWNER'), validatePermissions, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { staffId } = req.params;
    const { permissions } = req.body;

    // Check if staff exists and belongs to the business
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        businesses: {
          select: { id: true, name: true }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Business owners can only manage their own staff
    if (req.user.role === 'BUSINESS_OWNER' && staff.businessId !== req.user.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this staff member'
      });
    }

    // Validate permissions structure
    const validPages = Object.keys(AVAILABLE_PAGES);
    const validActions = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MANAGE'];

    for (const page of Object.keys(permissions)) {
      if (!validPages.includes(page)) {
        return res.status(400).json({
          success: false,
          error: `Invalid page: ${page}`
        });
      }

      for (const action of Object.keys(permissions[page])) {
        if (!validActions.includes(action)) {
          return res.status(400).json({
            success: false,
            error: `Invalid action: ${action} for page: ${page}`
          });
        }

        if (typeof permissions[page][action] !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: `Permission value must be boolean for ${page}.${action}`
          });
        }
      }
    }

    // Update permissions
    await updateStaffPermissions(staffId, permissions);

    // Get updated permissions
    const updatedPermissions = await getStaffPermissions(staffId);

    res.json({
      success: true,
      message: 'Staff permissions updated successfully',
      data: {
        staff: {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          specialization: staff.specialization,
          business: staff.businesses
        },
        permissions: updatedPermissions
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Set default permissions for staff
// @route   POST /api/permissions/staff/:staffId/default
// @access  Private (Admin and Business Owners only)
router.post('/staff/:staffId/default', authenticate, authorize('ADMIN', 'BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { staffId } = req.params;

    // Check if staff exists and belongs to the business
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        businesses: {
          select: { id: true, name: true }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Business owners can only manage their own staff
    if (req.user.role === 'BUSINESS_OWNER' && staff.businessId !== req.user.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this staff member'
      });
    }

    // Set default permissions
    await setDefaultPermissions(staffId);

    // Get updated permissions
    const updatedPermissions = await getStaffPermissions(staffId);

    res.json({
      success: true,
      message: 'Default permissions set successfully',
      data: {
        staff: {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          specialization: staff.specialization,
          business: staff.businesses
        },
        permissions: updatedPermissions
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all staff with their permissions (for business)
// @route   GET /api/permissions/business/:businessId
// @access  Private (Admin and Business Owners only)
router.get('/business/:businessId', authenticate, authorize('ADMIN', 'BUSINESS_OWNER'), async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Business owners can only access their own business
    if (req.user.role === 'BUSINESS_OWNER' && businessId !== req.user.businessId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this business'
      });
    }

    const staff = await prisma.staff.findMany({
      where: { 
        businessId,
        canLogin: true // Only staff with login access
      },
      include: {
        staff_permissions: true,
        businesses: {
          select: { id: true, name: true }
        },
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    // Get permissions for each staff member
    const staffWithPermissions = await Promise.all(
      staff.map(async (member) => {
        const permissions = await getStaffPermissions(member.id);
        return {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          specialization: member.specialization,
          isActive: member.isActive,
          business: member.businesses,
          _count: member._count,
          permissions
        };
      })
    );

    res.json({
      success: true,
      data: staffWithPermissions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user's permissions (for staff)
// @route   GET /api/permissions/my-permissions
// @access  Private (Staff only)
router.get('/my-permissions', authenticate, authorize('STAFF'), async (req, res, next) => {
  try {
    const staff = await prisma.staff.findFirst({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: {
        businesses: {
          select: { id: true, name: true }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff profile not found'
      });
    }

    const permissions = await getStaffPermissions(staff.id);

    res.json({
      success: true,
      data: {
        staff: {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          specialization: staff.specialization,
          business: staff.businesses
        },
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 