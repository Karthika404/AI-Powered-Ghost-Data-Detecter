import React, { useState } from 'react';
import { CustomerProfile, DatabaseConnectorConfig, DatabaseEngine, GhostRecord } from '../types/audit';
import { 
  Database, 
  Search, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Layers, 
  Trash2, 
  ShieldCheck, 
  FileCode,
  Table,
  ArrowRight
} from 'lucide-react';

interface DatabaseQueryInspectorProps {
  customer: CustomerProfile;
  connectors: DatabaseConnectorConfig[];
  onConfirmDeletion: (systemId: string, location: string) => void;
}

export const DatabaseQueryInspector: React.FC<DatabaseQueryInspectorProps> = ({
  customer,
  connectors,
  onConfirmDeletion,
}) => {
  const [selectedDbId, setSelectedDbId] = useState<string>(connectors[0]?.id || '');
  const activeDb = connectors.find((c) => c.id === selectedDbId) || connectors[0];
  const [selectedTable, setSelectedTable] = useState<string>(
    activeDb?.tablesOrCollections[0]?.name || ''
  );
  
  // Custom query text
  const [queryText, setQueryText] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [verifyingDeletion, setVerifyingDeletion] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    status: 'DELETED' | 'GHOST_EXISTS';
    message: string;
    matchedCount: number;
  } | null>(null);

  // Generate suggested query based on active database engine and table
  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    if (!activeDb) return;

    if (activeDb.engine === 'POSTGRESQL') {
      setQueryText(
        `SELECT * FROM ${tableName}\nWHERE user_id = '${customer.currentIdentifiers.uuid}'\n   OR email = '${customer.primaryEmail}'\nLIMIT 50;`
      );
    } else if (activeDb.engine === 'MYSQL') {
      setQueryText(
        `SELECT * FROM ${tableName}\nWHERE email_address = '${customer.primaryEmail}'\n   OR legacy_customer_id = '${customer.historicalIdentifiers.legacyCustomerIds[0] || 'LEGACY-001'}'\nLIMIT 50;`
      );
    } else if (activeDb.engine === 'SQL_SERVER') {
      setQueryText(
        `SELECT TOP 50 * FROM ${tableName}\nWHERE PrimaryEmail = '${customer.primaryEmail}'\n   OR CustomerRefID = '${customer.currentIdentifiers.accountNumber}';`
      );
    } else if (activeDb.engine === 'MONGODB') {
      setQueryText(
        `db.${tableName}.find({\n  $or: [\n    { "primary_uuid": "${customer.currentIdentifiers.uuid}" },\n    { "aliases": "${customer.historicalIdentifiers.previousEmails[0] || customer.primaryEmail}" },\n    { "legacy_id": "${customer.historicalIdentifiers.legacyCustomerIds[0] || 'LEGACY-001'}" }\n  ]\n}).pretty();`
      );
    } else if (activeDb.engine === 'CASSANDRA') {
      setQueryText(
        `SELECT * FROM ${tableName}\nWHERE user_uuid = ${customer.currentIdentifiers.uuid}\nALLOW FILTERING;`
      );
    }
    setQueryResult(null);
    setVerificationFeedback(null);
  };

  // Run live database query simulation
  const handleRunQuery = () => {
    setIsQuerying(true);
    setVerificationFeedback(null);

    setTimeout(() => {
      setIsQuerying(false);
      const isGhostTable = activeDb?.tablesOrCollections.find(
        (t) => t.name === selectedTable
      )?.containsGhost;

      if (isGhostTable) {
        if (activeDb.engine === 'POSTGRESQL') {
          setQueryResult({
            executionTimeMs: 12,
            rowsFound: 14,
            columns: ['id', 'user_id', 'actor_email', 'event_type', 'created_at', 'raw_request_payload'],
            rows: [
              {
                id: 88401,
                user_id: customer.currentIdentifiers.uuid,
                actor_email: customer.primaryEmail,
                event_type: 'USER_PROFILE_UPDATED',
                created_at: '2026-08-20 11:22:04',
                raw_request_payload: `{"phone": "${customer.currentIdentifiers.phoneNumber}", "city": "London"}`,
              },
              {
                id: 88402,
                user_id: customer.currentIdentifiers.uuid,
                actor_email: customer.historicalIdentifiers.previousEmails[0] || customer.primaryEmail,
                event_type: 'PASSWORD_RESET_DISPATCH',
                created_at: '2026-08-28 14:05:12',
                raw_request_payload: `{"dispatched_to": "${customer.historicalIdentifiers.previousEmails[0] || 'old@email.com'}"}`,
              },
            ],
          });
        } else if (activeDb.engine === 'MONGODB') {
          setQueryResult({
            executionTimeMs: 18,
            documentsFound: 2,
            bson: [
              {
                _id: '64f02a99182bb19022',
                primary_uuid: customer.currentIdentifiers.uuid,
                canonical_name: customer.canonicalName,
                emails: [customer.primaryEmail],
                aliases: customer.historicalIdentifiers.previousEmails,
                legacy_id: customer.historicalIdentifiers.legacyCustomerIds[0] || 'LEGACY-001',
                created_at: '2021-03-14T09:22:11Z',
              },
            ],
          });
        } else if (activeDb.engine === 'CASSANDRA') {
          setQueryResult({
            executionTimeMs: 24,
            rowsFound: 8,
            columns: ['user_uuid', 'event_timestamp', 'client_fingerprint', 'payload'],
            rows: [
              {
                user_uuid: customer.currentIdentifiers.uuid,
                event_timestamp: '2026-09-02 18:30:00+0000',
                client_fingerprint: customer.historicalIdentifiers.deviceFingerprints[0] || 'fp_chrome_01',
                payload: `{"action": "checkout_session", "email": "${customer.primaryEmail}"}`,
              },
            ],
          });
        } else {
          setQueryResult({
            executionTimeMs: 15,
            rowsFound: 1,
            columns: ['id', 'email_address', 'legacy_customer_id', 'status'],
            rows: [
              {
                id: 4091,
                email_address: customer.primaryEmail,
                legacy_customer_id: customer.historicalIdentifiers.legacyCustomerIds[0] || 'LEGACY-001',
                status: 'UNPURGED_ARCHIVE',
              },
            ],
          });
        }
      } else {
        setQueryResult({
          executionTimeMs: 8,
          rowsFound: 0,
          columns: ['id', 'user_id', 'status'],
          rows: [],
        });
      }
    }, 600);
  };

  // Confirm Deletion Status Verification Probe
  const handleVerifyDeletionStatus = () => {
    setVerifyingDeletion(true);
    setTimeout(() => {
      setVerifyingDeletion(false);
      const isGhostTable = activeDb?.tablesOrCollections.find(
        (t) => t.name === selectedTable
      )?.containsGhost;

      if (isGhostTable) {
        setVerificationFeedback({
          status: 'GHOST_EXISTS',
          message: `NON-COMPLIANT: Found matching customer records lingering in ${activeDb.name} (${selectedTable}). Deletion is incomplete!`,
          matchedCount: activeDb.tablesOrCollections.find((t) => t.name === selectedTable)?.ghostCount || 1,
        });
      } else {
        setVerificationFeedback({
          status: 'DELETED',
          message: `CONFIRMED DELETED: Zero customer records or historical aliases detected in ${activeDb.name} (${selectedTable}).`,
          matchedCount: 0,
        });
      }
    }, 700);
  };

  // Immediate purge simulation
  const handleSimulatePurge = () => {
    onConfirmDeletion(activeDb.id, selectedTable);
    const tableObj = activeDb.tablesOrCollections.find((t) => t.name === selectedTable);
    if (tableObj) {
      tableObj.containsGhost = false;
      tableObj.ghostCount = 0;
    }
    setVerificationFeedback({
      status: 'DELETED',
      message: `TOMBSTONE APPLIED: Record purged and deletion verified for ${selectedTable}. 0 records remaining.`,
      matchedCount: 0,
    });
    setQueryResult({
      executionTimeMs: 6,
      rowsFound: 0,
      columns: ['status'],
      rows: [],
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              SQL & NoSQL Database Forensic Query Engine
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono">
                PostgreSQL • MySQL • MSSQL • MongoDB • Cassandra
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Query tables and collections for primary and historical identifiers to confirm complete erasure or detect ghost records
            </p>
          </div>
        </div>

        {/* Database Engine Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Target Database:</span>
          <select
            value={selectedDbId}
            onChange={(e) => {
              setSelectedDbId(e.target.value);
              const db = connectors.find((c) => c.id === e.target.value);
              if (db && db.tablesOrCollections[0]) {
                handleSelectTable(db.tablesOrCollections[0].name);
              }
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-indigo-500"
          >
            {connectors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.engine})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        
        {/* Left Column: Tables & Collections Selector */}
        <div className="lg:col-span-1 border border-slate-800 rounded-xl bg-slate-950/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Tables / Collections</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">{activeDb.engine}</span>
          </div>

          <div className="space-y-1.5">
            {activeDb.tablesOrCollections.map((tbl) => {
              const isSelected = selectedTable === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => handleSelectTable(tbl.name)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-500/80 bg-blue-500/10 text-white font-semibold'
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="truncate">{tbl.name}</p>
                    <p className="text-[10px] text-slate-500 font-sans">{tbl.rowCount.toLocaleString()} records</p>
                  </div>
                  {tbl.containsGhost ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                      {tbl.ghostCount} Ghost
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      0 Match
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Target Identifiers Reference */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <p className="font-mono uppercase text-slate-500 text-[10px] mb-1.5">Active Target Identifiers</p>
            <p className="truncate text-slate-300 font-mono">UUID: {customer.currentIdentifiers.uuid.substring(0, 16)}...</p>
            <p className="truncate text-slate-300 font-mono">Email: {customer.primaryEmail}</p>
            {customer.historicalIdentifiers.previousEmails.length > 0 && (
              <p className="truncate text-amber-300 font-mono">
                Prev: {customer.historicalIdentifiers.previousEmails[0]}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Query Editor & Live Results */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          
          {/* Query Editor Box */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Identifier Search Query: <strong className="text-slate-200">{selectedTable}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVerifyDeletionStatus}
                  disabled={verifyingDeletion}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span>{verifyingDeletion ? 'Probing...' : 'Confirm Deletion Status'}</span>
                </button>
                <button
                  onClick={handleRunQuery}
                  disabled={isQuerying}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
                >
                  <Play className={`w-3 h-3 ${isQuerying ? 'animate-spin' : ''}`} />
                  <span>{isQuerying ? 'Executing Query...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-3 focus:outline-none resize-none"
              placeholder="Enter SQL, CQL, or MongoDB query..."
            />
          </div>

          {/* Verification Feedback Banner */}
          {verificationFeedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
                verificationFeedback.status === 'DELETED'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {verificationFeedback.status === 'DELETED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{verificationFeedback.message}</p>
                  {verificationFeedback.matchedCount > 0 && (
                    <p className="text-[11px] text-rose-400/80 font-mono mt-0.5">
                      Matched {verificationFeedback.matchedCount} lingering record(s). Risk of Article 17 non-compliance!
                    </p>
                  )}
                </div>
              </div>

              {verificationFeedback.status === 'GHOST_EXISTS' && (
                <button
                  onClick={handleSimulatePurge}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Enforce Purge & Cascade</span>
                </button>
              )}
            </div>
          )}

          {/* Results Grid */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/70 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-blue-400" />
                <span>Query Result Output</span>
              </span>
              {queryResult && (
                <span className="text-[11px] font-mono text-slate-400">
                  {queryResult.rowsFound ?? queryResult.documentsFound ?? 0} record(s) returned ({queryResult.executionTimeMs}ms)
                </span>
              )}
            </div>

            {queryResult ? (
              queryResult.rowsFound > 0 || queryResult.documentsFound > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  {queryResult.bson ? (
                    <pre className="text-xs font-mono text-emerald-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto border border-slate-800">
                      {JSON.stringify(queryResult.bson, null, 2)}
                    </pre>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          {queryResult.columns?.map((col: string, i: number) => (
                            <th key={i} className="py-2 px-3">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                        {queryResult.rows?.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            {queryResult.columns?.map((col: string, i: number) => {
                              const val = String(row[col]);
                              const isMatch =
                                val.includes(customer.primaryEmail) ||
                                val.includes(customer.currentIdentifiers.uuid) ||
                                (customer.historicalIdentifiers.previousEmails[0] &&
                                  val.includes(customer.historicalIdentifiers.previousEmails[0]));

                              return (
                                <td key={i} className="py-2 px-3 whitespace-nowrap">
                                  {isMatch ? (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                                      {val}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">{val}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-200">0 Records Found</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    No customer identifiers detected in table {selectedTable}. Deletion verified!
                  </p>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Click <strong>"Run Query"</strong> or <strong>"Confirm Deletion Status"</strong> to inspect customer data presence.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
