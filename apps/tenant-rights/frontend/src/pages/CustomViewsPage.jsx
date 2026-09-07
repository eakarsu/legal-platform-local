import React from 'react';
import Layout from '../components/Layout.jsx';
import CaseStatusChart from '../components/customViews/CaseStatusChart.jsx';
import ViolationHeatmap from '../components/customViews/ViolationHeatmap.jsx';
import TenantLetterPDF from '../components/customViews/TenantLetterPDF.jsx';
import RegulationRulesEditor from '../components/customViews/RegulationRulesEditor.jsx';

const s = {
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 6 },
  sub: { color: '#718096', marginBottom: 24, fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#1a202c', fontSize: 16, fontWeight: 700, marginBottom: 12, paddingLeft: 8, borderLeft: '4px solid #276749' },
};

export default function CustomViewsPage() {
  return (
    <Layout>
      <div data-testid="custom-views-page">
        <h1 style={s.h1}>Tenant Views</h1>
        <p style={s.sub}>Custom dashboards: case analytics, violation maps, letter generation, and jurisdictional rule editing.</p>

        <div style={s.section}>
          <div style={s.sectionTitle}>Visualizations</div>
          <div style={s.grid}>
            <CaseStatusChart />
            <ViolationHeatmap />
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Tools</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            <TenantLetterPDF />
            <RegulationRulesEditor />
          </div>
        </div>
      </div>
    </Layout>
  );
}
