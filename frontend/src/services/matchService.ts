import { apiClient } from './apiClient';

export interface MatchScoringBreakdown {
  pickupProximity: number;
  destinationCompatibility: number;
  capacityUtilization: number;
  timeWindowCompatibility: number;
  detourEfficiency: number;
}

export interface FinancialEstimates {
  soloTruckBenchmarkCost: number;
  consolidatedPrice: number;
  estimatedSavings: number;
  savingsPercentage: number;
}

export interface ShipmentMatch {
  _id: string;
  shipmentId: {
    _id: string;
    trackingNumber: string;
    cargoCategory: string;
    cargoDescription: string;
    weightKg: number;
    pickupLocation: {
      address: string;
      district?: string;
      state?: string;
    };
    deliveryLocation: {
      address: string;
      district?: string;
      state?: string;
    };
    pickupDateWindow: {
      earliest: string;
      deadline: string;
    };
  } | string;
  tripId: {
    _id: string;
    tripNumber: string;
    departureTime: string;
    estimatedArrivalTime: string;
    origin: { address: string };
    destination: { address: string };
    totalDistanceKm: number;
    availablePayloadKg: number;
    transporterId?: {
      name?: string;
      phoneNumber?: string;
    };
    vehicleId?: {
      registrationNumber?: string;
      vehicleType?: string;
    };
  } | string;
  vehicleId: string;
  compatibilityScore: number;
  scoringBreakdown: MatchScoringBreakdown;
  financialEstimates: FinancialEstimates;
  compatibilityReasons: string[];
  compatibilityWarnings: string[];
  status: 'PROPOSED' | 'ACCEPTED_BY_SHIPPER' | 'ACCEPTED_BY_TRANSPORTER' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
  confirmedBookingId?: string;
  createdAt: string;
}

export const matchService = {
  async getMatchesForShipment(shipmentId: string) {
    const res = await apiClient.get<{ matches: ShipmentMatch[] }>(`/matches/shipment/${shipmentId}`);
    return res?.data?.matches || [];
  },

  async getMatches(params?: { status?: string; shipmentId?: string; tripId?: string }) {
    const res = await apiClient.get<{ matches: ShipmentMatch[] }>('/matches', params as Record<string, unknown>);
    return res?.data?.matches || [];
  },

  async getMatchById(matchId: string) {
    const res = await apiClient.get<{ match: ShipmentMatch }>(`/matches/${matchId}`);
    return res?.data?.match;
  },

  async acceptMatch(matchId: string) {
    const res = await apiClient.post<{ match: ShipmentMatch; booking?: any }>(`/matches/${matchId}/accept`);
    return res?.data;
  },

  async rejectMatch(matchId: string, reason?: string) {
    const res = await apiClient.post<{ match: ShipmentMatch }>(`/matches/${matchId}/reject`, { reason });
    return res?.data?.match;
  }
};
