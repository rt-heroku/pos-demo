-- Create tables for the POS system

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(10) DEFAULT '📦',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount_received DECIMAL(10,2),
    change_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Insert sample products
INSERT INTO products (name, price, category, stock, image) VALUES
('Coffee', 4.50, 'Beverages', 50, '☕'),
('Sandwich', 8.99, 'Food', 25, '🥪'),
('Croissant', 3.75, 'Food', 15, '🥐'),
('Juice', 3.25, 'Beverages', 30, '🧃'),
('Muffin', 2.99, 'Food', 20, '🧁'),
('Tea', 3.50, 'Beverages', 40, '🍵'),
('Salad', 12.50, 'Food', 12, '🥗'),
('Water', 1.99, 'Beverages', 100, '💧');

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES
('John Doe', 'john@email.com', '555-0123'),
('Jane Smith', 'jane@email.com', '555-0456');