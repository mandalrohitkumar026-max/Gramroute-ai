"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVehicleSchema = exports.createVehicleSchema = void 0;
const zod_1 = require("zod");
exports.createVehicleSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string().trim().min(5, 'Valid vehicle registration number required'),
    vehicleType: zod_1.z.enum([
        'PICKUP_TRUCK',
        'MINI_TRUCK',
        'TRACTOR_TROLLEY',
        'HEAVY_TRUCK',
        'REFRIGERATED_VAN'
    ]),
    vehicleCategory: zod_1.z.string().optional().default('TARPAULIN'),
    makeAndModel: zod_1.z.string().min(2, 'Make and model is required'),
    yearOfManufacture: zod_1.z.number().int().min(1990).max(new Date().getFullYear() + 1),
    payloadCapacityKg: zod_1.z.number().positive('Payload capacity must be greater than 0'),
    volumetricCapacityCubicMeters: zod_1.z.number().positive('Volumetric capacity must be greater than 0').optional().default(10),
    dimensions: zod_1.z
        .object({
        lengthM: zod_1.z.number().positive().optional(),
        widthM: zod_1.z.number().positive().optional(),
        heightM: zod_1.z.number().positive().optional()
    })
        .optional(),
    hasRefrigeration: zod_1.z.boolean().default(false),
    hasTarpaulinCover: zod_1.z.boolean().default(true),
    permitType: zod_1.z.string().optional().default('National Permit'),
    operatingAreas: zod_1.z.array(zod_1.z.string()).default(['Nashik', 'Pune', 'Mumbai']),
    isAvailable: zod_1.z.boolean().default(true),
    availabilityStatus: zod_1.z.enum(['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'OFFLINE']).default('AVAILABLE'),
    documents: zod_1.z
        .array(zod_1.z.object({
        documentType: zod_1.z.string(),
        documentNumber: zod_1.z.string().optional(),
        documentUrl: zod_1.z.string()
    }))
        .optional()
        .default([])
});
exports.updateVehicleSchema = exports.createVehicleSchema.partial();
