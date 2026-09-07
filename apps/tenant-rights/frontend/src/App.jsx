import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewTenancy from './pages/NewTenancy.jsx';
import TenancyDetail from './pages/TenancyDetail.jsx';
import LeaseAnalyzer from './pages/LeaseAnalyzer.jsx';
import NoticeGenerator from './pages/NoticeGenerator.jsx';
import EvictionDefense from './pages/EvictionDefense.jsx';
import RentIncreaseCheck from './pages/RentIncreaseCheck.jsx';
import MediationPrep from './pages/MediationPrep.jsx';
import IssueTracker from './pages/IssueTracker.jsx';
import CaseOutcome from './pages/CaseOutcome.jsx';
import LocalLawLookup from './pages/LocalLawLookup.jsx';
import NegotiationSimulator from './pages/NegotiationSimulator.jsx';
import DocumentAssembly from './pages/DocumentAssembly.jsx';
import LegalResourceDirectory from './pages/LegalResourceDirectory.jsx';
import LegalExpertChat from './pages/LegalExpertChat.jsx';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// === Batch 08 Gaps & Frontend Mounts ===
import CfLocalLawAdaptationCustomizingAdviceByState from './pages/CfLocalLawAdaptationCustomizingAdviceByState'
import CfCaseOutcomePredictionEstimatingEvictionDefenseSuccess from './pages/CfCaseOutcomePredictionEstimatingEvictionDefenseSuccess'
import CfResourceDirectoryLinkingToLegalAidTenant from './pages/CfResourceDirectoryLinkingToLegalAidTenant'
import CfNegotiationSimulationWithAiRolePlayFor from './pages/CfNegotiationSimulationWithAiRolePlayFor'
import CfDocumentAssemblyAutoFillingFormsWithTenant from './pages/CfDocumentAssemblyAutoFillingFormsWithTenant'
import CfDeadlineTrackerWithNotificationsForNoticeResponse from './pages/CfDeadlineTrackerWithNotificationsForNoticeResponse'
import GapNoAiDrivenCaseOutcomePrediction from './pages/GapNoAiDrivenCaseOutcomePrediction'
import GapNoLocalLawVariationAdaptationEngine from './pages/GapNoLocalLawVariationAdaptationEngine'
import GapNoConversationalTenantRightsChatbotBeyondCore from './pages/GapNoConversationalTenantRightsChatbotBeyondCore'
import GapNoLocalLegalResourceDatabaseLegalAid from './pages/GapNoLocalLegalResourceDatabaseLegalAid'
import GapNoIntegrationWithLocalStatutesRentControl from './pages/GapNoIntegrationWithLocalStatutesRentControl'
import GapNoFormCompletionHelpersInteractiveInterview from './pages/GapNoFormCompletionHelpersInteractiveInterview'
import GapNoChatWithLegalExpertEscalation from './pages/GapNoChatWithLegalExpertEscalation'
import GapNoNotificationsOrRemindersForDeadlinesE from './pages/GapNoNotificationsOrRemindersForDeadlinesE'
import GapNoAuditLogging from './pages/GapNoAuditLogging'
import GapNoIntegrationsModule from './pages/GapNoIntegrationsModule'
import GapNoMultiLanguageSupportRoutes from './pages/GapNoMultiLanguageSupportRoutes'
import CustomViewsPage from './pages/CustomViewsPage.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}
const ProtectedRoute = PrivateRoute;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tenancies/new" element={<PrivateRoute><NewTenancy /></PrivateRoute>} />
        <Route path="/tenancies/:id" element={<PrivateRoute><TenancyDetail /></PrivateRoute>} />
        <Route path="/tenancies/:id/lease-analyzer" element={<PrivateRoute><LeaseAnalyzer /></PrivateRoute>} />
        <Route path="/tenancies/:id/notice" element={<PrivateRoute><NoticeGenerator /></PrivateRoute>} />
        <Route path="/tenancies/:id/eviction-defense" element={<PrivateRoute><EvictionDefense /></PrivateRoute>} />
        <Route path="/tenancies/:id/rent-check" element={<PrivateRoute><RentIncreaseCheck /></PrivateRoute>} />
        <Route path="/tenancies/:id/mediation" element={<PrivateRoute><MediationPrep /></PrivateRoute>} />
        <Route path="/tenancies/:id/issues" element={<PrivateRoute><IssueTracker /></PrivateRoute>} />
        <Route path="/case-outcome" element={<PrivateRoute><CaseOutcome /></PrivateRoute>} />
        <Route path="/local-law-lookup" element={<PrivateRoute><LocalLawLookup /></PrivateRoute>} />
        <Route path="/negotiation-simulator" element={<PrivateRoute><NegotiationSimulator /></PrivateRoute>} />
        <Route path="/document-assembly" element={<PrivateRoute><DocumentAssembly /></PrivateRoute>} />
        <Route path="/legal-resource-directory" element={<PrivateRoute><LegalResourceDirectory /></PrivateRoute>} />
        <Route path="/legal-expert-chat" element={<PrivateRoute><LegalExpertChat /></PrivateRoute>} />
        {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-local-law-adaptation-customizing-advice-by-state-city" element={<ProtectedRoute><CfLocalLawAdaptationCustomizingAdviceByState /></ProtectedRoute>} />
      <Route path="/cf-case-outcome-prediction-estimating-eviction-defense-success-probability" element={<ProtectedRoute><CfCaseOutcomePredictionEstimatingEvictionDefenseSuccess /></ProtectedRoute>} />
      <Route path="/cf-resource-directory-linking-to-legal-aid-tenant-unions" element={<ProtectedRoute><CfResourceDirectoryLinkingToLegalAidTenant /></ProtectedRoute>} />
      <Route path="/cf-negotiation-simulation-with-ai-role-play-for-mediation-practice" element={<ProtectedRoute><CfNegotiationSimulationWithAiRolePlayFor /></ProtectedRoute>} />
      <Route path="/cf-document-assembly-auto-filling-forms-with-tenant-data" element={<ProtectedRoute><CfDocumentAssemblyAutoFillingFormsWithTenant /></ProtectedRoute>} />
      <Route path="/cf-deadline-tracker-with-notifications-for-notice-response-windows" element={<ProtectedRoute><CfDeadlineTrackerWithNotificationsForNoticeResponse /></ProtectedRoute>} />
      <Route path="/gap-no-ai-driven-case-outcome-prediction" element={<ProtectedRoute><GapNoAiDrivenCaseOutcomePrediction /></ProtectedRoute>} />
      <Route path="/gap-no-local-law-variation-adaptation-engine" element={<ProtectedRoute><GapNoLocalLawVariationAdaptationEngine /></ProtectedRoute>} />
      <Route path="/gap-no-conversational-tenant-rights-chatbot-beyond-core-ai-endpoints" element={<ProtectedRoute><GapNoConversationalTenantRightsChatbotBeyondCore /></ProtectedRoute>} />
      <Route path="/gap-no-local-legal-resource-database-legal-aid-tenant" element={<ProtectedRoute><GapNoLocalLegalResourceDatabaseLegalAid /></ProtectedRoute>} />
      <Route path="/gap-no-integration-with-local-statutes-rent-control-habitability" element={<ProtectedRoute><GapNoIntegrationWithLocalStatutesRentControl /></ProtectedRoute>} />
      <Route path="/gap-no-form-completion-helpers-interactive-interview" element={<ProtectedRoute><GapNoFormCompletionHelpersInteractiveInterview /></ProtectedRoute>} />
      <Route path="/gap-no-chat-with-legal-expert-escalation" element={<ProtectedRoute><GapNoChatWithLegalExpertEscalation /></ProtectedRoute>} />
      <Route path="/gap-no-notifications-or-reminders-for-deadlines-e-g" element={<ProtectedRoute><GapNoNotificationsOrRemindersForDeadlinesE /></ProtectedRoute>} />
      <Route path="/gap-no-audit-logging" element={<ProtectedRoute><GapNoAuditLogging /></ProtectedRoute>} />
      <Route path="/gap-no-integrations-module" element={<ProtectedRoute><GapNoIntegrationsModule /></ProtectedRoute>} />
      <Route path="/gap-no-multi-language-support-routes" element={<ProtectedRoute><GapNoMultiLanguageSupportRoutes /></ProtectedRoute>} />
      <Route path="/custom-views" element={<PrivateRoute><CustomViewsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
