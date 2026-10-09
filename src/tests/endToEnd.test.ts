import { describe, it, expect } from 'vitest';
import {
  calculateActivityEmissions,
  calculateCategoryTotals,
  calculateTotalEmissions,
  calculatePerPersonEmissions,
  compareReportingPeriods,
} from '../lib/calculations';
import { DEMO_ACTIVITIES, DEMO_PREVIOUS_ACTIVITIES } from '../data/demoData';
import { generateRecommendations } from '../lib/recommendations';
import {
  calculateSimulation,
  createScenarioObject,
  getAvailableSimulationLevers,
} from '../lib/simulator';
import { EMISSION_FACTORS } from '../data/emissionFactors';

describe('EcoTrack AI Full Workflow & Data Integration', () => {
  it('loads demo activities and calculates total emissions and category splits', () => {
    expect(DEMO_ACTIVITIES.length).toBeGreaterThanOrEqual(16);

    const totalKg = calculateTotalEmissions(DEMO_ACTIVITIES);
    // Should be in range of 5000-8000 kg CO2e for the 350 attendee hackathon
    expect(totalKg).toBeGreaterThan(4000);
    expect(totalKg).toBeLessThan(12000);

    const categories = calculateCategoryTotals(DEMO_ACTIVITIES);
    expect(categories.length).toBe(4);

    const sumCategoryTotals = categories.reduce((sum, c) => sum + c.totalKg, 0);
    expect(Math.round(sumCategoryTotals)).toBe(Math.round(totalKg));

    const totalPercentage = categories.reduce((sum, c) => sum + c.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });

  it('calculates attendee intensity for 342 attendees', () => {
    const totalKg = calculateTotalEmissions(DEMO_ACTIVITIES);
    const perPerson = calculatePerPersonEmissions(totalKg, 342);
    expect(perPerson).toBeGreaterThan(10);
    expect(perPerson).toBeLessThan(35);
  });

  it('generates ranked context-aware recommendations from activity records', () => {
    const recs = generateRecommendations(DEMO_ACTIVITIES);
    expect(recs.length).toBeGreaterThan(0);

    // Verify recommendations are sorted in descending order of estimated savings
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].estimated_savings).toBeGreaterThanOrEqual(recs[i + 1].estimated_savings);
    }

    // Verify required fields
    const topRec = recs[0];
    expect(topRec.title).toBeTruthy();
    expect(topRec.explanation).toBeTruthy();
    expect(topRec.baseline_activity).toBeTruthy();
    expect(topRec.suggested_change).toBeTruthy();
    expect(topRec.assumptions).toBeTruthy();
    expect(topRec.next_steps.length).toBeGreaterThan(0);
    expect(topRec.estimated_savings).toBeGreaterThan(0);
  });

  it('runs impact simulator and satisfies invariant: Projected = Baseline - Savings', () => {
    const levers = getAvailableSimulationLevers(DEMO_ACTIVITIES);
    expect(levers.length).toBe(4);

    const activeReductions = {
      'lever-elec-solar': 50,
      'lever-trans-public': 40,
      'lever-food-plant': 60,
      'lever-waste-circular': 70,
    };

    const simResult = calculateSimulation(DEMO_ACTIVITIES, activeReductions);

    // Invariant: Projected = Baseline - Savings
    expect(simResult.projectedTotalKg).toBe(
      Math.max(0, Math.round((simResult.baselineTotalKg - simResult.totalSavingsKg) * 100) / 100)
    );

    // Never negative emissions
    expect(simResult.projectedTotalKg).toBeGreaterThanOrEqual(0);
    expect(simResult.totalSavingsKg).toBeGreaterThan(0);
    expect(simResult.percentageReduction).toBeGreaterThan(0);
    expect(simResult.percentageReduction).toBeLessThanOrEqual(100);

    // Environmental equivalencies
    expect(simResult.equivalencies.treesPlantedYearEquivalent).toBeGreaterThan(0);
    expect(simResult.equivalencies.carKmAvoided).toBeGreaterThan(0);
    expect(simResult.equivalencies.homesPoweredDays).toBeGreaterThan(0);

    // Scenario object generation
    const scenario = createScenarioObject(
      'Test Hackathon Scenario',
      simResult,
      levers,
      activeReductions
    );
    expect(scenario.scenario_name).toBe('Test Hackathon Scenario');
    expect(scenario.actions_applied.length).toBe(4);
    expect(scenario.baseline_emissions).toBe(simResult.baselineTotalKg);
  });

  it('correctly models walking and cycling as 0 direct operational emissions', () => {
    const bike = EMISSION_FACTORS.find((f) => f.id === 'trans-bicycle')!;
    const walk = EMISSION_FACTORS.find((f) => f.id === 'trans-walking')!;

    expect(calculateActivityEmissions(100, bike)).toBe(0);
    expect(calculateActivityEmissions(250, walk)).toBe(0);
  });

  it('models carpooling passenger division correctly', () => {
    const car = EMISSION_FACTORS.find((f) => f.id === 'trans-car-petrol')!;
    // Solo driver: 100 km * 0.170 = 17 kg
    const solo = calculateActivityEmissions(100, car, { passengers: 1, isVehicleTotal: true });
    // 4 carpoolers sharing total vehicle: 17 / 4 = 4.25 kg
    const carpool = calculateActivityEmissions(100, car, { passengers: 4, isVehicleTotal: true });

    expect(solo).toBe(17);
    expect(carpool).toBe(4.25);
  });
});
