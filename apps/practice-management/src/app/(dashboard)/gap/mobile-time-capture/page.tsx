// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapMobileTimeCapturePage() {
  return (
    <GapFeaturePage
      title="Mobile Time Capture App"
      description="Mobile Time Capture App"
      slug="mobile-time-capture"
      aiResultKey="entry"
      fields={[{"name":"attorneyId","label":"Attorney ID","required":true,"placeholder":""},{"name":"minutes","label":"Minutes","type":"number"}]}
    />
  );
}
