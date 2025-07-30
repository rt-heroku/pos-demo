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

// Customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
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
        json_agg(
          json_build_object(
            'id', ti.product_id,
            'name', ti.product_name,
            'price', ti.product_price,
            'quantity', ti.quantity
          )
        ) as items
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id, c.name
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
    
    const { items, subtotal, tax, total, paymentMethod, customerId, amountReceived, change } = req.body;
    
    // Create transaction
    const transactionResult = await client.query(
      'INSERT INTO transactions (customer_id, subtotal, tax, total, payment_method, amount_received, change_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customerId, subtotal, tax, total, paymentMethod, amountReceived, change]
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
    res.json(transactionResult.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Sales analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [totalSales, todaySales, transactionCount, lowStockProducts] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total), 0) as total FROM transactions'),
      pool.query('SELECT COALESCE(SUM(total), 0) as total FROM transactions WHERE created_at >= $1', [todayStart]),
      pool.query('SELECT COUNT(*) as count FROM transactions'),
      pool.query('SELECT COUNT(*) as count FROM products WHERE stock <= 5')
    ]);
    
    res.json({
      totalSales: parseFloat(totalSales.rows[0].total),
      todaySales: parseFloat(todaySales.rows[0].total),
      transactionCount: parseInt(transactionCount.rows[0].count),
      lowStockCount: parseInt(lowStockProducts.rows[0].count)
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