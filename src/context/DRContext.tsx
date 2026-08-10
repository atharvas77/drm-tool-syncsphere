import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  DatacenterRegion,
  ReplicationJob,
  FailoverState,
  FailoverMode,
  TelemetryDataPoint,
  AlertRule,
  AlertEvent,
  AuditEvent,
  ChaosSettings,
  FailoverStep
} from '../types/dr';

interface DRContextType {
  regions: DatacenterRegion[];
  jobs: ReplicationJob[];
  telemetryHistory: TelemetryDataPoint[];
  failoverState: FailoverState;
  alertRules: AlertRule[];
  alertEvents: AlertEvent[];
  auditLogs: AuditEvent[];
  chaosSettings: ChaosSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Job actions
  addJob: (job: Omit<ReplicationJob, 'id' | 'status' | 'currentLagSeconds' | 'throughputMBs' | 'syncedDataGB' | 'lastSyncTime' | 'lastChecksumStatus' | 'failoverReady'>) => void;
  updateJob: (id: string, updates: Partial<ReplicationJob>) => void;
  deleteJob: (id: string) => void;
  togglePauseJob: (id: string) => void;
  triggerSyncNow: (id: string) => void;
  // Failover actions
  startFailover: (mode: FailoverMode, targetJobId?: string) => void;
  resetFailover: () => void;
  // Alert actions
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'lastTriggered'>) => void;
  toggleAlertRule: (id: string) => void;
  deleteAlertRule: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  sendTestEmail: (recipient: string, ruleName: string) => Promise<boolean>;
  // Chaos actions
  updateChaosSettings: (updates: Partial<ChaosSettings>) => void;
  // Toast notifications
  toastMessage: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  setToastMessage: (msg: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null) => void;
}

const initialRegions: DatacenterRegion[] = [
  {
    id: 'region-1',
    name: 'US East (N. Virginia)',
    code: 'us-east-1',
    role: 'primary',
    status: 'active',
    location: 'Ashburn, VA',
    latencyMs: 14,
    totalWorkloads: 24,
    loadPercentage: 68,
    provider: 'AWS',
  },
  {
    id: 'region-2',
    name: 'US West (Oregon)',
    code: 'us-west-2',
    role: 'secondary_dr',
    status: 'standby',
    location: 'Boardman, OR',
    latencyMs: 62,
    totalWorkloads: 24,
    loadPercentage: 12,
    provider: 'AWS',
  },
  {
    id: 'region-3',
    name: 'EU Central (Frankfurt)',
    code: 'eu-central-1',
    role: 'edge',
    status: 'standby',
    location: 'Frankfurt, DE',
    latencyMs: 110,
    totalWorkloads: 8,
    loadPercentage: 25,
    provider: 'AWS',
  },
];

