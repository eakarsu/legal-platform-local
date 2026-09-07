import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Clients from './pages/Clients';
import Documents from './pages/Documents';
import Visas from './pages/Visas';
import Deadlines from './pages/Deadlines';
import Billing from './pages/Billing';
import Notes from './pages/Notes';
import Forms from './pages/Forms';
import Compliance from './pages/Compliance';
import StatusTracking from './pages/StatusTracking';
import AIFeatures from './pages/AIFeatures';
import AdvancedAITools from './pages/AdvancedAITools';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Layout from './components/Layout';
import CustomViewsPage from './pages/CustomViewsPage';
import UscisReceiptNoticeTracker from './pages/UscisReceiptNoticeTracker';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticCaseManagerAutoGeneratingDoc from './pages/CfAgenticCaseManagerAutoGeneratingDoc';
import CfInterviewPreparationAiWithPracticeQ from './pages/CfInterviewPreparationAiWithPracticeQ';
import CfImmigrationPathwayOptimizerAnalyzing from './pages/CfImmigrationPathwayOptimizerAnalyzing';
import CfRfeAutoDetectorMonitoringUscisTrack from './pages/CfRfeAutoDetectorMonitoringUscisTrack';
import CfMultilingualDocumentSupportWithAuto from './pages/CfMultilingualDocumentSupportWithAuto';
import CfPeerCaseAnalyticsSurfacingAnonymized from './pages/CfPeerCaseAnalyticsSurfacingAnonymized';
import GapNoVisaCategoryRecommendationEngine from './pages/GapNoVisaCategoryRecommendationEngine';
import GapNoInterviewPreparationAi from './pages/GapNoInterviewPreparationAi';
import GapNoMultilingualTranslationRouting from './pages/GapNoMultilingualTranslationRouting';
import GapNoRfeAutoResponseDrafter from './pages/GapNoRfeAutoResponseDrafter';
import GapNoClientPortalStatusTrackingDocumen from './pages/GapNoClientPortalStatusTrackingDocumen';
import GapLimitedUscisIntegrationOnlyStubsIn from './pages/GapLimitedUscisIntegrationOnlyStubsIn';
import GapNoDocumentVaultWithFieldLevel from './pages/GapNoDocumentVaultWithFieldLevel';
import GapNoESignatureIntegration from './pages/GapNoESignatureIntegration';
import GapLimitedNotificationsModule0Explicit from './pages/GapLimitedNotificationsModule0Explicit';
import GapNoWebhookSurfaceForCaseEvent from './pages/GapNoWebhookSurfaceForCaseEvent';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/visas" element={<Visas />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/status-tracking" element={<StatusTracking />} />
          <Route path="/ai" element={<AIFeatures />} />
          <Route path="/advanced-ai" element={<AdvancedAITools />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          <Route path="/uscis-receipt-notice-tracker" element={<UscisReceiptNoticeTracker />} />
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-case-manager-auto-generating-doc" element={<CfAgenticCaseManagerAutoGeneratingDoc />} />
          <Route path="/cf-interview-preparation-ai-with-practice-q" element={<CfInterviewPreparationAiWithPracticeQ />} />
          <Route path="/cf-immigration-pathway-optimizer-analyzing-" element={<CfImmigrationPathwayOptimizerAnalyzing />} />
          <Route path="/cf-rfe-auto-detector-monitoring-uscis-track" element={<CfRfeAutoDetectorMonitoringUscisTrack />} />
          <Route path="/cf-multilingual-document-support-with-auto-" element={<CfMultilingualDocumentSupportWithAuto />} />
          <Route path="/cf-peer-case-analytics-surfacing-anonymized" element={<CfPeerCaseAnalyticsSurfacingAnonymized />} />
          <Route path="/gap-no-visa-category-recommendation-engine" element={<GapNoVisaCategoryRecommendationEngine />} />
          <Route path="/gap-no-interview-preparation-ai" element={<GapNoInterviewPreparationAi />} />
          <Route path="/gap-no-multilingual-translation-routing" element={<GapNoMultilingualTranslationRouting />} />
          <Route path="/gap-no-rfe-auto-response-drafter" element={<GapNoRfeAutoResponseDrafter />} />
          <Route path="/gap-no-client-portal-status-tracking-documen" element={<GapNoClientPortalStatusTrackingDocumen />} />
          <Route path="/gap-limited-uscis-integration-only-stubs-in" element={<GapLimitedUscisIntegrationOnlyStubsIn />} />
          <Route path="/gap-no-document-vault-with-field-level" element={<GapNoDocumentVaultWithFieldLevel />} />
          <Route path="/gap-no-e-signature-integration" element={<GapNoESignatureIntegration />} />
          <Route path="/gap-limited-notifications-module-0-explicit-" element={<GapLimitedNotificationsModule0Explicit />} />
          <Route path="/gap-no-webhook-surface-for-case-event" element={<GapNoWebhookSurfaceForCaseEvent />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
