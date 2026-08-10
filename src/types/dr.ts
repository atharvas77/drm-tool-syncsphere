export type SourceType = 'database' | 'kubernetes' | 'storage_volume' | 'virtual_machine' | 'file_system';
export type JobStatus = 'healthy' | 'syncing' | 'warning' | 'paused' | 'failed' | 'failover_active';
export type SyncMode = 'continuous' | 'scheduled' | 'snapshot';
export type ChecksumStatus = 'matched' | 'verifying' | 'mismatch';

export interface DatacenterRegion {
  id: string;
  name: string;
  code: string;
  role: 'primary' | 'secondary_dr' | 'edge';
  status: 'active' | 'standby' | 'degraded' | 'offline';
  location: string;
  latencyMs: number;
  totalWorkloads: number;
  loadPercentage: number;
  provider: 'AWS' | 'Azure' | 'GCP' | 'On-Premise';
}

export interface ReplicationJob {
  id: string;
  name: string;
  description: string;
  sourceType: SourceType;
  sourceRegion: string;
  targetRegion: string;
  sourceNode: string;
  targetNode: string;
  status: JobStatus;
  syncMode: SyncMode;
  rpoTargetSeconds: number;
  currentLagSeconds: number;
  rtoTargetMinutes: number;
  throughputMBs: number;
  totalDataGB: number;
  syncedDataGB: number;
  encryption: 'AES-256' | 'TLS-1.3' | 'ChaCha20-Poly1305';
  compression: boolean;
  bandwidthLimitMbps: number;
  lastSyncTime: string;
  lastChecksumStatus: ChecksumStatus;
  scheduleCron?: string;
  failoverReady: boolean;
}

export type FailoverMode = 'none' | 'drill' | 'planned' | 'emergency' | 'failback';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed';

export interface FailoverStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  durationMs?: number;
  logs?: string[];
}

export interface FailoverLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface FailoverState {
  activeMode: FailoverMode;
  status: 'idle' | 'in_progress' | 'completed' | 'failed';
  currentStepIndex: number;
  targetJobId?: string;
  steps: FailoverStep[];
  logs: FailoverLog[];
  startTime?: string;
  endTime?: string;
}

export interface TelemetryDataPoint {
  timestamp: string;
  throughputMBs: number;
  lagSeconds: number;
  latencyMs: number;
  iops: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  pendingBufferMB: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: 'rpo_lag' | 'throughput_drop' | 'connection_loss' | 'checksum_failure' | 'storage_limit';
  threshold: number;
  condition: 'greater_than' | 'less_than' | 'equals';
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  emailNotifications: boolean;
  recipientEmails: string[];
  webhookUrl?: string;
  lastTriggered?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  jobId?: string;
  jobName?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'job_config' | 'failover_orchestration' | 'alert_setting' | 'chaos_simulation';
  details: string;
  status: 'success' | 'failed';
}

export interface ChaosSettings {
  primaryOutage: boolean;
  networkLatencyMs: number;
  packetLossPercent: number;
  storageThrottled: boolean;
  rpoSpike: boolean;
}
