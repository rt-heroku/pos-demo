-- Add first_name and last_name fields to customers table
-- This migration adds the new fields and populates them from existing name data

-- Add the new columns
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Update existing records to split the name field
UPDATE customers 
SET 
    first_name = CASE 
        WHEN name IS NOT NULL AND name != '' THEN 
            TRIM(SPLIT_PART(name, ' ', 1))
        ELSE NULL 
    END,
    last_name = CASE 
        WHEN name IS NOT NULL AND name != '' AND POSITION(' ' IN name) > 0 THEN 
            TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1))
        ELSE NULL 
    END
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name and last_name NOT NULL for new records going forward
-- Note: We'll handle this in the application layer to avoid breaking existing data
