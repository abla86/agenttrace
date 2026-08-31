import { ForensicBlock, BlacklistedIp, SystemStats } from '../types';

/**
 * Multi-Format Forensic Exporter Utility for WPWW WarRoom
 */

export function generateJsonReport(
  chain: ForensicBlock[],
  stats: SystemStats,
  blacklist: BlacklistedIp[]
): string {
  const report = {
    report_metadata: {
      generator: 'WPWW WarRoom // Autonomous Defense Engine v20.0 Elite Edition',
      timestamp: new Date().toISOString(),
      crypto_ledger_standard: 'WORM (Write Once, Read Many) SHA-256 Chaining',
      integrity_status: stats.integrityVerified ? 'VERIFIED_100_PERCENT' : 'INTEGRITY_COMPROMISED',
      listener_endpoint: `${stats.activeListener}:${stats.port}`,
      security_definitions_version: stats.securityDefinitions.version,
      active_signatures_count: stats.securityDefinitions.totalSignatures,
      shannon_entropy_zero_day_threshold: stats.securityDefinitions.entropyThreshold,
      summary_metrics: {
        total_blocks: chain.length,
        total_threats_blocked: stats.totalThreatsBlocked,
        honeypot_trapped_count: stats.honeypotTrappedCount,
        entropy_scans_count: stats.entropyScansCount,
        isolated_ips_count: blacklist.length,
        db_size_bytes: stats.dbSizeBytes,
      },
    },
    threat_intelligence_feeds: stats.securityDefinitions.feeds,
    forensic_chain_blocks: chain.map((b) => ({
      block_index: b.id,
      timestamp_utc: b.timestamp,
      attacker_ipv4: b.attackerIp,
      threat_classification: b.threatType,
      countermeasure_applied: b.counterMeasure,
      shannon_entropy_bits: b.entropy,
      payload_trace: b.payload,
      previous_block_hash: b.previousHash,
      sealed_sha256_hash: b.currentHash,
      tamper_flag: !!b.tampered,
    })),
    quarantine_blacklist: blacklist,
  };

  return JSON.stringify(report, null, 2);
}

