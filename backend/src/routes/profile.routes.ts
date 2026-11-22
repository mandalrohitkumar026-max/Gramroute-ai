import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  completeFarmerOnboarding,
  completeBusinessOnboarding,
  completeTransporterOnboarding
} from '../controllers/profile.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  farmerOnboardingSchema,
  businessOnboardingSchema,
  transporterOnboardingSchema
} from '../validators/profile.validator';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), updateProfile);

router.post(
  '/onboarding/farmer',
  authorize('FARMER', 'ADMIN'),
  validate({ body: farmerOnboardingSchema }),
  completeFarmerOnboarding
);

router.post(
  '/onboarding/business',
  authorize('BUSINESS', 'ADMIN'),
  validate({ body: businessOnboardingSchema }),
  completeBusinessOnboarding
);

router.post(
  '/onboarding/transporter',
  authorize('TRANSPORTER', 'ADMIN'),
  validate({ body: transporterOnboardingSchema }),
  completeTransporterOnboarding
);

export default router;
