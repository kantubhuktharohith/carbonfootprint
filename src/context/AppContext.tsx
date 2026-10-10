import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ActivityRecord,
  CategorySummary,
  EventWorkspace,
  Organization,
  Profile,
  Recommendation,
  ReportingPeriod,
  WorkspaceType,
} from '../types';
import {
  fetchActivities,
  saveActivity,
  removeActivity,
  fetchProfile,
  fetchOrganization,
  fetchEventWorkspace,
  updateProfile,
  loadSampleActivities,
} from '../lib/supabase';
import {
  calculateCategoryTotals,
  calculatePerPersonEmissions,
  calculatePotentialSavings,
  calculateTotalEmissions,
  compareReportingPeriods,
  filterActivitiesByPeriod,
  getHighestEmissionCategory,
} from '../lib/calculations';
import { generateRecommendations } from '../lib/recommendations';

interface AppContextType {
  activities: ActivityRecord[];
  allActivities: ActivityRecord[];
  loading: boolean;
  workspaceType: WorkspaceType;
  setWorkspaceType: (type: WorkspaceType) => void;
  reportingPeriod: ReportingPeriod;
  setReportingPeriod: (period: ReportingPeriod) => void;
  profile: Profile | null;
  updateProfile: (profile: Partial<Profile>) => Promise<Profile>;
  organization: Organization | null;
  event: EventWorkspace | null;
  setParticipantCount: (count: number) => void;
  // CRUD
  addActivity: (act: Omit<ActivityRecord, 'id' | 'created_at'>) => Promise<ActivityRecord>;
  editActivity: (act: ActivityRecord) => Promise<ActivityRecord>;
  deleteActivity: (id: string) => Promise<boolean>;
  loadSampleData: () => void;
  // Computed values
  totalEmissionsKg: number;
  categorySummaries: CategorySummary[];
  perPersonEmissionsKg: number;
  highestCategory: CategorySummary | null;
  periodComparison: ReturnType<typeof compareReportingPeriods>;
  potentialSavings: ReturnType<typeof calculatePotentialSavings>;
  recommendations: Recommendation[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allActivities, setAllActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('event');
  const [reportingPeriod, setReportingPeriod] = useState<ReportingPeriod>('all');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [event, setEvent] = useState<EventWorkspace | null>(null);

  // Load initial dataset
  const loadData = async () => {
    setLoading(true);
    try {
      const [acts, prof, org, ev] = await Promise.all([
        fetchActivities(),
        fetchProfile(),
        fetchOrganization(),
        fetchEventWorkspace(),
      ]);
      setAllActivities(acts);
      setProfile(prof);
      setOrganization(org);
      setEvent(ev);
      if (prof?.account_type) {
        setWorkspaceType(prof.account_type);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter activities by reporting period
  const activities = useMemo(() => {
    return filterActivitiesByPeriod(allActivities, reportingPeriod);
  }, [allActivities, reportingPeriod]);

  // Calculations derived directly from actual activity records
  const totalEmissionsKg = useMemo(() => calculateTotalEmissions(activities), [activities]);
  const categorySummaries = useMemo(() => calculateCategoryTotals(activities), [activities]);
  const highestCategory = useMemo(() => getHighestEmissionCategory(categorySummaries), [categorySummaries]);

  const participantCount = useMemo(() => {
    if (workspaceType === 'event') return event?.actual_participants || 1;
    if (workspaceType === 'institution') return organization?.participant_count || 1;
    return 1; // individual
  }, [workspaceType, event, organization]);

  const perPersonEmissionsKg = useMemo(
    () => calculatePerPersonEmissions(totalEmissionsKg, participantCount),
    [totalEmissionsKg, participantCount]
  );

  const periodComparison = useMemo(
    () => compareReportingPeriods(activities, []),
    [activities]
  );

  const potentialSavings = useMemo(
    () => calculatePotentialSavings(activities, 25),
    [activities]
  );

  const recommendations = useMemo(
    () => generateRecommendations(activities),
    [activities]
  );

  const handleAddActivity = async (
    actData: Omit<ActivityRecord, 'id' | 'created_at'>
  ): Promise<ActivityRecord> => {
    const newRecord: ActivityRecord = {
      ...actData,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      created_at: new Date().toISOString(),
    };
    const saved = await saveActivity(newRecord);
    setAllActivities((prev) => [saved, ...prev]);
    return saved;
  };

  const handleEditActivity = async (act: ActivityRecord): Promise<ActivityRecord> => {
    const saved = await saveActivity(act);
    setAllActivities((prev) => prev.map((item) => (item.id === act.id ? saved : item)));
    return saved;
  };

  const handleDeleteActivity = async (id: string): Promise<boolean> => {
    const success = await removeActivity(id);
    if (success) {
      setAllActivities((prev) => prev.filter((item) => item.id !== id));
    }
    return success;
  };

  const handleLoadSampleData = () => {
    const updated = loadSampleActivities();
    setAllActivities(updated);
  };

  const handleSetParticipantCount = (count: number) => {
    if (workspaceType === 'event' && event) {
      setEvent({ ...event, actual_participants: count });
    } else if (workspaceType === 'institution' && organization) {
      setOrganization({ ...organization, participant_count: count });
    }
  };

  const handleUpdateProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
    const updated = await updateProfile(profileData);
    setProfile(updated);
    return updated;
  };

  return (
    <AppContext.Provider
      value={{
        activities,
        allActivities,
        loading,
        workspaceType,
        setWorkspaceType,
        reportingPeriod,
        setReportingPeriod,
        profile,
        updateProfile: handleUpdateProfile,
        organization,
        event,
        setParticipantCount: handleSetParticipantCount,
        addActivity: handleAddActivity,
        editActivity: handleEditActivity,
        deleteActivity: handleDeleteActivity,
        loadSampleData: handleLoadSampleData,
        totalEmissionsKg,
        categorySummaries,
        perPersonEmissionsKg,
        highestCategory,
        periodComparison,
        potentialSavings,
        recommendations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
