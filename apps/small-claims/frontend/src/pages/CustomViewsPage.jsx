import React from 'react';
import Layout from '../components/Layout.jsx';
import CasePipelineChart from '../components/CasePipelineChart.jsx';
import CourtScheduleHeatmap from '../components/CourtScheduleHeatmap.jsx';
import FilingTemplatePDF from '../components/FilingTemplatePDF.jsx';
import ProceduralRulesEditor from '../components/ProceduralRulesEditor.jsx';

export default function CustomViewsPage() {
  return (
    <Layout>
      <h1 style={{ color: '#1a365d', marginBottom: 4 }}>Court Views</h1>
      <p style={{ color: '#718096', marginTop: 0, marginBottom: 24 }}>
        Custom dashboards and tooling for case status, court schedules, filing templates, and procedural rules.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <CasePipelineChart />
        <CourtScheduleHeatmap />
        <FilingTemplatePDF />
        <ProceduralRulesEditor />
      </div>
    </Layout>
  );
}
