# 🚀 VPS AI Worker Migration - Complete Specification

## 📋 Overview

This specification documents the complete migration of AI processing from synchronous Supabase Edge Functions to asynchronous VPS workers, eliminating timeouts and improving scalability.

## 📚 Documentation Structure

### 1. **requirements.md** - Business Requirements
- User stories with acceptance criteria
- Current problems and target solutions
- Database schema
- Success metrics
- Security requirements

**Key Highlights**:
- 8 critical Edge Functions with timeout risk
- 14 frontend components affected
- ~3,650 calls/day at risk
- Target: < 0.1% timeout rate (from 7.6%)

### 2. **design.md** - Technical Design
- Architecture diagrams
- API specifications (Gateway + Worker)
- Database design with indexes and RLS
- Worker processing logic
- Frontend integration (useAsyncAnalysis hook)
- Monitoring and observability
- Testing strategy

**Key Components**:
- Gateway Edge Functions (enqueue, get-status)
- VPS AI Worker (Node.js + Express)
- Database tables (analysis_jobs, analysis_cache)
- Frontend hook (useAsyncAnalysis)

### 3. **tasks.md** - Implementation Plan
- 200+ detailed tasks across 7 phases
- 3-4 week timeline
- Phase-by-phase breakdown
- Testing and validation tasks
- Rollback procedures

**Phases**:
1. Infrastructure & Database (Week 1)
2. Gateway Edge Functions (Week 1-2)
3. Frontend Integration (Week 2)
4. Testing & Validation (Week 2-3)
5. Gradual Rollout (Week 3)
6. Monitoring & Optimization (Week 3-4)
7. Cleanup & Documentation (Week 4)

## 📊 Supporting Documents

### 4. **docs/VPS_WORKER_MIGRATION_EXECUTIVE_SUMMARY.md**
- High-level overview for stakeholders
- Current state analysis
- Proposed solution with diagrams
- Cost analysis (87% reduction)
- Risk mitigation strategies

### 5. **docs/CURRENT_ARCHITECTURE_REPORT.md**
- Complete inventory of 89 Edge Functions
- Detailed analysis of 8 critical functions
- Frontend integration points (14 locations)
- VPS infrastructure status
- Performance metrics and error rates

### 6. **scripts/vps-worker-migration-toolkit.sh**
- Automated deployment scripts
- Health check utilities
- Testing tools (enqueue, status, e2e)
- Monitoring commands
- Feature flag management
- Emergency rollback procedures

## 🎯 Quick Start

### For Stakeholders
1. Read: `docs/VPS_WORKER_MIGRATION_EXECUTIVE_SUMMARY.md`
2. Review: Cost analysis and success metrics
3. Approve: Proceed with implementation

### For Developers
1. Read: `requirements.md` (understand the problem)
2. Read: `design.md` (understand the solution)
3. Review: `tasks.md` (understand the work)
4. Start: Phase 1 tasks

### For DevOps
1. Read: `design.md` (deployment section)
2. Review: VPS specifications and EasyPanel config
3. Prepare: Environment variables
4. Use: `scripts/vps-worker-migration-toolkit.sh`

## 📈 Key Metrics

### Current State (Problems)
- ❌ Timeout rate: 7.6%
- ❌ Average wait: 8-30 seconds (blocking)
- ❌ No cancellation possible
- ❌ No retry on failure
- ❌ Cost: ~$20/month

### Target State (Solution)
- ✅ Timeout rate: < 0.1%
- ✅ Gateway response: < 200ms
- ✅ Worker completion: < 15s
- ✅ User can cancel
- ✅ Automatic retry (3x)
- ✅ Cost: ~$7/month (65% reduction)

## 🔒 Safety Features

### Feature Flags
All async processing is controlled by feature flags:
```env
VITE_USE_ASYNC_SOFIA=false          # Sofia analysis
VITE_USE_ASYNC_EXAMS=false          # Medical exams
VITE_USE_ASYNC_UNIFIED=false        # Unified assistant
VITE_USE_ASYNC_MEAL_PLAN=false      # Meal plans
VITE_USE_ASYNC_WHATSAPP=false       # WhatsApp bot
```

