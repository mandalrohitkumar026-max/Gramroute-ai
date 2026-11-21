"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTripStatusSchema = exports.createTripSchema = void 0;
const zod_1 = require("zod");
const pointSchema = zod_1.z.object({
    type: zod_1.z.literal('Point').default('Point'),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()])
});
exports.createTripSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().min(1, 'Vehicle ID is required'),
    routeSummary: zod_1.z.string().optional().default('Regular Corridor Trip'),
    origin: zod_1.z.object({
        address: zod_1.z.string().min(2),
        district: zod_1.z.string().default('Nashik'),
        state: zod_1.z.string().default('Maharashtra'),
        location: pointSchema.optional().default({ type: 'Point', coordinates: [73.8344, 20.0063] })
    }),
    destination: zod_1.z.object({
        address: zod_1.z.string().min(2),
        district: zod_1.z.string().default('Mumbai'),
        state: zod_1.z.string().default('Maharashtra'),
        location: pointSchema.optional().default({ type: 'Point', coordinates: [72.9982, 19.0771] })
    }),
    departureTime: zod_1.z.string(),
    estimatedArrivalTime: zod_1.z.string(),
    availableCapacityKg: zod_1.z.number().positive(),
    availableVolumeCbm: zod_1.z.number().positive().optional().default(10),
    totalPriceInr: zod_1.z.number().nonnegative().optional().default(3500),
    operatingCorridors: zod_1.z.array(zod_1.z.string()).default(['Nashik-Mumbai']),
    isPublished: zod_1.z.boolean().default(true)
});
exports.updateTripStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PLANNED', 'EN_ROUTE_PICKUP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
});
