import { apiClient } from './apiClient';

export interface LocationPingPayload {
  tripId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  accuracyMeters?: number;
  batteryLevelPercentage?: number;
  recordedAt?: string;
}

export interface StopData {
  _id: string;
  stopSequenceOrder: number;
  stopType: 'PICKUP' | 'DROP' | 'REST_BREAK' | 'FUEL_STOP';
  locationName: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  scheduledArrivalTime: string;
  scheduledDepartureTime: string;
  actualArrivalTime?: string;
  actualDepartureTime?: string;
  status: 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED';
  contactPersonName?: string;
  contactPhoneNumber?: string;
  otpForAction?: string;
  proofImageUrl?: string;
  notes?: string;
}

export interface TripLiveTrackingData {
  trip: {
    _id: string;
    routeSummary?: string;
    origin: { address: string; district?: string };
    destination: { address: string; district?: string };
    status: 'PLANNED' | 'EN_ROUTE_PICKUP' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
    departureTime: string;
    estimatedArrivalTime: string;
    actualStartTime?: string;
    actualCompletionTime?: string;
    reportedDelayMinutes: number;
    delayReason?: string;
    transporter?: {
      _id: string;
      name: string;
      phoneNumber: string;
      email?: string;
    };
    vehicle?: {
      _id: string;
      registrationNumber: string;
      vehicleType: string;
      makeAndModel?: string;
      payloadCapacityKg: number;
    };
  };
  lastKnownLocation: {
    coordinates: [number, number]; // [lng, lat]
    speedKmh?: number;
    accuracyMeters?: number;
    updatedAt: string;
  } | null;
  isStale: boolean;
  staleWarning: string | null;
  progress: {
    totalStops: number;
    completedStops: number;
    remainingStops: number;
    percentComplete: number;
  };
  stops: StopData[];
}

export const trackingService = {
  async getTripLiveTracking(tripId: string): Promise<TripLiveTrackingData | null> {
    const res = await apiClient.get<TripLiveTrackingData>(`/tracking/${tripId}`);
    return res?.data || null;
  },

  async recordLocationPing(payload: LocationPingPayload) {
    return apiClient.post('/tracking/ping', payload);
  },

  async startTrip(tripId: string) {
    return apiClient.post(`/trips/${tripId}/start`);
  },

  async markArrivedAtStop(tripId: string, stopId: string) {
    return apiClient.post(`/trips/${tripId}/stops/${stopId}/arrive`);
  },

  async confirmPickupStop(tripId: string, stopId: string, otp?: string) {
    return apiClient.post(`/trips/${tripId}/stops/${stopId}/confirm-pickup`, { otp });
  },

  async reportTripDelay(tripId: string, delayMinutes: number, reason: string, notes?: string) {
    return apiClient.post(`/trips/${tripId}/report-delay`, { delayMinutes, reason, notes });
  },

  async confirmDeliveryStop(tripId: string, stopId: string, payload: {
    receiverName: string;
    receiverPhone?: string;
    proofImageUrl?: string;
    remarks?: string;
    otp?: string;
  }) {
    return apiClient.post(`/trips/${tripId}/stops/${stopId}/confirm-delivery`, payload);
  },

  async completeTrip(tripId: string) {
    return apiClient.post(`/trips/${tripId}/complete`);
  }
};
