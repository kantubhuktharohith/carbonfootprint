import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  TreePine,
  Car,
  Home,
  Save,
  RotateCcw,
  CheckCircle2,
  BookmarkCheck,
  ShieldCheck,
  Zap,
  UtensilsCrossed,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  calculateSimulation,
  createScenarioObject,
  getAvailableSimulationLevers,
} from '../lib/simulator';
import { fetchSimulations, saveSimulationScenario } from '../lib/supabase';
import { SimulationScenario } from '../types';

export const Simulator: React.FC = () => {
  const { activities } = useApp();

  const levers = useMemo(() => getAvailableSimulationLevers(activities), [activities]);

  // Reductions state: leverId -> percentage (0 to 100)
  const [reductions, setReductions] = useState<Record<string, number>>({
    'lever-elec-solar': 40,
    'lever-trans-public': 35,
    'lever-food-plant': 50,
    'lever-waste-circular': 60,
  });

  const [scenarioName, setScenarioName] = useState<string>('Campus Net-Zero Sprint');
  const [savedScenarios, setSavedScenarios] = useState<SimulationScenario[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved scenarios
  useEffect(() => {
    fetchSimulations().then((data) => setSavedScenarios(data));
  }, []);

  // Real-time calculated simulation results
  const result = useMemo(() => {
    return calculateSimulation(activities, reductions);
  }, [activities, reductions]);

  const handleSliderChange = (leverId: string, val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setReductions((prev) => ({ ...prev, [leverId]: clamped }));
  };

  const handleResetSliders = () => {
    setReductions({
      'lever-elec-solar': 0,
      'lever-trans-public': 0,
      'lever-food-plant': 0,
      'lever-waste-circular': 0,
    });
  };

  const handleSaveScenario = async () => {
    const scenario = createScenarioObject(scenarioName, result, levers, reductions);
    await saveSimulationScenario(scenario);
    setSavedScenarios((prev) => [scenario, ...prev]);
    setToastMessage(`Scenario "${scenario.scenario_name}" saved successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoadScenario = (sc: SimulationScenario) => {
    setScenarioName(sc.scenario_name);
    const newReductions: Record<string, number> = {
      'lever-elec-solar': 0,
      'lever-trans-public': 0,
      'lever-food-plant': 0,
      'lever-waste-circular': 0,
    };

    sc.actions_applied.forEach((action) => {
      const match = levers.find((l) => l.category === action.category);
      if (match) {
        newReductions[match.id] = action.reduction_percent;
      }
    });

    setReductions(newReductions);
    setToastMessage(`Loaded scenario "${sc.scenario_name}".`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Recharts data format: Baseline vs Projected per category
  const comparisonChartData = result.categoryComparison.map((item) => ({
    name: item.label.replace(' & Energy', '').replace(' Management', '').replace(' & Dining', ''),
    Baseline: item.baselineKg,
    Projected: item.projectedKg,
    Saved: item.savedKg,
  }));

  const categoryIcons: Record<string, React.ReactNode> = {
    electricity: <Zap className="w-4 h-4 text-emerald-700" />,
    transportation: <Car className="w-4 h-4 text-sky-700" />,
    food: <UtensilsCrossed className="w-4 h-4 text-amber-700" />,
    waste: <Trash2 className="w-4 h-4 text-purple-700" />,
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#166534] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Interactive Modeling
            </span>
            <span className="text-xs text-gray-400">• Projected Footprint</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Carbon Reduction Simulator
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Adjust operational levers in real-time to preview projected footprint reductions against your measured baseline.
          </p>
        </div>

        <button
          onClick={handleResetSliders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Reset All Levers</span>
        </button>
      </div>

      {/* Real-Time Impact Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Baseline Footprint */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Baseline Footprint
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {result.baselineTotalKg.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">kg CO2e</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Actual measured activity records</p>
        </div>

        {/* Projected Footprint */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs bg-linear-to-br from-white via-white to-emerald-50/30">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Projected Footprint
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#166534] tracking-tight">
              {result.projectedTotalKg.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-700 font-bold">kg CO2e</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            Projected = Baseline - Estimated Savings
          </p>
        </div>

        {/* Projected Savings */}
        <div className="bg-linear-to-br from-[#166534] to-[#10B981] text-white rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider block mb-1">
            Projected Savings
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              -{result.totalSavingsKg.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-100 font-bold">kg CO2e</span>
          </div>
          <p className="text-xs text-emerald-100 mt-1 font-bold">
            🔥 {result.percentageReduction}% Total Reduction
          </p>
        </div>

        {/* Net-Zero Pathway Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Target Alignment
          </span>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {result.percentageReduction >= 30
                ? '🌟 Transformative Pathway'
                : result.percentageReduction >= 15
                ? '✅ Strong Reduction'
                : '🟡 Modest Step'}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Exceeds 20% campus sprint reduction requirement
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Levers Sliders & Side-by-Side Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Levers Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#166534]" />
              Adjust Reduction Levers
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Drag the sliders to model specific operational transformations
            </p>
          </div>

          <div className="space-y-6">
            {levers.map((lever) => {
              const currentVal = reductions[lever.id] || 0;
              const savedKg = Math.round(((lever.potentialMaxSavingsKg * currentVal) / 100) * 10) / 10;

              return (
                <div
                  key={lever.id}
                  className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center">
                        {categoryIcons[lever.category]}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900">{lever.name}</h3>
                        <span className="text-[10px] text-gray-500">{lever.category.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#166534]">
                        -{savedKg.toLocaleString()} kg
                      </span>
                      <span className="block text-[10px] text-gray-500 font-medium">
                        {currentVal}% implemented
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed">{lever.description}</p>

                  {/* Range Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentVal}
                      onChange={(e) => handleSliderChange(lever.id, parseInt(e.target.value, 10))}
                      className="w-full accent-[#166534] cursor-pointer h-2 bg-gray-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                      <span>0% (No change)</span>
                      <span>50%</span>
                      <span>100% (Full transition)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Scenario Control */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Name this scenario..."
              className="w-full sm:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
            />
            <button
              onClick={handleSaveScenario}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>

        {/* Right Column: Comparison Bar Chart & Tangible Equivalencies (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Side-by-Side Category Chart */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-1">Baseline vs Projected</h2>
            <p className="text-xs text-gray-500 mb-4">
              Category-level impact of active simulation adjustments
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: '1px solid #E5E7EB',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Baseline" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Projected" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Environmental Equivalencies Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Tangible Real-World Equivalents
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3.5 bg-white/80 p-3 rounded-2xl border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center shrink-0">
                  <TreePine className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-emerald-950">
                    {result.equivalencies.treesPlantedYearEquivalent.toLocaleString()} Trees Planted
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Annual carbon sink equivalent of mature urban trees
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white/80 p-3 rounded-2xl border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-gray-900">
                    {result.equivalencies.carKmAvoided.toLocaleString()} Car Km Avoided
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Petrol passenger vehicle kilometers taken off roads
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-white/80 p-3 rounded-2xl border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-gray-900">
                    {result.equivalencies.homesPoweredDays.toLocaleString()} Days Household Power
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Electricity equivalent for an average residential home
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Scenarios Strip */}
      {savedScenarios.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-[#166534]" />
            Saved Simulation Scenarios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {savedScenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-gray-50/50 hover:bg-emerald-50/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-gray-900 truncate">{sc.scenario_name}</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      -{sc.percentage_reduction}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Saved: {sc.estimated_savings.toLocaleString()} kg CO2e
                  </p>
                </div>

                <button
                  onClick={() => handleLoadScenario(sc)}
                  className="mt-3 text-xs font-bold text-[#166534] hover:underline text-left"
                >
                  Apply Scenario →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions Footer */}
      <div className="rounded-2xl p-4 bg-gray-100/60 border border-gray-200/60 text-[11px] text-gray-500 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-700">Simulator Calculation Model: </span>
          Projected emissions are calculated strictly using the invariant: Projected = Baseline - Estimated Savings.
          Outputs are constrained to prevent non-negative emissions. Simulation scenarios are persisted separately from measured operational records.
        </div>
      </div>
    </div>
  );
};
