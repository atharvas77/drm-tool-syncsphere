import React, { useState } from 'react';
import { useDR } from '../context/DRContext';
import type { AlertRule } from '../types/dr';
import {
  Bell,
  Mail,
  Plus,
  Trash2,
  AlertTriangle,
  Send,
  X,
  Eye
} from 'lucide-react';

export const AlertingCenter: React.FC = () => {
  const {
    alertRules,
    alertEvents,
    addAlertRule,
    toggleAlertRule,
    deleteAlertRule,
    acknowledgeAlert,
    sendTestEmail,
    setActiveTab,
  } = useDR();

  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [selectedRuleForEmail, setSelectedRuleForEmail] = useState<AlertRule | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('oncall-sre@syncsphere.io');
  const [isSending, setIsSending] = useState(false);

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    name: '',
    metric: 'rpo_lag' as AlertRule['metric'],
    threshold: 15,
    condition: 'greater_than' as AlertRule['condition'],
    severity: 'critical' as AlertRule['severity'],
    enabled: true,
    emailNotifications: true,
    recipientEmails: ['sre@syncsphere.io'],
    webhookUrl: '',
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name) return;

    addAlertRule(newRule);
    setShowNewRuleModal(false);
    setNewRule({
      name: '',
      metric: 'rpo_lag',
      threshold: 15,
      condition: 'greater_than',
      severity: 'critical',
      enabled: true,
      emailNotifications: true,
      recipientEmails: ['sre@syncsphere.io'],
      webhookUrl: '',
    });
  };

  const handleTriggerTestEmail = async (rule: AlertRule) => {
    setSelectedRuleForEmail(rule);
    setShowEmailPreviewModal(true);
  };

  const handleSendActualTestEmail = async () => {
    if (!selectedRuleForEmail || !testEmailRecipient) return;
    setIsSending(true);
    await sendTestEmail(testEmailRecipient, selectedRuleForEmail.name);
    setIsSending(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
              <Bell className="w-7 h-7 text-cyan-400" />
              <span>Automated Alerting & Email Dispatch Hub</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              Multi-Channel Alert Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure RPO SLA breach triggers, automated HTML email dispatchers, Slack/PagerDuty webhooks, and test notification previews.
          </p>
        </div>

        <button
          onClick={() => setShowNewRuleModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-glow-cyan transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Alert Policy</span>
        </button>
      </div>

      {/* Alert Policies Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>Active Alert Policies & Email Dispatchers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertRules.map((rule) => (
            <div
              key={rule.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    rule.severity === 'critical' ? 'bg-rose-500 shadow-glow-rose' : 'bg-amber-400'
                  }`} />
                  <h4 className="font-bold text-sm text-slate-100">{rule.name}</h4>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleAlertRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                </label>
              </div>

              <div className="text-xs font-mono space-y-1 text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-850">
                <p>Metric: <strong className="text-cyan-400">{rule.metric}</strong></p>
                <p>Condition: Trigger when <strong className="text-slate-100">{rule.condition} {rule.threshold}</strong></p>
                <p className="truncate">Recipients: <span className="text-slate-400">{rule.recipientEmails.join(', ')}</span></p>
                {rule.webhookUrl && <p className="text-[10px] text-slate-500 truncate">Webhook: {rule.webhookUrl}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleTriggerTestEmail(rule)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-mono text-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview & Test Email</span>
                </button>

                <button
                  onClick={() => deleteAlertRule(rule.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition"
                  title="Delete Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Triggered Incident Alerts Log */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Alert Incident History Log</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Total Alerts: {alertEvents.length}</span>
        </div>

        <div className="space-y-3">
          {alertEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                evt.severity === 'critical'
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-100">{evt.ruleName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 border border-slate-800">
                    {evt.status}
                  </span>
                </div>
                <p className="text-slate-300 text-xs">{evt.message}</p>
                <p className="text-[10px] text-slate-400 font-mono">Timestamp: {evt.timestamp}</p>
              </div>

              {evt.status === 'active' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => acknowledgeAlert(evt.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('failover');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-mono font-bold text-xs shadow-glow-rose transition"
                  >
                    Launch Failover Studio
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rendered HTML Email Alert Preview Modal */}
      {showEmailPreviewModal && selectedRuleForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Disaster Recovery Email Notification Preview</h3>
                  <p className="text-xs text-slate-400">Rendered HTML notification for: {selectedRuleForEmail.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated HTML Email Container */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 font-sans space-y-6 shadow-2xl">
              {/* Email Top Brand Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-slate-950">
                    SS
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">SyncSphere DRM Incident Alert</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Disaster Recovery Controller Engine</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-700">
                  CRITICAL INCIDENT
                </span>
              </div>

              {/* Email Content Body */}
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>Dear SRE Team,</p>
                <p>
                  SyncSphere Automated DRM Monitoring has detected an active Disaster Recovery policy violation matching rule <strong className="text-cyan-300">[{selectedRuleForEmail.name}]</strong>.
                </p>

                <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/50 space-y-2 font-mono text-[11px]">
                  <p className="text-rose-400 font-bold">⚠️ INCIDENT DETAILS:</p>
                  <p>Workload Target: <strong className="text-slate-100">PostgreSQL-Prod-Cluster-01</strong></p>
                  <p>Metric Breached: <strong className="text-amber-400">{selectedRuleForEmail.metric} ({selectedRuleForEmail.condition} {selectedRuleForEmail.threshold})</strong></p>
                  <p>Current Lag Measurement: <strong className="text-rose-400">28.5 Seconds (SLA Limit: 15.0s)</strong></p>
                  <p>Primary Datacenter Region: <strong className="text-slate-100">us-east-1</strong></p>
                  <p>Secondary DR Standby: <strong className="text-emerald-400">us-west-2 (HOT STANDBY READY)</strong></p>
                </div>

                <p>
                  Immediate intervention or 1-Click Graceful Failover orchestration is recommended to prevent data loss.
                </p>
              </div>

              {/* Email Call-To-Action Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailPreviewModal(false);
                    setActiveTab('failover');
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs shadow-glow-cyan hover:brightness-110"
                >
                  Open SyncSphere Failover Studio ➔
                </button>
              </div>

              <div className="border-t border-slate-850 pt-3 text-center text-[10px] text-slate-500 font-mono">
                Automated dispatch by SyncSphere DRM v3.4 Controller • Do not reply directly to this system message.
              </div>
            </div>

            {/* Test Send Input Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
                <span className="text-xs text-slate-300 font-semibold whitespace-nowrap">Recipient:</span>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-850 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendActualTestEmail}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Dispatch Test Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Alert Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Configure New Alert Policy</h3>
              <button onClick={() => setShowNewRuleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Policy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical RPO Spike Alert"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trigger Metric</label>
                  <select
                    value={newRule.metric}
                    onChange={(e) => setNewRule({ ...newRule, metric: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200"
                  >
                    <option value="rpo_lag">RPO Sync Lag (Seconds)</option>
                    <option value="throughput_drop">Throughput Drop (MB/s)</option>
                    <option value="connection_loss">Pipeline Disconnect</option>
                    <option value="checksum_failure">Block Checksum Mismatch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Threshold Value</label>
                  <input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Emails (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="sre@syncsphere.io, cto@syncsphere.io"
                  value={newRule.recipientEmails.join(', ')}
                  onChange={(e) => setNewRule({ ...newRule, recipientEmails: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Webhook URL (Slack / Teams / PagerDuty)</label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={newRule.webhookUrl}
                  onChange={(e) => setNewRule({ ...newRule, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewRuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Alert Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
