import React, { useRef, useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView } from './views/DashboardView';
import { NewScanView } from './views/NewScanView';
import { AnalysisView, AnalysisStatus } from './views/AnalysisView';
import { ResultsView } from './views/ResultsView';
import { ViolationDetailModal } from './views/ViolationDetailModal';
import { ProductRepositoryView } from './views/ProductRepositoryView';
import { InspectionHistoryView } from './views/InspectionHistoryView';
import { ViolationsView } from './views/ViolationsView';
import { AnalyticsView } from './views/AnalyticsView';
import { ComplianceReportView } from './views/ComplianceReportView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';

import { mainInspectionResult, mockInspections } from './data/mockData';
import { Inspection, ChecklistItem } from './types';
import { downloadReport, runComplianceScan, ScanFormData } from './api/nirikshak';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('running');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<ChecklistItem | null>(null);

  // Real scans returned by the OCR model, newest first
  const [scannedInspections, setScannedInspections] = useState<Inspection[]>([]);
  const allInspections = [...scannedInspections, ...mockInspections];

  const lastScanRef = useRef<ScanFormData | null>(null);
  const pendingResultRef = useRef<Inspection | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Handle Tab Change
  const handleSelectTab = (tab: NavTab) => {
    abortRef.current?.abort();
    setIsAnalyzing(false);
    // Opening "New Scan" from navigation starts a fresh scan form
    if (tab === 'new-scan') setCurrentInspection(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start analysis workflow from New Scan -> send images to the OCR backend
  const handleStartAnalysis = async (formData: ScanFormData) => {
    lastScanRef.current = formData;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    pendingResultRef.current = null;
    setAnalysisError(null);
    setAnalysisStatus('running');
    setIsAnalyzing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await runComplianceScan(formData, controller.signal);
      if (controller.signal.aborted) return;
      pendingResultRef.current = result;
      setAnalysisStatus('done');
    } catch (err) {
      if (controller.signal.aborted || (err as Error).name === 'AbortError') return;
      setAnalysisError((err as Error).message);
      setAnalysisStatus('error');
    }
  };

  // Complete analysis workflow -> show results
  const handleCompleteAnalysis = () => {
    const result = pendingResultRef.current;
    if (!result) return;
    setScannedInspections((prev) => [result, ...prev]);
    setCurrentInspection(result);
    setIsAnalyzing(false);
    setCurrentTab('new-scan'); // Show results in current active scan view or results mode
  };

  const handleCancelAnalysis = () => {
    abortRef.current?.abort();
    setIsAnalyzing(false);
    setCurrentInspection(null);
    setCurrentTab('new-scan');
  };

  // Select inspection ID from anywhere (Dashboard, History, Products, Search, Notifications)
  const handleSelectInspection = (id: string) => {
    const found = allInspections.find((i) => i.id === id) || mainInspectionResult;
    setCurrentInspection(found);
    setIsAnalyzing(false);
    setCurrentTab('new-scan'); // View inspection result screen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open report for inspection
  const handleOpenReport = (id: string) => {
    const found = allInspections.find((i) => i.id === id) || mainInspectionResult;
    setCurrentInspection(found);
    setIsAnalyzing(false);
    setCurrentTab('reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkReviewed = (remark: string) => {
    if (selectedChecklistItem) {
      // Update inspection checklist status locally
      setCurrentInspection(prev => prev && ({
        ...prev,
        officerRemarks: remark || prev.officerRemarks
      }));
      if (remark && currentInspection?.source === 'model') {
        setScannedInspections(prev =>
          prev.map(i => (i.id === currentInspection.id ? { ...i, officerRemarks: remark } : i))
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex font-sans antialiased selection:bg-blue-900 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* Header */}
        <Header
          currentTab={currentTab}
          onNavigate={handleSelectTab}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onSelectInspection={handleSelectInspection}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Active Workflow: Simulated Analysis Screen */}
          {isAnalyzing ? (
            <AnalysisView
              status={analysisStatus}
              error={analysisError}
              imageCount={lastScanRef.current ? Object.values(lastScanRef.current.images).filter(Boolean).length : 1}
              onComplete={handleCompleteAnalysis}
              onCancel={handleCancelAnalysis}
              onRetry={() => lastScanRef.current && handleStartAnalysis(lastScanRef.current)}
            />
          ) : (
            <>
              {/* Tab 1: Dashboard */}
              {currentTab === 'dashboard' && (
                <DashboardView
                  inspections={allInspections}
                  onNavigate={handleSelectTab}
                  onSelectInspection={handleSelectInspection}
                />
              )}

              {/* Tab 2: New Scan or Compliance Results */}
              {currentTab === 'new-scan' && (
                <div className="space-y-6">
                  {currentInspection ? (
                    <ResultsView
                      inspection={currentInspection}
                      onOpenViolationDetail={(item) => setSelectedChecklistItem(item)}
                      onGenerateReport={() => setCurrentTab('reports')}
                      onExportPdf={() =>
                        currentInspection.source === 'model'
                          ? downloadReport(currentInspection.id, 'pdf')
                          : alert("Sample inspection: run a real scan to download a PDF report.")
                      }
                      onReScan={() => {
                        setCurrentInspection(null);
                      }}
                    />
                  ) : (
                    <NewScanView
                      onStartAnalysis={handleStartAnalysis}
                      initialData={lastScanRef.current}
                    />
                  )}
                </div>
              )}

              {/* Tab 3: Inspection History */}
              {currentTab === 'history' && (
                <InspectionHistoryView
                  inspections={allInspections}
                  onSelectInspection={handleSelectInspection}
                  onOpenReport={handleOpenReport}
                />
              )}

              {/* Tab 4: Product Repository */}
              {currentTab === 'products' && (
                <ProductRepositoryView
                  onSelectInspection={handleSelectInspection}
                  onNavigate={handleSelectTab}
                />
              )}

              {/* Tab 5: Violations */}
              {currentTab === 'violations' && (
                <ViolationsView
                  onSelectInspection={handleSelectInspection}
                />
              )}

              {/* Tab 6: Analytics */}
              {currentTab === 'analytics' && (
                <AnalyticsView />
              )}

              {/* Tab 7: Compliance Reports */}
              {currentTab === 'reports' && (
                <ComplianceReportView
                  inspection={currentInspection || mainInspectionResult}
                  onBack={() => {
                    if (!currentInspection) setCurrentInspection(mainInspectionResult);
                    setCurrentTab('new-scan');
                  }}
                />
              )}

              {/* Tab 8: Users */}
              {currentTab === 'users' && (
                <UsersView />
              )}

              {/* Tab 9: Settings */}
              {currentTab === 'settings' && (
                <SettingsView />
              )}
            </>
          )}

        </main>
      </div>

      {/* Modal: Violation Details */}
      {selectedChecklistItem && (
        <ViolationDetailModal
          item={selectedChecklistItem}
          inspection={currentInspection || mainInspectionResult}
          onClose={() => setSelectedChecklistItem(null)}
          onMarkReviewed={handleMarkReviewed}
        />
      )}

    </div>
  );
}

export default App;
