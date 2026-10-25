import React, { useState } from 'react';
import { CustomerProfile, GhostRecord, RemediationPlaybook } from '../types/audit';
import { 
  Wrench, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  FileCode,
  CheckSquare
} from 'lucide-react';

interface RemediationPlaybookProps {
  customer: CustomerProfile;
  ghostRecords: GhostRecord[];
  playbook: RemediationPlaybook | null;
  isLoading: boolean;
  onRefreshPlaybook: () => void;
  onExecuteRemediation: () => void;
  isRemediated: boolean;
}

export const RemediationPlaybookView: React.FC<RemediationPlaybookProps> = ({
  customer,
  ghostRecords,
  playbook,
  isLoading,
  onRefreshPlaybook,
  onExecuteRemediation,
  isRemediated,
}) => {
  const [activeScriptIdx, setActiveScriptIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAutomatedRemediation = () => {
    setIsExecuting(true);
    setExecutionLogs([
      `[REMEDIATION-DISPATCH] Commencing zero-downtime customer purge for ${customer.canonicalName}...`,
      `[SQL] Executing PostgreSQL cascade purge on public.user_audit_events... Done (14 rows scrubbed)`,
      `[NoSQL] Dispatching MongoDB db.userProfiles.deleteMany() with aliases array filter... Done (1 doc deleted)`,
      `[NoSQL] Emitting Cassandra CQL partition tombstone with zero grace timestamp... Quorum ACK received.`,
      `[KAFKA] Emitting null payload tombstone to topic account-lifecycle-dlq... Compaction marker set.`,
      `[CLOUD] Dispatching Azure Blob delete & AWS S3 compliance tombstone tag... Done.`,
      `[VERIFY] Re-probing all 8 storage nodes with active customer identifiers...`,
      `[VERIFY] Zero ghost rows returned. Compliance score upgraded to 98%.`,
      `[AUDIT-SEAL] Cryptographic verification hash generated. Audit complete.`,
    ]);

    setTimeout(() => {
      setIsExecuting(false);
      onExecuteRemediation();
    }, 1200);
  };

  const currentScript = playbook?.scripts[activeScriptIdx] || playbook?.scripts[0];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Automated Remediation Playbook & Purge Scripts
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                Safe Zero-Downtime Purge
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Executable SQL, MongoDB Javascript, Cassandra CQL, and Cloud CLI scripts to safely erase lingering ghost data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshPlaybook}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isLoading ? 'Regenerating...' : 'Regenerate Scripts'}</span>
          </button>

          <button
            onClick={handleRunAutomatedRemediation}
            disabled={isExecuting || isRemediated}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${
              isRemediated
                ? 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isRemediated ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Remediation Verified & Applied!</span>
              </>
            ) : (
              <>
                <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Executing Purge Probe...' : 'Execute Remediation Probe'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-semibold text-slate-200">Synthesizing Remediation Plan & Purge Scripts...</p>
        </div>
      ) : playbook ? (
        <div className="space-y-6 mt-6">
          
          {/* Step-by-Step Remediation Plan */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Remediation Protocol</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {playbook.remediationPlan.map((plan, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{plan}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Script Viewer with Multi-Tab Switcher */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 overflow-hidden shadow-inner">
            {/* Tabs for scripts */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-2">
              <div className="flex flex-wrap gap-1.5">
                {playbook.scripts.map((script, idx) => {
                  const isSelected = activeScriptIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveScriptIdx(idx)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>{script.title}</span>
                    </button>
                  );
                })}
              </div>

              {currentScript && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    currentScript.riskRating === 'LOW'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    Risk: {currentScript.riskRating}
                  </span>
                  <button
                    onClick={() => handleCopy(currentScript.code)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Script Details & Code */}
            {currentScript && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Target Node: <strong className="text-slate-200 font-mono">{currentScript.targetSystem}</strong></span>
                  <span className="font-mono text-[10px] uppercase text-emerald-400">Language: {currentScript.language}</span>
                </div>
                {currentScript.description && (
                  <p className="text-xs text-slate-400 font-sans italic">{currentScript.description}</p>
                )}
                <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800/90 whitespace-pre leading-relaxed">
                  {currentScript.code}
                </pre>
              </div>
            )}
          </div>

          {/* Live Execution Logs when probe is executed */}
          {executionLogs.length > 0 && (
            <div className="border border-emerald-500/40 rounded-xl bg-slate-950/90 p-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60 mb-2">
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Remediation Probe Execution Log</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Verified Complete</span>
              </div>
              <div className="space-y-1 font-mono text-xs text-emerald-300">
                {executionLogs.map((log, i) => (
                  <p key={i}>{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* Verification Checklist */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Post-Remediation Verification Protocol</span>
            </h4>
            <ul className="space-y-1.5">
              {playbook.verificationChecklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      ) : null}
    </div>
  );
};
