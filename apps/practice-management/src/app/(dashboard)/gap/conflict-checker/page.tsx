// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapConflictCheckerPage() {
  return (
    <GapFeaturePage
      title="Conflict Checker"
      description="Conflict Checker"
      slug="conflict-checker"
      aiResultKey="conflicts"
      fields={[{"name":"prospectName","label":"Prospect Name","required":true,"placeholder":""},{"name":"existingClients","label":"Existing Clients (JSON)","type":"json"}]}
    />
  );
}