export function generateCsvReport(chain: ForensicBlock[]): string {
  const headers = [
    'Block_ID',
    'Timestamp_UTC',
    'Attacker_IP',
    'Threat_Type',
    'Countermeasure',
    'Shannon_Entropy',
    'Payload_Trace',
    'Previous_SHA256',
    'Current_SHA256',
    'Tampered_State',
  ];

  const escapeCsv = (str: string | number | boolean) => {
    const val = String(str ?? '');
    return `"${val.replace(/"/g, '""')}"`;
  };

  const rows = chain.map((b) => [
    b.id,
    b.timestamp,
    b.attackerIp,
    b.threatType,
    b.counterMeasure,
    b.entropy,
    b.payload,
    b.previousHash,
    b.currentHash,
    b.tampered ? 'TAMPERED' : 'INTACT',
  ]);

  return [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
}

export function generateXmlReport(
  chain: ForensicBlock[],
  stats: SystemStats,
  blacklist: BlacklistedIp[]
): string {
  const escapeXml = (unsafe: string | number) =>
    String(unsafe ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<WPWWForensicDossier version="20.0" generated="${escapeXml(new Date().toISOString())}">\n`;
  xml += `  <SystemAudit>\n`;
  xml += `    <IntegrityStatus>${escapeXml(stats.integrityVerified ? 'VERIFIED' : 'FAILED')}</IntegrityStatus>\n`;
  xml += `    <ActiveListener>${escapeXml(stats.activeListener)}:${escapeXml(stats.port)}</ActiveListener>\n`;
  xml += `    <SecurityDefinitionsVersion>${escapeXml(stats.securityDefinitions.version)}</SecurityDefinitionsVersion>\n`;
  xml += `    <ActiveSignatures>${escapeXml(stats.securityDefinitions.totalSignatures)}</ActiveSignatures>\n`;
  xml += `    <TotalThreatsBlocked>${escapeXml(stats.totalThreatsBlocked)}</TotalThreatsBlocked>\n`;
  xml += `    <HoneypotTraps>${escapeXml(stats.honeypotTrappedCount)}</HoneypotTraps>\n`;
  xml += `    <EntropyThreshold>${escapeXml(stats.securityDefinitions.entropyThreshold)}</EntropyThreshold>\n`;
  xml += `  </SystemAudit>\n`;

  xml += `  <ThreatIntelligenceFeeds>\n`;
  stats.securityDefinitions.feeds.forEach((feed) => {
    xml += `    <Feed id="${escapeXml(feed.id)}" status="${escapeXml(feed.status)}" signatures="${escapeXml(feed.signaturesCount)}">\n`;
    xml += `      <Name>${escapeXml(feed.name)}</Name>\n`;
    xml += `      <Provider>${escapeXml(feed.provider)}</Provider>\n`;
    xml += `      <LastUpdated>${escapeXml(feed.lastUpdated)}</LastUpdated>\n`;
    xml += `    </Feed>\n`;
  });
  xml += `  </ThreatIntelligenceFeeds>\n`;

  xml += `  <ForensicLedger totalBlocks="${chain.length}">\n`;
  chain.forEach((b) => {
    xml += `    <Block id="${escapeXml(b.id)}" tampered="${escapeXml(b.tampered ? 'true' : 'false')}">\n`;
    xml += `      <Timestamp>${escapeXml(b.timestamp)}</Timestamp>\n`;
    xml += `      <AttackerIP>${escapeXml(b.attackerIp)}</AttackerIP>\n`;
    xml += `      <ThreatType>${escapeXml(b.threatType)}</ThreatType>\n`;
    xml += `      <Countermeasure>${escapeXml(b.counterMeasure)}</Countermeasure>\n`;
    xml += `      <ShannonEntropy>${escapeXml(b.entropy)}</ShannonEntropy>\n`;
    xml += `      <Payload><![CDATA[${b.payload}]]></Payload>\n`;
    xml += `      <PreviousHash>${escapeXml(b.previousHash)}</PreviousHash>\n`;
    xml += `      <CurrentHash>${escapeXml(b.currentHash)}</CurrentHash>\n`;
    xml += `    </Block>\n`;
  });
  xml += `  </ForensicLedger>\n`;

  xml += `  <QuarantineBlacklist count="${blacklist.length}">\n`;
  blacklist.forEach((ip) => {
    xml += `    <Host ip="${escapeXml(ip.ip)}" threatLevel="${escapeXml(ip.threatLevel)}">\n`;
    xml += `      <Reason>${escapeXml(ip.reason)}</Reason>\n`;
    xml += `      <BlockedAt>${escapeXml(ip.blockedAt)}</BlockedAt>\n`;
    xml += `      <AttemptsBlocked>${escapeXml(ip.attemptsBlocked)}</AttemptsBlocked>\n`;
    xml += `    </Host>\n`;
  });
  xml += `  </QuarantineBlacklist>\n`;
  xml += `</WPWWForensicDossier>`;

  return xml;
}

export function generateMarkdownReport(
  chain: ForensicBlock[],
  stats: SystemStats,
  blacklist: BlacklistedIp[]
): string {
  const ts = new Date().toUTCString();
  const rows = chain
    .map(
      (b) =>
        `| **#${b.id}** | \`${b.attackerIp}\` | ${b.threatType} | \`${b.counterMeasure.split(' ')[0]}\` | **${b.entropy.toFixed(2)}** | \`${b.currentHash.substring(0, 16)}...\` |`
    )
    .join('\n');

  const blacklistedRows = blacklist
    .map((ip) => `| \`${ip.ip}\` | **${ip.threatLevel}** | ${ip.reason} | ${ip.attemptsBlocked} | ${ip.blockedAt} |`)
    .join('\n');

  return `# 🛡️ WPWW WarRoom // Offisiell Forensisk Hendelsesrapport
**Sikkerhetsnivå:** TOP SECRET // FORENSIC AUDIT RECORD  
**Generert:** ${ts}  
**Forsvarskjerne:** WPWW v20.0 Elite Edition  
**Kryptografisk Integritet:** ${stats.integrityVerified ? '✅ VERIFISERT (100% WORM Intakt)' : '🚨 MANIPULERING OPPDAGET'}  
**Lytter-adresse:** \`${stats.activeListener}:${stats.port}\`  
**Definisjoner / Signaturer:** \`${stats.securityDefinitions.version}\` (${stats.securityDefinitions.totalSignatures.toLocaleString()} aktive signaturer)

---

## 1. Ledelsessammendrag & Trusselmetrikk

- **Totalt antall nøytraliseringer:** \`${stats.totalThreatsBlocked}\`
- **Fanget i Honeypot Sandboks:** \`${stats.honeypotTrappedCount}\`
- **Shannon Entropi-analyser:** \`${stats.entropyScansCount}\` (Zero-Day Terskel: \`>${stats.securityDefinitions.entropyThreshold.toFixed(2)}\`)
- **Isolerte IP-adresser i brannmur:** \`${blacklist.length}\`
- **Database / WAL-avtrykk:** \`${(stats.dbSizeBytes / 1024).toFixed(1)} KB\`

---

## 2. Kryptografisk WORM Hash-Kjede (Bevislogg)

Hver oppføring er kryptografisk lenket med SHA-256. Følgende tabell oppsummerer de verifiserte hendelsene:

| Blokk | Angriper IP | Trusselklassifisering | Iverksatt Mottiltak | Entropi (bits) | SHA-256 Forsegling |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---

## 3. Aktive Trusselfeeds & Sikkerhetsdefinisjoner

| Feed Navn | Leverandør | Status | Signaturer | Siste Oppdatering |
| :--- | :--- | :--- | :--- | :--- |
${stats.securityDefinitions.feeds.map((f) => `| ${f.name} | ${f.provider} | \`${f.status}\` | ${f.signaturesCount.toLocaleString()} | ${f.lastUpdated} |`).join('\n')}

