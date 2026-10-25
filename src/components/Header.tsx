import React from 'react';
import { CustomerProfile, DeletionAuditCertificate } from '../types/audit';
import { 
  ShieldAlert, 
  Database, 
  Cloud, 
  RefreshCw, 
  FileCheck, 
  Radio, 
  Server, 
  UserCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Download,
  FolderArchive
} from 'lucide-react';

interface HeaderProps {
  currentCustomer: CustomerProfile;
  allCustomers: CustomerProfile[];
  onSelectCustomer: (customer: CustomerProfile) => void;
  onOpenConnectors: () => void;
  onOpenReport: () => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  ghostCount: number;
  zombieCount: number;
  complianceScore: number;
  onNewCustomerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCustomer,
  allCustomers,
  onSelectCustomer,
  onOpenConnectors,
  onOpenReport,
  onTriggerScan,
  isScanning,
  ghostCount,
  zombieCount,
  complianceScore,
  onNewCustomerModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
              <ShieldAlert className="w-6 h-6 animate-pulse text-indigo-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Ghost Data Detector
                  <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 font-mono tracking-wide uppercase">
                    AI Deletion Audit Agent
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous cross-system customer PII audit across SQL, NoSQL, Cloud Storage & Event Logs
              </p>
            </div>
          </div>

          {/* Quick Actions & Customer Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Customer Profile Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <UserCheck className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={currentCustomer.id}
                onChange={(e) => {
                  const found = allCustomers.find((c) => c.id === e.target.value);
                  if (found) onSelectCustomer(found);
                }}
                className="bg-transparent text-sm text-slate-200 font-medium focus:outline-none pr-3 cursor-pointer py-1"
              >
                {allCustomers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.canonicalName} ({c.deletionRequest.regulation})
                  </option>
                ))}
              </select>
              <button
                onClick={onNewCustomerModal}
                title="Audit custom customer"
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 transition-colors"
              >
                + New
              </button>
            </div>

            {/* Connectors Hub Button */}
            <button
              onClick={onOpenConnectors}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connectors (8)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            {/* Trigger Scan Button */}
            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${
                isScanning
                  ? 'bg-indigo-600/50 cursor-not-allowed border border-indigo-400/40'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-400/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Auditing Systems...' : 'Run Forensic Scan'}</span>
            </button>

            {/* Certificate of Deletion Report */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 transition-all"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Certificate</span>
            </button>

            {/* Download Agent Traces ZIP Bundle */}
            <a
              href="/agent_traces.zip"
              download="agent_traces.zip"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] border border-purple-400/40 transition-all"
              title="Download complete agent audit traces in ZIP archive"
            >
              <FolderArchive className="w-3.5 h-3.5 text-purple-200" />
              <span>Agent Traces (ZIP)</span>
              <Download className="w-3 h-3 text-purple-200" />
            </a>
          </div>
        </div>

        {/* Global Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          
          {/* Target Customer Status */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Deletion Ticket</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">{currentCustomer.deletionRequest.ticketId}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {currentCustomer.deletionRequest.daysElapsed}d ago
                </span>
              </div>
            </div>
          </div>

          {/* Ghost Data Found */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-lg p-2.5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              ghostCount > 0 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Ghost Records Detected</p>
              <p className={`text-sm font-bold ${ghostCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {ghostCount} Residual Locations
              </p>
            </div>
          </div>

          {/* Zombie Recreated Data */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-lg p-2.5 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              zombieCount > 0 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse' 
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Zombie Data Recreated</p>
              <p className={`text-sm font-bold ${zombieCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {zombieCount > 0 ? `${zombieCount} Re-injected!` : '0 Detected'}
              </p>
            </div>
          </div>

          {/* Scanned Database & Cloud Nodes */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Storage Nodes Scanned</p>
              <p className="text-sm font-bold text-slate-200">
                8 Engines <span className="text-[10px] text-slate-400 font-normal">(SQL/NoSQL/Cloud)</span>
              </p>
            </div>
          </div>

          {/* Compliance Score */}
          <div className="hidden lg:flex bg-slate-900/60 border border-slate-800/90 rounded-lg p-2.5 items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              complianceScore >= 90
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}>
              {complianceScore >= 90 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Audit Compliance Score</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${complianceScore >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {complianceScore}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {complianceScore >= 90 ? 'Purged & Compliant' : 'Violation Exposure'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
