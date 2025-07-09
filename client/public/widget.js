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

  // Widget configuration
  const WIDGET_CONFIG = {
    apiBaseUrl: 'https://api.x-sme.ir',
    widgetBaseUrl: 'http://localhost:3000',
    version: '1.1.0'
  };

  // Default widget options (matching Widget.tsx defaults)
  const DEFAULT_OPTIONS = {
    theme: 'light',
    language: 'fa',
    primaryColor: '#3b82f6',
    borderRadius: 8,
    showLogo: true,
    showBusinessInfo: true,
    allowNotes: true,
    requireEmail: false,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2,
    embedMode: true
  };

  /**
   * Initialize X-SME Booking Widget
   */
  function initXSMEWidget() {
    // Find all widget containers
    const containers = document.querySelectorAll('[id^="xsme-booking-widget"]');
    
    containers.forEach(container => {
      const businessId = container.getAttribute('data-business-id') || container.getAttribute('data-business');
      
      if (!businessId) {
        console.error('X-SME Widget: business-id is required');
        return;
      }

      // Parse options from data attributes
      const options = parseOptions(container);
      
      // Create widget
      createWidget(container, businessId, options);
    });
  }

  /**
   * Parse widget options from data attributes
   */
  function parseOptions(container) {
    const options = { ...DEFAULT_OPTIONS };
    
    // Parse data attributes (matching Widget.tsx parameter names)
    const theme = container.getAttribute('data-theme');
    const language = container.getAttribute('data-language');
    const primaryColor = container.getAttribute('data-primary-color') || container.getAttribute('data-accent-color');
    const borderRadius = container.getAttribute('data-border-radius');
    const showLogo = container.getAttribute('data-show-logo');
    const showBusinessInfo = container.getAttribute('data-show-business-info');
    const allowNotes = container.getAttribute('data-allow-notes');
    const requireEmail = container.getAttribute('data-require-email');
    const maxAdvanceBooking = container.getAttribute('data-max-advance-booking');
    const minAdvanceBooking = container.getAttribute('data-min-advance-booking');
    
    if (theme) options.theme = theme;
    if (language) options.language = language;
    if (primaryColor) options.primaryColor = primaryColor;
    if (borderRadius) options.borderRadius = parseInt(borderRadius);
    if (showLogo !== null) options.showLogo = showLogo !== 'false';
    if (showBusinessInfo !== null) options.showBusinessInfo = showBusinessInfo !== 'false';
    if (allowNotes !== null) options.allowNotes = allowNotes !== 'false';
    if (requireEmail !== null) options.requireEmail = requireEmail === 'true';
    if (maxAdvanceBooking) options.maxAdvanceBooking = parseInt(maxAdvanceBooking);
    if (minAdvanceBooking) options.minAdvanceBooking = parseInt(minAdvanceBooking);
    
    return options;
  }

  /**
   * Create widget iframe
   */
  function createWidget(container, businessId, options) {
    // Create iframe
    const iframe = document.createElement('iframe');
    
    // Build widget URL with parameters (matching Widget.tsx parameter names)
    const params = new URLSearchParams({
      businessId,
      theme: options.theme,
      language: options.language,
      primaryColor: options.primaryColor,
      borderRadius: options.borderRadius.toString(),
      showLogo: options.showLogo.toString(),
      showBusinessInfo: options.showBusinessInfo.toString(),
      allowNotes: options.allowNotes.toString(),
      requireEmail: options.requireEmail.toString(),
      maxAdvanceBooking: options.maxAdvanceBooking.toString(),
      minAdvanceBooking: options.minAdvanceBooking.toString(),
      embed: 'true'
    });
    
    iframe.src = `${WIDGET_CONFIG.widgetBaseUrl}/widget?${params.toString()}`;
    iframe.style.cssText = `
      width: 100%;
      height: 480px;
      min-height: 400px;
      border: none;
      border-radius: ${options.borderRadius}px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --primary-color: ${options.primaryColor};
      --border-radius: ${options.borderRadius}px;
      overflow: hidden;
      transition: height 0.3s ease;
    `;

    // Responsive sizing
    if (window.innerWidth >= 768) {
      iframe.style.height = '520px';
      iframe.style.minHeight = '480px';
    }
    if (window.innerWidth >= 1024) {
      iframe.style.height = '580px';
      iframe.style.minHeight = '520px';
    }

    // Add responsive behavior
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    
    // Clear container and add iframe
    container.innerHTML = '';
    container.appendChild(iframe);
    
    // Apply CSS variables to container (matching Widget.tsx behavior)
    container.style.setProperty('--primary-color', options.primaryColor);
    container.style.setProperty('--border-radius', `${options.borderRadius}px`);
    container.style.overflow = 'hidden';
    container.style.borderRadius = `${options.borderRadius}px`;
    
    // Setup message listener for iframe communication
    setupMessageListener(iframe, container, options);
    
    // Setup booking completion callback
    setupBookingCallback(iframe, options);
    
    // Handle iframe load for initial height adjustment
    iframe.onload = function() {
      // Send initial configuration to iframe
      setTimeout(() => {
        iframe.contentWindow.postMessage({
          type: 'PARENT_READY',
          data: { options }
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
    const handleResize = () => {
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
    };

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
   * Setup message listener for iframe communication
   */
  function setupMessageListener(iframe, container, options) {
    function handleMessage(event) {
      // Verify origin (allow both production and development)
      const allowedOrigins = ['x-sme.ir', 'localhost:3000', '127.0.0.1:3000'];
      const isAllowedOrigin = allowedOrigins.some(origin => event.origin.includes(origin));
      if (!isAllowedOrigin) return;

      try {
        const { type, data } = event.data;

        switch (type) {
          case 'RESIZE':
            if (data && data.height) {
              // Desktop-responsive height calculation
              let minHeight = 400;
              let padding = 20;
              
              // Adjust minimums and padding for larger screens
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
            // Widget is ready, send acknowledgment if needed
            iframe.contentWindow.postMessage({
              type: 'PARENT_READY',
              data: { options }
            }, '*');
            
            // Trigger widget ready events
            triggerWidgetEvent('ready', { 
              containerId: container.id, 
              businessId: options.businessId,
              config: options 
            });
            break;
            
          case 'BOOKING_COMPLETE':
            handleBookingComplete(data);
            break;
            
          case 'BOOKING_STARTED':
            triggerWidgetEvent('booking:started', data);
            break;
            
          case 'BOOKING_CANCELLED':
            triggerWidgetEvent('booking:cancelled', data);
            break;
            
          case 'ERROR':
            triggerWidgetEvent('error', data);
            break;
            
          case 'SERVICE_SELECTED':
            triggerWidgetEvent('service:selected', data);
            break;
            
          case 'DATE_SELECTED':
            triggerWidgetEvent('date:selected', data);
            break;
            
          case 'TIME_SELECTED':
            triggerWidgetEvent('time:selected', data);
            break;
            
          case 'WIDGET_RESTART':
            triggerWidgetEvent('widget:restart', data);
            // Force iframe to refresh its data
            iframe.contentWindow.postMessage({
              type: 'FORCE_REFRESH_DATA'
            }, '*');
            break;
            
          case 'AVAILABILITY_REFRESHED':
            triggerWidgetEvent('availability:refreshed', data);
            break;
            
          case 'REFRESH_COMPLETE':
            // Show success notification for refresh
            showRefreshNotification(data.message || 'ساعات موجود بروزرسانی شد');
            break;
            
          case 'REDIRECT':
            if (data && data.url) {
              window.open(data.url, '_blank');
            }
            break;

          case 'UPDATE_CONFIG':
            // Handle config updates from widget
            if (data) {
              // Update container styles with new config
              if (data.primaryColor) {
                container.style.setProperty('--primary-color', data.primaryColor);
                iframe.style.setProperty('--primary-color', data.primaryColor);
              }
              if (data.borderRadius) {
                container.style.setProperty('--border-radius', `${data.borderRadius}px`);
                iframe.style.borderRadius = `${data.borderRadius}px`;
              }
            }
            break;

          case 'REFRESH':
            // Refresh the iframe
            iframe.src = iframe.src;
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
   * Setup booking completion callback
   */
  function setupBookingCallback(iframe, options) {
    // Custom callback if provided
    if (window.xsmeOnBookingComplete && typeof window.xsmeOnBookingComplete === 'function') {
      return;
    }
    
    // Default callback - show success message
    window.xsmeOnBookingComplete = function(booking) {
      // Create success notification
      showSuccessNotification(booking);
      
      // Send analytics event if available
      if (window.gtag) {
        window.gtag('event', 'booking_complete', {
          booking_id: booking.id,
          business_id: booking.businessId,
          service_name: booking.serviceName,
          amount: booking.amount
        });
      }
    };
  }

  /**
   * Trigger widget events
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
   * Handle booking completion
   */
  function handleBookingComplete(booking) {
    triggerWidgetEvent('booking:complete', booking);
  }

  /**
   * Format date as YYYY-MM-DD in local timezone (avoids UTC conversion issues)
   */
  function formatLocalDateString(date) {
    try {
      if (!date || isNaN(date.getTime())) {
        throw new Error("Invalid date provided");
      }

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting local date string:", error);
      return "";
    }
  }

  /**
   * Show success notification
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
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">✅ رزرو تایید شد</div>
      <div style="font-size: 14px; opacity: 0.9;">شماره رزرو: ${booking.id}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    // Click to close
    notification.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  /**
   * Show refresh notification
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
   * Add required CSS for Persian support and widget styling
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
      
      /* CSS Variables Support */
      [id^="xsme-booking-widget"] {
        --primary-color: #3b82f6;
        --border-radius: 8px;
      }
      
      /* Responsive design */
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
      
      /* Widget container styling */
      [id^="xsme-booking-widget"] {
        display: block;
        overflow: hidden;
      }
      
      /* Enhanced visual feedback support */
      [id^="xsme-booking-widget"] iframe {
        /* Ensure visual feedback elements like shadows and rings are visible */
        overflow: visible !important;
      }
      
      /* Prevent layout shifts from enhanced visual feedback */
      [id^="xsme-booking-widget"] {
        /* Add extra margin for hover effects and rings */
        margin: 8px;
        padding: 4px;
      }
    `;
    
    document.head.appendChild(css);
  }

  /**
   * Update widget configuration
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
   * Refresh widget
   */
  function refreshWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const iframe = container.querySelector('iframe');
    if (!iframe) return;
    
    // Send refresh message to iframe
    iframe.contentWindow.postMessage({
      type: 'REFRESH'
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

  // Expose global API (matching Widget.tsx functionality)
  window.XSME = {
    version: WIDGET_CONFIG.version,
    init: initXSMEWidget,
    config: WIDGET_CONFIG,
    updateConfig: updateWidgetConfig,
    refresh: refreshWidget
  };

  console.log(`🚀 X-SME Booking Widget v${WIDGET_CONFIG.version} loaded`);
})(); 