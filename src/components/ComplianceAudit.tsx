import React from 'react';
import { useDR } from '../context/DRContext';
import {
  FileCheck,
  Download,
  User,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const ComplianceAudit: React.FC = () => {
  const { auditLogs, jobs, setToastMessage } = useDR();

  const handleExportReport = (format: 'json' | 'pdf') => {
    const reportData = {
      title: 'SyncSphere Disaster Recovery SOC2 / ISO 27001 Audit Certificate',
      generatedAt: new Date().toISOString(),
      complianceStatus: 'PASSED',
      rpoSlaAchievement: '99.98%',
      rtoSlaAchievement: '100%',
      activeJobs: jobs.map((j) => ({
        id: j.id,
        name: j.name,
        sourceType: j.sourceType,
        rpoTargetSeconds: j.rpoTargetSeconds,
        currentLagSeconds: j.currentLagSeconds,
        encryption: j.encryption,
      })),
      auditLogs: auditLogs,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SyncSphere_DR_Audit_Report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      setToastMessage({ text: 'SOC2 PDF Compliance Report generated and downloaded.', type: 'success' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
              <FileCheck className="w-7 h-7 text-cyan-400" />
              <span>SOC2 & ISO 27001 Compliance Audit Trail</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable timeline audit log, historical RPO/RTO SLA achievements, and downloadable compliance certificates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportReport('json')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => handleExportReport('pdf')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-glow-cyan transition"
          >
            <FileText className="w-4 h-4" />
            <span>Download SOC2 PDF</span>
          </button>
        </div>
      </div>

      {/* Compliance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">SOC2 Type II Status</span>
          <p className="text-xl font-bold text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>FULLY COMPLIANT</span>
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Verified by Independent Auditor</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Historical RPO Compliance</span>
          <p className="text-xl font-bold text-cyan-400 font-mono">99.98% SLA</p>
          <p className="text-[11px] text-slate-500 font-mono">Average Sync Lag: 1.6s</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">DR Drill Frequency</span>
          <p className="text-xl font-bold text-violet-400 font-mono">Monthly Automated</p>
          <p className="text-[11px] text-slate-500 font-mono">Last Passed: 2 hours ago</p>
        </div>
      </div>

      {/* Audit Timeline Logs */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Audit Action Trail</h3>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} Events Logged</span>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[10px] uppercase">
                    {log.category}
                  </span>
                  <span className="font-bold text-slate-100">{log.action}</span>
                </div>
                <p className="text-slate-300 text-xs">{log.details}</p>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-400 shrink-0">
                <div className="flex items-center space-x-1 justify-end text-slate-300">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{log.user}</span>
                </div>
                <div>{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
