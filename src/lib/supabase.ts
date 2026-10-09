import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ActivityRecord, EventWorkspace, Organization, Profile, SimulationScenario } from '../types';
import { DEMO_ACTIVITIES, DEMO_EVENT, DEMO_ORGANIZATION, DEMO_USER_PROFILE } from '../data/demoData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// LOCAL STORAGE PERSISTENCE LAYER (Used in Demo Mode or when offline)
// ============================================================================
const STORAGE_KEYS = {
  ACTIVITIES: 'ecotrack_activities_v1',
  PROFILE: 'ecotrack_profile_v1',
  ORGANIZATION: 'ecotrack_org_v1',
  EVENT: 'ecotrack_event_v1',
  SIMULATIONS: 'ecotrack_simulations_v1',
  WORKSPACE_TYPE: 'ecotrack_workspace_type_v1',
};

// Initialize default storage if empty
export function initLocalStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEMO_ACTIVITIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_USER_PROFILE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORGANIZATION)) {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(DEMO_ORGANIZATION));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENT)) {
    localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify(DEMO_EVENT));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SIMULATIONS)) {
    localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify([]));
  }
}

// ============================================================================
// DATA ACCESS SERVICE
// ============================================================================

export async function fetchActivities(): Promise<ActivityRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('activity_date', { ascending: false });
      if (!error && data) return data as ActivityRecord[];
    } catch {
      // Fall through to local storage
    }
  }

  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return raw ? JSON.parse(raw) : DEMO_ACTIVITIES;
}

export async function saveActivity(activity: ActivityRecord): Promise<ActivityRecord> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
        .single();
      if (!error && data) return data as ActivityRecord;
    } catch {
      // Fall through to local storage
    }
  }

  initLocalStorage();
  const activities = await fetchActivities();
  const existingIdx = activities.findIndex((a) => a.id === activity.id);
  let updated: ActivityRecord[];

  if (existingIdx >= 0) {
    updated = [...activities];
    updated[existingIdx] = { ...activity, updated_at: new Date().toISOString() };
  } else {
    updated = [activity, ...activities];
  }

  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
  return activity;
}

export async function removeActivity(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (!error) return true;
    } catch {
      // Fall through
    }
  }

  initLocalStorage();
  const activities = await fetchActivities();
  const filtered = activities.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filtered));
  return true;
}

export async function fetchProfile(): Promise<Profile> {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return raw ? JSON.parse(raw) : DEMO_USER_PROFILE;
}

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const current = await fetchProfile();
  const updated: Profile = { ...current, ...profile };
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  return updated;
}

export async function fetchOrganization(): Promise<Organization> {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
  return raw ? JSON.parse(raw) : DEMO_ORGANIZATION;
}

export async function fetchEventWorkspace(): Promise<EventWorkspace> {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.EVENT);
  return raw ? JSON.parse(raw) : DEMO_EVENT;
}

export async function fetchSimulations(): Promise<SimulationScenario[]> {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SIMULATIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSimulationScenario(scenario: SimulationScenario): Promise<void> {
  initLocalStorage();
  const existing = await fetchSimulations();
  const updated = [scenario, ...existing];
  localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(updated));
}

export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEMO_ACTIVITIES));
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_USER_PROFILE));
  localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(DEMO_ORGANIZATION));
  localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify(DEMO_EVENT));
  localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify([]));
}
