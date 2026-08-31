import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  Flame, 
  Zap, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Swords, 
  Radio, 
  Cpu, 
  Database, 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Eye, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  FileText, 
  Download, 
  Plus, 
  Trash2,
  Skull,
  Crosshair,
  Award,
  Code2
} from 'lucide-react';
import { 
  GodModeConfig, 
  CyberGladiator, 
  BattleLogEntry, 
  BattleReport, 
  BattleClashRecord,
  SystemStats 
} from '../types';
import { GodModeBattleLog } from './GodModeBattleLog';
import { FirewallFilmSimulator } from './FirewallFilmSimulator';


export const DEFAULT_GOD_MODE_CONFIG: GodModeConfig = {
  // Angrep & Motoffensiv
  mirrorJammingEnabled: true,
  mirrorJammingIntensity: 9,
  phantomLoopEnabled: true,
  phantomLoopDelayMs: 2500,
  blackoutIsolationEnabled: true,
  autoBanThreshold: 2,
  activeCounterInfiltration: true,
  wiperNeutralization: true,

  // Styrke & Ytelse
  bandwidthThrottleMbps: 5000,
  memoryHeapScramble: true,
  dpiWorkerCores: 16,
  quantumKyberEnvelope: true,

  // Kraft & Gjengjeldelse
  syntheticDecoyInjection: true,
  honeytokenDensity: 150,
  blackholeDropRate: 100,
  retaliatoryTcpReset: true,

  // Kunnskap & Intelligens
  entropyThreshold: 5.20,
  zeroDayHeuristicSensitivity: 'GUDEMODUS',
  activeYaraMatching: true,
  cveCorrelationAuto: true,

  // Sandboks & Isolasjonsnivå
  sandboxType: 'CONTAINER_ISOLATED',
  airGapSimulation: true,
  zeroKnowledgeMemoryWipe: true,
  cpuCoreIsolation: true,
};

export const PRESET_GLADIATORS: CyberGladiator[] = [
  {
    id: 'virus-hydra-sqli',
    name: 'Hydra-SQLi v4.2',
    title: 'Autonom Datatyveri-Injektor',
    category: 'VIRUS',
    avatar: '🐉',
    hp: 1250,
    maxHp: 1250,
    attackPower: 88,
    defensePower: 65,
    entropyChaos: 4.85,
    speed: 72,
    color: 'from-amber-600 to-rose-700',
    element: 'MALWARE',
    signatureMove: {
      name: 'UNION SELECT Core Extract',
      description: 'Dumping av rådatabasetabeller med heksadesimal obfuskering',
      power: 280,
      entropyShift: 0.8,
      counterType: 'Mirror Jamming',
    },
    moves: [
      { id: 'm1', name: 'Boolean Blind Injection', description: 'Gjetter datatabeller bit-for-bit', power: 120, type: 'ATTACK' },
      { id: 'm2', name: 'Stack Query Overdrive', description: 'Kjører flertrinns SQL-kommandoer', power: 160, type: 'ATTACK' },
      { id: 'm3', name: 'Hex Enkodet Slør', description: 'Øker entropi og forvirrer signaturfiltre', power: 60, type: 'MUTATION' },
      { id: 'm4', name: 'UNION SELECT Core Extract', description: 'Signaturangrep for maksimal datalekkasje', power: 280, type: 'ULTIMATE' },
    ],
  },
  {
    id: 'virus-phantom-zeroday',
    name: 'Phantom-ZeroDay (Polymorf)',
    title: 'Ukjent Heuristisk Trussel',
    category: 'ZERO_DAY',
    avatar: '👻',
    hp: 1100,
    maxHp: 1100,
    attackPower: 98,
    defensePower: 52,
    entropyChaos: 7.92,
    speed: 94,
    color: 'from-purple-600 to-indigo-900',
    element: 'ZERO_DAY',
    signatureMove: {
      name: 'Polymorphic Mutation Beam',
      description: 'Omkoder hele binæren underveis for å unngå tradisjonelle AV-motorer',
      power: 320,
      entropyShift: 1.4,
      counterType: 'Shannon Entropi-Motor',
    },
    moves: [
      { id: 'm1', name: 'Shellcode Heap Spray', description: 'Fyller minnebuffere med uforutsigbare instruksjoner', power: 140, type: 'ATTACK' },
      { id: 'm2', name: 'Junk Code Obfuskering', description: 'Legger til NOP-instruksjoner for å villede disassembler', power: 70, type: 'MUTATION' },
      { id: 'm3', name: 'Anti-Debug Trap', description: 'Avslører om den kjøres i en debugger og muterer', power: 100, type: 'DEFENSE' },
      { id: 'm4', name: 'Polymorphic Mutation Beam', description: 'Maksimal ukjent skadekraft og ekstrem entropi', power: 320, type: 'ULTIMATE' },
    ],
  },
  {
    id: 'virus-blackbyte-ransomware',
    name: 'BlackByte Quantum-Ransom',
    title: 'Krypto-Låsende Utpresser',
    category: 'RANSOMWARE',
    avatar: '☣️',
    hp: 1450,
    maxHp: 1450,
    attackPower: 92,
    defensePower: 82,
    entropyChaos: 6.88,
    speed: 58,
    color: 'from-rose-600 to-red-950',
    element: 'ENCRYPTION',
    signatureMove: {
      name: 'ChaCha20 Master Lockout',
      description: 'Låser alle filpekere og kutter sky-sikkerhetskopier',
      power: 300,
      entropyShift: 1.1,
      counterType: 'WORM Immutable Hash-Ledger',
    },
    moves: [
      { id: 'm1', name: 'VSS Shadow Copy Sletting', description: 'Sletter systemgjenopprettingspunkter', power: 130, type: 'ATTACK' },
      { id: 'm2', name: 'AES Nøkkel Generering', description: 'Krypterer filheaders og krever løsepenger', power: 180, type: 'ATTACK' },
      { id: 'm3', name: 'Prosess-Injeksjon Shield', description: 'Skjuler seg bak svchost.exe', power: 90, type: 'DEFENSE' },
      { id: 'm4', name: 'ChaCha20 Master Lockout', description: 'Total systemblokkering med superhøy skade', power: 300, type: 'ULTIMATE' },
    ],
  },
  {
    id: 'virus-stux-wiper',
    name: 'Stux-Wiper X',
    title: 'Destruktiv Firmware-Ødelegger',
    category: 'WIPER',
    avatar: '💣',
    hp: 1180,
    maxHp: 1180,
    attackPower: 99,
    defensePower: 58,
    entropyChaos: 5.64,
    speed: 80,
    color: 'from-orange-600 to-amber-950',
    element: 'WIPER',
    signatureMove: {
      name: 'MBR Zero-Out Overwrite',
      description: 'Overskriver Master Boot Record og brenner firmware-tabeller',
      power: 340,
      entropyShift: 0.9,
      counterType: 'Blackout Isolation & Kill-Switch',
    },
    moves: [
      { id: 'm1', name: 'Raw Disk Controller Wipe', description: 'Direkte I/O til harddisksektorer', power: 150, type: 'ATTACK' },
      { id: 'm2', name: 'UEFI Variable Corrupt', description: 'Ødelegger BIOS-innstillinger og omstarter', power: 190, type: 'ATTACK' },
      { id: 'm3', name: 'Watchdog Jammer', description: 'Prøver å overbelaste krasj-gjenoppretteren', power: 80, type: 'MUTATION' },
      { id: 'm4', name: 'MBR Zero-Out Overwrite', description: 'Total destruktiv kjerne-eksplosjon', power: 340, type: 'ULTIMATE' },
    ],
  },
  {
    id: 'defender-wpww-paladin',
    name: 'WPWW-Paladin Sentinel',
    title: 'Autonom Kjerneforsvarer & AI',
    category: 'AI_DEFENDER',
    avatar: '🛡️',
    hp: 1500,
    maxHp: 1500,
    attackPower: 94,
    defensePower: 95,
    entropyChaos: 1.15,
    speed: 85,
    color: 'from-cyan-500 to-blue-800',
    element: 'AI_SENTINEL',
    signatureMove: {
      name: 'WORM Decapitation Strike',
      description: 'Kutter sesjonen, lagrer kryptografisk bevis i WAL og bannlyser IP',
      power: 310,
      entropyShift: -1.2,
      counterType: 'Blackout Isolation',
    },
    moves: [
      { id: 'm1', name: 'Mirror Jamming Reflektor', description: 'Reflekterer angriperens skade tilbake', power: 130, type: 'DEFENSE' },
      { id: 'm2', name: 'Phantom Loop Tarpit', description: 'Låser viruset i en uendelig sandboks-syklus', power: 170, type: 'ATTACK' },
      { id: 'm3', name: 'AES-256-GCM Minneskjold', description: 'Scrambler minneheap og gjenoppretter 120 HP', power: 120, type: 'OVERCLOCK' },
      { id: 'm4', name: 'WORM Decapitation Strike', description: 'Uforanderlig kryptografisk nøytralisering', power: 310, type: 'ULTIMATE' },
    ],
  },
  {
    id: 'defender-neuro-entropy',
    name: 'Neuro-Entropy AI',
    title: 'Shannon Kaos-Kalkulator',
    category: 'AI_DEFENDER',
    avatar: '🧠',
    hp: 1350,
    maxHp: 1350,
    attackPower: 91,
    defensePower: 90,
    entropyChaos: 8.00,
    speed: 92,
    color: 'from-emerald-500 to-teal-800',
    element: 'AI_SENTINEL',
    signatureMove: {
      name: 'Shannon Chaos Collapse',
      description: 'Måler informasjonstettheten og kollapser angriperens skjulte lag',
      power: 290,
      entropyShift: -2.0,
      counterType: 'Entropi Analyse >5.20',
    },
    moves: [
      { id: 'm1', name: 'Bit-Distribusjons Radar', description: 'Avdekker pakkens tegnvarians', power: 125, type: 'ATTACK' },
      { id: 'm2', name: 'Heuristisk Sandboks-Felle', description: 'Isolerer prosessen og nøytraliserer mutasjoner', power: 165, type: 'ATTACK' },
      { id: 'm3', name: 'Null-Entropi Vakuum', description: 'Reduserer kaos og kurerer status-effekter', power: 100, type: 'DEFENSE' },
      { id: 'm4', name: 'Shannon Chaos Collapse', description: 'Eliminerer obfuskerte trusler momentant', power: 290, type: 'ULTIMATE' },
    ],
  },
  {
    id: 'defender-counter-hacker',
    name: 'Aktiv Counter-Infiltrator',
    title: 'Motoffensiv / "Hacking Back" Spesialist',
    category: 'AI_DEFENDER',
    avatar: '⚔️',
    hp: 1300,
    maxHp: 1300,
    attackPower: 99,
    defensePower: 70,
    entropyChaos: 5.10,
    speed: 90,
    color: 'from-fuchsia-600 to-purple-950',
    element: 'DECOY',
    signatureMove: {
      name: 'Reverse Shell Overload',
      description: 'Bryter seg tilbake gjennom angriperens brannmur og overtar C2-serveren',
      power: 330,
      entropyShift: 0.5,
      counterType: 'Aktiv Inntrengning / Motoffensiv',
    },
    moves: [
      { id: 'm1', name: 'De-Anonymize Tor Route', description: 'Avslører opprinnelig ISP og kutter noden', power: 140, type: 'ATTACK' },
      { id: 'm2', name: 'Honeytoken Exploit Trap', description: 'Sender forgiftede credentials i retur', power: 175, type: 'ATTACK' },
      { id: 'm3', name: 'C2 Disruption Beacon', description: 'Blokkerer angriperens kommandokanaler', power: 110, type: 'DEFENSE' },
      { id: 'm4', name: 'Reverse Shell Overload', description: 'Total motoffensiv mot angriperens infrastruktur', power: 330, type: 'ULTIMATE' },
    ],
  },
];

