const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Staff permission middleware
const staffPermissions = {
  // Check if staff can access bookings
  canAccessBookings: async (req, res, next) => {
    try {
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      if (req.user.role === 'STAFF') {
        // Staff can only access bookings for their business
        const businessId = req.params.businessId || req.query.businessId || req.body.businessId;
        
        if (!businessId) {
          return res.status(400).json({
            success: false,
            error: 'Business ID required'
          });
        }

        const staff = await prisma.staff.findFirst({
          where: {
            userId: req.user.id,
            businessId: businessId,
            isActive: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this business'
          });
        }

        req.staff = staff;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    } catch (error) {
      next(error);
    }
  },

  // Check if staff can manage their own profile
  canManageOwnProfile: async (req, res, next) => {
    try {
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      if (req.user.role === 'STAFF') {
        const staffId = req.params.id || req.params.staffId;
        
        if (!staffId) {
          return res.status(400).json({
            success: false,
            error: 'Staff ID required'
          });
        }

        const staff = await prisma.staff.findFirst({
          where: {
            id: staffId,
            userId: req.user.id,
            isActive: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this staff profile'
          });
        }

        req.staff = staff;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    } catch (error) {
      next(error);
    }
  },

  // Check if staff can access services
  canAccessServices: async (req, res, next) => {
    try {
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      if (req.user.role === 'STAFF') {
        const businessId = req.params.businessId || req.query.businessId || req.body.businessId;
        
        if (!businessId) {
          return res.status(400).json({
            success: false,
            error: 'Business ID required'
          });
        }

        const staff = await prisma.staff.findFirst({
          where: {
            userId: req.user.id,
            businessId: businessId,
            isActive: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this business'
          });
        }

        req.staff = staff;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    } catch (error) {
      next(error);
    }
  },

  // Check if staff can access time slots
  canAccessTimeSlots: async (req, res, next) => {
    try {
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      if (req.user.role === 'STAFF') {
        const businessId = req.params.businessId || req.query.businessId || req.body.businessId;
        
        if (!businessId) {
          return res.status(400).json({
            success: false,
            error: 'Business ID required'
          });
        }

        const staff = await prisma.staff.findFirst({
          where: {
            userId: req.user.id,
            businessId: businessId,
            isActive: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this business'
          });
        }

        req.staff = staff;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    } catch (error) {
      next(error);
    }
  },

  // Check if staff can access analytics (read-only)
  canAccessAnalytics: async (req, res, next) => {
    try {
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      if (req.user.role === 'STAFF') {
        const businessId = req.params.businessId || req.query.businessId || req.body.businessId;
        
        if (!businessId) {
          return res.status(400).json({
            success: false,
            error: 'Business ID required'
          });
        }

        const staff = await prisma.staff.findFirst({
          where: {
            userId: req.user.id,
            businessId: businessId,
            isActive: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this business'
          });
        }

        req.staff = staff;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = staffPermissions; 