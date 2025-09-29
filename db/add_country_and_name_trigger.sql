-- Add country column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country varchar(100) NULL;

-- Create or replace function to update customer name
CREATE OR REPLACE FUNCTION update_customer_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the name field with first_name + ' ' + last_name
    NEW.name = TRIM(CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update name field
DROP TRIGGER IF EXISTS trigger_update_customer_name ON public.customers;
CREATE TRIGGER trigger_update_customer_name
    BEFORE INSERT OR UPDATE OF first_name, last_name ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_name();

-- Update existing records to have the name field populated
UPDATE public.customers 
SET name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE name IS NULL OR name = '';

