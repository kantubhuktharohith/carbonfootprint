import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ActivityRecord, EventWorkspace, Organization, Profile, SimulationScenario } from '../types';
import { SAMPLE_ACTIVITIES } from '../data/sampleData';

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
// LOCAL STORAGE PERSISTENCE LAYER (Used when Supabase is not configured)
// ============================================================================
const STORAGE_KEYS = {
  ACTIVITIES: 'ecotrack_activities_v2',
  PROFILE: 'ecotrack_profile_v2',
  ORGANIZATION: 'ecotrack_org_v2',
  EVENT: 'ecotrack_event_v2',
  SIMULATIONS: 'ecotrack_simulations_v2',
  WORKSPACE_TYPE: 'ecotrack_workspace_type_v2',
};

// Initialize default storage if empty
export function initLocalStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
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
  return raw ? JSON.parse(raw) : [];
}

export function loadSampleActivities(): ActivityRecord[] {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  const existing: ActivityRecord[] = raw ? JSON.parse(raw) : [];
  const existingIds = new Set(existing.map((activity) => activity.id));
  const additions = SAMPLE_ACTIVITIES.filter((activity) => !existingIds.has(activity.id));
  const updated = [...additions, ...existing];
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
  return updated;
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

export async function fetchProfile(): Promise<Profile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .maybeSingle();
        if (!error && data) return data as Profile;
      }
    } catch {
      // Fall through to local storage when authentication or the database is unavailable.
    }
  }

  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return raw ? JSON.parse(raw) : null;
}

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const current = await fetchProfile();
  if (!current) {
    throw new Error('No profile is available. Create an account before updating your profile.');
  }
  const updated: Profile = { ...current, ...profile };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', current.id)
      .select()
      .single();
    if (!error && data) return data as Profile;
    if (error) throw error;
  }

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  return updated;
}

export async function saveLocalProfile(profile: Profile): Promise<Profile> {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  return profile;
}

export async function fetchOrganization(): Promise<Organization | null> {
  const raw = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
  return raw ? JSON.parse(raw) : null;
}

export async function fetchEventWorkspace(): Promise<EventWorkspace | null> {
  const raw = localStorage.getItem(STORAGE_KEYS.EVENT);
  return raw ? JSON.parse(raw) : null;
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
