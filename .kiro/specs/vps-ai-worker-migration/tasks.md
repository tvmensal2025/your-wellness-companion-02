# VPS AI Worker Migration - Tasks

## Task Status Legend
- `[ ]` Not started
- `[~]` Queued
- `[-]` In progress
- `[x]` Completed
- `[ ]*` Optional task

---

## Phase 1: Infrastructure & Database (Week 1)

### 1. Database Setup
- [ ] 1.1 Create migration file for analysis_jobs table
  - [ ] 1.1.1 Define table schema with all columns
  - [ ] 1.1.2 Add CHECK constraints for status and type
  - [ ] 1.1.3 Create indexes (status_priority, user_created, type_status)
  - [ ] 1.1.4 Add RLS policies (user read own, service role full access)
  - [ ] 1.1.5 Test migration on local Supabase

- [ ] 1.2 Create migration file for analysis_cache table
  - [ ] 1.2.1 Define table schema
  - [ ] 1.2.2 Create unique index on cache_key
  - [ ] 1.2.3 Create cleanup function for expired cache
  - [ ] 1.2.4 Test migration on local Supabase

- [ ] 1.3 Deploy migrations to production
  - [ ] 1.3.1 Review migration SQL
  - [ ] 1.3.2 Run on staging environment
  - [ ] 1.3.3 Verify tables created correctly
  - [ ] 1.3.4 Run on production
  - [ ] 1.3.5 Verify RLS policies working

### 2. VPS Worker Implementation
- [ ] 2.1 Setup project structure
  - [ ] 2.1.1 Create /vps-backend/src/ai-worker directory
  - [ ] 2.1.2 Initialize package.json with dependencies
  - [ ] 2.1.3 Setup TypeScript configuration
  - [ ] 2.1.4 Create Dockerfile for deployment

- [ ] 2.2 Implement core worker logic
  - [ ] 2.2.1 Create AIWorker class with main loop
  - [ ] 2.2.2 Implement fetchPendingJobs method
  - [ ] 2.2.3 Implement processJob method with error handling
  - [ ] 2.2.4 Implement retry logic with exponential backoff
  - [ ] 2.2.5 Implement stuck job detection (timeout > 5min)

- [ ] 2.3 Implement job type handlers
  - [ ] 2.3.1 Create processSofiaImage handler
  - [ ] 2.3.2 Create processMedicalExam handler
  - [ ] 2.3.3 Create processUnifiedAssistant handler
  - [ ] 2.3.4 Create processMealPlan handler
  - [ ] 2.3.5 Create processWhatsAppMessage handler

- [ ] 2.4 Implement external service clients
  - [ ] 2.4.1 Create YOLO client with retry logic
  - [ ] 2.4.2 Create Ollama client with fallback
  - [ ] 2.4.3 Create Gemini client with rate limiting
  - [ ] 2.4.4 Test all clients with mock data

- [ ] 2.5 Implement caching layer
  - [ ] 2.5.1 Create cache key generation function
  - [ ] 2.5.2 Implement cache lookup before processing
  - [ ] 2.5.3 Implement cache storage after processing
  - [ ] 2.5.4 Implement cache expiration cleanup

- [ ] 2.6 Implement health check endpoints
  - [ ] 2.6.1 Create GET /health endpoint (basic)
  - [ ] 2.6.2 Create GET /health/detailed endpoint
  - [ ] 2.6.3 Create GET /metrics endpoint (Prometheus format)
  - [ ] 2.6.4 Test all health endpoints

### 3. VPS Deployment
- [ ] 3.1 Configure EasyPanel service
  - [ ] 3.1.1 Create new app "ai-worker" in EasyPanel
  - [ ] 3.1.2 Configure environment variables
  - [ ] 3.1.3 Set resource limits (4GB RAM, 2 CPU)
  - [ ] 3.1.4 Configure health check settings

- [ ] 3.2 Deploy worker to VPS
  - [ ] 3.2.1 Build Docker image
  - [ ] 3.2.2 Push to EasyPanel registry
  - [ ] 3.2.3 Deploy and verify startup
  - [ ] 3.2.4 Check logs for errors

- [ ] 3.3 Integration testing
  - [ ] 3.3.1 Manually create test job in database
  - [ ] 3.3.2 Verify worker picks up and processes job
  - [ ] 3.3.3 Verify result saved correctly
  - [ ] 3.3.4 Test retry logic with failing job
  - [ ] 3.3.5 Test cache hit scenario

---

## Phase 2: Gateway Edge Functions (Week 1-2)

