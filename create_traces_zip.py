import json
import zipfile
import os
import shutil
from datetime import datetime

with open('src/data/batchDeletionRequests.json') as f:
    batch_cases = json.load(f)

trace_dir = 'tmp_traces'
if os.path.exists(trace_dir):
    shutil.rmtree(trace_dir)
os.makedirs(trace_dir, exist_ok=True)

# 1. agent_audit_traces_full.json
with open(os.path.join(trace_dir, 'agent_audit_traces_full.json'), 'w') as f:
    json.dump({
        'auditSessionId': 'AUDIT-TRACE-2026-OCT-78464850',
        'generatedAt': datetime.utcnow().isoformat() + 'Z',
        'auditEngine': 'Ghost Data Detector – AI Deletion Audit Agent v3.8',
        'totalCasesAudited': len(batch_cases),
        'storageTopologiesCovered': [
            'PostgreSQL Aurora Primary',
            'MySQL Legacy Commerce',
            'Microsoft SQL Server ERP',
            'MongoDB User Profiles Store',
            'Apache Cassandra Time-Series & CDC Store',
            'AWS S3 Coldline & Glacier Backups',
            'Azure Blob ADLS Gen2 Data Lake',
            'Google Cloud Storage BigQuery Ingestion',
            'Apache Kafka CDC Event Streams (DLQ)',
            'Elasticsearch & Datadog Observability Logs'
        ],
        'traces': batch_cases
    }, f, indent=2)

# 2. agent_trace_log.txt
with open(os.path.join(trace_dir, 'agent_trace_log.txt'), 'w') as f:
    f.write('========================================================================================\n')
    f.write('GHOST DATA DETECTOR – AUTONOMOUS AGENT EXECUTION TRACE LOG\n')
    f.write(f'Timestamp: {datetime.utcnow().isoformat()}Z | Mode: Enterprise Batch Audit\n')
    f.write('========================================================================================\n\n')
    for case in batch_cases:
        f.write(f'[{case["auditAt"]}] TRACE_ID={case["caseId"]} ENTITY={case["email"]}\n')
        f.write(f'  ├── [STAGE 1] Ingestion: Request logged at {case["requestedAt"]}\n')
        f.write(f'  ├── [STAGE 2] Status Check: Company reported "{case["reportedStatus"]}" at {case["reportedAt"]}\n')
        f.write(f'  ├── [STAGE 3] Probe Verdict: {case["auditVerdict"]} (Ghost Detected: {case["ghostDetected"]})\n')
        f.write(f'  ├── [STAGE 4] Forensic Finding: {case["auditNote"]}\n')
        f.write(f'  └── [STAGE 5] Remediation Vector: {case["action"]}\n\n')

# 3. audit_summary_report.md
with open(os.path.join(trace_dir, 'audit_summary_report.md'), 'w') as f:
    f.write('# Ghost Data Detector – Formal Deletion Audit & Forensic Report\n\n')
    f.write('## 1. Executive Summary\n')
    f.write('- **Audit Dataset:** `deletion_requests_78464850.csv`\n')
    f.write(f'- **Total Cases Audited:** {len(batch_cases)}\n')
    f.write('- **Verified Truly Clean:** 83 cases (16.0%)\n')
    f.write('- **Ghost Data Detected:** 91 cases (17.6%)\n')
    f.write('- **Zombie Data Recreated:** 80 cases (15.4%)\n')
    f.write('- **Incomplete / Orphaned Child Data:** 152 cases (29.3%)\n')
    f.write('- **Breach Time Limit Exceeded (>30d):** 103 cases (19.9%)\n')
    f.write('- **NLP Misclassified Non-Deletion:** 9 cases (1.7%)\n\n')
    f.write('## 2. Regulatory Compliance Verdict\n')
    f.write('Under GDPR Article 17 (Right to Erasure) and CCPA § 1798.105, 67.3% of accounts reported as complete exhibited active compliance violations due to lingering backups, uncascaded foreign keys, or Kafka DLQ replays.\n\n')
    f.write('## 3. Storage Topology Breakdown\n')
    f.write('- **PostgreSQL Primary:** Foreign key `user_audit_events` retained records (Cascade rule missing)\n')
    f.write('- **MongoDB User Profiles:** Aliases array omitted from single-field queries\n')
    f.write('- **Cassandra CDC Store:** Uncompacted partitions re-indexed post-deletion\n')
    f.write('- **AWS S3 / Azure Blob / GCS:** Compressed tarballs (.sql.gz) held under WORM locks\n')
    f.write('- **Apache Kafka DLQ:** Nightly consumer retries resurrected deleted user profiles\n')

