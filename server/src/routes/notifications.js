const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent notifications
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: {
        id: id,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Mark all user's unread notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create notification (internal use)
// @route   POST /api/notifications
// @access  Private
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { userId, type, title, message, data } = req.body;

    // Only allow admins or system to create notifications
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create notifications',
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Delete notification
    await prisma.notification.delete({
      where: {
        id: id,
      },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get notification count
// @route   GET /api/notifications/count
// @access  Private
router.get('/count', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalCount, unreadCount] = await Promise.all([
      prisma.notification.count({
        where: {
          userId: userId,
        },
      }),
      prisma.notification.count({
        where: {
          userId: userId,
          isRead: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 