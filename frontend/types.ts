export interface ForensicBlock {
  id: number;
  timestamp: string;
  attackerIp: string;
  threatType: string;
  counterMeasure: string;
  counterMeasureCode?: string;
  threatLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  entropy: number;
  payload: string;
  previousHash: string;
  currentHash: string;
  tampered?: boolean;
}

export interface BlacklistedIp {
  ip: string;
  reason: string;
  blockedAt: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  attemptsBlocked: number;
  country?: string;
}

export interface AttackVector {
  id: number;
  name: string;
  category: 'RECON' | 'SQLI' | 'RCE' | 'XSS' | 'ZERO_DAY' | 'DOS' | 'CUSTOM';
  description: string;
  payload: Record<string, unknown> | string;
  defaultCountermeasure: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ThreatFeedSource {
  id: string;
  name: string;
  provider: string;
  status: 'ONLINE' | 'SYNCED' | 'STANDBY' | 'CONNECTING';
  latencyMs: number;
  signaturesCount: number;
  lastUpdated: string;
}

export interface SecurityDefinitions {
  version: string;
  lastSynced: string;
  totalSignatures: number;
  activeYaraRules: number;
  cveDatabaseCount: number;
  entropyThreshold: number;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  newSignaturesAdded: number;
  feeds: ThreatFeedSource[];
}

export interface ThreatTimelinePoint {
  timeLabel: string; // e.g. "T-45m" or "02:45"
  minute: number; // 0 to 59
  totalThreatsBlocked: number;
  threatsPerMinute: number;
  honeypotTrapped: number;
  encryptedProgramDataKb: number;
  encryptedOutdataPackets: number;
  averageEntropy: number;
}

export interface SecurityLayerItem {
  id: string;
  name: string;
  category: 'PERIMETER' | 'PROGRAMDATA' | 'OUTDATA' | 'WORM_LEDGER';
  status: 'ACTIVE' | 'ENFORCING' | 'SECURED';
  cipher: string;
  description: string;
  metrics: string;
}

export interface EncryptionStatus {
  // ProgramData (At-Rest / In-Memory Heap & SQLite WAL)
  programData: {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
    keyFingerprint: string;
    keyRotationIntervalSec: number;
    lastRotated: string;
    memoryHeapScrambled: boolean;
    walCipherEnabled: boolean;
    encryptedBlocksCount: number;
    sampleCiphertext: string;
  };
  // OutData (In-Transit Egress / Telemetry / API Envelopes / Reports)
  outData: {
    enabled: boolean;
    protocol: 'TLS 1.3 + Post-Quantum Kyber-1024' | 'AES-256-GCM Egress Envelope';
    egressZeroKnowledge: boolean;
    signatureAlgorithm: 'Ed25519' | 'ECDSA-SHA256';
    keyFingerprint: string;
    encryptedPacketsCount: number;
    lastEgressEncryptedAt: string;
    sampleEgressEnvelope: string;
  };
  securityLayers: SecurityLayerItem[];
}

export interface SystemStats {
  status: 'ONLINE' | 'DEFENDING' | 'LOCKDOWN' | 'DEGRADED';
  activeListener: '127.0.0.1' | '0.0.0.0';
  port: number;
  simulatorEnabled: boolean;
  dbSizeBytes: number;
  walSizeBytes: number;
  totalThreatsBlocked: number;
  honeypotTrappedCount: number;
  entropyScansCount: number;
  lastBreachTimestamp: string | null;
  integrityVerified: boolean;
  watchdogUptimeSeconds: number;
  securityDefinitions: SecurityDefinitions;
  threatHistory60Min: ThreatTimelinePoint[];
  encryption: EncryptionStatus;
}

export interface ConsoleLogMessage {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'DANGER' | 'SUCCESS' | 'COUNTERMEASURE' | 'WORM';
  message: string;
  ip?: string;
  details?: string;
}

export interface RadarBlip {
  id: string;
  x: number;
  y: number;
  ip: string;
  threat: string;
  status: 'PROBING' | 'TRAPPED' | 'JAMMED' | 'LOOPED' | 'ISOLATED';
  timestamp: number;
  entropy: number;
}

export interface GeoThreatNode {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  lat: number;
  lng: number;
  x: number; // 0 - 100% on projection
  y: number; // 0 - 100% on projection
  ip: string;
  asn: string;
  activeThreat: string;
  countermeasure: string;
  status: 'PROBING' | 'JAMMED' | 'LOOPED' | 'ISOLATED';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attacksCount: number;
  payloadSample: string;
  entropy: number;
  isSensorNode?: boolean;
}

export type ExportFormat = 
  | 'json' 
  | 'csv' 
  | 'xml' 
  | 'markdown' 
  | 'html' 
  | 'stix' 
  | 'syslog' 
  | 'yara';

export interface GodModeConfig {
  // Angrep & Motoffensiv
  mirrorJammingEnabled: boolean;
  mirrorJammingIntensity: number; // 1-10
  phantomLoopEnabled: boolean;
  phantomLoopDelayMs: number; // 100 - 5000ms
  blackoutIsolationEnabled: boolean;
  autoBanThreshold: number; // 1 - 10
  activeCounterInfiltration: boolean; // "Hacking back" reflection
  wiperNeutralization: boolean; // Anti-wiper shield & reverse neutralize
  
