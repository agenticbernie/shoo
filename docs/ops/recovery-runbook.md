# Shoo Recovery Runbook

## Incident Classification

| Severity | Definition | Response Time | Example |
|----------|-----------|---------------|---------|
| **P0** | Complete service outage, data loss risk | < 15 min | PostgreSQL unavailable, all API 500s |
| **P1** | Major feature degradation, partial data loss | < 1 hr | MemWal/Walrus down, worker stalled |
| **P2** | Minor feature degradation, no data loss | < 4 hr | Auth provider latency, slow backups |
| **P3** | Cosmetic, non-user-facing issues | < 1 week | Stale metrics, minor log noise |

## Recovery Procedures

### PostgreSQL Outage

1. **Detect**: API returns 500 with `database_error`; health check fails
2. **Verify**: Check `pg_isready`, `systemctl status postgresql`, PostgreSQL logs
3. **Failover** (replica exists):
   - Promote replica: `pg_ctl promote -D /var/lib/postgresql/data_replica`
   - Update connection string in environment variables
   - Restart API and worker: `systemctl restart shoo-api shoo-worker`
4. **Restore from backup** (no replica):
   - Identify latest backup via `GET /v1/projects/{projectId}/backups`
   - Restore cluster from `pg_dump` or WAL archival
   - Replay WAL up to last known commit
5. **Verify**: Confirm `/v1/health` returns healthy, run `SELECT count(*)` on critical tables
6. **Post-mortem**: Determine cause (disk full, OOM, config change, network)

### MemWal / Walrus Outage

1. **Detect**: Worker logs `memwal connection failed`; `healthCheck()` returns `ok: false`
2. **Impact**: Durable persistence degraded; operational sync continues
3. **Recovery**:
   - Check MemWal relayer endpoint: `curl <relayerUrl>/health`
   - Verify wallet signer configuration
   - Restart worker: `systemctl restart shoo-worker`
   - Dead-letter jobs will reconcile automatically (every 6 poll cycles)
4. **Fallback**: Outbox jobs queue in PostgreSQL; no data loss
5. **Verify**: Worker log shows `durable.confirmed` metrics

### Worker Failure

1. **Detect**: Alert on `worker.job.completed` dropping to zero; stalled outbox jobs
2. **Diagnose**:
   - Check worker logs: `journalctl -u shoo-worker -n 100`
   - Verify PostgreSQL connectivity from worker host
   - Check for OOM: `dmesg | grep -i oom`
3. **Recovery**:
   - Restart worker: `systemctl restart shoo-worker`
   - If crash-looping, disable SIGINT handler: `node --no-handle-sigint dist/worker.js`
   - Reconcile dead letters: manual `UPDATE outbox_jobs SET status = 'pending' WHERE status = 'dead_letter'`
4. **Verify**: Monitor `worker.poll.completed` metric; check `outbox_jobs` pending count drops

### Data Corruption

1. **Detect**: Checksum mismatch errors; application `SELECT` returns invalid data
2. **Diagnose**:
   - Run `SELECT * FROM platform.backups ORDER BY created_at DESC LIMIT 5` to find valid backups
   - Verify backup checksums: recalculate SHA-256 of snapshot JSONB
3. **Restore from backup**:
   ```
   POST /v1/projects/{projectId}/backups/{backupId}/restore
   ```
   - The restore endpoint validates checksum automatically
   - Runs DELETE + INSERT in a single transaction per table
   - If restore fails, try the next oldest backup
4. **Verify**: Run pulse endpoint, check `continuity_health` field
5. **Escalation**: If all backups are corrupted, contact engineering for manual recovery

### Auth Provider Outage

1. **Detect**: API returns 401/500 on `/v1/me`, `/v1/auth/sign-in`
2. **Impact**: All authenticated endpoints unavailable; unauthenticated health check succeeds
3. **Fallback**: No auth bypass supported. Notify users of maintenance.
4. **Recovery**:
   - Check Clerk status page: https://status.clerk.com
   - Verify `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` are valid
   - Rotate keys if compromised: `shoo config set clerk.secretKey <new-key>`
