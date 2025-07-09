const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class RealtimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Track connected users
    this.businessRooms = new Map(); // Track business rooms
  }

  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Real-time service initialized');
  }

  setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          // Allow anonymous connections for public booking widget
          socket.userId = null;
          socket.userType = 'anonymous';
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            businesses: {
              select: { id: true, name: true }
            }
          }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userType = user.role;
        socket.userName = user.name;
        socket.userBusinesses = user.businesses || [];
        
        logger.info(`Socket authenticated: ${user.name} (${user.role})`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    logger.info(`Client connected: ${socket.id} (${socket.userName || 'anonymous'})`);
    
    // Store connected user info
    this.connectedUsers.set(socket.id, {
      userId: socket.userId,
      userType: socket.userType,
      userName: socket.userName,
      businesses: socket.userBusinesses,
      connectedAt: new Date()
    });

    // Handle business room subscriptions
    socket.on('subscribe_business', (businessId) => {
      this.subscribeToBusinessUpdates(socket, businessId);
    });

    socket.on('unsubscribe_business', (businessId) => {
      this.unsubscribeFromBusinessUpdates(socket, businessId);
    });

    // Handle booking-related events
    socket.on('get_live_bookings', (businessId) => {
      this.sendLiveBookings(socket, businessId);
    });

    socket.on('get_live_availability', ({ businessId, serviceId, date }) => {
      this.sendLiveAvailability(socket, businessId, serviceId, date);
    });

    // Handle widget events (for public bookings)
    socket.on('widget_booking_attempt', (data) => {
      this.handleWidgetBookingAttempt(socket, data);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Send connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      userType: socket.userType,
      timestamp: new Date(),
      supportedEvents: [
        'booking_created',
        'booking_updated',
        'booking_cancelled',
        'availability_updated',
        'time_slot_booked',
        'time_slot_freed'
      ]
    });
  }

  subscribeToBusinessUpdates(socket, businessId) {
    if (!businessId) return;

    // Check if user has access to this business
    if (socket.userType !== 'ADMIN' && 
        socket.userType !== 'anonymous' && 
        !socket.userBusinesses?.some(b => b.id === businessId)) {
      socket.emit('error', { message: 'Access denied to business updates' });
      return;
    }

    const roomName = `business_${businessId}`;
    socket.join(roomName);

    // Track business room subscriptions
    if (!this.businessRooms.has(businessId)) {
      this.businessRooms.set(businessId, new Set());
    }
    this.businessRooms.get(businessId).add(socket.id);

    logger.info(`Socket ${socket.id} subscribed to business ${businessId}`);
    socket.emit('subscribed', { businessId, room: roomName });
  }

  unsubscribeFromBusinessUpdates(socket, businessId) {
    if (!businessId) return;

    const roomName = `business_${businessId}`;
    socket.leave(roomName);

    // Remove from business room tracking
    if (this.businessRooms.has(businessId)) {
      this.businessRooms.get(businessId).delete(socket.id);
      if (this.businessRooms.get(businessId).size === 0) {
        this.businessRooms.delete(businessId);
      }
    }

    logger.info(`Socket ${socket.id} unsubscribed from business ${businessId}`);
    socket.emit('unsubscribed', { businessId });
  }

  async sendLiveBookings(socket, businessId) {
    try {
      if (!businessId) return;

      const bookings = await prisma.booking.findMany({
        where: {
          businessId,
          date: {
            gte: new Date()
          }
        },
        include: {
          service: {
            select: { id: true, name: true, price: true }
          }
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ],
        take: 50
      });

      socket.emit('live_bookings', {
        businessId,
        bookings,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error sending live bookings:', error);
      socket.emit('error', { message: 'Failed to fetch live bookings' });
    }
  }

  async sendLiveAvailability(socket, businessId, serviceId, date) {
    try {
      if (!businessId || !serviceId || !date) return;

      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
      const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);

      const timeSlots = await prisma.timeSlot.findMany({
        where: {
          serviceId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { startTime: 'asc' }
      });

      socket.emit('live_availability', {
        businessId,
        serviceId,
        date,
        timeSlots: timeSlots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: !slot.isBooked
        })),
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error sending live availability:', error);
      socket.emit('error', { message: 'Failed to fetch live availability' });
    }
  }

  handleWidgetBookingAttempt(socket, data) {
    // Emit to business room that someone is attempting to book
    const { businessId, serviceId, customerName, date, startTime } = data;
    
    if (businessId) {
      this.io.to(`business_${businessId}`).emit('booking_attempt', {
        customerName: customerName || 'Anonymous',
        serviceId,
        date,
        startTime,
        timestamp: new Date(),
        socketId: socket.id
      });
    }
  }

  handleDisconnection(socket, reason) {
    logger.info(`Client disconnected: ${socket.id} (${reason})`);
    
    // Clean up user tracking
    this.connectedUsers.delete(socket.id);
    
    // Clean up business room tracking
    for (const [businessId, socketIds] of this.businessRooms.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          this.businessRooms.delete(businessId);
        }
      }
    }
  }

  // Public methods for emitting events from routes

  emitBookingCreated(booking) {
    if (!this.io) return;

    const eventData = {
      type: 'booking_created',
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        totalAmount: booking.totalAmount,
        service: booking.service,
        business: booking.business
      },
      timestamp: new Date()
    };

    // Emit to business room
    this.io.to(`business_${booking.businessId}`).emit('booking_created', eventData);
    
    // Emit to admin room
    this.io.to('admin_room').emit('booking_created', eventData);

    logger.info(`Emitted booking_created event for booking ${booking.id}`);
  }

  emitBookingUpdated(booking, previousStatus) {
    if (!this.io) return;

    const eventData = {
      type: 'booking_updated',
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        previousStatus,
        totalAmount: booking.totalAmount,
        service: booking.service,
        business: booking.business
      },
      timestamp: new Date()
    };

    // Emit to business room
    this.io.to(`business_${booking.businessId}`).emit('booking_updated', eventData);
    
    // Emit to admin room
    this.io.to('admin_room').emit('booking_updated', eventData);

    logger.info(`Emitted booking_updated event for booking ${booking.id}`);
  }

  emitBookingCancelled(booking, reason) {
    if (!this.io) return;

    const eventData = {
      type: 'booking_cancelled',
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        totalAmount: booking.totalAmount,
        service: booking.service,
        business: booking.business
      },
      reason,
      timestamp: new Date()
    };

    // Emit to business room
    this.io.to(`business_${booking.businessId}`).emit('booking_cancelled', eventData);
    
    // Emit to admin room
    this.io.to('admin_room').emit('booking_cancelled', eventData);

    logger.info(`Emitted booking_cancelled event for booking ${booking.id}`);
  }

  emitAvailabilityUpdated(businessId, serviceId, date, timeSlots) {
    if (!this.io) return;

    const eventData = {
      type: 'availability_updated',
      businessId,
      serviceId,
      date,
      timeSlots: timeSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !slot.isBooked
      })),
      timestamp: new Date()
    };

    // Emit to business room
    this.io.to(`business_${businessId}`).emit('availability_updated', eventData);

    // Emit to public room for widget updates
    this.io.to(`public_${businessId}`).emit('availability_updated', eventData);

    logger.info(`Emitted availability_updated event for business ${businessId}, service ${serviceId}`);
  }

  emitTimeSlotBooked(businessId, serviceId, timeSlot, booking) {
    if (!this.io) return;

    const eventData = {
      type: 'time_slot_booked',
      businessId,
      serviceId,
      timeSlot: {
        id: timeSlot.id,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        date: timeSlot.date
      },
      booking: {
        id: booking.id,
        customerName: booking.customerName
      },
      timestamp: new Date()
    };

    // Emit to business room
    this.io.to(`business_${businessId}`).emit('time_slot_booked', eventData);

    // Emit to public room for widget updates
    this.io.to(`public_${businessId}`).emit('time_slot_booked', eventData);

    logger.info(`Emitted time_slot_booked event for slot ${timeSlot.id}`);
  }

  emitTimeSlotFreed(businessId, serviceId, timeSlot) {
    if (!this.io) return;

    const eventData = {
      type: 'time_slot_freed',
      businessId,
      serviceId,
      timeSlot: {
        id: timeSlot.id,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        date: timeSlot.date
      },
      timestamp: new Date()
    };

    // Emit to business room
    this.io.to(`business_${businessId}`).emit('time_slot_freed', eventData);

    // Emit to public room for widget updates
    this.io.to(`public_${businessId}`).emit('time_slot_freed', eventData);

    logger.info(`Emitted time_slot_freed event for slot ${timeSlot.id}`);
  }

  // Utility methods
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getBusinessRoomsCount() {
    return this.businessRooms.size;
  }

  getBusinessConnections(businessId) {
    return this.businessRooms.get(businessId)?.size || 0;
  }

  getStatus() {
    return {
      isInitialized: !!this.io,
      connectedUsers: this.getConnectedUsersCount(),
      businessRooms: this.getBusinessRoomsCount(),
      rooms: Array.from(this.businessRooms.keys()).map(businessId => ({
        businessId,
        connections: this.getBusinessConnections(businessId)
      }))
    };
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

module.exports = realtimeService; 