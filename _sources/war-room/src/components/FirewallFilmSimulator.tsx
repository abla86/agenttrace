import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Skull, 
  Cpu, 
  Zap, 
  Sliders, 
  Code2, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Sparkles, 
  Flame, 
  Crosshair, 
  Terminal,
  Crown,
  FileCode2,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { 
  GodModeConfig, 
  FirewallPenetrationLayer, 
  CodeSuggestion, 
  BattleClashRecord, 
  BattleLogEntry, 
  BattleReport 
} from '../types';

interface FirewallFilmSimulatorProps {
  config: GodModeConfig;
  onUpdateConfig: (newConfig: GodModeConfig) => void;
  onRecordClash: (clash: BattleClashRecord) => void;
}

export const INITIAL_LAYERS: FirewallPenetrationLayer[] = [
  {
    id: 'layer-1',
    layerNumber: 1,
    name: 'Lag 1: Ytre Grense & WAF Pakkefiltrering',
    techName: 'DPI Edge Filter + SYN-Flood Shaper',
    status: 'UNTOUCHED',
    layerHealth: 100,
    defenseType: 'IP-filtrering & Signaturgjenkjenning',
    description: 'Førstelinjeforsvar som inspiserer innkommende TCP/UDP-pakkeheadere, SQLi-mønstre og blokkerer kjente trussel-IP-er.',
    activeFilterRule: 'DROP WHERE regex(payload) IN [union, select, <script>, 0x9090]',
  },
  {
    id: 'layer-2',
    layerNumber: 2,
    name: 'Lag 2: Shannon Entropi & Zero-Day Heuristikk',
    techName: 'Shannon Entropy Core (Terskel 5.20 bits)',
    status: 'UNTOUCHED',
    layerHealth: 100,
    defenseType: 'Matematisk Informasjonstetthet & Obfuskasjons-scanner',
    description: 'Måler uforutsigbarhet i rå binærstrøm. Fanger opp ukjente muterte nyttelaster og polymorfe shellcodes uten behov for faste signaturer.',
    activeFilterRule: 'CALC_ENTROPY(payload) > threshold ? REDIRECT_TO_HONEYPOT : PASS',
  },
  {
    id: 'layer-3',
    layerNumber: 3,
    name: 'Lag 3: Minne Heap-Scrambler & Sandboks Tarpit',
    techName: 'AES-256-GCM In-Memory Shuffler + Phantom Loop',
    status: 'UNTOUCHED',
    layerHealth: 100,
    defenseType: 'Heap Isolation & Tidslåsende Sinkehull',
    description: 'Gjør minnebufferne usårlige mot buffer overflow, mens ondsinnede tråder fanges i en endeløs Phantom Loop med forsinkede svar.',
    activeFilterRule: 'SCRAMBLE_HEAP(0x7fff0000, AES_GCM) && TRAP_SOCKET(delay=2500ms)',
  },
  {
    id: 'layer-4',
    layerNumber: 4,
    name: 'Lag 4: Uforanderlig WORM-Kjerne & Blackout Ban',
    techName: 'SHA-256 Forward-Secure WAL + Kyber-1024 Shield',
    status: 'UNTOUCHED',
    layerHealth: 100,
    defenseType: 'Kryptografisk Integritet & Permanent Karantene',
    description: 'Siste forsvarsborg: Logger ugjendrivelige bevis til uforanderlig WORM-fil, stenger portene og kutter angriperens forbindelse permanent.',
    activeFilterRule: 'WORM_APPEND(hash_chain) && BLACKOUT_ISOLATE(attacker_ip, permanent=true)',
  },
];

