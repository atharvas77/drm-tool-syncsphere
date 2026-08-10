import React from 'react';
import { DRProvider, useDR } from './context/DRContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ReplicationJobs } from './components/ReplicationJobs';
import { RealtimeMonitoring } from './components/RealtimeMonitoring';
import { FailoverOrchestrator } from './components/FailoverOrchestrator';
import { AlertingCenter } from './components/AlertingCenter';
import { ComplianceAudit } from './components/ComplianceAudit';

const MainContent: React.FC = () => {
  const { activeTab } = useDR();

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'jobs' && <ReplicationJobs />}
      {activeTab === 'monitoring' && <RealtimeMonitoring />}
      {activeTab === 'failover' && <FailoverOrchestrator />}
      {activeTab === 'alerting' && <AlertingCenter />}
      {activeTab === 'compliance' && <ComplianceAudit />}
    </main>
  );
};

export function App() {
  return (
    <DRProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              SyncSphere DRM Controller • Enterprise Multi-Region Disaster Recovery Orchestration Engine
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400">● Global Status: Operational</span>
              <span>•</span>
              <span className="text-cyan-400">RPO Target: &lt;15s</span>
            </div>
          </div>
        </footer>
      </div>
    </DRProvider>
  );
}

export default App;