const initialJobs: ReplicationJob[] = [
  {
    id: 'job-101',
    name: 'PostgreSQL-Prod-Cluster-01',
    description: 'Main transactional database mirror for payment & user services',
    sourceType: 'database',
    sourceRegion: 'us-east-1',
    targetRegion: 'us-west-2',
    sourceNode: 'pg-master.us-east-1.internal:5432',
    targetNode: 'pg-replica.us-west-2.internal:5432',
    status: 'syncing',
    syncMode: 'continuous',
    rpoTargetSeconds: 15,
    currentLagSeconds: 1.8,
    rtoTargetMinutes: 5,
    throughputMBs: 184.2,
    totalDataGB: 2450,
    syncedDataGB: 2449.6,
    encryption: 'AES-256',
    compression: true,
    bandwidthLimitMbps: 2000,
    lastSyncTime: new Date().toLocaleTimeString(),
    lastChecksumStatus: 'matched',
    failoverReady: true,
  },
  {
    id: 'job-102',
    name: 'K8s-PersistentVolumes-Stateful',
    description: 'Kubernetes PVC async block replication for microservices persistent storage',
    sourceType: 'kubernetes',
    sourceRegion: 'us-east-1',
    targetRegion: 'us-west-2',
    sourceNode: 'k8s-pv-csi.us-east-1.internal',
    targetNode: 'k8s-pv-csi.us-west-2.internal',
    status: 'healthy',
    syncMode: 'continuous',
    rpoTargetSeconds: 30,
    currentLagSeconds: 4.1,
    rtoTargetMinutes: 10,
    throughputMBs: 92.4,
    totalDataGB: 4100,
    syncedDataGB: 4098.2,
    encryption: 'TLS-1.3',
    compression: true,
    bandwidthLimitMbps: 1000,
    lastSyncTime: new Date().toLocaleTimeString(),
    lastChecksumStatus: 'matched',
    failoverReady: true,
  },
  {
    id: 'job-103',
    name: 'S3-ObjectStore-MultiRegion',
    description: 'Cross-Region Bucket Replication (CRR) for user document uploads and media assets',
    sourceType: 'storage_volume',
    sourceRegion: 'us-east-1',
    targetRegion: 'us-west-2',
    sourceNode: 's3://prod-media-assets-us-east-1',
    targetNode: 's3://prod-media-assets-dr-us-west-2',
    status: 'healthy',
    syncMode: 'scheduled',
    scheduleCron: '0 */1 * * *',
    rpoTargetSeconds: 300,
    currentLagSeconds: 12.0,
    rtoTargetMinutes: 15,
    throughputMBs: 310.0,
    totalDataGB: 18500,
    syncedDataGB: 18500.0,
    encryption: 'AES-256',
    compression: false,
    bandwidthLimitMbps: 5000,
    lastSyncTime: new Date().toLocaleTimeString(),
    lastChecksumStatus: 'matched',
    failoverReady: true,
  },
  {
    id: 'job-104',
    name: 'VMware-ESXi-AppCluster-Snapshot',
    description: 'Hourly virtual machine memory and disk delta snapshots for legacy ERP system',
    sourceType: 'virtual_machine',
    sourceRegion: 'us-east-1',
    targetRegion: 'us-west-2',
    sourceNode: 'esxi-host-04.infra.internal',
    targetNode: 'esxi-dr-host-01.infra.internal',
    status: 'healthy',
    syncMode: 'snapshot',
    rpoTargetSeconds: 60,
    currentLagSeconds: 8.5,
    rtoTargetMinutes: 20,
    throughputMBs: 45.0,
    totalDataGB: 890,
    syncedDataGB: 888.1,
    encryption: 'AES-256',
    compression: true,
    bandwidthLimitMbps: 500,
    lastSyncTime: new Date().toLocaleTimeString(),
    lastChecksumStatus: 'matched',
    failoverReady: true,
  },
  {
    id: 'job-105',
    name: 'Redis-Cluster-StateSync',
    description: 'Ultra-low latency in-memory session cache replication stream',
    sourceType: 'database',
    sourceRegion: 'us-east-1',
    targetRegion: 'us-west-2',
    sourceNode: 'redis-node-01.us-east-1.internal:6379',
    targetNode: 'redis-node-01.us-west-2.internal:6379',
    status: 'syncing',
    syncMode: 'continuous',
    rpoTargetSeconds: 5,
    currentLagSeconds: 0.4,
    rtoTargetMinutes: 2,
    throughputMBs: 15.8,
    totalDataGB: 120,
    syncedDataGB: 119.98,
    encryption: 'TLS-1.3',
    compression: true,
    bandwidthLimitMbps: 1000,
    lastSyncTime: new Date().toLocaleTimeString(),
    lastChecksumStatus: 'matched',
    failoverReady: true,
  },
];

