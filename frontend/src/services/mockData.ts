// ============================================================================
// GramRoute AI — Illustrative Mock Data Store
// Clearly labelled: DESIGN PREVIEW & SIMULATION DATA ONLY
// Used for high-fidelity UI demonstration until backend integrations are linked.
// ============================================================================

import { Role } from '../types/api';
import { 
  Shipment, 
  Vehicle, 
  Trip, 
  Booking, 
  TrackingEvent, 
  Notification, 
  Dispute,
  VerificationDocument
} from '../types/entities';

export interface UserPersona {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  avatarUrl: string;
  locationName: string;
  rating: number;
  verified: boolean;
  meta: Record<string, string>;
}

export const DEMO_USERS: Record<Role, UserPersona> = {
  FARMER: {
    id: 'user_farmer_01',
    name: 'Ramesh Patel',
    phone: '+91 98230 45678',
    email: 'ramesh.farmer@gramroute.in',
    role: 'FARMER',
    avatarUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80',
    locationName: 'Dindori, Nashik District, Maharashtra',
    rating: 4.9,
    verified: true,
    meta: {
      fpoName: 'Sahyadri Farmers Producer Co.',
      primaryCrop: 'Onions & Table Grapes',
      landHoldingAcres: '6.5'
    }
  },
  TRANSPORTER: {
    id: 'user_transporter_01',
    name: 'Balwinder Singh',
    phone: '+91 98140 12345',
    email: 'balwinder.freight@gramroute.in',
    role: 'TRANSPORTER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    locationName: 'Pimpalgaon Baswant, Nashik',
    rating: 4.8,
    verified: true,
    meta: {
      fleetSize: '4 Commercial Trucks',
      operatingCorridor: 'Nashik -> Vashi APMC / Pune APMC',
      totalTripsCompleted: '142'
    }
  },
  BUSINESS: {
    id: 'user_business_01',
    name: 'Meera Agrotech Pvt Ltd',
    phone: '+91 97654 88990',
    email: 'logistics@meeraagrotech.com',
    role: 'BUSINESS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    locationName: 'MIDC Ambad, Nashik',
    rating: 4.95,
    verified: true,
    meta: {
      businessType: 'FPO Aggregator & Organic Input Distributor',
      gstNumber: '27AABCM8921F1ZX',
      monthlyVolumeMT: '280'
    }
  },
  ADMIN: {
    id: 'user_admin_01',
    name: 'Sunil Rao',
    phone: '+91 98801 99887',
    email: 'admin.ops@gramroute.in',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    locationName: 'GramRoute Operations Hub, Pune',
    rating: 5.0,
    verified: true,
    meta: {
      department: 'Platform Trust & Corridor Logistics Operations',
      securityClearance: 'Super Admin'
    }
  }
};

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    _id: 'ship_nashik_01',
    shipperId: 'user_farmer_01',
    cargoName: 'Red Onions (Grade A Export Quality)',
    cargoCategory: 'Vegetables',
    perishability: 'MODERATE',
    weightKg: 1800,
    volumeCubicMeters: 4.2,
    packagingType: 'Jute Bags (50kg)',
    origin: {
      address: 'Plot 14, Gat No. 42, Dindori',
      villageOrTown: 'Dindori',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422202',
      location: { coordinates: [73.8344, 20.2015] }
    },
    destination: {
      address: 'Sector 19, Turbhe, Vashi APMC Mandi',
      mandiOrMarketName: 'Vashi Onion-Potato APMC Mandi',
      district: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400705',
      location: { coordinates: [73.0033, 19.0759] }
    },
    pickupWindowStart: '2026-11-20T08:00:00Z',
    pickupWindowEnd: '2026-11-20T11:00:00Z',
    deliveryWindowStart: '2026-11-20T17:00:00Z',
    deliveryWindowEnd: '2026-11-20T21:00:00Z',
    maxBudgetInr: 4200,
    status: 'MATCHED'
  },
  {
    _id: 'ship_nashik_02',
    shipperId: 'user_farmer_01',
    cargoName: 'Thompson Seedless Table Grapes',
    cargoCategory: 'Fruits',
    perishability: 'HIGHLY_PERISHABLE',
    weightKg: 1200,
    volumeCubicMeters: 3.5,
    packagingType: 'Plastic Crates (10kg)',
    origin: {
      address: 'Shree Ganesh Mala, Pimpalgaon',
      villageOrTown: 'Pimpalgaon Baswant',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422209',
      location: { coordinates: [73.9856, 20.1738] }
    },
    destination: {
      address: 'Gultekdi Market Yard, Gate 2',
      mandiOrMarketName: 'Pune APMC Fruit Yard',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411037',
      location: { coordinates: [73.8647, 18.4967] }
    },
    pickupWindowStart: '2026-11-21T06:00:00Z',
    pickupWindowEnd: '2026-11-21T09:00:00Z',
    deliveryWindowStart: '2026-11-21T14:00:00Z',
    deliveryWindowEnd: '2026-11-21T18:00:00Z',
    maxBudgetInr: 3600,
    status: 'IN_TRANSIT'
  },
  {
    _id: 'ship_nashik_03',
    shipperId: 'user_business_01',
    cargoName: 'Organic Neem Fertilizer Bags',
    cargoCategory: 'Fertilizers & Inputs',
    perishability: 'NON_PERISHABLE',
    weightKg: 2500,
    volumeCubicMeters: 5.0,
    packagingType: 'HDPE Sacks (25kg)',
    origin: {
      address: 'Plot W-41, Ambad MIDC',
      villageOrTown: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422010',
      location: { coordinates: [73.7432, 19.9542] }
    },
    destination: {
      address: 'Sangamner FPO Agro Hub',
      mandiOrMarketName: 'Sangamner Sub-Market',
      district: 'Ahmednagar',
      state: 'Maharashtra',
      pincode: '422605',
      location: { coordinates: [74.2078, 19.5768] }
    },
    pickupWindowStart: '2026-11-22T09:00:00Z',
    pickupWindowEnd: '2026-11-22T13:00:00Z',
    deliveryWindowStart: '2026-11-22T16:00:00Z',
    deliveryWindowEnd: '2026-11-22T20:00:00Z',
    maxBudgetInr: 4800,
    status: 'LISTED'
  },
  {
    _id: 'ship_nashik_04',
    shipperId: 'user_farmer_01',
    cargoName: 'Fresh Cauliflower & Cabbage',
    cargoCategory: 'Vegetables',
    perishability: 'HIGHLY_PERISHABLE',
    weightKg: 950,
    volumeCubicMeters: 2.8,
    packagingType: 'Ventilated Crates',
    origin: {
      address: 'Farm Sector 3, Ozar',
      villageOrTown: 'Ozar',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422206',
      location: { coordinates: [73.9189, 20.0894] }
    },
    destination: {
      address: 'Kalyan Agricultural Produce Market',
      mandiOrMarketName: 'Kalyan APMC',
      district: 'Thane',
      state: 'Maharashtra',
      pincode: '421301',
      location: { coordinates: [73.1305, 19.2437] }
    },
    pickupWindowStart: '2026-11-19T05:00:00Z',
    pickupWindowEnd: '2026-11-19T08:00:00Z',
    deliveryWindowStart: '2026-11-19T13:00:00Z',
    deliveryWindowEnd: '2026-11-19T17:00:00Z',
    maxBudgetInr: 2500,
    status: 'DELIVERED'
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    _id: 'veh_01',
    transporterId: 'user_transporter_01',
    registrationNumber: 'MH 15 EF 4921',
    vehicleType: 'MINI_TRUCK',
    makeAndModel: 'Mahindra Bolero Maxi Truck Plus',
    yearOfManufacture: 2023,
    payloadCapacityKg: 1500,
    volumetricCapacityCubicMeters: 6.2,
    hasRefrigeration: false,
    hasTarpaulinCover: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [73.8344, 20.0063] // Nashik Highway
    }
  },
  {
    _id: 'veh_02',
    transporterId: 'user_transporter_01',
    registrationNumber: 'MH 15 GV 8820',
    vehicleType: 'PICKUP_TRUCK',
    makeAndModel: 'Ashok Leyland BADA DOST i4',
    yearOfManufacture: 2024,
    payloadCapacityKg: 1860,
    volumetricCapacityCubicMeters: 7.8,
    hasRefrigeration: false,
    hasTarpaulinCover: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [73.7898, 19.9975]
    }
  },
  {
    _id: 'veh_03',
    transporterId: 'user_transporter_01',
    registrationNumber: 'MH 04 KF 3311',
    vehicleType: 'REFRIGERATED_VAN',
    makeAndModel: 'Tata 407 Reefer Cold Van',
    yearOfManufacture: 2022,
    payloadCapacityKg: 2500,
    volumetricCapacityCubicMeters: 10.5,
    hasRefrigeration: true,
    hasTarpaulinCover: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [73.9856, 20.1738]
    }
  }
];

