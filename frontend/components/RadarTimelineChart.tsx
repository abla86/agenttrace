import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Lock, 
  Zap, 
  Clock, 
  Layers, 
  Radio, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { SystemStats, ThreatTimelinePoint } from '../types';

interface RadarTimelineChartProps {
  stats: SystemStats;
  onOpenLayersModal?: () => void;
}

type ChartMetricView = 'threats_cumulative' | 'threats_rate' | 'encryption_flow' | 'multi_layer';
type TimeWindow = '60' | '30' | '15';

export const RadarTimelineChart: React.FC<RadarTimelineChartProps> = ({
  stats,
  onOpenLayersModal,
}) => {
  const [metricView, setMetricView] = useState<ChartMetricView>('threats_cumulative');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('60');

  // Filter dataset by selected time window
  const windowCount = parseInt(timeWindow, 10);
  const rawData = stats.threatHistory60Min || [];
  const chartData = rawData.slice(-windowCount);

  // Derive summary metrics
  const latestPoint = chartData[chartData.length - 1] || {
    totalThreatsBlocked: stats.totalThreatsBlocked,
    threatsPerMinute: 0,
    encryptedProgramDataKb: 42,
    encryptedOutdataPackets: 120,
    averageEntropy: 4.8,
  };

  const firstPointInWindow = chartData[0] || latestPoint;
  const blockedInWindow = Math.max(0, stats.totalThreatsBlocked - firstPointInWindow.totalThreatsBlocked);
  const peakRate = Math.max(...chartData.map((d) => d.threatsPerMinute || 0), 1);
  const avgEntropyWindow = (chartData.reduce((acc, d) => acc + (d.averageEntropy || 0), 0) / (chartData.length || 1)).toFixed(2);

  return (
    <div id="radar-threat-timeline-chart" className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
              Trussel-Nøytralisering & Kryptering (Siste {timeWindow} Minutter)
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                Recharts Live
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Sanntids visualisering av <code className="text-cyan-300 font-semibold">totalThreatsBlocked</code>, ProgramData-minnekryptering og OutData-konvolutter.
          </p>
        </div>

        {/* Metric Switchers & Time Window Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Time Window Buttons */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setTimeWindow('15')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '15' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              15m
            </button>
            <button
              onClick={() => setTimeWindow('30')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '30' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30m
            </button>
            <button
              onClick={() => setTimeWindow('60')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '60' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              60m
            </button>
          </div>

          {/* Metric View Selectors */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setMetricView('threats_cumulative')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricView === 'threats_cumulative'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Akkumulert totalThreatsBlocked kurve"
            >
              Akkumulert
            </button>
            <button
              onClick={() => setMetricView('threats_rate')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricView === 'threats_rate'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Trusler nøytralisert per minutt"
            >
              Rate / min
            </button>
            <button
              onClick={() => setMetricView('encryption_flow')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricView === 'encryption_flow'
                  ? 'bg-purple-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ProgramData & OutData krypteringsflyt"
            >
              Kryptering
            </button>
            <button
              onClick={() => setMetricView('multi_layer')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricView === 'multi_layer'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kombinert multi-lags telemetri"
            >
              Multi-Lag
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">totalThreatsBlocked (Nå)</div>
          <div className="text-xl font-bold font-mono text-emerald-400 flex items-center justify-between">
            <span>{stats.totalThreatsBlocked}</span>
            <span className="text-[11px] font-normal text-emerald-500 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              +{blockedInWindow} i {timeWindow}m
            </span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Maks Trusselrate</div>
          <div className="text-xl font-bold font-mono text-amber-400 flex items-center justify-between">
            <span>{peakRate} <span className="text-xs text-slate-400 font-normal">angrep/min</span></span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">ProgramData Kryptert (AES)</div>
          <div className="text-xl font-bold font-mono text-cyan-300 flex items-center justify-between">
            <span>{latestPoint.encryptedProgramDataKb} <span className="text-xs text-slate-400 font-normal">KB minne</span></span>
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">OutData Egress Pakker</div>
          <div className="text-xl font-bold font-mono text-purple-300 flex items-center justify-between">
            <span>{latestPoint.encryptedOutdataPackets} <span className="text-xs text-slate-400 font-normal">pakker</span></span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Recharts Chart View */}
      <div className="w-full h-64 sm:h-72 bg-slate-950/90 border border-slate-800/80 rounded-lg p-2 pt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          {metricView === 'threats_cumulative' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThreatsBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHoneypot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeWindow === '60' ? 5 : timeWindow === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="totalThreatsBlocked"
                name="totalThreatsBlocked (Akkumulert)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorThreatsBlocked)"
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="honeypotTrapped"
                name="Fanget i Honeypot"
                stroke="#f59e0b"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          ) : metricView === 'threats_rate' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeWindow === '60' ? 5 : timeWindow === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Line
                type="stepAfter"
                dataKey="threatsPerMinute"
                name="Trusler / Minutt"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#f59e0b' }}
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#78350f', strokeWidth: 2 }}
              />
              <ReferenceLine y={2} label={{ value: 'Terskel: Høy Aktivitet', fill: '#f43f5e', fontSize: 9, fontFamily: 'monospace' }} stroke="#f43f5e" strokeDasharray="3 3" />
            </LineChart>
          ) : metricView === 'encryption_flow' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeWindow === '60' ? 5 : timeWindow === '30' ? 2 : 1}
              />
              <YAxis
                yAxisId="left"
                stroke="#06b6d4"
                tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a855f7"
                tick={{ fill: '#a855f7', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="encryptedProgramDataKb"
                name="ProgramData Kryptert (KB Minne)"
                stroke="#06b6d4"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: '#06b6d4' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="encryptedOutdataPackets"
                name="OutData Egress (Forseglede Pakker)"
                stroke="#a855f7"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: '#a855f7' }}
              />
            </LineChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                interval={timeWindow === '60' ? 5 : timeWindow === '30' ? 2 : 1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 6 }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="totalThreatsBlocked"
                name="totalThreatsBlocked"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="encryptedProgramDataKb"
                name="ProgramData (KB)"
                stroke="#06b6d4"
                strokeWidth={1.8}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="averageEntropy"
                name="Shannon Entropi"
                stroke="#f43f5e"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Sub-Bar with Encryption & Security Layers Callout */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>ProgramData: <strong className="text-cyan-300">AES-256-GCM (At-Rest / Heap)</strong></span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>OutData: <strong className="text-purple-300">Kyber-1024 + TLS 1.3 (Egress)</strong></span>
          </div>
        </div>

        {onOpenLayersModal && (
          <button
            onClick={onOpenLayersModal}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-colors border border-slate-700 hover:border-cyan-500/60"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspiser Alle 4 Sikkerhetslag</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Custom High-Contrast Recharts Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-950 border border-cyan-800/90 rounded-lg p-3 shadow-2xl shadow-cyan-950 font-mono text-xs text-slate-200 min-w-[200px]">
      <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
        <span>Tidspunkt: {label}</span>
        <Clock className="w-3 h-3 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
