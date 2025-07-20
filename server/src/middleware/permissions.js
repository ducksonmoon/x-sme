const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Define available pages and their default permissions
const AVAILABLE_PAGES = {
  dashboard: {
    name: 'داشبورد',
    description: 'دسترسی به صفحه اصلی داشبورد',
    actions: ['VIEW']
  },
  bookings: {
    name: 'رزروها',
    description: 'مدیریت رزروها و نوبت‌ها',
    actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
  },
  services: {
    name: 'خدمات',
    description: 'مدیریت خدمات و سرویس‌ها',
    actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
  },
  staff: {
    name: 'کارکنان',
    description: 'مدیریت کارکنان و پرسنل',
    actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
  },
  timeslots: {
    name: 'ساعات کاری',
    description: 'مدیریت ساعات کاری و زمان‌بندی',
    actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
  },
  analytics: {
    name: 'گزارشات',
    description: 'مشاهده گزارشات و آمار کسب‌وکار',
    actions: ['VIEW']
  },
  domains: {
    name: 'دامنه‌ها',
    description: 'مدیریت دامنه‌های سفارشی',
    actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
  },
  settings: {
    name: 'تنظیمات',
    description: 'تنظیمات کسب‌وکار',
    actions: ['VIEW', 'EDIT']
  },
  profile: {
    name: 'پروفایل',
    description: 'پروفایل شخصی',
    actions: ['VIEW', 'EDIT']
  }
};

// Permission checking middleware
const checkPermission = (page, action = 'VIEW') => {
  return async (req, res, next) => {
    try {
      // Admin and business owners have full access
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      // Staff need specific permissions
      if (req.user.role === 'STAFF') {
        const staff = await prisma.staff.findFirst({
          where: {
            userId: req.user.id,
            isActive: true
          },
          include: {
            staff_permissions: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Staff profile not found'
          });
        }

        // Check if staff has permission for this page and action
        const permission = staff.staff_permissions.find(
          p => p.page === page && p.action === action && p.isGranted
        );

        if (!permission) {
          return res.status(403).json({
            success: false,
            error: `Access denied: ${action} permission required for ${page}`
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
  };
};

// Check multiple permissions
const checkMultiplePermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      // Admin and business owners have full access
      if (req.user.role === 'ADMIN' || req.user.role === 'BUSINESS_OWNER') {
        return next();
      }

      // Staff need specific permissions
      if (req.user.role === 'STAFF') {
        const staff = await prisma.staff.findFirst({
          where: {
            userId: req.user.id,
            isActive: true
          },
          include: {
            staff_permissions: true
          }
        });

        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Staff profile not found'
          });
        }

        // Check if staff has all required permissions
        for (const { page, action } of permissions) {
          const permission = staff.staff_permissions.find(
            p => p.page === page && p.action === action && p.isGranted
          );

          if (!permission) {
            return res.status(403).json({
              success: false,
              error: `Access denied: ${action} permission required for ${page}`
            });
          }
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
  };
};

// Get staff permissions
const getStaffPermissions = async (staffId) => {
  const permissions = await prisma.staffPermission.findMany({
    where: { staffId }
  });

  // Create a structured permissions object
  const structuredPermissions = {};
  
  Object.keys(AVAILABLE_PAGES).forEach(page => {
    structuredPermissions[page] = {};
    AVAILABLE_PAGES[page].actions.forEach(action => {
      const permission = permissions.find(p => p.page === page && p.action === action);
      structuredPermissions[page][action] = permission ? permission.isGranted : false;
    });
  });

  return structuredPermissions;
};

// Set default permissions for new staff
const setDefaultPermissions = async (staffId) => {
  const defaultPermissions = [
    { page: 'dashboard', action: 'VIEW' },
    { page: 'bookings', action: 'VIEW' },
    { page: 'profile', action: 'VIEW' },
    { page: 'profile', action: 'EDIT' }
  ];

  const permissionData = defaultPermissions.map(({ page, action }) => ({
    staffId,
    page,
    action,
    isGranted: true
  }));

  await prisma.staffPermission.createMany({
    data: permissionData,
    skipDuplicates: true
  });
};

// Update staff permissions
const updateStaffPermissions = async (staffId, permissions) => {
  // Delete existing permissions
  await prisma.staffPermission.deleteMany({
    where: { staffId }
  });

  // Create new permissions
  const permissionData = [];
  
  Object.keys(permissions).forEach(page => {
    Object.keys(permissions[page]).forEach(action => {
      if (permissions[page][action]) {
        permissionData.push({
          staffId,
          page,
          action,
          isGranted: true
        });
      }
    });
  });

  if (permissionData.length > 0) {
    await prisma.staffPermission.createMany({
      data: permissionData
    });
  }
};

module.exports = {
  checkPermission,
  checkMultiplePermissions,
  getStaffPermissions,
  setDefaultPermissions,
  updateStaffPermissions,
  AVAILABLE_PAGES
}; 