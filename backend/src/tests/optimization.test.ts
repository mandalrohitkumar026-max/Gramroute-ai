import request from 'supertest';
import { createApp } from '../app';
import { aiEngineClient } from '../services/aiEngineClient';

describe('AI Optimization Microservice Integration Endpoints (Phase 5)', () => {
  const app = createApp();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/optimization/route (Validation)', () => {
    it('rejects optimization request missing vehicles with 400', async () => {
      const res = await request(app)
        .post('/api/v1/optimization/route')
        .send({
          vehicles: [],
          shipments: [{ shipment_id: 'SHP-1' }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/vehicle/i);
    });

    it('rejects optimization request missing shipments with 400', async () => {
      const res = await request(app)
        .post('/api/v1/optimization/route')
        .send({
          vehicles: [{ vehicle_id: 'VEH-1' }],
          shipments: []
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/shipment/i);
    });

    it('forwards valid payload to optimization engine and returns structured response', async () => {
      const mockResult: any = {
        success: true,
        status: 'OPTIMAL',
        algorithm_version: 'v5.0-ortools-pdp-vrptw',
        reproducibility_hash: 'abc123hash',
        timestamp: new Date().toISOString(),
        total_distance_km: 168.5,
        total_duration_minutes: 240.0,
        total_empty_km: 15.0,
        vehicle_routes: [
          {
            vehicle_id: 'VEH-1',
            assigned_shipments: ['SHP-1'],
            total_distance_km: 168.5,
            total_duration_minutes: 240.0,
            empty_return_km: 15.0,
            max_payload_utilized_kg: 850,
            peak_payload_utilization_pct: 68.0,
            peak_volume_utilization_pct: 55.0,
            estimated_trip_cost_inr: 4500,
            stops: []
          }
        ],
        unassigned_shipments: [],
        cost_allocation: {
          total_trip_cost_inr: 4500,
          fixed_mobilization_cost_inr: 800,
          running_distance_cost_inr: 3700,
          stop_service_cost_inr: 300,
          total_shipments_consolidated: 1,
          allocations: [],
          sum_allocated_inr: 4500,
          cost_recovery_balanced: true
        },
        benchmark: {
          summary: 'Saved Rs. 2,800 vs solo'
        },
        status_message: 'Route optimal'
      };

      jest.spyOn(aiEngineClient, 'optimizeRoute').mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/optimization/route')
        .send({
          vehicles: [
            {
              vehicle_id: 'VEH-1',
              max_payload_kg: 2500,
              max_volume_cubic_meters: 12,
              start_depot: { lat: 19.99, lon: 73.78 }
            }
          ],
          shipments: [
            {
              shipment_id: 'SHP-1',
              cargo_category: 'PERISHABLE_PRODUCE',
              weight_kg: 850,
              volume_cubic_meters: 4.0,
              pickup_location: { lat: 20.09, lon: 73.91 },
              delivery_location: { lat: 19.07, lon: 72.99 }
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.algorithm_version).toBe('v5.0-ortools-pdp-vrptw');
      expect(res.body.data.reproducibility_hash).toBe('abc123hash');
      expect(res.body.data.total_distance_km).toBe(168.5);
    });
  });

  describe('POST /api/v1/optimization/backhaul', () => {
    it('rejects backhaul evaluation missing vehicle or origin with 400', async () => {
      const res = await request(app)
        .post('/api/v1/optimization/backhaul')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns backhaul matches successfully when data provided', async () => {
      const mockBackhaul: any = {
        vehicle_id: 'VEH-1',
        baseline_empty_km: 160.0,
        backhaul_matches: [],
        total_deadhead_reduction_pct: 45.0,
        net_profit_gain_inr: 3200
      };

      jest.spyOn(aiEngineClient, 'evaluateBackhaul').mockResolvedValue(mockBackhaul);

      const res = await request(app)
        .post('/api/v1/optimization/backhaul')
        .send({
          vehicle: { vehicle_id: 'VEH-1', max_payload_kg: 2500, max_volume_cubic_meters: 10, start_depot: { lat: 19.99, lon: 73.78 } },
          return_origin: { lat: 19.07, lon: 72.99 },
          candidate_shipments: []
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total_deadhead_reduction_pct).toBe(45.0);
    });
  });
});
