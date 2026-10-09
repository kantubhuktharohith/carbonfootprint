import { ActivityRecord, Recommendation } from '../types';
import { calculateCategoryTotals } from './calculations';

/**
 * Generates tailored, context-aware recommendations based on actual recorded activities.
 * Ranked in descending order of estimated CO2e savings.
 */
export function generateRecommendations(activities: ActivityRecord[]): Recommendation[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  const categorySummaries = calculateCategoryTotals(activities);
  const recommendations: Recommendation[] = [];

  // Group activities for analysis
  const electricityActs = activities.filter((a) => a.category === 'electricity');
  const transportActs = activities.filter((a) => a.category === 'transportation');
  const foodActs = activities.filter((a) => a.category === 'food');
  const wasteActs = activities.filter((a) => a.category === 'waste');

  const elecTotal = electricityActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);
  const transTotal = transportActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);
  const foodTotal = foodActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);
  const wasteTotal = wasteActs.reduce((sum, a) => sum + (a.estimated_emissions || 0), 0);

  // ----------------------------------------------------
  // 1. ELECTRICITY RECOMMENDATIONS
  // ----------------------------------------------------
  const gridActs = electricityActs.filter((a) => a.activity_type.includes('grid'));
  const totalGridKWh = gridActs.reduce((sum, a) => sum + a.quantity, 0);

  if (totalGridKWh > 500) {
    // Rooftop solar / green power transition
    // Shifting 40% of grid electricity to rooftop solar or green open access tariff
    // Savings = 40% of totalGridKWh * (0.716 - 0.041) = ~0.675 kg/kWh
    const potentialKWhShift = Math.round(totalGridKWh * 0.4);
    const estimatedSavings = Math.round(potentialKWhShift * (0.716 - 0.041) * 10) / 10;

    recommendations.push({
      id: 'rec-elec-solar-shift',
      title: 'Deploy On-Site Solar PV / Procure Green Tariff',
      explanation:
        'Grid electricity is currently one of your top drivers of emissions. Transitioning 40% of peak daytime lighting and lab computing load to on-site rooftop solar or a certified renewable energy tariff drastically reduces Scope 2 footprint.',
      category: 'electricity',
      baseline_activity: `${totalGridKWh.toLocaleString()} kWh drawn from high-carbon grid (${Math.round(elecTotal)} kg CO2e)`,
      suggested_change: `Substitute 40% (${potentialKWhShift.toLocaleString()} kWh) with solar power generation or green open access procurement.`,
      estimated_savings: estimatedSavings,
      difficulty: 'medium',
      estimated_cost: 'medium',
      timeframe: 'medium-term',
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
    const hvacSavings = Math.round(totalGridKWh * 0.15 * 0.716 * 10) / 10;
    recommendations.push({
      id: 'rec-elec-smart-controls',
      title: 'Optimize HVAC Setpoints & Implement Smart Power Strips',
      explanation:
        'Space cooling and idle electronics account for substantial energy leakage. Adjusting cooling setpoints to 24°C–25°C and deploying smart timer strips eliminates ghost loads without disrupting occupant comfort.',
      category: 'electricity',
      baseline_activity: `${totalGridKWh.toLocaleString()} kWh baseline consumption across event venues and labs`,
      suggested_change:
        'Adjust AC thermostat setpoints from 20°C to 24°C and enforce automated overnight sleep-mode policies.',
      estimated_savings: hvacSavings,
      difficulty: 'easy',
      estimated_cost: 'low',
      timeframe: 'immediate',
      assumptions:
        'Bureau of Energy Efficiency (BEE) benchmark: each 1°C increase in AC setpoint yields ~6% energy savings. Projected 15% overall load curtailment on Indian grid emission factor.',
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

  if (flightKm > 1000) {
    // Shift regional domestic flights to electric high-speed rail or virtual participation
    // Savings = 50% flight km * (0.245 - 0.035) = 0.210 kg/km
    const shiftedKm = Math.round(flightKm * 0.5);
    const flightSavings = Math.round(shiftedKm * (0.245 - 0.035) * 10) / 10;

    recommendations.push({
      id: 'rec-trans-train-shift',
      title: 'Replace Regional Flights with Express Rail or Hybrid Attendance',
      explanation:
        'Aviation produces intense radiative forcing per passenger-km. Replacing short-haul speaker or delegate flights (< 600 km) with electrified rail transit or hybrid telepresence cuts transport intensity by up to 85%.',
      category: 'transportation',
      baseline_activity: `${flightKm.toLocaleString()} passenger-km logged via domestic flights (${Math.round(flightActs.reduce((s, a) => s + a.estimated_emissions, 0))} kg CO2e)`,
      suggested_change: `Substitute 50% of regional journeys (${shiftedKm.toLocaleString()} km) with express passenger rail or interactive video feeds.`,
      estimated_savings: flightSavings,
      difficulty: 'easy',
      estimated_cost: 'zero',
      timeframe: 'immediate',
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

  if (soloCarKm > 1000) {
    // Carpooling & Dedicated Shuttles
    // Converting solo car trips (0.170 kg/km) to 3-person carpool (0.056 kg/km) or metro shuttle (0.035 kg/km)
    const shiftedCarKm = Math.round(soloCarKm * 0.6);
    const carpoolSavings = Math.round(shiftedCarKm * (0.170 - 0.056) * 10) / 10;

    recommendations.push({
      id: 'rec-trans-carpool-shuttle',
      title: 'Incentivize Ride-Sharing & Metro Hub Shuttles',
      explanation:
        'Solo passenger vehicle travel is a prime contributor to urban traffic congestion and Scope 3 attendee travel emissions. Coordinating student carpools and scheduled shuttles from the nearest metro station yields quick wins.',
      category: 'transportation',
      baseline_activity: `${soloCarKm.toLocaleString()} km recorded from single-occupancy private cars`,
      suggested_change:
        'Shift 60% of private car travel to 3+ person carpools or free university metro-link shuttle vans.',
      estimated_savings: carpoolSavings,
      difficulty: 'easy',
      estimated_cost: 'low',
      timeframe: 'immediate',
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

  if (redMeatMeals > 50 || mixedMeals > 150) {
    // Plant-rich catering menu transition
    // Converting red meat (6.5 kg) to plant-based (0.65 kg) = 5.85 kg saved per meal!
    // Converting mixed (2.2 kg) to vegetarian (1.1 kg) = 1.1 kg saved per meal!
    const targetRedMeatShift = Math.round(redMeatMeals * 0.7);
    const targetMixedShift = Math.round(mixedMeals * 0.4);

    const foodSavings =
      Math.round((targetRedMeatShift * (6.5 - 0.65) + targetMixedShift * (2.2 - 1.1)) * 10) / 10;

    recommendations.push({
      id: 'rec-food-plant-catering',
      title: 'Introduce Plant-Rich Catering & "Default-Veg" Dining',
      explanation:
        'Red meat and industrial animal agriculture carry the highest emissions per calorie of any food group. Adopting a default plant-forward catering menu with delicious vegan & vegetarian selections achieves tremendous carbon reductions with zero capital cost.',
      category: 'food',
      baseline_activity: `${redMeatMeals} red-meat meals (6.5 kg/meal) and ${mixedMeals} mixed omnivore meals recorded (${Math.round(foodTotal)} kg CO2e)`,
      suggested_change: `Substitute 70% of red meat dishes with gourmet plant-based cuisine, and 40% of mixed platters with seasonal vegetarian items.`,
      estimated_savings: foodSavings,
      difficulty: 'easy',
      estimated_cost: 'zero',
      timeframe: 'immediate',
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

  if (landfillKg > 100) {
    // Divert landfill waste to on-site composting & strict recycling sorting
    // Landfill: 0.58-0.62 kg/kg. Composting: 0.05 kg/kg. Saving: ~0.53 kg/kg.
    const divertKg = Math.round(landfillKg * 0.7);
    const wasteSavings = Math.round(divertKg * (0.58 - 0.05) * 10) / 10;

    recommendations.push({
      id: 'rec-waste-zero-divert',
      title: 'Divert Organic Scraps to Composting & Ban Single-Use Plastic',
      explanation:
        'Landfill organic waste decomposes anaerobically, creating potent fugitive methane emissions. Establishing 3-stream waste stations (Compostable, Recyclable, Dry Landfill) and composting food scraps keeps valuable organic matter in circular cycles.',
      category: 'waste',
      baseline_activity: `${landfillKg.toLocaleString()} kg sent to municipal landfill (${Math.round(wasteTotal)} kg CO2e)`,
      suggested_change: `Divert 70% (${divertKg} kg) of waste to managed aerobic composting and closed-loop recyclers.`,
      estimated_savings: wasteSavings,
      difficulty: 'easy',
      estimated_cost: 'low',
      timeframe: 'immediate',
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
      assumptions: 'Conservative 15% behavioral efficiency saving on initial baseline.',
      next_steps: ['Continue logging daily activity readings.', 'Form an environmental working group.'],
      status: 'new',
      created_at: new Date().toISOString(),
    });
  }

  // Sort recommendations by estimated CO2e savings (highest to lowest)
  return recommendations.sort((a, b) => b.estimated_savings - a.estimated_savings);
}
