import React from 'react';
import { 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  Radio, 
  FileCode2, 
  Layers, 
  Sparkles, 
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { SecurityDefinitions, ThreatFeedSource } from '../types';

interface SyncDefinitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitions: SecurityDefinitions;
  isSyncing: boolean;
  syncProgress: number; // 0 - 100
  syncStepText: string;
  onTriggerSync: () => void;
}

export const SyncDefinitionsModal: React.FC<SyncDefinitionsModalProps> = ({
  isOpen,
  onClose,
  definitions,
  isSyncing,
  syncProgress,
  syncStepText,
  onTriggerSync,
}) => {
  if (!isOpen) return null;

  return (
    <div id="sync-definitions-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-xl max-w-2xl w-full flex flex-col shadow-2xl shadow-cyan-950/80 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-mono font-bold text-slate-100 flex items-center gap-2 text-base">
                Sikkerhetsdefinisjoner & Trusselfeeds
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                  {definitions.version}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Autonom oppdatering av trusselsignaturer, YARA-regler og CVE-databaser.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Sync Progress / Status Bar */}
          {isSyncing ? (
            <div className="bg-cyan-950/40 border border-cyan-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-semibold flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {syncStepText}
                </span>
                <span className="text-cyan-400 font-bold">{syncProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-cyan-900">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Sist synkronisert: <strong className="text-emerald-400">{definitions.lastSynced}</strong>
                </span>
              </div>
              <button
                id="btn-modal-trigger-sync"
                onClick={onTriggerSync}
                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-colors shadow-sm"
              >
                Start Ny Synkronisering
              </button>
            </div>
          )}

          {/* Stats Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Signaturer Totalt</div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {definitions.totalSignatures.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                +{definitions.newSignaturesAdded} i siste oppdatering
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
              <div className="text-[11px] font-mono text-slate-400 uppercase">YARA Regler</div>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                {definitions.activeYaraRules.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Heuristiske mønstre</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg col-span-2 sm:col-span-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase">CVE Database</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {definitions.cveDatabaseCount.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Sårbarhets-hasher</span>
            </div>
          </div>

          {/* Connected Feeds List */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2.5 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Tilkoblede Trusselfeeds & CERT-Reléer
            </h4>
            <div className="space-y-2">
              {definitions.feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <div>
                      <div className="font-semibold text-slate-200">{feed.name}</div>
                      <div className="text-[10px] text-slate-400">{feed.provider}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                    <span>{feed.signaturesCount.toLocaleString()} signaturer</span>
                    <span className="text-cyan-400">{feed.latencyMs}ms</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px]">
                      {feed.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Kryptografisk verifisering av trusselfeed: SHA-256 Intakt</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
};
