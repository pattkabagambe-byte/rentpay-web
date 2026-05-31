-- Add 'partial' status to invoices
-- First check if the enum exists and add the value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'partial';
  ELSE
    -- If invoices.status is a text column, this migration is a no-op
    -- 'partial' is handled at the application layer
    NULL;
  END IF;
END $$;

-- Function to compute total paid for an invoice
CREATE OR REPLACE FUNCTION get_invoice_amount_paid(p_invoice_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM payments
  WHERE invoice_id = p_invoice_id
    AND status = 'completed';
$$;

-- View: invoices with amount_paid and amount_remaining
CREATE OR REPLACE VIEW invoices_with_payments AS
SELECT
  i.*,
  get_invoice_amount_paid(i.id) AS amount_paid,
  GREATEST(0, i.amount_due - get_invoice_amount_paid(i.id)) AS amount_remaining
FROM invoices i;

-- Grant access
GRANT SELECT ON invoices_with_payments TO authenticated;
