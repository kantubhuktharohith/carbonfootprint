import { ActivityCategory, ActivityRecord, EmissionFactor, CategorySummary, ReportingPeriod } from '../types';

export interface CalculationOptions {
  passengers?: number; // For carpool division
  isVehicleTotal?: boolean; // If true, divide total vehicle emission by passengers
}

/**
 * Validates inputs for calculation
 */
export function validateEmissionInputs(
  quantity: number,
  unit: string,
  factor: EmissionFactor
): { valid: boolean; error?: string } {
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    return { valid: false, error: 'Activity quantity must be a valid number.' };
  }
  if (quantity < 0) {
    return { valid: false, error: 'Activity quantity cannot be negative.' };
  }
  if (quantity === 0) {
    return { valid: true };
  }
  if (!factor) {
    return { valid: false, error: 'Emission factor is missing.' };
  }
  // Check unit compatibility
  const normalizedInputUnit = unit.trim().toLowerCase();
  const normalizedFactorUnit = factor.unit.trim().toLowerCase();
  
  if (normalizedInputUnit !== normalizedFactorUnit) {
    return {
      valid: false,
      error: `Unit mismatch: Expected ${factor.unit} for ${factor.activity_type}, but got ${unit}.`,
    };
  }

  return { valid: true };
}

/**
 * Calculates emissions for a single activity.
 * Formula: Emissions (kg CO2e) = Activity Quantity × Emission Factor
 * If carpooling with passenger count > 1 and isVehicleTotal is true, divides vehicle emission by passengers.
 */
export function calculateActivityEmissions(
  quantity: number,
  factor: EmissionFactor,
  options?: CalculationOptions
): number {
  const validation = validateEmissionInputs(quantity, factor.unit, factor);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid calculation inputs');
  }

  if (quantity === 0 || factor.value === 0) {
    return 0;
  }

  let total = quantity * factor.value;

  // Passenger carpool adjustment: If passenger count > 1 and user entered vehicle distance
  if (options?.passengers && options.passengers > 1 && options?.isVehicleTotal) {
    total = total / options.passengers;
  }

  // Round to 3 decimal places for precision without float rounding errors
  return Math.round(total * 1000) / 1000;
}

/**
 * Aggregates activities by category with percentage and color tokens
 */
export function calculateCategoryTotals(activities: ActivityRecord[]): CategorySummary[] {
  const categories: { [key in ActivityCategory]: { label: string; color: string } } = {
    electricity: { label: 'Electricity & Energy', color: '#166534' },
    transportation: { label: 'Transportation', color: '#0284C7' },
    food: { label: 'Food & Dining', color: '#D97706' },
    waste: { label: 'Waste Management', color: '#7C3AED' },
  };

  const totals: Record<ActivityCategory, { totalKg: number; count: number }> = {
    electricity: { totalKg: 0, count: 0 },
    transportation: { totalKg: 0, count: 0 },
    food: { totalKg: 0, count: 0 },
    waste: { totalKg: 0, count: 0 },
  };

  let grandTotal = 0;

  for (const act of activities) {
    if (totals[act.category]) {
      totals[act.category].totalKg += act.estimated_emissions || 0;
      totals[act.category].count += 1;
      grandTotal += act.estimated_emissions || 0;
    }
  }

  return (Object.keys(categories) as ActivityCategory[]).map((cat) => {
    const totalKg = Math.round(totals[cat].totalKg * 100) / 100;
    const percentage = grandTotal > 0 ? Math.round((totalKg / grandTotal) * 1000) / 10 : 0;
    return {
      category: cat,
      label: categories[cat].label,
      totalKg,
      percentage,
      activityCount: totals[cat].count,
      color: categories[cat].color,
    };
  });
}

/**
 * Calculates grand total emissions in kg CO2e
 */