export const CODE_SUGGESTIONS_DB: CodeSuggestion[] = [
  // LAYER 1 SUGGESTIONS
  {
    id: 'sug-v-1a',
    side: 'VIRUS',
    layerNumber: 1,
    title: 'Chunked Transfer Encoding Bypass',
    description: 'Deler SQLi-nyttelasten opp i ørsmå HTTP-biter for å omgå statiske WAF-regler.',
    language: 'python',
    code: `import socket\n\np = b"POST /api/v1/auth HTTP/1.1\\r\\nTransfer-Encoding: chunked\\r\\n\\r\\n"\np += b"4\\r\\n' UN\\r\\n4\\r\\nION \\r\\n6\\r\\nSELECT\\r\\n0\\r\\n\\r\\n"\ns = socket.socket(); s.connect(('target', 80)); s.send(p)`,
    impact: { virusPower: 25, breachDelta: 30, flawSeverityDiscovered: 45 },
  },
  {
    id: 'sug-f-1a',
    side: 'FIREWALL',
    layerNumber: 1,
    title: 'Hot-Patch: iptables De-chunk Reassembly Rule',
    description: 'Monterer sanntids strøm-inspeksjon som setter sammen oppdelte biter før de når applikasjonen.',
    language: 'iptables',
    code: `# Umiddelbar brannmur-regel for a tette oppdelt WAF-omgaelse\niptables -A INPUT -p tcp --dport 3000 -m string --algo bm --string "Transfer-Encoding: chunked" -j REJECT --reject-with tcp-reset`,
    impact: { firewallDefense: 35, breachDelta: -40, flawSeverityDiscovered: -20 },
  },

  // LAYER 2 SUGGESTIONS
  {
    id: 'sug-v-2a',
    side: 'VIRUS',
    layerNumber: 2,
    title: 'Polymorphic NOP-Sled Dilution (Lav Entropi)',
    description: 'Blander inn store mengder naturlig engelsk tekst for å senke Shannon-entropien under 5.20 bits.',
    language: 'c',
    code: `// Utvanner binær entropi ved a fylle nyttelasten med ASCII ordboeker\nchar *diluted_payload = malloc(4096);\nsprintf(diluted_payload, "The quick brown fox jumps over %s", obfuscated_shellcode);`,
    impact: { virusPower: 30, entropyDelta: -1.8, breachDelta: 35, flawSeverityDiscovered: 65 },
  },
  {
    id: 'sug-f-2a',
    side: 'FIREWALL',
    layerNumber: 2,
    title: 'Adaptive Sliding-Window Shannon Entropi-Filter',
    description: 'Kjører entropi-analyse i glidende 64-bytes blokker for å finne konsentrerte shellcodes gjemt i tekst.',
    language: 'python',
    code: `def analyze_sliding_entropy(data, window=64):\n    for i in range(0, len(data)-window, 16):\n        chunk = data[i:i+window]\n        if shannon_entropy(chunk) >= 4.60:\n            raise ZeroDayDetected("Entropi-hotspot oppdaget i offset " + hex(i))`,
    impact: { firewallDefense: 40, breachDelta: -50, flawSeverityDiscovered: -30 },
  },

  // LAYER 3 SUGGESTIONS
  {
    id: 'sug-v-3a',
    side: 'VIRUS',
    layerNumber: 3,
    title: 'Return-Oriented Programming (ROP) Gadget Chain',
    description: 'Lenker eksisterende instruksjoner i glibc for å omgå ikke-kjørbart minne (NX) og heap-scrambling.',
    language: 'c',
    code: `// ROP-gadget lenking for a overstyre registere uten ny kode\nunsigned long rop_chain[] = {\n    0x000000000040188b, // pop rdi; ret\n    (unsigned long)target_arg,\n    0x0000000000401060  // system() kall\n};`,
    impact: { virusPower: 40, breachDelta: 45, flawSeverityDiscovered: 85 },
  },
  {
    id: 'sug-f-3a',
    side: 'FIREWALL',
    layerNumber: 3,
    title: 'AES-256-GCM Memory Heap Scrambler & Tarpit Trap',
    description: 'Krypterer alle pekere dynamisk med tilfeldig engangsnøkkel og ruter angrepstråden inn i en 5-sekunders Phantom Loop.',
    language: 'c',
    code: `#define SCRAMBLE_PTR(p) ((void*)((uintptr_t)(p) ^ aes_gcm_session_mask))\n// Fanger traaden i evig sinkehull\nwhile(active_exploit) { usleep(5000000); send_synthetic_mirror_response(); }`,
    impact: { firewallDefense: 50, breachDelta: -60, flawSeverityDiscovered: -40 },
  },

  // LAYER 4 SUGGESTIONS
  {
    id: 'sug-v-4a',
    side: 'VIRUS',
    layerNumber: 4,
    title: 'Raw Firmware Wiper Flash Overwrite',
    description: 'Forsøker å nå rå SPI flash-drivere for å overskrive MBR og slette WORM-sikkerhetskopier.',
    language: 'c',
    code: `int fd = open("/dev/sda", O_WRONLY | O_SYNC);\nchar zeroes[4096] = {0};\nwrite(fd, zeroes, sizeof(zeroes)); // Nøytralisert av WORM-skjold`,
    impact: { virusPower: 50, breachDelta: 50, flawSeverityDiscovered: 95 },
  },
  {
    id: 'sug-f-4a',
    side: 'FIREWALL',
    layerNumber: 4,
    title: 'Kyber-1024 Quantum Lockdown & Permanent Blackout',
    description: 'Kryptografisk forsegling: Låser WORM-filen med SHA-256 hash-kjede og kutter nettverkskortet for angriper-IP.',
    language: 'yara',
    code: `rule Quantum_Blackout_Enforcement {\n  meta:\n    security_action = "PERMANENT_BLACKOUT_ISOLATION"\n    worm_status = "IMMUTABLE_LOCKED"\n  condition:\n    worm_seal_valid and ip_blacklisted\n}`,
    impact: { firewallDefense: 100, breachDelta: -100, flawSeverityDiscovered: -80 },
  },
];

