import React, { useState } from 'react';
import { CustomerProfile } from '../types/audit';
import { X, UserPlus, ShieldAlert } from 'lucide-react';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomer: (customer: CustomerProfile) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onCreateCustomer,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regulation, setRegulation] = useState<'GDPR Article 17' | 'CCPA/CPRA' | 'HIPAA' | 'LGPD'>('GDPR Article 17');
  const [prevEmails, setPrevEmails] = useState('');
  const [prevNames, setPrevNames] = useState('');
  const [legacyIds, setLegacyIds] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newId = `cust-${Date.now()}`;
    const newCustomer: CustomerProfile = {
      id: newId,
      canonicalName: name,
      primaryEmail: email,
      creationDate: new Date().toISOString(),
      deletionRequest: {
        ticketId: `DEL-${Date.now().toString().slice(-5)}`,
        requestedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        regulation,
        markedDeletedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        status: 'MARKED_DELETED',
        daysElapsed: 15,
        authorizedDPO: 'Compliance Privacy Officer',
      },
      currentIdentifiers: {
        uuid: `usr_${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`,
        accountNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        email,
        phoneNumber: phone || '+1 (555) 019-2831',
        billingCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
      },
      historicalIdentifiers: {
        previousEmails: prevEmails ? prevEmails.split(',').map((s) => s.trim()) : [],
        previousNames: prevNames ? prevNames.split(',').map((s) => s.trim()) : [],
        previousPhones: [],
        legacyCustomerIds: legacyIds ? legacyIds.split(',').map((s) => s.trim()) : ['LEGACY-ORCL-001'],
        hashedTokens: ['e99a18c428cb38d5f260853678922e03'],
        deviceFingerprints: ['fp_custom_browser_hash_99'],
      },
    };

    onCreateCustomer(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Register Subject for Deletion Audit</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-mono mb-1">Customer Full Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Primary Email (At Deletion)</label>
              <input
                type="email"
                required
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Privacy Regulation Standard</label>
            <select
              value={regulation}
              onChange={(e) => setRegulation(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="GDPR Article 17">GDPR Article 17 (Right to Erasure)</option>
              <option value="CCPA/CPRA">California CCPA/CPRA Deletion Mandate</option>
              <option value="HIPAA">HIPAA Medical PII De-identification</option>
              <option value="LGPD">Brazil LGPD Art. 18 Erasure</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Historical Email Aliases (comma separated)</label>
            <input
              type="text"
              placeholder="j.doe@alumni.org, johnny.d@oldwork.com"
              value={prevEmails}
              onChange={(e) => setPrevEmails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Previous Names / Maiden Names (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Johnathan Doe, J. Doe"
              value={prevNames}
              onChange={(e) => setPrevNames(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Legacy IDs (Mergers / Oracle / Salesforce)</label>
            <input
              type="text"
              placeholder="e.g. LEGACY-USR-44012"
              value={legacyIds}
              onChange={(e) => setLegacyIds(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md"
            >
              Initialize Audit Profile
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