export const MOCK_TRIPS: Trip[] = [
  {
    _id: 'trip_active_01',
    transporterId: 'user_transporter_01',
    vehicleId: 'veh_01',
    departureTime: '2026-11-20T08:30:00Z',
    estimatedArrivalTime: '2026-11-20T17:30:00Z',
    totalDistanceKm: 184,
    totalEstimatedFuelCost: 2650,
    totalAgreedEarnings: 5900,
    allocatedWeightKg: 1250,
    remainingCapacityKg: 250,
    status: 'IN_TRANSIT',
    isBackhaulTrip: true
  },
  {
    _id: 'trip_planned_02',
    transporterId: 'user_transporter_01',
    vehicleId: 'veh_02',
    departureTime: '2026-11-21T06:00:00Z',
    estimatedArrivalTime: '2026-11-21T15:00:00Z',
    totalDistanceKm: 210,
    totalEstimatedFuelCost: 3100,
    totalAgreedEarnings: 7200,
    allocatedWeightKg: 900,
    remainingCapacityKg: 960,
    status: 'PLANNED',
    isBackhaulTrip: false
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    _id: 'book_01',
    bookingReference: 'GR-2026-BK781',
    shipmentId: 'ship_nashik_01',
    tripId: 'trip_active_01',
    shipperId: 'user_farmer_01',
    transporterId: 'user_transporter_01',
    totalAgreedAmountInr: 2950,
    pickupOtp: '4819',
    deliveryOtp: '9241',
    bookingStatus: 'IN_TRANSIT',
    paymentStatus: 'ESCROWED'
  },
  {
    _id: 'book_02',
    bookingReference: 'GR-2026-BK642',
    shipmentId: 'ship_nashik_04',
    tripId: 'trip_active_01',
    shipperId: 'user_farmer_01',
    transporterId: 'user_transporter_01',
    totalAgreedAmountInr: 1850,
    pickupOtp: '1102',
    deliveryOtp: '7683',
    bookingStatus: 'COMPLETED',
    paymentStatus: 'DISBURSED'
  }
];