---

## 4. Karanteneliste & Isolerte Angripere

| IP Adresse | Risiko | Årsak | Avvergede Forsøk | Isolert Tidspunkt |
| :--- | :--- | :--- | :--- | :--- |
${blacklistedRows}

---

*Rapporten er automatisk kompilert og digitalt forseglet av WPWW WarRoom Watchdog Engine.*
`;
}

export function generateHtmlReport(
  chain: ForensicBlock[],
  stats: SystemStats,
  blacklist: BlacklistedIp[]
): string {
  const ts = new Date().toUTCString();

  return `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <title>WPWW WarRoom // Forensisk Sikkerhetsrapport</title>
  <style>
    :root {
      --bg: #020617;
      --card: #0f172a;
      --border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --cyan: #06b6d4;
      --emerald: #10b981;
      --rose: #f43f5e;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 32px;
      line-height: 1.5;
    }
    .container { max-width: 1080px; margin: 0 auto; }
    .header {
      border-bottom: 2px solid var(--cyan);
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-success { background: rgba(16, 185, 129, 0.2); border: 1px solid var(--emerald); color: var(--emerald); }
    .badge-danger { background: rgba(244, 63, 94, 0.2); border: 1px solid var(--rose); color: var(--rose); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
    .card-title { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-family: monospace; letter-spacing: 0.05em; }
    .card-value { font-size: 24px; font-weight: bold; font-family: monospace; margin-top: 4px; color: var(--cyan); }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; font-family: monospace; }
    th { text-align: left; background: #1e293b; padding: 10px; border: 1px solid var(--border); color: #e2e8f0; }
    td { padding: 10px; border: 1px solid var(--border); vertical-align: middle; }
    tr:nth-child(even) { background: #090e1a; }
    .hash { font-family: monospace; font-size: 11px; color: var(--text-muted); word-break: break-all; }
    .section { margin-bottom: 32px; }
    h2 { font-size: 16px; font-family: monospace; text-transform: uppercase; color: var(--text); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--border); font-size: 12px; font-family: monospace; color: var(--text-muted); text-align: center; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .card { border: 1px solid #ccc; background: #f9f9f9; color: #000; }
      th { background: #eee; color: #000; }
      td { border: 1px solid #ccc; color: #000; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 style="font-family: monospace; font-size: 22px; color: #fff;">WPWW WARROOM // FORENSISK AUDIT RAPPORT</h1>
        <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Kryptografisk WORM Bevisprotokoll & Trusselkartlegging</p>
      </div>
      <div>
        <span class="badge ${stats.integrityVerified ? 'badge-success' : 'badge-danger'}">
          ${stats.integrityVerified ? 'WORM CHAIN: 100% VERIFISERT' : 'HASH AVVIK'}
        </span>
        <div style="font-size: 11px; font-family: monospace; color: var(--text-muted); margin-top: 6px; text-align: right;">
          Generert: ${ts}
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Avvergede Angrep</div>
        <div class="card-value">${stats.totalThreatsBlocked}</div>
      </div>
      <div class="card">
        <div class="card-title">Fanget i Honeypot</div>
        <div class="card-value" style="color: var(--amber);">${stats.honeypotTrappedCount}</div>
      </div>
      <div class="card">
        <div class="card-title">Aktive Signaturer</div>
        <div class="card-value">${stats.securityDefinitions.totalSignatures.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-title">Definisjonsversjon</div>
        <div class="card-value" style="font-size: 18px; color: var(--emerald);">${stats.securityDefinitions.version}</div>
      </div>
    </div>

    <div class="section">
      <h2>Kryptografisk Hash-Kjede (WORM Ledger)</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tidspunkt</th>
            <th>Angriper IP</th>
            <th>Trusseltype</th>
            <th>Mottiltak</th>
            <th>Entropi</th>
            <th>Forseglet SHA-256 Hash</th>
          </tr>
        </thead>
        <tbody>
          ${chain
            .map(
              (b) => `
            <tr>
              <td>#${b.id}</td>
              <td>${b.timestamp}</td>
              <td><strong>${b.attackerIp}</strong></td>
              <td>${b.threatType}</td>
              <td>${b.counterMeasure.split(' ')[0]}</td>
              <td><strong>${b.entropy.toFixed(2)}</strong></td>
              <td class="hash">${b.currentHash}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Isolerte IP-Adresser i Karantene</h2>
      <table>
        <thead>
          <tr>
            <th>IP-Adresse</th>
            <th>Trusselnivå</th>
            <th>Årsak</th>
            <th>Antall Blokkerte Forsøk</th>
            <th>Isolert Dato</th>
          </tr>
        </thead>
        <tbody>
          ${blacklist
            .map(
              (ip) => `
            <tr>
              <td><strong>${ip.ip}</strong></td>
              <td><span class="badge ${ip.threatLevel === 'CRITICAL' ? 'badge-danger' : 'badge-success'}">${ip.threatLevel}</span></td>
              <td>${ip.reason}</td>
              <td>${ip.attemptsBlocked}</td>
              <td>${ip.blockedAt}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      WPWW WarRoom Defense Core v20.0 • Digitalt forseglet WORM protokoll • Autonom Nøytralisering
    </div>
  </div>
</body>
</html>`;
}

export function generateStixReport(
  chain: ForensicBlock[],
  stats: SystemStats,
  blacklist: BlacklistedIp[]
): string {
  const bundleId = `bundle--${crypto.randomUUID ? crypto.randomUUID() : 'wpww-feed-994'}`;
  const now = new Date().toISOString();

  const objects: Record<string, unknown>[] = [
    {
      type: 'identity',
      spec_version: '2.1',
      id: 'identity--wpww-autonomous-honeypot',
      created: now,
      modified: now,
      name: 'WPWW WarRoom Autonomous Defense Sensor',
      identity_class: 'system',
      sectors: ['defense', 'cybersecurity', 'critical-infrastructure'],
    },
  ];

  chain.forEach((b) => {
    const indicatorId = `indicator--wpww-threat-${b.id}`;
    const observedDataId = `observed-data--wpww-obs-${b.id}`;

    objects.push({
      type: 'indicator',
      spec_version: '2.1',
      id: indicatorId,
      created: b.timestamp,
      modified: b.timestamp,
      name: `Hostile Ingress: ${b.threatType}`,
      description: `Countermeasure: ${b.counterMeasure}. Shannon Entropy: ${b.entropy}`,
      pattern: `[ipv4-addr:value = '${b.attackerIp}']`,
      pattern_type: 'stix',
      valid_from: b.timestamp,
    });

    objects.push({
      type: 'observed-data',
      spec_version: '2.1',
      id: observedDataId,
      created: b.timestamp,
      modified: b.timestamp,
      first_observed: b.timestamp,
      last_observed: b.timestamp,
      number_observed: 1,
      objects: {
        '0': {
          type: 'ipv4-addr',
          value: b.attackerIp,
        },
        '1': {
          type: 'artifact',
          payload_bin: btoa(unescape(encodeURIComponent(b.payload))),
          hashes: {
            'SHA-256': b.currentHash,
          },
        },
      },
    });
  });

  const stixBundle = {
    type: 'bundle',
    id: bundleId,
    objects,
  };

  return JSON.stringify(stixBundle, null, 2);
}

export function generateSyslogReport(chain: ForensicBlock[]): string {
  return chain
    .map((b) => {
      const facility = 16; // local0
      const severity = b.entropy > 5.2 ? 2 : 4; // Crit or Warning
      const pri = facility * 8 + severity;
      return `<${pri}>1 ${b.timestamp} wpww-warroom-core honeypot-watchdog - ID${b.id} [threat@wpww ip="${b.attackerIp}" type="${b.threatType}" cm="${b.counterMeasure}" entropy="${b.entropy}" sha256="${b.currentHash}"] Hostile packet intercepted and neutralized.`;
    })
    .join('\n');
}

export function generateYaraReport(chain: ForensicBlock[]): string {
  const highRiskBlocks = chain.filter((b) => b.entropy > 4.0 || b.payload.length > 30);
  
  let yara = `/*
 * WPWW WarRoom Auto-Generated YARA & Threat Signature Ruleset
 * Generated: ${new Date().toISOString()}
 * Rules extracted from high-entropy honeypot captures
 */\n\n`;

  highRiskBlocks.forEach((b) => {
    const cleanRuleName = `WPWW_Threat_Vector_${b.id}_${b.threatType.replace(/[^a-zA-Z0-9]/g, '_')}`.substring(0, 50);
    const sanitizedPayload = b.payload.replace(/[\\"]/g, '\\$&').substring(0, 100);

    yara += `rule ${cleanRuleName} {\n`;
    yara += `    meta:\n`;
    yara += `        description = "Automated YARA rule derived from ${b.threatType}"\n`;
    yara += `        attacker_ip = "${b.attackerIp}"\n`;
    yara += `        shannon_entropy = "${b.entropy}"\n`;
    yara += `        sha256_hash = "${b.currentHash}"\n`;
    yara += `        timestamp = "${b.timestamp}"\n`;
    yara += `    strings:\n`;
    yara += `        $payload_sample = "${sanitizedPayload}"\n`;
    yara += `    condition:\n`;
    yara += `        $payload_sample or (uint32(0) == 0x464c457f)\n`;
    yara += `}\n\n`;
  });

  return yara;
}

/**
 * Universal dispatcher to generate report in any format
 */
export function generateForensicReport(
  format: 'json' | 'csv' | 'xml' | 'markdown' | 'html' | 'stix' | 'syslog' | 'yara',
  chain: ForensicBlock[],
  stats: SystemStats,
  blacklist: BlacklistedIp[]
): { content: string; filename: string; mimeType: string } {
  const timestamp = Date.now();
  switch (format) {
    case 'json':
      return {
        content: generateJsonReport(chain, stats, blacklist),
        filename: `wpww_forensic_report_${timestamp}.json`,
        mimeType: 'application/json',
      };
    case 'csv':
      return {
        content: generateCsvReport(chain),
        filename: `wpww_forensic_ledger_${timestamp}.csv`,
        mimeType: 'text/csv',
      };
    case 'xml':
      return {
        content: generateXmlReport(chain, stats, blacklist),
        filename: `wpww_forensic_dossier_${timestamp}.xml`,
        mimeType: 'application/xml',
      };
    case 'markdown':
      return {
        content: generateMarkdownReport(chain, stats, blacklist),
        filename: `wpww_incident_report_${timestamp}.md`,
        mimeType: 'text/markdown',
      };
    case 'html':
      return {
        content: generateHtmlReport(chain, stats, blacklist),
        filename: `wpww_audit_dossier_${timestamp}.html`,
        mimeType: 'text/html',
      };
    case 'stix':
      return {
        content: generateStixReport(chain, stats, blacklist),
        filename: `wpww_stix_bundle_${timestamp}.json`,
        mimeType: 'application/json',
      };
    case 'syslog':
      return {
        content: generateSyslogReport(chain),
        filename: `wpww_syslog_stream_${timestamp}.log`,
        mimeType: 'text/plain',
      };
    case 'yara':
      return {
        content: generateYaraReport(chain),
        filename: `wpww_threat_rules_${timestamp}.yar`,
        mimeType: 'text/plain',
      };
    default:
      return {
        content: generateJsonReport(chain, stats, blacklist),
        filename: `wpww_report_${timestamp}.json`,
        mimeType: 'application/json',
      };
  }
}

/**
 * Universal browser file downloader
 */
export function downloadReportFile(
  filename: string | ('json' | 'csv' | 'xml' | 'markdown' | 'html' | 'stix' | 'syslog' | 'yara'),
  contentOrChain?: string | ForensicBlock[],
  mimeTypeOrStats?: string | SystemStats,
  blacklist?: BlacklistedIp[]
) {
  if (Array.isArray(contentOrChain) && typeof mimeTypeOrStats === 'object') {
    // Overloaded invocation: downloadReportFile(format, chain, stats, blacklist)
    const format = filename as 'json' | 'csv' | 'xml' | 'markdown' | 'html' | 'stix' | 'syslog' | 'yara';
    const chain = contentOrChain as ForensicBlock[];
    const stats = mimeTypeOrStats as SystemStats;
    const bl = blacklist || [];
    const report = generateForensicReport(format, chain, stats, bl);
    
    const blob = new Blob([report.content], { type: report.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const blob = new Blob([String(contentOrChain ?? '')], { type: String(mimeTypeOrStats ?? 'text/plain') });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = String(filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

