import React from 'react';
import CasePipelineFunnel from '../components/CasePipelineFunnel';
import VisaStatusHeatmap from '../components/VisaStatusHeatmap';
import CaseFilePdf from '../components/CaseFilePdf';
import DeadlineRulesEditor from '../components/DeadlineRulesEditor';

function CustomViewsPage() {
  return (
    <div style={{ padding: 24 }} data-testid="custom-views-page">
      <h1 style={{ marginTop: 0 }}>Case Views</h1>
      <p style={{ color: '#64748b' }}>Operational insights, exports, and deadline rule configuration for immigration cases.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <CasePipelineFunnel />
        <VisaStatusHeatmap />
        <CaseFilePdf />
        <DeadlineRulesEditor />
      </div>
    </div>
  );
}

export default CustomViewsPage;
