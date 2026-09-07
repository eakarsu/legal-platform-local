import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewCase from './pages/NewCase.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
import JurisdictionChecker from './pages/JurisdictionChecker.jsx';
import DemandLetter from './pages/DemandLetter.jsx';
import ComplaintDraft from './pages/ComplaintDraft.jsx';
import HearingPrep from './pages/HearingPrep.jsx';
import DeadlineTracker from './pages/DeadlineTracker.jsx';
import EvidenceLocker from './pages/EvidenceLocker.jsx';
import EvidenceOrganizer from './pages/EvidenceOrganizer.jsx';
import SettlementCalculator from './pages/SettlementCalculator.jsx';
import CourtProcedureChecklist from './pages/CourtProcedureChecklist.jsx';
import WitnessStatementGuide from './pages/WitnessStatementGuide.jsx';
import AppealAssessment from './pages/AppealAssessment.jsx';
import CustomViewsPage from './pages/CustomViewsPage.jsx';
import JudgmentCollectionTracker from './pages/JudgmentCollectionTracker.jsx';

// CF features
import CfCaseEvaluationSettlementGuidance from './pages/CfCaseEvaluationSettlementGuidance';
import CfJurisdictionspecificPlaybook from './pages/CfJurisdictionspecificPlaybook';
import CfEvidencePresentationOptimizer from './pages/CfEvidencePresentationOptimizer';
import CfOpponentResearch from './pages/CfOpponentResearch';
import CfProSeLitigantCoaching from './pages/CfProSeLitigantCoaching';
import CfPostjudgmentCollectionGuidance from './pages/CfPostjudgmentCollectionGuidance';

// Codex & insights
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';
import TimelineView from './pages/TimelineView';

