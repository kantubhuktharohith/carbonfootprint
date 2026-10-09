# EcoTrack AI — Carbon Footprint Monitoring & Reduction Platform

> **Live Hackathon MVP Platform** built for individuals, educational institutions, and event organizers to monitor greenhouse gas emissions, generate algorithmically ranked reduction actions, and simulate climate impacts.

---

## 🌟 Key Capabilities

1. **Multi-Workspace Architecture**:
   - **Event Organizer Workspace**: Campus hackathons & conferences with attendee travel, catering, venue power, and per-attendee footprint analysis.
   - **Institutional / Campus Workspace**: Multi-facility electricity, transport, dining, and waste accounting with campus population intensity metrics.
   - **Individual Workspace**: Personal lifestyle, home electricity, and daily commute carbon accounting.
2. **Four-Category Emission Tracking**:
   - ⚡ **Electricity & Energy**: Indian Grid (CEA Baseline Database v19: 0.716 kg CO2e/kWh), US Grid (EPA eGRID: 0.385), UK Grid (DEFRA: 0.207), Rooftop Solar PV (0.041), and Backup Diesel Generators (0.820).
   - 🚗 **Transportation**: Passenger cars (Petrol & Diesel), Electric Vehicles (grid charging mix), Motorcycles, City transit buses, Electrified Intercity rail (0.035 kg/pkm), Domestic flights (ICAO Radiative Forcing: 0.245 kg/pkm), Carpooling division, and Active mobility (Walking & Cycling explicitly modeled at 0 direct operational emissions).
   - 🥗 **Food & Dining**: Ruminant red-meat dishes (6.5 kg CO2e/meal), Mixed omnivore meals (2.2 kg), Vegetarian meals (1.1 kg), and 100% Plant-Based vegan meals (0.65 kg).
   - 🗑️ **Waste Management**: Landfill mixed municipal waste (0.58 kg CO2e/kg), Post-consumer food scraps in landfill (0.62 kg), Managed aerobic composting (0.05 kg), and Closed-loop recycling (0.03–0.045 kg).
3. **Smart Rule-Based Recommendation Engine**:
   - Evaluates recorded activities to discover top emissions drivers.
   - Algorithmically ranks interventions by potential CO2e savings (highest to lowest).
   - Transparently details baseline activity, suggested change, estimated savings, difficulty, cost tier, timeframe, assumptions, and next steps.
4. **Interactive Carbon Reduction Simulator**:
   - Real-time modeling invariant: `Projected Footprint = Baseline - Estimated Savings`.
   - Never allows negative emissions.
   - Side-by-side category comparisons (Baseline vs Projected).
   - Tangible real-world equivalencies (Urban trees planted, car km avoided, residential home power days).
   - Saved simulation scenario management.
5. **Analytics, CSV Export & Audit Reporting**:
   - Filter by date range and category.
   - One-click CSV export with activity dates, units, factor values, emissions, and citations.
   - Printable institutional executive summary report (`window.print()`).
6. **Zero-Friction Demo Mode**:
   - Operates 100% offline out-of-the-box using reactive localStorage persistence.
   - Preloaded with a realistic 350-attendee campus hackathon dataset ("GreenTech Conclave 2026").
   - Instant 1-click evaluation access without required registration.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **State Management & Context**: Pure React Context with local persistence fallback
- **Visual Analytics**: Recharts (Donut, Multi-Bar, Stacked Area / Timeline)
- **Icons**: Lucide React
- **Testing**: Vitest (17 passing unit and integration tests)
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Deployment**: Vercel / Netlify ready

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd carbonfootprint
npm install
```

### 2. Run Locally in Demo Mode
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. The app runs immediately with sample data.

### 3. Run Automated Tests
```bash
npm run test
```
Executes all 17 unit and workflow tests for calculation validation, carpooling math, and simulation invariants.

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase PostgreSQL Setup (Optional Cloud Mode)

To enable live Supabase persistence instead of local demo mode:

1. Create a project at [Supabase](https://supabase.com).
2. Execute [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor to initialize tables and Row Level Security (RLS) policies.
3. Execute [`supabase/seed.sql`](supabase/seed.sql) to seed default emission factors.
4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
5. Fill in your project keys in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Restart `npm run dev`. EcoTrack AI will now automatically sync to your cloud PostgreSQL database!

---

## 📊 Emission Factor References & Citations

| Category | Factor Name | Value | Unit | Primary Source Citation |
|---|---|---|---|---|
| Electricity | Indian Grid (Weighted Average) | 0.716 | kg CO2e / kWh | [CEA CO2 Baseline Database v19 (2024)](https://cea.nic.in/cdm-co2-baseline-database/) |
| Electricity | US Grid Average | 0.385 | kg CO2e / kWh | US EPA eGRID 2023 Summary Tables |
| Electricity | UK National Grid | 0.207 | kg CO2e / kWh | UK DEFRA / DESNZ GHG Factors 2024 |
| Electricity | Rooftop Solar PV | 0.041 | kg CO2e / kWh | IPCC Working Group III Life-Cycle Assessment |
| Electricity | Diesel Generator Backup | 0.820 | kg CO2e / kWh | IPCC Stationary Combustion Guidelines |
| Transport | Petrol Passenger Car (Solo) | 0.170 | kg CO2e / km | DEFRA Passenger Vehicles 2024 |
| Transport | Electric Vehicle (Grid Charging) | 0.053 | kg CO2e / km | IEA Global EV Outlook 2024 |
| Transport | Local Transit Bus | 0.089 | kg CO2e / pkm | DEFRA Public Transport - Local Bus |
| Transport | Intercity Train / Metro | 0.035 | kg CO2e / pkm | DEFRA Public Transport - Rail |
| Transport | Domestic Aviation (with RF) | 0.245 | kg CO2e / pkm | ICAO Carbon Calculator & DEFRA |
| Transport | Walking / Cycling | 0.000 | kg CO2e / km | IPCC Active Mobility Protocol |
| Food | Red Meat / Beef Serving | 6.500 | kg CO2e / meal | Poore & Nemecek (Science 2018) |
| Food | Mixed Omnivore Meal | 2.200 | kg CO2e / meal | Poore & Nemecek / EAT-Lancet Commission |
| Food | Vegetarian Meal | 1.100 | kg CO2e / meal | WRI Protein Scorecard |
| Food | 100% Plant-Based Vegan Meal | 0.650 | kg CO2e / meal | Poore & Nemecek / Oxford University |
| Waste | Mixed Packaging to Landfill | 0.580 | kg CO2e / kg | DEFRA Commercial Waste Model |
| Waste | Food Waste in Landfill | 0.620 | kg CO2e / kg | US EPA WARM v16 Model |
| Waste | Managed Aerobic Composting | 0.050 | kg CO2e / kg | IPCC Biological Waste Treatment |
| Waste | Mechanical Plastic Recycling | 0.045 | kg CO2e / kg | DEFRA Material Recycling |

---

## 🔒 Security, Privacy & Integrity

- **Row Level Security (RLS)**: Enforces that users only read and write authorized organizational and personal records.
- **Client-Side Credential Safety**: Never bundles secret service-role credentials; only public anonymous keys are utilized.
- **No Invented Factors**: Zero phantom calculations; all non-verified experimental factors are explicitly marked with an Illustrative badge.
- **Explainability**: Every activity record captures the factor value and source version used at the time of creation.

---

## 📜 Regulatory Disclaimer

*EcoTrack AI is designed for internal sustainability screening, university climate hackathons, event green auditing, and reduction strategy simulation. It does not claim ISO 14064 certification or regulatory carbon compliance.*