### 4. Create Gateway Edge Functions
- [ ] 4.1 Create enqueue-analysis function
  - [ ] 4.1.1 Setup function boilerplate with CORS
  - [ ] 4.1.2 Implement input validation
  - [ ] 4.1.3 Implement cache lookup
  - [ ] 4.1.4 Implement job creation
  - [ ] 4.1.5 Implement 202 response with job_id
  - [ ] 4.1.6 Add error handling and logging
  - [ ] 4.1.7 Test with curl/Postman

- [ ] 4.2 Create get-analysis-status function
  - [ ] 4.2.1 Setup function boilerplate with CORS
  - [ ] 4.2.2 Implement job lookup by ID
  - [ ] 4.2.3 Implement RLS check (user can only see own jobs)
  - [ ] 4.2.4 Return job status and result
  - [ ] 4.2.5 Test with curl/Postman

### 5. Refactor Existing Edge Functions
- [ ] 5.1 Refactor sofia-image-analysis
  - [ ] 5.1.1 Add feature flag check (SOFIA_USE_ASYNC)
  - [ ] 5.1.2 If async: call enqueue-analysis and return 202
  - [ ] 5.1.3 If sync: keep existing logic (fallback)
  - [ ] 5.1.4 Add timeout detection and fallback
  - [ ] 5.1.5 Test both async and sync paths

- [ ] 5.2 Refactor analyze-medical-exam
  - [ ] 5.2.1 Add feature flag check (EXAMS_USE_ASYNC)
  - [ ] 5.2.2 Implement async path with enqueue
  - [ ] 5.2.3 Keep sync path as fallback
  - [ ] 5.2.4 Test both paths

- [ ] 5.3 Refactor unified-ai-assistant
  - [ ] 5.3.1 Add feature flag check (UNIFIED_USE_ASYNC)
  - [ ] 5.3.2 Implement async path
  - [ ] 5.3.3 Keep sync fallback
  - [ ] 5.3.4 Test both paths

- [ ] 5.4 Refactor whatsapp-ai-assistant
  - [ ] 5.4.1 Add feature flag check (WHATSAPP_USE_ASYNC)
  - [ ] 5.4.2 Implement async path
  - [ ] 5.4.3 Keep sync fallback
  - [ ] 5.4.4 Test both paths

- [ ] 5.5 Refactor generate-meal-plan-taco
  - [ ] 5.5.1 Add feature flag check (MEAL_PLAN_USE_ASYNC)
  - [ ] 5.5.2 Implement async path
  - [ ] 5.5.3 Keep sync fallback
  - [ ] 5.5.4 Test both paths

### 6. Deploy Gateway Functions
- [ ] 6.1 Deploy to staging
  - [ ] 6.1.1 Deploy all refactored functions
  - [ ] 6.1.2 Verify feature flags OFF by default
  - [ ] 6.1.3 Test sync path (no regressions)
  - [ ] 6.1.4 Test async path manually

- [ ] 6.2 Deploy to production
  - [ ] 6.2.1 Review all changes
  - [ ] 6.2.2 Deploy with feature flags OFF
  - [ ] 6.2.3 Verify no regressions
  - [ ] 6.2.4 Monitor error rates for 24h

---

## Phase 3: Frontend Integration (Week 2)

### 7. Create useAsyncAnalysis Hook
- [ ] 7.1 Implement core hook logic
  - [ ] 7.1.1 Create hook file with TypeScript types
  - [ ] 7.1.2 Implement feature flag detection
  - [ ] 7.1.3 Implement enqueue function
  - [ ] 7.1.4 Implement polling logic
  - [ ] 7.1.5 Implement cancel function
  - [ ] 7.1.6 Add error handling

- [ ] 7.2 Add Realtime support (optional)
  - [ ] 7.2.1 Subscribe to Postgres changes on analysis_jobs
  - [ ] 7.2.2 Update status when job changes
  - [ ] 7.2.3 Unsubscribe on unmount
  - [ ] 7.2.4 Test Realtime updates

- [ ] 7.3 Write unit tests
  - [ ] 7.3.1 Test enqueue with async enabled
  - [ ] 7.3.2 Test fallback with async disabled
  - [ ] 7.3.3 Test polling logic
  - [ ] 7.3.4 Test cancel function
  - [ ] 7.3.5 Test error handling

### 8. Migrate Frontend Components (POC)
- [ ] 8.1 Migrate QuickPhotoCapture (POC)
  - [ ] 8.1.1 Replace direct function call with useAsyncAnalysis
  - [ ] 8.1.2 Add loading state UI
  - [ ] 8.1.3 Add cancel button
  - [ ] 8.1.4 Add error display
  - [ ] 8.1.5 Test with feature flag OFF (sync)
  - [ ] 8.1.6 Test with feature flag ON (async)

