<div align="center">

# 🌾 GramRoute AI
### **Intelligent Rural Freight Optimization & Shared Logistics Network**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google OR-Tools](https://img.shields.io/badge/Google_OR--Tools-Optimization-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/optimization)
[![MongoDB](https://img.shields.io/badge/MongoDB-2dsphere_GIS-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  <b>Empowering Farmers • Unlocking Transporter Capacity • Eliminating Empty Return Journeys</b>
  <br />
  A rural-first logistics intelligence platform purpose-built for India's agricultural supply corridors.
</p>

[Explore Web App](http://localhost:5173/) • [Interactive API Docs](http://localhost:5000/api/v1/docs/) • [System Architecture](#-system-architecture) • [Quickstart](#-quickstart--local-setup) • [Innovations](#-key-innovations--phases-a-through-l)

---

</div>

## 📌 Executive Summary

**GramRoute AI** bridges the structural logistics gap between rural agricultural producers (farmers, FPOs, agri-enterprises) and regional transport networks. 

In emerging rural economies, smallholder farmers often pay exorbitant single-trip rates for sub-capacity freight, while transporters suffer severe revenue loss from empty return legs ("deadheading") and sub-optimal route chaining. GramRoute AI solves this through:
- **Combinatorial PDP / VRPTW Optimization**: Multi-stop pickup-and-delivery routing with vehicle capacity, perishability decay windows, and time-slot constraints solved with Google OR-Tools.
- **Multilingual Voice-Assisted Dispatch**: Speech-to-text NLP in Hindi, Gujarati, and English tailored for rural dialects and local mandi corridors (e.g., *"Mujhe 500 kilo tamatar Ashta se Sehore bhejne hain"*).
- **Smart Backhaul Exchange**: Predictive matching of return-leg shipments along existing delivery paths to maximize transporter earnings and minimize deadhead mileage.
- **Transparent Cost Splitting**: Fair Shapley-value and ton-kilometer proportional freight splitting with instant downloadable e-Bilty receipts.
- **Offline-First PWA Resilience**: Background sync queues and IndexedDB caching for low-bandwidth rural cellular environments.

---

## ⚡ Live Service Map & Demo Access

| Tier | Service | Port / URL | Status | Health Probe |
| :--- | :--- | :--- | :--- | :--- |
| **Web Frontend** | React 18 + Vite PWA | `http://localhost:5173/` | 🟢 Active | [http://localhost:5173/](http://localhost:5173/) |
| **Backend REST API** | Node.js + Express + TS | `http://localhost:5000/api/v1` | 🟢 Active | [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health) |
| **Interactive Docs** | OpenAPI 3.0 / Swagger UI | `http://localhost:5000/api/v1/docs/` | 🟢 Active | [http://localhost:5000/api/v1/docs.json](http://localhost:5000/api/v1/docs.json) |
| **AI Optimization** | Python FastAPI + OR-Tools | `http://localhost:8000/` | 🟢 Active | [http://localhost:8000/health](http://localhost:8000/health) |
| **Realtime Stream** | WebSocket Gateway | `ws://localhost:5000/api/v1/ws` | 🟢 Active | Handshake verified |

### 🔐 Pre-Configured Demo Credentials
All personas come seeded with end-to-end operational history, mock KYC documents, and sample shipments:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| 🧑‍🌾 **Farmer** | `farmer@gramroute.ai` | `Farmer@1234` | Voice shipment dispatch, shared trip tracking, e-Bilty cost receipts |
| 🚛 **Transporter** | `transporter@gramroute.ai` | `Transporter@1234` | Fleet telemetry, route optimizer, backhaul exchange, POD capture |
| 🛡️ **Platform Admin** | `admin@gramroute.ai` | `Admin@1234` | KYC verification audit, fraud monitoring, arbitration, analytics |
| 🏢 **Agri-Business** | `business@gramroute.ai` | `Business@1234` | Bulk cargo consolidation, FPO batch orders, contract billing |

---

## 🌟 Key Innovations (Phases A through L)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             GRAMROUTE AI INNOVATION STACK                        │
├─────────────────┬──────────────────┬──────────────────┬──────────────────────────┤
│ 🎙️ Phase A      │ 📶 Phase B       │ ❄️ Phase C       │ 🛡️ Phase D               │
│ Voice Assistant │ Offline PWA Sync │ Perishable Intel │ Transporter Trust        │
│ Hindi/Guj/Eng   │ Background Queue │ Reefer Feasibil. │ Aadhaar & RC Badge       │
├─────────────────┼──────────────────┼──────────────────┼──────────────────────────┤
│ 🔄 Phase E      │ 📈 Phase F       │ 💰 Phase G       │ 📦 Phase H               │
│ Backhaul Engine │ Demand Forecast  │ Shapley Cost     │ Digital POD & Dispute    │
│ Detour Limits   │ Kharif/Rabi/Zaid │ e-Bilty Receipts │ OTP + GPS Geostamp       │
├─────────────────┼──────────────────┼──────────────────┼──────────────────────────┤
│ 🚨 Phase I      │ 📊 Phase J       │ 🌿 Phase K       │ 🌐 Phase L               │
│ Safety & SOS    │ Logistics Intel  │ Eco Analytics    │ Multilingual UI          │
│ 112/1033 Assist │ Role Dashboards  │ 2.68 kg CO2e/L   │ Native Responsive Theme  │
└─────────────────┴──────────────────┴──────────────────┴──────────────────────────┘
```

### 🎙️ Phase A: Multilingual Voice-Assisted Dispatch
- **Dialect & Corridor NLP**: Captures conversational Hindi, Gujarati, and Indian English phrases using acoustic browser SpeechRecognition coupled with resilient regex corridor parsing.
- **Corridor Awareness**: Automatically resolves rural mandis and trading hubs (e.g. Ashta, Sehore, Pimpalgaon, Nashik, Vashi, Anand, Surat, Pune).
- **Natural Quantity Recognition**: Normalizes agricultural measurements (*kilo*, *quintal*, *bori*, *ton*) into standardized metric payloads ($kg$).
- **Interactive Review Card**: Direct in-modal confirmation dialog allowing voice re-recording or manual correction before dispatch.

### 📶 Phase B: Offline-First Rural Experience
- **PWA Service Worker**: Full client-side caching of UI assets, Leaflet map shells, and styling tokens for seamless offline operation.
- **Resilient Action Queue**: Stores shipment drafts locally in IndexedDB when network connectivity drops.
- **Two-Way Synchronization**: Automatically syncs queued drafts upon network recovery with server-side conflict detection.
- **Zero-Risk Invariant**: Offline bookings or payments are strictly prevented without live, cryptographically signed server confirmation.

### ❄️ Phase C: Perishable Cargo Safeguards
- **Reefer & Shelf-Life Feasibility**: Classified into `HIGHLY_PERISHABLE`, `MODERATE`, and `NON_PERISHABLE`. Shipments with active cooling requirements are strictly filtered out if no refrigerated (`has_refrigeration`) vehicles exist in the candidate fleet.
- **Hard Spoilage Constraints**: Enforces maximum transit duration limits ($T_{\text{max}}$) in the OR-Tools optimization engine, preventing agricultural produce spoilage.

### 🔄 Phase E: Smart Backhaul & Deadhead Reduction
- **Opportunity Mining**: Discovers compatible cargo along a transporter's return leg from destination back to home depot.
- **Constrained Deviation**: Enforces maximum route detours ($\le 40\text{ km}$ or $\le 20\%$ added travel distance).
- **Realistic Economics**: Computes net added revenue vs. marginal fuel expenses, with explicit operational disclaimers (*"Return cargo matches are subject to consignor availability"*).

### 📈 Phase F & 🌿 Phase K: Demand Forecasting & Carbon Metrics
- **Agri-Seasonal Models**: Accounts for Indian crop cycles (*Kharif*, *Rabi*, *Zaid*) and APMC Mandi weekly auction schedules.
- **Statistical Fallbacks**: Employs rolling moving-average and exponential smoothing fallbacks with 80% / 95% confidence intervals when historical corridor data is sparse.
- **Environmental Accounting**: Models tailpipe diesel emissions at $2.68\text{ kg CO}_2\text{e / L}$ of diesel avoided through consolidated trips, clearly flagged under `ESTIMATED_DERIVED_MODEL`.

### 💰 Phase G & 📦 Phase H: Transparent Costs & Digital POD
- **Fair Cost Allocation**: Decomposes multi-stop freight into Fuel base, Toll surcharges, Stop handling fees, and Shared Load Consolidation savings (averaging 25–40% farmer cost savings).
- **Downloadable e-Bilty**: Generates standardized electronic consignment notes formatted for mobile review and physical printing.
- **Tamper-Evident Hand-off**: Consignee delivery verification via SMS OTP, timestamped GPS geofence stamps, and digital receiver signature capture.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph ClientTier ["📱 Client Presentation Tier (Port 5173)"]
        UI["React 18 + Vite PWA"]
        VA["Voice Assistant (Hindi / Gujarati / English)"]
        GIS["Leaflet + OpenStreetMap GIS Viewer"]
        SW["Service Worker & Offline Cache"]
    end

    subgraph APITier ["⚙️ Core Backend Monolith (Port 5000)"]
        EX["Express.js REST Gateway"]
        WS["WebSocket Telemetry Hub (/api/v1/ws)"]
        SEC["Security: Helmet, Sanitization & Rate Limiters"]
        AUTH["JWT & RBAC Middleware"]
        SWAG["Swagger / OpenAPI 3.0 Documentation"]
    end

    subgraph AITier ["🧠 Python AI Optimization Microservice (Port 8000)"]
        FA["FastAPI Asynchronous Gateway"]
        ORT["Google OR-Tools PDP / VRPTW Solver"]
        BH["Backhaul Return-Leg Matching Engine"]
        FC["Agri-Demand & Seasonality Forecaster"]
    end

    subgraph StorageTier ["💾 Data & Persistence Tier"]
        MDB[("MongoDB Enterprise Database")]
        GEO["2dsphere Geospatial Indexing"]
        COLL["15 Domain Schemas (Users, Shipments, Trips, etc.)"]
    end

    UI -->|HTTPS REST| EX
    UI -->|Bi-directional GPS| WS
    SW -->|Cache / Sync| UI
    EX -->|JWT Auth & Validation| AUTH
    AUTH -->|Verified Request| SEC
    SEC -->|Internal RPC| FA
    FA -->|VRP Solutions| ORT
    FA -->|Return Optimization| BH
    FA -->|Crop Yield Forecasting| FC
    EX -->|Mongoose Queries| MDB
    MDB --- GEO
    MDB --- COLL
```

---

## 📦 The 15 Domain Entities

All 15 domain models are strictly implemented with dual-layer validation via **Mongoose Schemas** (`backend/src/models/`) and **TypeScript Interfaces** (`frontend/src/types/entities.ts`):

```
1.  User                  ── Authentication, credentials, phone verification, and RBAC roles
2.  Profile               ── Business profiles, KYC state, and 2dsphere home coordinates
3.  Vehicle               ── Fleet assets with payload (kg), volume (m³), and reefer specs
4.  Shipment              ── Origin/destination GIS coordinates, weight, volume, and perishability
5.  ShipmentMatch         ── AI consolidation scoring with detour and capacity optimization
6.  Trip                  ── Scheduled vehicle journeys with polylines and capacity allocation
7.  TripStop              ── Sequential pickup, drop, and rest stops with OTP verification
8.  Booking               ── Confirmed freight agreements binding consignors to shared trips
9.  CostAllocation        ── Shapley-value and proportional ton-km cost breakdowns
10. TrackingEvent         ── GPS location updates, delay alarms, and proof-of-delivery events
11. Notification          ── Multi-channel alert distribution (In-app, SMS, WhatsApp)
12. Rating                ── Mutual bilateral trust reviews (punctuality, cargo care)
13. Dispute               ── Structured dispute arbitration with uploaded evidentiary photos
14. PaymentRecord         ── Escrow ledger tracking milestone payouts and platform fees
15. VerificationDocument  ── Verified KYC assets (Aadhaar, Commercial DL, Vehicle RC, Mandi License)
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **Python**: v3.10+ or v3.11+
- **MongoDB**: v6.0+ (Local service on port 27017 or MongoDB Atlas connection string)
- **Git** & **PowerShell** / **Bash**

---

### Option A: Standard Multi-Process Startup

#### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/gramroute-ai.git
cd gramroute-ai
```

#### 2. Start the AI Optimization Microservice (Python)
```bash
cd ai-engine
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Probe*: `http://localhost:8000/health`

#### 3. Build & Start the Backend API (Node.js + Express)
```bash
cd ../backend
npm install
npm run build
node dist/server.js
```
*Interactive Swagger UI*: `http://localhost:5000/api/v1/docs/`  
*API Health Probe*: `http://localhost:5000/api/v1/health`

#### 4. Start the Frontend Application (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
*Web Application*: `http://localhost:5173/`

---

### Option B: Containerized Orchestration (Docker Compose)

Launch the entire ecosystem (MongoDB, FastAPI, Node.js Backend, and React Nginx frontend) with one command:
```bash
docker-compose up --build -d
```

| Service | Container Name | Port Mapping |
| :--- | :--- | :--- |
| **Frontend UI** | `gramroute-frontend` | `5173:80` |
| **Backend REST API** | `gramroute-backend` | `5000:5000` |
| **AI Optimization Microservice**| `gramroute-ai-engine` | `8000:8000` |
| **MongoDB GIS Database** | `gramroute-mongodb` | `27017:27017` |

---

## 🧪 Testing & Quality Assurance

The codebase includes an enterprise-grade automated testing matrix covering unit, integration, and mathematical constraint suites:

### Backend Test Matrix (Jest & Supertest)
```bash
cd backend
npm test
```
- **11 / 11 Test Suites Passing** (100% pass rate).
- **62 / 62 Tests Active**: Covers authentication, role-based authorization, rate limiting, NoSQL injection resistance, shipment dispatch, and payment ledger idempotency.
- **E2E Acceptance Flow**: Validates the end-to-end corridor cycle (Farmer voice creation $\to$ consolidation matching $\to$ VRP route optimization $\to$ transporter booking $\to$ live tracking $\to$ OTP delivery).

### AI Engine Constraint Testing (Pytest)
```bash
cd ai-engine
pytest
```
- **8 / 8 Optimization Tests Passing** (100% pass rate).
- **VRP & PDP Constraints**: Payload capacity limits, volumetric packing constraints, delivery deadlines, and cold-chain reefer compatibility validations.

---

## 🎨 UI/UX Design System: Rural-First Light Theme

Engineered specifically for outdoor readability on entry-level mobile screens under bright sunlight:

```css
/* Core Design Tokens */
--primary-forest:   #1E5631;  /* High-trust agricultural green */
--navy-deep:        #0F172A;  /* Professional high-contrast text & slate elements */
--surface-card:     #FFFFFF;  /* Crisp card background */
--bg-subtle:        #F8FAFC;  /* Glare-reducing neutral backdrop */
--accent-emerald:   #22C55E;  /* Success indicators & confirmed status */
--accent-amber:     #F59E0B;  /* Perishable warnings & delay advisories */
```

- **WCAG 2.1 AAA Contrast**: Optimal legibility for rural operators.
- **Touch-First Hit Areas**: Minimum $48\times 48\text{ px}$ clickable targets for seamless one-handed field operation.
- **Multilingual Support**: Fully localized in English, Hindi (हिन्दी), and Gujarati (ગુજરાતી).

---

## 🛡️ Security & Enterprise Governance

- **Zero-Trust Role-Based Access (RBAC)**: Strict separation of concerns between `FARMER`, `TRANSPORTER`, `BUSINESS`, and `ADMIN`.
- **Identity & KYC Protection**: Sensitive transporter documents (Aadhaar, PAN, DL) are masked from public listings and accessible only to audited administrators.
- **Defense in Depth**: Express security middleware with Helmet CSP configuration, Mongo-sanitize NoSQL injection prevention, and Zod runtime schema validation.
- **Emergency Hotline Integrations**: Direct dial-out shortcuts for National Emergency Police (112), NHAI Highway Patrol (1033), and GramRoute 24/7 Helpline.

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with ❤️ for the agricultural and rural logistics communities of India.  
*GramRoute AI — Transforming Empty Kilometers into Shared Prosperity.*
