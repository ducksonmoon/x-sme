/**
 * X-SME Booking Widget - Embeddable Script
 * Localized Booking & Payment Widget for Iranian SMEs
 * 
 * Usage:
 * <script src="https://your-domain.com/widget.js"></script>
 * <div id="xsme-booking-widget" data-business-id="your-business-id"></div>
 */

(function() {
  'use strict';

  // Widget configuration - matching BookingWidget.tsx structure
  const WIDGET_CONFIG = {
    apiBaseUrl: 'https://api.x-sme.ir',
    widgetBaseUrl: window.location.origin,
    version: '1.2.0'
  };

  // Default widget options - matching BookingWidgetProps interface
  const DEFAULT_OPTIONS = {
    // Core props from BookingWidgetProps
    businessId: null,
    embedMode: true,
    theme: 'auto', // 'light' | 'dark' | 'auto'
    showLogo: true,
    accentColor: '#3b82f6',
    customLogo: null, // New: Custom logo URL
    primaryColor: '#3b82f6', // New: Primary color for theming
    secondaryColor: null, // New: Secondary color for theming
    
    // Additional customization options
    language: 'fa',
    borderRadius: 8,
    showBusinessInfo: true,
    allowNotes: true,
    requireEmail: false,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2,
    
    // Callback functions
    onBookingComplete: null,
    onBookingStarted: null,
    onBookingCancelled: null,
    onServiceSelected: null,
    onStaffSelected: null,
    onDateSelected: null,
    onTimeSelected: null,
    onWidgetRestart: null,
    onAvailabilityRefreshed: null,
    onError: null,
    onReady: null,
    onLoaded: null
  };

  // Event types matching BookingWidget.tsx triggerWidgetEvent calls
  const WIDGET_EVENTS = {
    // Booking flow events
    BOOKING_STARTED: 'booking:started',
    BOOKING_COMPLETE: 'booking:complete',
    BOOKING_CANCELLED: 'booking:cancelled',
    
    // Selection events
    SERVICE_SELECTED: 'service:selected',
    STAFF_SELECTED: 'staff:selected',
    DATE_SELECTED: 'date:selected',
    TIME_SELECTED: 'time:selected',
    
    // Widget lifecycle events
    WIDGET_RESTART: 'widget:restart',
    AVAILABILITY_REFRESHED: 'availability:refreshed',
    REFRESH_COMPLETE: 'refresh:complete',
    
    // System events
    ERROR: 'error',
    WIDGET_READY: 'widget:ready',
    RESIZE: 'resize',
    UPDATE_CONFIG: 'update:config',
    FORCE_REFRESH_DATA: 'force:refresh:data'
  };

  /**
   * Initialize X-SME Booking Widget
   */
  function initXSMEWidget() {
    // Find all widget containers
    const containers = document.querySelectorAll('[id^="xsme-booking-widget"]');
    
    containers.forEach(container => {
      const businessId = container.getAttribute('data-business-id') || 
                        container.getAttribute('data-business') ||
                        container.getAttribute('data-businessid');
      
      if (!businessId) {
        console.error('X-SME Widget: business-id is required');
        return;
      }

      // Parse options from data attributes
      const options = parseOptions(container, businessId);
      
      // Create widget
      createWidget(container, businessId, options);
    });
  }

  /**
   * Parse widget options from data attributes - matching BookingWidgetProps
   */
  function parseOptions(container, businessId) {
    const options = { ...DEFAULT_OPTIONS, businessId };
    
    // Core BookingWidgetProps attributes
    const embedMode = container.getAttribute('data-embed-mode');
    const theme = container.getAttribute('data-theme');
    const showLogo = container.getAttribute('data-show-logo');
    const accentColor = container.getAttribute('data-accent-color') || 
                       container.getAttribute('data-primary-color');
    const customLogo = container.getAttribute('data-custom-logo') || 
                      container.getAttribute('data-logo');
    const primaryColor = container.getAttribute('data-primary-color') || 
                        container.getAttribute('data-accent-color');
    const secondaryColor = container.getAttribute('data-secondary-color');
    
    // Additional customization attributes
    const language = container.getAttribute('data-language');
    const borderRadius = container.getAttribute('data-border-radius');
    const showBusinessInfo = container.getAttribute('data-show-business-info');
    const allowNotes = container.getAttribute('data-allow-notes');
    const requireEmail = container.getAttribute('data-require-email');
    const maxAdvanceBooking = container.getAttribute('data-max-advance-booking');
    const minAdvanceBooking = container.getAttribute('data-min-advance-booking');
    
    // Parse boolean values
    if (embedMode !== null) options.embedMode = embedMode !== 'false';
    if (theme) options.theme = theme;
    if (showLogo !== null) options.showLogo = showLogo !== 'false';
    if (accentColor) options.accentColor = accentColor;
    if (customLogo) options.customLogo = customLogo;
    if (primaryColor) options.primaryColor = primaryColor;
    if (secondaryColor) options.secondaryColor = secondaryColor;
    if (language) options.language = language;
    if (borderRadius) options.borderRadius = parseInt(borderRadius);
    if (showBusinessInfo !== null) options.showBusinessInfo = showBusinessInfo !== 'false';
    if (allowNotes !== null) options.allowNotes = allowNotes !== 'false';
    if (requireEmail !== null) options.requireEmail = requireEmail === 'true';
    if (maxAdvanceBooking) options.maxAdvanceBooking = parseInt(maxAdvanceBooking);
    if (minAdvanceBooking) options.minAdvanceBooking = parseInt(minAdvanceBooking);
    
    // Setup callback functions from global scope
    setupCallbacks(options);
    
    return options;
  }

  /**
   * Setup callback functions from global scope
   */
  function setupCallbacks(options) {
    const callbackMappings = {
      onBookingComplete: 'xsmeOnBookingComplete',
      onBookingStarted: 'xsmeOnBookingStarted',
      onBookingCancelled: 'xsmeOnBookingCancelled',
      onServiceSelected: 'xsmeOnServiceSelected',
      onStaffSelected: 'xsmeOnStaffSelected',
      onDateSelected: 'xsmeOnDateSelected',
      onTimeSelected: 'xsmeOnTimeSelected',
      onWidgetRestart: 'xsmeOnWidgetRestart',
      onAvailabilityRefreshed: 'xsmeOnAvailabilityRefreshed',
      onError: 'xsmeOnError',
      onReady: 'xsmeOnReady',
      onLoaded: 'xsmeOnLoaded'
    };

    Object.entries(callbackMappings).forEach(([optionKey, globalKey]) => {
      if (window[globalKey] && typeof window[globalKey] === 'function') {
        options[optionKey] = window[globalKey];
      }
    });
  }

  /**
   * Create widget iframe - matching BookingWidget structure
   */
  function createWidget(container, businessId, options) {
    // Create iframe
    const iframe = document.createElement('iframe');
    
    // Build widget URL with parameters - matching BookingWidgetProps
    const params = new URLSearchParams({
      businessId,
      embedMode: options.embedMode.toString(),
      theme: options.theme,
      showLogo: options.showLogo.toString(),
      accentColor: options.accentColor,
      language: options.language,
      borderRadius: options.borderRadius.toString(),
      showBusinessInfo: options.showBusinessInfo.toString(),
      allowNotes: options.allowNotes.toString(),
      requireEmail: options.requireEmail.toString(),
      maxAdvanceBooking: options.maxAdvanceBooking.toString(),
      minAdvanceBooking: options.minAdvanceBooking.toString(),
      customLogo: options.customLogo,
      primaryColor: options.primaryColor,
      secondaryColor: options.secondaryColor
    });
    
    iframe.src = `${WIDGET_CONFIG.widgetBaseUrl}/widget?${params.toString()}`;
    
    // Apply styling - matching BookingWidget visual structure
    iframe.style.cssText = `
      width: 100%;
      height: 480px;
      min-height: 400px;
      border: none;
      border-radius: ${options.borderRadius}px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --primary-color: ${options.accentColor};
      --border-radius: ${options.borderRadius}px;
      overflow: hidden;
      transition: height 0.3s ease;
      background: white;
    `;

    // Responsive sizing - matching BookingWidget responsive design
    applyResponsiveSizing(iframe);

    // Add iframe attributes
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'X-SME Booking Widget');
    
    // Clear container and add iframe
    container.innerHTML = '';
    container.appendChild(iframe);
    
    // Apply CSS variables to container - matching BookingWidget styling
    container.style.setProperty('--primary-color', options.accentColor);
    container.style.setProperty('--border-radius', `${options.borderRadius}px`);
    container.style.overflow = 'hidden';
    container.style.borderRadius = `${options.borderRadius}px`;
    
    // Setup message listener for iframe communication
    setupMessageListener(iframe, container, options);
    
    // Handle iframe load for initial setup
    iframe.onload = function() {
      // Send initial configuration to iframe
      setTimeout(() => {
        iframe.contentWindow.postMessage({
          type: 'PARENT_READY',
          data: { options, businessId }
        }, '*');
      }, 100);
      
      // Trigger widget loaded event
      triggerWidgetEvent('loaded', { 
        containerId: container.id, 
        businessId: businessId,
        config: options 
      }, container.id);
    };

    // Handle window resize for responsive iframe sizing
    const handleResize = () => applyResponsiveSizing(iframe);
    window.addEventListener('resize', handleResize);
    iframe._resizeCleanup = () => {
      window.removeEventListener('resize', handleResize);
    };
    
    // Handle iframe errors
    iframe.onerror = function(error) {
      console.error('X-SME Widget: Iframe load error:', error);
      triggerWidgetEvent('error', { 
        type: 'iframe_load_error',
        error: error.message || 'Failed to load widget',
        containerId: container.id,
        businessId: businessId
      }, container.id);
    };
    
    // Trigger widget created event
    triggerWidgetEvent('created', { 
      containerId: container.id, 
      businessId: businessId,
      config: options 
    }, container.id);
  }

  /**
   * Apply responsive sizing - matching BookingWidget responsive design
   */
  function applyResponsiveSizing(iframe) {
    if (window.innerWidth >= 1024) {
      iframe.style.minHeight = '520px';
      if (parseInt(iframe.style.height) < 520) {
        iframe.style.height = '580px';
      }
    } else if (window.innerWidth >= 768) {
      iframe.style.minHeight = '480px';
      if (parseInt(iframe.style.height) < 480) {
        iframe.style.height = '520px';
      }
    } else {
      iframe.style.minHeight = '400px';
      if (parseInt(iframe.style.height) < 400) {
        iframe.style.height = '480px';
      }
    }
  }

  /**
   * Setup message listener for iframe communication - matching BookingWidget events
   */
  function setupMessageListener(iframe, container, options) {
    function handleMessage(event) {
      // Verify origin (allow both production and development)
      const allowedOrigins = [
      'x-sme.ir', 
      'localhost:3000', 
      '127.0.0.1:3000',
      window.location.hostname
    ];
      const isAllowedOrigin = allowedOrigins.some(origin => event.origin.includes(origin));
      if (!isAllowedOrigin) return;

      try {
        const { type, data } = event.data;

        switch (type) {
          case 'RESIZE':
            if (data && data.height) {
              // Desktop-responsive height calculation - matching BookingWidget layout
              let minHeight = 400;
              let padding = 20;
              
              if (window.innerWidth >= 768) {
                minHeight = 480;
                padding = 30;
              }
              if (window.innerWidth >= 1024) {
                minHeight = 520;
                padding = 40;
              }
              
              const newHeight = Math.max(data.height + padding, minHeight);
              iframe.style.height = `${newHeight}px`;
              iframe.style.transition = 'height 0.3s ease';
            }
            break;
            
          case 'WIDGET_READY':
            // Widget is ready, send acknowledgment
            iframe.contentWindow.postMessage({
              type: 'PARENT_READY',
              data: { options, businessId: options.businessId }
            }, '*');
            
            // Trigger widget ready events
            triggerWidgetEvent('ready', { 
              containerId: container.id, 
              businessId: options.businessId,
              config: options 
            });
            break;
            
          // Booking flow events - matching BookingWidget triggerWidgetEvent calls
          case 'BOOKING_STARTED':
            handleBookingEvent('booking:started', data, options);
            break;
            
          case 'BOOKING_COMPLETE':
            handleBookingEvent('booking:complete', data, options);
            break;
            
          case 'BOOKING_CANCELLED':
            handleBookingEvent('booking:cancelled', data, options);
            break;
            
          // Selection events - matching BookingWidget event triggers
          case 'SERVICE_SELECTED':
            handleSelectionEvent('service:selected', data, options);
            break;
            
          case 'STAFF_SELECTED':
            handleSelectionEvent('staff:selected', data, options);
            break;
            
          case 'DATE_SELECTED':
            handleSelectionEvent('date:selected', data, options);
            break;
            
          case 'TIME_SELECTED':
            handleSelectionEvent('time:selected', data, options);
            break;
            
          // Widget lifecycle events
          case 'WIDGET_RESTART':
            handleWidgetEvent('widget:restart', data, options);
            break;
            
          case 'AVAILABILITY_REFRESHED':
            handleWidgetEvent('availability:refreshed', data, options);
            break;
            
          case 'REFRESH_COMPLETE':
            handleRefreshComplete(data);
            break;
            
          case 'ERROR':
            handleErrorEvent(data, options);
            break;
            
          case 'FORCE_REFRESH_DATA':
            // Force iframe to refresh its data
            iframe.contentWindow.postMessage({
              type: 'FORCE_REFRESH_DATA'
            }, '*');
            break;
            
          case 'UPDATE_CONFIG':
            // Handle config updates from widget
            handleConfigUpdate(data, container, iframe);
            break;
            
          case 'REDIRECT':
            if (data && data.url) {
              window.open(data.url, '_blank');
            }
            break;
        }
      } catch (error) {
        console.warn('X-SME Widget: Invalid message format', error);
      }
    }
    
    window.addEventListener('message', handleMessage);
    
    // Store cleanup function on iframe for later removal
    iframe._messageCleanup = () => {
      window.removeEventListener('message', handleMessage);
    };

    // Enhanced cleanup for all event listeners
    iframe._cleanup = () => {
      if (iframe._messageCleanup) iframe._messageCleanup();
      if (iframe._resizeCleanup) iframe._resizeCleanup();
    };
  }

  /**
   * Handle booking events - matching BookingWidget event structure
   */
  function handleBookingEvent(eventType, data, options) {
    // Trigger global event
    triggerWidgetEvent(eventType, data);
    
    // Call specific callback if provided
    const callbackMappings = {
      'booking:started': 'onBookingStarted',
      'booking:complete': 'onBookingComplete',
      'booking:cancelled': 'onBookingCancelled'
    };
    
    const callbackName = callbackMappings[eventType];
    if (callbackName && options[callbackName] && typeof options[callbackName] === 'function') {
      try {
        options[callbackName](data);
      } catch (error) {
        console.error(`X-SME Widget: Error in ${callbackName} callback:`, error);
      }
    }
  }

  /**
   * Handle selection events - matching BookingWidget selection handlers
   */
  function handleSelectionEvent(eventType, data, options) {
    // Trigger global event
    triggerWidgetEvent(eventType, data);
    
    // Call specific callback if provided
    const callbackMappings = {
      'service:selected': 'onServiceSelected',
      'staff:selected': 'onStaffSelected',
      'date:selected': 'onDateSelected',
      'time:selected': 'onTimeSelected'
    };
    
    const callbackName = callbackMappings[eventType];
    if (callbackName && options[callbackName] && typeof options[callbackName] === 'function') {
      try {
        options[callbackName](data);
      } catch (error) {
        console.error(`X-SME Widget: Error in ${callbackName} callback:`, error);
      }
    }
  }

  /**
   * Handle widget lifecycle events
   */
  function handleWidgetEvent(eventType, data, options) {
    // Trigger global event
    triggerWidgetEvent(eventType, data);
    
    // Call specific callback if provided
    const callbackMappings = {
      'widget:restart': 'onWidgetRestart',
      'availability:refreshed': 'onAvailabilityRefreshed'
    };
    
    const callbackName = callbackMappings[eventType];
    if (callbackName && options[callbackName] && typeof options[callbackName] === 'function') {
      try {
        options[callbackName](data);
      } catch (error) {
        console.error(`X-SME Widget: Error in ${callbackName} callback:`, error);
      }
    }
  }

  /**
   * Handle refresh complete - matching BookingWidget refresh feedback
   */
  function handleRefreshComplete(data) {
    // Show success notification for refresh
    showRefreshNotification(data.message || 'ساعات موجود بروزرسانی شد');
      
    // Trigger event
    triggerWidgetEvent('refresh:complete', data);
  }

  /**
   * Handle error events - matching BookingWidget error handling
   */
  function handleErrorEvent(data, options) {
    // Trigger global error event
    triggerWidgetEvent('error', data);
    
    // Call error callback if provided
    if (options.onError && typeof options.onError === 'function') {
      try {
        options.onError(data);
      } catch (error) {
        console.error('X-SME Widget: Error in onError callback:', error);
      }
    }
  }

  /**
   * Handle config updates from widget
   */
  function handleConfigUpdate(data, container, iframe) {
    if (data) {
      // Update container styles with new config
      if (data.accentColor || data.primaryColor) {
        const color = data.accentColor || data.primaryColor;
        container.style.setProperty('--primary-color', color);
        iframe.style.setProperty('--primary-color', color);
      }
      if (data.secondaryColor) {
        container.style.setProperty('--secondary-color', data.secondaryColor);
        iframe.style.setProperty('--secondary-color', data.secondaryColor);
      }
      if (data.borderRadius) {
        container.style.setProperty('--border-radius', `${data.borderRadius}px`);
        iframe.style.borderRadius = `${data.borderRadius}px`;
      }
    }
  }

  /**
   * Trigger widget events - matching BookingWidget event structure
   */
  function triggerWidgetEvent(eventType, data, containerId = null) {
    const eventName = `xsme:${eventType}`;
    
    // Global event on document
    const globalEvent = new CustomEvent(eventName, {
      detail: { ...data, timestamp: new Date().toISOString() },
      bubbles: true
    });
    document.dispatchEvent(globalEvent);

    // Container-specific event
    const targetContainers = containerId 
      ? [document.getElementById(containerId)].filter(Boolean)
      : document.querySelectorAll('[id^="xsme-booking-widget"]');

    targetContainers.forEach(container => {
      container.dispatchEvent(new CustomEvent(eventName, {
        detail: { ...data, containerId: container.id, timestamp: new Date().toISOString() },
        bubbles: false
      }));
    });

    // Call legacy callback functions if they exist
    const callbackMappings = {
      'booking:complete': 'xsmeOnBookingComplete',
      'booking:started': 'xsmeOnBookingStarted', 
      'booking:cancelled': 'xsmeOnBookingCancelled',
      'service:selected': 'xsmeOnServiceSelected',
      'staff:selected': 'xsmeOnStaffSelected',
      'date:selected': 'xsmeOnDateSelected',
      'time:selected': 'xsmeOnTimeSelected',
      'widget:restart': 'xsmeOnWidgetRestart',
      'availability:refreshed': 'xsmeOnAvailabilityRefreshed',
      'ready': 'xsmeOnReady',
      'loaded': 'xsmeOnLoaded',
      'created': 'xsmeOnCreated',
      'error': 'xsmeOnError'
    };
    
    const callbackName = callbackMappings[eventType];
    if (callbackName && window[callbackName] && typeof window[callbackName] === 'function') {
      try {
        window[callbackName](data);
      } catch (error) {
        console.error(`X-SME Widget: Error in ${callbackName} callback:`, error);
      }
    }
  }

  /**
   * Show success notification - matching BookingWidget confirmation UI
   */
  function showSuccessNotification(booking) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: 'Vazirmatn', 'Tahoma', sans-serif;
      direction: rtl;
      text-align: right;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">✅ رزرو تایید شد</div>
      <div style="font-size: 14px; opacity: 0.9;">شماره رزرو: ${booking.id}</div>
      ${booking.serviceName ? `<div style="font-size: 12px; opacity: 0.8;">سرویس: ${booking.serviceName}</div>` : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
    
    // Click to close
    notification.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    });
  }

  /**
   * Show refresh notification - matching BookingWidget refresh feedback
   */
  function showRefreshNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
      z-index: 10000;
      font-family: 'Vazirmatn', 'Tahoma', sans-serif;
      direction: rtl;
      text-align: right;
      max-width: 280px;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🔄</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
    
    // Click to close
    notification.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    });
  }

  /**
   * Add required CSS for Persian support and widget styling - matching BookingWidget design
   */
  function addRequiredCSS() {
    if (document.getElementById('xsme-widget-css')) return;
    
    const css = document.createElement('style');
    css.id = 'xsme-widget-css';
    css.textContent = `
      /* X-SME Widget Persian Font Support */
      @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
      
      [id^="xsme-booking-widget"] {
        font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
        direction: rtl;
        text-align: right;
      }
      
      /* CSS Variables Support - matching BookingWidget styling */
      [id^="xsme-booking-widget"] {
        --primary-color: #3b82f6;
        --border-radius: 8px;
      }
      
      /* Responsive design - matching BookingWidget responsive layout */
      @media (min-width: 768px) {
        [id^="xsme-booking-widget"] iframe {
          min-height: 480px;
          border-radius: 16px;
          box-shadow: 0 6px 12px -3px rgba(0, 0, 0, 0.1);
        }
        
        [id^="xsme-booking-widget"] {
          margin: 6px;
          padding: 3px;
        }
      }
      
      @media (min-width: 1024px) {
        [id^="xsme-booking-widget"] iframe {
          min-height: 520px;
          border-radius: 20px;
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.12);
        }
        
        [id^="xsme-booking-widget"] {
          margin: 8px;
          padding: 4px;
        }
      }
      
      @media (max-width: 767px) {
        [id^="xsme-booking-widget"] iframe {
          height: 480px;
          min-height: 400px;
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
        }
        
        [id^="xsme-booking-widget"] {
          margin: 3px;
          padding: 2px;
        }
      }
      
      @media (max-width: 480px) {
        [id^="xsme-booking-widget"] iframe {
          height: 450px;
          min-height: 380px;
          border-radius: 14px;
        }
        
        [id^="xsme-booking-widget"] {
          margin: 2px;
          padding: 1px;
        }
      }
      
      /* Widget container styling - matching BookingWidget container */
      [id^="xsme-booking-widget"] {
        display: block;
        overflow: hidden;
      }
      
      /* Enhanced visual feedback support - matching BookingWidget interactions */
      [id^="xsme-booking-widget"] iframe {
        overflow: visible !important;
      }
      
      /* Prevent layout shifts from enhanced visual feedback */
      [id^="xsme-booking-widget"] {
        margin: 8px;
        padding: 4px;
      }
      
      /* Animation keyframes for notifications */
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideOutRight {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `;
    
    document.head.appendChild(css);
  }

  /**
   * Update widget configuration - matching BookingWidget prop updates
   */
  function updateWidgetConfig(containerId, newConfig) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const iframe = container.querySelector('iframe');
    if (!iframe) return;
    
    // Send update message to iframe
    iframe.contentWindow.postMessage({
      type: 'UPDATE_CONFIG',
      data: newConfig
    }, '*');
  }

  /**
   * Refresh widget - matching BookingWidget refresh functionality
   */
  function refreshWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const iframe = container.querySelector('iframe');
    if (!iframe) return;
    
    // Send refresh message to iframe
    iframe.contentWindow.postMessage({
      type: 'FORCE_REFRESH_DATA'
    }, '*');
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    addRequiredCSS();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initXSMEWidget);
    } else {
      initXSMEWidget();
    }
  }

  // Auto-initialize
  init();

  // Expose global API - matching BookingWidget functionality
  window.XSME = {
    version: WIDGET_CONFIG.version,
    init: initXSMEWidget,
    config: WIDGET_CONFIG,
    events: WIDGET_EVENTS,
    updateConfig: updateWidgetConfig,
    refresh: refreshWidget,
    // Helper functions
    showSuccessNotification,
    showRefreshNotification,
    triggerWidgetEvent
  };

  console.log(`🚀 X-SME Booking Widget v${WIDGET_CONFIG.version} loaded`);
})(); 