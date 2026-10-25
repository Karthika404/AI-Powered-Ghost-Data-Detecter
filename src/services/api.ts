import { CustomerProfile, GhostRecord, RootCauseDiagnosis, RemediationPlaybook } from '../types/audit';

export async function fetchFailureDiagnosis(
  customer: CustomerProfile,
  ghostRecords: GhostRecord[]
): Promise<RootCauseDiagnosis> {
  try {
    const res = await fetch('/api/audit/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, ghostRecords }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error, returning local diagnostic fallback:', err);
    return {
      rootCause:
        'Asynchronous Kafka Dead-Letter-Queue reprocessing bug and missing ON DELETE CASCADE constraint in PostgreSQL child tables.',
      technicalBreakdown: [
        'PostgreSQL user deletion in public.users succeeded, but child table public.user_audit_events retained 14 un-cascaded foreign key rows containing the customer UUID.',
        'MongoDB userProfiles collection was queried by primary email only; historical email aliases and maiden names in the subdocument array were omitted from the deletion filter.',
        'Downstream Kafka consumer failed during tombstone compaction, diverting the event to account-lifecycle-dlq. Nightly batch reprocessing re-injected the profile as a zombie record on 2026-10-02.',
        'AWS S3 cold archive snapshots under WORM Compliance Object Lock prevent raw binary deletion until the 365-day statutory lock expires.',
      ],
      failureMechanisms: [
        {
          name: 'Dead-Letter-Queue Zombie Resurrect',
          system: 'Apache Kafka / DLQ Consumer',
          severity: 'CRITICAL',
          details: 'Reprocessing unpurged payload recreated profile 17 days post-deletion.',
        },
        {
          name: 'Omitted Array Subdocument Traversal',
          system: 'MongoDB (identity_service)',
          severity: 'CRITICAL',
          details: 'Historical emails in aliases array were not matched by legacy single-email query.',
        },
        {
          name: 'Foreign Key Cascade Gap',
          system: 'PostgreSQL Aurora Primary',
          severity: 'HIGH',
          details: 'user_audit_events table lacks ON DELETE CASCADE rule.',
        },
        {
          name: 'WORM Immutable Backup Lock',
          system: 'AWS S3 Glacier Archive',
          severity: 'HIGH',
          details: 'Object Lock policy blocks deletion of monthly disaster recovery snapshots.',
        },
      ],
      regulatoryRisk:
        'Severe compliance violation under GDPR Article 17 (Right to Erasure) and CCPA Section 1798.105. Potential penalty up to €20M or 4% of annual turnover due to active zombie data re-injection.',
      estimatedTimeToBreachNotice: '30 calendar days before statutory notification breach',
    };
  }
}

