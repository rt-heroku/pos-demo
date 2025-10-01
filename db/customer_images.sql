-- Customer Images Table
-- Stores customer profile pictures/avatars

CREATE TABLE IF NOT EXISTS customer_images (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    image_data TEXT NOT NULL, -- Base64 encoded image
    file_size INTEGER, -- Size in bytes
    width INTEGER, -- Image width in pixels
    height INTEGER, -- Image height in pixels
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_images_customer_id ON customer_images(customer_id);

-- Add comment
COMMENT ON TABLE customer_images IS 'Stores customer profile pictures and avatars';
COMMENT ON COLUMN customer_images.image_data IS 'Base64 encoded image data';
COMMENT ON COLUMN customer_images.filename IS 'Original filename of the uploaded image';
COMMENT ON COLUMN customer_images.file_size IS 'Size of the image data in bytes';
COMMENT ON COLUMN customer_images.width IS 'Image width in pixels';
COMMENT ON COLUMN customer_images.height IS 'Image height in pixels';
