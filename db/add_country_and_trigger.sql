-- Add country field to customers table
-- This script adds the country field and creates a trigger to merge first_name and last_name

-- Add country column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Create or replace function to merge first_name and last_name into name
CREATE OR REPLACE FUNCTION merge_customer_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Merge first_name and last_name into name field
    IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
        NEW.name = TRIM(NEW.first_name || ' ' || NEW.last_name);
    ELSIF NEW.first_name IS NOT NULL THEN
        NEW.name = TRIM(NEW.first_name);
    ELSIF NEW.last_name IS NOT NULL THEN
        NEW.name = TRIM(NEW.last_name);
    END IF;
    
    -- Ensure name is not empty
    IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
        NEW.name = 'Unknown Customer';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically merge names
DROP TRIGGER IF EXISTS trigger_merge_customer_names ON customers;
CREATE TRIGGER trigger_merge_customer_names
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION merge_customer_names();

-- Update existing records to merge their names
UPDATE customers 
SET name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

-- Clean up any empty names
UPDATE customers 
SET name = 'Unknown Customer'
WHERE name IS NULL OR TRIM(name) = '';

-- Add comment to the country column
COMMENT ON COLUMN customers.country IS 'Country of residence for the customer';
