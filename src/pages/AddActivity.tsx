import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Car,
  UtensilsCrossed,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ArrowLeft,
  Info,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { calculateActivityEmissions } from '../lib/calculations';
import { generateInstantActivitySuggestion } from '../lib/recommendations';

export const AddActivity: React.FC = () => {
  const navigate = useNavigate();
  const { addActivity, workspaceType, event, organization } = useApp();

  const [category, setCategory] = useState<ActivityCategory>('electricity');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedFactorId, setSelectedFactorId] = useState<string>('elec-grid-in');
  const [quantity, setQuantity] = useState<string>('250');
  const [passengers, setPassengers] = useState<string>('1');
  const [isVehicleTotal, setIsVehicleTotal] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [metadataDetails, setMetadataDetails] = useState<Record<string, string>>({
    energy_source: 'National Grid',
    institution_branch: 'East Innovation Wing',
    fuel_type: 'Petrol',
    meal_type: 'Buffet Catering',
    disposal_method: 'landfill',
    waste_type: 'Mixed packaging',
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  // Available emission factors for current category
  const availableFactors = useMemo(() => {
    return EMISSION_FACTORS.filter((f) => f.category === category);
  }, [category]);

  // Selected factor object
  const currentFactor = useMemo(() => {
    return availableFactors.find((f) => f.id === selectedFactorId) || availableFactors[0];
  }, [availableFactors, selectedFactorId]);

  // Update selected factor whenever category changes
  const handleCategoryChange = (cat: ActivityCategory) => {
    setCategory(cat);
    const firstFactor = EMISSION_FACTORS.find((f) => f.category === cat);
    if (firstFactor) {
      setSelectedFactorId(firstFactor.id);
    }
    // Set appropriate default quantity per category
    if (cat === 'electricity') setQuantity('250');
    if (cat === 'transportation') setQuantity('120');
    if (cat === 'food') setQuantity('50');
    if (cat === 'waste') setQuantity('40');
  };

  // Live real-time emission preview
  const liveCalculation = useMemo(() => {
    const numQty = parseFloat(quantity);
    const numPass = parseInt(passengers, 10) || 1;

    if (isNaN(numQty) || numQty < 0 || !currentFactor) {
      return { valid: false, emissions: 0, formula: '' };
    }

    try {
      const emissions = calculateActivityEmissions(numQty, currentFactor, {
        passengers: numPass,
        isVehicleTotal: isVehicleTotal,
      });

      let formula = `${numQty.toLocaleString()} ${currentFactor.unit} × ${currentFactor.value} kg CO2e/${currentFactor.unit}`;
      if (category === 'transportation' && numPass > 1 && isVehicleTotal) {
        formula += ` ÷ ${numPass} passengers`;
      }
      formula += ` = ${emissions.toLocaleString()} kg CO2e`;

      return { valid: true, emissions, formula };
    } catch {
      return { valid: false, emissions: 0, formula: '' };
    }
  }, [quantity, currentFactor, passengers, isVehicleTotal, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid activity quantity greater than 0.' });
      return;
    }

    if (!currentFactor) {
      setStatusMessage({ type: 'error', text: 'Please select a valid emission factor.' });
      return;
    }

    setSubmitting(true);
    try {
      await addActivity({
        category,
        activity_type: currentFactor.activity_type,
        quantity: numQty,
        unit: currentFactor.unit,
        emission_factor_id: currentFactor.id,
        factor_value_used: currentFactor.value,
        factor_source_name: currentFactor.source_name,
        estimated_emissions: liveCalculation.emissions,
        activity_date: activityDate,
        notes: notes.trim() || `${currentFactor.activity_type.replace(/_/g, ' ')} log`,
        organization_id: organization?.id,
        event_id: event?.id,
        metadata: {
          ...metadataDetails,
          passengers: parseInt(passengers, 10) || 1,
        },
      });

      setStatusMessage({
        type: 'success',
        text: `Activity successfully logged: ${liveCalculation.emissions} kg CO2e added to your footprint!`,
      });

      setTimeout(() => {
        navigate('/activities');
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save activity record.' });
    } finally {
      setSubmitting(false);
    }
  };

  const instantSuggestion = useMemo(() => {
    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0 || !currentFactor) return null;
    return generateInstantActivitySuggestion(category, currentFactor.activity_type, numQty, currentFactor.unit);
  }, [category, currentFactor, quantity]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back button */}
      <button
        onClick={() => navigate('/activities')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Activity Records</span>
      </button>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Activity Tracking
            </span>
            <span className="text-xs text-gray-400">• Real-Time Verified Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Record New Activity
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Log resource consumption for your {workspaceType} workspace. Emissions will be computed
            automatically using published factor registries.
          </p>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold mb-6 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Category Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              1. Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Electricity */}
              <button
                type="button"
                onClick={() => handleCategoryChange('electricity')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === 'electricity'
                    ? 'border-[#166534] bg-emerald-50/50 shadow-xs ring-2 ring-[#166534]/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-[#166534] flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900">Electricity</span>
                  <span className="text-[10px] text-gray-500">kWh & Grid power</span>
                </div>
              </button>

              {/* Transportation */}
              <button
                type="button"
                onClick={() => handleCategoryChange('transportation')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === 'transportation'
                    ? 'border-sky-600 bg-sky-50/50 shadow-xs ring-2 ring-sky-600/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900">Transport</span>
                  <span className="text-[10px] text-gray-500">Km & transit modes</span>
                </div>
              </button>

              {/* Food */}
              <button
                type="button"
                onClick={() => handleCategoryChange('food')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === 'food'
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs ring-2 ring-amber-600/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900">Food & Dining</span>
                  <span className="text-[10px] text-gray-500">Meal servings</span>
                </div>
              </button>

              {/* Waste */}
              <button
                type="button"
                onClick={() => handleCategoryChange('waste')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === 'waste'
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-600/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900">Waste</span>
                  <span className="text-[10px] text-gray-500">Kg & disposal method</span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Dynamic Category Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activity Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Activity Date *
              </label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            {/* Factor / Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {category === 'electricity'
                  ? 'Energy Source / Grid Region *'
                  : category === 'transportation'
                  ? 'Transport Mode *'
                  : category === 'food'
                  ? 'Meal Category / Diet Type *'
                  : 'Waste Stream / Treatment Method *'}
              </label>
              <select
                value={selectedFactorId}
                onChange={(e) => setSelectedFactorId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#10B981]"
              >
                {availableFactors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.activity_type.replace(/_/g, ' ').toUpperCase()} ({f.value} kg CO2e/{f.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantity in {currentFactor?.unit} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="e.g. 150"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#10B981] pr-12 font-medium"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-semibold pointer-events-none">
                  {currentFactor?.unit}
                </span>
              </div>
            </div>

            {/* Category-Specific Modifiers */}
            {category === 'transportation' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Passengers / Carpooling
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVehicleTotal}
                      onChange={(e) => setIsVehicleTotal(e.target.checked)}
                      className="rounded text-[#166534] focus:ring-[#10B981]"
                    />
                    <span>Divide total vehicle emission by passengers</span>
                  </label>
                </div>
              </div>
            )}

            {category === 'waste' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Disposal Destination
                </label>
                <select
                  value={metadataDetails.disposal_method}
                  onChange={(e) =>
                    setMetadataDetails({ ...metadataDetails, disposal_method: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="landfill">Municipal Landfill</option>
                  <option value="composting">Aerobic Composting Facility</option>
                  <option value="recycling">Authorized Recycling Center</option>
                </select>
              </div>
            )}

            {category === 'food' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Serving Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lunch Buffet / Gala Dinner"
                  value={metadataDetails.meal_type}
                  onChange={(e) =>
                    setMetadataDetails({ ...metadataDetails, meal_type: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            )}

            {/* Notes / Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Activity Label / Location Context
              </label>
              <input
                type="text"
                placeholder="e.g. Hackathon arena overnight computing, Keynote presentation stage..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          {/* Step 3: Live Carbon Preview Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#166534] flex items-center justify-center shrink-0 shadow-2xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Live Calculation Preview
                  </span>
                  {currentFactor?.is_verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
                      Verified Factor
                    </span>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#166534] mt-0.5">
                  {liveCalculation.emissions.toLocaleString()} kg CO2e
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-mono">
                  {liveCalculation.formula}
                </div>
              </div>
            </div>

            {/* Source Reference Details */}
            <div className="text-[11px] text-emerald-900 bg-white/70 p-3 rounded-xl border border-emerald-100 max-w-xs self-stretch sm:self-auto">
              <div className="flex items-center gap-1 font-semibold mb-0.5">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>Citation Source</span>
              </div>
              <p className="line-clamp-2 text-gray-600">{currentFactor?.source_name}</p>
              <div className="mt-1 text-emerald-700 font-medium">
                Region: {currentFactor?.region} ({currentFactor?.reporting_year})
              </div>
            </div>
          </div>

          {/* Step 3.5: Instant User-Input-Based Reduction Suggestion */}
          {instantSuggestion && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-green-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5 text-xs animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <span className="font-bold text-emerald-950 uppercase tracking-wider text-[10px]">
                    Smart Reduction Opportunity for this Entry
                  </span>
                  <span className="font-extrabold text-[#166534] bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                    Potential Savings: ~{instantSuggestion.potentialSavingsKg.toLocaleString()} kg CO2e
                  </span>
                </div>
                <p className="text-emerald-900 font-medium leading-relaxed">
                  {instantSuggestion.tip}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-800">
                    Recommended Action: {instantSuggestion.actionName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !liveCalculation.valid}
              className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Recording...' : 'Save Activity Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
