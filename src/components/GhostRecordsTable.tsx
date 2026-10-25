import React, { useState } from 'react';
import { GhostRecord, SystemCategory, RecordSeverity } from '../types/audit';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Zap, 
  CheckCircle2, 
  ExternalLink, 
  FileCode, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface GhostRecordsTableProps {
  ghostRecords: GhostRecord[];
  onSelectRecordToRemediate?: (record: GhostRecord) => void;
  onInspectSystem?: (record: GhostRecord) => void;
}

export const GhostRecordsTable: React.FC<GhostRecordsTableProps> = ({
  ghostRecords,
  onSelectRecordToRemediate,
  onInspectSystem,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [onlyZombie, setOnlyZombie] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(ghostRecords[0]?.id || null);

  const filteredRecords = ghostRecords.filter((r) => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
    if (onlyZombie && !r.isZombieRecreated) return false;
    if (
      searchTerm &&
      !r.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.matchedIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.systemName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const zombieCount = ghostRecords.filter((r) => r.isZombieRecreated).length;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Detected Undeleted & Recreated Ghost Data
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono">
                {ghostRecords.length} Instances Found
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Audit results uncovering lingering personal information across database tables, cold backups, and zombie stream replays
            </p>
          </div>
        </div>

        {/* Zombie Alert Pill */}
        {zombieCount > 0 && (
          <button
            onClick={() => setOnlyZombie(!onlyZombie)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              onlyZombie
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>{zombieCount} Zombie Recreated Data Alert!</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Storage Categories</option>
            <option value="SQL_DATABASE">SQL Databases</option>
            <option value="NOSQL_DATABASE">NoSQL Databases</option>
            <option value="CLOUD_STORAGE">Cloud Storage</option>
            <option value="EVENT_STREAM">Event Streams (Kafka)</option>
            <option value="LOGGING_OBSERVABILITY">Logs & Observability</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by system, table, or alias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">System & Target Location</th>
              <th className="py-3 px-4">Matched Identifier</th>
              <th className="py-3 px-4">Type / Storage</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 bg-slate-950/30">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r) => {
                const isExpanded = expandedRecordId === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      onClick={() => setExpandedRecordId(isExpanded ? null : r.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Location & System */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {r.isZombieRecreated ? (
                            <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30" title="Zombie Data Recreated Post-Deletion!">
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          )}
                          <div>
                            <p className="font-semibold text-white font-mono">{r.location}</p>
                            <p className="text-[10px] text-slate-400">{r.systemName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Matched Identifier */}
                      <td className="py-3 px-4 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                          {r.matchedIdentifier}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Field: {r.matchedField}</p>
                      </td>

                      {/* Storage Type */}
                      <td className="py-3 px-4 text-slate-300">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {r.storageType}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            r.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : r.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {r.remediationStatus === 'PURGED' ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Purged
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" /> Undeleted
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-indigo-400 font-semibold hover:underline">
                          {isExpanded ? 'Hide Payload' : 'Inspect Payload'}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable Forensic Payload Inspector */}
                    {isExpanded && (
                      <tr className="bg-slate-950 border-t border-b border-indigo-950/80">
                        <td colSpan={6} className="p-4">
                          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Raw Extracted Payload & System Forensic Trace</span>
                              </span>
                              <div className="flex items-center gap-2">
                                {r.isZombieRecreated && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                    Resurrected: {r.zombieOrigin}
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-slate-500">
                                  Detected: {new Date(r.detectedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-800/90 whitespace-pre-wrap">
                              {r.dataSnippet}
                            </pre>

                            <div className="flex items-center justify-between pt-2 text-xs">
                              <span className="text-slate-400">
                                Regulatory Article: <strong>GDPR Art. 17 (Right to Erasure) & CCPA 1798.105</strong>
                              </span>
                              <div className="flex gap-2">
                                {onInspectSystem && (
                                  <button
                                    onClick={() => onInspectSystem(r)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5"
                                  >
                                    <span>Query System In Inspector</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  No ghost records match the active filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
