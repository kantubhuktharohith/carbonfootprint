import { describe, it, expect } from 'vitest';
import {
  calculateActivityEmissions,
  calculateCategoryTotals,
  calculateTotalEmissions,
  calculatePerPersonEmissions,
  compareReportingPeriods,
  validateEmissionInputs,
} from '../lib/calculations';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { ActivityRecord } from '../types';

describe('Carbon Calculation Engine', () => {
  const electricityFactor = EMISSION_FACTORS.find((f) => f.id === 'elec-grid-in')!;
  const petrolCarFactor = EMISSION_FACTORS.find((f) => f.id === 'trans-car-petrol')!;
  const beefMealFactor = EMISSION_FACTORS.find((f) => f.id === 'food-beef-redmeat')!;
  const landfillWasteFactor = EMISSION_FACTORS.find((f) => f.id === 'waste-landfill-mixed')!;
  const walkingFactor = EMISSION_FACTORS.find((f) => f.id === 'trans-walking')!;

  it('calculates Indian Grid electricity emissions correctly using CEA factor (0.716 kg/kWh)', () => {
    // 500 kWh * 0.716 = 358.000 kg CO2e
    const emissions = calculateActivityEmissions(500, electricityFactor);
    expect(emissions).toBe(358);
  });

  it('calculates Petrol car emissions for 120 km', () => {
    // 120 km * 0.170 = 20.400 kg CO2e
    const emissions = calculateActivityEmissions(120, petrolCarFactor);
    expect(emissions).toBe(20.4);
  });

  it('calculates carpooling division when isVehicleTotal is enabled', () => {
    // 120 km * 0.170 = 20.4 kg, divided by 3 passengers = 6.800 kg
    const emissions = calculateActivityEmissions(120, petrolCarFactor, {
      passengers: 3,
      isVehicleTotal: true,
    });
    expect(emissions).toBe(6.8);
  });

  it('calculates red meat meal emissions accurately (6.5 kg CO2e per meal)', () => {
    // 10 meals * 6.5 = 65 kg CO2e
    const emissions = calculateActivityEmissions(10, beefMealFactor);
    expect(emissions).toBe(65);
  });

  it('calculates zero direct emissions for walking and cycling', () => {
    const emissions = calculateActivityEmissions(15, walkingFactor);
    expect(emissions).toBe(0);
  });

  it('calculates landfill mixed waste emissions (0.580 kg CO2e per kg)', () => {
    // 85 kg waste * 0.580 = 49.3 kg CO2e
    const emissions = calculateActivityEmissions(85, landfillWasteFactor);
    expect(emissions).toBe(49.3);
  });

  it('rejects negative quantity with meaningful validation error', () => {
    const result = validateEmissionInputs(-10, 'kWh', electricityFactor);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot be negative');

    expect(() => {
      calculateActivityEmissions(-5, electricityFactor);
    }).toThrow();
  });

  it('rejects mismatched units', () => {
    const result = validateEmissionInputs(100, 'liters', electricityFactor);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unit mismatch');
  });

  it('calculates category totals and grand total from activity records', () => {
    const mockActivities: ActivityRecord[] = [
      {
        id: '1',
        category: 'electricity',
        activity_type: 'grid_electricity_in',
        quantity: 100,
        unit: 'kWh',
        emission_factor_id: electricityFactor.id,
        factor_value_used: electricityFactor.value,
        estimated_emissions: 71.6,
        activity_date: '2026-10-01',
        created_at: '2026-10-01T10:00:00Z',
      },
      {
        id: '2',
        category: 'transportation',
        activity_type: 'passenger_car_petrol',
        quantity: 100,
        unit: 'km',
        emission_factor_id: petrolCarFactor.id,
        factor_value_used: petrolCarFactor.value,
        estimated_emissions: 17.0,
        activity_date: '2026-10-02',
        created_at: '2026-10-02T10:00:00Z',
      },
      {
        id: '3',
        category: 'food',
        activity_type: 'red_meat_meal',
        quantity: 2,
        unit: 'meal',
        emission_factor_id: beefMealFactor.id,
        factor_value_used: beefMealFactor.value,
        estimated_emissions: 13.0,
        activity_date: '2026-10-02',
        created_at: '2026-10-02T12:00:00Z',
      },
    ];

    const total = calculateTotalEmissions(mockActivities);
    expect(total).toBe(101.6);

    const summaries = calculateCategoryTotals(mockActivities);
    const elecSummary = summaries.find((s) => s.category === 'electricity')!;
    expect(elecSummary.totalKg).toBe(71.6);
    expect(elecSummary.percentage).toBeCloseTo(70.5, 0);
  });

  it('calculates per-person emissions accurately', () => {
    const totalEmissions = 1500;
    const participants = 100;
    const perPerson = calculatePerPersonEmissions(totalEmissions, participants);
    expect(perPerson).toBe(15);
  });

  it('compares reporting periods and indicates reduction trend', () => {
    const prevActivities: ActivityRecord[] = [
      {
        id: 'p1',
        category: 'electricity',
        activity_type: 'grid',
        quantity: 200,
        unit: 'kWh',
        emission_factor_id: electricityFactor.id,
        factor_value_used: electricityFactor.value,
        estimated_emissions: 200,
        activity_date: '2026-09-01',
        created_at: '2026-09-01T00:00:00Z',
      },
    ];

    const currentActivities: ActivityRecord[] = [
      {
        id: 'c1',
        category: 'electricity',
        activity_type: 'grid',
        quantity: 150,
        unit: 'kWh',
        emission_factor_id: electricityFactor.id,
        factor_value_used: electricityFactor.value,
        estimated_emissions: 150,
        activity_date: '2026-10-01',
        created_at: '2026-10-01T00:00:00Z',
      },
    ];

    const comparison = compareReportingPeriods(currentActivities, prevActivities);
    expect(comparison.trend).toBe('decreased');
    expect(comparison.diffKg).toBe(-50);
    expect(comparison.diffPercentage).toBe(-25);
  });
});
