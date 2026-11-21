"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCargoCompatibility = void 0;
const FOOD_PERISHABLE_CATEGORIES = new Set([
    'VEGETABLES',
    'FRUITS',
    'GRAINS_CEREALS',
    'DAIRY_POULTRY',
    'PROCESSED_FOOD'
]);
const HAZARDOUS_CHEMICAL_CATEGORIES = new Set([
    'CHEMICAL_FERTILIZERS',
    'PESTICIDES'
]);
/**
 * Validates cross-cargo compatibility rules and vehicle loading limits
 */
const checkCargoCompatibility = (existingItems, newItem, vehicleCapacity) => {
    const reasons = [];
    // 1. Cross-contamination safety rule: Never co-load toxic agro-chemicals with food/produce
    const isNewItemHazardous = HAZARDOUS_CHEMICAL_CATEGORIES.has(newItem.cargoCategory);
    const isNewItemFood = FOOD_PERISHABLE_CATEGORIES.has(newItem.cargoCategory);
    for (const existing of existingItems) {
        const isExistingHazardous = HAZARDOUS_CHEMICAL_CATEGORIES.has(existing.cargoCategory);
        const isExistingFood = FOOD_PERISHABLE_CATEGORIES.has(existing.cargoCategory);
        if (isNewItemHazardous && isExistingFood) {
            reasons.push(`Safety Violation: Toxic agricultural input (${newItem.cargoCategory}) cannot be co-loaded with food or perishable produce (${existing.cargoCategory}).`);
        }
        if (isNewItemFood && isExistingHazardous) {
            reasons.push(`Safety Violation: Food produce (${newItem.cargoCategory}) cannot be co-loaded in a trip carrying chemical inputs (${existing.cargoCategory}).`);
        }
        // Odor contamination rule: High odor items like chemical fertilizers or raw fish with dairy/tea
        if (existing.cargoCategory === 'DAIRY_POULTRY' && (isNewItemHazardous || newItem.cargoCategory === 'HARDWARE_EQUIPMENT')) {
            reasons.push(`Contamination Risk: Dairy products require clean, odor-free transport isolation.`);
        }
    }
    // 2. Temperature sensitivity check
    if (newItem.temperatureControlRequired) {
        const hasIncompatibleAmbient = existingItems.some((item) => !item.temperatureControlRequired && item.isPerishable === false);
        if (hasIncompatibleAmbient) {
            reasons.push(`Temperature Alert: Cold-chain shipment requires dedicated refrigerated consolidation.`);
        }
    }
    // 3. Vehicle Overload Prevention
    const totalWeight = existingItems.reduce((acc, item) => acc + item.weightKg, 0) + newItem.weightKg;
    if (totalWeight > vehicleCapacity.maxPayloadKg) {
        reasons.push(`Overload Prevention: Combined cargo weight (${totalWeight} kg) exceeds vehicle maximum payload limit (${vehicleCapacity.maxPayloadKg} kg).`);
    }
    const totalVolume = existingItems.reduce((acc, item) => acc + (item.volumeCubicMeters || 0), 0) + (newItem.volumeCubicMeters || 0);
    if (vehicleCapacity.maxVolumeCbm > 0 && totalVolume > vehicleCapacity.maxVolumeCbm) {
        reasons.push(`Volumetric Capacity Exceeded: Combined cargo volume (${totalVolume.toFixed(2)} m³) exceeds vehicle capacity (${vehicleCapacity.maxVolumeCbm} m³).`);
    }
    return {
        compatible: reasons.length === 0,
        reasons
    };
};
exports.checkCargoCompatibility = checkCargoCompatibility;
