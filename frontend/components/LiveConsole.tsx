import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Trash2, 
  ArrowDown, 
  ShieldAlert, 
  CheckCircle, 
  Copy, 
  Check 
} from 'lucide-react';
import { ConsoleLogMessage } from '../types';

interface LiveConsoleProps {
  logs: ConsoleLogMessage[];
  onClearLogs: () => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs, onClearLogs }) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message} ${l.details || ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="live-console-container" className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Console Top Header */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider text-slate-200">
            WPWW WARROOM // WATCHDOG LIVE STREAM CONSOLE
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {filteredLogs.length} HENDELSER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Level */}
          <select
            id="select-console-filter"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">Alle Nivåer</option>
            <option value="COUNTERMEASURE">Kun Motangrep</option>
            <option value="DANGER">Kun Kritiske</option>
            <option value="WORM">Kun WORM-Hash</option>
            <option value="INFO">Kun Info</option>
          </select>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors flex items-center gap-1 ${
              autoScroll
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3 h-3" /> Auto
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            title="Kopier konsollogg"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800"
            title="Tøm konsoll"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollRef}
        className="p-4 overflow-y-auto max-h-72 min-h-[160px] font-mono text-xs space-y-1.5 bg-[#030712] select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic">Ingen meldinger i konsollen ennå...</div>
        ) : (
          filteredLogs.map((log) => {
            let color = 'text-slate-300';
            let badgeClass = 'text-slate-400 bg-slate-900 border-slate-700';

            if (log.level === 'COUNTERMEASURE') {
              color = 'text-cyan-300 font-bold';
              badgeClass = 'text-cyan-300 bg-cyan-950 border-cyan-700';
            } else if (log.level === 'DANGER') {
              color = 'text-rose-300 font-bold';
              badgeClass = 'text-rose-300 bg-rose-950 border-rose-700';
            } else if (log.level === 'WARN') {
              color = 'text-amber-300';
              badgeClass = 'text-amber-300 bg-amber-950 border-amber-700';
            } else if (log.level === 'WORM') {
              color = 'text-emerald-300';
              badgeClass = 'text-emerald-300 bg-emerald-950 border-emerald-700';
            } else if (log.level === 'SUCCESS') {
              color = 'text-emerald-400';
              badgeClass = 'text-emerald-300 bg-emerald-950 border-emerald-700';
            }

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 text-[10px] whitespace-nowrap pt-0.5">
                  [{log.timestamp}]
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono whitespace-nowrap ${badgeClass}`}>
                  {log.level}
                </span>
                {log.ip && (
                  <span className="text-rose-400 font-semibold whitespace-nowrap text-[11px]">
                    @{log.ip}:
                  </span>
                )}
                <span className={color}>{log.message}</span>
                {log.details && (
                  <span className="text-slate-500 text-[11px] truncate max-w-xs">{log.details}</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
