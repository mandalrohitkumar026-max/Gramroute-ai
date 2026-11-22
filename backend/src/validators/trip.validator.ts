import { z } from 'zod';

const pointSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()])
});

export const createTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  routeSummary: z.string().optional().default('Regular Corridor Trip'),
  origin: z.object({
    address: z.string().min(2),
    district: z.string().default('Nashik'),
    state: z.string().default('Maharashtra'),
    location: pointSchema.optional().default({ type: 'Point', coordinates: [73.8344, 20.0063] })
  }),
  destination: z.object({
    address: z.string().min(2),
    district: z.string().default('Mumbai'),
    state: z.string().default('Maharashtra'),
    location: pointSchema.optional().default({ type: 'Point', coordinates: [72.9982, 19.0771] })
  }),
  departureTime: z.string(),
  estimatedArrivalTime: z.string(),
  availableCapacityKg: z.number().positive(),
  availableVolumeCbm: z.number().positive().optional().default(10),
  totalPriceInr: z.number().nonnegative().optional().default(3500),
  operatingCorridors: z.array(z.string()).default(['Nashik-Mumbai']),
  isPublished: z.boolean().default(true)
});

export const updateTripStatusSchema = z.object({
  status: z.enum(['PLANNED', 'EN_ROUTE_PICKUP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
});
