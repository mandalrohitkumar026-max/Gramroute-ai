"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = exports.WebSocketService = void 0;
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
class WebSocketService {
    wss = null;
    tripRooms = new Map();
    userSockets = new Map();
    heartbeatInterval = null;
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({ server, path: '/api/v1/ws' });
        this.wss.on('connection', (ws, req) => {
            const socket = ws;
            socket.isAlive = true;
            socket.subscribedTrips = new Set();
            // Parse query string for token
            const parsedUrl = url_1.default.parse(req.url || '', true);
            const token = parsedUrl.query.token || req.headers['sec-websocket-protocol'];
            if (token) {
                try {
                    const decoded = (0, jwt_1.verifyAccessToken)(token);
                    socket.userId = decoded.userId;
                    socket.role = decoded.role;
                    // Add to user sockets registry
                    if (!this.userSockets.has(decoded.userId)) {
                        this.userSockets.set(decoded.userId, new Set());
                    }
                    this.userSockets.get(decoded.userId).add(socket);
                    logger_1.logger.info(`WebSocket client authenticated: User ${decoded.userId} [${decoded.role}]`);
                    socket.send(JSON.stringify({
                        event: 'AUTH_SUCCESS',
                        data: { userId: decoded.userId, role: decoded.role }
                    }));
                }
                catch {
                    logger_1.logger.warn('WebSocket connection provided invalid token. Connecting as unauthenticated observer.');
                }
            }
            socket.on('pong', () => {
                socket.isAlive = true;
            });
            socket.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleClientMessage(socket, message);
                }
                catch (e) {
                    logger_1.logger.warn('WebSocket invalid message format received:', e);
                }
            });
            socket.on('close', () => {
                this.cleanupSocket(socket);
            });
            socket.on('error', (err) => {
                logger_1.logger.error('WebSocket client error:', err);
                this.cleanupSocket(socket);
            });
        });
        // Setup 30s heartbeat to terminate dead connections
        this.heartbeatInterval = setInterval(() => {
            if (!this.wss)
                return;
            this.wss.clients.forEach((ws) => {
                const socket = ws;
                if (!socket.isAlive) {
                    this.cleanupSocket(socket);
                    return socket.terminate();
                }
                socket.isAlive = false;
                socket.ping();
            });
        }, 30000);
        logger_1.logger.info('🛰️ Real-Time WebSocket Gateway initialized on /api/v1/ws');
    }
    handleClientMessage(socket, message) {
        if (message.action === 'SUBSCRIBE_TRIP' && message.tripId) {
            const tripId = message.tripId;
            if (!this.tripRooms.has(tripId)) {
                this.tripRooms.set(tripId, new Set());
            }
            this.tripRooms.get(tripId).add(socket);
            socket.subscribedTrips.add(tripId);
            socket.send(JSON.stringify({ event: 'SUBSCRIBED_TRIP', tripId }));
            logger_1.logger.debug(`Socket subscribed to trip room: ${tripId}`);
        }
        else if (message.action === 'UNSUBSCRIBE_TRIP' && message.tripId) {
            const tripId = message.tripId;
            if (this.tripRooms.has(tripId)) {
                this.tripRooms.get(tripId).delete(socket);
            }
            socket.subscribedTrips.delete(tripId);
            socket.send(JSON.stringify({ event: 'UNSUBSCRIBED_TRIP', tripId }));
        }
    }
    cleanupSocket(socket) {
        // Remove from user sockets
        if (socket.userId && this.userSockets.has(socket.userId)) {
            this.userSockets.get(socket.userId).delete(socket);
            if (this.userSockets.get(socket.userId).size === 0) {
                this.userSockets.delete(socket.userId);
            }
        }
        // Remove from all trip rooms
        socket.subscribedTrips.forEach((tripId) => {
            if (this.tripRooms.has(tripId)) {
                this.tripRooms.get(tripId).delete(socket);
                if (this.tripRooms.get(tripId).size === 0) {
                    this.tripRooms.delete(tripId);
                }
            }
        });
    }
    // --- Broadcast Methods ---
    broadcastToTrip(tripId, event, payload) {
        const clients = this.tripRooms.get(tripId);
        if (!clients || clients.size === 0)
            return;
        const message = JSON.stringify({ event, tripId, timestamp: new Date().toISOString(), data: payload });
        clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
    broadcastToUser(userId, event, payload) {
        const clients = this.userSockets.get(userId);
        if (!clients || clients.size === 0)
            return;
        const message = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
        clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
    broadcastLocationPing(tripId, locationData) {
        this.broadcastToTrip(tripId, 'LOCATION_UPDATE', locationData);
    }
    broadcastStopUpdate(tripId, stopData) {
        this.broadcastToTrip(tripId, 'STOP_UPDATE', stopData);
    }
    broadcastTripStatus(tripId, status, details) {
        this.broadcastToTrip(tripId, 'TRIP_STATUS_UPDATE', { status, details });
    }
    broadcastTripDelay(tripId, delayData) {
        this.broadcastToTrip(tripId, 'TRIP_DELAY_UPDATE', delayData);
    }
    close() {
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval);
        if (this.wss)
            this.wss.close();
    }
}
exports.WebSocketService = WebSocketService;
exports.websocketService = new WebSocketService();
