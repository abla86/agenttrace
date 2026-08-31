import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ShieldCheck, 
  Play 
} from 'lucide-react';
import { WPWW_PYTHON_SCRIPT_CODE } from '../data/pythonScript';

export const PythonScriptViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WPWW_PYTHON_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([WPWW_PYTHON_SCRIPT_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wpww_master_ultimate.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="python-script-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              WPWW Master Python Kildekode (wpww_master_ultimate.py)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Frittstående Python-programvare v20.0 Elite Edition med innebygd HTTP-server, WAL-database, WORM hash-kjede og Shannon entropimotor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-python-code"
              onClick={handleCopy}
              className="py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopiert til Utklippstavle!' : 'Kopier Kode'}</span>
            </button>

            <button
              id="btn-download-python-file"
              onClick={handleDownload}
              className="py-1.5 px-3.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Last ned wpww_master_ultimate.py</span>
            </button>
          </div>
        </div>

        {/* Quick run instruction box */}
        <div className="mt-4 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Kjør direkte i terminalen: <code className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">python wpww_master_ultimate.py</code></span>
          </div>
          <span className="text-[11px] text-slate-500">Krever kun standard Python 3.8+ (Ingen eksterne pip-pakker påkrevd)</span>
        </div>
      </div>

      {/* Code Display Area with Syntax Styling & Line Numbers */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-slate-300 font-semibold ml-2">wpww_master_ultimate.py</span>
          </div>
          <span className="text-[11px] text-slate-500">Python 3 UTF-8</span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono text-slate-300 leading-relaxed no-scrollbar select-text bg-[#030712]">
          <pre className="text-cyan-200/90 font-mono">
            {WPWW_PYTHON_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