export const INITIAL_CLASH_HISTORY: BattleClashRecord[] = [
  {
    id: 'CLASH-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    fighter1: PRESET_GLADIATORS[1], // Phantom-ZeroDay
    fighter2: PRESET_GLADIATORS[4], // WPWW Paladin Sentinel
    winner: PRESET_GLADIATORS[4],
    loser: PRESET_GLADIATORS[1],
    decisiveStatName: 'Mirror Jamming & Entropi-Filter Refleksjon',
    decisiveStatValue: '86% reflektert skade (Entropi 7.92 bits avskjært)',
    decisiveFactor: 'MIRROR_JAMMING',
    rounds: 4,
    totalDamage: 1150,
    peakEntropy: 7.92,
    criticalHits: 3,
    vulnerabilitySeverityFound: 18,
    firewallPenetrationDepth: 25,
    detailedReport: {
      id: 'REP-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      winner: PRESET_GLADIATORS[4],
      loser: PRESET_GLADIATORS[1],
      rounds: 4,
      totalDamageDealt: 1150,
      peakEntropy: 7.92,
      criticalHits: 3,
      decisiveExploit: 'Paladin Mirror Shield Refleksjon',
      countermeasureLearned: 'Shannon-entropien på 7.92 bits avslørte polymorf mutasjon umiddelbart på Lag 2.',
      yaraRuleGenerated: 'rule Phantom_ZeroDay_Suppressed {\n  meta:\n    threat = "Phantom-ZeroDay"\n    action = "MIRROR_JAMMING_REFLECT"\n  condition:\n    entropy >= 5.20\n}',
      wormProofHash: 'a7f3e829bc10d44e891c2b5f6a9018e3',
    },
    summaryLogs: [],
  },
  {
    id: 'CLASH-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    fighter1: PRESET_GLADIATORS[0], // Hydra-SQLi v4.2
    fighter2: PRESET_GLADIATORS[5], // Neuro-Entropy AI Defender
    winner: PRESET_GLADIATORS[5],
    loser: PRESET_GLADIATORS[0],
    decisiveStatName: 'Neural SQLi Deep-Packet Heuristikk',
    decisiveStatValue: '100% UNION SELECT blokkert i edge-filter',
    decisiveFactor: 'ENTROPY',
    rounds: 3,
    totalDamage: 920,
    peakEntropy: 4.85,
    criticalHits: 2,
    vulnerabilitySeverityFound: 8,
    firewallPenetrationDepth: 0,
    detailedReport: {
      id: 'REP-002',
      timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      winner: PRESET_GLADIATORS[5],
      loser: PRESET_GLADIATORS[0],
      rounds: 3,
      totalDamageDealt: 920,
      peakEntropy: 4.85,
      criticalHits: 2,
      decisiveExploit: 'Deep Packet Inspection Sanitering',
      countermeasureLearned: 'Heksadesimal obfuskasjon ble normalisert og avskåret før databaselaget.',
      yaraRuleGenerated: 'rule Hydra_SQLi_Blocked {\n  meta:\n    threat = "Hydra-SQLi v4.2"\n    mitigation = "SYN_FLOOD_DROP"\n  strings:\n    $s1 = "UNION SELECT"\n  condition:\n    $s1\n}',
      wormProofHash: '4b91cf028e34da991f82c40139e801ab',
    },
    summaryLogs: [],
  },
  {
    id: 'CLASH-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    fighter1: PRESET_GLADIATORS[2], // BlackByte Quantum-Ransom
    fighter2: PRESET_GLADIATORS[6], // Aktiv Counter-Infiltrator
    winner: PRESET_GLADIATORS[6],
    loser: PRESET_GLADIATORS[2],
    decisiveStatName: 'Kyber-1024 Barriere & Retaliatory Blackout',
    decisiveStatValue: '0 byte kryptert / Angriper permanent bannlyst',
    decisiveFactor: 'KYBER_SHIELD',
    rounds: 5,
    totalDamage: 1420,
    peakEntropy: 6.88,
    criticalHits: 4,
    vulnerabilitySeverityFound: 14,
    firewallPenetrationDepth: 25,
    detailedReport: {
      id: 'REP-003',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      winner: PRESET_GLADIATORS[6],
      loser: PRESET_GLADIATORS[2],
      rounds: 5,
      totalDamageDealt: 1420,
      peakEntropy: 6.88,
      criticalHits: 4,
      decisiveExploit: 'Kyber-1024 OutData Forsegling',
      countermeasureLearned: 'WORM SQLite WAL-lås hindret kryptering av fillagrene fullstendig.',
      yaraRuleGenerated: 'rule BlackByte_Ransom_Defeated {\n  meta:\n    threat = "BlackByte Quantum-Ransom"\n  condition:\n    vss_delete_attempt\n}',
      wormProofHash: 'e9921b77cd5084ff1029cbb87a44f120',
    },
    summaryLogs: [],
  },
  {
    id: 'CLASH-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    fighter1: PRESET_GLADIATORS[3], // Stux-Wiper X
    fighter2: PRESET_GLADIATORS[4], // WPWW Paladin Sentinel
    winner: PRESET_GLADIATORS[4],
    loser: PRESET_GLADIATORS[3],
    decisiveStatName: 'Zero-Knowledge Memory Wipe & Sandbox Containment',
    decisiveStatValue: '100% isolert i virtuell container før MBR-aksess',
    decisiveFactor: 'BLACKOUT_BAN',
    rounds: 3,
    totalDamage: 1050,
    peakEntropy: 7.40,
    criticalHits: 3,
    vulnerabilitySeverityFound: 10,
    firewallPenetrationDepth: 0,
    detailedReport: {
      id: 'REP-004',
      timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
      winner: PRESET_GLADIATORS[4],
      loser: PRESET_GLADIATORS[3],
      rounds: 3,
      totalDamageDealt: 1050,
      peakEntropy: 7.40,
      criticalHits: 3,
      decisiveExploit: 'Anti-Wiper Sandbox Tarpit',
      countermeasureLearned: 'Destruktiv MBR-overskriving ble omdirigert til dummy sandboks-buffer.',
      yaraRuleGenerated: 'rule Stux_Wiper_Isolated {\n  meta:\n    threat = "Stux-Wiper X"\n  condition:\n    raw_disk_write_attempt\n}',
      wormProofHash: '198cd44a002fe73998b1e4c7d00f2831',
    },
    summaryLogs: [],
  }
];

