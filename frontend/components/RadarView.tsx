import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  Crosshair, 
  Radio, 
  Flame, 
  Database, 
  Zap, 
  Cpu, 
  Bug, 
  Eye, 
  Lock, 
  CheckCircle2,
  Layers,
  Send,
  Sparkles,
  Key,
  ShieldCheck
} from 'lucide-react';
import { SystemStats, RadarBlip, ForensicBlock } from '../types';
import { RadarTimelineChart } from './RadarTimelineChart';
import { SecurityLayersPanel } from './SecurityLayersPanel';

interface RadarViewProps {
  stats: SystemStats;
  blips: RadarBlip[];
  recentBlocks: ForensicBlock[];
  onTriggerQuickProbe: (typeId: number) => void;
  onSelectTab: (tabId: string) => void;
  onRotateProgramKey?: () => Promise<void>;
}

export const RadarView: React.FC<RadarViewProps> = ({
  stats,
  blips,
  recentBlocks,
  onTriggerQuickProbe,
  onSelectTab,
  onRotateProgramKey = async () => {},
}) => {
  const [selectedBlip, setSelectedBlip] = useState<RadarBlip | null>(null);
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [showLayersModal, setShowLayersModal] = useState<boolean>(false);
  const [showEmbeddedLayers, setShowEmbeddedLayers] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const latestBlock = recentBlocks[0];

  return (
    <div id="radar-view-container" className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div id="metric-threats-blocked" className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider">Trusler Nøytralisert</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.totalThreatsBlocked}</div>
          <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% autonom suksessrate
          </p>
        </div>

        <div id="metric-honeypot-trapped" className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider">Fanget i Honeypot</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats.honeypotTrappedCount}</div>
          <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span> Sinkhole & Sandboks aktiv
          </p>
        </div>

        <div id="metric-programdata-crypto" className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider">ProgramData Kryptering</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {stats.encryption?.programData?.algorithm || 'AES-256-GCM'}
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Heap & Minne-buffer sikret
          </p>
        </div>

        <div id="metric-outdata-crypto" className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider">OutData Egress Shield</span>
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {stats.encryption?.outData?.encryptedPacketsCount || 4890} <span className="text-sm text-slate-400 font-normal">pkts</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500"></span> Kyber-1024 + TLS 1.3
          </p>
        </div>
      </div>

      {/* Recharts Timeline Chart: totalThreatsBlocked over last 60 minutes */}
      <RadarTimelineChart
        stats={stats}
        onOpenLayersModal={() => setShowLayersModal(true)}
      />

      {/* Embedded Security Layers Toggle Bar */}
      <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-bold uppercase tracking-wider">
            4-Lags Sikkerhetsarkitektur & Krypteringsmodul
          </span>
        </div>
        <button
          onClick={() => setShowEmbeddedLayers(!showEmbeddedLayers)}
          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {showEmbeddedLayers ? 'Skjul Modul ▲' : 'Åpne ProgramData & OutData Modul ▼'}
        </button>
      </div>

      {/* Embedded Security Layers Panel if expanded */}
      {showEmbeddedLayers && (
        <SecurityLayersPanel
          stats={stats}
          onRotateProgramKey={onRotateProgramKey}
        />
      )}

      {/* Main Radar and Defense Tactics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tactical Radar Display (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-cyan-900/50 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                Autonom Sektor-Radar // Sanntids Trusselovervåkning
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>360° SWEP V{stats.port}</span>
            </div>
          </div>

          {/* Radar Screen Area */}
          <div className="relative aspect-square max-w-[420px] mx-auto my-2 rounded-full border border-cyan-500/30 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner shadow-cyan-950/80">
            {/* Concentric Range Rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/10"></div>
            <div className="absolute inset-12 rounded-full border border-dashed border-cyan-500/20"></div>
            <div className="absolute inset-24 rounded-full border border-cyan-500/25"></div>
            <div className="absolute inset-36 rounded-full border border-dashed border-cyan-500/30"></div>
            
            {/* Crosshairs & Axes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-cyan-500/20"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-[1px] bg-cyan-500/20"></div>
            </div>
            
            {/* Diagonal Grid Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-45">
              <div className="w-full h-[1px] bg-cyan-500/10"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -rotate-45">
              <div className="w-full h-[1px] bg-cyan-500/10"></div>
            </div>

            {/* Range Labels */}
            <span className="absolute top-2 text-[9px] font-mono text-cyan-600">PERIMETER (0.0.0.0)</span>
            <span className="absolute top-14 text-[9px] font-mono text-amber-500/70">HONEYPOT TRAP</span>
            <span className="absolute top-26 text-[9px] font-mono text-rose-500/70">SINKHOLE ISOLATION</span>

            {/* Animated Radar Sweep Beam */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `conic-gradient(from ${radarAngle}deg at 50% 50%, rgba(6, 182, 212, 0.25) 0deg, rgba(6, 182, 212, 0) 60deg, transparent 360deg)`,
              }}
            ></div>

            {/* Center Core Node */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <div className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></div>
            </div>

            {/* Render Threat Blips on Radar */}
            {blips.map((blip) => {
              const isSelected = selectedBlip?.id === blip.id;
              const colorClass = 
                blip.status === 'ISOLATED' ? 'bg-rose-500 border-rose-300 text-rose-300 shadow-rose-500' :
                blip.status === 'LOOPED' ? 'bg-purple-500 border-purple-300 text-purple-300 shadow-purple-500' :
                blip.status === 'JAMMED' ? 'bg-cyan-500 border-cyan-300 text-cyan-300 shadow-cyan-500' :
                'bg-amber-500 border-amber-300 text-amber-300 shadow-amber-500';

              return (
                <button
                  key={blip.id}
                  id={`blip-${blip.id}`}
                  onClick={() => setSelectedBlip(blip)}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 focus:outline-none`}
                  style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                >
                  <div className="relative">
                    <span className={`animate-ping absolute -inset-1 rounded-full opacity-75 ${colorClass}`}></span>
                    <div className={`w-3.5 h-3.5 rounded-full border-2 shadow-md ${colorClass}`}></div>
                  </div>
                  {/* Blip label tooltip */}
                  <span className="absolute left-4 top-0 bg-slate-900/90 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap text-slate-200 shadow opacity-80 group-hover:opacity-100">
                    {blip.ip} ({blip.status})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Blip Detail Box */}
          {selectedBlip ? (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-400">Inspeksjon:</span> <strong className="text-cyan-300">{selectedBlip.ip}</strong> | 
                <span className="text-slate-400 ml-2">Trussel:</span> <strong className="text-amber-300">{selectedBlip.threat}</strong> |
                <span className="text-slate-400 ml-2">Entropi:</span> <strong className="text-purple-300">{selectedBlip.entropy.toFixed(2)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-200">
                  Status: {selectedBlip.status}
                </span>
                <button 
                  onClick={() => setSelectedBlip(null)}
                  className="text-slate-400 hover:text-slate-200 px-1.5"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center text-xs font-mono text-slate-500">
              💡 Klikk på en blinkende radar-blip for å inspisere identitet, entropi og status.
            </div>
          )}

          {/* Quick Launch Probes Toolbar */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-300 uppercase font-semibold flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Hurtig-Test av Forsvaret
              </span>
              <button 
                onClick={() => onSelectTab('simulator')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Åpne full matrise →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                id="btn-quick-sqli"
                onClick={() => onTriggerQuickProbe(2)}
                className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-left font-mono text-xs transition-colors group"
              >
                <div className="text-cyan-400 font-semibold flex items-center justify-between">
                  <span>SQLi Datatyveri</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-300">#2</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Mirror Jamming test</div>
              </button>

              <button
                id="btn-quick-rce"
                onClick={() => onTriggerQuickProbe(3)}
                className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-left font-mono text-xs transition-colors group"
              >
                <div className="text-rose-400 font-semibold flex items-center justify-between">
                  <span>Skadevare RCE</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-rose-300">#3</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Blackout Isolation</div>
              </button>

              <button
                id="btn-quick-zeroday"
                onClick={() => onTriggerQuickProbe(5)}
                className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-left font-mono text-xs transition-colors group col-span-2 sm:col-span-1"
              >
                <div className="text-purple-400 font-semibold flex items-center justify-between">
                  <span>Zero-Day Obfuskert</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-purple-300">#5</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Entropi &gt; 5.20 loop</div>
              </button>
            </div>
          </div>
        </div>

        {/* Defense Tactics & Active Honeypot State (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Countermeasures Showcase */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Aktive Forsvarstaktikker (Autonome)
            </h3>
            
            <div className="space-y-3">
              {/* Tactic 1 */}
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/60 flex items-start gap-3">
                <div className="p-2 rounded bg-cyan-950 border border-cyan-700 text-cyan-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300">1. Mirror Jamming</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-400 rounded border border-cyan-800">AUTOMATISK</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Speiler angrepstrafikken direkte i retur og returnerer syntetiske databasefeil for å forvirre angriperen.
                  </p>
                </div>
              </div>

              {/* Tactic 2 */}
              <div className="p-3 rounded-lg bg-slate-950 border border-purple-900/60 flex items-start gap-3">
                <div className="p-2 rounded bg-purple-950 border border-purple-700 text-purple-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-300">2. Phantom Loop</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-950 text-purple-400 rounded border border-purple-800">SANDBOKS</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Låser ondsinnede skript og Zero-Days fast i en endeløs, ressursslukende virtuell sandboks.
                  </p>
                </div>
              </div>

              {/* Tactic 3 */}
              <div className="p-3 rounded-lg bg-slate-950 border border-rose-900/60 flex items-start gap-3">
                <div className="p-2 rounded bg-rose-950 border border-rose-700 text-rose-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-300">3. Blackout Isolation</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-950 text-rose-400 rounded border border-rose-800">PERMANENT</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Kutter all nettverkskontakt, dropper TCP-sesjoner og bannlyser IP-en permanent i brannmuren.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Siste Nøytraliserte Trussel */}
          {latestBlock && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Siste Nøytraliserte Bevis
                </span>
                <span className="text-[10px] font-mono text-slate-500">#{latestBlock.id}</span>
              </div>
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Angriper IP:</span>
                  <span className="text-rose-400 font-bold">{latestBlock.attackerIp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trusseltype:</span>
                  <span className="text-amber-300 truncate max-w-[200px] text-right">{latestBlock.threatType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Iverksatt Forsvar:</span>
                  <span className="text-cyan-300 truncate max-w-[200px] text-right">{latestBlock.counterMeasure}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="text-slate-400">WORM Hash:</span>
                  <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[160px]">
                    {latestBlock.currentHash}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Modal for Security Layers */}
      {showLayersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowLayersModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
              >
                ✕ Lukk
              </button>
              <SecurityLayersPanel
                stats={stats}
                onRotateProgramKey={onRotateProgramKey}
                onClose={() => setShowLayersModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

