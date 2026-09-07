// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapLegalResearchPage() {
  return (
    <GapFeaturePage
      title="Legal Research & Briefing"
      description="Legal Research & Briefing"
      slug="legal-research"
      aiResultKey="brief"
      fields={[{"name":"question","label":"Question","type":"textarea","rows":4,"required":true}]}
    />
  );
}
