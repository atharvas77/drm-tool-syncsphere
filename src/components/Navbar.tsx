import React, { useState } from 'react';
import { useDR } from '../context/DRContext';
import {
  ShieldCheck,
  Activity,
  Server,
  Zap,
  Bell,
  Flame,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ChevronRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    regions,
    chaosSettings,
    updateChaosSettings,
    alertEvents,
    toastMessage,
    setToastMessage,
    failoverState,
  } = useDR();

  const [showAlertDrawer, setShowAlertDrawer] = useState(false);
  const [showChaosModal, setShowChaosModal] = useState(false);

  const activeAlerts = alertEvents.filter((e) => e.status === 'active');
  const primaryRegion = regions.find((r) => r.role === 'primary');
  const drRegion = regions.find((r) => r.role === 'secondary_dr');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'jobs', label: 'Replication Jobs', icon: Server },
    { id: 'monitoring', label: 'Telemetry & Monitoring', icon: Zap },
    { id: 'failover', label: '1-Click Failover', icon: ShieldCheck, badge: failoverState.status === 'in_progress' ? 'Running' : undefined },
    { id: 'alerting', label: 'Alerts & Email Hub', icon: Bell, badge: activeAlerts.length > 0 ? activeAlerts.length : undefined },
    { id: 'compliance', label: 'Compliance & Audit', icon: FileCheck },
  ];

  const hasChaosActive =
    chaosSettings.primaryOutage ||
    chaosSettings.rpoSpike ||
    chaosSettings.networkLatencyMs > 0 ||
    chaosSettings.storageThrottled;

  return (
    <>
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Datacenter Status */}
          <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping-slow" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-slate-100 to-emerald-400">
                    SyncSphere
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                    DRM v3.4 Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">Disaster Recovery Controller</p>
              </div>
            </div>

            {/* Datacenter Quick Pill Indicator */}
            <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    primaryRegion?.status === 'active'
                      ? 'bg-emerald-400 shadow-glow-emerald animate-pulse'
                      : 'bg-rose-500 shadow-glow-rose'
                  }`}
                />
                <span className="text-slate-300">Pri: <strong className="text-slate-100">{primaryRegion?.code}</strong> ({primaryRegion?.status.toUpperCase()})</span>
              </div>
              <span className="text-slate-600">➔</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    drRegion?.status === 'active'
                      ? 'bg-emerald-400 shadow-glow-emerald'
                      : 'bg-cyan-400'
                  }`}
                />
                <span className="text-slate-300">DR: <strong className="text-slate-100">{drRegion?.code}</strong> ({drRegion?.status.toUpperCase()})</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Tools: Chaos Engine Simulator & Notification Drawer */}
          <div className="flex items-center space-x-3">
            {/* Chaos Engine Button */}
            <button
              onClick={() => setShowChaosModal(true)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hasChaosActive
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-glow-rose animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <Flame className={`w-4 h-4 ${hasChaosActive ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">Chaos Lab</span>
              {hasChaosActive && <span className="w-2 h-2 rounded-full bg-rose-400" />}
            </button>

            {/* Notification Drawer Button */}
            <button
              onClick={() => setShowAlertDrawer(!showAlertDrawer)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Alert Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-glow-rose animate-bounce">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-lg ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-glow-emerald'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-glow-rose'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
                : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50 shadow-glow-cyan'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span className="text-xs font-medium">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alert Notifications Drawer */}
      {showAlertDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Live Alert Stream</h3>
              </div>
              <button
                onClick={() => setShowAlertDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {alertEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No alerts triggered. All systems nominal.
                </div>
              ) : (
                alertEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      evt.severity === 'critical'
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{evt.ruleName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{evt.message}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-400">Status: <strong className="capitalize">{evt.status}</strong></span>
                      <button
                        onClick={() => {
                          setActiveTab('alerting');
                          setShowAlertDrawer(false);
                        }}
                        className="text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <span>View Rule</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setActiveTab('alerting');
                  setShowAlertDrawer(false);
                }}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition"
              >
                Open Alert Management Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Chaos Simulator Modal toggle overlay */}
      {showChaosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-6 h-6 text-rose-500 animate-bounce" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Chaos Engineering Simulator</h3>
                  <p className="text-xs text-slate-400">Inject failure vectors to test SyncSphere failover & alerting</p>
                </div>
              </div>
              <button
                onClick={() => setShowChaosModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Primary Outage Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-200">Simulate Primary Datacenter Outage</h4>
                  <p className="text-slate-400 text-[11px]">Forces us-east-1 to OFFLINE state & triggers critical failover alerts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaosSettings.primaryOutage}
                    onChange={(e) => updateChaosSettings({ primaryOutage: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
                </label>
              </div>

              {/* RPO Spike Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-200">Inject RPO Sync Lag Spike (28.5s)</h4>
                  <p className="text-slate-400 text-[11px]">Violates default 15s RPO target SLA & tests email alert dispatch.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaosSettings.rpoSpike}
                    onChange={(e) => updateChaosSettings({ rpoSpike: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                </label>
              </div>

              {/* Latency Slider */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200">Network Round-Trip Latency</h4>
                  <span className="font-mono text-cyan-400">{chaosSettings.networkLatencyMs || 14} ms</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="350"
                  value={chaosSettings.networkLatencyMs || 14}
                  onChange={(e) => updateChaosSettings({ networkLatencyMs: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  updateChaosSettings({
                    primaryOutage: false,
                    rpoSpike: false,
                    networkLatencyMs: 0,
                    storageThrottled: false,
                    packetLossPercent: 0,
                  })
                }
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Reset Chaos Engine
              </button>
              <button
                onClick={() => setShowChaosModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
