import React from 'react';
import { useDR } from '../context/DRContext';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Zap,
  Activity,
  Clock,
  HardDrive,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const RealtimeMonitoring: React.FC = () => {
  const { telemetryHistory } = useDR();

  const currentPoint = telemetryHistory[telemetryHistory.length - 1] || {
    throughputMBs: 190,
    lagSeconds: 1.8,
    latencyMs: 14,
    iops: 14800,
    cpuUsagePercent: 42,
    memoryUsagePercent: 64,
    pendingBufferMB: 18,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
              <Zap className="w-7 h-7 text-cyan-400" />
              <span>Real-Time Telemetry & Monitoring Studio</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 animate-pulse">
              LIVE gRPC Stream (2s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sub-second RPO lag tracking, differential write buffer inspection, and cryptographic block verification.
          </p>
        </div>
      </div>

      {/* Top Quick Status Metric Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Live Throughput</span>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">{currentPoint.throughputMBs} MB/s</p>
          </div>
          <Activity className="w-6 h-6 text-cyan-400/80" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Current RPO Lag</span>
            <p className={`text-2xl font-extrabold font-mono ${currentPoint.lagSeconds > 15 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {currentPoint.lagSeconds}s
            </p>
          </div>
          <Clock className={`w-6 h-6 ${currentPoint.lagSeconds > 15 ? 'text-rose-400' : 'text-emerald-400/80'}`} />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Wire Latency</span>
            <p className="text-2xl font-extrabold text-violet-400 font-mono">{currentPoint.latencyMs} ms</p>
          </div>
          <Zap className="w-6 h-6 text-violet-400/80" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Unsynced Buffer Queue</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{currentPoint.pendingBufferMB} MB</p>
          </div>
          <HardDrive className="w-6 h-6 text-amber-400/80" />
        </div>
      </div>

      {/* Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Throughput Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">Sync Throughput Telemetry (MB/s)</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">{currentPoint.throughputMBs} MB/s</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="throughputMBs" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#throughputGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: RPO Lag vs SLA Target Line */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100">RPO Sync Lag (Seconds vs SLA Target)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Target Line: <strong>15.0s</strong></span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 35]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <ReferenceLine y={15} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: '15s SLA Limit', fill: '#f43f5e', fontSize: 10 }} />
                <Line type="monotone" dataKey="lagSeconds" stroke="#34d399" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Differential Write Buffer Inspector & Cryptographic Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Write Buffer Queue (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100">Live WAL Differential Stream Inspector</h3>
            </div>
            <span className="text-xs font-mono text-amber-400">Streaming Packet Queue</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {[
              { id: 'BLK-90821', size: '2.4 MB', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'COMMITTED', lag: '0.2s' },
              { id: 'BLK-90822', size: '4.8 MB', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284ddd200126d9069b', status: 'COMMITTED', lag: '0.4s' },
              { id: 'BLK-90823', size: '1.2 MB', hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', status: 'IN_TRANSIT', lag: '0.9s' },
              { id: 'BLK-90824', size: '3.6 MB', hash: '86f7e437faa5a7fce15d1ddcb9eaeaea377667b800e96116797e7d946306537f', status: 'BUFFERED', lag: '1.5s' },
            ].map((blk) => (
              <div
                key={blk.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-850 gap-2"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-cyan-400 font-bold">{blk.id}</span>
                  <span className="text-slate-400">({blk.size})</span>
                  <span className="text-slate-500 hidden md:inline truncate max-w-xs">{blk.hash.slice(0, 24)}...</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-slate-400">Lag: {blk.lag}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    blk.status === 'COMMITTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {blk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic SHA-256 Checksum Matrix (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Merkle Tree Integrity</h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Merkle Root:</span>
              <span className="text-emerald-400 font-bold">MATCHED</span>
            </div>
            <p className="text-[11px] text-slate-400 break-all leading-relaxed">
              Root: 0x9f8a3c2b1e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Block Validation:</span>
              <span className="text-slate-200">100% (1,482/1,482)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Bit Rot Check:</span>
              <span className="text-emerald-400 font-bold">PASSED</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
