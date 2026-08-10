import React from 'react';
import { useDR } from '../context/DRContext';
import {
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  Server,
  RefreshCw,
  Database,
  Globe,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    regions,
    jobs,
    telemetryHistory,
    setActiveTab,
    triggerSyncNow,
    startFailover,
    auditLogs,
    chaosSettings,
  } = useDR();

  const latestTelemetry = telemetryHistory[telemetryHistory.length - 1] || {
    throughputMBs: 184,
    lagSeconds: 1.8,
    latencyMs: 14,
    iops: 14500,
  };

  const healthyJobsCount = jobs.filter((j) => j.status === 'healthy' || j.status === 'syncing').length;
  const healthPercentage = Math.round((healthyJobsCount / jobs.length) * 100);

  const totalThroughput = jobs
    .filter((j) => j.status !== 'paused')
    .reduce((acc, j) => acc + j.throughputMBs, 0);

  const worstLag = Math.max(...jobs.map((j) => j.currentLagSeconds));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 shadow-glass">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Disaster Recovery Controller</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SLA Target Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cross-region replication controller, automated RPO/RTO verification, and failover studio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('monitoring')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Graphs</span>
          </button>

          <button
            onClick={() => startFailover('planned')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-glow-cyan transition transform active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>1-Click Graceful Failover</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DR Health Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">DR Health Score</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{healthPercentage}%</span>
            <span className="text-xs text-emerald-400 font-medium">({healthyJobsCount}/{jobs.length} Jobs Healthy)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>

        {/* Current RPO Lag */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Worst RPO Lag</span>
            <div className={`p-2 rounded-xl border ${worstLag > 15 ? 'bg-rose-950/60 border-rose-800/60 text-rose-400' : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold tracking-tight ${worstLag > 15 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {worstLag.toFixed(1)}s
            </span>
            <span className="text-xs text-slate-400 font-mono">Target &lt; 15s</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {worstLag > 15 ? '⚠️ RPO SLA Limit Exceeded!' : '✔ All jobs within RPO window'}
          </p>
        </div>

        {/* RTO Target Target Readiness */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">RTO Target SLA</span>
            <div className="p-2 rounded-xl bg-violet-950/60 border border-violet-800/60 text-violet-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">&lt; 5m 00s</span>
            <span className="text-xs text-violet-400 font-medium">(Automated Cutover)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            DNS TTL: 10s • BGP Anycast Active
          </p>
        </div>

        {/* Aggregate Throughput */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Sync Rate</span>
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {totalThroughput.toFixed(0)} <span className="text-lg font-normal text-slate-400">MB/s</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Encrypted AES-256 in-transit
          </p>
        </div>
      </div>

      {/* Interactive Architectural Topology Visualizer */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Interactive Replication Topology Diagram</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Live Stream Protocol: <strong className="text-cyan-300">gRPC Block Sync</strong>
          </span>
        </div>

        {/* Topology Visual Container */}
        <div className="relative w-full bg-slate-950 rounded-xl border border-slate-850 p-6 overflow-hidden">
          {/* Animated SVG Stream Pipe */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
            
            {/* Primary Node */}
            <div className={`p-5 rounded-2xl border transition-all ${
              chaosSettings.primaryOutage
                ? 'bg-rose-950/30 border-rose-700/60 text-rose-200 shadow-glow-rose'
                : 'bg-slate-900 border-cyan-500/40 text-slate-200 shadow-glow-cyan'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-sm">Primary Datacenter</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  chaosSettings.primaryOutage ? 'bg-rose-900 text-rose-200' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}>
                  {chaosSettings.primaryOutage ? 'OFFLINE' : 'ACTIVE MASTER'}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs font-mono text-slate-300">
                <p>Region: <strong className="text-slate-100">us-east-1 (Ashburn, VA)</strong></p>
                <p>Active Databases: <strong className="text-cyan-400">14 Workloads</strong></p>
                <p>Hardware Load: <strong className="text-slate-100">{latestTelemetry.cpuUsagePercent}% CPU</strong></p>
              </div>
            </div>

            {/* Middle Pipeline & Delta Buffer Engine */}
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className="flex items-center space-x-3 w-full justify-center">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <div className="h-1 flex-1 bg-slate-800 rounded relative overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 transition-all duration-300 ${
                      chaosSettings.primaryOutage ? 'w-0' : 'w-full animate-pulse'
                    }`}
                  />
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center font-mono text-xs space-y-1">
                <div className="flex items-center justify-center space-x-2 text-cyan-300">
                  <RefreshCw className={`w-3.5 h-3.5 ${chaosSettings.primaryOutage ? '' : 'animate-spin'}`} />
                  <span className="font-bold">Continuous WAL Replication</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Buffer Lag: <strong className="text-emerald-400">{latestTelemetry.lagSeconds}s</strong> • RPO Target: 15s
                </p>
              </div>
            </div>

            {/* Secondary DR Node */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-slate-200 shadow-glow-emerald">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Secondary DR Datacenter</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-700">
                  STANDBY READY
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs font-mono text-slate-300">
                <p>Region: <strong className="text-slate-100">us-west-2 (Boardman, OR)</strong></p>
                <p>Hot Replicas: <strong className="text-emerald-400">14 Synced</strong></p>
                <p>Storage Sync: <strong className="text-slate-100">100% Mirror Lock</strong></p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Datacenter Regions Node Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Managed Datacenter Regions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map((reg) => (
            <div
              key={reg.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{reg.name}</h4>
                  <p className="text-xs font-mono text-slate-400">{reg.code} • {reg.provider}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    reg.status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : reg.status === 'offline'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {reg.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-400">Latency:</span>
                  <p className="font-semibold text-cyan-400">{reg.latencyMs} ms</p>
                </div>
                <div>
                  <span className="text-slate-400">Workloads:</span>
                  <p className="font-semibold text-slate-200">{reg.totalWorkloads} Jobs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Replication Jobs Summary Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Replication Jobs Overview</h3>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Manage All Jobs ({jobs.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Job Name & Workload</th>
                <th className="py-3 px-4">Source ➔ Target Node</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">RPO SLA / Current Lag</th>
                <th className="py-3 px-4">Throughput</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {jobs.slice(0, 4).map((job) => (
                <tr key={job.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200">{job.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{job.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    <div>{job.sourceNode}</div>
                    <div className="text-slate-400 text-[10px]">➔ {job.targetNode}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center space-x-1 ${
                        job.status === 'healthy' || job.status === 'syncing'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : job.status === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{job.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={job.currentLagSeconds > job.rpoTargetSeconds ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {job.currentLagSeconds}s
                      </span>
                      <span className="text-slate-400 text-[10px]">(Target: {job.rpoTargetSeconds}s)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-cyan-400">
                    {job.throughputMBs} MB/s
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => triggerSyncNow(job.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
                      title="Trigger Delta Flush"
                    >
                      Sync Now
                    </button>
                    <button
                      onClick={() => startFailover('planned', job.id)}
                      className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-[11px]"
                    >
                      Failover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Activity Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Recent Disaster Recovery Audit Trail</span>
        </h3>
        <div className="space-y-2">
          {auditLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-cyan-400">
                  {log.category.toUpperCase()}
                </span>
                <div>
                  <span className="font-semibold text-slate-200">{log.action}</span>
                  <p className="text-slate-400 text-[11px]">{log.details}</p>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400">
                <div>{log.user}</div>
                <div>{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
