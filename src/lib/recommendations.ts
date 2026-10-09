import { ActivityRecord, ActivityCategory, Recommendation, UserRecommendationPreferences } from '../types';
import { calculateCategoryTotals, calculateTotalEmissions } from './calculations';

/**
 * Generates tailored, context-aware recommendations based on actual recorded activities.
 * Ranked in descending order of estimated CO2e savings.
 */
export function generateRecommendations(
  activities: ActivityRecord[],
  preferences?: UserRecommendationPreferences
): Recommendation[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  const categorySummaries = calculateCategoryTotals(activities);
  let recommendations: Recommendation[] = [];

  // Group activities for analysis
  const electricityActs = activities.filter((a) => a.category === 'electricity');
  const transportActs = activities.filter((a) => a.category === 'transportation');
  const foodActs = activities.filter((a) => a.category === 'food');
  const wasteActs = activities.filter((a) => a.category === 'waste');

  const elecTotal = electricityActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);
  const transTotal = transportActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);
  const foodTotal = foodActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);
  const wasteTotal = wasteActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);

  // User input target reduction scaling (default 40% if not specified)
  const reductionFactor = preferences?.targetReductionPct ? preferences.targetReductionPct / 100 : 0.40;

  // ----------------------------------------------------
  // 1. ELECTRICITY RECOMMENDATIONS
  // ----------------------------------------------------
  const gridActs = electricityActs.filter((a) => a.activity_type.includes('grid'));
  const totalGridKWh = gridActs.reduce((sum, a) => sum + a.quantity, 0);

  if (totalGridKWh > 100) {
    // Rooftop solar / green power transition
    const solarShiftPct = Math.min(0.9, Math.max(0.1, reductionFactor));
    const potentialKWhShift = Math.round(totalGridKWh * solarShiftPct);
    const estimatedSavings = Math.round(potentialKWhShift * (0.716 - 0.041) * 10) / 10;

    recommendations.push({
      id: 'rec-elec-solar-shift',
      title: 'Deploy On-Site Solar PV / Procure Green Tariff',
      explanation:
        'Grid electricity is currently one of your top drivers of emissions. Transitioning peak daytime lighting and lab computing load to on-site rooftop solar or a certified renewable energy tariff drastically reduces Scope 2 footprint.',
      category: 'electricity',
      baseline_activity: `${totalGridKWh.toLocaleString()} kWh drawn from high-carbon grid (${Math.round(elecTotal)} kg CO2e)`,
      suggested_change: `Substitute ${Math.round(solarShiftPct * 100)}% (${potentialKWhShift.toLocaleString()} kWh) with solar power generation or green open access procurement.`,
      estimated_savings: estimatedSavings,
      difficulty: 'medium',
      estimated_cost: 'medium',
      timeframe: 'medium-term',
      adoption_percentage: Math.round(solarShiftPct * 100),
      assumptions:
        'Based on replacing grid baseline (CEA 0.716 kg CO2e/kWh) with life-cycle solar PV (0.041 kg CO2e/kWh). Estimated net saving of 0.675 kg CO2e per displaced kWh.',
      next_steps: [
        'Audit campus rooftop irradiance and available shadow-free area.',
        'Inquire with local distribution utility regarding Solar Net Metering or Green Energy Open Access (GEOA) tariffs.',
        'Install smart energy sub-meters on high-draw venue HVAC and server clusters.',
      ],
      status: 'new',
      created_at: new Date().toISOString(),
    });

    // HVAC & Smart Controls recommendation
    const hvacPct = Math.min(0.3, Math.max(0.1, reductionFactor * 0.4));
    const hvacSavings = Math.round(totalGridKWh * hvacPct * 0.716 * 10) / 10;
    recommendations.push({
      id: 'rec-elec-smart-controls',
      title: 'Optimize HVAC Setpoints & Implement Smart Power Strips',
      explanation:
        'Space cooling and idle electronics account for substantial energy leakage. Adjusting cooling setpoints to 24°C–25°C and deploying smart timer strips eliminates ghost loads without disrupting occupant comfort.',
      category: 'electricity',
      baseline_activity: `${totalGridKWh.toLocaleString()} kWh baseline consumption across event venues and labs`,
      suggested_change:
        `Adjust AC thermostat setpoints from 20°C to 24°C and enforce automated overnight sleep-mode policies (targeting ${Math.round(hvacPct * 100)}% curtailment).`,
      estimated_savings: hvacSavings,
      difficulty: 'easy',
      estimated_cost: 'low',
      timeframe: 'immediate',
      adoption_percentage: Math.round(hvacPct * 100),
      assumptions:
        'Bureau of Energy Efficiency (BEE) benchmark: each 1°C increase in AC setpoint yields ~6% energy savings. Projected curtailment on Indian grid emission factor.',
      next_steps: [
        'Calibrate auditorium and lab thermostats to 24°C minimum standard.',
        'Configure automated sleep timers on hackathon workstation displays.',
        'Appoint student eco-stewards to check night shutdown status.',
      ],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  // ----------------------------------------------------
  // 2. TRANSPORTATION RECOMMENDATIONS
  // ----------------------------------------------------
  const flightActs = transportActs.filter((a) => a.activity_type.includes('flight'));
  const soloCarActs = transportActs.filter(
    (a) => a.activity_type.includes('car') && (!a.metadata?.passengers || a.metadata.passengers <= 1)
  );

  const flightKm = flightActs.reduce((sum, a) => sum + a.quantity, 0);
  const soloCarKm = soloCarActs.reduce((sum, a) => sum + a.quantity, 0);

  if (flightKm > 200) {
    const flightShiftPct = Math.min(0.85, Math.max(0.2, reductionFactor));
    const shiftedKm = Math.round(flightKm * flightShiftPct);
    const flightSavings = Math.round(shiftedKm * (0.245 - 0.035) * 10) / 10;

    recommendations.push({
      id: 'rec-trans-train-shift',
      title: 'Replace Regional Flights with Express Rail or Hybrid Attendance',
      explanation:
        'Aviation produces intense radiative forcing per passenger-km. Replacing short-haul speaker or delegate flights (< 600 km) with electrified rail transit or hybrid telepresence cuts transport intensity by up to 85%.',
      category: 'transportation',
      baseline_activity: `${flightKm.toLocaleString()} passenger-km logged via domestic flights (${Math.round(flightActs.reduce((s, a) => s + a.estimated_emissions, 0))} kg CO2e)`,
      suggested_change: `Substitute ${Math.round(flightShiftPct * 100)}% of regional journeys (${shiftedKm.toLocaleString()} km) with express passenger rail or interactive video feeds.`,
      estimated_savings: flightSavings,
      difficulty: 'easy',
      estimated_cost: 'zero',
      timeframe: 'immediate',
      adoption_percentage: Math.round(flightShiftPct * 100),
      assumptions:
        'Aviation emission factor: 0.245 kg CO2e/pkm (ICAO/DEFRA RF). Electric passenger rail: 0.035 kg CO2e/pkm. Net savings: 0.210 kg CO2e per passenger-km.',
      next_steps: [
        'Offer dedicated travel stipends prioritized for high-speed train reservations.',
        'Equip breakout rooms with high-definition hybrid streaming rigs for remote jury panels.',
      ],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  if (soloCarKm > 200) {
    const carpoolShiftPct = Math.min(0.85, Math.max(0.25, reductionFactor));
    const shiftedCarKm = Math.round(soloCarKm * carpoolShiftPct);
    const carpoolSavings = Math.round(shiftedCarKm * (0.170 - 0.056) * 10) / 10;

    recommendations.push({
      id: 'rec-trans-carpool-shuttle',
      title: 'Incentivize Ride-Sharing & Metro Hub Shuttles',
      explanation:
        'Solo passenger vehicle travel is a prime contributor to urban traffic congestion and Scope 3 attendee travel emissions. Coordinating student carpools and scheduled shuttles from the nearest metro station yields quick wins.',
      category: 'transportation',
      baseline_activity: `${soloCarKm.toLocaleString()} km recorded from single-occupancy private cars`,
      suggested_change:
        `Shift ${Math.round(carpoolShiftPct * 100)}% (${shiftedCarKm.toLocaleString()} km) of private car travel to 3+ person carpools or free university metro-link shuttle vans.`,
      estimated_savings: carpoolSavings,
      difficulty: 'easy',
      estimated_cost: 'low',
      timeframe: 'immediate',
      adoption_percentage: Math.round(carpoolShiftPct * 100),
      assumptions:
        'Private petrol car (0.170 kg CO2e/km) vs. 3-passenger carpool (0.057 kg CO2e/km). Net saving: ~0.114 kg CO2e per passenger-km.',
      next_steps: [
        'Set up a WhatsApp/Discord carpool channel on the event registration portal.',
        'Provide preferential parking passes for vehicles with 3 or more attendees.',
        'Schedule fixed 15-minute shuttle runs connecting the closest metro terminal.',
      ],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  // ----------------------------------------------------
  // 3. FOOD RECOMMENDATIONS
  // ----------------------------------------------------
  const redMeatActs = foodActs.filter((a) => a.activity_type.includes('red_meat'));
  const mixedActs = foodActs.filter((a) => a.activity_type.includes('mixed'));
  const redMeatMeals = redMeatActs.reduce((sum, a) => sum + a.quantity, 0);
  const mixedMeals = mixedActs.reduce((sum, a) => sum + a.quantity, 0);

  if (redMeatMeals > 20 || mixedMeals > 40) {
    const foodShiftPct = Math.min(0.9, Math.max(0.3, reductionFactor));
    const targetRedMeatShift = Math.round(redMeatMeals * foodShiftPct);
    const targetMixedShift = Math.round(mixedMeals * (foodShiftPct * 0.6));

    const foodSavings =
      Math.round((targetRedMeatShift * (6.5 - 0.65) + targetMixedShift * (2.2 - 1.1)) * 10) / 10;

    recommendations.push({
      id: 'rec-food-plant-catering',
      title: 'Introduce Plant-Rich Catering & "Default-Veg" Dining',
      explanation:
        'Red meat and industrial animal agriculture carry the highest emissions per calorie of any food group. Adopting a default plant-forward catering menu with delicious vegan & vegetarian selections achieves tremendous carbon reductions with zero capital cost.',
      category: 'food',
      baseline_activity: `${redMeatMeals} red-meat meals (6.5 kg/meal) and ${mixedMeals} mixed omnivore meals recorded (${Math.round(foodTotal)} kg CO2e)`,
      suggested_change: `Substitute ${Math.round(foodShiftPct * 100)}% of red meat dishes with gourmet plant-based cuisine, and seasonal vegetarian items.`,
      estimated_savings: foodSavings,
      difficulty: 'easy',
      estimated_cost: 'zero',
      timeframe: 'immediate',
      adoption_percentage: Math.round(foodShiftPct * 100),
      assumptions:
        'Oxford/Poore & Nemecek data: switching from beef (6.5 kg CO2e/meal) to plant-based (0.65 kg CO2e/meal) avoids ~5.85 kg CO2e per serving. Switching mixed poultry/dairy (2.2 kg) to vegetarian (1.1 kg) saves 1.1 kg CO2e per meal.',
      next_steps: [
        'Engage catering vendor to feature vibrant lentils, legumes, tofu, and seasonal roasted vegetables.',
        'Make plant-based the default conference registration option, with meat by opt-in request.',
        'Place attractive carbon footprint labels at the food buffet stations.',
      ],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  // ----------------------------------------------------
  // 4. WASTE RECOMMENDATIONS
  // ----------------------------------------------------
  const landfillActs = wasteActs.filter((a) => a.metadata?.disposal_method === 'landfill' || a.activity_type.includes('landfill'));
  const landfillKg = landfillActs.reduce((sum, a) => sum + a.quantity, 0);

  if (landfillKg > 30) {
    const divertPct = Math.min(0.9, Math.max(0.35, reductionFactor));
    const divertKg = Math.round(landfillKg * divertPct);
    const wasteSavings = Math.round(divertKg * (0.58 - 0.05) * 10) / 10;

    recommendations.push({
      id: 'rec-waste-zero-divert',
      title: 'Divert Organic Scraps to Composting & Ban Single-Use Plastic',
      explanation:
        'Landfill organic waste decomposes anaerobically, creating potent fugitive methane emissions. Establishing 3-stream waste stations (Compostable, Recyclable, Dry Landfill) and composting food scraps keeps valuable organic matter in circular cycles.',
      category: 'waste',
      baseline_activity: `${landfillKg.toLocaleString()} kg sent to municipal landfill (${Math.round(wasteTotal)} kg CO2e)`,
      suggested_change: `Divert ${Math.round(divertPct * 100)}% (${divertKg} kg) of waste to managed aerobic composting and closed-loop recyclers.`,
      estimated_savings: wasteSavings,
      difficulty: 'easy',
      estimated_cost: 'low',
      timeframe: 'immediate',
      adoption_percentage: Math.round(divertPct * 100),
      assumptions:
        'Landfill waste factor (0.58 kg CO2e/kg) vs. managed composting (0.05 kg CO2e/kg). Net avoidance of ~0.53 kg CO2e per kg diverted.',
      next_steps: [
        'Replace all single-use plastic water bottles with refillable water filtration coolers.',
        'Deploy color-coded 3-bin collection stations across venue dining and presentation halls.',
        'Partner with campus agriculture/horticulture department for aerobic food scrap composting.',
      ],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  // ----------------------------------------------------
  // 5. USER-INPUT CUSTOM GOAL INTERVENTION GENERATION
  // ----------------------------------------------------
  if (preferences?.customGoalText && preferences.customGoalText.trim().length > 3) {
    const query = preferences.customGoalText.toLowerCase();
    const totalFootprint = calculateTotalEmissions(activities);

    // Dynamic tailored response based on user prompt query
    if (query.includes('carpool') || query.includes('shuttle') || query.includes('ride') || query.includes('transit')) {
      recommendations.unshift({
        id: 'rec-custom-transit-' + Date.now(),
        title: `Custom Goal: Community Commute & Carpool Incentive`,
        explanation: `Custom strategy designed for your goal: "${preferences.customGoalText}". Establishing dedicated carpooling clusters and campus shuttles targets solo commute miles directly.`,
        category: 'transportation',
        baseline_activity: `Current transport footprint: ${Math.round(transTotal)} kg CO2e across recorded journeys`,
        suggested_change: `Launch a student/staff ride-share registry and reserved priority EV/carpool parking bays.`,
        estimated_savings: Math.round(transTotal * 0.45 * 10) / 10,
        difficulty: 'easy',
        estimated_cost: 'zero',
        timeframe: 'immediate',
        adoption_percentage: 50,
        user_customized: true,
        assumptions: 'Models 45% conversion of solo trips into high-occupancy 3+ carpools.',
        next_steps: [
          'Create a dedicated digital carpool board for daily commuters.',
          'Issue transit passes or carpool incentives for registered groups.',
        ],
        status: 'new',
        created_at: new Date().toISOString(),
      });
    } else if (query.includes('solar') || query.includes('energy') || query.includes('power') || query.includes('light') || query.includes('ac') || query.includes('hvac')) {
      recommendations.unshift({
        id: 'rec-custom-energy-' + Date.now(),
        title: `Custom Goal: Energy Curtailment & Clean Power Transition`,
        explanation: `Custom strategy designed for your goal: "${preferences.customGoalText}". Focusing on operational energy conservation and clean rooftop capacity.`,
        category: 'electricity',
        baseline_activity: `Current energy footprint: ${Math.round(elecTotal)} kg CO2e (${totalGridKWh} kWh logged)`,
        suggested_change: `Implement strict automated night shutdown protocols and target 35% load procurement from certified renewable tariffs.`,
        estimated_savings: Math.round(elecTotal * 0.40 * 10) / 10,
        difficulty: 'medium',
        estimated_cost: 'low',
        timeframe: 'short-term',
        adoption_percentage: 40,
        user_customized: true,
        assumptions: 'Assumes 35% load shift to solar plus 10% reduction in ghost electricity load.',
        next_steps: [
          'Conduct evening energy walkthrough to identify lights and electronics left on.',
          'Program smart plugs for lab computers and audio-visual setups.',
        ],
        status: 'new',
        created_at: new Date().toISOString(),
      });
    } else if (query.includes('food') || query.includes('catering') || query.includes('meat') || query.includes('vegan') || query.includes('buffet')) {
      recommendations.unshift({
        id: 'rec-custom-food-' + Date.now(),
        title: `Custom Goal: Sustainable Dining & Food Waste Elimination`,
        explanation: `Custom strategy designed for your goal: "${preferences.customGoalText}". High-protein plant substitution and accurate catering headcount RSVP management.`,
        category: 'food',
        baseline_activity: `Current food footprint: ${Math.round(foodTotal)} kg CO2e`,
        suggested_change: `Adopt 100% vegetarian lunch catering and donate unserved packaged items to local food recovery initiatives.`,
        estimated_savings: Math.round(foodTotal * 0.55 * 10) / 10,
        difficulty: 'easy',
        estimated_cost: 'zero',
        timeframe: 'immediate',
        adoption_percentage: 60,
        user_customized: true,
        assumptions: 'Avoids red meat and industrial poultry, replacing with local legumes, seasonal vegetables, and dairy alternatives.',
        next_steps: [
          'Switch catering contract to a plant-forward certified vendor.',
          'Implement mandatory meal RSVP deadline to eliminate 25% surplus preparation.',
        ],
        status: 'new',
        created_at: new Date().toISOString(),
      });
    } else if (query.includes('plastic') || query.includes('waste') || query.includes('recycle') || query.includes('compost')) {
      recommendations.unshift({
        id: 'rec-custom-waste-' + Date.now(),
        title: `Custom Goal: Zero-Waste Campus & Circular Materials`,
        explanation: `Custom strategy designed for your goal: "${preferences.customGoalText}". Eliminating single-use items and diverting all organic scraps from landfill.`,
        category: 'waste',
        baseline_activity: `Current waste footprint: ${Math.round(wasteTotal)} kg CO2e (${landfillKg} kg landfill)`,
        suggested_change: `Eliminate single-use plastic bottles with hydration refill kiosks and mandate aerobic composting for all event food trimmings.`,
        estimated_savings: Math.round(wasteTotal * 0.70 * 10) / 10,
        difficulty: 'easy',
        estimated_cost: 'low',
        timeframe: 'immediate',
        adoption_percentage: 70,
        user_customized: true,
        assumptions: 'Diverts 70% of waste stream from municipal landfill to composting and material recycling.',
        next_steps: [
          'Install water refill stations at key hallway intersections.',
          'Replace disposable plates and cutlery with washable reusable dining ware.',
        ],
        status: 'new',
        created_at: new Date().toISOString(),
      });
    } else {
      // General custom goal
      recommendations.unshift({
        id: 'rec-custom-general-' + Date.now(),
        title: `Custom Goal: Target Reduction Strategy`,
        explanation: `Custom roadmap tailored to your objective: "${preferences.customGoalText}". Prioritizing maximum impact actions across your highest emission activities.`,
        category: electricityActs.length > 0 ? 'electricity' : 'transportation',
        baseline_activity: `Total measured footprint: ${Math.round(totalFootprint)} kg CO2e`,
        suggested_change: `Execute focused operational efficiency targets across facilities and attendee operations.`,
        estimated_savings: Math.round(totalFootprint * reductionFactor * 10) / 10,
        difficulty: preferences?.difficulty !== 'all' ? preferences?.difficulty || 'easy' : 'easy',
        estimated_cost: preferences?.budgetTier !== 'all' ? preferences?.budgetTier || 'zero' : 'zero',
        timeframe: preferences?.timeframe !== 'all' ? preferences?.timeframe || 'immediate' : 'immediate',
        adoption_percentage: Math.round(reductionFactor * 100),
        user_customized: true,
        assumptions: `Calibrated to achieve user target reduction of ${Math.round(reductionFactor * 100)}% on measured baseline.`,
        next_steps: [
          'Review progress weekly in the EcoTrack AI Analytics tab.',
          'Appoint operational champions for each category.',
        ],
        status: 'new',
        created_at: new Date().toISOString(),
      });
    }
  }

  // Filter by user preference criteria if applied
  if (preferences) {
    if (preferences.category && preferences.category !== 'all') {
      recommendations = recommendations.filter((r) => r.category === preferences.category);
    }
    if (preferences.difficulty && preferences.difficulty !== 'all') {
      recommendations = recommendations.filter((r) => r.difficulty === preferences.difficulty);
    }
    if (preferences.budgetTier && preferences.budgetTier !== 'all') {
      recommendations = recommendations.filter((r) => r.estimated_cost === preferences.budgetTier);
    }
    if (preferences.timeframe && preferences.timeframe !== 'all') {
      recommendations = recommendations.filter((r) => r.timeframe === preferences.timeframe);
    }
  }

  // Fallback if records are modest: provide a tailored general efficiency action
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-general-baseline',
      title: 'Establish Continuous Automated Monitoring & Sub-Metering',
      explanation:
        'You have begun recording baseline activities! To capture significant reductions, expand sub-metering on your highest consumption zones and set formal monthly target ceilings.',
      category: 'electricity',
      baseline_activity: `${activities.length} activities logged across workspace`,
      suggested_change: 'Implement systematic tracking and achieve a 15% reduction across energy and travel.',
      estimated_savings: 50.0,
      difficulty: 'easy',
      estimated_cost: 'zero',
      timeframe: 'short-term',
      adoption_percentage: 15,
      assumptions: 'Conservative 15% behavioral efficiency saving on initial baseline.',
      next_steps: ['Continue logging daily activity readings.', 'Form an environmental working group.'],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  // Sort recommendations by estimated CO2e savings (highest to lowest)
  return recommendations.sort((a, b) => b.estimated_savings - a.estimated_savings);
}

/**
 * Generates an instant, user-input-based reduction suggestion directly while adding an activity.
 * e.g., when the user types 500 kWh of grid electricity or 250 km of car travel.
 */
export function generateInstantActivitySuggestion(
  category: ActivityCategory,
  activityType: string,
  quantity: number,
  unit: string
): { tip: string; potentialSavingsKg: number; actionName: string } | null {
  if (quantity <= 0) return null;

  switch (category) {
    case 'electricity': {
      if (activityType.includes('grid')) {
        // Shifting 40% to rooftop solar
        const saved = Math.round(quantity * 0.40 * (0.716 - 0.041) * 10) / 10;
        return {
          actionName: 'Shift 40% to On-Site Solar PV',
          potentialSavingsKg: saved,
          tip: `Switching 40% of this ${quantity.toLocaleString()} ${unit} load to rooftop solar avoids ${saved.toLocaleString()} kg CO2e.`,
        };
      }
      if (activityType.includes('diesel')) {
        // Shifting diesel to grid or battery
        const saved = Math.round(quantity * (0.820 - 0.041) * 10) / 10;
        return {
          actionName: 'Replace Diesel Generator with Battery/Solar',
          potentialSavingsKg: saved,
          tip: `Replacing this temporary diesel generator with solar storage saves ~${saved.toLocaleString()} kg CO2e.`,
        };
      }
      break;
    }

    case 'transportation': {
      if (activityType.includes('car')) {
        // Carpooling or rail shift
        const savedCarpool = Math.round(quantity * (0.170 - 0.057) * 10) / 10;
        return {
          actionName: '3-Person Carpooling or Train Shift',
          potentialSavingsKg: savedCarpool,
          tip: `Sharing this journey with 2 carpool passengers or shifting to passenger rail saves ~${savedCarpool.toLocaleString()} kg CO2e.`,
        };
      }
      if (activityType.includes('flight')) {
        // Shifting flight to train / virtual
        const savedFlight = Math.round(quantity * (0.245 - 0.035) * 10) / 10;
        return {
          actionName: 'Swap Flight for Express Rail / Hybrid Stream',
          potentialSavingsKg: savedFlight,
          tip: `Replacing this flight journey with express rail or virtual video attendance avoids ~${savedFlight.toLocaleString()} kg CO2e.`,
        };
      }
      break;
    }

    case 'food': {
      if (activityType.includes('red_meat')) {
        const savedFood = Math.round(quantity * (6.5 - 0.65) * 10) / 10;
        return {
          actionName: 'Plant-Based Menu Alternative',
          potentialSavingsKg: savedFood,
          tip: `Offering gourmet plant-rich bowls instead of red meat for these ${quantity} meals avoids ~${savedFood.toLocaleString()} kg CO2e.`,
        };
      }
      if (activityType.includes('mixed')) {
        const savedVeg = Math.round(quantity * (2.2 - 1.1) * 10) / 10;
        return {
          actionName: 'Vegetarian Catering Swap',
          potentialSavingsKg: savedVeg,
          tip: `Switching to seasonal vegetarian buffet options for these ${quantity} meals saves ~${savedVeg.toLocaleString()} kg CO2e.`,
        };
      }
      break;
    }

    case 'waste': {
      if (activityType.includes('landfill')) {
        const savedCompost = Math.round(quantity * (0.58 - 0.05) * 10) / 10;
        return {
          actionName: 'Aerobic Composting & Recycling Diversion',
          potentialSavingsKg: savedCompost,
          tip: `Diverting these ${quantity.toLocaleString()} kg of waste to composting and material recyclers avoids ~${savedCompost.toLocaleString()} kg CO2e.`,
        };
      }
      break;
    }
  }

  return null;
}
