import { ActivityRecord, ActivityCategory, SimulationScenario } from '../types';
import { calculateCategoryTotals, calculateTotalEmissions } from './calculations';

export interface SimulationLever {
  id: string;
  category: ActivityCategory;
  name: string;
  description: string;
  currentReductionPercent: number; // 0 to 100
  potentialMaxSavingsKg: number;
  assumptions: string;
}

export interface SimulationResult {
  baselineTotalKg: number;
  projectedTotalKg: number;
  totalSavingsKg: number;
  percentageReduction: number;
  categoryComparison: {
    category: ActivityCategory;
    label: string;
    baselineKg: number;
    projectedKg: number;
    savedKg: number;
    color: string;
  }[];
  equivalencies: {
    treesPlantedYearEquivalent: number; // 1 urban tree absorbs ~21.77 kg CO2/year
    carKmAvoided: number; // ~0.170 kg/km petrol car
    homesPoweredDays: number; // ~10 kWh/day * 0.716 kg/kWh = 7.16 kg/day
  };
}

/**
 * Derives dynamic simulation levers from the user's recorded activities.
 */
export function getAvailableSimulationLevers(activities: ActivityRecord[]): SimulationLever[] {
  const categories = calculateCategoryTotals(activities);
  const elec = categories.find((c) => c.category === 'electricity')?.totalKg || 0;
  const trans = categories.find((c) => c.category === 'transportation')?.totalKg || 0;
  const food = categories.find((c) => c.category === 'food')?.totalKg || 0;
  const waste = categories.find((c) => c.category === 'waste')?.totalKg || 0;

  return [
    {
      id: 'lever-elec-solar',
      category: 'electricity',
      name: 'Rooftop Solar & Smart Energy Efficiency',
      description: 'Shift grid power to on-site solar PV and optimize thermostat cooling setpoints to 24°C.',
      currentReductionPercent: 0,
      potentialMaxSavingsKg: Math.round(elec * 0.75 * 10) / 10,
      assumptions: 'Displaces grid electricity (0.716 kg CO2e/kWh) with zero/low-carbon sources (0.041 kg CO2e/kWh).',
    },
    {
      id: 'lever-trans-public',
      category: 'transportation',
      name: 'Shift to Rail, Transit & Active Mobility',
      description: 'Replace solo car trips with carpools, campus shuttles, and intercity passenger rail.',
      currentReductionPercent: 0,
      potentialMaxSavingsKg: Math.round(trans * 0.70 * 10) / 10,
      assumptions: 'Replaces solo petrol car travel (0.170 kg/km) with rail/transit (0.035-0.089 kg/km) or cycling (0 kg).',
    },
    {
      id: 'lever-food-plant',
      category: 'food',
      name: 'Plant-Rich Catering & Food Waste Reduction',
      description: 'Default to seasonal plant-based and vegetarian meals; eliminate food scrap disposal.',
      currentReductionPercent: 0,
      potentialMaxSavingsKg: Math.round(food * 0.65 * 10) / 10,
      assumptions: 'Substitution of high-emission ruminant proteins (6.5 kg CO2e/meal) with plant-rich meals (0.65 kg CO2e/meal).',
    },
    {
      id: 'lever-waste-circular',
      category: 'waste',
      name: 'Zero-Waste Diversion & Aerobic Composting',
      description: 'Divert buffet food scraps and recyclable containers from landfill to composting and closed-loop recyclers.',
      currentReductionPercent: 0,
      potentialMaxSavingsKg: Math.round(waste * 0.85 * 10) / 10,
      assumptions: 'Diverts landfill organic waste (0.58-0.62 kg CO2e/kg) to managed aerobic composting (0.05 kg CO2e/kg).',
    },
  ];
}

/**
 * Calculates real-time simulation output.
 * Guaranteed: Projected = Baseline - Estimated Savings
 * Validates non-negative emissions and percentages (0 - 100).
 */
export function calculateSimulation(
  activities: ActivityRecord[],
  leverReductions: Record<string, number> // leverId -> percentage (0 to 100)
): SimulationResult {
  const categorySummaries = calculateCategoryTotals(activities);
  const baselineTotalKg = calculateTotalEmissions(activities);

  const levers = getAvailableSimulationLevers(activities);

  // Group savings by category
  const categorySavings: Record<ActivityCategory, number> = {
    electricity: 0,
    transportation: 0,
    food: 0,
    waste: 0,
  };

  levers.forEach((lever) => {
    const rawPercent = leverReductions[lever.id] || 0;
    const clampedPercent = Math.min(100, Math.max(0, rawPercent));
    const saved = (lever.potentialMaxSavingsKg * clampedPercent) / 100;
    categorySavings[lever.category] += saved;
  });

  const categoryComparison = categorySummaries.map((cat) => {
    const rawSaved = categorySavings[cat.category] || 0;
    // Ensure savings do not exceed baseline category footprint
    const savedKg = Math.round(Math.min(cat.totalKg, rawSaved) * 100) / 100;
    const projectedKg = Math.max(0, Math.round((cat.totalKg - savedKg) * 100) / 100);

    return {
      category: cat.category,
      label: cat.label,
      baselineKg: cat.totalKg,
      projectedKg,
      savedKg,
      color: cat.color,
    };
  });

  const totalSavingsKg = Math.round(
    categoryComparison.reduce((sum, c) => sum + c.savedKg, 0) * 100
  ) / 100;

  const projectedTotalKg = Math.max(0, Math.round((baselineTotalKg - totalSavingsKg) * 100) / 100);

  const percentageReduction =
    baselineTotalKg > 0 ? Math.round((totalSavingsKg / baselineTotalKg) * 1000) / 10 : 0;

  // Real-world tangible environmental equivalencies
  const treesPlantedYearEquivalent = Math.round(totalSavingsKg / 21.77);
  const carKmAvoided = Math.round(totalSavingsKg / 0.170);
  const homesPoweredDays = Math.round(totalSavingsKg / 7.16);

  return {
    baselineTotalKg,
    projectedTotalKg,
    totalSavingsKg,
    percentageReduction,
    categoryComparison,
    equivalencies: {
      treesPlantedYearEquivalent: Math.max(0, treesPlantedYearEquivalent),
      carKmAvoided: Math.max(0, carKmAvoided),
      homesPoweredDays: Math.max(0, homesPoweredDays),
    },
  };
}

/**
 * Creates a formatted SimulationScenario object ready for saving
 */
export function createScenarioObject(
  scenarioName: string,
  result: SimulationResult,
  levers: SimulationLever[],
  reductions: Record<string, number>
): SimulationScenario {
  const actionsApplied = levers
    .filter((l) => (reductions[l.id] || 0) > 0)
    .map((l) => {
      const pct = reductions[l.id];
      const saved = Math.round(((l.potentialMaxSavingsKg * pct) / 100) * 100) / 100;
      return {
        title: l.name,
        category: l.category,
        reduction_percent: pct,
        saved_kg: saved,
      };
    });

  return {
    id: 'sim-' + Date.now(),
    scenario_name: scenarioName || 'Custom Reduction Strategy',
    baseline_emissions: result.baselineTotalKg,
    projected_emissions: result.projectedTotalKg,
    estimated_savings: result.totalSavingsKg,
    percentage_reduction: result.percentageReduction,
    actions_applied: actionsApplied,
    assumptions:
      'Calculated against verified baseline factors (CEA Grid 0.716 kg/kWh, DEFRA transport & waste, Poore & Nemecek food). Never allows negative emissions.',
    created_at: new Date().toISOString(),
  };
}