const initialAlertRules: AlertRule[] = [
  {
    id: 'rule-1',
    name: 'RPO Target SLA Violation',
    metric: 'rpo_lag',
    threshold: 15,
    condition: 'greater_than',
    severity: 'critical',
    enabled: true,
    emailNotifications: true,
    recipientEmails: ['oncall-sre@syncsphere.io', 'cto@syncsphere.io'],
    webhookUrl: 'https://hooks.slack.com/services/DRM/ALERT_HOOK',
    lastTriggered: '2 hours ago',
  },
  {
    id: 'rule-2',
    name: 'Replication Pipeline Disconnection',
    metric: 'connection_loss',
    threshold: 1,
    condition: 'equals',
    severity: 'critical',
    enabled: true,
    emailNotifications: true,
    recipientEmails: ['sre-team@syncsphere.io'],
    webhookUrl: 'https://pagerduty.com/api/v2/enqueue',
  },
  {
    id: 'rule-3',
    name: 'Sync Throughput Degradation',
    metric: 'throughput_drop',
    threshold: 20,
    condition: 'less_than',
    severity: 'warning',
    enabled: true,
    emailNotifications: true,
    recipientEmails: ['ops-alerts@syncsphere.io'],
  },
  {
    id: 'rule-4',
    name: 'Block Checksum Mismatch Alert',
    metric: 'checksum_failure',
    threshold: 1,
    condition: 'greater_than',
    severity: 'critical',
    enabled: true,
    emailNotifications: true,
    recipientEmails: ['sec-ops@syncsphere.io'],
  },
];

const initialAlertEvents: AlertEvent[] = [
  {
    id: 'evt-901',
    ruleId: 'rule-1',
    ruleName: 'RPO Target SLA Violation',
    severity: 'warning',
    message: 'Job [PostgreSQL-Prod-Cluster-01] replication lag reached 18.2s (SLA target: 15s) during network congestion.',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    status: 'resolved',
    jobId: 'job-101',
    jobName: 'PostgreSQL-Prod-Cluster-01',
  },
  {
    id: 'evt-902',
    ruleId: 'rule-3',
    ruleName: 'Sync Throughput Degradation',
    severity: 'warning',
    message: 'Job [K8s-PersistentVolumes-Stateful] throughput dropped below 20MB/s threshold.',
    timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
    status: 'acknowledged',
    jobId: 'job-102',
    jobName: 'K8s-PersistentVolumes-Stateful',
  },
];

const initialAuditLogs: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 14400000).toLocaleTimeString(),
    user: 'alex.sre@syncsphere.io',
    action: 'CREATED_REPLICATION_JOB',
    category: 'job_config',
    details: 'Configured PostgreSQL-Prod-Cluster-01 with 15s RPO SLA and AES-256 encryption.',
    status: 'success',
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 10800000).toLocaleTimeString(),
    user: 'sarah.ops@syncsphere.io',
    action: 'EXECUTED_SIMULATED_FAILOVER_DRILL',
    category: 'failover_orchestration',
    details: 'Completed non-disruptive DR Drill on US West standby node. Passed all health checks.',
    status: 'success',
  },
  {
    id: 'aud-003',
    timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
    user: 'system.autodrm',
    action: 'TRIGGERED_AUTOMATED_EMAIL_ALERT',
    category: 'alert_setting',
    details: 'Sent email alert to oncall-sre@syncsphere.io for RPO SLA breach.',
    status: 'success',
  },
];

const DRContext = createContext<DRContextType | undefined>(undefined);

