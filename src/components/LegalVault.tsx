import React from 'react';
import { CustomerProfile, LegalExemption } from '../types/audit';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Scale, 
  Key, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash
} from 'lucide-react';

interface LegalVaultProps {
  customer: CustomerProfile;
  exemptions: LegalExemption[];
}

export const LegalVault: React.FC<LegalVaultProps> = ({ customer, exemptions }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Statutory Legal Retention & Exemption Vault
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                GDPR Art. 17(3) & IRS 26 CFR
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Preserves legally mandated financial, tax, and KYC audit trails while sealing and pseudonymizing personal PII
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-lg">
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>{exemptions.length} Statutory Records Preserved</span>
        </div>
      </div>

      {/* Compliance Overview Banner */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 my-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">
              Data Privacy vs. Mandatory Statutory Retention Harmony
            </p>
            <p className="text-slate-400 leading-relaxed font-sans">
              Under <strong>GDPR Article 17(3)(b)</strong> (compliance with a legal obligation) and <strong>Article 17(3)(e)</strong> (establishment or defense of legal claims), commercial transaction invoices, VAT ledgers, and AML compliance proofs cannot be destroyed prior to statutory expiration periods (typically 5 to 7 years). The Ghost Data Detector isolates these proofs into a sealed vault, shreds non-exempt personal data (marketing preferences, device fingerprints, shipping notes), and applies HMAC salted tokenization.
            </p>
          </div>
        </div>
      </div>

      {/* Preserved Records Cards */}
      <div className="space-y-4">
        {exemptions.map((ex) => (
          <div key={ex.id} className="border border-slate-800 rounded-xl bg-slate-950/70 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-500/20">
                  {ex.applicableLaw}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">{ex.recordType}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{ex.systemLocation}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-500">Statutory Retention Lock</span>
                <p className="text-xs font-bold text-purple-400 font-mono mt-0.5 flex items-center gap-1 justify-end">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Until {ex.expirationDate} ({ex.mandatoryRetentionPeriod})</span>
                </p>
              </div>
            </div>

            {/* Action & Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              
              {/* Preserved / Retained Attributes */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Preserved Financial / Audit Proofs (Read-Only)</span>
                </p>
                <div className="space-y-1.5">
                  {ex.retainedAttributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{attr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrubbed PII */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-[10px] font-mono uppercase text-rose-400 font-bold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Mandatory Scrubbed PII Attributes</span>
                </p>
                <div className="space-y-1.5">
                  {ex.piiToScrub.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-400 font-mono text-[11px] line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Pseudonymized Token Badge */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <span className="text-slate-400">
                Compliance Strategy: <strong className="text-slate-200">{ex.preservationMethod}</strong>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">Vault Token:</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs">
                  {ex.pseudonymizedToken}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
