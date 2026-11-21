"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipmentSchema = exports.createShipmentSchema = void 0;
const zod_1 = require("zod");
const pointSchema = zod_1.z.object({
    type: zod_1.z.literal('Point').default('Point'),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()])
});
const locationSchema = zod_1.z.object({
    address: zod_1.z.string().min(2, 'Address is required'),
    villageOrTown: zod_1.z.string().optional().default('Village'),
    district: zod_1.z.string().min(1, 'District is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    pincode: zod_1.z.string().optional().default('422001'),
    location: pointSchema.optional().default({ type: 'Point', coordinates: [73.8344, 20.0063] })
});
exports.createShipmentSchema = zod_1.z.object({
    cargoName: zod_1.z.string().min(2, 'Cargo description or name is required'),
    cargoDescription: zod_1.z.string().optional(),
    cargoCategory: zod_1.z.string().min(2, 'Cargo category is required'),
    isPerishable: zod_1.z.boolean().default(false),
    weightKg: zod_1.z.number().positive('Weight in kg must be greater than 0'),
    volumeCubicMeters: zod_1.z.number().positive('Volume must be positive').optional().default(1),
    numberOfPackages: zod_1.z.number().int().positive().optional().default(1),
    packagingType: zod_1.z.string().default('Bags'),
    isStackable: zod_1.z.boolean().default(true),
    temperatureControlRequired: zod_1.z.boolean().default(false),
    handlingRequirements: zod_1.z.array(zod_1.z.string()).default([]),
    specialInstructions: zod_1.z.string().optional(),
    preferredTransportType: zod_1.z.string().default('ANY'),
    origin: locationSchema,
    destination: locationSchema,
    preferredPickupDate: zod_1.z.string().optional(),
    deliveryDeadline: zod_1.z.string().optional(),
    pickupWindowStart: zod_1.z.string().optional(),
    deliveryWindowEnd: zod_1.z.string().optional(),
    maxBudgetInr: zod_1.z.number().positive().optional().default(2500)
});
exports.updateShipmentSchema = exports.createShipmentSchema.partial();
