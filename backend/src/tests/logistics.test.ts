import { checkCargoCompatibility } from '../utils/cargoCompatibility';

describe('Core Logistics Business Rules & Compatibility Engine', () => {
  const standardVehicleCapacity = {
    maxPayloadKg: 2000,
    maxVolumeCbm: 12
  };

  describe('Cargo Compatibility Rules', () => {
    it('approves compatible agricultural food produce consolidation within capacity', () => {
      const existingItems = [
        {
          cargoCategory: 'VEGETABLES',
          isPerishable: true,
          weightKg: 800,
          volumeCubicMeters: 4
        }
      ];

      const newItem = {
        cargoCategory: 'FRUITS',
        isPerishable: true,
        weightKg: 500,
        volumeCubicMeters: 3
      };

      const result = checkCargoCompatibility(existingItems, newItem, standardVehicleCapacity);
      expect(result.compatible).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('rejects co-loading toxic agro-chemicals with fresh food or dairy produce', () => {
      const existingProduce = [
        {
          cargoCategory: 'VEGETABLES',
          isPerishable: true,
          weightKg: 600,
          volumeCubicMeters: 3
        }
      ];

      const hazardousChemical = {
        cargoCategory: 'PESTICIDES',
        isPerishable: false,
        weightKg: 200,
        volumeCubicMeters: 1
      };

      const result = checkCargoCompatibility(existingProduce, hazardousChemical, standardVehicleCapacity);
      expect(result.compatible).toBe(false);
      expect(result.reasons.some((r) => r.includes('Safety Violation'))).toBe(true);
    });

    it('rejects loading food produce when vehicle already carries chemical fertilizers', () => {
      const existingFertilizer = [
        {
          cargoCategory: 'CHEMICAL_FERTILIZERS',
          isPerishable: false,
          weightKg: 500,
          volumeCubicMeters: 2
        }
      ];

      const foodItem = {
        cargoCategory: 'DAIRY_POULTRY',
        isPerishable: true,
        weightKg: 300,
        volumeCubicMeters: 1
      };

      const result = checkCargoCompatibility(existingFertilizer, foodItem, standardVehicleCapacity);
      expect(result.compatible).toBe(false);
      expect(result.reasons.some((r) => r.includes('Safety Violation'))).toBe(true);
    });

    it('prevents vehicle overloading when total cargo weight exceeds payload capacity', () => {
      const existingItems = [
        {
          cargoCategory: 'GRAINS_CEREALS',
          weightKg: 1500,
          volumeCubicMeters: 6
        }
      ];

      const heavyItem = {
        cargoCategory: 'GRAINS_CEREALS',
        weightKg: 800, // 1500 + 800 = 2300 > 2000kg limit
        volumeCubicMeters: 3
      };

      const result = checkCargoCompatibility(existingItems, heavyItem, standardVehicleCapacity);
      expect(result.compatible).toBe(false);
      expect(result.reasons.some((r) => r.includes('Overload Prevention'))).toBe(true);
    });

    it('prevents volumetric overloading when cargo volume exceeds truck body cubic capacity', () => {
      const existingItems = [
        {
          cargoCategory: 'HARDWARE_EQUIPMENT',
          weightKg: 400,
          volumeCubicMeters: 8
        }
      ];

      const bulkyItem = {
        cargoCategory: 'GENERAL_FREIGHT',
        weightKg: 200,
        volumeCubicMeters: 6 // 8 + 6 = 14 > 12m³ limit
      };

      const result = checkCargoCompatibility(existingItems, bulkyItem, standardVehicleCapacity);
      expect(result.compatible).toBe(false);
      expect(result.reasons.some((r) => r.includes('Volumetric Capacity Exceeded'))).toBe(true);
    });
  });
});
