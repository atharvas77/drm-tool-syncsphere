import React, { useState } from 'react';
import { useDR } from '../context/DRContext';
import type { SourceType, SyncMode } from '../types/dr';
import {
  Server,
  Plus,
  Search,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Lock,
  CheckCircle,
  ShieldAlert,
  HardDrive,
  Database,
  Cpu,
  Boxes,
  X
} from 'lucide-react';

export const ReplicationJobs: React.FC = () => {
  const {
    jobs,
    addJob,
    deleteJob,
    togglePauseJob,
    triggerSyncNow,
    startFailover,
    setActiveTab,
  } = useDR();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showWizard, setShowWizard] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    sourceType: 'database' as SourceType,
    sourceRegion: 'us-east-1',
    targetRegion: 'us-west-2',
    sourceNode: '',
    targetNode: '',
    syncMode: 'continuous' as SyncMode,
    rpoTargetSeconds: 15,
    rtoTargetMinutes: 5,
    totalDataGB: 500,
    bandwidthLimitMbps: 1000,
    encryption: 'AES-256' as 'AES-256' | 'TLS-1.3' | 'ChaCha20-Poly1305',
    compression: true,
  });

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.sourceNode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || j.sourceType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.name || !newJob.sourceNode || !newJob.targetNode) return;

    addJob({
      ...newJob,
      sourceNode: newJob.sourceNode || 'pg-primary-01.us-east-1.internal:5432',
      targetNode: newJob.targetNode || 'pg-dr-replica-01.us-west-2.internal:5432',
    });

    setShowWizard(false);
    // Reset form
    setNewJob({
      name: '',
      description: '',
      sourceType: 'database',
      sourceRegion: 'us-east-1',
      targetRegion: 'us-west-2',
      sourceNode: '',
      targetNode: '',
      syncMode: 'continuous',
      rpoTargetSeconds: 15,
      rtoTargetMinutes: 5,
      totalDataGB: 500,
      bandwidthLimitMbps: 1000,
      encryption: 'AES-256',
      compression: true,
    });
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'kubernetes':
        return <Boxes className="w-4 h-4 text-violet-400" />;
      case 'storage_volume':
        return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'virtual_machine':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      default:
        return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Server className="w-7 h-7 text-cyan-400" />
            <span>Replication Job Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage continuous block-level sync pipelines, RPO SLAs, encryption keys, and failover targets.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-glow-cyan transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Replication Job</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search job name, node, or query..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Workload Type Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Workloads' },
            { id: 'database', label: 'Databases' },
            { id: 'kubernetes', label: 'Kubernetes PVCs' },
            { id: 'storage_volume', label: 'Storage Buckets' },
            { id: 'virtual_machine', label: 'VM Snapshots' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === tab.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            {/* Top Row: Title, Workload badge, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  {getSourceIcon(job.sourceType)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-slate-100">{job.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-850 text-slate-300 border border-slate-800">
                      {job.syncMode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{job.encryption}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{job.description}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase inline-flex items-center space-x-1.5 ${
                    job.status === 'healthy' || job.status === 'syncing'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : job.status === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : job.status === 'paused'
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>{job.status}</span>
                </span>
              </div>
            </div>

            {/* Middle Row: Nodes & Data Sync Meter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-850 text-xs font-mono">
              {/* Nodes */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Replication Pipeline</span>
                <p className="text-slate-200 truncate mt-1">Source: <strong className="text-cyan-400">{job.sourceNode}</strong></p>
                <p className="text-slate-200 truncate">Target: <strong className="text-emerald-400">{job.targetNode}</strong></p>
              </div>

              {/* RPO Lag vs SLA Meter */}
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 uppercase">RPO Target SLA ({job.rpoTargetSeconds}s)</span>
                  <span className={job.currentLagSeconds > job.rpoTargetSeconds ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    Current: {job.currentLagSeconds}s
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      job.currentLagSeconds > job.rpoTargetSeconds ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (job.currentLagSeconds / job.rpoTargetSeconds) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Last Delta Flush: {job.lastSyncTime}</p>
              </div>

              {/* Data & Throughput */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Telemetry Stats</span>
                <p className="text-slate-200 mt-1">
                  Throughput: <strong className="text-cyan-300">{job.throughputMBs} MB/s</strong>
                </p>
                <p className="text-slate-200">
                  Data Volume: <strong className="text-slate-100">{job.syncedDataGB} GB / {job.totalDataGB} GB</strong>
                </p>
              </div>
            </div>

            {/* Bottom Row: Checksum Status & Control Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Integrity Validation:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span className="uppercase">{job.lastChecksumStatus} (SHA-256)</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => triggerSyncNow(job.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  title="Force immediate delta buffer sync"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flush Delta</span>
                </button>

                <button
                  onClick={() => togglePauseJob(job.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  {job.status === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    startFailover('planned', job.id);
                    setActiveTab('failover');
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-700/60 shadow-glow-cyan transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1-Click Failover</span>
                </button>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Replication Job Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Create New Data Replication Job</h3>
                  <p className="text-xs text-slate-400">Configure cross-region workload mirroring strategy</p>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Postgres-Billing-DB"
                    value={newJob.name}
                    onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Workload Category</label>
                  <select
                    value={newJob.sourceType}
                    onChange={(e) => setNewJob({ ...newJob, sourceType: e.target.value as SourceType })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="database">Transactional Database (PostgreSQL/MySQL/Redis)</option>
                    <option value="kubernetes">Kubernetes Stateful Persistent Volume (CSI)</option>
                    <option value="storage_volume">Object Storage (S3 / Blob)</option>
                    <option value="virtual_machine">Virtual Machine Snapshot (VMware ESXi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Description</label>
                <input
                  type="text"
                  placeholder="Brief context regarding data critical SLA"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Source Node Connection String</label>
                  <input
                    type="text"
                    placeholder="e.g. pg-master.us-east-1.internal:5432"
                    value={newJob.sourceNode}
                    onChange={(e) => setNewJob({ ...newJob, sourceNode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secondary DR Target Endpoint</label>
                  <input
                    type="text"
                    placeholder="e.g. pg-replica.us-west-2.internal:5432"
                    value={newJob.targetNode}
                    onChange={(e) => setNewJob({ ...newJob, targetNode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sync Strategy</label>
                  <select
                    value={newJob.syncMode}
                    onChange={(e) => setNewJob({ ...newJob, syncMode: e.target.value as SyncMode })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="continuous">Continuous Asynchronous Streaming</option>
                    <option value="snapshot">Hourly Delta Snapshots</option>
                    <option value="scheduled">Scheduled Batch CRON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">RPO SLA Target (Seconds)</label>
                  <input
                    type="number"
                    value={newJob.rpoTargetSeconds}
                    onChange={(e) => setNewJob({ ...newJob, rpoTargetSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Encryption Protocol</label>
                  <select
                    value={newJob.encryption}
                    onChange={(e) => setNewJob({ ...newJob, encryption: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="AES-256">AES-256-GCM Hardware Encrypted</option>
                    <option value="TLS-1.3">TLS-1.3 Wire Guard Protocol</option>
                    <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 Cipher</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-glow-cyan hover:brightness-110"
                >
                  Initialize Replication Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
