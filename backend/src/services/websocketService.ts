import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import url from 'url';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
  subscribedTrips: Set<string>;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private tripRooms: Map<string, Set<AuthenticatedSocket>> = new Map();
  private userSockets: Map<string, Set<AuthenticatedSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/api/v1/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const socket = ws as AuthenticatedSocket;
      socket.isAlive = true;
      socket.subscribedTrips = new Set();

      // Parse query string for token
      const parsedUrl = url.parse(req.url || '', true);
      const token = (parsedUrl.query.token as string) || req.headers['sec-websocket-protocol'];

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          socket.userId = decoded.userId;
          socket.role = decoded.role;

          // Add to user sockets registry
          if (!this.userSockets.has(decoded.userId)) {
            this.userSockets.set(decoded.userId, new Set());
          }
          this.userSockets.get(decoded.userId)!.add(socket);

          logger.info(`WebSocket client authenticated: User ${decoded.userId} [${decoded.role}]`);
          socket.send(JSON.stringify({
            event: 'AUTH_SUCCESS',
            data: { userId: decoded.userId, role: decoded.role }
          }));
        } catch {
          logger.warn('WebSocket connection provided invalid token. Connecting as unauthenticated observer.');
        }
      }

      socket.on('pong', () => {
        socket.isAlive = true;
      });

      socket.on('message', (data: RawData) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(socket, message);
        } catch (e) {
          logger.warn('WebSocket invalid message format received:', e);
        }
      });

      socket.on('close', () => {
        this.cleanupSocket(socket);
      });

      socket.on('error', (err) => {
        logger.error('WebSocket client error:', err);
        this.cleanupSocket(socket);
      });
    });

    // Setup 30s heartbeat to terminate dead connections
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws) => {
        const socket = ws as AuthenticatedSocket;
        if (!socket.isAlive) {
          this.cleanupSocket(socket);
          return socket.terminate();
        }
        socket.isAlive = false;
        socket.ping();
      });
    }, 30000);

    logger.info('🛰️ Real-Time WebSocket Gateway initialized on /api/v1/ws');
  }

  private handleClientMessage(socket: AuthenticatedSocket, message: { action: string; tripId?: string; data?: unknown }): void {
    if (message.action === 'SUBSCRIBE_TRIP' && message.tripId) {
      const tripId = message.tripId;
      if (!this.tripRooms.has(tripId)) {
        this.tripRooms.set(tripId, new Set());
      }
      this.tripRooms.get(tripId)!.add(socket);
      socket.subscribedTrips.add(tripId);
      socket.send(JSON.stringify({ event: 'SUBSCRIBED_TRIP', tripId }));
      logger.debug(`Socket subscribed to trip room: ${tripId}`);
    } else if (message.action === 'UNSUBSCRIBE_TRIP' && message.tripId) {
      const tripId = message.tripId;
      if (this.tripRooms.has(tripId)) {
        this.tripRooms.get(tripId)!.delete(socket);
      }
      socket.subscribedTrips.delete(tripId);
      socket.send(JSON.stringify({ event: 'UNSUBSCRIBED_TRIP', tripId }));
    }
  }

  private cleanupSocket(socket: AuthenticatedSocket): void {
    // Remove from user sockets
    if (socket.userId && this.userSockets.has(socket.userId)) {
      this.userSockets.get(socket.userId)!.delete(socket);
      if (this.userSockets.get(socket.userId)!.size === 0) {
        this.userSockets.delete(socket.userId);
      }
    }

    // Remove from all trip rooms
    socket.subscribedTrips.forEach((tripId) => {
      if (this.tripRooms.has(tripId)) {
        this.tripRooms.get(tripId)!.delete(socket);
        if (this.tripRooms.get(tripId)!.size === 0) {
          this.tripRooms.delete(tripId);
        }
      }
    });
  }

  // --- Broadcast Methods ---

  broadcastToTrip(tripId: string, event: string, payload: unknown): void {
    const clients = this.tripRooms.get(tripId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({ event, tripId, timestamp: new Date().toISOString(), data: payload });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastToUser(userId: string, event: string, payload: unknown): void {
    const clients = this.userSockets.get(userId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastLocationPing(tripId: string, locationData: {
    latitude: number;
    longitude: number;
    speedKmh?: number;
    accuracyMeters?: number;
    recordedAt: Date | string;
  }): void {
    this.broadcastToTrip(tripId, 'LOCATION_UPDATE', locationData);
  }

  broadcastStopUpdate(tripId: string, stopData: unknown): void {
    this.broadcastToTrip(tripId, 'STOP_UPDATE', stopData);
  }

  broadcastTripStatus(tripId: string, status: string, details?: unknown): void {
    this.broadcastToTrip(tripId, 'TRIP_STATUS_UPDATE', { status, details });
  }

  broadcastTripDelay(tripId: string, delayData: {
    delayMinutes: number;
    reason: string;
    notes?: string;
  }): void {
    this.broadcastToTrip(tripId, 'TRIP_DELAY_UPDATE', delayData);
  }

  close(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.wss) this.wss.close();
  }
}

export const websocketService = new WebSocketService();
