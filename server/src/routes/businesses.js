const express = require("express");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateBusiness = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^(\+98|0)?9\d{9}$/)
    .withMessage("Invalid Iranian phone number"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address too long"),
  body("website").optional().isURL().withMessage("Invalid website URL"),
  body("theme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage("Theme must be light or dark"),
  body("timezone")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Invalid timezone"),
  body("workingHours")
    .optional()
    .isObject()
    .withMessage("Working hours must be an object"),
  body("workingHours.start")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:MM)"),
  body("workingHours.end")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:MM)"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          services: {
            where: { isActive: true },
            select: { id: true, name: true, price: true },
          },
          settings: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.business.count({ where }),
    ]);

    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user's business (for business owners and staff)
// @route   GET /api/businesses/my-business
// @access  Private (Business owners and staff only)
router.get(
  "/my-business",
  authenticate,
  authorize("BUSINESS_OWNER", "STAFF"),
  async (req, res, next) => {
    try {
      if (!req.user.businessId) {
        return res.status(403).json({
          success: false,
          error: "No business assigned to this user",
        });
      }

      const business = await prisma.business.findUnique({
        where: { id: req.user.businessId },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { name: "asc" },
          },
          workingHours: {
            where: { isActive: true },
            orderBy: { dayOfWeek: "asc" },
          },
          settings: true,
          users: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
            orderBy: { role: "asc" },
          },
        },
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Business not found",
        });
      }

      res.json({
        success: true,
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Get single business
// @route   GET /api/businesses/:id
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        workingHours: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
        settings: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
      });
    }

    // Format settings if they exist
    if (business.settings) {
      business.settings = formatSettingsResponse(business.settings);
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get working hours for a business
// @route   GET /api/businesses/:id/working-hours
// @access  Public
router.get("/:id/working-hours", async (req, res, next) => {
  try {
    const { id } = req.params;

    const workingHours = await prisma.workingHour.findMany({
      where: {
        businessId: id,
        isActive: true
      },
      orderBy: { dayOfWeek: "asc" }
    });

    res.json({
      success: true,
      data: workingHours,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create business
// @route   POST /api/businesses
// @access  Public
router.post("/", validateBusiness, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const {
      name,
      description,
      phone,
      email,
      address,
      website,
      logo,
      theme,
      timezone,
    } = req.body;

    const business = await prisma.business.create({
      data: {
        name,
        description,
        phone,
        email,
        address,
        website,
        logo,
        theme: theme || "light",
        timezone: timezone || "Asia/Tehran",
        settings: {
          create: {
            depositRequired: false,
            depositPercentage: 0,
            paymentRequired: false,
            paymentGateways: {
              zarinpal: { enabled: true, merchantId: "" },
              pasargad: { enabled: false, merchantId: "", terminalId: "" },
              saman: { enabled: false, merchantId: "" },
            },
            currency: "toman",
            cancellationPolicy: "24h",
            reminderTime: 60,
            smsEnabled: true,
            telegramEnabled: false,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    // Format settings if they exist
    if (business.settings) {
      business.settings = formatSettingsResponse(business.settings);
    }

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private (Business owners and staff only)
router.put("/:id", authenticate, authorize("BUSINESS_OWNER", "STAFF"), validateBusiness, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    const { workingHours, ...businessData } = updateData;

    console.log("Updating business:", id, "with data:", { businessData, workingHours });

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    // Update business data
    const business = await prisma.business.update({
      where: { id },
      data: businessData,
      include: {
        settings: true,
        workingHours: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    // Update working hours if provided
    if (workingHours && workingHours.start && workingHours.end) {
      // Check if working hours exist for this business
      const existingWorkingHours = await prisma.workingHour.findMany({
        where: { businessId: id },
      });

      if (existingWorkingHours.length === 0) {
        // Create working hours for all days of the week
        const workingHoursData = [];
        for (let day = 0; day < 7; day++) {
          workingHoursData.push({
            businessId: id,
            dayOfWeek: day,
            startTime: workingHours.start,
            endTime: workingHours.end,
            isActive: true,
          });
        }
        await prisma.workingHour.createMany({
          data: workingHoursData,
        });
      } else {
        // Update existing working hours
        await prisma.workingHour.updateMany({
          where: { businessId: id },
          data: {
            startTime: workingHours.start,
            endTime: workingHours.end,
          },
        });
      }
    }

    // Fetch updated business with working hours
    const updatedBusiness = await prisma.business.findUnique({
      where: { id },
      include: {
        settings: true,
        workingHours: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    // Format settings if they exist
    if (updatedBusiness.settings) {
      updatedBusiness.settings = formatSettingsResponse(updatedBusiness.settings);
    }

    res.json({
      success: true,
      data: updatedBusiness,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete business
// @route   DELETE /api/businesses/:id
// @access  Public
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.business.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "Business deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get business availability
// @route   GET /api/businesses/:id/availability
// @access  Public
router.get("/:id/availability", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({
        success: false,
        error: "Date and serviceId are required",
      });
    }

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        services: {
          where: { id: serviceId, isActive: true },
        },
        workingHours: {
          where: { isActive: true },
        },
        holidays: {
          where: {
            date: new Date(date),
            isActive: true,
          },
        },
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
      });
    }

    if (business.holidays.length > 0) {
      return res.json({
        success: true,
        data: {
          available: false,
          reason: "Holiday",
          slots: [],
        },
      });
    }

    // Get working hours for the day
    const dayOfWeek = new Date(date).getDay();
    const workingHour = business.workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek
    );

    if (!workingHour) {
      return res.json({
        success: true,
        data: {
          available: false,
          reason: "Closed",
          slots: [],
        },
      });
    }

    // Generate time slots
    const slots = generateTimeSlots(
      workingHour.startTime,
      workingHour.endTime,
      30
    );

    // Get booked slots
    const bookedSlots = await prisma.booking.findMany({
      where: {
        businessId: id,
        serviceId,
        date: new Date(date),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startTime: true, endTime: true },
    });

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => {
      return !bookedSlots.some(
        (booked) =>
          booked.startTime === slot.startTime && booked.endTime === slot.endTime
      );
    });

    res.json({
      success: true,
      data: {
        available: availableSlots.length > 0,
        slots: availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, intervalMinutes = 30) {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  while (start < end) {
    const slotStart = start.toTimeString().slice(0, 5);
    start.setMinutes(start.getMinutes() + intervalMinutes);
    const slotEnd = start.toTimeString().slice(0, 5);

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
    });
  }

  return slots;
}

// @desc    Get business settings
// @route   GET /api/businesses/:id/settings
// @access  Private (Business owners and staff only)
router.get("/:id/settings", authenticate, authorize("BUSINESS_OWNER", "STAFF"), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: id },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.businessSettings.create({
        data: {
          businessId: id,
        },
      });
      
      // Format the response with nested paymentSettings
      const formattedSettings = formatSettingsResponse(defaultSettings);
      return res.json({
        success: true,
        data: formattedSettings,
      });
    }

    // Format the response with nested paymentSettings
    const formattedSettings = formatSettingsResponse(settings);
    res.json({
      success: true,
      data: formattedSettings,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to format settings response
function formatSettingsResponse(settings) {
  const {
    paymentRequired,
    depositRequired,
    depositPercentage,
    paymentGateways,
    currency,
    ...otherSettings
  } = settings;

  return {
    ...otherSettings,
    paymentSettings: {
      paymentRequired: paymentRequired || false,
      depositRequired: depositRequired || false,
      depositPercentage: depositPercentage || 30,
      paymentGateways: paymentGateways || {
        zarinpal: { enabled: true, merchantId: "" },
        pasargad: { enabled: false, merchantId: "", terminalId: "" },
        saman: { enabled: false, merchantId: "" },
      },
      currency: currency || "toman",
    },
  };
}

// @desc    Update business settings
// @route   PUT /api/businesses/:id/settings
// @access  Private (Business owners and staff only)
router.put("/:id/settings", authenticate, authorize("BUSINESS_OWNER", "STAFF"), async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    console.log("Updating business settings:", id, "with data:", updateData);

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    // Handle nested paymentSettings object
    if (updateData.paymentSettings) {
      const { paymentSettings, ...otherData } = updateData;
      updateData = {
        ...otherData,
        paymentRequired: paymentSettings.paymentRequired,
        depositRequired: paymentSettings.depositRequired,
        depositPercentage: paymentSettings.depositPercentage,
        paymentGateways: paymentSettings.paymentGateways,
        currency: paymentSettings.currency,
      };
    }

    // Validate time formats
    const timeFields = ['lunchBreakStart', 'lunchBreakEnd', 'peakHoursStart', 'peakHoursEnd'];
    for (const field of timeFields) {
      if (updateData[field] && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updateData[field])) {
        return res.status(400).json({
          success: false,
          error: `Invalid time format for ${field}. Use HH:MM format.`,
        });
      }
    }

    // Validate numeric fields
    const numericFields = ['bufferBetweenSlots', 'maxBookingsPerSlot', 'advanceBookingDays', 'maxSlotsPerDay', 'reminderTime', 'depositPercentage'];
    for (const field of numericFields) {
      if (updateData[field] !== undefined && (isNaN(updateData[field]) || updateData[field] < 0)) {
        return res.status(400).json({
          success: false,
          error: `${field} must be a positive number.`,
        });
      }
    }

    // Update or create settings
    const settings = await prisma.businessSettings.upsert({
      where: { businessId: id },
      update: updateData,
      create: {
        businessId: id,
        ...updateData,
      },
    });

    console.log("Business settings updated successfully:", settings);

    // Format the response with nested paymentSettings
    const formattedSettings = formatSettingsResponse(settings);

    res.json({
      success: true,
      data: formattedSettings,
    });
  } catch (error) {
    console.error("Error updating business settings:", error);
    next(error);
  }
});

// @desc    Get widget configuration (Public for hosted widgets)
// @route   GET /api/businesses/:id/widget-config/public
// @access  Public
router.get("/:id/widget-config/public", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { id },
      select: { 
        id: true, 
        isActive: true,
        name: true,
        description: true,
        phone: true,
        address: true,
        logo: true
      },
    });

    if (!business || !business.isActive) {
      return res.status(404).json({
        success: false,
        error: "Business not found or inactive",
      });
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: id },
    });

    // Default widget configuration
    const defaultWidgetConfig = {
      businessId: id,
      theme: "auto",
      language: "fa",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      borderRadius: 8,
      showLogo: true,
      allowNotes: true,
      requireEmail: false,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      embedMode: false, // Always false for hosted widgets
      showBusinessInfo: true,
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    // If settings exist and have widget config, merge with defaults
    if (settings && settings.widgetConfig) {
      const widgetConfig = typeof settings.widgetConfig === 'string' 
        ? JSON.parse(settings.widgetConfig) 
        : settings.widgetConfig;
      
      const mergedConfig = { 
        ...defaultWidgetConfig, 
        ...widgetConfig,
        embedMode: false, // Always false for hosted widgets
      };
      mergedConfig.lastUpdated = new Date().toISOString();
      
      return res.json({
        success: true,
        data: {
          widgetConfig: mergedConfig,
          business: business
        },
      });
    }

    res.json({
      success: true,
      data: {
        widgetConfig: defaultWidgetConfig,
        business: business
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get widget configuration
// @route   GET /api/businesses/:id/widget-config
// @access  Private (Business owners and staff only)
router.get("/:id/widget-config", authenticate, authorize("BUSINESS_OWNER", "STAFF"), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: id },
    });

    // Default widget configuration
    const defaultWidgetConfig = {
      businessId: id,
      theme: "auto",
      language: "fa",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      borderRadius: 8,
      showLogo: true,
      allowNotes: true,
      requireEmail: false,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      embedMode: true,
      showBusinessInfo: true,
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    // If settings exist and have widget config, merge with defaults
    if (settings && settings.widgetConfig) {
      const widgetConfig = typeof settings.widgetConfig === 'string' 
        ? JSON.parse(settings.widgetConfig) 
        : settings.widgetConfig;
      
      const mergedConfig = { ...defaultWidgetConfig, ...widgetConfig };
      mergedConfig.lastUpdated = new Date().toISOString();
      
      return res.json({
        success: true,
        data: mergedConfig,
      });
    }

    res.json({
      success: true,
      data: defaultWidgetConfig,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update widget configuration
// @route   PUT /api/businesses/:id/widget-config
// @access  Private (Business owners and staff only)
router.put("/:id/widget-config", authenticate, authorize("BUSINESS_OWNER", "STAFF"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const widgetConfig = req.body;

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    // Validate required fields
    if (!widgetConfig.businessId || widgetConfig.businessId !== id) {
      return res.status(400).json({
        success: false,
        error: "Invalid business ID",
      });
    }

    // Validate color format
    if (widgetConfig.primaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(widgetConfig.primaryColor)) {
      return res.status(400).json({
        success: false,
        error: "Invalid primary color format",
      });
    }

    if (widgetConfig.secondaryColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(widgetConfig.secondaryColor)) {
      return res.status(400).json({
        success: false,
        error: "Invalid secondary color format",
      });
    }

    // Validate numeric ranges
    if (widgetConfig.borderRadius !== undefined && (widgetConfig.borderRadius < 0 || widgetConfig.borderRadius > 50)) {
      return res.status(400).json({
        success: false,
        error: "Border radius must be between 0 and 50",
      });
    }

    if (widgetConfig.maxAdvanceBooking !== undefined && (widgetConfig.maxAdvanceBooking < 1 || widgetConfig.maxAdvanceBooking > 365)) {
      return res.status(400).json({
        success: false,
        error: "Max advance booking must be between 1 and 365 days",
      });
    }

    if (widgetConfig.minAdvanceBooking !== undefined && (widgetConfig.minAdvanceBooking < 1 || widgetConfig.minAdvanceBooking > 48)) {
      return res.status(400).json({
        success: false,
        error: "Min advance booking must be between 1 and 48 hours",
      });
    }

    // Update widget configuration
    const settings = await prisma.businessSettings.upsert({
      where: { businessId: id },
      update: {
        widgetConfig: JSON.stringify(widgetConfig),
      },
      create: {
        businessId: id,
        widgetConfig: JSON.stringify(widgetConfig),
      },
    });

    res.json({
      success: true,
      data: widgetConfig,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get widget embed code
// @route   GET /api/businesses/:id/widget-embed
// @access  Private (Business owners and staff only)
router.get("/:id/widget-embed", authenticate, authorize("BUSINESS_OWNER", "STAFF"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { domain } = req.query;

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: id },
    });

    let widgetConfig = {
      businessId: id,
      theme: "auto",
      primaryColor: "#3b82f6",
      borderRadius: 8,
      showLogo: true,
      allowNotes: true,
      requireEmail: false,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
    };

    if (settings && settings.widgetConfig) {
      const config = typeof settings.widgetConfig === 'string' 
        ? JSON.parse(settings.widgetConfig) 
        : settings.widgetConfig;
      widgetConfig = { ...widgetConfig, ...config };
    }

    const attributes = [
      `data-business-id="${widgetConfig.businessId}"`,
      `data-theme="${widgetConfig.theme}"`,
      `data-primary-color="${widgetConfig.primaryColor}"`,
      `data-border-radius="${widgetConfig.borderRadius}"`,
      `data-show-logo="${widgetConfig.showLogo}"`,
      `data-allow-notes="${widgetConfig.allowNotes}"`,
      `data-require-email="${widgetConfig.requireEmail}"`,
      `data-max-advance-booking="${widgetConfig.maxAdvanceBooking}"`,
      `data-min-advance-booking="${widgetConfig.minAdvanceBooking}"`,
    ];

    if (widgetConfig.secondaryColor) {
      attributes.push(`data-secondary-color="${widgetConfig.secondaryColor}"`);
    }

    if (widgetConfig.customLogo) {
      attributes.push(`data-custom-logo="${widgetConfig.customLogo}"`);
    }

    const embedCode = `<script src="${domain || req.get('origin')}/widget.js" ${attributes.join(" ")}></script>`;

    res.json({
      success: true,
      data: {
        embedCode,
        config: widgetConfig,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get widget preview URL
// @route   GET /api/businesses/:id/widget-preview-url
// @access  Private (Business owners and staff only)
router.get("/:id/widget-preview-url", authenticate, authorize("BUSINESS_OWNER", "STAFF"), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user has access to this business
    if (req.user.businessId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this business",
      });
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { businessId: id },
    });

    let widgetConfig = {
      businessId: id,
      theme: "auto",
      primaryColor: "#3b82f6",
      borderRadius: 8,
      showLogo: true,
      allowNotes: true,
      requireEmail: false,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
    };

    if (settings && settings.widgetConfig) {
      const config = typeof settings.widgetConfig === 'string' 
        ? JSON.parse(settings.widgetConfig) 
        : settings.widgetConfig;
      widgetConfig = { ...widgetConfig, ...config };
    }

    const params = new URLSearchParams({
      businessId: widgetConfig.businessId,
      theme: widgetConfig.theme,
      primaryColor: widgetConfig.primaryColor,
      borderRadius: widgetConfig.borderRadius.toString(),
      showLogo: widgetConfig.showLogo.toString(),
      allowNotes: widgetConfig.allowNotes.toString(),
      requireEmail: widgetConfig.requireEmail.toString(),
      maxAdvanceBooking: widgetConfig.maxAdvanceBooking.toString(),
      minAdvanceBooking: widgetConfig.minAdvanceBooking.toString(),
    });

    if (widgetConfig.secondaryColor) {
      params.set("secondaryColor", widgetConfig.secondaryColor);
    }

    if (widgetConfig.customLogo) {
      params.set("customLogo", widgetConfig.customLogo);
    }

    const previewUrl = `${req.get('origin')}/widget-preview?${params.toString()}`;

    res.json({
      success: true,
      data: {
        previewUrl,
        config: widgetConfig,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