export function calculateTotalEmissions(activities: ActivityRecord[]): number {
  const sum = activities.reduce((acc, curr) => acc + (curr.estimated_emissions || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates per-person emissions for institutions or event organizers
 */
export function calculatePerPersonEmissions(totalEmissions: number, participantCount: number): number {
  if (!participantCount || participantCount <= 0) return 0;
  return Math.round((totalEmissions / participantCount) * 100) / 100;
}

/**
 * Compares current period activities with previous equivalent period activities
 */
export function compareReportingPeriods(
  currentActivities: ActivityRecord[],
  previousActivities: ActivityRecord[]
): {
  currentTotal: number;
  previousTotal: number;
  diffKg: number;
  diffPercentage: number;
  trend: 'increased' | 'decreased' | 'unchanged';
} {
  const currentTotal = calculateTotalEmissions(currentActivities);
  const previousTotal = calculateTotalEmissions(previousActivities);

  const diffKg = Math.round((currentTotal - previousTotal) * 100) / 100;

  let diffPercentage = 0;
  if (previousTotal > 0) {
    diffPercentage = Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10;
  } else if (currentTotal > 0) {
    diffPercentage = 100;
  }

  const trend = diffKg > 0 ? 'increased' : diffKg < 0 ? 'decreased' : 'unchanged';

  return {
    currentTotal,
    previousTotal,
    diffKg,
    diffPercentage,
    trend,
  };
}

/**
 * Estimates potential savings based on target percentage or baseline reductions
 */
export function calculatePotentialSavings(
  activities: ActivityRecord[],
  targetPercentage = 25
): {
  potentialSavingsKg: number;
  targetFootprintKg: number;
  percentage: number;
} {
  const total = calculateTotalEmissions(activities);
  const clampedPercentage = Math.min(100, Math.max(0, targetPercentage));
  const potentialSavingsKg = Math.round(((total * clampedPercentage) / 100) * 100) / 100;
  const targetFootprintKg = Math.max(0, Math.round((total - potentialSavingsKg) * 100) / 100);

  return {
    potentialSavingsKg,
    targetFootprintKg,
    percentage: clampedPercentage,
  };
}

/**
 * Identifies the category with highest emissions
 */
export function getHighestEmissionCategory(summaries: CategorySummary[]): CategorySummary | null {
  if (!summaries || summaries.length === 0) return null;
  const sorted = [...summaries].sort((a, b) => b.totalKg - a.totalKg);
  return sorted[0].totalKg > 0 ? sorted[0] : null;
}

/**
 * Filters activities by reporting period based on activity_date
 */
export function filterActivitiesByPeriod(
  activities: ActivityRecord[],
  period: ReportingPeriod
): ActivityRecord[] {
  if (period === 'all') return activities;

  const now = new Date();
  const cutoff = new Date();

  switch (period) {
    case '7d':
      cutoff.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoff.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoff.setDate(now.getDate() - 90);
      break;
    case '1y':
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
  }

  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return activities.filter((act) => act.activity_date >= cutoffStr);
}

/**
 * Groups activities by date for timeline / Recharts area chart
 */
export function getTimelineData(activities: ActivityRecord[]): {
  date: string;
  displayDate: string;
  electricity: number;
  transportation: number;
  food: number;
  waste: number;
  total: number;
}[] {
  const map: Record<string, { electricity: number; transportation: number; food: number; waste: number }> = {};

  for (const act of activities) {
    const d = act.activity_date || '2026-10-01';
    if (!map[d]) {
      map[d] = { electricity: 0, transportation: 0, food: 0, waste: 0 };
    }
    map[d][act.category] = (map[d][act.category] || 0) + (act.estimated_emissions || 0);
  }

  const sortedDates = Object.keys(map).sort();

  return sortedDates.map((date) => {
    const item = map[date];
    const elec = Math.round(item.electricity * 10) / 10;
    const trans = Math.round(item.transportation * 10) / 10;
    const food = Math.round(item.food * 10) / 10;
    const waste = Math.round(item.waste * 10) / 10;
    const total = Math.round((elec + trans + food + waste) * 10) / 10;

    // Format display date: e.g. Oct 5
    const parts = date.split('-');
    const displayDate = parts.length === 3 ? `${parts[1]}/${parts[2]}` : date;

    return {
      date,
      displayDate,
      electricity: elec,
      transportation: trans,
      food,
      waste,
      total,
    };
  });
}
