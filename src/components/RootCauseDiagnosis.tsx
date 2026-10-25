import React, { useState } from 'react';
import { CustomerProfile, GhostRecord, RootCauseDiagnosis } from '../types/audit';
import { 
  Activity, 
  AlertOctagon, 
  Cpu, 
  HelpCircle, 
  RefreshCw, 
  ShieldAlert, 
  GitCommit, 
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RootCauseDiagnosisProps {
  customer: CustomerProfile;
  ghostRecords: GhostRecord[];
  diagnosis: RootCauseDiagnosis | null;
  isLoading: boolean;
  onRefreshDiagnosis: () => void;
}

export const RootCauseDiagnosisView: React.FC<RootCauseDiagnosisProps> = ({
  customer,
  ghostRecords,
  diagnosis,
  isLoading,
  onRefreshDiagnosis,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Deep Forensic Root-Cause Diagnosis
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-300 font-mono">
                Gemini 3.8 Flash Privacy Auditor
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Identifies the architectural breakdown and asynchronous failure points explaining why customer deletion failed
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshDiagnosis}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
          <span>{isLoading ? 'Diagnosing...' : 'Re-Run AI Diagnosis'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-semibold text-slate-200">Analyzing System Topologies & Event Streams...</p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Correlating Kafka DLQ consumer failures with PostgreSQL cascade omission and S3 WORM policies...
          </p>
        </div>
      ) : diagnosis ? (
        <div className="space-y-6 mt-6">
          
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30">
            <span className="text-[10px] font-mono uppercase text-orange-400 font-semibold tracking-wider">
              Forensic Executive Summary
            </span>
            <p className="text-sm font-semibold text-white mt-1 leading-relaxed">
              {diagnosis.rootCause}
            </p>
          </div>

          {/* Technical Failure Mechanisms Grid */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              <span>Identified Architectural Failure Mechanisms</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {diagnosis.failureMechanisms.map((mech, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {mech.system}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          mech.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {mech.severity}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white mt-2.5">{mech.name}</h5>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{mech.details}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Activity className="w-3 h-3 text-orange-400" />
                    <span>Audit Mechanism #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Forensic Timeline & Step Breakdown */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-5">
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
              <span>Forensic Chronology: How Deletion Failed & Data Resurrected</span>
            </h4>

            <div className="space-y-3">
              {diagnosis.technicalBreakdown.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-300 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex-1">
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Risk & Statutory Penalty Assessment */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Regulatory Violation & Fine Exposure</p>
                <p className="text-xs text-rose-200/90 mt-0.5">{diagnosis.regulatoryRisk}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Enforcement Notice Window</span>
              <p className="text-xs font-bold text-rose-400 font-mono mt-0.5">
                {diagnosis.estimatedTimeToBreachNotice}
              </p>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};
