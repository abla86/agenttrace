import React, { useState } from 'react';
import { 
  Award, 
  Swords, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Activity, 
  Flame, 
  Crosshair,
  Lock,
  Skull
} from 'lucide-react';
import { BattleClashRecord, CyberGladiator, BattleReport } from '../types';

interface GodModeBattleLogProps {
  clashHistory: BattleClashRecord[];
  onClearHistory: () => void;
  onSelectClashForInspection: (clash: BattleClashRecord) => void;
}

export const GodModeBattleLog: React.FC<GodModeBattleLogProps> = ({
  clashHistory,
  onClearHistory,
  onSelectClashForInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFactor, setFilterFactor] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Filter clash records
  const filteredClashes = clashHistory.filter((clash) => {
    const matchesSearch = 
      clash.winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clash.loser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clash.decisiveStatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clash.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFactor = filterFactor === 'ALL' || clash.decisiveFactor === filterFactor;
    const matchesCategory = 
      filterCategory === 'ALL' || 
      clash.winner.category === filterCategory ||
      clash.loser.category === filterCategory;

    return matchesSearch && matchesFactor && matchesCategory;
  });

  // Calculate aggregated analytics
  const totalClashes = clashHistory.length;
  const defenderWins = clashHistory.filter((c) => c.winner.category === 'AI_DEFENDER').length;
  const defenderWinRate = totalClashes > 0 ? Math.round((defenderWins / totalClashes) * 100) : 0;
  const avgFlawSeverity = totalClashes > 0 
    ? Math.round(clashHistory.reduce((acc, c) => acc + c.vulnerabilitySeverityFound, 0) / totalClashes) 
    : 0;
  const maxEntropyRecorded = totalClashes > 0 
    ? Math.max(...clashHistory.map((c) => c.peakEntropy)) 
    : 0;

  return (
    <div id="god-mode-battle-log" className="space-y-5">
      {/* Header Banner & Stats Overview */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Swords className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wide">
                Sanntids Kamp-Logg & Sammenstøt-Data
              </h2>
              <p className="text-xs text-slate-400">
                Oversikt over alle virus-sammenstøt, hvem som vant, og de avgjørende statistikkene og feilene som ble avdekket.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(clashHistory, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wpww-battle-logs-${Date.now()}.json`;
                a.click();
              }}
              disabled={totalClashes === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksporter Logg (JSON)</span>
            </button>

            <button
              onClick={onClearHistory}
              disabled={totalClashes === 0}
              className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tøm Historikk</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Totale Sammenstøt</span>
            <div className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>{totalClashes}</span>
              <span className="text-[10px] text-emerald-400 font-normal">Registrert i WAL</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Forsvarer Seiersrate</span>
            <div className="text-xl font-extrabold text-cyan-300 flex items-center gap-2">
              <span>{defenderWinRate}%</span>
              <span className="text-[10px] text-cyan-400 font-normal">({defenderWins} seire)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Snitt Sårbarhetsgrad Avdekket</span>
            <div className={`text-xl font-extrabold flex items-center gap-2 ${
              avgFlawSeverity > 60 ? 'text-rose-400' : avgFlawSeverity > 30 ? 'text-amber-300' : 'text-emerald-400'
            }`}>
              <span>{avgFlawSeverity}%</span>
              <span className="text-[10px] text-slate-400 font-normal">flaw score</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Topp Kaos-Entropi</span>
            <div className="text-xl font-extrabold text-purple-300 flex items-center gap-2">
              <span>{maxEntropyRecorded.toFixed(2)}</span>
              <span className="text-[10px] text-purple-400 font-normal">bits / byte</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Søk etter kriger, virusnavn, avgjørende statistikk eller ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Factor filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Avgjørende Faktor:</span>
            <select
              value={filterFactor}
              onChange={(e) => setFilterFactor(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Alle Faktorer</option>
              <option value="ENTROPY">Shannon Entropi Overvekt</option>
              <option value="MIRROR_JAMMING">Mirror Jamming Refleksjon</option>
              <option value="ZERO_DAY_EXPLOIT">Zero-Day Sårbarhet</option>
              <option value="HEAP_OVERFLOW">Heap Buffer Overflow</option>
              <option value="KYBER_SHIELD">Kyber-1024 Barriere</option>
              <option value="BLACKOUT_BAN">Blackout Auto-Isolation</option>
              <option value="CRITICAL_SPEED">Lynrask Hastighet</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Alle Roller</option>
              <option value="AI_DEFENDER">AI Forsvarer</option>
              <option value="VIRUS">Virus / SQLi</option>
              <option value="ZERO_DAY">Zero-Day</option>
              <option value="RANSOMWARE">Ransomware</option>
              <option value="WIPER">Wiper</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clash Records List */}
      {filteredClashes.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 text-center font-mono text-xs space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm font-bold">Ingen kampsammenstøt matcher søkekriteriene.</p>
          <p className="text-slate-500 text-xs">
            Kjør en kamp i <strong>Virus Kamparena</strong> eller start en simulering i <strong>Inntrengningsfilm-Modus</strong> for å loggføre sanntidsdata!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredClashes.map((clash) => {
            const isWinnerDefender = clash.winner.category === 'AI_DEFENDER';

            return (
              <div
                key={clash.id}
                className={`bg-slate-950 border rounded-2xl p-4 sm:p-5 shadow-xl transition-all font-mono text-xs ${
                  isWinnerDefender
                    ? 'border-cyan-500/40 hover:border-cyan-400'
                    : 'border-rose-600/40 hover:border-rose-500'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{clash.winner.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm sm:text-base">
                          {clash.winner.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          isWinnerDefender ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}>
                          👑 VANT ({clash.winner.category})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Beseiret <strong className="text-slate-300">{clash.loser.name}</strong> ({clash.loser.avatar}) etter {clash.rounds} runder
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      Tid: {new Date(clash.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => onSelectClashForInspection(clash)}
                      className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspiser Bevis</span>
                    </button>
                  </div>
                </div>

                {/* Decisive Stats & Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                  {/* Decisive Statistic Banner */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Avgjørende Statistikk
                    </span>
                    <div className="text-slate-100 font-bold text-xs">
                      {clash.decisiveStatName}
                    </div>
                    <div className="text-[11px] text-amber-300">
                      Verdi: {clash.decisiveStatValue}
                    </div>
                  </div>

                  {/* Vulnerability Severity Discovered */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                      <span>Avdekket Feilgrad / Sårbarhet</span>
                      <span className="font-bold text-slate-300">{clash.vulnerabilitySeverityFound}%</span>
                    </span>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          clash.vulnerabilitySeverityFound > 70 ? 'bg-rose-500' :
                          clash.vulnerabilitySeverityFound > 35 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${clash.vulnerabilitySeverityFound}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {clash.vulnerabilitySeverityFound > 70 ? 'Kritisk sikkerhetshull utnyttet' :
                       clash.vulnerabilitySeverityFound > 35 ? 'Middels sikkerhetsglipp nøytralisert' :
                       'Minimal sårbarhet – forsvaret stoppet angrepet umiddelbart'}
                    </p>
                  </div>

                  {/* Combat Stats Grid */}
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[9px] text-slate-400">Skade</div>
                      <div className="text-xs font-bold text-rose-300">{clash.totalDamage}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[9px] text-slate-400">Entropi</div>
                      <div className="text-xs font-bold text-purple-300">{clash.peakEntropy.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[9px] text-slate-400">Krits</div>
                      <div className="text-xs font-bold text-amber-300">{clash.criticalHits}</div>
                    </div>
                  </div>
                </div>

                {/* Footer details: Decisive Exploit & Hash */}
                <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-300">Avgjørende Handling:</strong>
                    <span className="text-cyan-300">{clash.detailedReport?.decisiveExploit || 'Kjerne-refleksjon'}</span>
                  </div>
                  <div className="text-slate-500 truncate max-w-xs">
                    WORM Hash: <span className="text-slate-400">{clash.detailedReport?.wormProofHash || 'SHA-256 Validert'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
