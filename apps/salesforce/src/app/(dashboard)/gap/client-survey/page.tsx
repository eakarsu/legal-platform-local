// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapClientSurveyPage() {
  return (
    <GapFeaturePage
      title="Client Satisfaction Survey"
      description="Client Satisfaction Survey"
      slug="client-survey"
      aiResultKey="survey"
      fields={[{"name":"clientId","label":"Client ID","required":true,"placeholder":""},{"name":"score","label":"Score","type":"number"}]}
    />
  );
}