- [ ] 8.2 Migrate FoodAnalysisSystem
  - [ ] 8.2.1 Replace function call with hook
  - [ ] 8.2.2 Update UI for async flow
  - [ ] 8.2.3 Test both sync and async

- [ ] 8.3 Migrate HealthChatBot
  - [ ] 8.3.1 Replace function calls with hook
  - [ ] 8.3.2 Update UI for async flow
  - [ ] 8.3.3 Test both sync and async

- [ ] 8.4 Migrate MedicalDocumentsSection
  - [ ] 8.4.1 Replace analyze-medical-exam call
  - [ ] 8.4.2 Update UI for async flow
  - [ ] 8.4.3 Test both sync and async

- [ ] 8.5 Migrate DrVitalChat
  - [ ] 8.5.1 Replace dr-vital-enhanced call
  - [ ] 8.5.2 Update UI for async flow
  - [ ] 8.5.3 Test both sync and async

- [ ] 8.6 Migrate MealPlanGeneratorModal
  - [ ] 8.6.1 Replace generate-meal-plan-taco call
  - [ ] 8.6.2 Update UI for async flow
  - [ ] 8.6.3 Test both sync and async

### 9. UI/UX Improvements
- [ ] 9.1 Create loading state components
  - [ ] 9.1.1 Create AnalysisLoadingState component
  - [ ] 9.1.2 Add progress indicator
  - [ ] 9.1.3 Add estimated time display
  - [ ] 9.1.4 Add cancel button

- [ ] 9.2 Create error state components
  - [ ] 9.2.1 Create AnalysisErrorState component
  - [ ] 9.2.2 Add retry button
  - [ ] 9.2.3 Add helpful error messages

- [ ] 9.3 Add toast notifications
  - [ ] 9.3.1 "Análise iniciada" on enqueue
  - [ ] 9.3.2 "Análise concluída" on completion
  - [ ] 9.3.3 "Erro na análise" on failure

---

## Phase 4: Testing & Validation (Week 2-3)

### 10. Unit Tests
- [ ] 10.1 Worker unit tests
  - [ ] 10.1.1 Test fetchPendingJobs
  - [ ] 10.1.2 Test processJob
  - [ ] 10.1.3 Test retry logic
  - [ ] 10.1.4 Test stuck job detection
  - [ ] 10.1.5 Test cache logic

- [ ] 10.2 Gateway unit tests
  - [ ] 10.2.1 Test enqueue-analysis validation
  - [ ] 10.2.2 Test cache lookup
  - [ ] 10.2.3 Test job creation
  - [ ] 10.2.4 Test error handling

- [ ] 10.3 Frontend unit tests
  - [ ] 10.3.1 Test useAsyncAnalysis hook
  - [ ] 10.3.2 Test component integration
  - [ ] 10.3.3 Test error scenarios

### 11. Integration Tests
- [ ] 11.1 End-to-end flow tests
  - [ ] 11.1.1 Test sofia_image flow (enqueue → process → complete)
  - [ ] 11.1.2 Test medical_exam flow
  - [ ] 11.1.3 Test unified_assistant flow
  - [ ] 11.1.4 Test meal_plan flow

- [ ] 11.2 Fallback tests
  - [ ] 11.2.1 Test worker offline → sync fallback
  - [ ] 11.2.2 Test timeout → sync fallback
  - [ ] 11.2.3 Test error → retry → fallback

- [ ] 11.3 Cache tests
  - [ ] 11.3.1 Test cache hit (immediate return)
  - [ ] 11.3.2 Test cache miss (process job)
  - [ ] 11.3.3 Test cache expiration

### 12. Load Tests (K6)
- [ ] 12.1 Create K6 test scripts
  - [ ] 12.1.1 Create gateway throughput test
  - [ ] 12.1.2 Create worker throughput test
  - [ ] 12.1.3 Create end-to-end test
  - [ ] 12.1.4 Create stress test

- [ ] 12.2 Run load tests
  - [ ] 12.2.1 Run gateway test (target: 100 req/s, p95 < 200ms)
  - [ ] 12.2.2 Run worker test (target: 5 jobs/s, p95 < 15s)
  - [ ] 12.2.3 Run end-to-end test (target: 50 users, p95 < 20s)
  - [ ] 12.2.4 Run stress test (find breaking point)

- [ ] 12.3 Analyze results
  - [ ] 12.3.1 Document performance metrics
  - [ ] 12.3.2 Identify bottlenecks
  - [ ] 12.3.3 Optimize if needed
  - [ ] 12.3.4 Re-run tests to validate improvements

