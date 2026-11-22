# GramRoute AI — Production Deployment Guide & Runbook

This guide covers deployment procedures for the GramRoute AI rural freight coordination network across containerized infrastructure (Docker Compose, Kubernetes, AWS ECS, GCP Cloud Run, or Railway/Render).

---

## 1. System Architecture & Port Map

| Component | Technology | Internal Port | External Port | Health Check Route |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, Nginx | 80 | `80` / `443` | `GET /` |
| **Backend REST & WebSocket** | Node.js, Express, TypeScript | 5000 | `5000` | `GET /health` |
| **AI Optimization Microservice** | Python 3.11, FastAPI, OR-Tools | 8000 | `8000` | `GET /health` |
| **Database** | MongoDB 7.0 Jammy | 27017 | `27017` | `mongosh --eval 'db.ping()'` |

---

## 2. Quickstart with Docker Compose

### Step 1: Clone & Configure Environment
```bash
cp .env.production.example .env.production
# Edit .env.production with production secrets
```

### Step 2: Build & Launch Stack
```bash
docker compose --env-file .env.production up -d --build
```

### Step 3: Verify Container Health
```bash
docker compose ps
```
All four services (`gramroute-mongodb`, `gramroute-ai-engine`, `gramroute-backend`, `gramroute-frontend`) should display `(healthy)`.

---

## 3. Security Hardening Checklist

- [x] **Zero Raw Card Storage**: No payment card numbers, CVVs, or bank PINs are handled.
- [x] **Cryptographic Secrets**: High-entropy 256-bit secrets for JWT Access, Refresh rotation, and Cookie signing.
- [x] **NoSQL Injection Shield**: `sanitizeNoSql` middleware recursively sanitizes `$` operators and object notation.
- [x] **Rate Limiting & Lockout**: General API rate limit at 200 req/15m; 5 failed login attempts trigger a 15-minute lockout.
- [x] **Non-Root Execution**: Backend container runs under standard unprivileged `node` user.
- [x] **Container Isolation**: Multi-stage Docker builds discard dev dependencies, compiler tools, and source maps.

---

## 4. Disaster Recovery & Database Backups

### Automated Hourly MongoDB Snapshot
```bash
docker exec -t gramroute-mongodb mongodump --out /data/db/backup-$(date +%F_%H-%M)
```

### Restore from Backup
```bash
docker exec -t gramroute-mongodb mongorestore /data/db/backup-<TIMESTAMP>
```

---

## 5. Maintenance Runbook & Troubleshooting

### Backend Logs
```bash
docker logs -f gramroute-backend
```

### AI Solver Latency & Memory Probe
```bash
docker logs -f gramroute-ai-engine
```

### Scaling Node Workers
For high-traffic agricultural harvest spikes (e.g. Nashik onion auction season):
```bash
docker compose up -d --scale backend=3
```
