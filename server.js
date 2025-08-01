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

// NEW 0801 11:01

// Enhanced API endpoints to add to server.js after the existing product endpoints


// Create enhanced product with images and features
app.post('/api/products/enhanced', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      name, price, category, stock, image, sku, productType, laptopSize, 
      brand, collection, material, gender, color, description, dimensions, 
      weight, warrantyInfo, careInstructions, mainImageUrl, isActive, 
      featured, images, features 
    } = req.body;
    
    // Generate SKU if not provided
    let finalSku = sku;
    if (!finalSku) {
      const skuResult = await client.query('SELECT generate_sku($1, $2) as sku', [brand, productType]);
      finalSku = skuResult.rows[0].sku;
    }
    
    // Create product
    const productResult = await client.query(`
      INSERT INTO products (
        name, price, category, stock, image, sku, product_type, laptop_size,
        brand, collection, material, gender, color, description, dimensions,
        weight, warranty_info, care_instructions, main_image_url, is_active, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
      RETURNING *
    `, [
      name, price, category, stock, image || '📦', finalSku, productType, laptopSize,
      brand, collection, material, gender, color, description, dimensions,
      weight, warrantyInfo, careInstructions, mainImageUrl, isActive !== false, featured || false
    ]);
    
    const productId = productResult.rows[0].id;
    
    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await client.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES ($1, $2, $3, $4, $5)',
          [productId, img.url, img.alt || '', img.isPrimary || false, img.sortOrder || i]
        );
      }
    }
    
    // Add features if provided
    if (features && features.length > 0) {
      for (const feature of features) {
        await client.query(
          'INSERT INTO product_features (product_id, feature_name, feature_value) VALUES ($1, $2, $3)',
          [productId, feature.name, feature.value]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json(productResult.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating enhanced product:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update enhanced product
app.put('/api/products/:id/enhanced', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { 
      name, price, category, stock, image, sku, productType, laptopSize, 
      brand, collection, material, gender, color, description, dimensions, 
      weight, warrantyInfo, careInstructions, mainImageUrl, isActive, 
      featured, images, features 
    } = req.body;
    
    // Update product
    const productResult = await client.query(`
      UPDATE products SET 
        name = $1, price = $2, category = $3, stock = $4, image = $5, sku = $6, 
        product_type = $7, laptop_size = $8, brand = $9, collection = $10, 
        material = $11, gender = $12, color = $13, description = $14, 
        dimensions = $15, weight = $16, warranty_info = $17, care_instructions = $18, 
        main_image_url = $19, is_active = $20, featured = $21, updated_at = CURRENT_TIMESTAMP
      WHERE id = $22 RETURNING *
    `, [
      name, price, category, stock, image, sku, productType, laptopSize,
      brand, collection, material, gender, color, description, dimensions,
      weight, warrantyInfo, careInstructions, mainImageUrl, isActive, featured, id
    ]);
    
    // Update images - delete existing and add new ones
    if (images !== undefined) {
      await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
      
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          await client.query(
            'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES ($1, $2, $3, $4, $5)',
            [id, img.url, img.alt || '', img.isPrimary || false, img.sortOrder || i]
          );
        }
      }
    }
    
    // Update features - delete existing and add new ones
    if (features !== undefined) {
      await client.query('DELETE FROM product_features WHERE product_id = $1', [id]);
      
      if (features && features.length > 0) {
        for (const feature of features) {
          await client.query(
            'INSERT INTO product_features (product_id, feature_name, feature_value) VALUES ($1, $2, $3)',
            [id, feature.name, feature.value]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    res.json(productResult.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating enhanced product:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});




// Get low stock products
app.get('/api/products/low-stock', async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const result = await pool.query(`
      SELECT p.*, 
        CASE 
          WHEN p.stock <= 0 THEN 'out_of_stock'
          WHEN p.stock <= $1 THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      WHERE p.stock <= $1 AND p.is_active = true
      ORDER BY p.stock ASC, p.name
    `, [threshold]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching low stock products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Products with full details including images and features
app.get('/api/products/detailed', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pi.id,
            'url', pi.image_url,
            'alt', pi.alt_text,
            'isPrimary', pi.is_primary,
            'sortOrder', pi.sort_order
          ) ORDER BY pi.sort_order
        ) FILTER (WHERE pi.id IS NOT NULL) as images,
        json_agg(
          DISTINCT jsonb_build_object(
            'name', pf.feature_name,
            'value', pf.feature_value
          )
        ) FILTER (WHERE pf.id IS NOT NULL) as features
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      WHERE p.is_active = true OR p.is_active IS NULL
      GROUP BY p.id
      ORDER BY p.featured DESC NULLS LAST, p.sort_order NULLS LAST, p.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching detailed products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product with full details
app.get('/api/products/:id/detailed', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        p.*,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pi.id,
            'url', pi.image_url,
            'alt', pi.alt_text,
            'isPrimary', pi.is_primary,
            'sortOrder', pi.sort_order
          ) ORDER BY pi.sort_order
        ) FILTER (WHERE pi.id IS NOT NULL) as images,
        json_agg(
          DISTINCT jsonb_build_object(
            'name', pf.feature_name,
            'value', pf.feature_value
          )
        ) FILTER (WHERE pf.id IS NOT NULL) as features
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product filters data (this is the key missing endpoint)
app.get('/api/products/filters', async (req, res) => {
  try {
    // Since the enhanced tables might not exist yet, let's provide a fallback
    const collections = await pool.query(`
      SELECT DISTINCT collection FROM products 
      WHERE collection IS NOT NULL AND collection != '' 
      ORDER BY collection
    `).catch(() => ({ rows: [] }));
    
    const brands = await pool.query(`
      SELECT DISTINCT brand FROM products 
      WHERE brand IS NOT NULL AND brand != '' 
      ORDER BY brand
    `).catch(() => ({ rows: [] }));
    
    const materials = await pool.query(`
      SELECT DISTINCT material FROM products 
      WHERE material IS NOT NULL AND material != '' 
      ORDER BY material
    `).catch(() => ({ rows: [] }));
    
    const productTypes = await pool.query(`
      SELECT DISTINCT product_type FROM products 
      WHERE product_type IS NOT NULL AND product_type != '' 
      ORDER BY product_type
    `).catch(() => ({ rows: [] }));
    
    const colors = await pool.query(`
      SELECT DISTINCT color FROM products 
      WHERE color IS NOT NULL AND color != '' 
      ORDER BY color
    `).catch(() => ({ rows: [] }));
    
    res.json({
      collections: collections.rows.map(r => r.collection),
      brands: brands.rows.map(r => r.brand),
      materials: materials.rows.map(r => r.material),
      productTypes: productTypes.rows.map(r => r.product_type),
      colors: colors.rows.map(r => r.color)
    });
  } catch (err) {
    console.error('Error fetching product filters:', err);
    // Return empty filters if there's an error
    res.json({
      collections: [],
      brands: [],
      materials: [],
      productTypes: [],
      colors: []
    });
  }
});

// Advanced product search with filters
app.get('/api/products/search', async (req, res) => {
  try {
    const { 
      q, brand, collection, material, productType, color, gender, 
      minPrice, maxPrice, category, inStock, featured, laptopSize 
    } = req.query;
    
    // Start with basic query - use existing columns that definitely exist
    let query = `
      SELECT p.*
      FROM products p
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (q) {
      paramCount++;
      query += ` AND (LOWER(p.name) LIKE LOWER($${paramCount}) OR LOWER(COALESCE(p.description, '')) LIKE LOWER($${paramCount}) OR LOWER(COALESCE(p.sku, '')) LIKE LOWER($${paramCount}))`;
      params.push(`%${q}%`);
    }
    
    // Only add these filters if the columns exist
    if (brand) {
      paramCount++;
      query += ` AND COALESCE(p.brand, '') = $${paramCount}`;
      params.push(brand);
    }
    
    if (collection) {
      paramCount++;
      query += ` AND COALESCE(p.collection, '') = $${paramCount}`;
      params.push(collection);
    }
    
    if (material) {
      paramCount++;
      query += ` AND COALESCE(p.material, '') = $${paramCount}`;
      params.push(material);
    }
    
    if (productType) {
      paramCount++;
      query += ` AND COALESCE(p.product_type, '') = $${paramCount}`;
      params.push(productType);
    }
    
    if (color) {
      paramCount++;
      query += ` AND COALESCE(p.color, '') = $${paramCount}`;
      params.push(color);
    }
    
    if (gender) {
      paramCount++;
      query += ` AND COALESCE(p.gender, '') = $${paramCount}`;
      params.push(gender);
    }
    
    if (category) {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
    }
    
    if (laptopSize) {
      paramCount++;
      query += ` AND COALESCE(p.laptop_size, '') = $${paramCount}`;
      params.push(laptopSize);
    }
    
    if (minPrice) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
    }
    
    if (inStock === 'true') {
      query += ` AND p.stock > 0`;
    }
    
    if (featured === 'true') {
      query += ` AND COALESCE(p.featured, false) = true`;
    }
    
    query += ` ORDER BY COALESCE(p.featured, false) DESC, p.name`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update products
app.put('/api/products/bulk-update', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { productIds, updates } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs are required' });
    }
    
    const setClause = [];
    const params = [];
    let paramCount = 0;
    
    // Build dynamic update query based on provided updates
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        paramCount++;
        // Convert camelCase to snake_case for database columns
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        setClause.push(`${dbField} = $${paramCount}`);
        params.push(updates[key]);
      }
    });
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    
    paramCount++;
    const query = `
      UPDATE products 
      SET ${setClause.join(', ')} 
      WHERE id = ANY($${paramCount}) 
      RETURNING id, name
    `;
    params.push(productIds);
    
    const result = await client.query(query, params);
    
    await client.query('COMMIT');
    res.json({ 
      message: `${result.rows.length} products updated successfully`,
      updatedProducts: result.rows 
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error bulk updating products:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Duplicate product
app.post('/api/products/:id/duplicate', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Get original product
    const originalResult = await client.query(`
      SELECT * FROM products WHERE id = $1
    `, [id]);
    
    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const original = originalResult.rows[0];
    
    // Create duplicate product with basic fields
    const duplicateResult = await client.query(`
      INSERT INTO products (
        name, price, category, stock, image
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [
      `${original.name} (Copy)`, 
      original.price, 
      original.category, 
      0, // Set stock to 0 for duplicates
      original.image
    ]);
    
    await client.query('COMMIT');
    res.json(duplicateResult.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error duplicating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});



// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