### 13. Chaos Tests
- [ ] 13.1 Worker failure scenarios
  - [ ] 13.1.1 Kill worker during processing
  - [ ] 13.1.2 Verify job marked as failed
  - [ ] 13.1.3 Verify retry logic works

- [ ] 13.2 Database failure scenarios
  - [ ] 13.2.1 Simulate slow database (> 1s)
  - [ ] 13.2.2 Verify timeout handling
  - [ ] 13.2.3 Verify fallback works

- [ ] 13.3 External service failures
  - [ ] 13.3.1 YOLO offline → verify fallback
  - [ ] 13.3.2 Ollama offline → verify Gemini fallback
  - [ ] 13.3.3 Gemini rate limit → verify retry

---

## Phase 5: Gradual Rollout (Week 3)

### 14. Canary Deployment (10% users)
- [ ] 14.1 Enable feature flags for 10%
  - [ ] 14.1.1 Set VITE_USE_ASYNC_SOFIA=true for 10% users
  - [ ] 14.1.2 Deploy frontend
  - [ ] 14.1.3 Verify async flow working

- [ ] 14.2 Monitor metrics (48 hours)
  - [ ] 14.2.1 Monitor error rate (target: < 1%)
  - [ ] 14.2.2 Monitor latency (target: p95 < 20s)
  - [ ] 14.2.3 Monitor user feedback
  - [ ] 14.2.4 Monitor worker health

- [ ] 14.3 Analyze results
  - [ ] 14.3.1 Compare async vs sync metrics
  - [ ] 14.3.2 Identify any issues
  - [ ] 14.3.3 Fix issues if needed
  - [ ] 14.3.4 Document findings

### 15. Expand to 50% users
- [ ] 15.1 Enable for 50% users
  - [ ] 15.1.1 Update feature flag to 50%
  - [ ] 15.1.2 Deploy frontend
  - [ ] 15.1.3 Verify rollout

- [ ] 15.2 Monitor metrics (48 hours)
  - [ ] 15.2.1 Monitor error rate
  - [ ] 15.2.2 Monitor latency
  - [ ] 15.2.3 Monitor worker load
  - [ ] 15.2.4 Monitor user feedback

- [ ] 15.3 Analyze results
  - [ ] 15.3.1 Compare metrics
  - [ ] 15.3.2 Identify any issues
  - [ ] 15.3.3 Fix issues if needed

### 16. Full Rollout (100% users)
- [ ] 16.1 Enable for all users
  - [ ] 16.1.1 Set all feature flags to true
  - [ ] 16.1.2 Deploy frontend
  - [ ] 16.1.3 Verify rollout

- [ ] 16.2 Monitor metrics (7 days)
  - [ ] 16.2.1 Monitor error rate
  - [ ] 16.2.2 Monitor latency
  - [ ] 16.2.3 Monitor worker health
  - [ ] 16.2.4 Monitor user satisfaction

- [ ] 16.3 Validate success criteria
  - [ ] 16.3.1 Verify timeout rate < 0.1%
  - [ ] 16.3.2 Verify p95 latency < 20s
  - [ ] 16.3.3 Verify user satisfaction > 4.5/5
  - [ ] 16.3.4 Verify cost reduction

---

## Phase 6: Monitoring & Optimization (Week 3-4)

### 17. Setup Monitoring Dashboard
- [ ] 17.1 Create admin dashboard
  - [ ] 17.1.1 Create JobsMonitoringDashboard component
  - [ ] 17.1.2 Display pending/processing/completed/failed counts
  - [ ] 17.1.3 Display queue size and worker status
  - [ ] 17.1.4 Display average processing time by type
  - [ ] 17.1.5 Display error rate and cache hit rate

- [ ] 17.2 Setup alerts
  - [ ] 17.2.1 Alert if queue size > 50
  - [ ] 17.2.2 Alert if worker offline > 5min
  - [ ] 17.2.3 Alert if error rate > 5%
  - [ ] 17.2.4 Alert if p95 latency > 30s

- [ ] 17.3 Setup logging
  - [ ] 17.3.1 Configure structured logging
  - [ ] 17.3.2 Log all job lifecycle events
  - [ ] 17.3.3 Log external service calls
  - [ ] 17.3.4 Setup log aggregation

### 18. Performance Optimization
- [ ] 18.1 Optimize worker concurrency
  - [ ] 18.1.1 Test different concurrency levels (3, 5, 10)
  - [ ] 18.1.2 Measure throughput and latency
  - [ ] 18.1.3 Choose optimal value
  - [ ] 18.1.4 Update configuration

