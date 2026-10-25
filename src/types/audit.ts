export type SystemCategory = 
  | 'SQL_DATABASE'
  | 'NOSQL_DATABASE'
  | 'CLOUD_STORAGE'
  | 'EVENT_STREAM'
  | 'LOGGING_OBSERVABILITY'
  | 'CACHE_STORE'
  | 'THIRD_PARTY_SAAS';

export type DatabaseEngine = 'POSTGRESQL' | 'MYSQL' | 'SQL_SERVER' | 'MONGODB' | 'CASSANDRA';

export type CloudStorageProvider = 'AWS_S3' | 'AZURE_BLOB' | 'GOOGLE_CLOUD_STORAGE';

export type DeletionStatus = 
  | 'CONFIRMED_DELETED'
  | 'GHOST_DATA_FOUND'
  | 'ZOMBIE_RECREATED'
  | 'LEGALLY_PRESERVED'
  | 'PENDING_SCAN'
  | 'SCANNING'
  | 'CONNECTION_ERROR';

export type RecordSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Customer Identifiers
export interface CustomerIdentifiers {
  uuid: string;
  accountNumber: string;
  email: string;
  phoneNumber: string;
  billingCustomerId?: string;
}

export interface HistoricalIdentifiers {
  previousEmails: string[];
  previousNames: string[];
  previousPhones: string[];
  legacyCustomerIds: string[];
  hashedTokens: string[];
  deviceFingerprints: string[];
}

export interface CustomerProfile {
  id: string;
  canonicalName: string;
  primaryEmail: string;
  creationDate: string;
  deletionRequest: {
    ticketId: string;
    requestedAt: string;
    regulation: 'GDPR Article 17' | 'CCPA/CPRA' | 'HIPAA' | 'LGPD';
    markedDeletedAt: string;
    status: 'MARKED_DELETED';
    daysElapsed: number;
    authorizedDPO: string;
  };
  currentIdentifiers: CustomerIdentifiers;
  historicalIdentifiers: HistoricalIdentifiers;
}

// Database Connection Config
export interface DatabaseConnectorConfig {
  id: string;
  name: string;
  engine: DatabaseEngine;
  category: 'SQL_DATABASE' | 'NOSQL_DATABASE';
  host: string;
  port: number;
  databaseOrKeyspace: string;
  username: string;
  sslEnabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SCANNING' | 'ERROR';
  lastPingMs: number;
  tablesOrCollections: {
    name: string;
    type: 'TABLE' | 'COLLECTION' | 'VIEW' | 'KEYSPACE_TABLE';
    rowCount: number;
    scannedFields: string[];
    containsGhost: boolean;
    ghostCount: number;
  }[];
}

// Cloud Storage Connection Config
export interface CloudStorageConnectorConfig {
  id: string;
  name: string;
  provider: CloudStorageProvider;
  category: 'CLOUD_STORAGE';
  bucketOrContainer: string;
  region: string;
  authMethod: 'IAM_ROLE' | 'ACCESS_KEY' | 'SAS_TOKEN' | 'SERVICE_ACCOUNT';
  status: 'CONNECTED' | 'DISCONNECTED' | 'SCANNING' | 'ERROR';
  objectCount: number;
  wormLockActive: boolean;
  versioningEnabled: boolean;
  objects: {
    keyOrPath: string;
    sizeBytes: number;
    lastModified: string;
    storageClass: string;
    containsGhost: boolean;
    isVersionedGhost: boolean;
    isWormLocked: boolean;
  }[];
}

// Ghost / Undeleted Data Record
export interface GhostRecord {
  id: string;
  systemId: string;
  systemName: string;
  category: SystemCategory;
  engineOrProvider: DatabaseEngine | CloudStorageProvider | 'KAFKA' | 'ELASTICSEARCH' | 'REDIS' | 'STRIPE';
  location: string; // e.g. "users.user_audit_log", "mongodb.userProfiles", "s3://prod-backups/daily/2026-10-01.sql.gz"
  matchedIdentifier: string;
  identifierType: 'PRIMARY_EMAIL' | 'PREVIOUS_EMAIL' | 'USER_UUID' | 'LEGACY_ID' | 'PHONE' | 'HASHED_TOKEN';
  matchedField: string;
  severity: RecordSeverity;
  dataSnippet: string;
  storageType: string;
  detectedAt: string;
  isZombieRecreated: boolean;
  zombieOrigin?: string;
  remediationStatus: 'UNRESOLVED' | 'PURGED' | 'EXEMPT_PRESERVED';
}

// Failure Root Cause
export interface RootCauseDiagnosis {
  rootCause: string;
  technicalBreakdown: string[];
  failureMechanisms: {
    name: string;
    system: string;
    severity: RecordSeverity;
    details: string;
  }[];
  regulatoryRisk: string;
  estimatedTimeToBreachNotice: string;
}

// Remediation Playbook
export interface RemediationScript {
  title: string;
  language: 'sql' | 'bash' | 'json' | 'python' | 'cql' | 'javascript';
  targetSystem: string;
  code: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
}

export interface RemediationPlaybook {
  remediationPlan: string[];
  scripts: RemediationScript[];
  verificationChecklist: string[];
}

// Statutory Legal Exemption
export interface LegalExemption {
  id: string;
  recordType: string;
  systemLocation: string;
  applicableLaw: string;
  mandatoryRetentionPeriod: string;
  preservationMethod: string;
  permittedAction: string;
  piiToScrub: string[];
  retainedAttributes: string[];
  pseudonymizedToken: string;
  expirationDate: string;
  isLegallyCompliant: boolean;
}

// Audit Verification Certificate
export interface DeletionAuditCertificate {
  certificateId: string;
  customerName: string;
  primaryEmail: string;
  auditDate: string;
  totalSystemsAudited: number;
  totalGhostInstancesDetected: number;
  totalRemediated: number;
  totalLegallyPreserved: number;
  remainingGhostCount: number;
  complianceScore: number;
  overallStatus: 'NON_COMPLIANT_GHOSTS_EXIST' | 'COMPLIANT_PURGED_WITH_EXEMPTIONS' | 'FULLY_CLEAN';
  sha256Seal: string;
  agentSignature: string;
  auditorId: string;
  regulationStandards: string[];
}
