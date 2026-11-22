import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';
import vehicleRoutes from './vehicle.routes';
import shipmentRoutes from './shipment.routes';
import tripRoutes from './trip.routes';
import bookingRoutes from './booking.routes';
import matchRoutes from './match.routes';
import trackingRoutes from './tracking.routes';
import notificationRoutes from './notification.routes';
import ratingRoutes from './rating.routes';
import disputeRoutes from './dispute.routes';
import adminRoutes from './admin.routes';
import optimizationRoutes from './optimization.routes';
import verificationRoutes from './verification.routes';

const router = Router();

// Root API v1 meta
router.get('/', (_req, res) => {
  sendSuccess(res, {
    name: 'GramRoute AI REST API',
    version: 'v1',
    description: 'Intelligent Rural Freight Optimization & Shared Logistics Network API',
    documentationUrl: '/api/v1/docs',
    status: 'OPERATIONAL'
  });
});

// Mount modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/trips', tripRoutes);
router.use('/bookings', bookingRoutes);
router.use('/matches', matchRoutes);
router.use('/tracking', trackingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ratings', ratingRoutes);
router.use('/disputes', disputeRoutes);
router.use('/admin', adminRoutes);
router.use('/optimization', optimizationRoutes);
router.use('/verification', verificationRoutes);

export default router;
