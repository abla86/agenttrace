import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  Link2, 
  Hash, 
  Clock, 
  Terminal, 
  AlertOctagon, 
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  FileText
} from 'lucide-react';
import { ForensicBlock, ExportFormat } from '../types';
import { sha256 } from '../utils/crypto';
import { playVerifyChime } from '../utils/audio';

interface ForensicChainProps {
  chain: ForensicBlock[];
  onExportReport: (format: ExportFormat) => void;
  onOpenExportModal?: (format?: ExportFormat) => void;
  onTamperBlock: (blockId: number) => void;
  onRestoreChain: () => void;
}

export const ForensicChain: React.FC<ForensicChainProps> = ({
  chain,
  onExportReport,
  onOpenExportModal,
  onTamperBlock,
  onRestoreChain,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenBlockId?: number;
    message: string;
  } | null>(null);

  const [expandedBlockId, setExpandedBlockId] = useState<number | null>(null);

  // Perform real-time cryptographic verification of the SHA-256 chain
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    // Artificial tactical delay to give high-tech feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    let prevHash = '0'.repeat(64);
    let broken = false;
    let brokenId = 0;

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      if (block.tampered) {
        broken = true;
        brokenId = block.id;
        break;
      }

      if (block.previousHash !== prevHash) {
        broken = true;
        brokenId = block.id;
        break;
      }

      const raw = `${block.timestamp}${block.attackerIp}${block.threatType}${block.counterMeasure}${block.entropy}${block.payload}${prevHash}`;
      const calculated = await sha256(raw);

      if (calculated !== block.currentHash) {
        broken = true;
        brokenId = block.id;
        break;
      }
      prevHash = block.currentHash;
    }

    setIsVerifying(false);
    if (broken) {
      setVerificationResult({
        valid: false,
        brokenBlockId: brokenId,
        message: `🚨 KRITISK SIKKERHETSAVVIK: Uautorisert manipulering oppdaget ved Blokk #${brokenId}! SHA-256 hash-kjeden matcher ikke.`,
      });
    } else {
      playVerifyChime();
      setVerificationResult({
        valid: true,
        message: `✅ KRYPTOGRAFISK GODKJENT: Alle ${chain.length} bevisblokker er 100% intakte og verifisert mot WORM-standarden.`,
      });
    }
  };

  return (
    <div id="forensic-chain-container" className="space-y-6">
      {/* Top Banner & Verification Action */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-400" />
              Kryptografisk WORM Bevis-Logg (Write Once, Read Many)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Hver hendelse forsegles med SHA-256 hash-kjeding. Ethvert forsøk på å endre historiske bevis oppdages umiddelbart.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-verify-chain"
              onClick={handleVerifyChain}
              disabled={isVerifying}
              className="py-1.5 px-3.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-mono text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isVerifying ? 'Verifiserer Kjede...' : 'Verifiser Kjedeintegritet'}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                id="btn-export-json"
                onClick={() => onExportReport('json')}
                className="py-1.5 px-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
                title="Last ned offisiell JSON forensisk rapport"
              >
                <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                <span>JSON</span>
              </button>
              <button
                id="btn-export-csv"
                onClick={() => onExportReport('csv')}
                className="py-1.5 px-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
                title="Last ned CSV tabell"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
              {onOpenExportModal && (
                <button
                  id="btn-open-multi-export"
                  onClick={() => onOpenExportModal()}
                  className="py-1.5 px-3 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Åpne eksportsenter med 8 formater (STIX, XML, Markdown, HTML, Syslog, YARA)"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flere Formater (8)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs font-mono flex items-center justify-between gap-3 ${
              verificationResult.valid
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border-rose-700 text-rose-200 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2">
              {verificationResult.valid ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{verificationResult.message}</span>
            </div>

            {!verificationResult.valid && (
              <button
                id="btn-restore-chain"
                onClick={() => {
                  onRestoreChain();
                  setVerificationResult(null);
                }}
                className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 border border-rose-700 text-xs font-mono flex items-center gap-1 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" /> Gjenopprett Kjeden
              </button>
            )}
          </div>
        )}

        {/* Interactive Tamper Proof Sandbox Testing Demo */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sikkerhetsdemonstrasjon: Test hva som skjer dersom en angriper endrer en loggoppføring:</span>
          </span>
          <button
            id="btn-tamper-simulation"
            onClick={() => {
              if (chain.length > 1) {
                onTamperBlock(chain[1].id);
                setVerificationResult({
                  valid: false,
                  brokenBlockId: chain[1].id,
                  message: `🚨 MANIPULERING SIMULERT: Payload i Blokk #${chain[1].id} ble tuklet med! Kjør verifisering for å se integritetsbruddet.`,
                });
              }
            }}
            className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/80 transition-colors"
          >
            Simuler Uautorisert Tukling i Blokk #2
          </button>
        </div>
      </div>

      {/* Block-by-Block Visual Ledger */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider px-1">
          Forensiske Blokk-Poster ({chain.length} Totalt i WORM-kjeden):
        </h3>

        {chain.map((block, index) => {
          const isExpanded = expandedBlockId === block.id;
          const isGenesis = index === 0;

          return (
            <div
              key={block.id}
              id={`forensic-block-${block.id}`}
              className={`rounded-xl border transition-all ${
                block.tampered
                  ? 'bg-rose-950/40 border-rose-700 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Block Header Summary */}
              <div
                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    block.tampered
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-600'
                      : 'bg-slate-900 text-cyan-400 border border-cyan-900'
                  }`}>
                    #{block.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {block.threatType}
                      </span>
                      {isGenesis && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          GENESIS BLOKK
                        </span>
                      )}
                      {block.tampered && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse font-bold">
                          TUKLET MED!
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>IP: <strong className="text-rose-400">{block.attackerIp}</strong></span>
                      <span>•</span>
                      <span>Entropi: <strong className="text-purple-300">{block.entropy.toFixed(2)}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" /> {new Date(block.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 block">SHA-256 Fingeravtrykk:</span>
                    <span className="text-[11px] text-emerald-400">
                      {block.currentHash.substring(0, 16)}...{block.currentHash.substring(48)}
                    </span>
                  </div>
                  <span className="text-slate-500">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Block Expanded Deep Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-900 bg-slate-900/40 rounded-b-xl space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Foregående Hash (Previous):</span>
                      <code className="text-[11px] text-slate-300 break-all">{block.previousHash}</code>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Nåværende Forseglet Hash (Current SHA-256):</span>
                      <code className="text-[11px] text-emerald-400 break-all">{block.currentHash}</code>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] mb-1">Fanget Payload Dump:</span>
                    <pre className="text-[11px] text-amber-300/90 whitespace-pre-wrap break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                      {block.payload}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                    <span>Aktivt Mottiltak: <strong className="text-cyan-300">{block.counterMeasure}</strong></span>
                    <span>Forseglet UTC: {block.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