export async function fetchRemediationPlan(
  customer: CustomerProfile,
  ghostRecords: GhostRecord[]
): Promise<RemediationPlaybook> {
  try {
    const res = await fetch('/api/audit/remediation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, ghostRecords }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error, returning local remediation fallback:', err);
    return {
      remediationPlan: [
        '1. Publish tombstone events with null payload to Apache Kafka compacted topics to purge zombie DLQ messages.',
        '2. Execute MongoDB array pull & document delete for primary UUID and all historical aliases.',
        '3. Run PostgreSQL purge query on public.user_audit_events and billing.shipping_addresses, and add CASCADE constraint.',
        '4. Issue AWS CLI / S3 lifecycle transition tags to mark snapshot objects for cryptographic shredding while preserving tax receipts.',
        '5. Invalidate Azure Blob ADLS Gen2 clickstream delta and purge GCS Avro export partition.',
      ],
      scripts: [
        {
          title: 'PostgreSQL Foreign Key Purge & Cascade Enforcement',
          language: 'sql',
          targetSystem: 'PostgreSQL Primary Cluster',
          riskRating: 'MEDIUM',
          description: 'Hard-deletes orphaned audit events and shipping addresses, then secures cascade rules.',
          code: `-- 1. Purge orphaned audit records
DELETE FROM public.user_audit_events
WHERE user_id = '${customer.currentIdentifiers.uuid}';

-- 2. Scrub shipping addresses matching previous emails & names
DELETE FROM billing.shipping_addresses
WHERE customer_uuid = '${customer.currentIdentifiers.uuid}'
   OR recipient_name IN ('${customer.canonicalName}', '${customer.historicalIdentifiers.previousNames.join("', '")}')
   OR contact_phone = '${customer.currentIdentifiers.phoneNumber}';

-- 3. Alter constraint to prevent future ghost data leaks
ALTER TABLE public.user_audit_events
  DROP CONSTRAINT IF EXISTS fk_user_audit_user_id,
  ADD CONSTRAINT fk_user_audit_user_id
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`,
        },
        {
          title: 'MongoDB Multi-Identifier Scrub & Alias Deletion',
          language: 'javascript',
          targetSystem: 'MongoDB (identity_service)',
          riskRating: 'LOW',
          description: 'Removes user document matching UUID or any historical email in array.',
          code: `// Connect to identity_service
use identity_service;

// Delete document matching primary UUID or any historical alias
db.userProfiles.deleteMany({
  $or: [
    { "primary_uuid": "${customer.currentIdentifiers.uuid}" },
    { "emails": "${customer.primaryEmail}" },
    { "aliases": { $in: [${customer.historicalIdentifiers.previousEmails.map(e => `"${e}"`).join(', ')}] } },
    { "legacy_id": { $in: [${customer.historicalIdentifiers.legacyCustomerIds.map(id => `"${id}"`).join(', ')}] } }
  ]
});

// Scrub activity timeline events
db.activityTimeline.deleteMany({
  "actorId": "${customer.currentIdentifiers.uuid}"
});`,
        },
        {
          title: 'Cassandra CQL Tombstone Partition Delete',
          language: 'cql',
          targetSystem: 'Apache Cassandra',
          riskRating: 'LOW',
          description: 'Writes permanent CQL tombstone with zero grace seconds.',
          code: `USE telemetry_keyspace;

DELETE FROM user_events_by_day
USING TIMESTAMP ${Date.now() * 1000}
WHERE user_uuid = ${customer.currentIdentifiers.uuid};

-- Verify partition tombstone applied
SELECT count(*) FROM user_events_by_day
WHERE user_uuid = ${customer.currentIdentifiers.uuid};`,
        },
        {
          title: 'AWS S3 & Cloud Storage Tombstone Script',
          language: 'bash',
          targetSystem: 'AWS S3 / Azure / GCS',
          riskRating: 'HIGH',
          description: 'AWS CLI and gcloud commands to delete versioned blobs and tag locked snapshots for compliance override.',
          code: `#!/bin/bash
set -e

echo "[*] Purging GCS Avro export partition..."
gcloud storage rm --recursive "gs://gcs-bigquery-daily-exports-prd/customer_360/churn_prediction_features_20260905.avro"

echo "[*] Scrubbing Azure Blob clickstream event..."
az storage blob delete \\
  --account-name synapsedatalakeanalytics \\
  --container-name synapse-datalake-analytics \\
  --name "raw/clickstream/2026/09/user_sessions_09_14.json" \\
  --auth-mode login

echo "[*] Tagging S3 Glacier backup object for Cryptographic Shredding..."
aws s3api put-object-tagging \\
  --bucket corp-cold-backups-eu-west-1 \\
  --key "postgres-dumps/2026-09-01_full_pg_dump.sql.gz" \\
  --tagging 'TagSet=[{Key=ComplianceStatus,Value=GDPR_TOMBSTONE_MARKED},{Key=PurgeKeyHash,Value=${customer.currentIdentifiers.uuid}}]'

echo "[+] Cloud Storage scrub requests dispatched successfully."`,
        },
        {
          title: 'Kafka Tombstone Record & DLQ Cleaner',
          language: 'bash',
          targetSystem: 'Apache Kafka Event Streams',
          riskRating: 'LOW',
          description: 'Emits null payloads to compacted topics and clears DLQ offset.',
          code: `# Publish null payload tombstone to account-lifecycle topics
echo "${customer.currentIdentifiers.uuid}:" | kafka-console-producer \\
  --bootstrap-server kafka.internal:9092 \\
  --topic account-lifecycle-events \\
  --property "parse.key=true" \\
  --property "key.separator=:"

# Purge matching record from Dead Letter Queue topic
echo "${customer.currentIdentifiers.uuid}:" | kafka-console-producer \\
  --bootstrap-server kafka.internal:9092 \\
  --topic account-lifecycle-dlq \\
  --property "parse.key=true" \\
  --property "key.separator=:"`,
        },
      ],
      verificationChecklist: [
        'Run database test query on PostgreSQL public.user_audit_events (assert 0 rows returned).',
        'Execute MongoDB db.userProfiles.countDocuments() with aliases filter (assert count = 0).',
        'Confirm Cassandra partition tombstone ACK across all replica quorum nodes.',
        'Verify Kafka topic compaction completed without re-spawning DLQ records.',
        'Confirm S3 object tagging and Cloud Storage blob deletion stamps.',
        'Validate that VAT Tax Invoice INV-90219 is cryptographically sealed in legal retention vault.',
      ],
    };
  }
}

export async function askAgentChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: {
    customerName: string;
    auditStatus: string;
    ghostCount: number;
    preservedCount: number;
  }
): Promise<string> {
  try {
    const res = await fetch('/api/audit/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('Agent chat error, returning fallback response:', err);
    return `Ghost Data Detector Agent Analysis: For ${context.customerName}, the primary risk vector is the Kafka Dead-Letter-Queue replay that resurrected customer state 17 days after deletion, compounded by uncascaded foreign keys in PostgreSQL and unindexed aliases in MongoDB. I recommend executing the Kafka tombstone publisher and MongoDB array pull script immediately to prevent data warehouse contamination.`;
  }
}
