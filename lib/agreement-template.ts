export function generateTenancyAgreement({
  landlordName,
  tenantName,
  propertyName,
  unitLabel,
  rentAmount,
  currency,
  startDate,
  address
}: {
  landlordName: string;
  tenantName: string;
  propertyName: string;
  unitLabel: string;
  rentAmount: number;
  currency: string;
  startDate: string;
  address: string;
}) {
  return `
TENANCY AGREEMENT

This Tenancy Agreement is made on ${new Date().toLocaleDateString()} between:

LANDLORD: ${landlordName} (hereinafter referred to as "the Landlord")
TENANT: ${tenantName} (hereinafter referred to as "the Tenant")

1. THE PROPERTY
The Landlord agrees to let and the Tenant agrees to take the premises known as ${unitLabel} at ${propertyName}, located at ${address} (hereinafter referred to as "the Property").

2. TERM
The tenancy shall commence on ${new Date(startDate).toLocaleDateString()} and shall continue on a month-to-month basis until terminated by either party giving one month's written notice.

3. RENT
The rent for the Property shall be ${currency} ${rentAmount.toLocaleString()} per month, payable in advance on the due date of each month through the RentPilot platform.

4. TENANT'S OBLIGATIONS
The Tenant agrees:
a) To pay the rent on time.
b) To keep the interior of the Property in good and clean condition.
c) Not to make any alterations to the Property without the Landlord's written consent.
d) To use the Property for residential purposes only.

5. LANDLORD'S OBLIGATIONS
The Landlord agrees:
a) To keep the structure and exterior of the Property in good repair.
b) To allow the Tenant quiet enjoyment of the Property provided the Tenant complies with this Agreement.

6. TERMINATION
Either party may terminate this agreement by giving thirty (30) days notice.

Signed by:

Landlord: __________________________    Date: __________

Tenant: ___________________________    Date: __________
  `.trim();
}
