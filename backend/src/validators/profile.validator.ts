import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().optional(),
  villageOrTown: z.string().min(1, 'Village or town is required'),
  subDistrict: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India')
});

const locationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()]) // [longitude, latitude]
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  businessName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  address: addressSchema.optional(),
  location: locationSchema.optional(),
  fpoAffiliation: z.string().optional(),
  primaryCrop: z.string().optional(),
  landHoldingAcres: z.number().nonnegative().optional(),
  businessType: z.string().optional(),
  gstNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  operatorName: z.string().optional(),
  serviceCorridors: z.array(z.string()).optional(),
  fleetSize: z.number().int().nonnegative().optional(),
  permitType: z.string().optional()
});

export const farmerOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  address: addressSchema,
  location: locationSchema.optional(),
  fpoAffiliation: z.string().optional(),
  primaryCrop: z.string().min(2, 'Primary crop is required'),
  landHoldingAcres: z.number().positive('Land holding must be positive').optional()
});

export const businessOnboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  address: addressSchema,
  location: locationSchema.optional(),
  gstNumber: z.string().optional(),
  contactPerson: z.string().min(2, 'Contact person name is required')
});

export const transporterOnboardingSchema = z.object({
  operatorName: z.string().min(2, 'Operator or business name is required'),
  address: addressSchema,
  location: locationSchema.optional(),
  serviceCorridors: z.array(z.string()).min(1, 'At least one service corridor is required'),
  fleetSize: z.number().int().positive('Fleet size must be at least 1'),
  permitType: z.string().min(2, 'Permit type is required')
});
