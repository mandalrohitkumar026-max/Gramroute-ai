# GramRoute AI — Prisma Database Schema & Tooling

This directory provides the canonical **Prisma Schema** and **Database Seeding Tooling** for the GramRoute AI backend platform.

---

## 📁 Directory Structure

```
backend/prisma/
├── schema.prisma        # Complete Prisma schema definition for all 15 platform models
├── seed.ts              # Automated database seeder for demo accounts, fleet, and trips
└── README.md            # Technical documentation and workflow instructions
```

---

## 🗄️ Database Architecture & Connector

The `schema.prisma` is configured to target **MongoDB** using native document ID mappings (`@map("_id") @db.ObjectId`) and composite embedded types, while preserving compatibility for potential PostgreSQL/CockroachDB migrations.

### Datasource Configuration
```prisma
datasource db {
  provider = "mongodb"
  url      = env("MONGODB_URI")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## 📦 The 15 Domain Models & Key Relationships

| Model | Collection | Primary Responsibility |
| :--- | :--- | :--- |
| **`User`** | `users` | Identity, bcrypt passwords, RBAC (`FARMER`, `TRANSPORTER`, `ADMIN`, `BUSINESS`), refresh tokens |
| **`Profile`** | `profiles` | KYC verification state, business names, ratings, and `2dsphere` home coordinates |
| **`Vehicle`** | `vehicles` | Transporter fleet with payload ($kg$), volume ($m^3$), reefer equipment, and compliance docs |
| **`Shipment`** | `shipments` | Agricultural cargo, origin/destination waypoints, perishability tier, and delivery deadlines |
| **`ShipmentMatch`** | `shipment_matches` | AI load consolidation recommendations with detour evaluations and cost savings |
| **`Trip`** | `trips` | Scheduled transit runs, polyline geometry, driver earnings, and capacity reservation |
| **`TripStop`** | `trip_stops` | Sequential ordered pickup/delivery stops with OTP validation codes |
| **`Booking`** | `bookings` | Bilateral freight contracts with dual-OTP pickup/delivery hand-off |
| **`CostAllocation`** | `cost_allocations` | Transparent Shapley-value and ton-km freight cost decomposition |
| **`TrackingEvent`** | `tracking_events` | GPS telemetry breadcrumbs, geofence triggers, and delay records |
| **`Notification`** | `notifications` | In-App, SMS, and WhatsApp alerts with priority queueing |
| **`Rating`** | `ratings` | Mutual trust feedback (1–5 stars) on timeliness and cargo handling |
| **`Dispute`** | `disputes` | Formal damage and cancellation arbitration with evidentiary attachments |
| **`PaymentRecord`** | `payment_records` | Double-entry escrow ledger tracking disbursement and platform fees |
| **`VerificationDocument`** | `verification_documents` | Encrypted KYC files (Aadhaar, Commercial DL, Vehicle RC, APMC License) |

---

## 🚀 Running the Database Seeder

The seeder populates your local MongoDB database with:
- 4 Role-specific user accounts (`Farmer`, `Transporter`, `Admin`, `Agri-Business`)
- 2dsphere-indexed profiles in the Ashta-Sehore agricultural corridor
- Mahindra Bolero Maxi Truck fleet assets
- 500 kg fresh tomato consignment and scheduled consolidated trip
- Itemized cost allocation with 26% shared consolidation discount

### Command to Seed:
```bash
cd backend
npx tsx prisma/seed.ts
```

### Pre-Configured Seeded Logins:
- 🧑‍🌾 **Farmer**: `farmer@gramroute.ai` / `Farmer@1234`
- 🚛 **Transporter**: `transporter@gramroute.ai` / `Transporter@1234`
- 🛡️ **Admin**: `admin@gramroute.ai` / `Admin@1234`
- 🏢 **Business**: `business@gramroute.ai` / `Business@1234`

---

## 🔧 Useful Prisma CLI Commands

If utilizing the Prisma Client in addition to or alongside Mongoose:

```bash
# Generate the Prisma Client types
npx prisma generate

# Introspect existing database schema
npx prisma db pull

# Push schema changes directly to MongoDB without migrations
npx prisma db push

# Open the visual database GUI in your browser
npx prisma studio
```
