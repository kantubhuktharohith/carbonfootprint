import { ActivityRecord } from '../types';

const sampleDefinitions = [
  ['electricity', 'grid_electricity_in', 'elec-grid-in', 'kWh', 0.716, 'CEA India CO2 Baseline Database', 120],
  ['transportation', 'passenger_car_petrol', 'trans-car-petrol', 'km', 0.17, 'DEFRA Passenger Vehicles', 42],
  ['food', 'vegetarian_meal', 'food-vegetarian', 'meal', 1.1, 'WRI Protein Scorecard', 18],
  ['waste', 'managed_composting', 'waste-composting-aerobic', 'kg', 0.05, 'IPCC Biological Waste Treatment', 14],
] as const;

export const SAMPLE_ACTIVITIES: ActivityRecord[] = Array.from({ length: 30 }, (_, index) => {
  const definition = sampleDefinitions[index % sampleDefinitions.length];
  const [category, activityType, factorId, unit, factor, source, baseQuantity] = definition;
  const quantity = baseQuantity + (index % 5) * (category === 'food' ? 2 : 10);
  const day = String(index + 1).padStart(2, '0');

  return {
    id: `sample-activity-${day}`,
    category,
    activity_type: activityType,
    quantity,
    unit,
    emission_factor_id: factorId,
    factor_value_used: factor,
    factor_source_name: source,
    estimated_emissions: Number((quantity * factor).toFixed(3)),
    activity_date: `2026-09-${day}`,
    notes: 'Optional sample record for testing and reference',
    created_at: `2026-09-${day}T12:00:00Z`,
  };
});
