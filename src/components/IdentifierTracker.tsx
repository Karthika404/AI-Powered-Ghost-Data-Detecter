import React, { useState } from 'react';
import { CustomerProfile, GhostRecord } from '../types/audit';
import { 
  Fingerprint, 
  Mail, 
  Hash, 
  Phone, 
  User, 
  Clock, 
  Plus, 
  Check, 
  AlertCircle, 
  Share2, 
  Smartphone,
  CreditCard
} from 'lucide-react';

interface IdentifierTrackerProps {
  customer: CustomerProfile;
  ghostRecords: GhostRecord[];
  onAddHistoricalAlias: (type: 'email' | 'name' | 'phone' | 'legacyId', value: string) => void;
}

export const IdentifierTracker: React.FC<IdentifierTrackerProps> = ({
  customer,
  ghostRecords,
  onAddHistoricalAlias,
}) => {
  const [newAliasType, setNewAliasType] = useState<'email' | 'name' | 'phone' | 'legacyId'>('email');
  const [newAliasValue, setNewAliasValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAliasValue.trim()) return;
    onAddHistoricalAlias(newAliasType, newAliasValue.trim());
    setNewAliasValue('');
    setIsAdding(false);
  };

  // Helper to check if an identifier triggered ghost data
  const getIdentifierHitCount = (val: string) => {
    return ghostRecords.filter((r) => r.matchedIdentifier === val || r.dataSnippet.includes(val)).length;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cross-System Customer Identifier Lineage
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                Current & Historical Aliases
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tracks canonical IDs, historical names, previous emails, legacy ERP keys, and cryptographic hashes across systems
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Historical Alias</span>
        </button>
      </div>

      {/* Add Alias Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 animate-in fade-in duration-150">
          <p className="text-xs font-semibold text-white mb-2">Register Additional Known Customer Identifier</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newAliasType}
              onChange={(e) => setNewAliasType(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-purple-500"
            >
              <option value="email">Previous Email</option>
              <option value="name">Maiden / Previous Name</option>
              <option value="phone">Previous Phone</option>
              <option value="legacyId">Legacy Customer ID</option>
            </select>
            <input
              type="text"
              placeholder={newAliasType === 'email' ? 'e.g. s.jenkins@alumni.org' : 'e.g. ORCL-LEGACY-990'}
              value={newAliasValue}
              onChange={(e) => setNewAliasValue(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Index & Scan
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid: Current vs Historical Identifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Box 1: Current Active Identifiers */}
        <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current Identifiers (At Deletion Request)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
              Primary Entity
            </span>
          </div>

          <div className="space-y-2.5">
            {/* UUID */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Hash className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Customer Primary UUID</p>
                  <p className="text-xs font-mono font-semibold text-slate-200 truncate">{customer.currentIdentifiers.uuid}</p>
                </div>
              </div>
              {getIdentifierHitCount(customer.currentIdentifiers.uuid) > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                  {getIdentifierHitCount(customer.currentIdentifiers.uuid)} Leaks
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  Purged
                </span>
              )}
            </div>

            {/* Email */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Primary Email</p>
                  <p className="text-xs font-mono font-semibold text-slate-200 truncate">{customer.primaryEmail}</p>
                </div>
              </div>
              {getIdentifierHitCount(customer.primaryEmail) > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                  {getIdentifierHitCount(customer.primaryEmail)} Leaks
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  Purged
                </span>
              )}
            </div>

            {/* Account Number */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <CreditCard className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Account Reference</p>
                  <p className="text-xs font-mono font-semibold text-slate-200 truncate">{customer.currentIdentifiers.accountNumber}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Canonical Ref
              </span>
            </div>

            {/* Phone */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Verified Phone</p>
                  <p className="text-xs font-mono font-semibold text-slate-200 truncate">{customer.currentIdentifiers.phoneNumber}</p>
                </div>
              </div>
              {getIdentifierHitCount(customer.currentIdentifiers.phoneNumber) > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                  {getIdentifierHitCount(customer.currentIdentifiers.phoneNumber)} Leaks
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  Purged
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Box 2: Historical & Aliased Identifiers */}
        <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Historical Aliases & Ghost Targets</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">
              High Risk Leak Vector
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Previous Emails */}
            {customer.historicalIdentifiers.previousEmails.map((email, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Previous Email Alias</p>
                    <p className="text-xs font-mono font-semibold text-purple-200 truncate">{email}</p>
                  </div>
                </div>
                {getIdentifierHitCount(email) > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                    {getIdentifierHitCount(email)} Ghost Hits
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Clean
                  </span>
                )}
              </div>
            ))}

            {/* Maiden / Alternate Names */}
            {customer.historicalIdentifiers.previousNames.map((name, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Previous Legal Name / Maiden</p>
                    <p className="text-xs font-semibold text-slate-200 truncate">{name}</p>
                  </div>
                </div>
                {getIdentifierHitCount(name) > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                    {getIdentifierHitCount(name)} Hits
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Clean
                  </span>
                )}
              </div>
            ))}

            {/* Legacy Merger/Acquisition IDs */}
            {customer.historicalIdentifiers.legacyCustomerIds.map((legId, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Hash className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Legacy Migration ID</p>
                    <p className="text-xs font-mono font-semibold text-slate-200 truncate">{legId}</p>
                  </div>
                </div>
                {getIdentifierHitCount(legId) > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                    {getIdentifierHitCount(legId)} Ghost Hits
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Clean
                  </span>
                )}
              </div>
            ))}

            {/* Device / Cookie Fingerprint */}
            {customer.historicalIdentifiers.deviceFingerprints.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Smartphone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Device Fingerprint Hash</p>
                    <p className="text-xs font-mono text-slate-400 truncate">
                      {customer.historicalIdentifiers.deviceFingerprints[0]}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Indexed
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
