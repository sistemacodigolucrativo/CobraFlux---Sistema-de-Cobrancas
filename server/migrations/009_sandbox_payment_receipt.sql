-- Payment receipts are only trusted after a received sandbox payment was verified with the PSP.
ALTER TABLE sandbox_issuances ADD COLUMN payment_receipt_url text;
