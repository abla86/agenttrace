import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  ShieldCheck, 
  FileCode2, 
  Terminal, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { ForensicBlock, BlacklistedIp, SystemStats, ExportFormat } from '../types';
import { 
  generateJsonReport, 
  generateCsvReport, 
  generateXmlReport, 
  generateMarkdownReport, 
  generateHtmlReport, 
  generateStixReport, 
  generateSyslogReport, 
  generateYaraReport,
  downloadReportFile 
} from '../utils/exporters';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: ForensicBlock[];
  stats: SystemStats;
  blacklist: BlacklistedIp[];
  initialFormat?: ExportFormat;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  chain,
  stats,
  blacklist,
  initialFormat = 'json',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat);
  const [copied, setCopied] = useState<boolean>(false);

  const formatDefinitions = [
    {
      id: 'json' as ExportFormat,
      name: 'JSON (Full WORM Schema)',
      extension: '.json',
      mime: 'application/json',
      icon: FileJson,
      badge: 'Strukturert Data',
      desc: 'Komplett forensisk bevislogg, SHA-256 kryptografiske hashytrader og systemstatistikk.',
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV (SIEM & Excel)',
      extension: '.csv',
      mime: 'text/csv',
      icon: FileSpreadsheet,
      badge: 'Tabulæranalyse',
      desc: 'Kommaseparert datasett optimalisert for Splunk, Elastic SIEM, Excel og Google Sheets.',
    },
    {
      id: 'markdown' as ExportFormat,
      name: 'Markdown (Executive Brief)',
      extension: '.md',
      mime: 'text/markdown',
      icon: FileText,
      badge: 'Ledelsesrapport',
      desc: 'Formatert hendelsesrapport med tabeller, risikoskårer og mitigation-sammendrag.',
    },
    {
      id: 'html' as ExportFormat,
      name: 'HTML (Stand-alone Rapport)',
      extension: '.html',
      mime: 'text/html',
      icon: ExternalLink,
      badge: 'Utskriftsklar',
      desc: 'Selvstendig web-rapport med cyberpunk-tema, verifiseringssegl og utskriftsstiler.',
    },
    {
      id: 'xml' as ExportFormat,
      name: 'XML (RFC 5424 Schema)',
      extension: '.xml',
      mime: 'application/xml',
      icon: FileCode,
      badge: 'Enterprise Schema',
      desc: 'Hierarkisk XML-tre med CDATA payload-innkapsling og kryptografisk revisjon.',
    },
    {
      id: 'stix' as ExportFormat,
      name: 'STIX 2.1 / TAXII JSON',
      extension: '.stix.json',
      mime: 'application/json',
      icon: Layers,
      badge: 'CTI Standard',
      desc: 'OASIS Standard for trusseletterretning (Threat Indicators, Observables & Pattern Bundles).',
    },
    {
      id: 'syslog' as ExportFormat,
      name: 'Syslog (RFC 3164/5424)',
      extension: '.log',
      mime: 'text/plain',
      icon: Terminal,
      badge: 'Unix Daemon Log',
      desc: 'Standard syslog-strøm egnet for direkte ruting til Graylog, Logstash eller Wazuh.',
    },
    {
      id: 'yara' as ExportFormat,
      name: 'YARA Signaturer (.yar)',
      extension: '.yar',
      mime: 'text/plain',
      icon: FileCode2,
      badge: 'Auto Signaturer',
      desc: 'Autogenererte YARA deteksjonsregler utledet fra fangede høye-entropi payloads.',
    },
  ];

  // Generate selected format content
  const generatedContent = useMemo(() => {
    switch (selectedFormat) {
      case 'json':
        return generateJsonReport(chain, stats, blacklist);
      case 'csv':
        return generateCsvReport(chain);
      case 'xml':
        return generateXmlReport(chain, stats, blacklist);
      case 'markdown':
        return generateMarkdownReport(chain, stats, blacklist);
      case 'html':
        return generateHtmlReport(chain, stats, blacklist);
      case 'stix':
        return generateStixReport(chain, stats, blacklist);
      case 'syslog':
        return generateSyslogReport(chain);
      case 'yara':
        return generateYaraReport(chain);
      default:
        return '';
    }
  }, [selectedFormat, chain, stats, blacklist]);

  const currentDef = formatDefinitions.find((f) => f.id === selectedFormat) || formatDefinitions[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const filename = `wpww_defense_report_${selectedFormat}_${Date.now()}${currentDef.extension}`;
    downloadReportFile(filename, generatedContent, currentDef.mime);
  };

  if (!isOpen) return null;

  return (
    <div id="export-report-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/80 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-slate-100 flex items-center gap-2 text-base">
                Multi-Format Forensisk Eksport & Trusseletterretning
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
                  8 Formater
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Eksporter verifiserte WORM bevislogger, trusselindikatorer og forsvarsmetrikk i ønsket format.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Format Selector List (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/50 p-3 space-y-1.5 overflow-y-auto max-h-[220px] md:max-h-none">
            <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Velg Eksportformat
            </div>
            {formatDefinitions.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedFormat === item.id;
              return (
                <button
                  key={item.id}
                  id={`btn-format-${item.id}`}
                  onClick={() => setSelectedFormat(item.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-600 text-cyan-200 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-mono font-semibold truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                      {item.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Format Preview & Actions (8 cols) */}
          <div className="md:col-span-8 flex flex-col p-4 bg-slate-950/90 overflow-hidden">
            {/* Top Format Details */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-200 font-semibold">{currentDef.name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{currentDef.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {Math.round(new Blob([generatedContent]).size / 1024 * 10) / 10} KB
                </span>
                <button
                  id="btn-copy-export"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
                </button>
                <button
                  id="btn-download-export"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs font-mono transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Last ned {currentDef.extension}</span>
                </button>
              </div>
            </div>

            {/* Code / Content Viewer */}
            <div className="flex-1 overflow-auto bg-slate-950 rounded-lg border border-slate-800/90 p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 relative shadow-inner">
              <pre className="whitespace-pre overflow-x-auto selection:bg-cyan-700 selection:text-white">
                <code>{generatedContent}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Kryptografisk WORM Integritet: {stats.integrityVerified ? '100% Intakt' : 'Kjede Brutt'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
};
