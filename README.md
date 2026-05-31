# TaskAPI — Node.js + PostgreSQL

A simple REST API for managing tasks, built as a **DevOps practice target**.

## Tech Stack
- **Runtime:** Node.js 20, Express 4
- **Database:** PostgreSQL 15
- **Testing:** Jest + Supertest (12 tests, ~100% coverage)
- **Metrics:** Prometheus + Grafana
- **Containers:** Docker (multi-stage), Docker Compose
- **Orchestration:** Kubernetes (Deployment, Service, HPA, ConfigMap, Secret)
- **CI/CD:** GitHub Actions

---

## Project Structure

```
taskapi/
├── src/
│   ├── config/
│   │   ├── database.js       # pg Pool connection
│   │   └── migrate.js        # DB schema migration
│   ├── models/
│   │   └── task.model.js     # Raw SQL CRUD + stats
│   ├── controllers/
│   │   └── task.controller.js
│   ├── routes/
│   │   └── task.routes.js    # Validation rules
│   ├── middleware/
│   │   └── metrics.js        # Prometheus metrics
│   ├── app.js                # Express app
│   └── index.js              # Entry point
├── tests/
│   └── tasks.test.js         # 12 integration tests
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/provisioning/
├── k8s/
│   └── manifests.yaml        # Full K8s setup
├── .github/workflows/
│   └── ci-cd.yml             # GitHub Actions pipeline
├── Dockerfile                # Multi-stage build
└── docker-compose.yml        # App + Postgres + Prometheus + Grafana
```

---

## Quick Start

### 1. Local (requires Postgres running)
```bash
cp .env.example .env       # fill in your DB creds
npm install
node src/config/migrate.js # create tables
npm start                  # http://localhost:3000
```

### 2. Docker Compose (everything included)
```bash
docker compose up -d

# Run migrations inside the container
docker compose exec api node src/config/migrate.js
```

| Service    | URL                        |
|------------|----------------------------|
| API        | http://localhost:3000      |
| Prometheus | http://localhost:9090      |
| Grafana    | http://localhost:3001      |

---

## API Reference

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | /health            | Liveness probe           |
| GET    | /ready             | Readiness probe (DB ping)|
| GET    | /metrics           | Prometheus metrics       |
| GET    | /api/tasks         | List tasks (filter/page) |
| GET    | /api/tasks/stats   | Count by status/priority |
| GET    | /api/tasks/:id     | Get one task             |
| POST   | /api/tasks         | Create task              |
| PATCH  | /api/tasks/:id     | Update task              |
| DELETE | /api/tasks/:id     | Delete task              |

### Query params for GET /api/tasks
- `status` — `pending` | `in_progress` | `done`
- `priority` — `low` | `medium` | `high`
- `limit` — default 20
- `offset` — default 0

### Example payloads
```json
// POST /api/tasks
{ "title": "Deploy to K8s", "priority": "high", "status": "pending" }

// PATCH /api/tasks/1
{ "status": "done" }
```

---

## DevOps Practices Covered

### Testing
```bash
npm test                 # run all tests
npm run test:coverage    # with coverage report
```

### Docker
```bash
# Build production image
docker build -t taskapi:latest .

# Run standalone (needs external Postgres)
docker run -p 3000:3000 --env-file .env taskapi:latest
```

### Kubernetes
```bash
# Apply all manifests (namespace, configmap, secret, deployments, HPA)
kubectl apply -f k8s/manifests.yaml

# Check pods
kubectl get pods -n taskapi

# Watch HPA
kubectl get hpa -n taskapi -w
```

### CI/CD (GitHub Actions)
The pipeline in `.github/workflows/ci-cd.yml` runs on every push:
1. **Test** — `npm test` with coverage
2. **Security** — `npm audit`
3. **Build** — Docker multi-stage build → push to GHCR
4. **Deploy staging** — on `develop` branch
5. **Deploy production** — on `main` branch

---

## Monitoring

After `docker compose up`, visit Grafana at **http://localhost:3001** (admin/admin).

Add a dashboard using these Prometheus queries:
```promql
# Request rate
rate(taskapi_http_requests_total[1m])

# P95 latency
histogram_quantile(0.95, rate(taskapi_http_request_duration_seconds_bucket[5m]))

# Memory usage
taskapi_process_resident_memory_bytes
```
