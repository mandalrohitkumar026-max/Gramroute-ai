import { Role } from './api';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

export interface User {
  _id: string;
  phoneNumber: string;
  email?: string;
  role: Role;
  status: UserStatus;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  _id: string;
  userId: string;
  fullName: string;
  businessName?: string;
  avatarUrl?: string;
  address: {
    street?: string;
    villageOrTown: string;
    subDistrict?: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  fpoAffiliation?: string;
  gstNumber?: string;
  ratingAverage: number;
  totalRatingsCount: number;
}

export type VehicleType = 'PICKUP_TRUCK' | 'MINI_TRUCK' | 'TRACTOR_TROLLEY' | 'HEAVY_TRUCK' | 'REFRIGERATED_VAN';

export interface Vehicle {
  _id: string;
  transporterId: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  makeAndModel: string;
  yearOfManufacture: number;
  payloadCapacityKg: number;
  volumetricCapacityCubicMeters: number;
  hasRefrigeration: boolean;
  hasTarpaulinCover: boolean;
  isActive: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export type PerishabilityCategory = 'HIGHLY_PERISHABLE' | 'MODERATE' | 'NON_PERISHABLE';
export type ShipmentStatus = 'DRAFT' | 'LISTED' | 'MATCHED' | 'BOOKED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Shipment {
  _id: string;
  shipperId: string;
  cargoName: string;
  cargoCategory: string;
  perishability: PerishabilityCategory;
  weightKg: number;
  volumeCubicMeters: number;
  packagingType: string;
  origin: {
    address: string;
    villageOrTown: string;
    district: string;
    state: string;
    pincode: string;
    location: { coordinates: [number, number] };
  };
  destination: {
    address: string;
    mandiOrMarketName?: string;
    district: string;
    state: string;
    pincode: string;
    location: { coordinates: [number, number] };
  };
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  maxBudgetInr: number;
  status: ShipmentStatus;
}

export interface ShipmentMatch {
  _id: string;
  shipmentIds: string[];
  vehicleId?: string;
  tripId?: string;
  consolidationScore: number;
  compatibilityScore: number;
  routeEfficiencyScore: number;
  estimatedTotalDistanceKm: number;
  estimatedCostSavingsPercentage: number;
  emptyBackhaulReductionKm: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
}

export type TripStatus = 'PLANNED' | 'EN_ROUTE_PICKUP' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  _id: string;
  transporterId: string;
  vehicleId: string;
  departureTime: string;
  estimatedArrivalTime: string;
  totalDistanceKm: number;
  totalEstimatedFuelCost: number;
  totalAgreedEarnings: number;
  allocatedWeightKg: number;
  remainingCapacityKg: number;
  status: TripStatus;
  isBackhaulTrip: boolean;
}

export interface TripStop {
  _id: string;
  tripId: string;
  shipmentId?: string;
  stopSequenceOrder: number;
  stopType: 'PICKUP' | 'DROP' | 'REST_BREAK' | 'FUEL_STOP';
  locationName: string;
  address: string;
  location: { coordinates: [number, number] };
  scheduledArrivalTime: string;
  scheduledDepartureTime: string;
  status: 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED';
}

export interface Booking {
  _id: string;
  bookingReference: string;
  shipmentId: string;
  tripId: string;
  shipperId: string;
  transporterId: string;
  totalAgreedAmountInr: number;
  pickupOtp: string;
  deliveryOtp: string;
  bookingStatus: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'ESCROWED' | 'DISBURSED' | 'REFUNDED';
}

export interface CostAllocation {
  _id: string;
  bookingId: string;
  tripId: string;
  shipmentId: string;
  baseHaulageCostInr: number;
  distanceKm: number;
  weightTons: number;
  consolidationDiscountInr: number;
  backhaulDiscountInr: number;
  platformFeeInr: number;
  finalShipperPayableInr: number;
  transporterNetReceivableInr: number;
}

export interface TrackingEvent {
  _id: string;
  tripId: string;
  shipmentId?: string;
  eventType: string;
  location: { coordinates: [number, number] };
  speedKmh?: number;
  recordedAt: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  channel: 'IN_APP' | 'SMS' | 'WHATSAPP';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  category: string;
  isRead: boolean;
  createdAt: string;
}

export interface Rating {
  _id: string;
  fromUserId: string;
  toUserId: string;
  bookingId: string;
  tripId: string;
  overallRating: number;
  comment?: string;
}

export interface Dispute {
  _id: string;
  disputeNumber: string;
  bookingId: string;
  raisedByUserId: string;
  respondentUserId: string;
  category: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  claimAmountInr?: number;
}

export interface PaymentRecord {
  _id: string;
  transactionReference: string;
  bookingId: string;
  payerUserId: string;
  payeeUserId: string;
  grossAmountInr: number;
  platformFeeInr: number;
  netDisbursedAmountInr: number;
  paymentMethod: string;
  status: 'INITIATED' | 'HELD_IN_ESCROW' | 'RELEASED_TO_TRANSPORTER' | 'REFUNDED' | 'FAILED';
}

export interface VerificationDocument {
  _id: string;
  userId: string;
  vehicleId?: string;
  documentType: string;
  documentIdentifierNumber: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
