-- ====================================================================
-- ECOTRACK AI - SEED DATA FOR EMISSION FACTORS & DEMO DATA
-- ====================================================================

INSERT INTO public.emission_factors (id, activity_type, category, value, unit, region, source_url, source_name, reporting_year, is_verified, notes, version)
VALUES
  ('elec-grid-in', 'grid_electricity_in', 'electricity', 0.7160, 'kWh', 'India', 'https://cea.nic.in/cdm-co2-baseline-database/', 'Central Electricity Authority (CEA) v19', 2024, true, 'Indian regional grid combined margin baseline', '1.2.0'),
  ('elec-grid-us', 'grid_electricity_us', 'electricity', 0.3850, 'kWh', 'United States', 'https://www.epa.gov/egrid', 'US EPA eGRID 2023 Tables', 2023, true, 'National average US grid generation', '1.0.0'),
  ('elec-grid-uk', 'grid_electricity_uk', 'electricity', 0.2070, 'kWh', 'United Kingdom', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024', 'UK DEFRA / DESNZ', 2024, true, 'UK national grid average intensity', '1.0.0'),
  ('elec-solar-rooftop', 'solar_pv_rooftop', 'electricity', 0.0410, 'kWh', 'Global', 'https://www.ipcc.ch/report/ar5/wg3/', 'IPCC Working Group III', 2021, true, 'Life-cycle embodied rooftop solar PV', '1.0.0'),
  ('elec-diesel-generator', 'diesel_generator', 'electricity', 0.8200, 'kWh', 'Global', 'https://www.ipcc-nggip.iges.or.jp/', 'IPCC Stationary Combustion Guidelines', 2022, true, 'Backup diesel generator for outdoor venue', '1.0.0'),
  ('trans-car-petrol', 'passenger_car_petrol', 'transportation', 0.1700, 'km', 'Global / DEFRA', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024', 'DEFRA 2024 Passenger Vehicles', 2024, true, 'Average petrol passenger car (1 occupant)', '1.1.0'),
  ('trans-car-ev', 'electric_vehicle', 'transportation', 0.0530, 'km', 'Global', 'https://www.iea.org/reports/global-ev-outlook-2024', 'IEA Global EV Outlook', 2024, true, 'Operational electric car charging on grid', '1.0.0'),
  ('trans-bus-transit', 'city_bus', 'transportation', 0.0890, 'km', 'Global Urban', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024', 'DEFRA Public Transport - Bus', 2024, true, 'Local transit municipal bus', '1.0.0'),
  ('trans-train-rail', 'intercity_train', 'transportation', 0.0350, 'km', 'National Rail', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024', 'DEFRA Public Transport - Rail', 2024, true, 'Electrified intercity rail and metro', '1.0.0'),
  ('trans-flight-domestic', 'domestic_flight', 'transportation', 0.2450, 'km', 'Aviation', 'https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx', 'ICAO & DEFRA Aviation (with RF)', 2024, true, 'Domestic air passenger with radiative forcing', '1.2.0'),
  ('trans-bicycle', 'bicycle', 'transportation', 0.0000, 'km', 'Global', 'https://www.ipcc.ch/report/ar6/wg3/', 'IPCC Active Mobility Protocol', 2023, true, 'Zero direct operational emissions', '1.0.0'),
  ('trans-walking', 'walking', 'transportation', 0.0000, 'km', 'Global', 'https://www.ipcc.ch/report/ar6/wg3/', 'IPCC Active Mobility Protocol', 2023, true, 'Zero direct operational emissions', '1.0.0'),
  ('food-beef-redmeat', 'red_meat_meal', 'food', 6.5000, 'meal', 'Global', 'https://ourworldindata.org/food-choice-vs-eating-local', 'Poore & Nemecek (2018) / Science', 2022, true, 'Red meat / ruminant livestock meal', '1.0.0'),
  ('food-mixed-omnivore', 'mixed_omnivore_meal', 'food', 2.2000, 'meal', 'Global', 'https://ourworldindata.org/environmental-impacts-of-food', 'Poore & Nemecek / EAT-Lancet', 2022, true, 'Mixed omnivore meal (poultry, dairy, veg)', '1.0.0'),
  ('food-vegetarian', 'vegetarian_meal', 'food', 1.1000, 'meal', 'Global', 'https://ourworldindata.org/environmental-impacts-of-food', 'WRI Protein Scorecard', 2023, true, 'Vegetarian meal with dairy/legumes', '1.0.0'),
  ('food-vegan-plant', 'plant_based_vegan_meal', 'food', 0.6500, 'meal', 'Global', 'https://ourworldindata.org/environmental-impacts-of-food', 'Poore & Nemecek / Oxford', 2023, true, '100% plant-based meal', '1.0.0'),
  ('waste-landfill-mixed', 'landfill_mixed_waste', 'waste', 0.5800, 'kg', 'Global', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024', 'DEFRA Commercial Waste to Landfill', 2024, true, 'Mixed packaging decaying anaerobically', '1.0.0'),
  ('waste-food-landfill', 'food_waste_to_landfill', 'waste', 0.6200, 'kg', 'Global', 'https://www.epa.gov/warm', 'US EPA WARM v16', 2023, true, 'Food waste decaying anaerobically in landfill', '1.0.0'),
  ('waste-composting-aerobic', 'managed_composting', 'waste', 0.0500, 'kg', 'Global', 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol5.html', 'IPCC Biological Waste Treatment', 2023, true, 'Aerobic composting avoiding landfill methane', '1.0.0'),
  ('waste-recycling-plastic', 'recycled_plastic', 'waste', 0.0450, 'kg', 'Global', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024', 'DEFRA Material Recycling', 2024, true, 'Mechanical recycling of plastic bottles', '1.0.0')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;