- [ ] 18.2 Optimize cache strategy
  - [ ] 18.2.1 Analyze cache hit rate
  - [ ] 18.2.2 Adjust TTL if needed
  - [ ] 18.2.3 Implement cache warming for common queries
  - [ ] 18.2.4 Measure improvement

- [ ] 18.3 Optimize database queries
  - [ ] 18.3.1 Analyze slow queries
  - [ ] 18.3.2 Add missing indexes if needed
  - [ ] 18.3.3 Optimize job fetching query
  - [ ] 18.3.4 Measure improvement

### 19. Cost Analysis
- [ ] 19.1 Measure actual costs
  - [ ] 19.1.1 Calculate Supabase Edge invocations cost
  - [ ] 19.1.2 Calculate Supabase Edge duration cost
  - [ ] 19.1.3 Calculate VPS cost (already paid)
  - [ ] 19.1.4 Calculate external API costs (Gemini)

- [ ] 19.2 Compare with baseline
  - [ ] 19.2.1 Document cost before migration
  - [ ] 19.2.2 Document cost after migration
  - [ ] 19.2.3 Calculate savings
  - [ ] 19.2.4 Project annual savings

---

## Phase 7: Cleanup & Documentation (Week 4)

### 20. Code Cleanup
- [ ] 20.1 Remove legacy sync code
  - [ ] 20.1.1 Remove old sync logic from Edge Functions
  - [ ] 20.1.2 Remove feature flag checks
  - [ ] 20.1.3 Simplify code paths
  - [ ] 20.1.4 Update tests

- [ ] 20.2 Remove feature flags
  - [ ] 20.2.1 Remove VITE_USE_ASYNC_* env vars
  - [ ] 20.2.2 Remove flag checks from code
  - [ ] 20.2.3 Update documentation

- [ ] 20.3 Code review
  - [ ] 20.3.1 Review all changes
  - [ ] 20.3.2 Ensure code quality
  - [ ] 20.3.3 Ensure test coverage
  - [ ] 20.3.4 Merge to main

### 21. Documentation
- [ ] 21.1 Update architecture docs
  - [ ] 21.1.1 Update ARCHITECTURE.md with new flow
  - [ ] 21.1.2 Create architecture diagram (Mermaid)
  - [ ] 21.1.3 Document all components

- [ ] 21.2 Create API documentation
  - [ ] 21.2.1 Document enqueue-analysis API
  - [ ] 21.2.2 Document get-analysis-status API
  - [ ] 21.2.3 Document worker health endpoints
  - [ ] 21.2.4 Create API examples

- [ ] 21.3 Create deployment guide
  - [ ] 21.3.1 Document VPS deployment steps
  - [ ] 21.3.2 Document environment variables
  - [ ] 21.3.3 Document monitoring setup
  - [ ] 21.3.4 Document troubleshooting

- [ ] 21.4 Create user documentation
  - [ ] 21.4.1 Update FAQ
  - [ ] 21.4.2 Create "How to cancel analysis" guide
  - [ ] 21.4.3 Update status page

### 22. Post-Mortem
- [ ] 22.1 Conduct post-mortem meeting
  - [ ] 22.1.1 What went well?
  - [ ] 22.1.2 What could be improved?
  - [ ] 22.1.3 Lessons learned
  - [ ] 22.1.4 Action items for future

- [ ] 22.2 Document findings
  - [ ] 22.2.1 Write post-mortem document
  - [ ] 22.2.2 Share with team
  - [ ] 22.2.3 Update processes based on learnings

---

## Rollback Tasks (Emergency)

### 23. Emergency Rollback Procedure
- [ ] 23.1 Disable feature flags
  - [ ] 23.1.1 Set all VITE_USE_ASYNC_* to false
  - [ ] 23.1.2 Redeploy frontend immediately
  - [ ] 23.1.3 Verify sync flow working

- [ ] 23.2 Investigate issue
  - [ ] 23.2.1 Check worker logs
  - [ ] 23.2.2 Check database for stuck jobs
  - [ ] 23.2.3 Check external service status
  - [ ] 23.2.4 Identify root cause

- [ ] 23.3 Fix and redeploy
  - [ ] 23.3.1 Fix identified issue
  - [ ] 23.3.2 Test fix locally
  - [ ] 23.3.3 Deploy fix to VPS
  - [ ] 23.3.4 Re-enable feature flags gradually

---

**Total Tasks**: 200+
**Estimated Time**: 3-4 weeks
**Priority**: P0 (Critical for scalability)
**Risk Level**: Medium (mitigated by feature flags and fallback)

**Next Steps**:
1. Review and approve requirements.md
2. Review and approve design.md
3. Start Phase 1: Infrastructure & Database