export const DRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<DatacenterRegion[]>(initialRegions);
  const [jobs, setJobs] = useState<ReplicationJob[]>(initialJobs);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [alertRules, setAlertRules] = useState<AlertRule[]>(initialAlertRules);
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>(initialAlertEvents);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(initialAuditLogs);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const [chaosSettings, setChaosSettings] = useState<ChaosSettings>({
    primaryOutage: false,
    networkLatencyMs: 0,
    packetLossPercent: 0,
    storageThrottled: false,
    rpoSpike: false,
  });

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryDataPoint[]>(() => {
    const points: TelemetryDataPoint[] = [];
    const now = Date.now();
    for (let i = 19; i >= 0; i--) {
      const t = new Date(now - i * 3000).toLocaleTimeString();
      points.push({
        timestamp: t,
        throughputMBs: Math.round(180 + Math.random() * 40),
        lagSeconds: Number((1.5 + Math.random() * 1.2).toFixed(1)),
        latencyMs: Math.round(14 + Math.random() * 5),
        iops: Math.round(14500 + Math.random() * 1200),
        cpuUsagePercent: Math.round(35 + Math.random() * 15),
        memoryUsagePercent: Math.round(60 + Math.random() * 5),
        pendingBufferMB: Math.round(12 + Math.random() * 8),
      });
    }
    return points;
  });

  const [failoverState, setFailoverState] = useState<FailoverState>({
    activeMode: 'none',
    status: 'idle',
    currentStepIndex: 0,
    steps: [],
    logs: [],
  });

  // Auto-toast dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Live Real-Time Telemetry & Chaos simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString();

      // Compute chaos multipliers
      const latencyMultiplier = chaosSettings.networkLatencyMs > 0 ? chaosSettings.networkLatencyMs : 14;
      const lagBase = chaosSettings.rpoSpike ? 28.5 : chaosSettings.primaryOutage ? 45.0 : 1.8;
      const throughputBase = chaosSettings.primaryOutage ? 0 : chaosSettings.storageThrottled ? 15.0 : 210;

      const newPoint: TelemetryDataPoint = {
        timestamp: timeStr,
        throughputMBs: Math.max(0, Math.round(throughputBase + (Math.random() * 20 - 10))),
        lagSeconds: Number((lagBase + (Math.random() * 1.5 - 0.75)).toFixed(1)),
        latencyMs: Math.round(latencyMultiplier + Math.random() * 8),
        iops: chaosSettings.primaryOutage ? 0 : Math.round(15000 + Math.random() * 2000),
        cpuUsagePercent: chaosSettings.primaryOutage ? 95 : Math.round(38 + Math.random() * 10),
        memoryUsagePercent: Math.round(62 + Math.random() * 4),
        pendingBufferMB: Math.round((lagBase * 12.5) + Math.random() * 5),
      };

      setTelemetryHistory((prev) => [...prev.slice(1), newPoint]);

      // Update jobs current lag and status based on chaos
      setJobs((prevJobs) =>
        prevJobs.map((j) => {
          if (j.status === 'paused') return j;
          let jobLag = newPoint.lagSeconds;
          let jobStatus = j.status;

          if (chaosSettings.primaryOutage) {
            jobStatus = 'failed';
            jobLag = 52.4;
          } else if (jobLag > j.rpoTargetSeconds) {
            jobStatus = 'warning';
          } else if (j.status === 'warning' && jobLag <= j.rpoTargetSeconds) {
            jobStatus = 'syncing';
          }

          return {
            ...j,
            currentLagSeconds: jobLag,
            throughputMBs: chaosSettings.primaryOutage ? 0 : j.throughputMBs,
            status: jobStatus,
            lastSyncTime: timeStr,
          };
        })
      );

      // Check RPO Breach alert trigger
      if (chaosSettings.rpoSpike && alertRules.some((r) => r.id === 'rule-1' && r.enabled)) {
        const hasExistingActive = alertEvents.some((e) => e.ruleId === 'rule-1' && e.status === 'active');
        if (!hasExistingActive) {
          const newAlert: AlertEvent = {
            id: `evt-${Date.now()}`,
            ruleId: 'rule-1',
            ruleName: 'RPO Target SLA Violation',
            severity: 'critical',
            message: `CRITICAL: RPO Lag spiked to ${lagBase.toFixed(1)}s exceeding SLA limit of 15s!`,
            timestamp: timeStr,
            status: 'active',
            jobId: 'job-101',
            jobName: 'PostgreSQL-Prod-Cluster-01',
          };
          setAlertEvents((prev) => [newAlert, ...prev]);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [chaosSettings, alertRules, alertEvents]);

  // Update regions based on primary outage chaos setting
  useEffect(() => {
    setRegions((prev) =>
      prev.map((r) => {
        if (r.role === 'primary') {
          return {
            ...r,
            status: chaosSettings.primaryOutage ? 'offline' : failoverState.activeMode === 'planned' || failoverState.activeMode === 'emergency' ? 'standby' : 'active',
          };
        }
        if (r.role === 'secondary_dr') {
          return {
            ...r,
            status: failoverState.activeMode === 'planned' || failoverState.activeMode === 'emergency' ? 'active' : 'standby',
          };
        }
        return r;
      })
    );
  }, [chaosSettings.primaryOutage, failoverState.activeMode]);

  // Job operations
  const addJob = (newJobData: Omit<ReplicationJob, 'id' | 'status' | 'currentLagSeconds' | 'throughputMBs' | 'syncedDataGB' | 'lastSyncTime' | 'lastChecksumStatus' | 'failoverReady'>) => {
    const newJob: ReplicationJob = {
      ...newJobData,
      id: `job-${Date.now().toString().slice(-4)}`,
      status: 'syncing',
      currentLagSeconds: 1.2,
      throughputMBs: 120.0,
      syncedDataGB: newJobData.totalDataGB,
      lastSyncTime: new Date().toLocaleTimeString(),
      lastChecksumStatus: 'matched',
      failoverReady: true,
    };

    setJobs((prev) => [newJob, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        user: 'admin@syncsphere.io',
        action: 'CREATED_JOB',
        category: 'job_config',
        details: `Created replication job: ${newJob.name} (${newJob.sourceType})`,
        status: 'success',
      },
      ...prev,
    ]);
    setToastMessage({ text: `Replication Job "${newJob.name}" created successfully.`, type: 'success' });
  };

  const updateJob = (id: string, updates: Partial<ReplicationJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    setToastMessage({ text: `Updated job configuration.`, type: 'info' });
  };

  const deleteJob = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (job) {
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          user: 'admin@syncsphere.io',
          action: 'DELETED_JOB',
          category: 'job_config',
          details: `Deleted replication job: ${job.name}`,
          status: 'success',
        },
        ...prev,
      ]);
      setToastMessage({ text: `Job "${job.name}" deleted.`, type: 'warning' });
    }
  };

  const togglePauseJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const nextStatus = j.status === 'paused' ? 'syncing' : 'paused';
          setToastMessage({ text: `Job ${j.name} ${nextStatus === 'paused' ? 'paused' : 'resumed'}.`, type: 'info' });
          return { ...j, status: nextStatus };
        }
        return j;
      })
    );
  };

  const triggerSyncNow = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          setToastMessage({ text: `Triggered manual delta flush for "${j.name}".`, type: 'success' });
          return {
            ...j,
            currentLagSeconds: 0.1,
            lastSyncTime: new Date().toLocaleTimeString(),
            lastChecksumStatus: 'verifying',
          };
        }
        return j;
      })
    );

    // Reset checksum verifying state after 1.5s
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, lastChecksumStatus: 'matched' } : j))
      );
    }, 1500);
  };

  // Failover Orchestrator State Machine
  const startFailover = (mode: FailoverMode, targetJobId?: string) => {
    const stepDefinitions: Record<FailoverMode, Array<{ id: string; title: string; description: string }>> = {
      none: [],
      drill: [
        { id: 'step-1', title: 'Spin Up Isolated Sandbox', description: 'Provision isolated virtual network & storage snapshot in us-west-2 DR site.' },
        { id: 'step-2', title: 'Mirror Secondary Disks', description: 'Attach point-in-time snapshot to test compute instances without disrupting live replication.' },
        { id: 'step-3', title: 'Execute Synthetic Health Checks', description: 'Run smoke test queries, database integrity validations, and latency probes.' },
        { id: 'step-4', title: 'Teardown Test Environment', description: 'Destroy sandbox resources and issue DR Readiness Verification Certificate.' },
      ],
      planned: [
        { id: 'step-1', title: 'Quiesce Production Ingress', description: 'Drain active API connections & switch public load balancing ingress to Maintenance Mode.' },
        { id: 'step-2', title: 'Final Write Delta Flush', description: 'Flush unwritten WAL transaction buffers and enforce 0-second RPO checksum lock.' },
        { id: 'step-3', title: 'Demote Primary Region (us-east-1)', description: 'Set Primary database to Read-Only standby status.' },
        { id: 'step-4', title: 'Promote Secondary Region (us-west-2)', description: 'Upgrade Secondary DR database cluster to Active Read-Write master.' },
        { id: 'step-5', title: 'Update DNS & BGP Anycast Routes', description: 'Point global Traffic Manager to us-west-2 endpoint IP.' },
        { id: 'step-6', title: 'Run Post-Failover Diagnostics', description: 'Verify application health endpoints, latency SLAs, and automated alerting.' },
      ],
      emergency: [
        { id: 'step-1', title: 'Detect & Isolate Outage Zone', description: 'Cutoff unresponsive us-east-1 connection pools to prevent split-brain syndrome.' },
        { id: 'step-2', title: 'Force-Promote DR Cluster', description: 'Issue immediate emergency promotion signal to us-west-2 secondary storage arrays.' },
        { id: 'step-3', title: 'Apply Last-Known Snapshot Delta', description: 'Replay last verified replication WAL stream fragment.' },
        { id: 'step-4', title: 'Emergency DNS Route Shift', description: 'Update Cloudflare / AWS Route53 records to point directly to DR datacenter.' },
        { id: 'step-5', title: 'Broadcast Outage Alert Notification', description: 'Notify SRE team, Incident Commander, and customer support channels.' },
      ],
      failback: [
        { id: 'step-1', title: 'Verify Primary Region Recovery', description: 'Perform health diagnostic check on restored us-east-1 node hardware.' },
        { id: 'step-2', title: 'Reverse Delta Sync Direction', description: 'Replicate new data accumulated in us-west-2 back to us-east-1 primary.' },
        { id: 'step-3', title: 'Quiesce Secondary DR Traffic', description: 'Pause incoming client transactions briefly on us-west-2.' },
        { id: 'step-4', title: 'Re-Establish Original Active State', description: 'Promote us-east-1 to primary master and demote us-west-2 to DR standby.' },
        { id: 'step-5', title: 'Restore Normal Routing', description: 'Revert global Anycast routing back to us-east-1.' },
      ],
    };

    const steps: FailoverStep[] = stepDefinitions[mode].map((s) => ({
      ...s,
      status: 'pending',
    }));

    setFailoverState({
      activeMode: mode,
      status: 'in_progress',
      currentStepIndex: 0,
      targetJobId,
      steps,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `[ORCHESTRATOR] Initiated ${mode.toUpperCase()} Failover workflow. Initializing execution pipeline...`,
        },
      ],
      startTime: new Date().toLocaleTimeString(),
    });

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        user: 'admin@syncsphere.io',
        action: `START_${mode.toUpperCase()}_FAILOVER`,
        category: 'failover_orchestration',
        details: `Triggered ${mode} failover process for target: ${targetJobId || 'ALL_WORKLOADS'}`,
        status: 'success',
      },
      ...prev,
    ]);
  };

  // Step-by-Step execution driver loop for Failover Orchestrator
  useEffect(() => {
    if (failoverState.status !== 'in_progress' || failoverState.activeMode === 'none') return;

    const { currentStepIndex, steps } = failoverState;
    if (currentStepIndex >= steps.length) {
      // Completed all steps!
      setFailoverState((prev) => ({
        ...prev,
        status: 'completed',
        endTime: new Date().toLocaleTimeString(),
        logs: [
          ...prev.logs,
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
            message: `🎉 [SUCCESS] ${prev.activeMode.toUpperCase()} Orchestration completed successfully! All health checks passed.`,
          },
        ],
      }));

      // Update job statuses if failover or failback
      if (failoverState.activeMode === 'planned' || failoverState.activeMode === 'emergency') {
        setJobs((prev) => prev.map((j) => ({ ...j, status: 'failover_active', sourceRegion: 'us-west-2', targetRegion: 'us-east-1' })));
      } else if (failoverState.activeMode === 'failback') {
        setJobs((prev) => prev.map((j) => ({ ...j, status: 'healthy', sourceRegion: 'us-east-1', targetRegion: 'us-west-2' })));
      }
      return;
    }

    // Process current step
    const timer = setTimeout(() => {
      const stepName = steps[currentStepIndex].title;
      setFailoverState((prev) => {
        const updatedSteps = [...prev.steps];
        updatedSteps[currentStepIndex] = { ...updatedSteps[currentStepIndex], status: 'success', durationMs: 1800 };

        const nextIndex = currentStepIndex + 1;
        if (nextIndex < updatedSteps.length) {
          updatedSteps[nextIndex] = { ...updatedSteps[nextIndex], status: 'running' };
        }

        return {
          ...prev,
          currentStepIndex: nextIndex,
          steps: updatedSteps,
          logs: [
            ...prev.logs,
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              level: 'info',
              message: `✔ Step ${currentStepIndex + 1}/${steps.length} Completed: [${stepName}]. Verified 0 errors.`,
            },
          ],
        };
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [failoverState]);

  const resetFailover = () => {
    setFailoverState({
      activeMode: 'none',
      status: 'idle',
      currentStepIndex: 0,
      steps: [],
      logs: [],
    });
  };

  // Alert Management
  const addAlertRule = (newRuleData: Omit<AlertRule, 'id' | 'lastTriggered'>) => {
    const newRule: AlertRule = {
      ...newRuleData,
      id: `rule-${Date.now().toString().slice(-4)}`,
    };
    setAlertRules((prev) => [...prev, newRule]);
    setToastMessage({ text: `Alert rule "${newRule.name}" saved.`, type: 'success' });
  };

  const toggleAlertRule = (id: string) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteAlertRule = (id: string) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== id));
    setToastMessage({ text: `Alert rule removed.`, type: 'warning' });
  };

  const acknowledgeAlert = (id: string) => {
    setAlertEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'acknowledged' } : e))
    );
    setToastMessage({ text: `Alert acknowledged.`, type: 'info' });
  };

  const sendTestEmail = async (recipient: string, ruleName: string): Promise<boolean> => {
    setToastMessage({ text: `Sending simulated HTML test email to ${recipient}...`, type: 'info' });
    await new Promise((res) => setTimeout(res, 1200));

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        user: 'admin@syncsphere.io',
        action: 'TEST_EMAIL_ALERT_SENT',
        category: 'alert_setting',
        details: `Dispatched test email notification for rule "${ruleName}" to ${recipient}`,
        status: 'success',
      },
      ...prev,
    ]);

    setToastMessage({ text: `Email dispatched successfully to ${recipient}!`, type: 'success' });
    return true;
  };

  // Chaos controls
  const updateChaosSettings = (updates: Partial<ChaosSettings>) => {
    setChaosSettings((prev) => {
      const next = { ...prev, ...updates };
      setAuditLogs((aPrev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          user: 'admin@syncsphere.io',
          action: 'UPDATED_CHAOS_ENGINE',
          category: 'chaos_simulation',
          details: `Chaos settings updated: Primary Outage=${next.primaryOutage}, RPO Spike=${next.rpoSpike}, Latency=${next.networkLatencyMs}ms`,
          status: 'success',
        },
        ...aPrev,
      ]);
      return next;
    });
  };

  return (
    <DRContext.Provider
      value={{
        regions,
        jobs,
        telemetryHistory,
        failoverState,
        alertRules,
        alertEvents,
        auditLogs,
        chaosSettings,
        activeTab,
        setActiveTab,
        addJob,
        updateJob,
        deleteJob,
        togglePauseJob,
        triggerSyncNow,
        startFailover,
        resetFailover,
        addAlertRule,
        toggleAlertRule,
        deleteAlertRule,
        acknowledgeAlert,
        sendTestEmail,
        updateChaosSettings,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </DRContext.Provider>
  );
};

export const useDR = () => {
  const context = useContext(DRContext);
  if (!context) {
    throw new Error('useDR must be used within a DRProvider');
  }
  return context;
};
