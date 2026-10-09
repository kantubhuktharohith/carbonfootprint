export type WorkspaceType = 'individual' | 'institution' | 'event';

export type ActivityCategory = 'electricity' | 'transportation' | 'food' | 'waste';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  account_type: WorkspaceType;
  organization_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  organization_type: 'university' | 'school' | 'company' | 'ngo' | 'other';
  created_by: string;
  participant_count?: number;
  created_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface EventWorkspace {
  id: string;
  organization_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  expected_participants: number;
  actual_participants: number;
  venue_name?: string;
  created_at: string;
}

export interface EmissionFactor {
  id: string;
  activity_type: string;
  category: ActivityCategory;
  value: number; // in kg CO2e per unit
  unit: string;
  region: string;
  source_url: string;
  source_name: string;
  reporting_year: number;
  is_verified: boolean;
  notes: string;
  version: string;
}

export interface ActivityRecord {
  id: string;
  user_id?: string;
  organization_id?: string;
  event_id?: string;
  category: ActivityCategory;
  activity_type: string;
  quantity: number;
  unit: string;
  emission_factor_id: string;
  factor_value_used: number; // captured at calculation time
  factor_source_name?: string;
  estimated_emissions: number; // in kg CO2e
  activity_date: string; // YYYY-MM-DD
  notes?: string;
  metadata?: {
    passengers?: number;
    fuel_type?: string;
    energy_source?: string;
    meal_type?: string;
    waste_type?: string;
    disposal_method?: 'landfill' | 'recycling' | 'composting';
    institution_branch?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Recommendation {
  id: string;
  organization_id?: string;
  event_id?: string;
  title: string;
  explanation: string;
  category: ActivityCategory;
  baseline_activity: string;
  suggested_change: string;
  estimated_savings: number; // kg CO2e
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_cost: 'zero' | 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'medium-term';
  assumptions: string;
  next_steps: string[];
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  adoption_percentage?: number;
  user_customized?: boolean;
  created_at: string;
}

export interface UserRecommendationPreferences {
  category?: ActivityCategory | 'all';
  targetReductionPct?: number; // e.g. 10 to 60%
  budgetTier?: 'all' | 'zero' | 'low' | 'medium' | 'high';
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  timeframe?: 'all' | 'immediate' | 'short-term' | 'medium-term';
  customGoalText?: string;
}

export interface SimulationScenario {
  id: string;
  scenario_name: string;
  user_id?: string;
  organization_id?: string;
  event_id?: string;
  baseline_emissions: number;
  projected_emissions: number;
  estimated_savings: number;
  percentage_reduction: number;
  actions_applied: {
    title: string;
    category: ActivityCategory;
    reduction_percent: number;
    saved_kg: number;
  }[];
  assumptions: string;
  created_at: string;
}

export interface CategorySummary {
  category: ActivityCategory;
  label: string;
  totalKg: number;
  percentage: number;
  activityCount: number;
  color: string;
}

export interface ReductionTarget {
  targetPercentage: number;
  targetKg: number;
  baselineKg: number;
  deadline: string;
}

export type ReportingPeriod = '7d' | '30d' | '90d' | '1y' | 'all';
