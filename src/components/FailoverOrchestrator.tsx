import React, { useEffect } from 'react';
import { useDR } from '../context/DRContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Terminal,
  Activity,
  Radio
} from 'lucide-react';

export const FailoverOrchestrator: React.FC = () => {
  const {
    failoverState,
    startFailover,
    resetFailover,
    jobs,
  } = useDR();

  // Fire confetti upon successful failover execution
  useEffect(() => {
    if (failoverState.status === 'completed') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#34d399', '#8b5cf6'],
        });
      } catch (e) {
        // Fallback if canvas confetti fails
      }
    }
  }, [failoverState.status]);

  const targetJob = jobs.find((j) => j.id === failoverState.targetJobId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
              <span>1-Click Failover & Failback Orchestrator</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-950 text-violet-300 border border-violet-700/60">
              State Machine Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated step-by-step failover execution pipeline, DNS route shift, traffic drain, and reverse failback.
          </p>
        </div>

        {failoverState.status !== 'idle' && (
          <button
            onClick={resetFailover}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Reset Orchestrator State</span>
          </button>
        )}
      </div>

      {/* Mode Selector Cards Grid (When Idle) */}
      {failoverState.status === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Mode 1: DR Test Drill */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/50 transition">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 w-fit">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Non-Disruptive DR Drill</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Spins up an isolated sandbox in us-west-2 to run synthetic workloads & smoke tests without affecting live traffic.
              </p>
            </div>
            <button
              onClick={() => startFailover('drill')}
              className="w-full py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs shadow-glow-cyan transition"
            >
              Run DR Test Drill
            </button>
          </div>

          {/* Mode 2: Planned Graceful Failover */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-emerald-500/50 transition">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Planned Graceful Failover</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Quiesces ingress traffic, flushes 100% of delta buffers, demotes primary to standby, and upgrades secondary DR node.
              </p>
            </div>
            <button
              onClick={() => startFailover('planned')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition"
            >
              Start Planned Failover
            </button>
          </div>

          {/* Mode 3: Unplanned Emergency Failover */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-rose-500/50 transition">
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 w-fit">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Emergency Cutover</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Immediate force-promotion of DR datacenter during a sudden total primary site outage or natural disaster.
              </p>
            </div>
            <button
              onClick={() => startFailover('emergency')}
              className="w-full py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs shadow-glow-rose transition"
            >
              Trigger Emergency Failover
            </button>
          </div>

          {/* Mode 4: Failback to Primary */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-violet-500/50 transition">
            <div className="p-3 rounded-xl bg-violet-950/60 border border-violet-800/60 text-violet-400 w-fit">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Failback to Primary</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Reverses delta replication direction from us-west-2 back to us-east-1 and restores original active master state.
              </p>
            </div>
            <button
              onClick={() => startFailover('failback')}
              className="w-full py-2.5 rounded-xl bg-violet-950 hover:bg-violet-900 border border-violet-700 text-violet-300 font-bold text-xs shadow-glow-violet transition"
            >
              Start Reverse Failback
            </button>
          </div>

        </div>
      )}

      {/* Active Failover Execution Console (When running or finished) */}
      {failoverState.status !== 'idle' && (
        <div className="space-y-6">
          
          {/* Status Banner */}
          <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            failoverState.status === 'completed'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-glow-emerald'
              : 'bg-slate-900/90 border-cyan-500/50 shadow-glow-cyan'
          }`}>
            <div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  failoverState.status === 'completed' ? 'bg-emerald-900 text-emerald-200' : 'bg-cyan-950 text-cyan-300 animate-pulse'
                }`}>
                  {failoverState.status.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-slate-100 capitalize">
                  {failoverState.activeMode} Orchestration Workflow
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Target: {targetJob ? targetJob.name : 'All Workloads across us-east-1 ➔ us-west-2'} • Start Time: {failoverState.startTime}
              </p>
            </div>

            <div className="flex items-center space-x-3 font-mono text-xs">
              <span className="text-slate-400">Step Progress:</span>
              <span className="text-cyan-400 font-bold text-base">
                {failoverState.currentStepIndex} / {failoverState.steps.length}
              </span>
            </div>
          </div>

          {/* Visual Execution Steps Pipeline */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Orchestration Execution Pipeline</span>
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {failoverState.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border flex items-start justify-between transition-all ${
                    step.status === 'running'
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-glow-cyan'
                      : step.status === 'success'
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                      : 'bg-slate-900/60 border-slate-850 text-slate-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      step.status === 'running'
                        ? 'bg-cyan-500 text-slate-950 animate-bounce'
                        : step.status === 'success'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.status === 'success' ? '✓' : idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-100">{step.title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                    step.status === 'running'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse'
                      : step.status === 'success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Terminal Log View */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200">Orchestrator Execution Terminal Logs</span>
              </div>
              <span className="text-[10px] text-slate-500">gRPC Stream #9102</span>
            </div>

            <div className="h-48 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5 scrollbar-thin">
              {failoverState.logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2">
                  <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                  <span className={
                    log.level === 'success' ? 'text-emerald-400 font-bold' :
                    log.level === 'warn' ? 'text-amber-400' :
                    log.level === 'error' ? 'text-rose-400 font-bold' :
                    'text-cyan-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
