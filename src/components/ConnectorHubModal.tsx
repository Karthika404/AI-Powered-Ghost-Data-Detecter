import React, { useState } from 'react';
import { DatabaseConnectorConfig, CloudStorageConnectorConfig, DatabaseEngine, CloudStorageProvider } from '../types/audit';
import { 
  X, 
  Database, 
  Cloud, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Layers, 
  FileText,
  KeyRound,
  ExternalLink,
  Table
} from 'lucide-react';

interface ConnectorHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseConnectors: DatabaseConnectorConfig[];
  cloudConnectors: CloudStorageConnectorConfig[];
  onTestDatabaseConnection: (id: string) => void;
  onTestCloudConnection: (id: string) => void;
  onAddDatabaseConnector: (connector: DatabaseConnectorConfig) => void;
  onAddCloudConnector: (connector: CloudStorageConnectorConfig) => void;
}

export const ConnectorHubModal: React.FC<ConnectorHubModalProps> = ({
  isOpen,
  onClose,
  databaseConnectors,
  cloudConnectors,
  onTestDatabaseConnection,
  onTestCloudConnection,
  onAddDatabaseConnector,
  onAddCloudConnector,
}) => {
  const [activeTab, setActiveTab] = useState<'DATABASES' | 'CLOUD_STORAGE' | 'NEW_CONNECTOR'>('DATABASES');
  const [selectedDb, setSelectedDb] = useState<DatabaseConnectorConfig | null>(databaseConnectors[0] || null);
  const [selectedCloud, setSelectedCloud] = useState<CloudStorageConnectorConfig | null>(cloudConnectors[0] || null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // New Connector Form State
  const [newType, setNewType] = useState<'DATABASE' | 'CLOUD'>('DATABASE');
  const [newDbEngine, setNewDbEngine] = useState<DatabaseEngine>('POSTGRESQL');
  const [newCloudProvider, setNewCloudProvider] = useState<CloudStorageProvider>('AWS_S3');
  const [newName, setNewName] = useState('');
  const [newHost, setNewHost] = useState('');
  const [newPort, setNewPort] = useState(5432);
  const [newDatabase, setNewDatabase] = useState('');
  const [newBucket, setNewBucket] = useState('');
  const [newRegion, setNewRegion] = useState('us-east-1');

  if (!isOpen) return null;

  const handleTestDb = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      onTestDatabaseConnection(id);
      setTestingId(null);
    }, 600);
  };

  const handleTestCloud = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      onTestCloudConnection(id);
      setTestingId(null);
    }, 600);
  };

  const handleCreateConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (newType === 'DATABASE') {
      const isSql = ['POSTGRESQL', 'MYSQL', 'SQL_SERVER'].includes(newDbEngine);
      const newConnector: DatabaseConnectorConfig = {
        id: `db-${Date.now()}`,
        name: newName || `${newDbEngine} Cluster`,
        engine: newDbEngine,
        category: isSql ? 'SQL_DATABASE' : 'NOSQL_DATABASE',
        host: newHost || 'localhost',
        port: newPort,
        databaseOrKeyspace: newDatabase || 'prod_db',
        username: 'audit_agent_user',
        sslEnabled: true,
        status: 'CONNECTED',
        lastPingMs: Math.floor(Math.random() * 25) + 10,
        tablesOrCollections: [
          {
            name: isSql ? 'users' : 'userProfiles',
            type: isSql ? 'TABLE' : 'COLLECTION',
            rowCount: 120000,
            scannedFields: ['id', 'email', 'phone'],
            containsGhost: false,
            ghostCount: 0,
          },
        ],
      };
      onAddDatabaseConnector(newConnector);
      setSelectedDb(newConnector);
      setActiveTab('DATABASES');
    } else {
      const newCloud: CloudStorageConnectorConfig = {
        id: `storage-${Date.now()}`,
        name: newName || `${newCloudProvider} Storage`,
        provider: newCloudProvider,
        category: 'CLOUD_STORAGE',
        bucketOrContainer: newBucket || 'prod-backup-bucket',
        region: newRegion,
        authMethod: newCloudProvider === 'AWS_S3' ? 'IAM_ROLE' : newCloudProvider === 'AZURE_BLOB' ? 'SAS_TOKEN' : 'SERVICE_ACCOUNT',
        status: 'CONNECTED',
        objectCount: 1540,
        wormLockActive: false,
        versioningEnabled: true,
        objects: [
          {
            keyOrPath: 'backups/snapshot_daily.tar.gz',
            sizeBytes: 104857600,
            lastModified: new Date().toISOString(),
            storageClass: 'STANDARD',
            containsGhost: false,
            isVersionedGhost: false,
            isWormLocked: false,
          },
        ],
      };
      onAddCloudConnector(newCloud);
      setSelectedCloud(newCloud);
      setActiveTab('CLOUD_STORAGE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Storage & Database Connectors Hub
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                  All Systems Operational
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure SQL databases, NoSQL event stores, and Cloud Storage endpoints for customer deletion audits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('DATABASES')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'DATABASES'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>SQL & NoSQL Databases ({databaseConnectors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('CLOUD_STORAGE')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'CLOUD_STORAGE'
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Cloud Storage Buckets ({cloudConnectors.length})</span>
            </button>
          </div>
          <button
            onClick={() => setActiveTab('NEW_CONNECTOR')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'NEW_CONNECTOR'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Connection</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-900/50">
          
          {/* TAB 1: DATABASES */}
          {activeTab === 'DATABASES' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Connector List */}
              <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-3 overflow-y-auto space-y-2">
                <p className="text-[11px] font-mono uppercase text-slate-400 px-2 py-1">Connected Database Instances</p>
                {databaseConnectors.map((db) => {
                  const isSelected = selectedDb?.id === db.id;
                  return (
                    <div
                      key={db.id}
                      onClick={() => setSelectedDb(db)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          db.category === 'SQL_DATABASE' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {db.engine}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="text-[10px] font-mono">{db.lastPingMs}ms</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white mt-1.5 truncate">{db.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{db.host}:{db.port}/{db.databaseOrKeyspace}</p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span>{db.tablesOrCollections.length} schemas indexed</span>
                        {db.tablesOrCollections.some(t => t.containsGhost) && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ghost found
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected DB Details & Schema Browser */}
              {selectedDb && (
                <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/60 p-5 overflow-y-auto flex flex-col">
                  <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{selectedDb.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {selectedDb.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Host: {selectedDb.host} | Port: {selectedDb.port} | DB: {selectedDb.databaseOrKeyspace}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTestDb(selectedDb.id)}
                      disabled={testingId === selectedDb.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingId === selectedDb.id ? 'animate-spin text-indigo-400' : ''}`} />
                      <span>{testingId === selectedDb.id ? 'Pinging...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  {/* Security & Auth Attributes */}
                  <div className="grid grid-cols-3 gap-3 my-4">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">SSL / TLS Mode</p>
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3" /> TLS 1.3 Verified
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Service Account</p>
                      <p className="text-xs font-semibold text-slate-200 font-mono mt-0.5 truncate">
                        {selectedDb.username}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Query Latency</p>
                      <p className="text-xs font-semibold text-cyan-400 font-mono mt-0.5">
                        {selectedDb.lastPingMs} ms (Sub-second)
                      </p>
                    </div>
                  </div>

                  {/* Tables / Collections Schema Explorer */}
                  <div className="flex-1 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Indexed Tables & Collections ({selectedDb.tablesOrCollections.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Audit filter targets personal identifiers</span>
                    </div>

                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">Table / Collection</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Row Count</th>
                            <th className="py-2.5 px-3">Scanned Fields</th>
                            <th className="py-2.5 px-3 text-right">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                          {selectedDb.tablesOrCollections.map((t, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-mono font-medium text-slate-200">{t.name}</td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  {t.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400">{t.rowCount.toLocaleString()}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {t.scannedFields.map((f, i) => (
                                    <span key={i} className="text-[9px] px-1 py-0.2 rounded bg-slate-800/80 text-slate-300 font-mono">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {t.containsGhost ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                                    <AlertCircle className="w-3 h-3" />
                                    {t.ghostCount} Ghost Rows
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                                    <CheckCircle2 className="w-3 h-3" /> Purged
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLOUD STORAGE */}
          {activeTab === 'CLOUD_STORAGE' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Cloud Connector List */}
              <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-3 overflow-y-auto space-y-2">
                <p className="text-[11px] font-mono uppercase text-slate-400 px-2 py-1">Cloud Storage Buckets</p>
                {cloudConnectors.map((cloud) => {
                  const isSelected = selectedCloud?.id === cloud.id;
                  return (
                    <div
                      key={cloud.id}
                      onClick={() => setSelectedCloud(cloud)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-500/80 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          cloud.provider === 'AWS_S3'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : cloud.provider === 'AZURE_BLOB'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {cloud.provider}
                        </span>
                        {cloud.wormLockActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> WORM Lock
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white mt-1.5 truncate">{cloud.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{cloud.bucketOrContainer} ({cloud.region})</p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span>{cloud.objectCount.toLocaleString()} objects indexed</span>
                        {cloud.objects.some(o => o.containsGhost) && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ghost object
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Cloud Bucket Details & Object Explorer */}
              {selectedCloud && (
                <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/60 p-5 overflow-y-auto flex flex-col">
                  <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{selectedCloud.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {selectedCloud.provider}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Bucket / Container: {selectedCloud.bucketOrContainer} | Region: {selectedCloud.region}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTestCloud(selectedCloud.id)}
                      disabled={testingId === selectedCloud.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingId === selectedCloud.id ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>{testingId === selectedCloud.id ? 'Validating API...' : 'Verify Cloud API'}</span>
                    </button>
                  </div>

                  {/* Cloud Attributes */}
                  <div className="grid grid-cols-3 gap-3 my-4">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Auth Protocol</p>
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                        <ShieldCheck className="w-3 h-3" /> {selectedCloud.authMethod}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Versioning Status</p>
                      <p className="text-xs font-semibold text-slate-200 font-mono mt-0.5">
                        {selectedCloud.versioningEnabled ? 'Enabled (Check historical versions)' : 'Disabled'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">WORM Compliance Mode</p>
                      <p className={`text-xs font-semibold font-mono mt-0.5 ${
                        selectedCloud.wormLockActive ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {selectedCloud.wormLockActive ? 'Active (Requires Legal Override)' : 'Not Enforced'}
                      </p>
                    </div>
                  </div>

                  {/* Object Explorer */}
                  <div className="flex-1 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Indexed Storage Objects & Snapshots ({selectedCloud.objects.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Scanned for customer payload matches</span>
                    </div>

                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">Object Key / Blob Path</th>
                            <th className="py-2.5 px-3">Class</th>
                            <th className="py-2.5 px-3">Size</th>
                            <th className="py-2.5 px-3">Retention / Lock</th>
                            <th className="py-2.5 px-3 text-right">Audit Finding</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                          {selectedCloud.objects.map((obj, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-mono font-medium text-slate-200 truncate max-w-[240px]">
                                {obj.keyOrPath}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  {obj.storageClass}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400">
                                {(obj.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                              </td>
                              <td className="py-2.5 px-3">
                                {obj.isWormLocked ? (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-max">
                                    <Lock className="w-2.5 h-2.5" /> Immutable Lock
                                  </span>
                                ) : obj.isVersionedGhost ? (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Version Residue
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-500">Mutable</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {obj.containsGhost ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                                    <AlertCircle className="w-3 h-3" /> Ghost Data Found
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                                    <CheckCircle2 className="w-3 h-3" /> Clean / Purged
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW CONNECTOR FORM */}
          {activeTab === 'NEW_CONNECTOR' && (
            <div className="max-w-2xl mx-auto bg-slate-950/70 border border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-bold text-white mb-1">Add New Data Source Connection</h3>
              <p className="text-xs text-slate-400 mb-6">
                Connect the Ghost Data Detector Agent to query tables, collections, or storage buckets to verify deletion status.
              </p>

              <form onSubmit={handleCreateConnector} className="space-y-4">
                {/* Type Selection */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      checked={newType === 'DATABASE'}
                      onChange={() => setNewType('DATABASE')}
                      className="accent-indigo-500"
                    />
                    Database (SQL / NoSQL)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      checked={newType === 'CLOUD'}
                      onChange={() => setNewType('CLOUD')}
                      className="accent-indigo-500"
                    />
                    Cloud Storage (S3 / Azure / GCS)
                  </label>
                </div>

                {newType === 'DATABASE' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Database Engine</label>
                        <select
                          value={newDbEngine}
                          onChange={(e) => setNewDbEngine(e.target.value as DatabaseEngine)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="POSTGRESQL">PostgreSQL (Relational SQL)</option>
                          <option value="MYSQL">MySQL (Relational SQL)</option>
                          <option value="SQL_SERVER">Microsoft SQL Server (Relational SQL)</option>
                          <option value="MONGODB">MongoDB (NoSQL Document)</option>
                          <option value="CASSANDRA">Apache Cassandra (NoSQL Wide-Column)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Production Analytics Cluster"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-mono text-slate-400 mb-1">Host / Cluster URL</label>
                        <input
                          type="text"
                          placeholder="postgres.internal.corp"
                          value={newHost}
                          onChange={(e) => setNewHost(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Port</label>
                        <input
                          type="number"
                          value={newPort}
                          onChange={(e) => setNewPort(parseInt(e.target.value) || 5432)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Database or Keyspace Name</label>
                      <input
                        type="text"
                        placeholder="app_production"
                        value={newDatabase}
                        onChange={(e) => setNewDatabase(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Storage Provider</label>
                        <select
                          value={newCloudProvider}
                          onChange={(e) => setNewCloudProvider(e.target.value as CloudStorageProvider)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="AWS_S3">Amazon Web Services (AWS S3)</option>
                          <option value="AZURE_BLOB">Microsoft Azure Blob Storage</option>
                          <option value="GOOGLE_CLOUD_STORAGE">Google Cloud Storage (GCS)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. S3 Cold Backups"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Bucket / Container Name</label>
                        <input
                          type="text"
                          placeholder="corp-user-data-lake"
                          value={newBucket}
                          onChange={(e) => setNewBucket(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Region</label>
                        <input
                          type="text"
                          placeholder="eu-west-1 or us-central1"
                          value={newRegion}
                          onChange={(e) => setNewRegion(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('DATABASES')}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                  >
                    Establish Secure Connection
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
