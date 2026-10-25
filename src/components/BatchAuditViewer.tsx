import React, { useState, useMemo } from 'react';
import batchData from '../data/batchDeletionRequests.json';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Download, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink,
  HelpCircle,
  BarChart2,
  FolderArchive
} from 'lucide-react';

interface BatchAuditCase {
  caseId: string;
  email: string;
  requestedAt: string;
  reportedStatus: string;
  reportedAt: string;
  auditAt: string;
  requestText: string;
  auditVerdict: string;
  ghostDetected: boolean;
  auditNote: string;
  rootCause: string;
  action: string;
}

interface BatchAuditViewerProps {
  onSelectCaseForDeepAudit: (caseItem: BatchAuditCase) => void;
}

export const BatchAuditViewer: React.FC<BatchAuditViewerProps> = ({ onSelectCaseForDeepAudit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<BatchAuditCase | null>(batchData[0] as BatchAuditCase);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtered dataset
  const filteredData = useMemo(() => {
    return (batchData as BatchAuditCase[]).filter((item) => {
      if (verdictFilter !== 'ALL' && item.auditVerdict !== verdictFilter) return false;
      if (statusFilter !== 'ALL' && item.reportedStatus !== statusFilter) return false;
      if (
        searchTerm &&
        !item.caseId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.requestText.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [searchTerm, verdictFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = batchData.length;
    const ghostOrZombie = (batchData as BatchAuditCase[]).filter(
      (b) => b.auditVerdict === 'GHOST_DATA_DETECTED' || b.auditVerdict === 'ZOMBIE_DATA_RECREATED'
    ).length;
    const clean = (batchData as BatchAuditCase[]).filter((b) => b.auditVerdict === 'VERIFIED_FULLY_PURGED').length;
    const partial = (batchData as BatchAuditCase[]).filter((b) => b.auditVerdict === 'INCOMPLETE_ORPHANED_DATA').length;
    const overdue = (batchData as BatchAuditCase[]).filter((b) => b.auditVerdict === 'BREACH_TIMELIMIT_EXCEEDED').length;
    const misclassified = (batchData as BatchAuditCase[]).filter((b) => b.auditVerdict === 'MISCLASSIFIED_NON_DELETION').length;

    return { total, ghostOrZombie, clean, partial, overdue, misclassified };
  }, []);

  const handleExportCSV = () => {
    const headers = ['case_id', 'email', 'reported_status', 'audit_verdict', 'ghost_detected', 'root_cause', 'recommended_action'];
    const rows = filteredData.map((d) => [
      d.caseId,
      d.email,
      d.reportedStatus,
      d.auditVerdict,
      d.ghostDetected ? 'YES' : 'NO',
      `"${d.rootCause.replace(/"/g, '""')}"`,
      `"${d.action.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ghost_Data_Audit_Batch_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Batch Deletion Audit Engine
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                {batchData.length} Cases Audited
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cross-system verification of deletion requests from <code>deletion_requests_78464850.csv</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/agent-trace.zip"
            download="agent-trace.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] border border-purple-400/40 transition-all"
            title="Download compliant agent-trace.zip for submission"
          >
            <FolderArchive className="w-3.5 h-3.5 text-purple-200" />
            <span>Download agent-trace.zip</span>
            <Download className="w-3 h-3 text-purple-200" />
          </a>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400">Total Audited</p>
          <p className="text-lg font-bold text-white mt-1">{stats.total}</p>
          <p className="text-[10px] text-slate-500">From uploaded CSV</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/30">
          <p className="text-[10px] uppercase font-mono text-rose-400">Ghost / Zombie</p>
          <p className="text-lg font-bold text-rose-400 mt-1">{stats.ghostOrZombie}</p>
          <p className="text-[10px] text-rose-300/70 font-mono">
            {((stats.ghostOrZombie / stats.total) * 100).toFixed(1)}% leak rate!
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30">
          <p className="text-[10px] uppercase font-mono text-emerald-400">Verified Clean</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">{stats.clean}</p>
          <p className="text-[10px] text-emerald-300/70 font-mono">
            {((stats.clean / stats.total) * 100).toFixed(1)}% verified
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-orange-500/30">
          <p className="text-[10px] uppercase font-mono text-orange-400">Orphaned Child Rows</p>
          <p className="text-lg font-bold text-orange-400 mt-1">{stats.partial}</p>
          <p className="text-[10px] text-slate-500">Uncascaded FKs</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30">
          <p className="text-[10px] uppercase font-mono text-amber-400">Overdue SLA</p>
          <p className="text-lg font-bold text-amber-400 mt-1">{stats.overdue}</p>
          <p className="text-[10px] text-slate-500">Exceeded 30d window</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/30">
          <p className="text-[10px] uppercase font-mono text-purple-400">NLP Misclassified</p>
          <p className="text-lg font-bold text-purple-400 mt-1">{stats.misclassified}</p>
          <p className="text-[10px] text-slate-500">Non-deletion requests</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Audit Verdict Filter */}
          <select
            value={verdictFilter}
            onChange={(e) => {
              setVerdictFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Audit Verdicts</option>
            <option value="GHOST_DATA_DETECTED">Ghost Data Detected (91)</option>
            <option value="ZOMBIE_DATA_RECREATED">Zombie Data Recreated (80)</option>
            <option value="VERIFIED_FULLY_PURGED">Verified Fully Purged (83)</option>
            <option value="INCOMPLETE_ORPHANED_DATA">Incomplete Orphaned Data (152)</option>
            <option value="BREACH_TIMELIMIT_EXCEEDED">Breach Time Limit Exceeded (103)</option>
            <option value="MISCLASSIFIED_NON_DELETION">Misclassified Non-Deletion (9)</option>
          </select>

          {/* Company Reported Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Reported Statuses</option>
            <option value="COMPLETE">Reported COMPLETE (254)</option>
            <option value="PARTIALLY_COMPLETE">Reported PARTIALLY_COMPLETE (152)</option>
            <option value="NOT_STARTED">Reported NOT_STARTED (112)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by case ID, email, or text..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Grid: Cases Table (Left) + Detail Forensic Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cases Table */}
        <div className="lg:col-span-2 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Company Reported</th>
                  <th className="py-2.5 px-3">Agent Audit Verdict</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-950/40">
                {displayedItems.map((item) => {
                  const isSelected = selectedCase?.caseId === item.caseId;
                  return (
                    <tr
                      key={item.caseId}
                      onClick={() => setSelectedCase(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                        {item.caseId}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 truncate max-w-[160px]">
                        {item.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            item.reportedStatus === 'COMPLETE'
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              : item.reportedStatus === 'PARTIALLY_COMPLETE'
                              ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.reportedStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.auditVerdict === 'VERIFIED_FULLY_PURGED' ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Truly Clean
                          </span>
                        ) : item.auditVerdict === 'GHOST_DATA_DETECTED' ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-2.5 h-2.5" /> Ghost Data Found
                          </span>
                        ) : item.auditVerdict === 'ZOMBIE_DATA_RECREATED' ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max font-bold">
                            <Zap className="w-2.5 h-2.5" /> Zombie Recreated
                          </span>
                        ) : item.auditVerdict === 'MISCLASSIFIED_NON_DELETION' ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-max">
                            <HelpCircle className="w-2.5 h-2.5" /> Not Deletion
                          </span>
                        ) : item.auditVerdict === 'INCOMPLETE_ORPHANED_DATA' ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            Orphaned Data
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
                            Overdue 30d
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-xs text-indigo-400 font-semibold">Inspect</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-slate-300 font-mono">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Selected Case Forensic Autopsy Card (Right) */}
        {selectedCase && (
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Selected Forensic Audit</span>
                  <h4 className="text-sm font-bold text-white font-mono mt-0.5">{selectedCase.caseId}</h4>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                    selectedCase.auditVerdict === 'VERIFIED_FULLY_PURGED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : selectedCase.auditVerdict === 'ZOMBIE_DATA_RECREATED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {selectedCase.auditVerdict}
                </span>
              </div>

              {/* Case Metadata */}
              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <p className="text-[10px] font-mono text-slate-400">Subject Email</p>
                  <p className="text-slate-200 font-mono font-semibold">{selectedCase.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500">Requested:</span>
                    <p className="text-slate-300 font-mono">{new Date(selectedCase.requestedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Company Reported:</span>
                    <p className="text-slate-300 font-mono">{selectedCase.reportedStatus}</p>
                  </div>
                </div>

                {/* Request Text */}
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] font-mono text-slate-400 mb-1">Customer Original Request Text:</p>
                  <p className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-sans italic leading-relaxed">
                    "{selectedCase.requestText}"
                  </p>
                </div>

                {/* Audit Finding */}
                <div className="pt-2">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-1 font-bold">Audit Agent Finding:</p>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{selectedCase.auditNote}</p>
                </div>

                {/* Root Cause */}
                <div className="p-2.5 rounded-lg bg-orange-950/20 border border-orange-500/30 text-xs">
                  <p className="text-[10px] font-mono uppercase text-orange-400 font-bold mb-0.5">Failure Root Cause:</p>
                  <p className="text-slate-200 leading-relaxed text-[11px] font-sans">{selectedCase.rootCause}</p>
                </div>

                {/* Action */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs">
                  <p className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-0.5">Remediation Action:</p>
                  <p className="text-slate-200 leading-relaxed text-[11px] font-sans">{selectedCase.action}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectCaseForDeepAudit(selectedCase)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <span>Load into Interactive Deletion Audit Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
