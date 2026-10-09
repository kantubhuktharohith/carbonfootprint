-- ====================================================================
-- ECOTRACK AI - POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'institution', 'event')),
  organization_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('university', 'school', 'company', 'ngo', 'other')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  participant_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

-- 4. EVENTS WORKSPACE TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  expected_participants INTEGER DEFAULT 100,
  actual_participants INTEGER DEFAULT 100,
  venue_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMISSION FACTORS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.emission_factors (
  id TEXT PRIMARY KEY,
  activity_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electricity', 'transportation', 'food', 'waste')),
  value NUMERIC(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  region TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT NOT NULL,
  reporting_year INTEGER NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  notes TEXT,
  version TEXT DEFAULT '1.0.0'
);

-- 6. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('electricity', 'transportation', 'food', 'waste')),
  activity_type TEXT NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL,
  emission_factor_id TEXT REFERENCES public.emission_factors(id),
  factor_value_used NUMERIC(10, 4) NOT NULL,
  factor_source_name TEXT,
  estimated_emissions NUMERIC(12, 3) NOT NULL CHECK (estimated_emissions >= 0),
  activity_date DATE NOT NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electricity', 'transportation', 'food', 'waste')),
  baseline_activity TEXT,
  suggested_change TEXT,
  estimated_savings NUMERIC(12, 3) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_cost TEXT CHECK (estimated_cost IN ('zero', 'low', 'medium', 'high')),
  timeframe TEXT CHECK (timeframe IN ('immediate', 'short-term', 'medium-term')),
  assumptions TEXT,
  next_steps TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SIMULATIONS TABLE
CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  baseline_emissions NUMERIC(12, 3) NOT NULL,
  projected_emissions NUMERIC(12, 3) NOT NULL,
  estimated_savings NUMERIC(12, 3) NOT NULL,
  percentage_reduction NUMERIC(5, 2) NOT NULL,
  actions_applied JSONB DEFAULT '[]'::jsonb,
  assumptions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON public.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_event ON public.activities(event_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(category);
CREATE INDEX IF NOT EXISTS idx_factors_category ON public.emission_factors(category);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. EMISSION FACTORS POLICIES (Public Read)
CREATE POLICY "Anyone authenticated can view emission factors"
  ON public.emission_factors FOR SELECT
  USING (true);

-- 3. ORGANIZATIONS POLICIES
CREATE POLICY "Members can view their organization"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 4. ACTIVITIES POLICIES
CREATE POLICY "Users can view authorized activities"
  ON public.activities FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = activities.organization_id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = activities.organization_id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update authorized activities"
  ON public.activities FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = activities.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "Users can delete authorized activities"
  ON public.activities FOR DELETE
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = activities.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
      )
    )
  );

-- 5. SIMULATIONS POLICIES
CREATE POLICY "Users can access their own simulations"
  ON public.simulations FOR ALL
  USING (user_id = auth.uid());
