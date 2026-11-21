"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporterOnboardingSchema = exports.businessOnboardingSchema = exports.farmerOnboardingSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const addressSchema = zod_1.z.object({
    street: zod_1.z.string().optional(),
    villageOrTown: zod_1.z.string().min(1, 'Village or town is required'),
    subDistrict: zod_1.z.string().optional(),
    district: zod_1.z.string().min(1, 'District is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    pincode: zod_1.z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    country: zod_1.z.string().default('India')
});
const locationSchema = zod_1.z.object({
    type: zod_1.z.literal('Point').default('Point'),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]) // [longitude, latitude]
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    businessName: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    address: addressSchema.optional(),
    location: locationSchema.optional(),
    fpoAffiliation: zod_1.z.string().optional(),
    primaryCrop: zod_1.z.string().optional(),
    landHoldingAcres: zod_1.z.number().nonnegative().optional(),
    businessType: zod_1.z.string().optional(),
    gstNumber: zod_1.z.string().optional(),
    contactPerson: zod_1.z.string().optional(),
    operatorName: zod_1.z.string().optional(),
    serviceCorridors: zod_1.z.array(zod_1.z.string()).optional(),
    fleetSize: zod_1.z.number().int().nonnegative().optional(),
    permitType: zod_1.z.string().optional()
});
exports.farmerOnboardingSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    address: addressSchema,
    location: locationSchema.optional(),
    fpoAffiliation: zod_1.z.string().optional(),
    primaryCrop: zod_1.z.string().min(2, 'Primary crop is required'),
    landHoldingAcres: zod_1.z.number().positive('Land holding must be positive').optional()
});
exports.businessOnboardingSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(2, 'Business name is required'),
    businessType: zod_1.z.string().min(2, 'Business type is required'),
    address: addressSchema,
    location: locationSchema.optional(),
    gstNumber: zod_1.z.string().optional(),
    contactPerson: zod_1.z.string().min(2, 'Contact person name is required')
});
exports.transporterOnboardingSchema = zod_1.z.object({
    operatorName: zod_1.z.string().min(2, 'Operator or business name is required'),
    address: addressSchema,
    location: locationSchema.optional(),
    serviceCorridors: zod_1.z.array(zod_1.z.string()).min(1, 'At least one service corridor is required'),
    fleetSize: zod_1.z.number().int().positive('Fleet size must be at least 1'),
    permitType: zod_1.z.string().min(2, 'Permit type is required')
});
