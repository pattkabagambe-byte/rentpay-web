import { LegalPageShell, legalMetadata } from '@/components/legal-page'

export const metadata = legalMetadata(
  'Privacy Policy',
  '/privacy',
  'How RentPilot collects, uses, and protects your personal information.'
)

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="Last updated: May 2026. Operated by Potentia-Motus Ventures (RentPilot)."
    >
      <p>
        RentPilot (&quot;we&quot;, &quot;us&quot;) provides rent management and payment services for landlords
        and tenants in Uganda. This policy explains what data we collect and how we use it when you use
        rentpay.cc (RentPilot) and our related applications.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account details: name, email, phone number, and profile information you provide during onboarding.</li>
        <li>Identity verification: National ID (NIN) when submitted for tenancy verification.</li>
        <li>Property and tenancy data: units, leases, invoices, maintenance requests, and messages.</li>
        <li>Payment data: transaction references and amounts processed via Yo! Payments (we do not store mobile money PINs or card numbers).</li>
        <li>Technical data: device/browser information and logs used for security and fraud prevention.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To operate your account and provide rent collection, invoicing, and tenancy management.</li>
        <li>To connect landlords and tenants linked to the same property or invite code.</li>
        <li>To process payments and send receipts and notifications.</li>
        <li>To improve security, prevent abuse, and comply with applicable law.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We share data only as needed to provide the service: with your landlord or tenant (for shared
        tenancy records), with payment processors (Yo! Payments Uganda), and with infrastructure providers
        (hosting and database services). We do not sell your personal information.
      </p>

      <h2>Storage and security</h2>
      <p>
        Data is stored on secure cloud infrastructure with encryption in transit. Access is restricted by
        role-based permissions and row-level security policies. You are responsible for keeping your login
        credentials confidential.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access, correction, or deletion of your account data via Settings or by emailing
        support@rentpay.cc. We will respond within a reasonable time as required by applicable law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be posted on this page with an
        updated date.
      </p>
    </LegalPageShell>
  )
}
