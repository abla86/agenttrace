import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Globe, 
  Power, 
  Activity, 
  Lock, 
  Cpu,
  RefreshCw,
  Layers,
  MapPin,
  Sparkles,
  Radio,
  FileCode2,
  Terminal,
  KeyRound,
  Crown,
  Swords
} from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  stats: SystemStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleSimulator: () => void;
  onToggleNetworkMode: () => void;
  onEmergencyLockdown: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onSyncDefinitions: () => void;
  isSyncingDefinitions: boolean;
  onOpenSyncModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onToggleSimulator,
  onToggleNetworkMode,
  onEmergencyLockdown,
  activeTab,
  onSelectTab,
  onSyncDefinitions,
  isSyncingDefinitions,
  onOpenSyncModal,
  onOpenExportModal,
}) => {
  const tabs = [
    { id: 'radar', label: 'Tactical Radar & Live View', short: 'Radar', icon: Radio },
    { id: 'map', label: 'Globalt Trusselkart (Verden)', short: 'Trusselkart', icon: Globe },
    { id: 'godmode', label: 'Gudemodus & Kamparena (Gladiator)', short: 'Gudemodus ⚡', icon: Crown },
    { id: 'simulator', label: 'Angrepssimulator (Matrise)', short: 'Simulator', icon: Activity },
    { id: 'forensics', label: 'Forensisk Hash-Kjede (WORM)', short: 'Hash-Kjede', icon: ShieldCheck },
    { id: 'blacklist', label: 'Svarteliste & Isolasjon', short: 'Svarteliste', icon: Lock },
    { id: 'entropy', label: 'Shannon Entropi-Motor', short: 'Entropi', icon: Cpu },
    { id: 'python', label: 'Python Kildekode (.py)', short: 'Python Fil', icon: FileCode2 },
  ];

  return (
    <header id="wpww-header" className="border-b border-cyan-900/60 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 text-slate-100">
      {/* Top Notification Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold tracking-wider">
            WPWW DEFENSE SYSTEM // AUTONOM KJERNE AKTIV
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <button
            onClick={onOpenSyncModal}
            className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono group"
            title="Klikk for å se detaljer om sikkerhetsdefinisjoner og feeds"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Definisjoner: <strong className="text-cyan-300">{stats.securityDefinitions.version}</strong></span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {stats.securityDefinitions.totalSignatures.toLocaleString()} sig.
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            {stats.integrityVerified ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" /> WORM Hash: Intakt
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/60 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> Hash Manipulert!
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Export Trigger */}
            <button
              id="btn-header-export"
              onClick={onOpenExportModal}
              title="Eksporter forensisk rapport i 8 ulike formater"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono text-xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Eksport</span>
            </button>

            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={soundEnabled ? 'Slå av lyd' : 'Slå på lyd'}
              className="p-1.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              id="btn-emergency-lockdown"
              onClick={onEmergencyLockdown}
              className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 px-2 py-1 rounded border border-rose-800/60 font-mono text-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Nødlås
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-500/40">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-bold text-lg text-cyan-400 font-mono">
              🦒
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight font-mono text-slate-100 flex items-center gap-2">
                WPWW WARROOM <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">v20.0 ELITE</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block font-mono">
              Autonomt Forsvarsverk • Trusselkart • Honeypot • Shannon Entropi • WORM Hash-Kjede
            </p>
          </div>
        </div>

        {/* Global Controls & Sync Security Definitions Button */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Sync Security Definitions Button */}
          <button
            id="btn-sync-security-definitions"
            onClick={onSyncDefinitions}
            disabled={isSyncingDefinitions}
            title="Hent oppdaterte trusselsignaturer, YARA-regler og CVE-databaser fra eksterne feeds"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md border text-xs font-mono font-semibold transition-all bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 hover:from-cyan-900 hover:to-slate-900 border-cyan-600/80 text-cyan-200 shadow-md shadow-cyan-950/50 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingDefinitions ? 'animate-spin' : ''}`} />
            <span>{isSyncingDefinitions ? 'Synkroniserer...' : 'Sync Security Definitions'}</span>
          </button>

          {/* Network Switch */}
          <button
            id="btn-toggle-network"
            onClick={onToggleNetworkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300"
            title="Bytt mellom Localhost (127.0.0.1) og Åpent Nettverk (0.0.0.0)"
          >
            {stats.activeListener === '127.0.0.1' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lytter: <strong className="text-cyan-300">127.0.0.1:{stats.port}</strong> (Lokal)</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Lytter: <strong className="text-amber-300">0.0.0.0:{stats.port}</strong> (Åpent)</span>
              </>
            )}
          </button>

          {/* Simulator Toggle */}
          <button
            id="btn-toggle-simulator"
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
              stats.simulatorEnabled
                ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60 shadow-sm shadow-emerald-950'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${stats.simulatorEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Simulator: <strong className={stats.simulatorEnabled ? 'text-emerald-300' : 'text-slate-400'}>
              {stats.simulatorEnabled ? 'PÅ (Aktiv)' : 'AV (Deaktivert)'}
            </strong></span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-900 flex overflow-x-auto no-scrollbar gap-1 pt-1 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 rounded-t text-xs font-mono font-medium transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.short}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

