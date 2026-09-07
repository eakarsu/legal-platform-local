// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapMalpracticeInsurancePage() {
  return (
    <GapFeaturePage
      title="Malpractice Insurance"
      description="Malpractice Insurance"
      slug="malpractice-insurance"
      aiResultKey="policy"
      fields={[{"name":"attorneyId","label":"Attorney ID","required":true,"placeholder":""},{"name":"policyNumber","label":"Policy #","required":false,"placeholder":""}]}
    />
  );
}
