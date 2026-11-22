import { z } from 'zod';

export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(5, 'Valid vehicle registration number required'),
  vehicleType: z.enum([
    'PICKUP_TRUCK',
    'MINI_TRUCK',
    'TRACTOR_TROLLEY',
    'HEAVY_TRUCK',
    'REFRIGERATED_VAN'
  ]),
  vehicleCategory: z.string().optional().default('TARPAULIN'),
  makeAndModel: z.string().min(2, 'Make and model is required'),
  yearOfManufacture: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  payloadCapacityKg: z.number().positive('Payload capacity must be greater than 0'),
  volumetricCapacityCubicMeters: z.number().positive('Volumetric capacity must be greater than 0').optional().default(10),
  dimensions: z
    .object({
      lengthM: z.number().positive().optional(),
      widthM: z.number().positive().optional(),
      heightM: z.number().positive().optional()
    })
    .optional(),
  hasRefrigeration: z.boolean().default(false),
  hasTarpaulinCover: z.boolean().default(true),
  permitType: z.string().optional().default('National Permit'),
  operatingAreas: z.array(z.string()).default(['Nashik', 'Pune', 'Mumbai']),
  isAvailable: z.boolean().default(true),
  availabilityStatus: z.enum(['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'OFFLINE']).default('AVAILABLE'),
  documents: z
    .array(
      z.object({
        documentType: z.string(),
        documentNumber: z.string().optional(),
        documentUrl: z.string()
      })
    )
    .optional()
    .default([])
});

export const updateVehicleSchema = createVehicleSchema.partial();
