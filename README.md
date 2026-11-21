# GramRoute AI — Intelligent Rural Freight Optimization & Shared Logistics Network

> **Phase 0 Deliverable**: Production-Ready Project Foundation, Architecture, 15 Mongoose Schemas, Light-Themed Frontend, and FastAPI Optimization Microservice.

---

## 1. Project Overview

GramRoute AI connects farmers, FPOs, rural small businesses, and independent transporters. It consolidates compatible agricultural shipments, maximizes vehicle capacity utilization, solves multi-stop pickup and delivery routing problems, transparently calculates fair transportation cost splits, and eliminates empty return journeys.

---

## 2. Directory Architecture

```
gramroute-ai/
├── frontend/                     # React + Vite + TypeScript (Forest Green & Deep Navy Light Theme)
│   ├── src/
│   │   ├── components/           # Reusable UI widgets & design tokens
│   │   ├── contexts/             # Global React state & auth providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # MainLayout with role switcher and navigation
│   │   ├── pages/                # HomePage with live system telemetry & 15-entity explorer
│   │   ├── routes/               # Declarative client-side routing
│   │   ├── services/             # Centralized ApiClient & HealthService
│   │   ├── types/                # Strongly typed API envelopes and 15 entity interfaces
│   │   └── utils/                # Error handling and utility helpers
│   ├── tailwind.config.js        # Forest Green, Deep Navy, and neutral palette
│   └── vite.config.ts            # Proxy configured for backend API
├── backend/                      # Node.js + Express + TypeScript Modular Monolith
│   ├── src/
│   │   ├── config/               # Zod-validated environment variables
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── middleware/           # Error handler, correlation IDs, request logging
│   │   ├── models/               # 15 Canonical Mongoose Schemas with 2dsphere GIS
│   │   ├── routes/               # Versioned API routes (/api/v1)
│   │   ├── services/             # AI Engine HTTP client & business domain logic
│   │   ├── utils/                # Winston logger, AppError, standardized API responses
│   │   └── tests/                # Automated Jest / Supertest suites
│   ├── jest.config.js            # TypeScript Jest test runner
│   └── tsconfig.json             # Strict TypeScript configuration
├── ai-engine/                    # Python FastAPI Independent Optimization Service
│   ├── app/
│   │   ├── api/                  # Endpoints: /health, /optimization, /matching, /forecasting
│   │   ├── forecasting/          # Seasonal produce yield and freight demand engine
│   │   ├── matching/             # Load consolidation and compatibility scorer
│   │   ├── optimization/         # Vehicle Routing Problem (VRP) & OR-Tools engine
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   └── tests/                # Automated Pytest test suite
│   ├── pyproject.toml            # Poetry / Pip build definition
│   └── requirements.txt          # Dependencies: FastAPI, OR-Tools, Scikit-learn
├── docs/                         # Architecture, API specifications, ADRs & ERDs
│   ├── adr/                      # Architecture Decision Records (ADR-001 through 004)
│   ├── api/                      # RESTful API specifications
│   ├── database/                 # Mermaid Entity Relationship Diagram & GIS notes
│   ├── architecture.md           # System architecture overview
│   └── CODING_STANDARDS.md       # TypeScript, Python, and Git conventions
└── scripts/                      # Developer and CI verification scripts
    └── verify-foundation.ps1     # Automated Phase 0 architectural validation script
```

---

## 3. The 15 Core Entities

All 15 entities required by the GramRoute AI specification are implemented in both Backend Mongoose Schemas (`backend/src/models/`) and Frontend TypeScript interfaces (`frontend/src/types/entities.ts`):

1. **User**: Authentication credentials, phone verification, and RBAC roles (`FARMER`, `BUSINESS`, `TRANSPORTER`, `ADMIN`).
2. **Profile**: Detailed contact information, address, and `2dsphere` geospatial home coordinates.
3. **Vehicle**: Transporter fleet assets with payload capacities (kg), volumetric capacity ($m^3$), and refrigeration status.
4. **Shipment**: Cargo description, weight, volume, perishability tier, pickup/delivery time windows, and dual `2dsphere` origin/destination locations.
5. **ShipmentMatch**: AI consolidation recommendations scoring capacity utilization and backhaul reduction percentage.
6. **Trip**: Scheduled vehicle journeys with load statuses, polyline paths, and driver earnings.
7. **TripStop**: Sequential ordered pickup, drop, and rest stops with OTP validation.
8. **Booking**: Confirmed transport agreements linking shipments to trips with agreed pricing.
9. **CostAllocation**: Proportional ton-km cost splitting, consolidation discounts, and platform fees.
10. **TrackingEvent**: GPS location pings, delay alerts, route deviations, and proof-of-delivery milestones.
11. **Notification**: Multi-channel alert dispatch (In-App, SMS, WhatsApp) with priority queuing.
12. **Rating**: Mutual trust feedback (1-5 stars) on timeliness, cargo care, and communication.
13. **Dispute**: Formal resolution mechanism for damaged goods, extreme delays, or cancellation disputes.
14. **PaymentRecord**: Escrow accounting ledger tracking payouts, platform fees, and transaction references.
15. **VerificationDocument**: KYC documentation (Aadhaar, Commercial Driver License, RC, APMC License).

---

## 4. Design Direction: Light Theme

Following the **GramRoute AI Master Engineering Instruction**, the interface uses a crisp, high-contrast light theme engineered for outdoor visibility on rural mobile devices:
- **Primary Color**: Forest Green (`#1E5631`)
- **Secondary Color**: Deep Navy (`#0F172A`)
- **Background**: Soft neutral gray (`#F8FAFC`) with pure white card surfaces (`#FFFFFF`)
- **Accents**: Light green (`#22C55E`) and subtle blue (`#0284C7`)

---

## 5. Quickstart & Verification

### Running Architectural Verification
To verify that all directories, 15 database models, and configuration files are present:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-foundation.ps1
```

### Running Backend Service
```bash
cd backend
npm install
npm run dev
```
- API Base: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/api/v1/health`

### Running Frontend Service
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

### Running Python AI Engine
```bash
cd ai-engine
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- AI Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`
