// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapDocusignAdapterPage() {
  return (
    <GapFeaturePage
      title="DocuSign Adapter"
      description="DocuSign Adapter"
      slug="docusign-adapter"
      aiResultKey="envelope"
      fields={[{"name":"docId","label":"Doc ID","required":true,"placeholder":""},{"name":"signerEmail","label":"Signer Email","required":false,"placeholder":""}]}
    />
  );
}