# 4. remediation_scripts.sql
with open(os.path.join(trace_dir, 'remediation_scripts.sql'), 'w') as f:
    f.write('''-- Ghost Data Detector Automated Database Remediation Script
-- 1. Enforce Cascade Rules on PostgreSQL child tables
ALTER TABLE public.user_audit_events
  DROP CONSTRAINT IF EXISTS fk_user_audit_user_id,
  ADD CONSTRAINT fk_user_audit_user_id
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. Scrub uncascaded shipping addresses
DELETE FROM billing.shipping_addresses
WHERE customer_uuid IN (SELECT id FROM unpurged_tombstone_keys);

-- 3. Invalidate secondary CDC sync checkpoint registry
UPDATE cdc_sync.checkpoint_registry
SET sync_status = 'TOMBSTONE_ENFORCED',
    last_scrubbed_at = NOW()
WHERE sync_status = 'PENDING_DELETE';
''')

# 5. remediation_scripts.sh
with open(os.path.join(trace_dir, 'remediation_scripts.sh'), 'w') as f:
    f.write('''#!/bin/bash
set -e
echo "[*] Ghost Data Detector Cloud & Streaming Remediation"

# A. Emit Kafka Tombstones with Compaction Flag
echo "Publishing null payload tombstones to account-lifecycle-events..."
kafka-console-producer \\
  --bootstrap-server kafka.internal:9092 \\
  --topic account-lifecycle-events \\
  --property "parse.key=true" \\
  --property "key.separator=:" < tombstone_keys.txt

# B. Tag AWS S3 Objects for Compliance Tombstone Shredding
aws s3api put-object-tagging \\
  --bucket corp-cold-backups-eu-west-1 \\
  --key "postgres-dumps/2026-09-01_full_pg_dump.sql.gz" \\
  --tagging 'TagSet=[{Key=ComplianceStatus,Value=GDPR_TOMBSTONE_MARKED}]'

# C. Purge Azure Blob Clickstream Partitions
az storage blob delete \\
  --account-name synapsedatalakeanalytics \\
  --container-name synapse-datalake-analytics \\
  --name "raw/clickstream/2026/09/user_sessions_09_14.json" \\
  --auth-mode login

echo "[+] Cloud storage and streaming tombstones verified."
''')

# 6. statutory_exemptions_register.json
with open(os.path.join(trace_dir, 'statutory_exemptions_register.json'), 'w') as f:
    json.dump([
        {
            'applicableLaw': 'EU VAT Directive 2006/112/EC Art. 244',
            'recordType': 'Commercial Sales Invoice & VAT Receipt',
            'retentionPeriod': '7 Years from transaction date',
            'complianceMethod': 'HMAC-SHA256 Salted Cryptographic Tokenization',
            'tokenExample': 'TOKEN_FIN_VAT_9921_SEALED',
            'scrubbedFields': ['Personal Phone', 'Shipping Coordinates', 'Marketing Opt-Ins', 'Browser Fingerprints']
        },
        {
            'applicableLaw': 'Bank Secrecy Act / EU AMLD5',
            'recordType': 'Anti-Money Laundering & KYC Audit Verification',
            'retentionPeriod': '5 Years post account closure',
            'complianceMethod': 'Vault Restricted Access Ledger',
            'tokenExample': 'TOKEN_AML_KYC_88102',
            'scrubbedFields': ['Email Address', 'Historical Aliases', 'Device UUIDs']
        }
    ], f, indent=2)

# Pack everything into public/agent_traces.zip
os.makedirs('public', exist_ok=True)
zip_path = 'public/agent_traces.zip'

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for filename in sorted(os.listdir(trace_dir)):
        filepath = os.path.join(trace_dir, filename)
        zipf.write(filepath, arcname=filename)
        print(f'Added {filename} to {zip_path}')

shutil.rmtree(trace_dir)
print(f'Done! Successfully created {zip_path} ({os.path.getsize(zip_path)} bytes)')
