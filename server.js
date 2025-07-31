const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Utility function to calculate points (1 point per dollar spent)
const calculatePoints = (total) => Math.floor(total);

// API Routes

// Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category, stock, image } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, price, category, stock, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, category, stock, image || '📦']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, stock, image } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, category = $3, stock = $4, image = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, price, category, stock, image, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customers / Loyalty System
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search customer by loyalty number
app.get('/api/customers/loyalty/:loyaltyNumber', async (req, res) => {
  try {
    const { loyaltyNumber } = req.params;
    const result = await pool.query(
      'SELECT * FROM customers WHERE loyalty_number = $1',
      [loyaltyNumber.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching customer by loyalty number:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer purchase history
app.get('/api/customers/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        t.*,
        json_agg(
          json_build_object(
            'id', ti.product_id,
            'name', ti.product_name,
            'price', ti.product_price,
            'quantity', ti.quantity,
            'subtotal', ti.subtotal
          ) ORDER BY ti.id
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.customer_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customer history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Generate loyalty number
    const loyaltyResult = await pool.query('SELECT generate_loyalty_number() as loyalty_number');
    const loyaltyNumber = loyaltyResult.rows[0].loyalty_number;
    
    const result = await pool.query(
      'INSERT INTO customers (loyalty_number, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [loyaltyNumber, name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search customers by name, email, or loyalty number
app.get('/api/customers/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query}%`;
    
    const result = await pool.query(`
      SELECT * FROM customers 
      WHERE LOWER(name) LIKE LOWER($1) 
         OR LOWER(email) LIKE LOWER($1) 
         OR LOWER(loyalty_number) LIKE LOWER($1)
      ORDER BY name
      LIMIT 10
    `, [searchTerm]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching customers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        c.name as customer_name,
        c.loyalty_number,
        json_agg(
          json_build_object(
            'id', ti.product_id,
            'name', ti.product_name,
            'price', ti.product_price,
            'quantity', ti.quantity
          ) ORDER BY ti.id
        ) as items
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id, c.name, c.loyalty_number
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      items, 
      subtotal, 
      tax, 
      total, 
      paymentMethod, 
      customerId, 
      amountReceived, 
      change,
      pointsRedeemed = 0
    } = req.body;
    
    // Calculate points earned
    const pointsEarned = calculatePoints(total);
    
    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions 
       (customer_id, subtotal, tax, total, payment_method, amount_received, change_amount, points_earned, points_redeemed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [customerId, subtotal, tax, total, paymentMethod, amountReceived, change, pointsEarned, pointsRedeemed]
    );
    
    const transactionId = transactionResult.rows[0].id;
    
    // Add transaction items and update stock
    for (const item of items) {
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_id, product_name, product_price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [transactionId, item.id, item.name, item.price, item.quantity, item.price * item.quantity]
      );
      
      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }
    
    await client.query('COMMIT');
    
    // Return transaction with customer info if available
    const fullTransactionResult = await pool.query(`
      SELECT t.*, c.name as customer_name, c.loyalty_number
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = $1
    `, [transactionId]);
    
    res.json(fullTransactionResult.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Loyalty-specific endpoints

// Get customer loyalty details with recent transactions
app.get('/api/loyalty/:loyaltyNumber', async (req, res) => {
  try {
    const { loyaltyNumber } = req.params;
    
    // Get customer details
    const customerResult = await pool.query(
      'SELECT * FROM customers WHERE loyalty_number = $1',
      [loyaltyNumber.toUpperCase()]
    );
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = customerResult.rows[0];
    
    // Get recent transactions with items
    const transactionsResult = await pool.query(`
      SELECT 
        t.*,
        json_agg(
          json_build_object(
            'id', ti.product_id,
            'name', ti.product_name,
            'price', ti.product_price,
            'quantity', ti.quantity,
            'subtotal', ti.subtotal
          ) ORDER BY ti.id
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.customer_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `, [customer.id]);
    
    res.json({
      customer,
      recentTransactions: transactionsResult.rows
    });
  } catch (err) {
    console.error('Error fetching loyalty details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer from loyalty number during checkout
app.post('/api/loyalty/create', async (req, res) => {
  try {
    const { loyaltyNumber, name, email, phone } = req.body;
    
    // Check if loyalty number already exists
    const existingResult = await pool.query(
      'SELECT id FROM customers WHERE loyalty_number = $1',
      [loyaltyNumber.toUpperCase()]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Loyalty number already exists' });
    }
    
    const result = await pool.query(
      'INSERT INTO customers (loyalty_number, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [loyaltyNumber.toUpperCase(), name, email || null, phone || null]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer with loyalty number:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sales analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [totalSales, todaySales, transactionCount, lowStockProducts, totalCustomers, activeCustomers] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total), 0) as total FROM transactions'),
      pool.query('SELECT COALESCE(SUM(total), 0) as total FROM transactions WHERE created_at >= $1', [todayStart]),
      pool.query('SELECT COUNT(*) as count FROM transactions'),
      pool.query('SELECT COUNT(*) as count FROM products WHERE stock <= 5'),
      pool.query('SELECT COUNT(*) as count FROM customers'),
      pool.query('SELECT COUNT(*) as count FROM customers WHERE last_visit >= $1', [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]) // Last 30 days
    ]);
    
    res.json({
      totalSales: parseFloat(totalSales.rows[0].total),
      todaySales: parseFloat(todaySales.rows[0].total),
      transactionCount: parseInt(transactionCount.rows[0].count),
      lowStockCount: parseInt(lowStockProducts.rows[0].count),
      totalCustomers: parseInt(totalCustomers.rows[0].count),
      activeCustomers: parseInt(activeCustomers.rows[0].count)
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});