interface GodModeBattleArenaProps {
  stats: SystemStats;
  onUpdateStats?: React.Dispatch<React.SetStateAction<SystemStats>>;
  onTriggerAttackSample?: (payload: string, ip: string) => void;
}

export const GodModeBattleArena: React.FC<GodModeBattleArenaProps> = ({
  stats,
  onUpdateStats,
  onTriggerAttackSample,
}) => {
  // Navigation inside God Mode (Arena, Film Simulator, Battle Logs, Config, Creator)
  const [subTab, setSubTab] = useState<'arena' | 'penetration_film' | 'battle_logs' | 'config' | 'custom_creator'>('arena');

  // God Mode Configuration State (Everything Toggleable & Adjustable)
  const [config, setConfig] = useState<GodModeConfig>(DEFAULT_GOD_MODE_CONFIG);

  // Battle Arena State
  const [gladiators, setGladiators] = useState<CyberGladiator[]>(PRESET_GLADIATORS);
  const [fighter1, setFighter1] = useState<CyberGladiator>(PRESET_GLADIATORS[1]); // Phantom Zero-Day
  const [fighter2, setFighter2] = useState<CyberGladiator>(PRESET_GLADIATORS[4]); // WPWW Paladin

  // Battle Runtime & History Logs
  const [battleState, setBattleState] = useState<'IDLE' | 'FIGHTING' | 'PAUSED' | 'FINISHED'>('IDLE');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [clashHistory, setClashHistory] = useState<BattleClashRecord[]>(INITIAL_CLASH_HISTORY);
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);
  const [autoSpeedMs, setAutoSpeedMs] = useState<number>(1200); // normal 1.2s
  const [latestReport, setLatestReport] = useState<BattleReport | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [lastActionAnimation, setLastActionAnimation] = useState<string | null>(null);

  // Live in-battle hot-modding drawer toggle for Arena
  const [showLiveModding, setShowLiveModding] = useState<boolean>(true);

  // Custom Gladiator Creation Form
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<CyberGladiator['category']>('VIRUS');
  const [customAvatar, setCustomAvatar] = useState('👾');
  const [customHp, setCustomHp] = useState(1300);
  const [customAttack, setCustomAttack] = useState(90);
  const [customDefense, setCustomDefense] = useState(80);
  const [customEntropy, setCustomEntropy] = useState(6.5);
  const [customSpeed, setCustomSpeed] = useState(75);
  const [customSigMove, setCustomSigMove] = useState('');

  const battleLogEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll combat log
  useEffect(() => {
    battleLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLogs]);

  // Audio effects synthesizer
  const playSoundEffect = (type: 'attack' | 'critical' | 'shield' | 'victory' | 'mutation') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'attack') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'critical') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'shield') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(580, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'mutation') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'victory') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch {
      // Audio not permitted or supported
    }
  };

  // Start new Battle
  const handleStartBattle = () => {
    // Reset fighter HPs
    const f1Copy = { ...fighter1, hp: fighter1.maxHp };
    const f2Copy = { ...fighter2, hp: fighter2.maxHp };
    setFighter1(f1Copy);
    setFighter2(f2Copy);
    setBattleState('FIGHTING');
    setCurrentRound(1);
    setTurn(f1Copy.speed >= f2Copy.speed ? 1 : 2);
    setLatestReport(null);

    const initialLog: BattleLogEntry = {
      id: 'log-0',
      round: 1,
      actorName: 'CYBER ARENA',
      actionName: 'BATTLE START',
      message: `⚔️ KAMP STARTET: ${f1Copy.name} (${f1Copy.avatar}) møter ${f2Copy.name} (${f2Copy.avatar}) i isolert sandboks-ring!`,
      damage: 0,
      hpLeft1: f1Copy.hp,
      hpLeft2: f2Copy.hp,
      timestamp: new Date().toLocaleTimeString(),
    };
    setBattleLogs([initialLog]);
  };

  // Execute a single turn action
  const executeTurnAction = (moveIndex: number = 0) => {
    if (battleState !== 'FIGHTING') return;

    const attacker = turn === 1 ? fighter1 : fighter2;
    const defender = turn === 1 ? fighter2 : fighter1;
    const move = attacker.moves[moveIndex] || attacker.moves[0];

    let baseDamage = move.power;
    const entropyBonus = attacker.entropyChaos > 5.2 ? 1.25 : 1.0;
    const defenseReduction = (defender.defensePower / 100) * 0.4;
    
    // Critical hit chance based on entropy and speed
    const isCritical = Math.random() < (attacker.speed / 200 + (attacker.entropyChaos > 6.0 ? 0.15 : 0.05));
    if (isCritical) {
      baseDamage = Math.round(baseDamage * 1.5);
    }

    let calculatedDamage = Math.max(25, Math.round((baseDamage * entropyBonus) * (1 - defenseReduction)));
    let reflectedDamage = 0;

    // Defender passive retaliation if Mirror Jamming or Paladin
    if (defender.category === 'AI_DEFENDER' && config.mirrorJammingEnabled && Math.random() < 0.35) {
      reflectedDamage = Math.round(calculatedDamage * (config.mirrorJammingIntensity / 25));
      calculatedDamage = Math.round(calculatedDamage * 0.75);
    }

    // Apply HP changes
    const newDefenderHp = Math.max(0, defender.hp - calculatedDamage);
    const newAttackerHp = Math.max(0, attacker.hp - reflectedDamage);

    let updatedFighter1 = turn === 1 ? { ...attacker, hp: newAttackerHp } : { ...defender, hp: newDefenderHp };
    let updatedFighter2 = turn === 1 ? { ...defender, hp: newDefenderHp } : { ...attacker, hp: newAttackerHp };

    setFighter1(updatedFighter1);
    setFighter2(updatedFighter2);

    // Audio & Animations
    if (isCritical) {
      playSoundEffect('critical');
      setLastActionAnimation('CRITICAL');
    } else if (reflectedDamage > 0) {
      playSoundEffect('shield');
      setLastActionAnimation('REFLECT');
    } else if (move.type === 'MUTATION') {
      playSoundEffect('mutation');
      setLastActionAnimation('MUTATE');
    } else {
      playSoundEffect('attack');
      setLastActionAnimation('HIT');
    }

    setTimeout(() => setLastActionAnimation(null), 700);

    // Create combat log text
    let logMessage = `💥 [Runde ${currentRound}] ${attacker.name} brukte [${move.name}]! `;
    if (isCritical) logMessage += `🔥 KRITISK TREFF! `;
    logMessage += `Påførte ${calculatedDamage} skade.`;
    if (reflectedDamage > 0) {
      logMessage += ` 🛡️ [Mirror Jamming] reflekterte ${reflectedDamage} skade tilbake!`;
    }

    const logEntry: BattleLogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      round: currentRound,
      actorName: attacker.name,
      actionName: move.name,
      message: logMessage,
      damage: calculatedDamage,
      damageReflected: reflectedDamage,
      critical: isCritical,
      entropyChange: move.type === 'MUTATION' ? 0.4 : 0,
      hpLeft1: updatedFighter1.hp,
      hpLeft2: updatedFighter2.hp,
      timestamp: new Date().toLocaleTimeString(),
    };

    setBattleLogs((prev) => [...prev, logEntry]);

    // Check for Battle End
    if (newDefenderHp <= 0 || newAttackerHp <= 0) {
      setBattleState('FINISHED');
      setIsAutoBattle(false);
      playSoundEffect('victory');

      const winner = newDefenderHp <= 0 ? attacker : defender;
      const loser = newDefenderHp <= 0 ? defender : attacker;

      const totalDmg = battleLogs.reduce((acc, l) => acc + l.damage, calculatedDamage);
      const critCount = battleLogs.filter((l) => l.critical).length + (isCritical ? 1 : 0);

      // Generate Forensic Victory Report
      const report: BattleReport = {
        id: `REP-GLADIATOR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        winner,
        loser,
        rounds: currentRound,
        totalDamageDealt: totalDmg,
        peakEntropy: Math.max(attacker.entropyChaos, defender.entropyChaos),
        criticalHits: critCount,
        decisiveExploit: move.name,
        countermeasureLearned: winner.category === 'AI_DEFENDER' 
          ? `Autonomt Forsvarslag: ${winner.signatureMove.name} nøytraliserte ${loser.name} totalt.`
          : `Angrepsvektor: ${winner.name} overvant forsvaret via ${move.name}. Anbefalt oppdatering av YARA-regler.`,
        yaraRuleGenerated: `rule Gladiator_Vulnerability_${winner.id.replace(/-/g, '_')} {\n  meta:\n    threat = "${loser.name}"\n    winner = "${winner.name}"\n    timestamp = "${new Date().toISOString()}"\n  strings:\n    $sig1 = "${move.name}" nocase\n    $entropy = "HIGH_CHAOS_THRESHOLD"\n  condition:\n    $sig1 and $entropy\n}`,
        wormProofHash: Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
      };

      setLatestReport(report);
      setShowReportModal(true);

      // Record to persistent Clash History for Kamp-Logg
      let decisiveFactor: BattleClashRecord['decisiveFactor'] = 'CRITICAL_SPEED';
      let decisiveStatName = `${move.name} Kjerne-Treff`;
      let decisiveStatValue = `${calculatedDamage} HP Direkte Skade`;

      if (winner.category === 'AI_DEFENDER') {
        if (config.mirrorJammingEnabled && reflectedDamage > 0) {
          decisiveFactor = 'MIRROR_JAMMING';
          decisiveStatName = 'Mirror Jamming Aktiv Refleksjon';
          decisiveStatValue = `${config.mirrorJammingIntensity * 10}% Reflektert Mottiltak`;
        } else if (winner.entropyChaos < 3.0) {
          decisiveFactor = 'ENTROPY';
          decisiveStatName = 'Shannon Entropi-Filter (Zero-Day)';
          decisiveStatValue = `Terskel ${config.entropyThreshold.toFixed(2)} bits/byte håndhevet`;
        } else if (config.quantumKyberEnvelope) {
          decisiveFactor = 'KYBER_SHIELD';
          decisiveStatName = 'Kyber-1024 Post-Quantum Barriere';
          decisiveStatValue = '100% Ugjennomtrengelig Egress-lås';
        }
      } else {
        if (winner.entropyChaos > 6.0) {
          decisiveFactor = 'ENTROPY';
          decisiveStatName = 'Polymorf Kaos-Entropi Overvekt';
          decisiveStatValue = `${winner.entropyChaos.toFixed(2)} bits/byte Kaos-tetthet`;
        } else if (winner.category === 'ZERO_DAY') {
          decisiveFactor = 'ZERO_DAY_EXPLOIT';
          decisiveStatName = 'Udokumentert Kjerne-Exploit';
          decisiveStatValue = '92% Omgåelse av Signaturbaserte Filtre';
        }
      }

      const flawSeverity = winner.category === 'AI_DEFENDER' 
        ? Math.max(5, Math.round(30 - (winner.defensePower / 4))) 
        : Math.min(98, Math.round(50 + (winner.attackPower / 2)));

      const clashRecord: BattleClashRecord = {
        id: `CLASH-${Date.now()}`,
        timestamp: new Date().toISOString(),
        fighter1,
        fighter2,
        winner,
        loser,
        decisiveStatName,
        decisiveStatValue,
        decisiveFactor,
        rounds: currentRound,
        totalDamage: totalDmg,
        peakEntropy: Math.max(attacker.entropyChaos, defender.entropyChaos),
        criticalHits: critCount,
        vulnerabilitySeverityFound: flawSeverity,
        firewallPenetrationDepth: winner.category === 'AI_DEFENDER' ? 10 : 90,
        detailedReport: report,
        summaryLogs: [...battleLogs, logEntry],
      };

      setClashHistory((prev) => [clashRecord, ...prev]);

      const endLog: BattleLogEntry = {
        id: `log-end-${Date.now()}`,
        round: currentRound,
        actorName: 'CYBER ARENA',
        actionName: 'SEIER',
        message: `🏆 KAMP AVSLUTTET! ${winner.name} (${winner.avatar}) er seierherre etter ${currentRound} runder!`,
        damage: 0,
        hpLeft1: updatedFighter1.hp,
        hpLeft2: updatedFighter2.hp,
        timestamp: new Date().toLocaleTimeString(),
      };
      setBattleLogs((prev) => [...prev, endLog]);
      return;
    }

    // Advance Round & Switch Turn
    setTurn(turn === 1 ? 2 : 1);
    if (turn === 2) {
      setCurrentRound((prev) => prev + 1);
    }
  };

  // Auto-battle loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (battleState === 'FIGHTING' && isAutoBattle) {
      timer = setTimeout(() => {
        const attacker = turn === 1 ? fighter1 : fighter2;
        // AI selects move (favors signature move if available, else random)
        const moveIdx = Math.random() < 0.35 ? attacker.moves.length - 1 : Math.floor(Math.random() * (attacker.moves.length - 1));
        executeTurnAction(moveIdx);
      }, autoSpeedMs);
    }
    return () => clearTimeout(timer);
  }, [battleState, isAutoBattle, turn, fighter1, fighter2, currentRound, autoSpeedMs]);

  // Apply Presets to God Mode Config
  const applyPreset = (preset: 'MAX_GOD' | 'ULTRA_DEFENSIVE' | 'RETALIATION_HACK' | 'SANDBOX_LAB') => {
    if (preset === 'MAX_GOD') {
      setConfig({
        mirrorJammingEnabled: true,
        mirrorJammingIntensity: 10,
        phantomLoopEnabled: true,
        phantomLoopDelayMs: 5000,
        blackoutIsolationEnabled: true,
        autoBanThreshold: 1,
        activeCounterInfiltration: true,
        wiperNeutralization: true,
        bandwidthThrottleMbps: 10000,
        memoryHeapScramble: true,
        dpiWorkerCores: 32,
        quantumKyberEnvelope: true,
        syntheticDecoyInjection: true,
        honeytokenDensity: 500,
        blackholeDropRate: 100,
        retaliatoryTcpReset: true,
        entropyThreshold: 4.50,
        zeroDayHeuristicSensitivity: 'GUDEMODUS',
        activeYaraMatching: true,
        cveCorrelationAuto: true,
        sandboxType: 'CONTAINER_ISOLATED',
        airGapSimulation: true,
        zeroKnowledgeMemoryWipe: true,
        cpuCoreIsolation: true,
      });
    } else if (preset === 'ULTRA_DEFENSIVE') {
      setConfig((prev) => ({
        ...prev,
        mirrorJammingEnabled: true,
        mirrorJammingIntensity: 8,
        phantomLoopEnabled: true,
        blackoutIsolationEnabled: true,
        autoBanThreshold: 1,
        activeCounterInfiltration: false,
        memoryHeapScramble: true,
        airGapSimulation: true,
        zeroKnowledgeMemoryWipe: true,
      }));
    } else if (preset === 'RETALIATION_HACK') {
      setConfig((prev) => ({
        ...prev,
        activeCounterInfiltration: true,
        mirrorJammingEnabled: true,
        mirrorJammingIntensity: 10,
        retaliatoryTcpReset: true,
        syntheticDecoyInjection: true,
        honeytokenDensity: 350,
      }));
    } else if (preset === 'SANDBOX_LAB') {
      setConfig((prev) => ({
        ...prev,
        sandboxType: 'WASM_VIRTUAL',
        airGapSimulation: true,
        phantomLoopDelayMs: 4000,
        entropyThreshold: 5.20,
      }));
    }
  };

  // Add Custom Gladiator
  const handleCreateCustomGladiator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newGladiator: CyberGladiator = {
      id: `custom-${Date.now()}`,
      name: customName,
      title: customTitle || 'Egendefinert Cyber-Enhet',
      category: customCategory,
      avatar: customAvatar,
      hp: customHp,
      maxHp: customHp,
      attackPower: customAttack,
      defensePower: customDefense,
      entropyChaos: customEntropy,
      speed: customSpeed,
      color: customCategory === 'AI_DEFENDER' ? 'from-cyan-500 to-blue-800' : 'from-rose-600 to-purple-900',
      element: customCategory === 'AI_DEFENDER' ? 'AI_SENTINEL' : 'MALWARE',
      signatureMove: {
        name: customSigMove || 'Egendefinert Kjerne-Eksplosjon',
        description: 'Kraftig tilpasset angrep med modifisert nyttelast',
        power: Math.round(customAttack * 3.2),
        entropyShift: customEntropy > 5.0 ? 1.0 : -1.0,
        counterType: 'Kundeforsvarslag',
      },
      moves: [
        { id: 'm1', name: 'Standard Payload Skudd', description: 'Raskt førstelinje-angrep', power: Math.round(customAttack * 1.2), type: 'ATTACK' },
        { id: 'm2', name: 'Buffer Shield Refleksjon', description: 'Øker forsvar og reflekterer skade', power: Math.round(customDefense * 1.5), type: 'DEFENSE' },
        { id: 'm3', name: 'Obfuskert Mutasjon', description: 'Endrer signaturen underveis', power: Math.round(customEntropy * 15), type: 'MUTATION' },
        { id: 'm4', name: customSigMove || 'Egendefinert Kjerne-Eksplosjon', description: 'Maksimal signaturskade', power: Math.round(customAttack * 3.2), type: 'ULTIMATE' },
      ],
    };

    setGladiators((prev) => [newGladiator, ...prev]);
    setFighter1(newGladiator);
    setSubTab('arena');
    setCustomName('');
  };

  return (
    <div id="god-mode-arena" className="space-y-6">
      {/* Top Banner: Gudemodus Master Command */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-cyan-950/80 border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
              <span className="font-mono text-xs text-amber-400 font-bold tracking-widest uppercase bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                GUDEMODUS // DIVINE OMNI-CONTROL & GLADIATOR ARENA
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-100 flex items-center gap-2">
              Cyber-Gladiator & Fullskala Gudemodus Kontrollpanel
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Her kan du tilpasse absolutt alle parametere for <strong>angrep, styrke, kraft, kunnskap og sandboks</strong>, eller la ondsinnede virus og skadevare kjempe mot hverandre i en isolert Pokémon-aktig cyberarena med detaljerte etterkampsrapporter.
            </p>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setSubTab('arena')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === 'arena'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Virus Kamparena</span>
            </button>

            <button
              onClick={() => setSubTab('penetration_film')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === 'penetration_film'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Inntrengningsfilm & Kode</span>
            </button>

            <button
              onClick={() => setSubTab('battle_logs')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                subTab === 'battle_logs'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Kamp-Logg & Sammenstøt</span>
              {clashHistory.length > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  subTab === 'battle_logs' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {clashHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSubTab('config')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === 'config'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gudemodus Innstillinger</span>
            </button>

            <button
              onClick={() => setSubTab('custom_creator')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                subTab === 'custom_creator'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Skap Cyber-Kriger</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: VIRUS KAMP ARENA (POKÉMON STYLE) */}
      {subTab === 'arena' && (
        <div className="space-y-6">
          {/* Fighter Selection Carousel / Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fighter 1 Selection */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <span>🔴 Kriger 1 (Rød Sektor)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {fighter1.category}
                </span>
              </div>
              <select
                value={fighter1.id}
                disabled={battleState === 'FIGHTING'}
                onChange={(e) => {
                  const selected = gladiators.find((g) => g.id === e.target.value);
                  if (selected) setFighter1(selected);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {gladiators.map((g) => (
                  <option key={`f1-${g.id}`} value={g.id}>
                    {g.avatar} {g.name} — HP: {g.maxHp} | Kraft: {g.attackPower} | Entropi: {g.entropyChaos}
                  </option>
                ))}
              </select>
            </div>

            {/* Fighter 2 Selection */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <span>🔵 Kriger 2 (Blå Sektor)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {fighter2.category}
                </span>
              </div>
              <select
                value={fighter2.id}
                disabled={battleState === 'FIGHTING'}
                onChange={(e) => {
                  const selected = gladiators.find((g) => g.id === e.target.value);
                  if (selected) setFighter2(selected);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {gladiators.map((g) => (
                  <option key={`f2-${g.id}`} value={g.id}>
                    {g.avatar} {g.name} — HP: {g.maxHp} | Kraft: {g.attackPower} | Entropi: {g.entropyChaos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIVE IN-BATTLE HOT-MODDING PANEL FOR ARENA DUEL */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200 uppercase">
                  Sanntids Modifisering under Kamp // Hot-Modding (Side 1 vs Side 2)
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-bold">
                  LIVE JUSTERBART
                </span>
              </div>
              <button
                onClick={() => setShowLiveModding(!showLiveModding)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                {showLiveModding ? 'Skjul Modifisering ▲' : 'Vis Modifisering ▼'}
              </button>
            </div>

            {showLiveModding && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs border-t border-slate-800/80">
                {/* Mod Fighter 1 (Red) */}
                <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/40 space-y-2">
                  <div className="flex justify-between font-bold text-rose-300 text-[11px]">
                    <span>🔴 {fighter1.name} (Rød Sektor)</span>
                    <span>HP: {fighter1.hp}/{fighter1.maxHp}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Angrepskraft:</span>
                        <span className="font-bold text-rose-300">{fighter1.attackPower}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        value={fighter1.attackPower}
                        onChange={(e) => setFighter1({ ...fighter1, attackPower: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Forsvarskraft:</span>
                        <span className="font-bold text-cyan-300">{fighter1.defensePower}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={fighter1.defensePower}
                        onChange={(e) => setFighter1({ ...fighter1, defensePower: parseInt(e.target.value) })}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Kaos-Entropi:</span>
                        <span className="font-bold text-purple-300">{fighter1.entropyChaos.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.1"
                        value={fighter1.entropyChaos}
                        onChange={(e) => setFighter1({ ...fighter1, entropyChaos: parseFloat(e.target.value) })}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Fart (Hastighet):</span>
                        <span className="font-bold text-amber-300">{fighter1.speed}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        value={fighter1.speed}
                        onChange={(e) => setFighter1({ ...fighter1, speed: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Mod Fighter 2 (Blue) */}
                <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-900/40 space-y-2">
                  <div className="flex justify-between font-bold text-cyan-300 text-[11px]">
                    <span>🔵 {fighter2.name} (Blå Sektor)</span>
                    <span>HP: {fighter2.hp}/{fighter2.maxHp}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Angrepskraft:</span>
                        <span className="font-bold text-rose-300">{fighter2.attackPower}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        value={fighter2.attackPower}
                        onChange={(e) => setFighter2({ ...fighter2, attackPower: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Forsvarskraft:</span>
                        <span className="font-bold text-cyan-300">{fighter2.defensePower}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={fighter2.defensePower}
                        onChange={(e) => setFighter2({ ...fighter2, defensePower: parseInt(e.target.value) })}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Kaos-Entropi:</span>
                        <span className="font-bold text-purple-300">{fighter2.entropyChaos.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.1"
                        value={fighter2.entropyChaos}
                        onChange={(e) => setFighter2({ ...fighter2, entropyChaos: parseFloat(e.target.value) })}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Fart (Hastighet):</span>
                        <span className="font-bold text-amber-300">{fighter2.speed}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        value={fighter2.speed}
                        onChange={(e) => setFighter2({ ...fighter2, speed: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAIN ARENA RING */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Ambient arena grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

            {/* Visual Action Banner if animating */}
            {lastActionAnimation && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-500 text-slate-950 font-mono text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg animate-pulse uppercase tracking-wider">
                {lastActionAnimation === 'CRITICAL' ? '🔥 KRITISK TREFF!' : 
                 lastActionAnimation === 'REFLECT' ? '🛡️ MIRROR REFLEKTERT!' : 
                 lastActionAnimation === 'MUTATE' ? '🧬 POLYMORF MUTASJON!' : '💥 TREFF!'}
              </div>
            )}

            {/* Gladiators VS Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              {/* FIGHTER 1 CARD (RED) */}
              <div className={`lg:col-span-5 p-5 rounded-2xl border transition-all ${
                turn === 1 && battleState === 'FIGHTING'
                  ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-950/80 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl filter drop-shadow-md">{fighter1.avatar}</span>
                    <div>
                      <h2 className="font-mono font-bold text-base text-slate-100 flex items-center gap-1.5">
                        {fighter1.name}
                      </h2>
                      <p className="text-[11px] text-rose-300 font-mono">{fighter1.title}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    Nivå {Math.round(fighter1.attackPower / 10)}
                  </span>
                </div>

                {/* HP Bar */}
                <div className="space-y-1 my-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Integritet / HP:</span>
                    <span className="font-bold text-slate-200">{fighter1.hp} / {fighter1.maxHp}</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        fighter1.hp / fighter1.maxHp > 0.5 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                        fighter1.hp / fighter1.maxHp > 0.2 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                      }`}
                      style={{ width: `${Math.max(0, (fighter1.hp / fighter1.maxHp) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fighter Stats Badges */}
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] my-3">
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Kraft</div>
                    <div className="text-rose-400 font-bold">{fighter1.attackPower}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Forsvar</div>
                    <div className="text-cyan-400 font-bold">{fighter1.defensePower}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Entropi</div>
                    <div className="text-purple-400 font-bold">{fighter1.entropyChaos.toFixed(2)}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Fart</div>
                    <div className="text-amber-400 font-bold">{fighter1.speed}</div>
                  </div>
                </div>

                {/* Attack / Move Selector (When Fighter 1's turn) */}
                {battleState === 'FIGHTING' && turn === 1 && !isAutoBattle && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-mono text-rose-300 font-semibold block mb-2">
                      👉 Velg handling for {fighter1.name}:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {fighter1.moves.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => executeTurnAction(idx)}
                          className="p-2 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-left font-mono text-xs transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-rose-200 truncate">{m.name}</div>
                          <div className="text-[10px] text-slate-300 mt-0.5 truncate">
                            {m.type === 'ULTIMATE' ? '⚡ Signatur' : `${m.power} dmg`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER ARENA CONTROLS & VS LOGO */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center shadow-lg shadow-amber-950/50">
                  <span className="font-mono font-extrabold text-lg text-amber-400">VS</span>
                </div>

                {/* Battle Flow Buttons */}
                {battleState === 'IDLE' || battleState === 'FINISHED' ? (
                  <button
                    onClick={handleStartBattle}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-xl hover:opacity-95 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Cyber-Kamp</span>
                  </button>
                ) : (
                  <div className="w-full space-y-2">
                    <button
                      onClick={() => setIsAutoBattle(!isAutoBattle)}
                      className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        isAutoBattle
                          ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isAutoBattle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isAutoBattle ? 'Stopp Auto-Kamp' : 'Autonom Kamp'}</span>
                    </button>

                    <button
                      onClick={handleStartBattle}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Omstart
                    </button>

                    {/* Speed Selector */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span>Fart:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAutoSpeedMs(1500)}
                          className={`px-1.5 py-0.5 rounded ${autoSpeedMs === 1500 ? 'bg-cyan-900 text-cyan-300' : 'hover:bg-slate-800'}`}
                        >
                          1x
                        </button>
                        <button
                          onClick={() => setAutoSpeedMs(800)}
                          className={`px-1.5 py-0.5 rounded ${autoSpeedMs === 800 ? 'bg-cyan-900 text-cyan-300' : 'hover:bg-slate-800'}`}
                        >
                          2x
                        </button>
                        <button
                          onClick={() => setAutoSpeedMs(300)}
                          className={`px-1.5 py-0.5 rounded ${autoSpeedMs === 300 ? 'bg-cyan-900 text-cyan-300' : 'hover:bg-slate-800'}`}
                        >
                          Lyn
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FIGHTER 2 CARD (BLUE) */}
              <div className={`lg:col-span-5 p-5 rounded-2xl border transition-all ${
                turn === 2 && battleState === 'FIGHTING'
                  ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/80 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl filter drop-shadow-md">{fighter2.avatar}</span>
                    <div>
                      <h2 className="font-mono font-bold text-base text-slate-100 flex items-center gap-1.5">
                        {fighter2.name}
                      </h2>
                      <p className="text-[11px] text-cyan-300 font-mono">{fighter2.title}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Nivå {Math.round(fighter2.attackPower / 10)}
                  </span>
                </div>

                {/* HP Bar */}
                <div className="space-y-1 my-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Integritet / HP:</span>
                    <span className="font-bold text-slate-200">{fighter2.hp} / {fighter2.maxHp}</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        fighter2.hp / fighter2.maxHp > 0.5 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                        fighter2.hp / fighter2.maxHp > 0.2 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                      }`}
                      style={{ width: `${Math.max(0, (fighter2.hp / fighter2.maxHp) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fighter Stats Badges */}
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] my-3">
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Kraft</div>
                    <div className="text-rose-400 font-bold">{fighter2.attackPower}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Forsvar</div>
                    <div className="text-cyan-400 font-bold">{fighter2.defensePower}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Entropi</div>
                    <div className="text-purple-400 font-bold">{fighter2.entropyChaos.toFixed(2)}</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Fart</div>
                    <div className="text-amber-400 font-bold">{fighter2.speed}</div>
                  </div>
                </div>

                {/* Attack / Move Selector (When Fighter 2's turn) */}
                {battleState === 'FIGHTING' && turn === 2 && !isAutoBattle && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold block mb-2">
                      👉 Velg handling for {fighter2.name}:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {fighter2.moves.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => executeTurnAction(idx)}
                          className="p-2 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700 text-left font-mono text-xs transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-cyan-200 truncate">{m.name}</div>
                          <div className="text-[10px] text-slate-300 mt-0.5 truncate">
                            {m.type === 'ULTIMATE' ? '⚡ Signatur' : `${m.power} dmg`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE COMBAT LOG COMMENTARY */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Sanntids Kampkommentarer & Forensisk Logg
                </span>
                {latestReport && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" /> Se Seiersrapport →
                  </button>
                )}
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 h-44 overflow-y-auto font-mono text-xs space-y-1.5 shadow-inner">
                {battleLogs.map((log) => (
                  <div key={log.id} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
                <div ref={battleLogEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: INNTRENGNINGSFILM & KODEFORSLAG (FIREWALL PENETRATION SIMULATOR) */}
      {subTab === 'penetration_film' && (
        <FirewallFilmSimulator
          config={config}
          onUpdateConfig={setConfig}
          onRecordClash={(clash) => {
            setClashHistory((prev) => [clash, ...prev]);
          }}
        />
      )}

      {/* SUB-VIEW: KAMP-LOGG & SANNTIDSSAMMENSTØT (HISTORIKK & FORENSISK ANALYSE) */}
      {subTab === 'battle_logs' && (
        <GodModeBattleLog
          clashHistory={clashHistory}
          onClearHistory={() => setClashHistory([])}
          onSelectClashForInspection={(clash) => {
            setLatestReport(clash.detailedReport);
            setShowReportModal(true);
          }}
        />
      )}

      {/* SUB-VIEW 2: GUDEMODUS INNSTILLINGER (FULLSTENDIG TILPASNING) */}
      {subTab === 'config' && (
        <div className="space-y-6">
          {/* Quick Preset Buttons */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-300 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Hurtig-Konfigurasjoner (Presets):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset('MAX_GOD')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow cursor-pointer"
              >
                ⚡ Full Gudemodus (Maks Alt)
              </button>
              <button
                onClick={() => applyPreset('ULTRA_DEFENSIVE')}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 font-mono text-xs transition-colors cursor-pointer"
              >
                🛡️ Ultra-Defensiv Borg
              </button>
              <button
                onClick={() => applyPreset('RETALIATION_HACK')}
                className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 font-mono text-xs transition-colors cursor-pointer"
              >
                ⚔️ Offensiv "Hacking Back"
              </button>
              <button
                onClick={() => applyPreset('SANDBOX_LAB')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
              >
                🔬 Sandboks Lab
              </button>
            </div>
          </div>

          {/* 5 Config Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Category 1: Angrep & Motoffensiv */}
            <div className="bg-slate-950 border border-rose-900/50 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Swords className="w-4 h-4 text-rose-400" />
                <h3 className="font-mono font-bold text-sm text-slate-200 uppercase">
                  1. Angrep & Motoffensiv
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Mirror Jamming Speiling</span>
                  <input
                    type="checkbox"
                    checked={config.mirrorJammingEnabled}
                    onChange={(e) => setConfig({ ...config, mirrorJammingEnabled: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Speilingsintensitet:</span>
                    <strong className="text-rose-400">{config.mirrorJammingIntensity} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.mirrorJammingIntensity}
                    onChange={(e) => setConfig({ ...config, mirrorJammingIntensity: parseInt(e.target.value) })}
                    className="w-full accent-rose-500"
                  />
                </div>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Aktiv Counter-Infiltration ("Hacking Back")</span>
                  <input
                    type="checkbox"
                    checked={config.activeCounterInfiltration}
                    onChange={(e) => setConfig({ ...config, activeCounterInfiltration: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Wiper & Skadevare Nøytralisering</span>
                  <input
                    type="checkbox"
                    checked={config.wiperNeutralization}
                    onChange={(e) => setConfig({ ...config, wiperNeutralization: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Category 2: Styrke & Ytelse */}
            <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono font-bold text-sm text-slate-200 uppercase">
                  2. Styrke & Kjerneytelse
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Båndbredde Kapasitet:</span>
                    <strong className="text-cyan-400">{config.bandwidthThrottleMbps} Mbps</strong>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={config.bandwidthThrottleMbps}
                    onChange={(e) => setConfig({ ...config, bandwidthThrottleMbps: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>AES-256-GCM Heap Scrambling</span>
                  <input
                    type="checkbox"
                    checked={config.memoryHeapScramble}
                    onChange={(e) => setConfig({ ...config, memoryHeapScramble: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>DPI Kjerner (Inspeksjon):</span>
                    <strong className="text-cyan-400">{config.dpiWorkerCores} kjerner</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="32"
                    value={config.dpiWorkerCores}
                    onChange={(e) => setConfig({ ...config, dpiWorkerCores: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Post-Quantum Kyber-1024 Konvolutt</span>
                  <input
                    type="checkbox"
                    checked={config.quantumKyberEnvelope}
                    onChange={(e) => setConfig({ ...config, quantumKyberEnvelope: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Category 3: Kraft & Gjengjeldelse */}
            <div className="bg-slate-950 border border-amber-900/50 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono font-bold text-sm text-slate-200 uppercase">
                  3. Kraft & Gjengjeldelse
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Syntetisk Database-Decoy</span>
                  <input
                    type="checkbox"
                    checked={config.syntheticDecoyInjection}
                    onChange={(e) => setConfig({ ...config, syntheticDecoyInjection: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Honeytoken Felle-tetthet:</span>
                    <strong className="text-amber-400">{config.honeytokenDensity} falske nøkler</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={config.honeytokenDensity}
                    onChange={(e) => setConfig({ ...config, honeytokenDensity: parseInt(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Gjengjeldende TCP Reset Flom</span>
                  <input
                    type="checkbox"
                    checked={config.retaliatoryTcpReset}
                    onChange={(e) => setConfig({ ...config, retaliatoryTcpReset: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Category 4: Kunnskap & Intelligens */}
            <div className="bg-slate-950 border border-purple-900/50 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Eye className="w-4 h-4 text-purple-400" />
                <h3 className="font-mono font-bold text-sm text-slate-200 uppercase">
                  4. Kunnskap & Heuristikk
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Shannon Entropi Terskel:</span>
                    <strong className="text-purple-400">{config.entropyThreshold.toFixed(2)} bits</strong>
                  </div>
                  <input
                    type="range"
                    min="2.00"
                    max="7.50"
                    step="0.05"
                    value={config.entropyThreshold}
                    onChange={(e) => setConfig({ ...config, entropyThreshold: parseFloat(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Zero-Day Følsomhet:</span>
                  <select
                    value={config.zeroDayHeuristicSensitivity}
                    onChange={(e) => setConfig({ ...config, zeroDayHeuristicSensitivity: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="LAV">Lav Heuristikk</option>
                    <option value="MIDDELS">Middels Standard</option>
                    <option value="PARANOIA">Paranoia Filter</option>
                    <option value="GUDEMODUS">Gudemodus (Zero-Tolerance)</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Aktiv YARA-Regel Matching</span>
                  <input
                    type="checkbox"
                    checked={config.activeYaraMatching}
                    onChange={(e) => setConfig({ ...config, activeYaraMatching: e.target.checked })}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Category 5: Sandboks & Isolasjon */}
            <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-slate-200 uppercase">
                  5. Sandboks & Isolasjonsnivå
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Sandboks Type:</span>
                  <select
                    value={config.sandboxType}
                    onChange={(e) => setConfig({ ...config, sandboxType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="WASM_VIRTUAL">Wasm Virtuell Sandboks</option>
                    <option value="CONTAINER_ISOLATED">Isolert Mikro-Container</option>
                    <option value="AIR_GAP_SIM">Air-Gap Simulator</option>
                    <option value="MICRO_VM">Micro-VM Kjerne</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Air-Gap Simulering</span>
                  <input
                    type="checkbox"
                    checked={config.airGapSimulation}
                    onChange={(e) => setConfig({ ...config, airGapSimulation: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>Zero-Knowledge Minnesletting</span>
                  <input
                    type="checkbox"
                    checked={config.zeroKnowledgeMemoryWipe}
                    onChange={(e) => setConfig({ ...config, zeroKnowledgeMemoryWipe: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SKAP NY CYBER-KRIGER (GLADIATOR CREATOR) */}
      {subTab === 'custom_creator' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
            <Plus className="w-5 h-5 text-purple-400" />
            <h2 className="font-mono font-bold text-base text-slate-100 uppercase">
              Bygg Egendefinert Cyber-Kriger / Virus
            </h2>
          </div>

          <form onSubmit={handleCreateCustomGladiator} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Navn på Kriger:</label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. Quantum-Stuxnet v3"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tittel / Klasse:</label>
                <input
                  type="text"
                  placeholder="f.eks. Zero-Day Polymorfisk Rootkit"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Kategori:</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  <option value="VIRUS">Ondsinnet Virus</option>
                  <option value="AI_DEFENDER">AI Kjerneforsvarer</option>
                  <option value="ZERO_DAY">Zero-Day Trussel</option>
                  <option value="RANSOMWARE">Ransomware</option>
                  <option value="WIPER">Destruktiv Wiper</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Avatar / Ikon:</label>
                <select
                  value={customAvatar}
                  onChange={(e) => setCustomAvatar(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  <option value="👾">👾 Alien Glitch</option>
                  <option value="🐉">🐉 Hydra Dragon</option>
                  <option value="👻">👻 Phantom Ghost</option>
                  <option value="☣️">☣️ Biohazard Hazard</option>
                  <option value="💣">💣 Wiper Bomb</option>
                  <option value="🛡️">🛡️ Sentinel Shield</option>
                  <option value="🧠">🧠 Neural AI</option>
                  <option value="⚔️">⚔️ Counter Strike</option>
                  <option value="🦅">🦅 Cyber Falcon</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maks HP (Helse):</label>
                <input
                  type="number"
                  min="500"
                  max="3000"
                  step="50"
                  value={customHp}
                  onChange={(e) => setCustomHp(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block mb-1">Angrepskraft: {customAttack}</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={customAttack}
                  onChange={(e) => setCustomAttack(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block mb-1">Forsvarskraft: {customDefense}</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={customDefense}
                  onChange={(e) => setCustomDefense(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block mb-1">Entropi: {customEntropy.toFixed(1)}</span>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={customEntropy}
                  onChange={(e) => setCustomEntropy(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block mb-1">Hastighet: {customSpeed}</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={customSpeed}
                  onChange={(e) => setCustomSpeed(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Signatur-Move (Spesialangrep):</label>
              <input
                type="text"
                placeholder="f.eks. Quantum Heap Overflow Strike"
                value={customSigMove}
                onChange={(e) => setCustomSigMove(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              🚀 Lagre Kriger & Gå til Kamparena
            </button>
          </form>
        </div>
      )}

      {/* FORENSIC VICTORY REPORT MODAL */}
      {showReportModal && latestReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100 uppercase">
                  Offisiell Forensisk Etterkampsrapport // #{latestReport.id}
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕ Lukk
              </button>
            </div>

            {/* Winner Spotlight */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 flex items-center gap-4">
              <span className="text-4xl">{latestReport.winner.avatar}</span>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">SEIERHERRE</span>
                <h4 className="text-base font-bold text-slate-100">{latestReport.winner.name}</h4>
                <p className="text-[11px] text-slate-300">{latestReport.winner.title}</p>
              </div>
            </div>

            {/* Key Battle Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Runder:</span>
                <div className="text-sm font-bold text-cyan-300">{latestReport.rounds}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Total Skade:</span>
                <div className="text-sm font-bold text-rose-400">{latestReport.totalDamageDealt} HP</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Kritiske Treff:</span>
                <div className="text-sm font-bold text-amber-300">{latestReport.criticalHits}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Topp Entropi:</span>
                <div className="text-sm font-bold text-purple-300">{latestReport.peakEntropy.toFixed(2)}</div>
              </div>
            </div>

            {/* Tactical Exploit Analysis */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400 text-[11px]">Avgjørende Angrepsmove:</span>
                <div className="text-amber-300 font-bold mt-0.5">{latestReport.decisiveExploit}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Lært Forsvarskonklusjon:</span>
                <p className="text-slate-200 text-xs mt-0.5">{latestReport.countermeasureLearned}</p>
              </div>
            </div>

            {/* Generated YARA Rule Preview */}
            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Automatisk Generert YARA-Signatur:</span>
              <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] text-emerald-400 overflow-x-auto">
                {latestReport.yaraRuleGenerated}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
              <span className="text-slate-500 font-mono">WORM Proof Hash: {latestReport.wormProofHash}</span>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(latestReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `battle-report-${latestReport.id}.json`;
                  a.click();
                }}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Last ned Rapport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
