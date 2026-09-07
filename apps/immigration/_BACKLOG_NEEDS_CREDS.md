# Backlog: Needs Credentials — AIImmigrationCaseManager

Apply pass 5 stubs. Legal disclaimer is preserved on every payload.

## USCIS — case status tracking
- **Endpoint:** `GET /api/integrations/uscis/case-status/:receipt`
- **Env:** `USCIS_API_BASE`, `USCIS_API_KEY`
- **Wire-up TODO:** USCIS Egov / Case Status Online integration; map status
  codes to local `status-tracking` schema; webhook RFE detection.

## Stripe — client billing
- **Endpoint:** `POST /api/integrations/stripe/charge`
- **Env:** `STRIPE_SECRET_KEY`
- **Wire-up TODO:** PaymentIntent for retainer + USCIS filing fees;
  trust-account ledger integration with `billing.js`.

## DocuSign — engagement letters / form signing
- **Endpoint:** `POST /api/integrations/docusign/envelope`
- **Env:** `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_ACCOUNT_ID`,
  `DOCUSIGN_PRIVATE_KEY`
- **Wire-up TODO:** JWT consent flow; envelope creation; webhook for
  signed-event back-write to `documents` table.

## External translation provider
- **Endpoint:** `POST /api/integrations/translation/external`
- **Env:** `TRANSLATION_PROVIDER`, `TRANSLATION_API_KEY`
- **Wire-up TODO:** DeepL / Google Translate / AWS Translate adapter for
  bulk content; keep `/api/ai/translate` for nuance + legal context.

## Backlog NOT mechanical (deferred)

- **Client portal scope** — NEEDS-PRODUCT-DECISION on UX + auth model.
- **Peer case analytics** — NEEDS-PRODUCT-DECISION on anonymization scope.
- **Document vault encryption** — NEEDS-PRODUCT-DECISION on key management
  (KMS vs. envelope encryption vs. customer-managed).
- **Agentic case manager autonomy** — NEEDS-PRODUCT-DECISION; legal-review
  gate required.
