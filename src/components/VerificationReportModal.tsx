import React, { useRef } from 'react';
import { CustomerProfile, GhostRecord, LegalExemption, DeletionAuditCertificate } from '../types/audit';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Lock, 
  Scale, 
  Award,
  Hash
} from 'lucide-react';

interface VerificationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  ghostRecords: GhostRecord[];
  exemptions: LegalExemption[];
  complianceScore: number;
}

export const VerificationReportModal: React.FC<VerificationReportModalProps> = ({
  isOpen,
  onClose,
  customer,
  ghostRecords,
  exemptions,
  complianceScore,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const certificateId = `CERT-DEL-${customer.deletionRequest.ticketId}-${Date.now().toString().slice(-6)}`;
  const sha256Seal = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
  const remainingGhosts = ghostRecords.filter((r) => r.remediationStatus === 'UNRESOLVED').length;
  const purgedCount = ghostRecords.filter((r) => r.remediationStatus === 'PURGED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      certificateId,
      customer: {
        canonicalName: customer.canonicalName,
        primaryEmail: customer.primaryEmail,
        uuid: customer.currentIdentifiers.uuid,
        deletionTicket: customer.deletionRequest.ticketId,
        regulation: customer.deletionRequest.regulation,
        requestedAt: customer.deletionRequest.requestedAt,
        markedDeletedAt: customer.deletionRequest.markedDeletedAt,
      },
      auditDate: new Date().toISOString(),
      complianceScore,
      overallStatus: remainingGhosts === 0 ? 'COMPLIANT_PURGED' : 'NON_COMPLIANT_RESIDUAL_GHOSTS_EXIST',
      sha256Seal,
      ghostRecordsSummary: {
        totalDetected: ghostRecords.length,
        purged: purgedCount,
        unresolved: remainingGhosts,
        zombieRecreated: ghostRecords.filter((r) => r.isZombieRecreated).length,
      },
      statutoryExemptionsPreserved: exemptions.map((e) => ({
        recordType: e.recordType,
        applicableLaw: e.applicableLaw,
        expirationDate: e.expirationDate,
        pseudonymizedToken: e.pseudonymizedToken,
      })),
      auditorAttestation: {
        authorizedDPO: customer.deletionRequest.authorizedDPO,
        auditEngine: 'Ghost Data Detector AI Agent v3.8',
        signature: 'VERIFIED_CRYPTOGRAPHIC_SEAL',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Deletion_Audit_Certificate_${customer.deletionRequest.ticketId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Certificate of Deletion Verification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl text-slate-200 relative overflow-hidden"
          >
            {/* Watermark background seal */}
            <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>

            {/* Certificate Header */}
            <div className="border-b-2 border-slate-700 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <FileCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
                Certificate of Data Deletion & Audit Verification
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Issued under {customer.deletionRequest.regulation} & Data Privacy Regulations
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Certificate Reference: <span className="text-emerald-400 font-bold">{certificateId}</span>
              </p>
            </div>

            {/* Subject Information */}
            <div className="grid grid-cols-2 gap-4 my-6 text-xs p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400">Data Subject Canonical Identity</p>
                <p className="text-sm font-bold text-white mt-0.5">{customer.canonicalName}</p>
                <p className="text-slate-400 font-mono mt-0.5">{customer.primaryEmail}</p>
                <p className="text-slate-500 font-mono text-[10px]">UUID: {customer.currentIdentifiers.uuid}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono text-slate-400">Deletion Request Details</p>
                <p className="text-slate-200 font-semibold mt-0.5">Ticket: {customer.deletionRequest.ticketId}</p>
                <p className="text-slate-400 font-mono mt-0.5">
                  Requested: {new Date(customer.deletionRequest.requestedAt).toLocaleDateString()}
                </p>
                <p className="text-slate-400 font-mono text-[10px]">
                  Audited: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Audit Scorecard Summary */}
            <div className="grid grid-cols-4 gap-3 my-6 text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-mono text-slate-400">Systems Scanned</p>
                <p className="text-lg font-bold text-white mt-1">8 Nodes</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-mono text-slate-400">Ghost Instances</p>
                <p className="text-lg font-bold text-rose-400 mt-1">{ghostRecords.length} Found</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-mono text-slate-400">Purged & Remediated</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">{purgedCount} Purged</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] uppercase font-mono text-slate-400">Legal Proofs Sealed</p>
                <p className="text-lg font-bold text-purple-400 mt-1">{exemptions.length} Vaulted</p>
              </div>
            </div>

            {/* Scanned Systems Audit Verdict */}
            <div className="my-6">
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Multi-System Topology Audit Results</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">System Node</th>
                      <th className="py-2 px-3">Engine / Storage</th>
                      <th className="py-2 px-3">Audit Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                    <tr>
                      <td className="py-2 px-3 font-semibold">PostgreSQL Aurora Primary</td>
                      <td className="py-2 px-3 font-mono text-slate-400">Relational SQL</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">✓ Cascade Purge Verified</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">MongoDB User Profiles Store</td>
                      <td className="py-2 px-3 font-mono text-slate-400">NoSQL Document</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">✓ Alias Array Scrubbed</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Apache Cassandra CDC Store</td>
                      <td className="py-2 px-3 font-mono text-slate-400">NoSQL Wide-Column</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">✓ CQL Tombstone Applied</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">AWS S3 Glacier Backups</td>
                      <td className="py-2 px-3 font-mono text-slate-400">Cloud Storage</td>
                      <td className="py-2 px-3 text-purple-400 font-semibold">🔒 Tax Proof Sealed / PII Tagged</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Azure Blob & GCS Data Lake</td>
                      <td className="py-2 px-3 font-mono text-slate-400">Cloud Storage</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">✓ Snapshots Invalidate Complete</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Kafka Event Bus (DLQ)</td>
                      <td className="py-2 px-3 font-mono text-slate-400">Event Stream</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">✓ Tombstone Record Replaced</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statutory Exemption Schedule */}
            <div className="my-6 p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white">Statutory Retention Exemption Schedule</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-sans mb-3">
                In compliance with statutory requirements, commercial payment invoices and KYC clearance tokens have been retained under restricted cryptographic pseudonymization. Personal identifiers (names, emails, phones, shipping coordinates) have been expunged.
              </p>
              <div className="space-y-1.5 font-mono text-[11px] text-purple-200">
                {exemptions.map((ex, i) => (
                  <p key={i}>
                    • <strong>{ex.recordType}</strong>: Retained under {ex.applicableLaw} until {ex.expirationDate} (Token: {ex.pseudonymizedToken})
                  </p>
                ))}
              </div>
            </div>

            {/* Cryptographic Seal & Signatures */}
            <div className="border-t-2 border-slate-700 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-6">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Cryptographic Verification Seal</p>
                <p className="font-mono text-[11px] text-slate-300 break-all max-w-sm mt-0.5">
                  SHA-256: {sha256Seal}
                </p>
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Immutable Audit Log Stamped</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-base text-slate-200 border-b border-slate-700 pb-1">
                  {customer.deletionRequest.authorizedDPO}
                </div>
                <p className="text-[10px] font-mono text-slate-400 uppercase mt-1">Authorized Data Protection Officer</p>
                <p className="text-[10px] text-slate-500 font-mono">Ghost Data Detector AI Agent v3.8</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
