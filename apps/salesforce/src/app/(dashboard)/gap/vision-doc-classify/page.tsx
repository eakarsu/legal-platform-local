// === Batch 11 Gaps & Frontend Mounts ===
'use client';
import GapFeaturePage from '@/components/GapFeaturePage';
export default function GapVisionDocClassifyPage() {
  return (
    <GapFeaturePage
      title="Vision-Based Document Classifier"
      description="Vision-Based Document Classifier"
      slug="vision-doc-classify"
      aiResultKey="classification"
      fields={[{"name":"imageDescription","label":"Image Description / OCR Text","type":"textarea","rows":4,"required":true}]}
    />
  );
}
