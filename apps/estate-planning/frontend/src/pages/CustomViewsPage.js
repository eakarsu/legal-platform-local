import React from 'react';
import AssetDistributionDonut from '../components/customViews/AssetDistributionDonut';
import HeirAllocationHeatmap from '../components/customViews/HeirAllocationHeatmap';
import WillTrustSummaryPDF from '../components/customViews/WillTrustSummaryPDF';
import AllocationRulesEditor from '../components/customViews/AllocationRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page" style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Estate Views</h1>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>
          Custom analytics and editorial tools for estate distribution: asset breakdown, heir
          allocation heatmap, will/trust summary export, and distribution rules editor.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        <AssetDistributionDonut />
        <HeirAllocationHeatmap />
        <WillTrustSummaryPDF />
        <AllocationRulesEditor />
      </div>
    </div>
  );
}