export const FirewallFilmSimulator: React.FC<FirewallFilmSimulatorProps> = ({
  config,
  onUpdateConfig,
  onRecordClash,
}) => {
  // Simulator state
  const [layers, setLayers] = useState<FirewallPenetrationLayer[]>(INITIAL_LAYERS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1000); // ms per tick
  const [currentLayerIdx, setCurrentLayerIdx] = useState<number>(0);
  const [simulationStatus, setSimulationStatus] = useState<'IDLE' | 'SIMULATING' | 'DEFENSE_WON' | 'BREACH_SUCCESS'>('IDLE');
  
  // Real-time Hot-Modding Parameters (Live In-Battle modification)
  // Side 1: Brannmur
  const [firewallPower, setFirewallPower] = useState<number>(config.dpiWorkerCores * 4 + (config.quantumKyberEnvelope ? 30 : 0));
  const [mirrorJammingLevel, setMirrorJammingLevel] = useState<number>(config.mirrorJammingIntensity);
  const [entropyCutoff, setEntropyCutoff] = useState<number>(config.entropyThreshold);
  const [godModeActive, setGodModeActive] = useState<boolean>(true);

  // Side 2: Virus / Angriper
  const [virusName, setVirusName] = useState<string>('MutaMorph-ZeroDay v9');
  const [virusAttack, setVirusAttack] = useState<number>(85);
  const [virusEntropy, setVirusEntropy] = useState<number>(6.95);
  const [virusStealth, setVirusStealth] = useState<number>(75);
  const [virusSpeed, setVirusSpeed] = useState<number>(80);

  // Progress Metrics
  const [overallPenetrationDepth, setOverallPenetrationDepth] = useState<number>(0); // 0-100%
  const [flawSeverityFound, setFlawSeverityFound] = useState<number>(15); // 0-100%
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState<CodeSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CodeSuggestion | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simLogs]);

  // Update active suggestions when current layer changes
  useEffect(() => {
    const layerNum = currentLayerIdx + 1;
    const available = CODE_SUGGESTIONS_DB.filter((s) => s.layerNumber === layerNum);
    setActiveSuggestions(available);
  }, [currentLayerIdx]);

  // Reset simulation
  const handleResetSimulation = () => {
    setIsPlaying(false);
    setLayers(INITIAL_LAYERS.map((l) => ({ ...l, status: 'UNTOUCHED', layerHealth: 100 })));
    setCurrentLayerIdx(0);
    setSimulationStatus('IDLE');
    setOverallPenetrationDepth(0);
    setFlawSeverityFound(godModeActive ? 5 : 25);
    setSimLogs([
      `[${new Date().toLocaleTimeString()}] 🎬 Simulator initialisert: 4 lag operative.`,
      `[${new Date().toLocaleTimeString()}] 🛡️ Gudemodus Status: ${godModeActive ? 'AKTIV (Tilnærmet Ugjennomtrengelig)' : 'Egendefinert'}.`,
    ]);
  };

  // Start / Resume Movie
  const handleStartMovie = () => {
    if (simulationStatus === 'DEFENSE_WON' || simulationStatus === 'BREACH_SUCCESS') {
      handleResetSimulation();
    }
    setSimulationStatus('SIMULATING');
    setIsPlaying(true);
    setSimLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚀 Film startet: ${virusName} initierer multi-vektor inntrengning!`,
    ]);
  };

  // Apply a Code Suggestion on the fly (Interaktivt valg underveis)
  const handleApplySuggestion = (sug: CodeSuggestion) => {
    setSelectedSuggestion(sug);
    
    // Impact calculations
    if (sug.side === 'VIRUS') {
      const boost = sug.impact.virusPower || 15;
      const newAtk = Math.min(100, virusAttack + boost);
      setVirusAttack(newAtk);
      if (sug.impact.entropyDelta) {
        setVirusEntropy((prev) => Math.max(1.0, Math.min(8.0, prev + (sug.impact.entropyDelta || 0))));
      }
      if (sug.impact.flawSeverityDiscovered) {
        setFlawSeverityFound((prev) => Math.min(100, prev + (sug.impact.flawSeverityDiscovered || 0)));
      }
      setSimLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 💉 [VIRUS INJEKSJON]: Brukte kode [${sug.title}]. Angrepskraft økt til ${newAtk}!`,
      ]);
    } else {
      const boost = sug.impact.firewallDefense || 25;
      const newDef = Math.min(100, firewallPower + boost);
      setFirewallPower(newDef);
      if (sug.impact.flawSeverityDiscovered) {
        setFlawSeverityFound((prev) => Math.max(0, prev + (sug.impact.flawSeverityDiscovered || 0)));
      }
      setSimLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🛡️ [BRANNMUR HOT-PATCH]: Monterte mottiltak [${sug.title}]. Forsvarsstyrke økt til ${newDef}!`,
      ]);
    }
  };

  // Simulation tick step
  const executeSimulationTick = () => {
    if (currentLayerIdx >= layers.length) return;

    const currentLayer = layers[currentLayerIdx];
    
    // Check if God Mode is active
    // If God Mode is ACTIVE, the defense stops everything early (impervious at Layer 1/2)
    if (godModeActive) {
      // In Full God Mode, Layer 1 & 2 stop 100% of probes cold
      const updatedLayers = [...layers];
      updatedLayers[currentLayerIdx] = {
        ...currentLayer,
        status: 'BLOCKED',
        layerHealth: 100,
      };
      setLayers(updatedLayers);

      setSimLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚡ [GUDEMODUS AKTIV]: ${currentLayer.name} nøytraliserte ${virusName} umiddelbart via ${currentLayer.techName}!`,
        `[${new Date().toLocaleTimeString()}] 🔒 Status: Permanent ugjennomtrengelig. Pakker terminert med 0 byte lekkasje.`,
      ]);

      setSimulationStatus('DEFENSE_WON');
      setIsPlaying(false);
      setOverallPenetrationDepth(Math.round((currentLayerIdx / layers.length) * 100));

      // Record in battle log
      recordClashEvent(true, 'Full Gudemodus Autonom Barriere (Ugjennomtrengelig)', '0% Penetrasjon / 100% Blokkert');
      return;
    }

    // Dynamic calculation when user hot-mods stats
    const effectiveDefense = firewallPower + (mirrorJammingLevel * 3);
    const effectiveAttack = virusAttack + (virusEntropy * 4) + (virusStealth / 2);

    // If attack overcomes current layer defense
    const breachChance = (effectiveAttack - effectiveDefense) / 100 + 0.3;
    const isLayerBreached = Math.random() < breachChance;

    const updatedLayers = [...layers];

    if (isLayerBreached && currentLayerIdx < layers.length - 1) {
      // Breached this layer, move to next layer
      updatedLayers[currentLayerIdx] = {
        ...currentLayer,
        status: 'BREACHED',
        layerHealth: 0,
      };
      setLayers(updatedLayers);

      const newDepth = Math.round(((currentLayerIdx + 1) / layers.length) * 100);
      setOverallPenetrationDepth(newDepth);
      setFlawSeverityFound((prev) => Math.min(100, prev + 20));

      setSimLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚠️ SÅRBARHET UTNYTTET: ${virusName} brøt gjennom ${currentLayer.name}!`,
        `[${new Date().toLocaleTimeString()}] 🚪 Angriper rykker frem til ${layers[currentLayerIdx + 1].name}...`,
      ]);

      setCurrentLayerIdx((prev) => prev + 1);
    } else if (isLayerBreached && currentLayerIdx === layers.length - 1) {
      // Breached final layer 4 (Rare, only if virus heavily buffed)
      updatedLayers[currentLayerIdx] = {
        ...currentLayer,
        status: 'BREACHED',
        layerHealth: 0,
      };
      setLayers(updatedLayers);
      setOverallPenetrationDepth(100);
      setSimulationStatus('BREACH_SUCCESS');
      setIsPlaying(false);

      setSimLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🚨 FULL SYSTEMGJENNOMTRENGNING! ${virusName} overvant alle 4 forsvarslag!`,
      ]);

      recordClashEvent(false, 'Kritisk Zero-Day ROP Exploit', '100% Penetrasjon');
    } else {
      // Layer successfully BLOCKED the virus
      updatedLayers[currentLayerIdx] = {
        ...currentLayer,
        status: 'BLOCKED',
        layerHealth: Math.max(20, 100 - Math.round(effectiveAttack / 2)),
      };
      setLayers(updatedLayers);

      setSimLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🛡️ ANGREP STOPPET: ${currentLayer.name} stoppet ${virusName} med [${currentLayer.techName}]!`,
        `[${new Date().toLocaleTimeString()}] 🔒 Forsvarer seiret! Angrepsvektor isolert i sandboks.`,
      ]);

      setSimulationStatus('DEFENSE_WON');
      setIsPlaying(false);
      setOverallPenetrationDepth(Math.round((currentLayerIdx / layers.length) * 100));

      recordClashEvent(true, `${currentLayer.techName} Refleksjon`, `${Math.round(effectiveDefense)} vs ${Math.round(effectiveAttack)} Kraft`);
    }
  };

  // Record clash event helper
  const recordClashEvent = (defenseWon: boolean, statName: string, statValue: string) => {
    const winnerGladiator = defenseWon ? {
      id: 'ai-sentinel-god',
      name: 'WPWW Sentinel (Gudemodus)',
      title: 'Ugjennomtrengelig 4-Lags Kjerne',
      category: 'AI_DEFENDER' as const,
      avatar: '🛡️',
      hp: 1500,
      maxHp: 1500,
      attackPower: 95,
      defensePower: 99,
      entropyChaos: 2.10,
      speed: 90,
      color: 'from-cyan-500 to-blue-800',
      element: 'AI_SENTINEL' as const,
      signatureMove: {
        name: 'Kyber-1024 Deterministic Lockdown',
        description: 'Tettet alle porter og reflekterte 100% av angrepet',
        power: 350,
        entropyShift: -2.0,
        counterType: 'Gudemodus',
      },
      moves: [],
    } : {
      id: 'virus-custom-breacher',
      name: virusName,
      title: 'Avansert Muterende Inntrenger',
      category: 'ZERO_DAY' as const,
      avatar: '👾',
      hp: 1200,
      maxHp: 1200,
      attackPower: virusAttack,
      defensePower: 60,
      entropyChaos: virusEntropy,
      speed: virusSpeed,
      color: 'from-rose-600 to-purple-900',
      element: 'ZERO_DAY' as const,
      signatureMove: {
        name: 'Multi-Layer Polymorphic Breach',
        description: 'Overvant forsvarslag via mutert shellcode',
        power: 310,
        entropyShift: 1.5,
        counterType: 'Zero-Day',
      },
      moves: [],
    };

    const loserGladiator = defenseWon ? {
      id: 'virus-custom-breacher',
      name: virusName,
      title: 'Avansert Muterende Inntrenger',
      category: 'ZERO_DAY' as const,
      avatar: '👾',
      hp: 0,
      maxHp: 1200,
      attackPower: virusAttack,
      defensePower: 60,
      entropyChaos: virusEntropy,
      speed: virusSpeed,
      color: 'from-rose-600 to-purple-900',
      element: 'ZERO_DAY' as const,
      signatureMove: {
        name: 'Multi-Layer Polymorphic Breach',
        description: 'Overvant forsvarslag via mutert shellcode',
        power: 310,
        entropyShift: 1.5,
        counterType: 'Zero-Day',
      },
      moves: [],
    } : {
      id: 'ai-sentinel-god',
      name: 'WPWW Sentinel (Gudemodus)',
      title: 'Ugjennomtrengelig 4-Lags Kjerne',
      category: 'AI_DEFENDER' as const,
      avatar: '🛡️',
      hp: 0,
      maxHp: 1500,
      attackPower: 95,
      defensePower: 99,
      entropyChaos: 2.10,
      speed: 90,
      color: 'from-cyan-500 to-blue-800',
      element: 'AI_SENTINEL' as const,
      signatureMove: {
        name: 'Kyber-1024 Deterministic Lockdown',
        description: 'Tettet alle porter',
        power: 350,
        entropyShift: -2.0,
        counterType: 'Gudemodus',
      },
      moves: [],
    };

    const report: BattleReport = {
      id: `SIM-FILM-${Date.now()}`,
      timestamp: new Date().toISOString(),
      winner: winnerGladiator,
      loser: loserGladiator,
      rounds: currentLayerIdx + 1,
      totalDamageDealt: defenseWon ? 850 : 1350,
      peakEntropy: virusEntropy,
      criticalHits: defenseWon ? 4 : 2,
      decisiveExploit: statName,
      countermeasureLearned: defenseWon
        ? `Autonomt Forsvar: ${layers[currentLayerIdx].techName} stoppet all fremrykning tidlig og permanent.`
        : `Sårbarhet avdekket: ${virusName} utnyttet utilstrekkelig sanitering ved ${layers[currentLayerIdx].name}.`,
      yaraRuleGenerated: `rule PenetrationFilm_Rule_${Date.now()} {\n  meta:\n    threat = "${virusName}"\n    godmode = "${godModeActive ? 'ENFORCED' : 'CUSTOM'}"\n  strings:\n    $vuln = "${statName}"\n  condition:\n    $vuln\n}`,
      wormProofHash: Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    };

    const clashRecord: BattleClashRecord = {
      id: `CLASH-SIM-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fighter1: winnerGladiator,
      fighter2: loserGladiator,
      winner: winnerGladiator,
      loser: loserGladiator,
      decisiveStatName: statName,
      decisiveStatValue: statValue,
      decisiveFactor: defenseWon ? (godModeActive ? 'KYBER_SHIELD' : 'MIRROR_JAMMING') : 'ZERO_DAY_EXPLOIT',
      rounds: currentLayerIdx + 1,
      totalDamage: defenseWon ? 850 : 1350,
      peakEntropy: virusEntropy,
      criticalHits: defenseWon ? 4 : 2,
      vulnerabilitySeverityFound: flawSeverityFound,
      firewallPenetrationDepth: overallPenetrationDepth,
      detailedReport: report,
      summaryLogs: [],
    };

    onRecordClash(clashRecord);
  };

  // Movie Loop (Automatic playback)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && simulationStatus === 'SIMULATING') {
      timer = setTimeout(() => {
        executeSimulationTick();
      }, playSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, simulationStatus, currentLayerIdx, layers, playSpeed, godModeActive, virusAttack, firewallPower]);

  return (
    <div id="firewall-film-simulator" className="space-y-6">
      {/* Film Header Banner & Master Movie Controls */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wide">
                  Brannmur Inntrengnings-Simulator // Film & Kodeforslag
                </h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 font-bold">
                  INTERAKTIV + AUTO-PILOT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Se viruset jobbe seg gjennom brannmurens 4 forsvarslag. Velg live kodeforslag underveis eller la filmen gå automatisk for å se utfallet.
              </p>
            </div>
          </div>

          {/* God Mode Impervious Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/40">
            <Crown className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[10px] text-amber-400 font-bold uppercase">Full Gudemodus</div>
              <div className="text-[11px] text-slate-200 font-semibold">
                {godModeActive ? '🛡️ 100% Ugjennomtrengelig' : '⚙️ Egendefinert (Modifiserbar)'}
              </div>
            </div>
            <button
              onClick={() => setGodModeActive(!godModeActive)}
              className={`ml-2 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                godModeActive 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {godModeActive ? 'PÅ' : 'AV'}
            </button>
          </div>
        </div>

        {/* Video Player Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStartMovie}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-lg cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{simulationStatus === 'IDLE' ? 'Start Inntrengningsfilm' : 'Fortsett Film'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-lg cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Film</span>
              </button>
            )}

            <button
              onClick={executeSimulationTick}
              disabled={isPlaying || simulationStatus === 'DEFENSE_WON' || simulationStatus === 'BREACH_SUCCESS'}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Neste Lag (Steg-for-steg)</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nullstill</span>
            </button>
          </div>

          {/* Playback speed selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Film-Hastighet:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {[
                { label: '0.5x', ms: 2000 },
                { label: '1.0x', ms: 1000 },
                { label: '2.0x', ms: 500 },
                { label: 'MAX', ms: 200 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  onClick={() => setPlaySpeed(sp.ms)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    playSpeed === sp.ms ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE IN-BATTLE MODIFICATION / HOT-MODDING PANEL (Side 1 vs Side 2) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase">
              Sanntids Modifisering under Kamp // Hot-Modding (Side 1 vs Side 2)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Endre parametere direkte underveis for å teste om feil i systemet kan utnyttes eller tettes!
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          {/* SIDE 1: BRANNMUR FORSVAR (BLÅ SEKTOR) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Side 1: Brannmur Forsvar (Kjerne)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                Styrke: {firewallPower}/100
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Mirror Jamming Refleksjon:</span>
                  <span className="font-bold text-cyan-300">{mirrorJammingLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={mirrorJammingLevel}
                  onChange={(e) => setMirrorJammingLevel(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Shannon Entropi-Filter Terskel:</span>
                  <span className="font-bold text-purple-300">{entropyCutoff.toFixed(2)} bits/byte</span>
                </div>
                <input
                  type="range"
                  min="2.00"
                  max="7.50"
                  step="0.05"
                  value={entropyCutoff}
                  onChange={(e) => setEntropyCutoff(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-400">Total Forsvarskraft (Hot):</span>
                <input
                  type="number"
                  min="20"
                  max="150"
                  value={firewallPower}
                  onChange={(e) => setFirewallPower(parseInt(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-cyan-300 font-bold"
                />
              </div>
            </div>
          </div>

          {/* SIDE 2: VIRUS / SKADEVARE ANGREP (RØD SEKTOR) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-900/80 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-rose-400" />
                <span>Side 2: Virus / Angriper Profil</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                Angrep: {virusAttack}/100
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Angrepsstyrke (Payload Overflow):</span>
                  <span className="font-bold text-rose-400">{virusAttack}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={virusAttack}
                  onChange={(e) => setVirusAttack(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Polymorf Kaos-Entropi:</span>
                  <span className="font-bold text-purple-400">{virusEntropy.toFixed(2)} bits</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={virusEntropy}
                  onChange={(e) => setVirusEntropy(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-400">Virus Alias / Trussel:</span>
                <input
                  type="text"
                  value={virusName}
                  onChange={(e) => setVirusName(e.target.value)}
                  className="w-44 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-rose-200 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-LAYER PROGRESSIVE PENETRATION VISUALIZER */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase">
              Brannmurens 4 Forsvarslag // Sanntids Inntrengningsdybde
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Inntrengning:</span>
            <div className="w-32 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPenetrationDepth > 75 ? 'bg-rose-500' :
                  overallPenetrationDepth > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${overallPenetrationDepth}%` }}
              ></div>
            </div>
            <span className="font-bold text-slate-200">{overallPenetrationDepth}%</span>
          </div>
        </div>

        {/* 4 Layers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {layers.map((layer, idx) => {
            const isCurrent = currentLayerIdx === idx && isPlaying;
            const isBreached = layer.status === 'BREACHED';
            const isBlocked = layer.status === 'BLOCKED';

            return (
              <div
                key={layer.id}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 relative overflow-hidden ${
                  isBreached
                    ? 'bg-rose-950/40 border-rose-600 shadow-lg shadow-rose-950/80'
                    : isBlocked
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/80'
                    : isCurrent
                    ? 'bg-amber-950/30 border-amber-400 animate-pulse shadow-lg'
                    : 'bg-slate-900/70 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-[11px]">
                    Lag {layer.layerNumber}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                    isBreached ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    isBlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    isCurrent ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {layer.status}
                  </span>
                </div>

                <div className="font-bold text-slate-200 text-xs truncate">
                  {layer.name}
                </div>

                <div className="text-[10px] text-cyan-400 truncate">
                  {layer.techName}
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  {layer.description}
                </p>

                {/* Layer Health */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Lag Integritet:</span>
                    <span className="font-bold text-slate-200">{layer.layerHealth}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        layer.layerHealth > 50 ? 'bg-emerald-400' : layer.layerHealth > 0 ? 'bg-amber-400' : 'bg-rose-600'
                      }`}
                      style={{ width: `${layer.layerHealth}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE CODE SUGGESTIONS POPUP SECTION (Interaktivt valg eller auto) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase">
                Interaktive Kodeforslag under Inntrengning (Lag {currentLayerIdx + 1})
              </h3>
              <p className="text-[11px] text-slate-400">
                Klikk på et kodeforslag for å injisere det umiddelbart i kampen, eller la filmen gå selv for å observere utfallet.
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-1 rounded border border-purple-800 font-bold">
            {activeSuggestions.length} Forslag Tilgjengelig
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeSuggestions.map((sug) => {
            const isVirus = sug.side === 'VIRUS';

            return (
              <div
                key={sug.id}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                  isVirus 
                    ? 'bg-rose-950/20 border-rose-800 hover:border-rose-500' 
                    : 'bg-cyan-950/20 border-cyan-800 hover:border-cyan-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isVirus ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    }`}>
                      {isVirus ? '🔴 Virus Exploit' : '🔵 Brannmur Hot-Patch'}
                    </span>
                    <strong className="text-slate-100 text-xs">{sug.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">{sug.language}</span>
                </div>

                <p className="text-[11px] text-slate-300">
                  {sug.description}
                </p>

                {/* Code Snippet Box */}
                <pre className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] text-emerald-400 overflow-x-auto font-mono max-h-24">
                  {sug.code}
                </pre>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-amber-300">
                    Effekt: {isVirus ? `+${sug.impact.virusPower} Kraft` : `+${sug.impact.firewallDefense} Forsvar`}
                  </span>
                  <button
                    onClick={() => handleApplySuggestion(sug)}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                      isVirus
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    ⚡ Bruk Dette Kodeforslaget Nå
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIMULATOR EVENT LOGS */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl font-mono text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Inntrengnings-Logg (Sanntids Hendelser)
          </span>
          <span className="text-[10px] text-slate-500">{simLogs.length} meldinger</span>
        </div>

        <div className="h-40 overflow-y-auto space-y-1 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px]">
          {simLogs.map((log, idx) => (
            <div
              key={`log-${idx}`}
              className={`${
                log.includes('GUDEMODUS') ? 'text-amber-400 font-bold' :
                log.includes('STOPPET') ? 'text-emerald-400' :
                log.includes('SÅRBARHET') || log.includes('FULL') ? 'text-rose-400 font-semibold' :
                log.includes('INJEKSJON') ? 'text-purple-300' :
                'text-slate-300'
              }`}
            >
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