  // Styrke & Ytelse
  bandwidthThrottleMbps: number; // 10 - 10000
  memoryHeapScramble: boolean;
  dpiWorkerCores: number; // 1 - 32
  quantumKyberEnvelope: boolean;
  
  // Kraft & Gjengjeldelse
  syntheticDecoyInjection: boolean;
  honeytokenDensity: number; // 1 - 500
  blackholeDropRate: number; // 0 - 100%
  retaliatoryTcpReset: boolean;
  
  // Kunnskap & Intelligens
  entropyThreshold: number; // 1.00 - 8.00
  zeroDayHeuristicSensitivity: 'LAV' | 'MIDDELS' | 'PARANOIA' | 'GUDEMODUS';
  activeYaraMatching: boolean;
  cveCorrelationAuto: boolean;
  
  // Sandboks & Isolasjonsnivå
  sandboxType: 'WASM_VIRTUAL' | 'CONTAINER_ISOLATED' | 'AIR_GAP_SIM' | 'MICRO_VM';
  airGapSimulation: boolean;
  zeroKnowledgeMemoryWipe: boolean;
  cpuCoreIsolation: boolean;
}

export interface CyberGladiator {
  id: string;
  name: string;
  title: string;
  category: 'VIRUS' | 'AI_DEFENDER' | 'RANSOMWARE' | 'ZERO_DAY' | 'WIPER' | 'CUSTOM';
  avatar: string;
  hp: number;
  maxHp: number;
  attackPower: number; // 1-100
  defensePower: number; // 1-100
  entropyChaos: number; // 1.00 - 8.00
  speed: number; // 1-100
  color: string;
  element: 'MALWARE' | 'AI_SENTINEL' | 'ZERO_DAY' | 'WIPER' | 'ENCRYPTION' | 'DECOY';
  signatureMove: {
    name: string;
    description: string;
    power: number;
    entropyShift: number;
    counterType: string;
  };
  moves: {
    id: string;
    name: string;
    description: string;
    power: number;
    type: 'ATTACK' | 'DEFENSE' | 'MUTATION' | 'OVERCLOCK' | 'ULTIMATE';
  }[];
}

export interface BattleLogEntry {
  id: string;
  round: number;
  actorName: string;
  actionName: string;
  message: string;
  damage: number;
  damageReflected?: number;
  critical?: boolean;
  entropyChange?: number;
  hpLeft1: number;
  hpLeft2: number;
  timestamp: string;
}

export interface BattleReport {
  id: string;
  timestamp: string;
  winner: CyberGladiator;
  loser: CyberGladiator;
  rounds: number;
  totalDamageDealt: number;
  peakEntropy: number;
  criticalHits: number;
  decisiveExploit: string;
  countermeasureLearned: string;
  yaraRuleGenerated: string;
  wormProofHash: string;
}

export interface BattleClashRecord {
  id: string;
  timestamp: string;
  fighter1: CyberGladiator;
  fighter2: CyberGladiator;
  winner: CyberGladiator;
  loser: CyberGladiator;
  decisiveStatName: string;
  decisiveStatValue: string;
  decisiveFactor: 'ENTROPY' | 'MIRROR_JAMMING' | 'HEAP_OVERFLOW' | 'KYBER_SHIELD' | 'CRITICAL_SPEED' | 'ZERO_DAY_EXPLOIT' | 'BLACKOUT_BAN';
  rounds: number;
  totalDamage: number;
  peakEntropy: number;
  criticalHits: number;
  vulnerabilitySeverityFound: number; // 0-100%
  firewallPenetrationDepth: number; // 0-100%
  detailedReport: BattleReport;
  summaryLogs: BattleLogEntry[];
}

export interface FirewallPenetrationLayer {
  id: string;
  layerNumber: number;
  name: string;
  techName: string;
  status: 'UNTOUCHED' | 'PROBING' | 'BREACHING' | 'BLOCKED' | 'BREACHED';
  layerHealth: number; // 0 to 100
  defenseType: string;
  description: string;
  activeFilterRule: string;
}

export interface CodeSuggestion {
  id: string;
  side: 'VIRUS' | 'FIREWALL';
  layerNumber: number;
  title: string;
  description: string;
  language: 'python' | 'bash' | 'c' | 'yara' | 'iptables';
  code: string;
  impact: {
    virusPower?: number;
    firewallDefense?: number;
    entropyDelta?: number;
    breachDelta?: number;
    flawSeverityDiscovered?: number;
  };
}