**Rollback**: Set all flags to `false` → Instant rollback (< 5 minutes)

### Automatic Fallback
If worker is unavailable or times out, system automatically falls back to synchronous processing.

### Gradual Rollout
- Week 3 Day 1-2: 10% users (canary)
- Week 3 Day 3-4: 50% users
- Week 3 Day 5+: 100% users

## 🛠️ Tools & Scripts

### Deployment
```bash
# Setup database
./scripts/vps-worker-migration-toolkit.sh setup-db

# Deploy worker
./scripts/vps-worker-migration-toolkit.sh deploy

# Check health
./scripts/vps-worker-migration-toolkit.sh health
```

### Testing
```bash
# Test enqueue
./scripts/vps-worker-migration-toolkit.sh test-enqueue sofia_image

# Test end-to-end
./scripts/vps-worker-migration-toolkit.sh test-e2e

# Load test
./scripts/vps-worker-migration-toolkit.sh load-test
```

### Monitoring
```bash
# Queue statistics
./scripts/vps-worker-migration-toolkit.sh queue-stats

# Worker metrics
./scripts/vps-worker-migration-toolkit.sh metrics

# Tail logs
./scripts/vps-worker-migration-toolkit.sh logs
```

### Feature Flags
```bash
# Enable async for Sofia
./scripts/vps-worker-migration-toolkit.sh enable sofia

# Enable all async
./scripts/vps-worker-migration-toolkit.sh enable all

# Disable all (rollback)
./scripts/vps-worker-migration-toolkit.sh disable
```

### Emergency
```bash
# Emergency rollback
./scripts/vps-worker-migration-toolkit.sh rollback
```

## 📞 Support

### During Migration
- **Project Lead**: Kiro AI Assistant
- **Timeline**: 3-4 weeks
- **Priority**: P0 (Critical)
- **Risk**: Medium (mitigated by feature flags)

### After Migration
- **Monitoring**: Admin dashboard + alerts
- **Logs**: Structured logging with job IDs
- **Metrics**: Prometheus-compatible
- **Alerts**: Queue size, worker health, error rate

## ✅ Success Criteria

### Performance
- [ ] Gateway p95 latency < 200ms
- [ ] Worker p95 completion < 15s
- [ ] End-to-end p95 < 20s
- [ ] Timeout rate < 0.1%

### Reliability
- [ ] Uptime > 99.9%
- [ ] Error rate < 1%
- [ ] Successful rollback in < 5min

### User Experience
- [ ] User satisfaction > 4.5/5
- [ ] Support tickets < 5/week
- [ ] Zero data loss incidents

### Cost
- [ ] Monthly cost < $10
- [ ] 65% cost reduction achieved

## 🚀 Next Steps

1. **Review** all documentation
2. **Approve** requirements and design
3. **Start** Phase 1: Infrastructure & Database
4. **Monitor** progress via tasks.md
5. **Deploy** gradually with feature flags
6. **Celebrate** successful migration! 🎉

---

## 📁 File Structure

```
.kiro/specs/vps-ai-worker-migration/
├── README.md                    # This file
├── requirements.md              # Business requirements
├── design.md                    # Technical design
└── tasks.md                     # Implementation tasks

docs/
├── VPS_WORKER_MIGRATION_EXECUTIVE_SUMMARY.md
└── CURRENT_ARCHITECTURE_REPORT.md

scripts/
└── vps-worker-migration-toolkit.sh

vps-backend/src/ai-worker/       # To be created
├── index.ts                     # Main worker
├── handlers/                    # Job type handlers
├── clients/                     # External service clients
└── utils/                       # Utilities

supabase/functions/
├── enqueue-analysis/            # To be created
├── get-analysis-status/         # To be created
└── [existing functions]/        # To be refactored

src/hooks/
└── useAsyncAnalysis.ts          # To be created

src/components/
└── [14 components]/             # To be migrated
```

---

**Last Updated**: 2026-01-17  
**Status**: Ready for Implementation  
**Version**: 1.0.0