export const MOCK_TRACKING_EVENTS: TrackingEvent[] = [
  {
    _id: 'trk_01',
    tripId: 'trip_active_01',
    shipmentId: 'ship_nashik_01',
    eventType: 'CARGO_LOADED',
    location: { coordinates: [73.8344, 20.2015] },
    speedKmh: 0,
    recordedAt: '2026-11-20T08:45:00Z'
  },
  {
    _id: 'trk_02',
    tripId: 'trip_active_01',
    shipmentId: 'ship_nashik_01',
    eventType: 'IN_TRANSIT',
    location: { coordinates: [73.6821, 19.8210] }, // Kasara Ghat highway
    speedKmh: 48,
    recordedAt: '2026-11-20T11:20:00Z'
  },
  {
    _id: 'trk_03',
    tripId: 'trip_active_01',
    shipmentId: 'ship_nashik_01',
    eventType: 'LOCATION_PING',
    location: { coordinates: [73.2104, 19.3812] }, // Near Kalyan junction
    speedKmh: 54,
    recordedAt: '2026-11-20T13:40:00Z'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: 'notif_01',
    recipientId: 'user_farmer_01',
    title: 'Shared Route Matched: 34% Savings',
    message: 'Transporter Balwinder Singh has available space on vehicle MH 15 EF 4921 passing through Dindori corridor.',
    channel: 'IN_APP',
    priority: 'HIGH',
    category: 'MATCH_FOUND',
    isRead: false,
    createdAt: '15 mins ago'
  },
  {
    _id: 'notif_02',
    recipientId: 'user_farmer_01',
    title: 'Truck Arriving for Pickup in 30 Mins',
    message: 'Vehicle MH 15 EF 4921 is 12 km from your farm. Prepare your red onion crates.',
    channel: 'IN_APP',
    priority: 'URGENT',
    category: 'TRIP_UPDATE',
    isRead: false,
    createdAt: '1 hour ago'
  },
  {
    _id: 'notif_03',
    recipientId: 'user_farmer_01',
    title: 'Escrow Payment Released',
    message: 'Delivery confirmed for Shipment GR-2026-BK642 at Kalyan APMC. ₹1,850 disbursed.',
    channel: 'IN_APP',
    priority: 'NORMAL',
    category: 'PAYMENT',
    isRead: true,
    createdAt: 'Yesterday'
  }
];

export const MOCK_DISPUTES: Dispute[] = [
  {
    _id: 'disp_01',
    disputeNumber: 'DISP-2026-092',
    bookingId: 'book_01',
    raisedByUserId: 'user_farmer_01',
    respondentUserId: 'user_transporter_01',
    category: 'CARGO_DAMAGE',
    description: 'During transit on Kasara ghat road, 4 crates of Thompson seedless grapes were damaged due to tarpaulin displacement.',
    status: 'INVESTIGATING',
    claimAmountInr: 1200
  }
];

export const MOCK_VERIFICATION_DOCS: VerificationDocument[] = [
  {
    _id: 'doc_01',
    userId: 'user_transporter_01',
    vehicleId: 'veh_01',
    documentType: 'VEHICLE_RC',
    documentIdentifierNumber: 'MH15EF4921-RC-2023',
    verificationStatus: 'VERIFIED'
  },
  {
    _id: 'doc_02',
    userId: 'user_transporter_01',
    vehicleId: 'veh_01',
    documentType: 'COMMERCIAL_PERMIT',
    documentIdentifierNumber: 'MH-STATE-FREIGHT-PERMIT-88912',
    verificationStatus: 'VERIFIED'
  },
  {
    _id: 'doc_03',
    userId: 'user_farmer_01',
    documentType: 'APMC_LICENSE',
    documentIdentifierNumber: 'APMC-NASHIK-FARM-9901',
    verificationStatus: 'PENDING'
  }
];

export const MOCK_PLATFORM_STATS = {
  totalFreightMovedTons: 14850,
  totalTripsCompleted: 3820,
  averageCostReductionPercentage: 34.2,
  emptyBackhaulKmSaved: 462000,
  activeTransporters: 1240,
  activeFarmersAndFpos: 5890,
  co2EmissionsSavedTonnes: 184.6,
  onTimeMandiArrivalRate: 98.4
};
