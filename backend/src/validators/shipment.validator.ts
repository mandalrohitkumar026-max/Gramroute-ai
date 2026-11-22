import { z } from 'zod';

const pointSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()])
});

const locationSchema = z.object({
  address: z.string().min(2, 'Address is required'),
  villageOrTown: z.string().optional().default('Village'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().optional().default('422001'),
  location: pointSchema.optional().default({ type: 'Point', coordinates: [73.8344, 20.0063] })
});

export const createShipmentSchema = z.object({
  cargoName: z.string().min(2, 'Cargo description or name is required'),
  cargoDescription: z.string().optional(),
  cargoCategory: z.string().min(2, 'Cargo category is required'),
  isPerishable: z.boolean().default(false),
  weightKg: z.number().positive('Weight in kg must be greater than 0'),
  volumeCubicMeters: z.number().positive('Volume must be positive').optional().default(1),
  numberOfPackages: z.number().int().positive().optional().default(1),
  packagingType: z.string().default('Bags'),
  isStackable: z.boolean().default(true),
  temperatureControlRequired: z.boolean().default(false),
  handlingRequirements: z.array(z.string()).default([]),
  specialInstructions: z.string().optional(),
  preferredTransportType: z.string().default('ANY'),
  origin: locationSchema,
  destination: locationSchema,
  preferredPickupDate: z.string().optional(),
  deliveryDeadline: z.string().optional(),
  pickupWindowStart: z.string().optional(),
  deliveryWindowEnd: z.string().optional(),
  maxBudgetInr: z.number().positive().optional().default(2500)
});

export const updateShipmentSchema = createShipmentSchema.partial();
