import React, { useState, useEffect } from 'react';
import { CustomerProfile, GhostRecord, DatabaseConnectorConfig, CloudStorageConnectorConfig } from '../types/audit';
import { 
  Radio, 
  Database, 
  Cloud, 
  Terminal, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  HardDrive,
  Activity,
  Layers
} from 'lucide-react';

interface TopologyRadarProps {
  customer: CustomerProfile;
  ghostRecords: GhostRecord[];
  isScanning: boolean;
  databaseConnectors: DatabaseConnectorConfig[];
  cloudConnectors: CloudStorageConnectorConfig[];
  onTriggerScan: () => void;
  onOpenConnectors: () => void;
}

export const TopologyRadar: React.FC<TopologyRadarProps> = ({
  customer,
  ghostRecords,
  isScanning,
  databaseConnectors,
  cloudConnectors,
  onTriggerScan,
  onOpenConnectors,
}) => {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    `[SYS-INIT] Ghost Data Detector Audit Engine v3.8 initialized.`,
    `[TARGET] Audit subject: ${customer.canonicalName} (${customer.primaryEmail})`,
    `[TARGET] Canonical UUID: ${customer.currentIdentifiers.uuid}`,
    `[INDEX] Loaded 2 current IDs, 2 historical email aliases, 1 maiden name, 1 legacy ERP key.`,
    `[STATUS] Ready. 8 Enterprise Storage & Pipeline Nodes connected.`,
  ]);

  // Append logs when scanning
  useEffect(() => {
    if (isScanning) {
      setConsoleLogs((prev) => [
        ...prev,
        `[SCAN-START] Initiating parallel forensic probe across all 8 storage topologies...`,
        `[SQL] Probing PostgreSQL primary cluster (public.user_audit_events)... MATCH (14 uncascaded rows)`,
        `[NoSQL] Querying MongoDB identity_service.userProfiles for alias '${customer.historicalIdentifiers.previousEmails[0] || customer.primaryEmail}'... MATCH (1 doc)`,
        `[NoSQL] Querying Apache Cassandra telemetry_keyspace partitions... MATCH (8 event partitions)`,
        `[CLOUD] Authenticating with AWS S3 API (corp-cold-backups-eu-west-1)... Scanning tar.gz snapshots`,
        `[CLOUD] AWS S3 Object Lock: COMPLIANCE mode active on 2026-09-01_full_pg_dump.sql.gz (Retention active)`,
        `[CLOUD] Probing Azure Blob ADLS Gen2 clickstream delta... MATCH on legacy key '${customer.historicalIdentifiers.legacyCustomerIds[0] || 'LEGACY'}'`,
        `[STREAM] ⚠️ WARNING: Kafka Dead Letter Queue 'account-lifecycle-dlq' replayed user record on 2026-10-02 (ZOMBIE RECREATION DETECTED)`,
        `[SCAN-COMPLETE] Discovered ${ghostRecords.length} undeleted / recreated ghost instances. AI Root Cause analysis ready.`,
      ]);
    }
  }, [isScanning]);

  const zombieRecords = ghostRecords.filter((r) => r.isZombieRecreated);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Enterprise Storage Topology & Ghost Radar
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                Live Audit Mesh
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time multi-system scanner inspecting SQL tables, NoSQL collections, Cloud Storage buckets, and CDC Kafka streams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConnectors}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Manage Connectors ({databaseConnectors.length + cloudConnectors.length})
          </button>
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            {isScanning ? 'Scanning Mesh...' : 'Rescan All Nodes'}
          </button>
        </div>
      </div>

      {/* Topology Nodes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 my-6">
        
        {/* Node 1: Relational SQL DBs */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              3 Instances
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2">SQL Databases</p>
          <p className="text-[10px] text-slate-400 font-mono">PostgreSQL • MySQL • MSSQL</p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Residual PII:</span>
            <span className="text-rose-400 font-bold font-mono">Detected</span>
          </div>
        </div>

        {/* Node 2: NoSQL Databases */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              2 Clusters
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2">NoSQL Datastores</p>
          <p className="text-[10px] text-slate-400 font-mono">MongoDB • Cassandra</p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Alias Residue:</span>
            <span className="text-rose-400 font-bold font-mono">Detected</span>
          </div>
        </div>

        {/* Node 3: Cloud Storage Buckets */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              3 Buckets
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2">Cloud Storage</p>
          <p className="text-[10px] text-slate-400 font-mono">AWS S3 • Azure • GCS</p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">WORM Lock:</span>
            <span className="text-purple-400 font-bold font-mono">Active (S3)</span>
          </div>
        </div>

        {/* Node 4: Event Streams & CDC */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/40 relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              DLQ Alert
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2">Kafka CDC Streams</p>
          <p className="text-[10px] text-slate-400 font-mono">account-lifecycle-dlq</p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Zombie Status:</span>
            <span className="text-amber-400 font-bold font-mono">Recreated!</span>
          </div>
        </div>

        {/* Node 5: Observability Logs */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Cluster 01
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2">Observability Logs</p>
          <p className="text-[10px] text-slate-400 font-mono">Elasticsearch • Datadog</p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Query URL PII:</span>
            <span className="text-rose-400 font-bold font-mono">Leaked</span>
          </div>
        </div>

      </div>

      {/* Live Auditor Console Stream */}
      <div className="border border-slate-800 rounded-xl bg-slate-950/90 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Audit Agent Console Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-mono text-slate-400">Agent Active</span>
          </div>
        </div>

        <div className="p-3.5 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto text-slate-300">
          {consoleLogs.map((log, idx) => {
            const isWarning = log.includes('WARNING') || log.includes('ZOMBIE');
            const isMatch = log.includes('MATCH');
            const isInfo = log.includes('SYS-INIT') || log.includes('SCAN-START') || log.includes('SCAN-COMPLETE');

            return (
              <p
                key={idx}
                className={`${
                  isWarning
                    ? 'text-amber-300 font-semibold bg-amber-950/30 p-1 rounded'
                    : isMatch
                    ? 'text-rose-300'
                    : isInfo
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {log}
              </p>
            );
          })}
        </div>
      </div>

    </div>
  );
};
