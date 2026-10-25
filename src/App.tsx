import React, { useState, useEffect } from 'react';
import { CustomerProfile, GhostRecord, DatabaseConnectorConfig, CloudStorageConnectorConfig, RootCauseDiagnosis, RemediationPlaybook } from './types/audit';
import { SAMPLE_CUSTOMERS, SAMPLE_GHOST_RECORDS, SAMPLE_LEGAL_EXEMPTIONS } from './data/sampleAudits';
import { INITIAL_DATABASE_CONNECTORS, INITIAL_CLOUD_STORAGE_CONNECTORS } from './data/mockConnectors';
import { fetchFailureDiagnosis, fetchRemediationPlan } from './services/api';

import { Header } from './components/Header';
import { ConnectorHubModal } from './components/ConnectorHubModal';
import { TopologyRadar } from './components/TopologyRadar';
import { IdentifierTracker } from './components/IdentifierTracker';
import { DatabaseQueryInspector } from './components/DatabaseQueryInspector';
import { CloudStorageInspector } from './components/CloudStorageInspector';
import { GhostRecordsTable } from './components/GhostRecordsTable';
import { RootCauseDiagnosisView } from './components/RootCauseDiagnosis';
import { RemediationPlaybookView } from './components/RemediationPlaybook';
import { LegalVault } from './components/LegalVault';
import { VerificationReportModal } from './components/VerificationReportModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { NewCustomerModal } from './components/NewCustomerModal';
import { BatchAuditViewer } from './components/BatchAuditViewer';
import { FileSpreadsheet } from 'lucide-react';

import { 
  Radio, 
  Fingerprint, 
  Database, 
  Cloud, 
  AlertTriangle, 
  Activity, 
  Wrench, 
  Scale, 
  Bot, 
  ShieldCheck,
  CheckCircle2,
  Zap,
  Sparkles
} from 'lucide-react';