// Gap feature pages
import GapNoEvidenceorganizer from './pages/GapNoEvidenceorganizer';
import GapNoWitnessstatementguide from './pages/GapNoWitnessstatementguide';
import GapNoSettlementcalculatorCasevalueEstimator from './pages/GapNoSettlementcalculatorCasevalueEstimator';
import GapNoCourtprocedurechecklistPerjurisdiction from './pages/GapNoCourtprocedurechecklistPerjurisdiction';
import GapNoAppealassessment from './pages/GapNoAppealassessment';
import GapNoCaseTrackingBeyondCrudNoHearingRemi from './pages/GapNoCaseTrackingBeyondCrudNoHearingRemi';
import GapNoFeeScheduleLookupFilingFeesByCourt from './pages/GapNoFeeScheduleLookupFilingFeesByCourt';
import GapNoStatuteOfLimitationsChecker from './pages/GapNoStatuteOfLimitationsChecker';
import GapNoLegalCitationLibrary from './pages/GapNoLegalCitationLibrary';
import GapNoEfilingIntegrationTylerEfiletexas from './pages/GapNoEfilingIntegrationTylerEfiletexas';
import GapNoNotificationscalendarReminders from './pages/GapNoNotificationscalendarReminders';
import GapNoPaymentProcessingForCourtFees from './pages/GapNoPaymentProcessingForCourtFees';
import GapNoAuditLogRbac from './pages/GapNoAuditLogRbac';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/cases/new" element={<PrivateRoute><NewCase /></PrivateRoute>} />
        <Route path="/cases/:id" element={<PrivateRoute><CaseDetail /></PrivateRoute>} />
        <Route path="/cases/:id/jurisdiction" element={<PrivateRoute><JurisdictionChecker /></PrivateRoute>} />
        <Route path="/cases/:id/demand-letter" element={<PrivateRoute><DemandLetter /></PrivateRoute>} />
        <Route path="/cases/:id/complaint" element={<PrivateRoute><ComplaintDraft /></PrivateRoute>} />
        <Route path="/cases/:id/hearing-prep" element={<PrivateRoute><HearingPrep /></PrivateRoute>} />
        <Route path="/cases/:id/deadlines" element={<PrivateRoute><DeadlineTracker /></PrivateRoute>} />
        <Route path="/cases/:id/evidence" element={<PrivateRoute><EvidenceLocker /></PrivateRoute>} />
        <Route path="/cases/:id/evidence-organizer" element={<PrivateRoute><EvidenceOrganizer /></PrivateRoute>} />
        <Route path="/cases/:id/settlement-calculator" element={<PrivateRoute><SettlementCalculator /></PrivateRoute>} />
        <Route path="/cases/:id/court-procedure-checklist" element={<PrivateRoute><CourtProcedureChecklist /></PrivateRoute>} />
        <Route path="/evidence-organizer" element={<PrivateRoute><EvidenceOrganizer /></PrivateRoute>} />
        <Route path="/settlement-calculator" element={<PrivateRoute><SettlementCalculator /></PrivateRoute>} />
        <Route path="/court-procedure-checklist" element={<PrivateRoute><CourtProcedureChecklist /></PrivateRoute>} />
        <Route path="/cases/:id/witness-statement-guide" element={<PrivateRoute><WitnessStatementGuide /></PrivateRoute>} />
        <Route path="/cases/:id/appeal-assessment" element={<PrivateRoute><AppealAssessment /></PrivateRoute>} />
        <Route path="/witness-statement-guide" element={<PrivateRoute><WitnessStatementGuide /></PrivateRoute>} />
        <Route path="/appeal-assessment" element={<PrivateRoute><AppealAssessment /></PrivateRoute>} />
        <Route path="/custom-views" element={<PrivateRoute><CustomViewsPage /></PrivateRoute>} />
        <Route path="/judgment-collection-tracker" element={<PrivateRoute><JudgmentCollectionTracker /></PrivateRoute>} />

        {/* CF features */}
        <Route path="/cf-case-evaluation-settlement-guidance" element={<CfCaseEvaluationSettlementGuidance />} />
        <Route path="/cf-jurisdictionspecific-playbook" element={<CfJurisdictionspecificPlaybook />} />
        <Route path="/cf-evidence-presentation-optimizer" element={<CfEvidencePresentationOptimizer />} />
        <Route path="/cf-opponent-research" element={<CfOpponentResearch />} />
        <Route path="/cf-pro-se-litigant-coaching" element={<CfProSeLitigantCoaching />} />
        <Route path="/cf-postjudgment-collection-guidance" element={<CfPostjudgmentCollectionGuidance />} />

        {/* Gap feature routes */}
        <Route path="/gap-no-evidenceorganizer" element={<GapNoEvidenceorganizer />} />
        <Route path="/gap-no-witnessstatementguide" element={<GapNoWitnessstatementguide />} />
        <Route path="/gap-no-settlementcalculator-casevalue-estimator" element={<GapNoSettlementcalculatorCasevalueEstimator />} />
        <Route path="/gap-no-courtprocedurechecklist-perjurisdiction" element={<GapNoCourtprocedurechecklistPerjurisdiction />} />
        <Route path="/gap-no-appealassessment" element={<GapNoAppealassessment />} />
        <Route path="/gap-no-case-tracking-beyond-crud-no-hearing-remi" element={<GapNoCaseTrackingBeyondCrudNoHearingRemi />} />
        <Route path="/gap-no-fee-schedule-lookup-filing-fees-by-court" element={<GapNoFeeScheduleLookupFilingFeesByCourt />} />
        <Route path="/gap-no-statute-of-limitations-checker" element={<GapNoStatuteOfLimitationsChecker />} />
        <Route path="/gap-no-legal-citation-library" element={<GapNoLegalCitationLibrary />} />
        <Route path="/gap-no-efiling-integration-tyler-efiletexas" element={<GapNoEfilingIntegrationTylerEfiletexas />} />
        <Route path="/gap-no-notificationscalendar-reminders" element={<GapNoNotificationscalendarReminders />} />
        <Route path="/gap-no-payment-processing-for-court-fees" element={<GapNoPaymentProcessingForCourtFees />} />
        <Route path="/gap-no-audit-log-rbac" element={<GapNoAuditLogRbac />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
