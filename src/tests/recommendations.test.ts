import { describe, it, expect } from 'vitest';
import {
  generateRecommendations,
  generateInstantActivitySuggestion,
} from '../lib/recommendations';
import { DEMO_ACTIVITIES } from '../data/demoData';

describe('User-Input-Based Suggestions and Recommendations', () => {
  it('generates standard baseline recommendations when no preferences are specified', () => {
    const recs = generateRecommendations(DEMO_ACTIVITIES);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].estimated_savings).toBeGreaterThan(0);
  });

  it('customizes recommendations based on user prompt query (e.g. carpool)', () => {
    const recs = generateRecommendations(DEMO_ACTIVITIES, {
      customGoalText: 'Incentivize carpools for 200 commuters',
    });

    expect(recs.length).toBeGreaterThan(0);
    const customRec = recs.find((r) => r.user_customized);
    expect(customRec).toBeDefined();
    expect(customRec?.title).toContain('Community Commute & Carpool');
    expect(customRec?.category).toBe('transportation');
    expect(customRec?.estimated_savings).toBeGreaterThan(0);
  });

  it('customizes recommendations based on user prompt query for food catering', () => {
    const recs = generateRecommendations(DEMO_ACTIVITIES, {
      customGoalText: 'Convert event buffet to 100% vegetarian vegan food',
    });

    const foodRec = recs.find((r) => r.user_customized && r.category === 'food');
    expect(foodRec).toBeDefined();
    expect(foodRec?.title).toContain('Sustainable Dining');
    expect(foodRec?.suggested_change).toContain('vegetarian');
  });

  it('filters recommendations by user-selected difficulty and budget constraints', () => {
    const easyZeroCostRecs = generateRecommendations(DEMO_ACTIVITIES, {
      difficulty: 'easy',
      budgetTier: 'zero',
    });

    expect(easyZeroCostRecs.length).toBeGreaterThan(0);
    easyZeroCostRecs.forEach((r) => {
      expect(r.difficulty).toBe('easy');
      expect(r.estimated_cost).toBe('zero');
    });
  });

  it('scales recommendation savings with user-specified target reduction percentage', () => {
    const conservativeRecs = generateRecommendations(DEMO_ACTIVITIES, {
      targetReductionPct: 20,
    });
    const ambitiousRecs = generateRecommendations(DEMO_ACTIVITIES, {
      targetReductionPct: 60,
    });

    const conservativeSolar = conservativeRecs.find((r) => r.id === 'rec-elec-solar-shift');
    const ambitiousSolar = ambitiousRecs.find((r) => r.id === 'rec-elec-solar-shift');

    if (conservativeSolar && ambitiousSolar) {
      expect(ambitiousSolar.estimated_savings).toBeGreaterThan(conservativeSolar.estimated_savings);
    }
  });

  it('generates real-time contextual reduction tips on user activity input', () => {
    // 1000 kWh grid electricity
    const elecTip = generateInstantActivitySuggestion('electricity', 'grid_electricity_in', 1000, 'kWh');
    expect(elecTip).not.toBeNull();
    expect(elecTip?.actionName).toContain('Solar');
    expect(elecTip?.potentialSavingsKg).toBeGreaterThan(100);

    // 100 red meat meals
    const foodTip = generateInstantActivitySuggestion('food', 'red_meat_meal', 100, 'meal');
    expect(foodTip).not.toBeNull();
    expect(foodTip?.actionName).toContain('Plant-Based');
    expect(foodTip?.potentialSavingsKg).toBeGreaterThan(300);

    // 500 km car travel
    const carTip = generateInstantActivitySuggestion('transportation', 'passenger_car_petrol', 500, 'km');
    expect(carTip).not.toBeNull();
    expect(carTip?.actionName).toContain('Carpooling');
    expect(carTip?.potentialSavingsKg).toBeGreaterThan(30);

    // 200 kg landfill waste
    const wasteTip = generateInstantActivitySuggestion('waste', 'landfill_mixed_waste', 200, 'kg');
    expect(wasteTip).not.toBeNull();
    expect(wasteTip?.actionName).toContain('Composting');
    expect(wasteTip?.potentialSavingsKg).toBeGreaterThan(50);
  });
});
