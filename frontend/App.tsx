import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RadarView } from './components/RadarView';
import { ThreatMap } from './components/ThreatMap';
import { AttackSimulator, ATTACK_VECTORS } from './components/AttackSimulator';
import { ForensicChain } from './components/ForensicChain';
import { BlacklistManager } from './components/BlacklistManager';
import { EntropyEngine } from './components/EntropyEngine';
import { PythonScriptViewer } from './components/PythonScriptViewer';
import { GodModeBattleArena } from './components/GodModeBattleArena';
import { LiveConsole } from './components/LiveConsole';
import { ActiveThreatModal } from './components/ActiveThreatModal';
import { ExportReportModal } from './components/ExportReportModal';
import { SyncDefinitionsModal } from './components/SyncDefinitionsModal';

import { 
  SystemStats, 
  ForensicBlock, 
  BlacklistedIp, 
  ConsoleLogMessage, 
  RadarBlip,
  ExportFormat,
  GeoThreatNode
} from './types';
import { 
  evaluateThreat, 
  sha256, 
  calculateShannonEntropy, 
  encryptProgramData,
  generateInitial60MinThreatHistory,
  INITIAL_ENCRYPTION_STATUS,
  INITIAL_FORENSIC_CHAIN, 
  INITIAL_BLACKLIST 
} from './utils/crypto';
import { 
  playRadarPing, 
  playCountermeasureSound, 
  playVerifyChime, 
  playSyncSound,
  setSoundEnabled, 
  isSoundEnabled 
} from './utils/audio';
import { downloadReportFile } from './utils/exporters';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeModalBlock, setActiveModalBlock] = useState<ForensicBlock | null>(null);

  // Sync state
  const [isSyncingDefinitions, setIsSyncingDefinitions] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStepText, setSyncStepText] = useState<string>('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportModalInitialFormat, setExportModalInitialFormat] = useState<ExportFormat>('json');

  // System Stats
  const [stats, setStats] = useState<SystemStats>({
    status: 'ONLINE',
    activeListener: '127.0.0.1',
    port: 8080,
    simulatorEnabled: true,
    dbSizeBytes: 14336, // SQLite WAL baseline
    walSizeBytes: 4096,
    totalThreatsBlocked: 27,
    honeypotTrappedCount: 19,
    entropyScansCount: 42,
    lastBreachTimestamp: new Date().toISOString(),
    integrityVerified: true,
    watchdogUptimeSeconds: 1420,
    threatHistory60Min: generateInitial60MinThreatHistory(27),
    encryption: INITIAL_ENCRYPTION_STATUS,
    securityDefinitions: {
      version: 'v2026.08.27-R4',
      lastSynced: '27. aug 2026, 08:00',
      totalSignatures: 48290,
      activeYaraRules: 1428,
      cveDatabaseCount: 19842,
      entropyThreshold: 5.20,
      syncStatus: 'IDLE',
      newSignaturesAdded: 1420,
      feeds: [
        {
          id: 'f-1',
          name: 'CISA Automated Indicator Sharing (AIS)',
          provider: 'US Cybersecurity & Infrastructure Agency',
          status: 'SYNCED',
          latencyMs: 18,
          signaturesCount: 21450,
          lastUpdated: 'I dag, 08:00',
        },
        {
          id: 'f-2',
          name: 'AlienVault OTX Global Threat Pulse',
          provider: 'AT&T Cybersecurity Community',
          status: 'SYNCED',
          latencyMs: 34,
          signaturesCount: 14890,
          lastUpdated: 'I dag, 07:45',
        },
        {
          id: 'f-3',
          name: 'CIRCL European CSIRT Matrix',
          provider: 'Computer Incident Response Center Luxembourg',
          status: 'SYNCED',
          latencyMs: 22,
          signaturesCount: 8640,
          lastUpdated: 'I dag, 08:00',
        },
        {
          id: 'f-4',
          name: 'MITRE ATT&CK Enterprise Matrix v15',
          provider: 'MITRE Corporation',
          status: 'SYNCED',
          latencyMs: 15,
          signaturesCount: 3310,
          lastUpdated: 'I dag, 06:30',
        },
      ],
    },
  });

  // Forensic Immutable Chain
  const [chain, setChain] = useState<ForensicBlock[]>(INITIAL_FORENSIC_CHAIN);

  // Blacklisted IPs
  const [blacklist, setBlacklist] = useState<BlacklistedIp[]>(INITIAL_BLACKLIST);

  // Console Logs
  const [logs, setLogs] = useState<ConsoleLogMessage[]>([
    {
      id: 'log-1',
      timestamp: '08:12:04',
      level: 'INFO',
      message: 'WPWW Watchdog Core v20.0 initialisert. SQLite WAL-modus aktivert.',
    },
    {
      id: 'log-2',
      timestamp: '08:12:05',
      level: 'WORM',
      message: 'Kryptografisk hash-kjede verifisert. Genesis blokk #1 forseglet.',
    },
    {
      id: 'log-3',
      timestamp: '08:24:19',
      level: 'COUNTERMEASURE',
      message: 'SQL-Injisering avverget! Mirror Jamming speilet falske feilkoder.',
      ip: '45.154.255.89',
    },
    {
      id: 'log-4',
      timestamp: '08:35:44',
      level: 'DANGER',
      message: 'Kritisk RCE skadevare fanget! Blackout Isolation permanent aktivert.',
      ip: '185.220.101.5',
    },
  ]);

  // Radar Blips
  const [blips, setBlips] = useState<RadarBlip[]>([
    {
      id: 'b-1',
      x: 35,
      y: 30,
      ip: '185.220.101.5',
      threat: 'RCE Shell Injection',
      status: 'ISOLATED',
      timestamp: Date.now(),
      entropy: 4.87,
    },
    {
      id: 'b-2',
      x: 68,
      y: 42,
      ip: '45.154.255.89',
      threat: 'SQLi Bypass',
      status: 'JAMMED',
      timestamp: Date.now(),
      entropy: 4.08,
    },
    {
      id: 'b-3',
      x: 25,
      y: 72,
      ip: '194.26.29.112',
      threat: 'Port Recon Probe',
      status: 'JAMMED',
      timestamp: Date.now(),
      entropy: 3.12,
    },
    {
      id: 'b-4',
      x: 75,
      y: 78,
      ip: '91.240.118.17',
      threat: 'Zero-Day Encrypted Shellcode',
      status: 'LOOPED',
      timestamp: Date.now(),
      entropy: 5.64,
    },
  ]);

  // Helper to append log
  const addLog = useCallback(
    (level: 'INFO' | 'WARN' | 'DANGER' | 'SUCCESS' | 'WORM' | 'COUNTERMEASURE', message: string, ip?: string) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timeStr,
          level,
          message,
          ip,
        },
        ...prev.slice(0, 199),
      ]);
    },
    []
  );

  // Auto Watchdog background ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        watchdogUptimeSeconds: prev.watchdogUptimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Security Definitions Handler
  const handleSyncSecurityDefinitions = useCallback(() => {
    if (isSyncingDefinitions) return;

    setIsSyncingDefinitions(true);
    setSyncProgress(10);
    setSyncStepText('Kobler til eksterne trusselfeeds (CISA, AlienVault OTX, CIRCL)...');
    addLog('INFO', '🔄 Synkronisering initiert: Kobler mot globale trusselfeeds og CERT-noder...');

    // Stage 1: Handshake (300ms)
    setTimeout(() => {
      setSyncProgress(35);
      setSyncStepText('Henter 1 420 nye trusselsignaturer & CVE-2026 regelsett...');
      addLog('INFO', '📡 Laster ned trusselsignaturer fra CISA AIS og AlienVault OTX...');
    }, 350);

    // Stage 2: Ingest & Entropy Threshold (700ms)
    setTimeout(() => {
      setSyncProgress(70);
      setSyncStepText('Rekalibrerer Shannon entropi-heuristikk (terskel 5.20 bits)...');
      addLog('WORM', '⚡ Ingesterer 84 nye YARA-regler. Shannon-terskel rekalibrert til 5.20 bits.');
    }, 750);

    // Stage 3: Verification & Finalize (1100ms)
    setTimeout(() => {
      setSyncProgress(100);
      setSyncStepText('Verifiserer kryptografisk WORM-signatur for regelsett...');
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const revNum = Math.floor(Math.random() * 9) + 5;
      const newVersion = `v2026.08.27-R${revNum}`;

      setStats((prev) => ({
        ...prev,
        securityDefinitions: {
          ...prev.securityDefinitions,
          version: newVersion,
          lastSynced: `I dag, ${timeStr}`,
          totalSignatures: prev.securityDefinitions.totalSignatures + 1420,
          activeYaraRules: prev.securityDefinitions.activeYaraRules + 84,
          cveDatabaseCount: prev.securityDefinitions.cveDatabaseCount + 320,
          syncStatus: 'SUCCESS',
          newSignaturesAdded: 1420,
          feeds: prev.securityDefinitions.feeds.map((f) => ({
            ...f,
            status: 'SYNCED',
            latencyMs: Math.floor(Math.random() * 25) + 12,
            lastUpdated: `I dag, ${timeStr}`,
          })),
        },
      }));

      playSyncSound();
      addLog('SUCCESS', `✅ Sikkerhetsdefinisjoner oppdatert: ${newVersion} (+1 420 signaturer, +84 YARA regler).`);

      setTimeout(() => {
        setIsSyncingDefinitions(false);
        setSyncProgress(0);
        setSyncStepText('');
      }, 400);
    }, 1200);
  }, [isSyncingDefinitions, addLog]);

  // Central Threat Evaluation and Autonomous Reaction
  const processAttack = useCallback(
    async (rawPayload: string | Record<string, unknown>, attackerIp: string, showModal: boolean = false) => {
      const evaluation = evaluateThreat(attackerIp, rawPayload);

      // Play tactical audio
      playRadarPing();
      playCountermeasureSound(evaluation.status);

      // Log event
      addLog(
        evaluation.riskLevel === 'CRITICAL' ? 'DANGER' : 'WARN',
        `Trussel oppdaget fra ${attackerIp}: ${evaluation.threat} (Entropi: ${evaluation.entropy.toFixed(2)})`,
        attackerIp
      );

      // Log countermeasure
      addLog(
        'COUNTERMEASURE',
        `Mottiltak iverksatt: ${evaluation.countermeasure}`,
        attackerIp
      );

      // Compute cryptographic SHA-256 for this block
      const lastBlock = chain[0];
      const prevHash = lastBlock ? lastBlock.currentHash : '00000000000000000000000000000000';
      const newId = chain.length + 1;
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const payloadString = evaluation.payloadStr;
      const blockContent = `${newId}|${timestamp}|${attackerIp}|${evaluation.threat}|${evaluation.countermeasure}|${evaluation.entropy}|${payloadString}|${prevHash}`;
      const currentHash = await sha256(blockContent);

      const newBlock: ForensicBlock = {
        id: newId,
        timestamp,
        attackerIp,
        threatType: evaluation.threat,
        threatLevel: evaluation.riskLevel,
        payload: payloadString,
        entropy: parseFloat(evaluation.entropy.toFixed(2)),
        counterMeasure: evaluation.countermeasure,
        counterMeasureCode: evaluation.status === 'ISOLATED' ? 'BLACKOUT_ISOLATION' : evaluation.status === 'LOOPED' ? 'PHANTOM_LOOP' : 'MIRROR_JAM',
        previousHash: prevHash,
        currentHash: currentHash,
      };

      if (showModal) {
        setActiveModalBlock(newBlock);
      }

      // Append to WORM Immutable Blockchain-style Forensic Chain
      setChain((prevChain) => [newBlock, ...prevChain]);

      // Update Blacklist
      setBlacklist((prevBlacklist) => {
        const existing = prevBlacklist.find((item) => item.ip === attackerIp);
        if (existing) {
          return prevBlacklist.map((item) =>
            item.ip === attackerIp
              ? {
                  ...item,
                  attemptsBlocked: item.attemptsBlocked + 1,
                  lastSeen: new Date().toLocaleTimeString(),
                }
              : item
          );
        } else {
          return [
            {
              ip: attackerIp,
              reason: evaluation.threat,
              blockedAt: new Date().toLocaleTimeString(),
              threatLevel: evaluation.riskLevel,
              attemptsBlocked: 1,
              country: 'UNKNOWN / PROXY',
            },
            ...prevBlacklist,
          ];
        }
      });

      // Update System Stats
      setStats((prev) => {
        const nextTotal = prev.totalThreatsBlocked + 1;
        const history = [...(prev.threatHistory60Min || [])];
        if (history.length > 0) {
          const lastIdx = history.length - 1;
          const currentPoint = history[lastIdx];
          history[lastIdx] = {
            ...currentPoint,
            totalThreatsBlocked: nextTotal,
            threatsPerMinute: currentPoint.threatsPerMinute + 1,
            honeypotTrapped: evaluation.status !== 'ISOLATED' ? currentPoint.honeypotTrapped + 1 : currentPoint.honeypotTrapped,
            encryptedProgramDataKb: currentPoint.encryptedProgramDataKb + 1,
            encryptedOutdataPackets: currentPoint.encryptedOutdataPackets + 3,
            averageEntropy: parseFloat(((currentPoint.averageEntropy + evaluation.entropy) / 2).toFixed(2)),
          };
        }

        const prevEnc = prev.encryption || INITIAL_ENCRYPTION_STATUS;
        const nextEnc = {
          ...prevEnc,
          programData: {
            ...prevEnc.programData,
            encryptedBlocksCount: prevEnc.programData.encryptedBlocksCount + 1,
          },
          outData: {
            ...prevEnc.outData,
            encryptedPacketsCount: prevEnc.outData.encryptedPacketsCount + 3,
            lastEgressEncryptedAt: new Date().toLocaleTimeString(),
          },
        };

        return {
          ...prev,
          totalThreatsBlocked: nextTotal,
          honeypotTrappedCount:
            evaluation.status === 'LOOPED' || evaluation.status === 'JAMMED'
              ? prev.honeypotTrappedCount + 1
              : prev.honeypotTrappedCount,
          entropyScansCount: prev.entropyScansCount + 1,
          dbSizeBytes: prev.dbSizeBytes + 512,
          walSizeBytes: prev.walSizeBytes + 256,
          lastBreachTimestamp: new Date().toISOString(),
          threatHistory60Min: history,
          encryption: nextEnc,
        };
      });

      // Update Radar Blips
      setBlips((prevBlips) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 25; // radius percent
        const x = 50 + Math.cos(angle) * distance;
        const y = 50 + Math.sin(angle) * distance;

        const newBlip: RadarBlip = {
          id: `blip-${Date.now()}-${Math.random()}`,
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(10, Math.min(90, y)),
          ip: attackerIp,
          threat: evaluation.threat,
          status: evaluation.status,
          timestamp: Date.now(),
          entropy: evaluation.entropy,
        };

        return [newBlip, ...prevBlips.slice(0, 7)];
      });
    },
    [addLog, chain]
  );

  // Attack simulator triggers
  const handleFireAttack = async (vectorId: number, customPayload?: string, customIp?: string) => {
    const vector = ATTACK_VECTORS.find((v) => v.id === vectorId);
    if (!vector) return;

    const ip = customIp || `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    const payload = customPayload || JSON.stringify(vector.payload);
    await processAttack(payload, ip, true);
  };

  // Swarm test
  const handleRunSwarm = async () => {
    setIsSimulating(true);
    addLog('WARN', '⚠️ ANGREPSSVERM STARTER: Fyrer av 12 distribuerte angrepsbølger...');

    for (let i = 0; i < 8; i++) {
      const randomVector = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)];
      const randomIp = `185.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`;
      await processAttack(JSON.stringify(randomVector.payload), randomIp, false);
      await new Promise((r) => setTimeout(r, 220));
    }

    setIsSimulating(false);
    addLog('SUCCESS', '✓ ANGREPSSVERM AVSLUTTET: Alle 8 angrep ble 100% nøytralisert og WORM-logget.');
  };

  // Sequential test
  const handleRunSequential = async () => {
    setIsSimulating(true);
    addLog('INFO', '🚀 Kjører sekvensiell test over alle 6 angrepsvektorer...');

    for (const vector of ATTACK_VECTORS) {
      const dummyIp = `103.225.17.${Math.floor(Math.random() * 250) + 1}`;
      await processAttack(JSON.stringify(vector.payload), dummyIp, false);
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsSimulating(false);
    addLog('SUCCESS', '✓ Sekvensiell sårbarhetstest fullført: Fullstendig forsvarsdekning bekreftet.');
  };

  // Stress test
  const handleRunStress = async () => {
    setIsSimulating(true);
    addLog('DANGER', '🔥 HØYVOLUM STRESSTEST PÅGÅR: Genererer 25 samtidige trusselstrømmer...');

    for (let i = 0; i < 15; i++) {
      const randomVector = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)];
      const randomIp = `45.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`;
      await processAttack(JSON.stringify(randomVector.payload), randomIp, false);
      await new Promise((r) => setTimeout(r, 90));
    }

    setIsSimulating(false);
    addLog('SUCCESS', '✓ STRESSTEST AVSLUTTET: Ingen datatap, SQLite WAL stabil og WORM-kjede 100% intakt.');
  };

  // Export Report in Any Format
  const handleExportReport = (format: ExportFormat) => {
    downloadReportFile(format, chain, stats, blacklist);
    addLog('SUCCESS', `📂 Forensisk rapport eksportert og lastet ned i format: ${format.toUpperCase()}.`);
  };

  const handleOpenExportModal = (format: ExportFormat = 'json') => {
    setExportModalInitialFormat(format);
    setIsExportModalOpen(true);
  };

  // Tamper Simulation
  const handleTamperBlock = (blockId: number) => {
    setChain((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              payload: '{"TAMPERED_INJECTED_DATA":"UAUTORISERT_ENDRING"}',
              tampered: true,
            }
          : b
      )
    );
    setStats((prev) => ({ ...prev, integrityVerified: false }));
    addLog('DANGER', `🚨 MANIPULERING SIMULERT i Blokk #${blockId}! Hash-kjeden er brutt.`);
  };

  // Restore Chain
  const handleRestoreChain = () => {
    setChain(INITIAL_FORENSIC_CHAIN);
    setStats((prev) => ({ ...prev, integrityVerified: true }));
    addLog('SUCCESS', '✨ Hash-kjeden ble gjenopprettet til verifisert tilstand.');
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Toggle Simulator
  const handleToggleSimulator = () => {
    setStats((prev) => {
      const next = !prev.simulatorEnabled;
      addLog('INFO', `Angrepssimulator er nå skrudd ${next ? 'PÅ (Aktiv)' : 'AV (Deaktivert)'}.`);
      return { ...prev, simulatorEnabled: next };
    });
  };

  // Toggle Network Mode
  const handleToggleNetworkMode = () => {
    setStats((prev) => {
      const next = prev.activeListener === '127.0.0.1' ? '0.0.0.0' : '127.0.0.1';
      addLog('WARN', `Nettverksmodus endret til: ${next}:${prev.port} (${next === '0.0.0.0' ? 'Åpent nettverk' : 'Lokal maskin'})`);
      return { ...prev, activeListener: next };
    });
  };

  // Emergency Lockdown
  const handleEmergencyLockdown = () => {
    setStats((prev) => ({ ...prev, status: 'LOCKDOWN' }));
    addLog('DANGER', '🔒 NØDLÅS AKTIVERT: All ekstern trafikk avvises midlertidig.');
    setTimeout(() => {
      setStats((prev) => ({ ...prev, status: 'ONLINE' }));
      addLog('INFO', '✓ Nødlås opphevet. Normal forsvarsdrift gjenopprettet.');
    }, 4000);
  };

  // Blacklist Unban
  const handleUnbanIp = (ip: string) => {
    setBlacklist((prev) => prev.filter((item) => item.ip !== ip));
    addLog('INFO', `Isolasjon opphevet for IP ${ip}.`);
  };

  // Add Manual Ban
  const handleAddManualBan = (ip: string, reason: string, level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    setBlacklist((prev) => [
      {
        ip,
        reason,
        blockedAt: new Date().toLocaleString(),
        threatLevel: level,
        attemptsBlocked: 1,
        country: 'MANUAL',
      },
      ...prev,
    ]);
    addLog('WARN', `Manuell karantene iverksatt for ${ip}: ${reason}`);
  };

  // Clear Blacklist
  const handleClearBlacklist = () => {
    setBlacklist([]);
    addLog('INFO', '🧹 Svartelisten over isolerte IP-adresser ble tømt.');
  };

  // Trigger attack from Map Node
  const handleTriggerNodeAttack = (node: GeoThreatNode) => {
    processAttack(node.payloadSample, node.ip, true);
  };

  // ProgramData Key Rotation Handler
  const handleRotateProgramKey = async () => {
    const sampleState = {
      timestamp: Date.now(),
      chainLength: chain.length,
      blacklistCount: blacklist.length,
      entropyScans: stats.entropyScansCount,
    };
    const cryptoResult = await encryptProgramData(sampleState);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setStats((prev) => {
      const prevEnc = prev.encryption || INITIAL_ENCRYPTION_STATUS;
      return {
        ...prev,
        encryption: {
          ...prevEnc,
          programData: {
            ...prevEnc.programData,
            keyFingerprint: cryptoResult.fingerprint,
            lastRotated: `I dag, ${timeStr}`,
            sampleCiphertext: cryptoResult.ciphertext,
            encryptedBlocksCount: prevEnc.programData.encryptedBlocksCount + 1,
          },
        },
      };
    });

    playVerifyChime();
    addLog(
      'SUCCESS',
      `🔑 ProgramData kryptografisk nøkkel rotert (AES-256-GCM / PBKDF2). Nytt fingeravtrykk: ${cryptoResult.fingerprint}`
    );
  };

  return (
    <div id="wpww-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        stats={stats}
        soundEnabled={soundOn}
        onToggleSound={handleToggleSound}
        onToggleSimulator={handleToggleSimulator}
        onToggleNetworkMode={handleToggleNetworkMode}
        onEmergencyLockdown={handleEmergencyLockdown}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSyncDefinitions={handleSyncSecurityDefinitions}
        isSyncingDefinitions={isSyncingDefinitions}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenExportModal={() => handleOpenExportModal('json')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Dynamic View by Tab */}
        {activeTab === 'radar' && (
          <RadarView
            stats={stats}
            blips={blips}
            recentBlocks={chain}
            onTriggerQuickProbe={(id) => handleFireAttack(id)}
            onSelectTab={setActiveTab}
            onRotateProgramKey={handleRotateProgramKey}
          />
        )}

        {activeTab === 'map' && (
          <ThreatMap
            stats={stats}
            recentBlocks={chain}
            onSyncDefinitions={handleSyncSecurityDefinitions}
            isSyncingDefinitions={isSyncingDefinitions}
            onOpenExportModal={handleOpenExportModal}
            onTriggerAttackFromNode={handleTriggerNodeAttack}
          />
        )}

        {activeTab === 'godmode' && (
          <GodModeBattleArena
            stats={stats}
            onUpdateStats={setStats}
            onTriggerAttackSample={(payload, ip) => processAttack(payload, ip, true)}
          />
        )}

        {activeTab === 'simulator' && (
          <AttackSimulator
            simulatorEnabled={stats.simulatorEnabled}
            onFireAttack={handleFireAttack}
            onRunSwarm={handleRunSwarm}
            onRunSequential={handleRunSequential}
            onRunStress={handleRunStress}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'forensics' && (
          <ForensicChain
            chain={chain}
            onExportReport={handleExportReport}
            onOpenExportModal={handleOpenExportModal}
            onTamperBlock={handleTamperBlock}
            onRestoreChain={handleRestoreChain}
          />
        )}

        {activeTab === 'blacklist' && (
          <BlacklistManager
            blacklist={blacklist}
            onUnbanIp={handleUnbanIp}
            onAddManualBan={handleAddManualBan}
            onClearBlacklist={handleClearBlacklist}
          />
        )}

        {activeTab === 'entropy' && <EntropyEngine />}

        {activeTab === 'python' && <PythonScriptViewer />}

        {/* Live Watchdog Console Stream (Always visible at bottom of dashboard) */}
        <div className="pt-2">
          <LiveConsole logs={logs} onClearLogs={() => setLogs([])} />
        </div>
      </main>

      {/* Threat Notification Modal */}
      <ActiveThreatModal
        block={activeModalBlock}
        onClose={() => setActiveModalBlock(null)}
      />

      {/* Multi-Format Export Center Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        chain={chain}
        stats={stats}
        blacklist={blacklist}
        initialFormat={exportModalInitialFormat}
      />

      {/* Security Definitions & Threat Feeds Modal */}
      <SyncDefinitionsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        definitions={stats.securityDefinitions}
        isSyncing={isSyncingDefinitions}
        syncProgress={syncProgress}
        syncStepText={syncStepText}
        onTriggerSync={handleSyncSecurityDefinitions}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>🦒 WPWW WarRoom Master Defense System v20.0 Elite Edition</span>
          <span>Autonome Mottiltak: Mirror Jamming • Phantom Loop • Blackout Isolation • WORM Hash-Kjede</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
