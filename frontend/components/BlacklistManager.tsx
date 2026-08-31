import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  UserX, 
  Plus, 
  Search, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { BlacklistedIp } from '../types';

interface BlacklistManagerProps {
  blacklist: BlacklistedIp[];
  onUnbanIp: (ip: string) => void;
  onAddManualBan: (ip: string, reason: string, level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  onClearBlacklist: () => void;
}

export const BlacklistManager: React.FC<BlacklistManagerProps> = ({
  blacklist,
  onUnbanIp,
  onAddManualBan,
  onClearBlacklist,
}) => {
  const [newIp, setNewIp] = useState<string>('');
  const [newReason, setNewReason] = useState<string>('Manuelt Karantenesatt av Operatør');
  const [newLevel, setNewLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleAddBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    onAddManualBan(newIp.trim(), newReason.trim(), newLevel);
    setNewIp('');
  };

  const filteredList = blacklist.filter(
    (item) =>
      item.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="blacklist-manager-container" className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-400" />
              Blackout Isolasjon & Svarteliste-Administrasjon
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Permanente karantene-blokkeringer. IP-adresser her nektes enhver HTTP-tilkobling (HTTP 403 Access Denied).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {blacklist.length > 0 && (
              <button
                id="btn-clear-blacklist"
                onClick={onClearBlacklist}
                className="py-1.5 px-3 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tøm Hele Svartelisten ({blacklist.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Manual Quarantine Form */}
        <form onSubmit={handleAddBan} className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Legg til IP i Karantene:
            </label>
            <input
              id="input-ban-ip"
              type="text"
              placeholder="e.g. 198.51.100.42"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Årsak / Trusseltype:
            </label>
            <input
              id="input-ban-reason"
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Nivå:
            </label>
            <select
              id="select-ban-level"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              id="btn-submit-manual-ban"
              type="submit"
              disabled={!newIp.trim()}
              className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Isoler IP</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-blacklist"
            type="text"
            placeholder="Søk etter IP eller årsak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Viser {filteredList.length} av {blacklist.length} bannlyste adresser
        </div>
      </div>

      {/* Quarantine Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            Ingen isolerte IP-adresser funnet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Isolert IP</th>
                  <th className="py-3 px-4">Årsak / Trussel</th>
                  <th className="py-3 px-4">Alvorlighetsgrad</th>
                  <th className="py-3 px-4">Tidspunkt</th>
                  <th className="py-3 px-4 text-center">Blokkerte Forsøk</th>
                  <th className="py-3 px-4 text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredList.map((item) => {
                  const levelColor =
                    item.threatLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    item.threatLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    item.threatLevel === 'MEDIUM' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                    'bg-cyan-950 text-cyan-300 border-cyan-800';

                  return (
                    <tr key={item.ip} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-rose-400 flex items-center gap-2">
                        <span>{item.ip}</span>
                        {item.country && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {item.country}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {item.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${levelColor}`}>
                          {item.threatLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {item.blockedAt}
                      </td>
                      <td className="py-3 px-4 text-center text-amber-400 font-bold">
                        {item.attemptsBlocked}x
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          id={`btn-unban-${item.ip.replace(/\./g, '-')}`}
                          onClick={() => onUnbanIp(item.ip)}
                          className="py-1 px-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700 text-xs transition-colors"
                          title="Fjern fra svarteliste"
                        >
                          Opphev Isolasjon
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
