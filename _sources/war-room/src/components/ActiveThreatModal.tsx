import React from 'react';
import { 
  ShieldAlert, 
  X, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Lock, 
  RefreshCw, 
  Eye 
} from 'lucide-react';
import { ForensicBlock } from '../types';

interface ActiveThreatModalProps {
  block: ForensicBlock | null;
  onClose: () => void;
}

export const ActiveThreatModal: React.FC<ActiveThreatModalProps> = ({ block, onClose }) => {
  if (!block) return null;

  const isRCE = block.threatType.toLowerCase().includes('rce') || block.threatType.toLowerCase().includes('skadevare');
  const isSQL = block.threatType.toLowerCase().includes('sql');
  const isZeroDay = block.threatType.toLowerCase().includes('zero-day') || block.entropy > 5.2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="active-threat-modal"
        className="w-full max-w-xl bg-slate-950 border border-cyan-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/80 relative text-slate-100 font-mono"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
              WPWW WARROOM // 🛡️ AKTIVT FORSVAR UTLØST!
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {block.threatType}
            </h3>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">🌐 Angripers IP:</span>
            <span className="text-rose-400 font-bold text-sm">{block.attackerIp}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">📊 Shannon Entropi:</span>
            <span className="text-purple-300 font-bold">
              {block.entropy.toFixed(2)} bits/byte {block.entropy > 5.2 ? '(Zero-Day Nivå)' : ''}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">⚡ Iverksatt Mottiltak:</span>
            <span className="text-cyan-300 font-bold">{block.counterMeasure}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">🪤 Honeypot Sandboks:</span>
            <span className="text-emerald-400 font-semibold">Aktiv (Fanget & Isolert)</span>
          </div>

          <div className="py-1">
            <span className="text-slate-400 block mb-1">Fanget Payload Trace:</span>
            <code className="block bg-slate-950 p-2.5 rounded border border-slate-800 text-amber-300 break-all text-[11px]">
              {block.payload}
            </code>
          </div>

          <div className="pt-2">
            <span className="text-slate-400 block text-[10px]">WORM SHA-256 Hash-bevis:</span>
            <code className="text-[10px] text-emerald-400 break-all block bg-slate-950 p-1.5 rounded border border-slate-800">
              {block.currentHash}
            </code>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            id="btn-close-threat-modal"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Bekreft Nøytralisering & Lukk Rapport</span>
          </button>
        </div>
      </div>
    </div>
  );
};