export default function App() {
  // State
  const [customers, setCustomers] = useState<CustomerProfile[]>(SAMPLE_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile>(SAMPLE_CUSTOMERS[0]);
  
  // Connectors
  const [databaseConnectors, setDatabaseConnectors] = useState<DatabaseConnectorConfig[]>(INITIAL_DATABASE_CONNECTORS);
  const [cloudConnectors, setCloudConnectors] = useState<CloudStorageConnectorConfig[]>(INITIAL_CLOUD_STORAGE_CONNECTORS);

  // Active Ghost Records for current customer
  const [ghostRecords, setGhostRecords] = useState<GhostRecord[]>(
    SAMPLE_GHOST_RECORDS[currentCustomer.id] || []
  );

  // Modals & Drawers
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<
    'BATCH_AUDIT' | 'TOPOLOGY' | 'IDENTIFIERS' | 'DB_INSPECTOR' | 'CLOUD_INSPECTOR' | 'GHOST_DATA' | 'ROOT_CAUSE' | 'REMEDIATION' | 'LEGAL_VAULT'
  >('BATCH_AUDIT');

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [complianceScore, setComplianceScore] = useState(42);
  const [isRemediated, setIsRemediated] = useState(false);

  // AI Diagnostic & Remediation States
  const [diagnosis, setDiagnosis] = useState<RootCauseDiagnosis | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [playbook, setPlaybook] = useState<RemediationPlaybook | null>(null);
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);

  // Load Customer Data when changed
  useEffect(() => {
    const records = SAMPLE_GHOST_RECORDS[currentCustomer.id] || [];
    setGhostRecords(records);
    setIsRemediated(false);
    setComplianceScore(records.length === 0 ? 100 : 42);
    
    // Automatically trigger initial AI diagnosis and remediation synthesis
    loadAiDiagnostics(currentCustomer, records);
  }, [currentCustomer]);

  const loadAiDiagnostics = async (cust: CustomerProfile, records: GhostRecord[]) => {
    setIsDiagnosing(true);
    setIsGeneratingPlaybook(true);
    try {
      const [diag, play] = await Promise.all([
        fetchFailureDiagnosis(cust, records),
        fetchRemediationPlan(cust, records),
      ]);
      setDiagnosis(diag);
      setPlaybook(play);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiagnosing(false);
      setIsGeneratingPlaybook(false);
    }
  };

  // Full Forensic Scan Trigger
  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      loadAiDiagnostics(currentCustomer, ghostRecords);
    }, 1200);
  };

  // Confirm Single Location Deletion / Purge from Inspector
  const handleConfirmLocationDeletion = (systemId: string, location: string) => {
    setGhostRecords((prev) =>
      prev.map((r) =>
        r.systemId === systemId || r.location.includes(location)
          ? { ...r, remediationStatus: 'PURGED' }
          : r
      )
    );
  };

  // Execute Automated Remediation
  const handleExecuteRemediation = () => {
    setGhostRecords((prev) =>
      prev.map((r) => ({ ...r, remediationStatus: 'PURGED' }))
    );
    // Mark database tables as clean
    setDatabaseConnectors((prev) =>
      prev.map((db) => ({
        ...db,
        tablesOrCollections: db.tablesOrCollections.map((t) => ({
          ...t,
          containsGhost: false,
          ghostCount: 0,
        })),
      }))
    );
    // Mark cloud objects as clean
    setCloudConnectors((prev) =>
      prev.map((cloud) => ({
        ...cloud,
        objects: cloud.objects.map((o) => ({
          ...o,
          containsGhost: false,
        })),
      }))
    );
    setIsRemediated(true);
    setComplianceScore(98);
  };

  // Add Historical Alias
  const handleAddHistoricalAlias = (type: 'email' | 'name' | 'phone' | 'legacyId', value: string) => {
    setCurrentCustomer((prev) => {
      const hist = { ...prev.historicalIdentifiers };
      if (type === 'email') hist.previousEmails = [...hist.previousEmails, value];
      if (type === 'name') hist.previousNames = [...hist.previousNames, value];
      if (type === 'phone') hist.previousPhones = [...hist.previousPhones, value];
      if (type === 'legacyId') hist.legacyCustomerIds = [...hist.legacyCustomerIds, value];
      return { ...prev, historicalIdentifiers: hist };
    });
    handleTriggerScan();
  };

  // Register New Customer
  const handleCreateCustomer = (newCustomer: CustomerProfile) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setCurrentCustomer(newCustomer);
    SAMPLE_GHOST_RECORDS[newCustomer.id] = [
      {
        id: `ghost-${Date.now()}-1`,
        systemId: 'db-postgres-prod',
        systemName: 'PostgreSQL Primary Cluster (Aurora)',
        category: 'SQL_DATABASE',
        engineOrProvider: 'POSTGRESQL',
        location: 'public.user_audit_events',
        matchedIdentifier: newCustomer.currentIdentifiers.uuid,
        identifierType: 'USER_UUID',
        matchedField: 'user_id',
        severity: 'HIGH',
        dataSnippet: `SELECT * FROM public.user_audit_events WHERE user_id = '${newCustomer.currentIdentifiers.uuid}'; -- 4 unpurged rows found.`,
        storageType: 'Relational Child Table',
        detectedAt: new Date().toISOString(),
        isZombieRecreated: false,
        remediationStatus: 'UNRESOLVED',
      },
    ];
  };

  // Select Case from CSV Batch Audit
  const handleSelectCaseFromBatch = (caseItem: any) => {
    const newCust: CustomerProfile = {
      id: `cust-${caseItem.caseId}`,
      canonicalName: caseItem.email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase(),
      primaryEmail: caseItem.email,
      creationDate: caseItem.requestedAt,
      deletionRequest: {
        ticketId: caseItem.caseId,
        requestedAt: caseItem.requestedAt,
        regulation: 'GDPR Article 17',
        markedDeletedAt: caseItem.reportedAt,
        status: 'MARKED_DELETED',
        daysElapsed: Math.floor((Date.now() - new Date(caseItem.requestedAt).getTime()) / 86400000),
        authorizedDPO: 'Lead Privacy Officer',
      },
      currentIdentifiers: {
        uuid: `usr_${caseItem.caseId}_${caseItem.email.substring(0, 4)}`,
        accountNumber: `ACC-${caseItem.caseId.toUpperCase()}`,
        email: caseItem.email,
        phoneNumber: '+1 (555) 019-9021',
        billingCustomerId: `cus_${caseItem.caseId}`,
      },
      historicalIdentifiers: {
        previousEmails: [caseItem.email.replace('@', '.alt@')],
        previousNames: [],
        previousPhones: [],
        legacyCustomerIds: [`LEGACY-${caseItem.caseId.toUpperCase()}`],
        hashedTokens: ['e99a18c428cb38d5f260853678922e03'],
        deviceFingerprints: ['fp_browser_hash_01'],
      },
    };
    setCurrentCustomer(newCust);
    if (!customers.some((c) => c.id === newCust.id)) {
      setCustomers((prev) => [newCust, ...prev]);
    }
    setActiveTab('TOPOLOGY');
  };

  const exemptions = SAMPLE_LEGAL_EXEMPTIONS[currentCustomer.id] || SAMPLE_LEGAL_EXEMPTIONS['cust-sarah-jenkins'];
  const unresolvedGhosts = ghostRecords.filter((r) => r.remediationStatus === 'UNRESOLVED');
  const zombieCount = ghostRecords.filter((r) => r.isZombieRecreated && r.remediationStatus === 'UNRESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        currentCustomer={currentCustomer}
        allCustomers={customers}
        onSelectCustomer={(c) => setCurrentCustomer(c)}
        onOpenConnectors={() => setIsConnectorsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        ghostCount={unresolvedGhosts.length}
        zombieCount={zombieCount}
        complianceScore={complianceScore}
        onNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
      />

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/40 backdrop-blur sticky top-[109px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-none">
            
            {/* Tab 0: CSV Batch Audit (518 Cases) */}
            <button
              onClick={() => setActiveTab('BATCH_AUDIT')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'BATCH_AUDIT'
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span>CSV Batch Audit</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                518 Cases
              </span>
            </button>

            {/* Tab 1: Topology Radar */}
            <button
              onClick={() => setActiveTab('TOPOLOGY')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'TOPOLOGY'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Topology Radar</span>
            </button>

            {/* Tab 2: Identifier Lineage */}
            <button
              onClick={() => setActiveTab('IDENTIFIERS')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'IDENTIFIERS'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Customer Identifiers</span>
            </button>

            {/* Tab 3: SQL & NoSQL Query Engine */}
            <button
              onClick={() => setActiveTab('DB_INSPECTOR')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'DB_INSPECTOR'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL & NoSQL Query</span>
            </button>

            {/* Tab 4: Cloud Storage APIs */}
            <button
              onClick={() => setActiveTab('CLOUD_INSPECTOR')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'CLOUD_INSPECTOR'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud Storage APIs</span>
            </button>

            {/* Tab 5: Ghost Data Detective */}
            <button
              onClick={() => setActiveTab('GHOST_DATA')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'GHOST_DATA'
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Detected Ghost Data ({unresolvedGhosts.length})</span>
            </button>

            {/* Tab 6: Root Cause Diagnosis */}
            <button
              onClick={() => setActiveTab('ROOT_CAUSE')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ROOT_CAUSE'
                  ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              <span>AI Failure Diagnosis</span>
            </button>

            {/* Tab 7: Remediation Playbook */}
            <button
              onClick={() => setActiveTab('REMEDIATION')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'REMEDIATION'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Remediation Playbook</span>
            </button>

            {/* Tab 8: Legal Vault */}
            <button
              onClick={() => setActiveTab('LEGAL_VAULT')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'LEGAL_VAULT'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>Legal Retention Vault</span>
            </button>

          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Render Tab Contents */}
        {activeTab === 'BATCH_AUDIT' && (
          <BatchAuditViewer onSelectCaseForDeepAudit={handleSelectCaseFromBatch} />
        )}

        {activeTab === 'TOPOLOGY' && (
          <TopologyRadar
            customer={currentCustomer}
            ghostRecords={ghostRecords}
            isScanning={isScanning}
            databaseConnectors={databaseConnectors}
            cloudConnectors={cloudConnectors}
            onTriggerScan={handleTriggerScan}
            onOpenConnectors={() => setIsConnectorsOpen(true)}
          />
        )}

        {activeTab === 'IDENTIFIERS' && (
          <IdentifierTracker
            customer={currentCustomer}
            ghostRecords={ghostRecords}
            onAddHistoricalAlias={handleAddHistoricalAlias}
          />
        )}

        {activeTab === 'DB_INSPECTOR' && (
          <DatabaseQueryInspector
            customer={currentCustomer}
            connectors={databaseConnectors}
            onConfirmDeletion={handleConfirmLocationDeletion}
          />
        )}

        {activeTab === 'CLOUD_INSPECTOR' && (
          <CloudStorageInspector
            customer={currentCustomer}
            connectors={cloudConnectors}
            onConfirmDeletion={handleConfirmLocationDeletion}
          />
        )}

        {activeTab === 'GHOST_DATA' && (
          <GhostRecordsTable
            ghostRecords={ghostRecords}
            onInspectSystem={(rec) => {
              if (rec.category === 'SQL_DATABASE' || rec.category === 'NOSQL_DATABASE') {
                setActiveTab('DB_INSPECTOR');
              } else if (rec.category === 'CLOUD_STORAGE') {
                setActiveTab('CLOUD_INSPECTOR');
              } else {
                setActiveTab('ROOT_CAUSE');
              }
            }}
          />
        )}

        {activeTab === 'ROOT_CAUSE' && (
          <RootCauseDiagnosisView
            customer={currentCustomer}
            ghostRecords={ghostRecords}
            diagnosis={diagnosis}
            isLoading={isDiagnosing}
            onRefreshDiagnosis={() => loadAiDiagnostics(currentCustomer, ghostRecords)}
          />
        )}

        {activeTab === 'REMEDIATION' && (
          <RemediationPlaybookView
            customer={currentCustomer}
            ghostRecords={ghostRecords}
            playbook={playbook}
            isLoading={isGeneratingPlaybook}
            onRefreshPlaybook={() => loadAiDiagnostics(currentCustomer, ghostRecords)}
            onExecuteRemediation={handleExecuteRemediation}
            isRemediated={isRemediated}
          />
        )}

        {activeTab === 'LEGAL_VAULT' && (
          <LegalVault
            customer={currentCustomer}
            exemptions={exemptions}
          />
        )}

      </main>

      {/* Floating AI Auditor Assistant Button */}
      <button
        onClick={() => setIsAgentChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-2xl hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-indigo-400/40 transition-all"
      >
        <Bot className="w-5 h-5 text-indigo-200 animate-pulse" />
        <span>Ask AI Privacy Auditor</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      </button>

      {/* Modals & Drawers */}
      <ConnectorHubModal
        isOpen={isConnectorsOpen}
        onClose={() => setIsConnectorsOpen(false)}
        databaseConnectors={databaseConnectors}
        cloudConnectors={cloudConnectors}
        onTestDatabaseConnection={(id) => {
          setDatabaseConnectors((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: 'CONNECTED', lastPingMs: 14 } : c))
          );
        }}
        onTestCloudConnection={(id) => {
          setCloudConnectors((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: 'CONNECTED' } : c))
          );
        }}
        onAddDatabaseConnector={(conn) => setDatabaseConnectors((prev) => [...prev, conn])}
        onAddCloudConnector={(conn) => setCloudConnectors((prev) => [...prev, conn])}
      />

      <VerificationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        customer={currentCustomer}
        ghostRecords={ghostRecords}
        exemptions={exemptions}
        complianceScore={complianceScore}
      />

      <AgentChatDrawer
        isOpen={isAgentChatOpen}
        onClose={() => setIsAgentChatOpen(false)}
        customer={currentCustomer}
        ghostRecords={ghostRecords}
      />

      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onCreateCustomer={handleCreateCustomer}
      />

    </div>
  );
}