5. **Verify**: Sign in with test credentials

## Restore from Backup (Step-by-Step)

### Prerequisites
- Valid backup ID (from `GET /v1/projects/{projectId}/backups`)
- API access with authentication token

### Procedure

1. **List available backups**:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     https://api.shoo.dev/v1/projects/$PROJECT_ID/backups
   ```

2. **Select backup** and initiate restore:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     https://api.shoo.dev/v1/projects/$PROJECT_ID/backups/$BACKUP_ID/restore
   ```

3. **Validate restore**:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     https://api.shoo.dev/v1/projects/$PROJECT_ID/pulse
   ```

4. **If restore fails**:
   - Backup checksum validation failed → backup may be corrupted; try an older backup
   - Transaction error → check PostgreSQL logs; ensure no concurrent operations
   - Partial restore → run restore again; the DELETE+INSERT pattern is idempotent

### Manual SQL Restore

If the API is unavailable:

```sql
BEGIN;
-- Restore each table from backup snapshot
INSERT INTO work_units SELECT * FROM jsonb_populate_recordset(NULL::work_units, $snapshot->'work_units');
INSERT INTO sessions SELECT * FROM jsonb_populate_recordset(NULL::sessions, $snapshot->'sessions');
-- ... repeat for all tables
COMMIT;
```

## Key-Loss Recovery

### Scenario: Wallet Signer Key Lost

1. **Impact**: Cannot create new durable operations; existing blobs still readable
2. **Recovery**:
   - Call `memwalAdapter.initiateKeyRecovery(accountId, newPublicKey)`
   - This returns a `recoveryId` and `recoveryWindow` (default 24h)
   - The old key remains valid for reading until the recovery window expires
   - Generate a new wallet key: `shoo config set memwal.walletSigner <new-key>`
3. **Verification**:
   - Confirm recovery status: `GET /v1/health` (includes memwal status)
   - Test durable persist with new key
4. **Post-recovery**: Revoke all delegates associated with old key

### Scenario: API Token / Clerk Key Compromised

1. Immediately rotate Clerk secret key
2. Revoke all active sessions
3. Revoke all delegates:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     https://api.shoo.dev/v1/projects/$PROJECT_ID/delegates/$DELEGATE_ID/revoke
   ```
4. Issue new tokens to verified users

## Emergency Contact and Escalation Path

| Role | Contact | Response Time |
|------|---------|---------------|
| On-call Engineer | #on-call in Slack | < 15 min |
| Engineering Lead | @eng-lead in Slack | < 30 min |
| Database Admin | @dba in Slack | < 1 hr |
| Security Officer | @security in Slack | < 1 hr |

### Escalation Flow

```
P0 → On-call Engineer (immediate)
  ↓ (if unresolved after 15 min)
Engineering Lead
  ↓ (if unresolved after 30 min)
VP Engineering
  ↓ (if P0 or security-related)
Security Officer + CEO
```

## Post-Incident Review Template

```markdown
### Incident Summary
- **Date**: YYYY-MM-DD
- **Severity**: P0/P1/P2/P3
- **Duration**: XX minutes
- **Detection**: [monitoring alert / user report / manual]
- **Response**: [who responded, time to respond]

### Root Cause
[What caused the incident]

### Impact
- Users affected: [number or percentage]
- Data loss: [none / partial / full]
- Downtime: [duration]

### Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Incident detected |
| HH:MM | Response started |
| HH:MM | Mitigation applied |
| HH:MM | Service restored |

### Action Items
- [ ] Fix: [permanent fix description] — Owner: @name
- [ ] Monitor: [additional alerting] — Owner: @name
- [ ] Test: [runbook test / DR drill] — Owner: @name

### Lessons Learned
[What went well, what could be improved]
```
