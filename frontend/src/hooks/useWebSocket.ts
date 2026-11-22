import { useState, useEffect, useRef, useCallback } from 'react';

export type WebSocketConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
  timestamp?: string;
}

/**
 * Custom hook for real-time WebSocket telemetry, live driver tracking, and instant alerts
 */
export const useWebSocket = (tripIdToJoin?: string) => {
  const [status, setStatus] = useState<WebSocketConnectionStatus>('CLOSED');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Port 5000 is backend server
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:5000/api/v1/ws`;

    setStatus('CONNECTING');

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('OPEN');
        reconnectAttemptsRef.current = 0;

        // Auto-join trip room if provided
        if (tripIdToJoin) {
          ws.send(JSON.stringify({
            action: 'JOIN_TRIP',
            tripId: tripIdToJoin
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(parsed);
        } catch {
          // Non-JSON ping/pong or string event
        }
      };

      ws.onerror = () => {
        setStatus('CLOSED');
      };

      ws.onclose = () => {
        setStatus('CLOSED');
        socketRef.current = null;

        // Exponential backoff reconnect (max 10s)
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch {
      setStatus('CLOSED');
    }
  }, [tripIdToJoin]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((event: string, data: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, data, timestamp: new Date().toISOString() }));
      return true;
    }
    return false;
  }, []);

  const joinTrip = useCallback((tripId: string) => {
    return sendMessage('JOIN_TRIP', { tripId });
  }, [sendMessage]);

  const leaveTrip = useCallback((tripId: string) => {
    return sendMessage('LEAVE_TRIP', { tripId });
  }, [sendMessage]);

  return {
    status,
    isConnected: status === 'OPEN',
    lastMessage,
    sendMessage,
    joinTrip,
    leaveTrip
  };
};

export default useWebSocket;
