const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Add custom methods for structured logging
logger.logBooking = (level, message, bookingData) => {
  logger.log(level, `${message} - Booking ID: ${bookingData.id}, Business: ${bookingData.businessId}`);
};

logger.logPayment = (level, message, paymentData) => {
  logger.log(level, `${message} - Payment ID: ${paymentData.id}, Amount: ${paymentData.amount}, Gateway: ${paymentData.gateway}`);
};

logger.logReminder = (level, message, reminderData) => {
  logger.log(level, `${message} - Reminder ID: ${reminderData.id}, Type: ${reminderData.type}, Channel: ${reminderData.channel}`);
};

logger.logBusiness = (level, message, businessData) => {
  logger.log(level, `${message} - Business ID: ${businessData.id}, Name: ${businessData.name}`);
};

// Add performance logging
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, { operation, duration, ...metadata });
};

// Add security logging
logger.logSecurity = (event, details) => {
  logger.warn(`Security Event: ${event}`, { event, details, timestamp: new Date().toISOString() });
};

// Add API request logging
logger.logApiRequest = (method, url, statusCode, responseTime, userId = null) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger.log(level, `API ${method} ${url} - ${statusCode} (${responseTime}ms)`, {
    method,
    url,
    statusCode,
    responseTime,
    userId,
  });
};

// Add database operation logging
logger.logDatabase = (operation, table, duration, success = true) => {
  const level = success ? 'debug' : 'error';
  logger.log(level, `Database ${operation} on ${table} - ${duration}ms`, {
    operation,
    table,
    duration,
    success,
  });
};

// Add cron job logging
logger.logCronJob = (jobName, status, details = {}) => {
  const level = status === 'success' ? 'info' : 'error';
  logger.log(level, `Cron Job ${jobName}: ${status}`, { jobName, status, ...details });
};

// Add payment gateway logging
logger.logPaymentGateway = (gateway, operation, status, details = {}) => {
  const level = status === 'success' ? 'info' : 'error';
  logger.log(level, `Payment Gateway ${gateway} ${operation}: ${status}`, {
    gateway,
    operation,
    status,
    ...details,
  });
};

// Add reminder service logging
logger.logReminderService = (channel, operation, status, details = {}) => {
  const level = status === 'success' ? 'info' : 'error';
  logger.log(level, `Reminder Service ${channel} ${operation}: ${status}`, {
    channel,
    operation,
    status,
    ...details,
  });
};

// Export the logger
module.exports = logger; 