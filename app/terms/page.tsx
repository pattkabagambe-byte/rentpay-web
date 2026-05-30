import { LegalPageShell, legalMetadata } from '@/components/legal-page'

export const metadata = legalMetadata(
  'Terms of Service',
  '/terms',
  'Terms governing use of the RentPay platform in Uganda.'
)

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description="Last updated: May 2026. By using RentPay you agree to these terms."
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of RentPay at rentpay.cc and related
        services operated by Potentia-Motus Ventures. If you do not agree, do not use the platform.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 18 years old and able to enter a binding agreement under Ugandan law. You are
        responsible for the accuracy of information you provide during registration and onboarding.
      </p>

      <h2>Accounts and roles</h2>
      <p>
        Users may register as landlords, tenants, or both. You must use the platform only for lawful rental
        and payment activities. You are responsible for activity under your account and for safeguarding your
        credentials.
      </p>

      <h2>Payments</h2>
      <p>
        Rent payments are processed through third-party payment providers (including Yo! Payments Uganda).
        RentPay facilitates invoicing and payment tracking but is not a bank. Payment disputes between
        landlords and tenants should be resolved between the parties; we may assist with transaction records
        where available.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not upload false, misleading, or fraudulent tenancy or identity information.</li>
        <li>Do not attempt to access another user&apos;s data without authorization.</li>
        <li>Do not interfere with platform security or abuse payment or messaging features.</li>
      </ul>

      <h2>Content and documents</h2>
      <p>
        You retain ownership of documents and data you upload. You grant RentPay a limited license to store,
        display, and process that content solely to provide the service to you and connected parties (e.g.
        your landlord or tenant).
      </p>

      <h2>Limitation of liability</h2>
      <p>
        RentPay is provided &quot;as is&quot; to the extent permitted by law. We are not liable for indirect
        damages, loss of rent, or disputes arising from tenancy relationships. Our total liability for any
        claim related to the service is limited to fees you paid us in the twelve months before the claim
        (or UGX 0 during free early access).
      </p>

      <h2>Termination</h2>
      <p>
        You may close your account via Settings. We may suspend or terminate accounts that violate these
        Terms or pose a security risk. Provisions that by nature should survive termination (including
        payment records and liability limits) will survive.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Uganda. Disputes shall be subject to the
        exclusive jurisdiction of courts in Uganda unless otherwise required by mandatory law.
      </p>
    </LegalPageShell>
  )
}
