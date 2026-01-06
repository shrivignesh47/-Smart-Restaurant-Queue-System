-- Add scanner_access_key column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN scanner_access_key VARCHAR(20) DEFAULT NULL,
ADD COLUMN scanner_key_updated_at TIMESTAMP NULL;

-- Add index for faster lookups
CREATE INDEX idx_scanner_key ON restaurants(scanner_access_key);
