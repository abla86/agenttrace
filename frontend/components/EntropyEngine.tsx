import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  HelpCircle, 
  Activity, 
  Binary, 
  Sliders, 
  AlertCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { calculateShannonEntropy } from '../utils/crypto';

export const EntropyEngine: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    'x9f8a7b6c5d4e3f2_MUTATED_ZERO_DAY_PAYLOAD_STREAM_0xFF_90_XOR_OBFUSCATED'
  );

  const entropy = calculateShannonEntropy(inputText);

  // Compute character distribution for histogram
  const charDistribution = useMemo(() => {
    if (!inputText) return [];
    const counts: { [key: string]: number } = {};
    for (const ch of inputText) {
      counts[ch] = (counts[ch] || 0) + 1;
    }
    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16);
    const max = Math.max(...entries.map(([, c]) => c), 1);
    return entries.map(([char, count]) => ({
      char: char === ' ' ? 'SPC' : char === '\n' ? 'LF' : char,
      count,
      pct: (count / max) * 100,
    }));
  }, [inputText]);

  const presets = [
    {
      label: '1. Standard Norsk Tekst (Lav Entropi)',
      value: 'Dette er en helt vanlig systemtekst som sendes til forsvarsverket.',
    },
    {
      label: '2. SQL-Spørring (Medium Entropi)',
      value: 'SELECT id, username, password_hash FROM admin_accounts WHERE 1=1 UNION SELECT 1,2,3',
    },
    {
      label: '3. Obfuskert Zero-Day Skadevare (Høy Entropi > 5.2)',
      value: 'x9f8a7b6c5d4e3f2_MUTATED_ZERO_DAY_PAYLOAD_STREAM_0xFF_90_XOR_OBFUSCATED_98a7f6c4b3a2d1e0',
    },
    {
      label: '4. Komprimert / Kryptert Binærstream (Maksimal Entropi ~7.0+)',
      value: 'G3k9#vL$8z@1mP!4qW&7xR*2jN%5yB^9tF(0sD)3hC_6aE+8uK=1oJ?4wT~7zX`2yU|5vO>8rI<0eQ',
    },
  ];

  return (
    <div id="entropy-engine-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Binary className="w-4 h-4 text-purple-400" />
            Shannon Entropi Analyse-Motor (Zero-Day Deteksjon)
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            H(X) = -Σ P(x) log₂ P(x)
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Tradisjonelle brannmurer ser kun etter kjente tekstmønstre. WPWW WarRoom analyserer matematisk informasjons-tetthet (Shannon Entropi) for å nøytralisere obfuskerte zero-day payloads og polymorfiske kodesegmenter før de eksekveres.
        </p>
      </div>

      {/* Real-Time Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input and Presets (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
              Test-Payload til Entropi-Beregning:
            </label>
            <textarea
              id="input-entropy-test-string"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Skriv inn tekst, kode eller obfuskert payload..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <span className="text-xs font-mono text-slate-400 block mb-2">
              Forhåndsdefinerte Test-Eksempler:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(preset.value)}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-left font-mono text-[11px] text-slate-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Byte Character Frequency Distribution */}
          <div className="pt-2">
            <span className="text-xs font-mono text-slate-400 block mb-2">
              Tegn- og Byte-fordeling (Topp 16 tegnfrekvenser):
            </span>
            <div className="flex items-end gap-1.5 h-24 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              {charDistribution.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div
                    className="w-full bg-purple-500/80 rounded-t transition-all"
                    style={{ height: `${item.pct}%` }}
                    title={`Tegn '${item.char}': ${item.count} forekomster`}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[14px]">
                    {item.char}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Shannon Meter & Verdict (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Sanntids Entropi-Måler (0.00 → 8.00 bits/byte)
            </div>

            {/* Big Entropy Meter Badge */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center my-2">
              <div className="text-4xl font-bold font-mono text-purple-400">
                {entropy.toFixed(3)}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Shannon Informasjons-Tetthet
              </div>

              {/* Progress Gauge Bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-800 relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    entropy > 5.2 ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
                    entropy > 4.0 ? 'bg-gradient-to-r from-cyan-500 to-purple-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (entropy / 8.0) * 100)}%` }}
                ></div>
                {/* 5.2 threshold indicator marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                  style={{ left: `${(5.2 / 8.0) * 100}%` }}
                  title="5.20 Zero-Day Terskel"
                ></div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0.0 (Lav)</span>
                <span className="text-rose-400">Terskel: 5.20</span>
                <span>8.0 (Maks)</span>
              </div>
            </div>

            {/* Verdict Card */}
            <div className={`p-3.5 rounded-lg border text-xs font-mono mt-3 ${
              entropy > 5.2 
                ? 'bg-rose-950/60 border-rose-800 text-rose-200' 
                : entropy > 3.8
                ? 'bg-amber-950/50 border-amber-800 text-amber-200'
                : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
            }`}>
              <div className="font-bold mb-1 flex items-center gap-1.5">
                {entropy > 5.2 ? '🚨 ZERO-DAY TRUSSEL DETEKTERT' : '✓ Normal / Lav Entropi'}
              </div>
              <p className="text-[11px] opacity-90">
                {entropy > 5.2
                  ? 'Payload inneholder unormalt høy matematisk entropi (> 5.20). WPWW WarRoom iverksetter automatisk Phantom Loop for å fange trusselen i sandboksen.'
                  : 'Payload har naturlig tegnvariasjon innenfor tillatte rammer for vanlige HTTP-forespørsler.'}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-slate-900/60 p-2.5 rounded border border-slate-800">
            💡 <strong>Hvorfor fungerer dette?</strong> Når skadevareutviklere forsøker å omgå tradisjonelle ordfiltre ved å XOR-obfuskere eller kryptere payloaden, presses entropien over 5.20 bits/byte. Vår entropimotor fanger dette matematisk!
          </div>
        </div>
      </div>
    </div>
  );
};
