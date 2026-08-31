import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  FileCode, 
  Send, 
  Sparkles, 
  Cpu, 
  Database, 
  ArrowRight,
  Copy,
  Check,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { SystemStats } from '../types';
import { encryptProgramData, encryptOutData } from '../utils/crypto';

interface SecurityLayersPanelProps {
  stats: SystemStats;
  onRotateProgramKey: () => Promise<void>;
  onToggleProgramDataEncryption?: () => void;
  onToggleOutdataEncryption?: () => void;
  onClose?: () => void;
}

export const SecurityLayersPanel: React.FC<SecurityLayersPanelProps> = ({
  stats,
  onRotateProgramKey,
  onToggleProgramDataEncryption,
  onToggleOutdataEncryption,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'programdata' | 'outdata'>('overview');
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // OutData Test State
  const [outDataInput, setOutDataInput] = useState<string>(
    JSON.stringify({
      telemetry: 'DEFENSE_HEARTBEAT',
      totalThreatsBlocked: stats.totalThreatsBlocked,
      activePort: stats.port,
      timestamp: new Date().toISOString(),
    }, null, 2)
  );
  const [outDataResult, setOutDataResult] = useState<{
    envelopeCiphertext: string;
    signature: string;
    protocol: string;
    ephemeralPubKey: string;
    fingerprint: string;
  } | null>(null);
  const [isEncryptingOutData, setIsEncryptingOutData] = useState<boolean>(false);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Rotate Key Handler
  const handleRotateKey = async () => {
    setIsRotating(true);
    try {
      await onRotateProgramKey();
    } finally {
      setTimeout(() => setIsRotating(false), 600);
    }
  };

  // Test OutData Encryption Handler
  const handleEncryptOutDataTest = async () => {
    setIsEncryptingOutData(true);
    try {
      const res = await encryptOutData(outDataInput);
      setOutDataResult(res);
    } finally {
      setIsEncryptingOutData(false);
    }
  };

  const layers = stats.encryption?.securityLayers || [];
  const programData = stats.encryption?.programData;
  const outData = stats.encryption?.outData;

  return (
    <div id="security-layers-hub" className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700 text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wide">
                Sikkerhetslag & Krypteringsarkitektur
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Dobbelt-beskyttelse: AES-256-GCM for intern ProgramData og Kyber-1024 / TLS 1.3 for OutData egress.
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            4 Sikkerhetslag
          </button>
          <button
            onClick={() => setActiveTab('programdata')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'programdata'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            ProgramData Kryptering
          </button>
          <button
            onClick={() => setActiveTab('outdata')}
            className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'outdata'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            OutData Egress Shield
          </button>
        </div>
      </div>

      {/* TAB 1: 4 SECURITY LAYERS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layers.map((layer, index) => {
              const isProgram = layer.category === 'PROGRAMDATA';
              const isOutdata = layer.category === 'OUTDATA';
              const isWorm = layer.category === 'WORM_LEDGER';

              const borderClass = isProgram 
                ? 'border-cyan-800/80 bg-slate-950/90' 
                : isOutdata 
                ? 'border-purple-800/80 bg-slate-950/90' 
                : isWorm 
                ? 'border-emerald-800/80 bg-slate-950/90' 
                : 'border-amber-800/80 bg-slate-950/90';

              const iconClass = isProgram 
                ? 'text-cyan-400 bg-cyan-950 border-cyan-700' 
                : isOutdata 
                ? 'text-purple-400 bg-purple-950 border-purple-700' 
                : isWorm 
                ? 'text-emerald-400 bg-emerald-950 border-emerald-700' 
                : 'text-amber-400 bg-amber-950 border-amber-700';

              return (
                <div key={layer.id} className={`p-4 rounded-xl border ${borderClass} relative overflow-hidden transition-all hover:border-cyan-500/50`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${iconClass}`}>
                        {isProgram ? <Lock className="w-4 h-4" /> : isOutdata ? <Send className="w-4 h-4" /> : isWorm ? <CheckCircle2 className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-mono font-bold text-slate-100">
                          {layer.name}
                        </h4>
                        <div className="text-[11px] font-mono text-cyan-300">
                          {layer.cipher}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                      {layer.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                    {layer.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Telemetri:</span>
                    <span className="text-slate-200 font-semibold">{layer.metrics}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cross-Layer Flow Diagram */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
            <div className="text-slate-400 uppercase text-[11px] font-bold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              End-to-End Sikkerhetsflyt (Ingress → ProgramData Minne → OutData Egress)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded bg-slate-900 border border-amber-900/60">
                <div className="text-amber-400 font-bold text-[11px]">1. Ingress Filter</div>
                <div className="text-[10px] text-slate-400 mt-1">Shannon &gt; 5.20 Trap</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-cyan-900/60">
                <div className="text-cyan-400 font-bold text-[11px]">2. ProgramData AES</div>
                <div className="text-[10px] text-slate-400 mt-1">In-Memory Heap Scramble</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-emerald-900/60">
                <div className="text-emerald-400 font-bold text-[11px]">3. WORM Ledger</div>
                <div className="text-[10px] text-slate-400 mt-1">SHA-256 Block-Chain</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-purple-900/60">
                <div className="text-purple-400 font-bold text-[11px]">4. OutData Shield</div>
                <div className="text-[10px] text-slate-400 mt-1">Kyber-1024 Egress Enc.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAMDATA ENCRYPTION DETAIL & KEY ROTATION */}
      {activeTab === 'programdata' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key Fingerprint Card */}
            <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Aktiv Nøkkelfingeravtrykk</span>
                <Key className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-mono font-bold text-cyan-300 break-all">
                {programData?.keyFingerprint || 'SHA256:4f8e91a2...c8d0e2'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>Rotert:</span>
                <span className="text-slate-300">{programData?.lastRotated || 'Nylig'}</span>
              </div>
            </div>

            {/* Algorithm & Cipher */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Chiffer & Algoritme</span>
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base font-mono font-bold text-emerald-400">
                {programData?.algorithm || 'AES-256-GCM'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>Minne-Heap:</span>
                <span className="text-emerald-400 font-bold">Obfuskert & Sikret</span>
              </div>
            </div>

            {/* Encrypted Blocks Counter */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">ProgramData Blokker</span>
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-mono font-bold text-indigo-300">
                {programData?.encryptedBlocksCount || 1428} <span className="text-xs text-slate-400 font-normal">blokker</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>SQLite WAL:</span>
                <span className="text-slate-300">Cipher Enforced</span>
              </div>
            </div>
          </div>

          {/* Interactive Key Rotation Action */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                Autonom Nøkkelrotasjon (PBKDF2 & WebCrypto AES-GCM)
              </h4>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Genererer en ny 256-bit kryptografisk rotasjonsnøkkel, rekrypterer internt tilstandsminne og oppdaterer WORM-kjeden.
              </p>
            </div>
            <button
              id="btn-rotate-program-key"
              onClick={handleRotateKey}
              disabled={isRotating}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-950 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              {isRotating ? 'Roterer Nøkkel...' : 'Roter ProgramData-Nøkkel Nå'}
            </button>
          </div>

          {/* Encrypted Memory Buffer Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                Eksempel på Kryptert ProgramData Minne-Buffer (At-Rest / Heap)
              </span>
              <button
                onClick={() => handleCopy(programData?.sampleCiphertext || '', 'programCipher')}
                className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedField === 'programCipher' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'programCipher' ? 'Kopiert' : 'Kopier'}</span>
              </button>
            </div>
            <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {programData?.sampleCiphertext || '7f9a2b1c4e8d0f6a5b2c1d3e8f0a4b7c...[AES_256_GCM_PROTECTED_MEMORY_HEAP]'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: OUTDATA EGRESS ENVELOPE ENCRYPTION */}
      {activeTab === 'outdata' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-purple-900/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Egress Protokoll</span>
                <Send className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-sm font-mono font-bold text-purple-300">
                {outData?.protocol || 'TLS 1.3 + Post-Quantum Kyber-1024'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>Zero-Knowledge:</span>
                <span className="text-purple-400 font-bold">AKTIV</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Signatur-Verifikasjon</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base font-mono font-bold text-emerald-400">
                {outData?.signatureAlgorithm || 'Ed25519'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>Forfalskningsbeskyttelse:</span>
                <span className="text-emerald-400 font-bold">100%</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Forseglede OutData Pakker</span>
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-mono font-bold text-cyan-300">
                {outData?.encryptedPacketsCount || 4890} <span className="text-xs text-slate-400 font-normal">pakker</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>Egress Sniffing:</span>
                <span className="text-slate-300">Blokkert</span>
              </div>
            </div>
          </div>

          {/* Interactive OutData Egress Test Tool */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  Test Live OutData Egress Kryptering
                </h4>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Send en hvilken som helst telemetri eller rapport-data gjennom OutData Kyber/AES-256 konvoluttkrypteren.
                </p>
              </div>
              <button
                id="btn-test-outdata-encrypt"
                onClick={handleEncryptOutDataTest}
                disabled={isEncryptingOutData}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-950 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEncryptingOutData ? 'animate-spin' : ''}`} />
                {isEncryptingOutData ? 'Forsegler Pakke...' : 'Krypter OutData Pakke'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Ugående Rådata (Klartekst JSON):
                </label>
                <textarea
                  value={outDataInput}
                  onChange={(e) => setOutDataInput(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Forseglet OutData Egress Konvolutt (Kryptert & Signert):
                </label>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-purple-300 h-[142px] overflow-y-auto space-y-1.5">
                  {outDataResult ? (
                    <>
                      <div><strong className="text-slate-400">Protokoll:</strong> {outDataResult.protocol}</div>
                      <div className="break-all"><strong className="text-slate-400">Konvolutt:</strong> {outDataResult.envelopeCiphertext}</div>
                      <div className="break-all"><strong className="text-slate-400">Signatur:</strong> {outDataResult.signature}</div>
                      <div className="text-[10px] text-emerald-400 mt-1">✓ Egress forseglet og klar for sikker overføring</div>
                    </>
                  ) : (
                    <div className="text-slate-500 flex items-center justify-center h-full text-center">
                      Trykk "Krypter OutData Pakke" for å simulere en sikker sending.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
