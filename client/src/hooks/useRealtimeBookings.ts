import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  service: {
    id: string;
    name: string;
    price: number;
  };
  business?: {
    id: string;
    name: string;
  };
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface RealtimeEvent {
  type: string;
  booking?: Booking;
  timeSlot?: TimeSlot;
  businessId?: string;
  serviceId?: string;
  date?: string;
  timestamp: Date;
}

interface UseRealtimeBookingsOptions {
  businessId?: string;
  authToken?: string;
  autoConnect?: boolean;
  onBookingCreated?: (booking: Booking) => void;
  onBookingUpdated?: (booking: Booking, previousStatus?: string) => void;
  onBookingCancelled?: (booking: Booking) => void;
  onAvailabilityUpdated?: (
    businessId: string,
    serviceId: string,
    date: string,
    timeSlots: TimeSlot[]
  ) => void;
  onTimeSlotBooked?: (
    businessId: string,
    serviceId: string,
    timeSlot: TimeSlot
  ) => void;
  onTimeSlotFreed?: (
    businessId: string,
    serviceId: string,
    timeSlot: TimeSlot
  ) => void;
}

export const useRealtimeBookings = (
  options: UseRealtimeBookingsOptions = {}
) => {
  const {
    businessId,
    authToken,
    autoConnect = true,
    onBookingCreated,
    onBookingUpdated,
    onBookingCancelled,
    onAvailabilityUpdated,
    onTimeSlotBooked,
    onTimeSlotFreed,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [liveBookings, setLiveBookings] = useState<Booking[]>([]);
  const [liveAvailability, setLiveAvailability] = useState<TimeSlot[]>([]);
  const [connectedUsers, setConnectedUsers] = useState(0);

  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3; // Reduced from 5
  const reconnectDelay = useRef(2000); // Increased from 1000
  const isConnecting = useRef(false);
  const connectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastConnectionAttempt = useRef<number>(0);
  const minConnectionInterval = 5000; // Minimum 5 seconds between connection attempts
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (socket?.connected || isConnecting.current) {
      return;
    }

    // Debounce connection attempts
    const now = Date.now();
    if (now - lastConnectionAttempt.current < minConnectionInterval) {
      console.log("🚫 Connection attempt debounced");
      return;
    }

    lastConnectionAttempt.current = now;
    isConnecting.current = true;

    try {
      const serverUrl =
        process.env.REACT_APP_API_URL || "http://localhost:3001";

      const newSocket = io(serverUrl, {
        auth: {
          token: authToken,
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      });

      // Connection event handlers
      newSocket.on("connect", () => {
        if (!mountedRef.current) return;

        console.log("✅ WebSocket connected:", newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 2000;
        isConnecting.current = false;

        // Clear any pending connection timeout
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }

        // Subscribe to business updates if businessId is provided
        if (businessId) {
          newSocket.emit("subscribe_business", businessId);
        }
      });

      newSocket.on("disconnect", (reason: string) => {
        if (!mountedRef.current) return;

        console.log("❌ WebSocket disconnected:", reason);
        setIsConnected(false);
        isConnecting.current = false;

        // Clear any pending connection timeout
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }

        // Only auto-reconnect for unexpected disconnections, not intentional ones
        if (
          reason === "io server disconnect" ||
          reason === "transport error" ||
          reason === "transport close"
        ) {
          if (reconnectAttempts.current < maxReconnectAttempts) {
            console.log(
              `🔄 Scheduling reconnection attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts} in ${reconnectDelay.current}ms`
            );

            connectionTimeout.current = setTimeout(() => {
              if (mountedRef.current && !socket?.connected) {
                reconnectAttempts.current++;
                connect();
              }
            }, reconnectDelay.current);

            reconnectDelay.current = Math.min(
              reconnectDelay.current * 1.5,
              15000
            );
          } else {
            console.error("❌ Max reconnection attempts reached");
            setConnectionError("اتصال قطع شد - حداکثر تلاش مجدد انجام شد");
          }
        }
      });

      newSocket.on("connect_error", (error: Error) => {
        if (!mountedRef.current) return;

        console.error("❌ WebSocket connection error:", error);
        setConnectionError(error.message);
        isConnecting.current = false;

        // Clear any pending connection timeout
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }
      });

      // Custom event handlers
      newSocket.on("connected", (data: any) => {
        console.log("🎉 WebSocket handshake completed:", data);
      });

      newSocket.on("subscribed", (data: any) => {
        console.log("📡 Subscribed to business updates:", data.businessId);
      });

      newSocket.on("error", (error: any) => {
        console.error("❌ WebSocket error:", error);
        setConnectionError(error.message);
      });

      // Real-time booking events
      newSocket.on("booking_created", (event: RealtimeEvent) => {
        console.log("📅 New booking created:", event.booking);
        if (event.booking) {
          setLiveBookings((prev) => [event.booking!, ...prev]);
          onBookingCreated?.(event.booking);
        }
      });

      newSocket.on("booking_updated", (event: RealtimeEvent) => {
        console.log("📝 Booking updated:", event.booking);
        if (event.booking) {
          setLiveBookings((prev) =>
            prev.map((booking) =>
              booking.id === event.booking!.id ? event.booking! : booking
            )
          );
          onBookingUpdated?.(
            event.booking,
            (event as any).booking?.previousStatus
          );
        }
      });

      newSocket.on("booking_cancelled", (event: RealtimeEvent) => {
        console.log("❌ Booking cancelled:", event.booking);
        if (event.booking) {
          setLiveBookings((prev) =>
            prev.map((booking) =>
              booking.id === event.booking!.id ? event.booking! : booking
            )
          );
          onBookingCancelled?.(event.booking);
        }
      });

      // Real-time availability events
      newSocket.on("availability_updated", (event: any) => {
        console.log("🕒 Availability updated:", event);
        if (event.timeSlots) {
          setLiveAvailability(event.timeSlots);
          onAvailabilityUpdated?.(
            event.businessId,
            event.serviceId,
            event.date,
            event.timeSlots
          );
        }
      });

      newSocket.on("time_slot_booked", (event: any) => {
        console.log("🔒 Time slot booked:", event);
        if (event.timeSlot) {
          setLiveAvailability((prev) =>
            prev.map((slot) =>
              slot.id === event.timeSlot.id
                ? { ...slot, isAvailable: false }
                : slot
            )
          );
          onTimeSlotBooked?.(event.businessId, event.serviceId, event.timeSlot);
        }
      });

      newSocket.on("time_slot_freed", (event: any) => {
        console.log("🔓 Time slot freed:", event);
        if (event.timeSlot) {
          setLiveAvailability((prev) =>
            prev.map((slot) =>
              slot.id === event.timeSlot.id
                ? { ...slot, isAvailable: true }
                : slot
            )
          );
          onTimeSlotFreed?.(event.businessId, event.serviceId, event.timeSlot);
        }
      });

      // Widget-specific events
      newSocket.on("booking_attempt", (event: any) => {
        console.log("👁️ Someone is attempting to book:", event);
      });

      // Live data events
      newSocket.on("live_bookings", (data: any) => {
        console.log("📊 Received live bookings:", data.bookings?.length);
        if (data.bookings) {
          setLiveBookings(data.bookings);
        }
      });

      newSocket.on("live_availability", (data: any) => {
        console.log("📊 Received live availability:", data.timeSlots?.length);
        if (data.timeSlots) {
          setLiveAvailability(data.timeSlots);
        }
      });

      setSocket(newSocket);

      // Set a connection timeout
      connectionTimeout.current = setTimeout(() => {
        if (!newSocket.connected && mountedRef.current) {
          console.warn("⏰ Connection timeout - destroying socket");
          newSocket.disconnect();
          isConnecting.current = false;
          setConnectionError("اتصال timeout شد");
        }
      }, 20000);
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      setConnectionError((error as Error).message);
      isConnecting.current = false;

      // Clear any pending connection timeout
      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
        connectionTimeout.current = null;
      }
    }
    // Reduced dependencies to prevent infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 Manually disconnecting WebSocket");

    // Clear all timeouts and flags
    isConnecting.current = false;
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    // Reset connection state
    reconnectAttempts.current = 0;
    reconnectDelay.current = 2000;
  }, [socket]);

  const subscribeToBusinessUpdates = useCallback(
    (businessId: string) => {
      if (socket?.connected && businessId) {
        console.log("📡 Subscribing to business updates:", businessId);
        socket.emit("subscribe_business", businessId);
      }
    },
    [socket]
  );

  const unsubscribeFromBusinessUpdates = useCallback(
    (businessId: string) => {
      if (socket?.connected) {
        socket.emit("unsubscribe_business", businessId);
      }
    },
    [socket]
  );

  const requestLiveBookings = useCallback(
    (businessId: string) => {
      if (socket?.connected) {
        socket.emit("get_live_bookings", businessId);
      }
    },
    [socket]
  );

  const requestLiveAvailability = useCallback(
    (businessId: string, serviceId: string, date: string) => {
      if (socket?.connected && businessId && serviceId && date) {
        console.log("🔄 Requesting live availability:", {
          businessId,
          serviceId,
          date,
        });
        socket.emit("get_live_availability", { businessId, serviceId, date });
      }
    },
    [socket]
  );

  const notifyBookingAttempt = useCallback(
    (bookingData: any) => {
      if (socket?.connected) {
        socket.emit("widget_booking_attempt", bookingData);
      }
    },
    [socket]
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect && businessId) {
      console.log("🚀 Auto-connecting WebSocket for business:", businessId);
      connect();
    }

    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      mountedRef.current = false;

      // Clear any timeouts
      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
        connectionTimeout.current = null;
      }

      // Disconnect if connected
      if (socket) {
        socket.disconnect();
      }
    };
    // Only depend on initial businessId and autoConnect - avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, autoConnect]);

  return {
    // Connection state
    socket,
    isConnected,
    connectionError,
    isConnecting: isConnecting.current,

    // Live data
    liveBookings,
    liveAvailability,
    connectedUsers,

    // Connection methods
    connect,
    disconnect,

    // Subscription methods
    subscribeToBusinessUpdates,
    unsubscribeFromBusinessUpdates,

    // Data request methods
    requestLiveBookings,
    requestLiveAvailability,

    // Widget methods
    notifyBookingAttempt,

    // Connection info
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts,

    // Status helpers
    connectionStatus: isConnected
      ? "connected"
      : connectionError
        ? "error"
        : isConnecting.current
          ? "connecting"
          : "disconnected",
  };
};

export default useRealtimeBookings;
