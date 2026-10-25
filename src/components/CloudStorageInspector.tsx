import React, { useState } from 'react';
import { CustomerProfile, CloudStorageConnectorConfig, CloudStorageProvider } from '../types/audit';
import { 
  Cloud, 
  Search, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw,
  FolderOpen,
  ArrowRight
} from 'lucide-react';

interface CloudStorageInspectorProps {
  customer: CustomerProfile;
  connectors: CloudStorageConnectorConfig[];
  onConfirmDeletion: (systemId: string, location: string) => void;
}

export const CloudStorageInspector: React.FC<CloudStorageInspectorProps> = ({
  customer,
  connectors,
  onConfirmDeletion,
}) => {
  const [selectedStorageId, setSelectedStorageId] = useState<string>(connectors[0]?.id || '');
  const activeCloud = connectors.find((c) => c.id === selectedStorageId) || connectors[0];
  const [selectedObjectKey, setSelectedObjectKey] = useState<string>(
    activeCloud?.objects[0]?.keyOrPath || ''
  );
  const [searchPrefix, setSearchPrefix] = useState<string>('');
  const [isScanningObject, setIsScanningObject] = useState<boolean>(false);
  const [objectScanResult, setObjectScanResult] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<boolean>(true);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  const activeObj = activeCloud?.objects.find((o) => o.keyOrPath === selectedObjectKey) || activeCloud?.objects[0];

  // Filter objects by prefix search
  const filteredObjects = activeCloud?.objects.filter((obj) =>
    obj.keyOrPath.toLowerCase().includes(searchPrefix.toLowerCase())
  ) || [];

  // Re-authenticate API test
  const handleTestAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
    }, 500);
  };

  // Inspect object contents for customer identifiers
  const handleScanObject = (objKey: string) => {
    setSelectedObjectKey(objKey);
    setIsScanningObject(true);
    setObjectScanResult(null);

    const targetObj = activeCloud?.objects.find((o) => o.keyOrPath === objKey);

    setTimeout(() => {
      setIsScanningObject(false);
      if (targetObj?.containsGhost) {
        setObjectScanResult({
          status: 'GHOST_DETECTED',
          message: `Residual customer personal data detected inside object archive!`,
          matchedIdentifiers: [
            customer.primaryEmail,
            customer.currentIdentifiers.uuid,
            customer.currentIdentifiers.phoneNumber,
          ],
          hasWormLock: targetObj.isWormLocked,
          isVersionedGhost: targetObj.isVersionedGhost,
          storageClass: targetObj.storageClass,
          lineMatches: [
            `Line 4810: INSERT INTO "users" VALUES ('${customer.currentIdentifiers.uuid}', '${customer.canonicalName}', '${customer.primaryEmail}', '${customer.currentIdentifiers.phoneNumber}');`,
            `Line 4811: INSERT INTO "user_tokens" VALUES ('${customer.currentIdentifiers.uuid}', '${customer.historicalIdentifiers.hashedTokens[0] || 'token_hash'}');`,
          ],
        });
      } else {
        setObjectScanResult({
          status: 'CLEAN',
          message: `Clean: No customer identifiers matching current or historical aliases found.`,
          matchedIdentifiers: [],
          hasWormLock: targetObj?.isWormLocked || false,
          isVersionedGhost: false,
          storageClass: targetObj?.storageClass || 'STANDARD',
          lineMatches: [],
        });
      }
    }, 600);
  };

  // Purge / delete confirmation probe
  const handleConfirmObjectDeletion = () => {
    if (!activeObj) return;
    onConfirmDeletion(activeCloud.id, activeObj.keyOrPath);
    activeObj.containsGhost = false;
    setObjectScanResult({
      status: 'CLEAN',
      message: `Object deletion verified and tombstone confirmed in ${activeCloud.bucketOrContainer}.`,
      matchedIdentifiers: [],
      hasWormLock: false,
      isVersionedGhost: false,
      storageClass: activeObj.storageClass,
      lineMatches: [],
    });
  };

  // Generate Cloud CLI command based on provider
  const getCliCommand = () => {
    if (!activeObj) return '';
    if (activeCloud.provider === 'AWS_S3') {
      if (activeObj.isWormLocked) {
        return `# AWS S3 Object has WORM Compliance Lock! Apply legal override / lifecycle tombstone:\naws s3api put-object-legal-hold \\\n  --bucket ${activeCloud.bucketOrContainer} \\\n  --key "${activeObj.keyOrPath}" \\\n  --legal-hold Status=OFF\n\naws s3 rm "s3://${activeCloud.bucketOrContainer}/${activeObj.keyOrPath}"`;
      }
      return `aws s3 rm "s3://${activeCloud.bucketOrContainer}/${activeObj.keyOrPath}" --recursive`;
    } else if (activeCloud.provider === 'AZURE_BLOB') {
      return `az storage blob delete \\\n  --account-name ${activeCloud.name.toLowerCase().replace(/[^a-z0-9]/g, '')} \\\n  --container-name "${activeCloud.bucketOrContainer}" \\\n  --name "${activeObj.keyOrPath}" \\\n  --auth-mode login`;
    } else {
      return `gcloud storage rm "gs://${activeCloud.bucketOrContainer}/${activeObj.keyOrPath}"`;
    }
  };

  const copyCliToClipboard = () => {
    navigator.clipboard.writeText(getCliCommand());
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cloud Storage API Deep Object Inspector
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                AWS S3 • Azure Blob • Google Cloud Storage
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Authenticate with Cloud APIs, list bucket objects, detect unpurged snapshots, version residue, and WORM locks
            </p>
          </div>
        </div>

        {/* Cloud Provider Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Bucket / Container:</span>
            <select
              value={selectedStorageId}
              onChange={(e) => {
                setSelectedStorageId(e.target.value);
                const cloud = connectors.find((c) => c.id === e.target.value);
                if (cloud && cloud.objects[0]) {
                  setSelectedObjectKey(cloud.objects[0].keyOrPath);
                  setObjectScanResult(null);
                }
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-cyan-500"
            >
              {connectors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.provider})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTestAuth}
            disabled={isAuthenticating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAuthenticating ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span>{isAuthenticating ? 'Auth Check...' : 'API Auth: Verified'}</span>
          </button>
        </div>
      </div>

      {/* Main Cloud Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        
        {/* Left Column: Bucket Explorer & Object Listing */}
        <div className="lg:col-span-1 border border-slate-800 rounded-xl bg-slate-950/60 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Objects in Bucket</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">{activeCloud.provider}</span>
          </div>

          {/* Search Prefix Filter */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by prefix..."
              value={searchPrefix}
              onChange={(e) => setSearchPrefix(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Object List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[340px] pr-1">
            {filteredObjects.map((obj) => {
              const isSelected = selectedObjectKey === obj.keyOrPath;
              return (
                <button
                  key={obj.keyOrPath}
                  onClick={() => handleScanObject(obj.keyOrPath)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-cyan-500/80 bg-cyan-500/10 text-white font-semibold'
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="truncate text-slate-200">{obj.keyOrPath.split('/').pop()}</p>
                    <p className="text-[10px] text-slate-500 truncate">{obj.keyOrPath}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                        {obj.storageClass}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {(obj.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>

                  {obj.containsGhost ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap flex-shrink-0">
                      Ghost
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap flex-shrink-0">
                      Clean
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bucket Metadata Overview */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-mono text-[10px] uppercase text-slate-500">Bucket Properties</p>
            <p className="flex justify-between">
              <span>Region:</span> <span className="font-mono text-slate-300">{activeCloud.region}</span>
            </p>
            <p className="flex justify-between">
              <span>Versioning:</span> <span className="font-mono text-slate-300">{activeCloud.versioningEnabled ? 'Enabled' : 'Disabled'}</span>
            </p>
            <p className="flex justify-between">
              <span>WORM Lock:</span> 
              <span className={`font-mono ${activeCloud.wormLockActive ? 'text-purple-400 font-semibold' : 'text-slate-400'}`}>
                {activeCloud.wormLockActive ? 'Compliance Mode' : 'None'}
              </span>
            </p>
          </div>
        </div>

        {/* Right Column: Object Deep Inspection & Deletion Verification */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          
          {/* Active Object Summary Card */}
          {activeObj && (
            <div className="border border-slate-800 rounded-xl bg-slate-950/70 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeCloud.provider} Object
                  </span>
                  <h4 className="text-sm font-bold text-white font-mono mt-1 break-all">
                    {activeObj.keyOrPath}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScanObject(activeObj.keyOrPath)}
                    disabled={isScanningObject}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
                  >
                    <Search className={`w-3.5 h-3.5 ${isScanningObject ? 'animate-spin' : ''}`} />
                    <span>{isScanningObject ? 'Inspecting Payload...' : 'Scan Object Stream for PII'}</span>
                  </button>

                  {activeObj.containsGhost && (
                    <button
                      onClick={handleConfirmObjectDeletion}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge & Tombstone</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Storage Tier</p>
                  <p className="font-semibold text-slate-200 mt-0.5 font-mono">{activeObj.storageClass}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Object Size</p>
                  <p className="font-semibold text-slate-200 mt-0.5 font-mono">
                    {(activeObj.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">WORM Immutable Status</p>
                  <p className={`font-semibold mt-0.5 font-mono flex items-center gap-1 ${
                    activeObj.isWormLocked ? 'text-purple-400' : 'text-slate-400'
                  }`}>
                    {activeObj.isWormLocked ? <Lock className="w-3 h-3" /> : null}
                    {activeObj.isWormLocked ? 'Locked (WORM)' : 'Unlocked'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Version Residue</p>
                  <p className={`font-semibold mt-0.5 font-mono ${
                    activeObj.isVersionedGhost ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {activeObj.isVersionedGhost ? 'Hidden Version ID' : 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Deep Scan Result Banner */}
          {objectScanResult && (
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2 animate-in fade-in duration-150 ${
                objectScanResult.status === 'CLEAN'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {objectScanResult.status === 'CLEAN' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <h5 className="font-bold text-xs">{objectScanResult.message}</h5>
                  {objectScanResult.hasWormLock && (
                    <p className="text-[11px] text-purple-300 font-mono mt-0.5">
                      ⚠️ AWS/GCS Object Lock compliance policy prevents normal deletion until statutory date. Requires legal hold override tag.
                    </p>
                  )}
                </div>
              </div>

              {objectScanResult.lineMatches.length > 0 && (
                <div className="mt-2 bg-slate-950/90 rounded-lg p-3 border border-rose-900/60 font-mono text-[11px] text-rose-200 overflow-x-auto space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Extracted Snapshot PII Payloads:</p>
                  {objectScanResult.lineMatches.map((line: string, idx: number) => (
                    <p key={idx} className="bg-rose-950/40 p-1.5 rounded border border-rose-800/40">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cloud Storage CLI Purge Command Box */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Automated Cloud CLI Purge Command</span>
              </span>
              <button
                onClick={copyCliToClipboard}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto border border-slate-800">
              {getCliCommand()}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
