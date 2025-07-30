// public/app.js - Complete React frontend with API integration
const { useState, useEffect } = React;
const { ShoppingCart, Plus, Minus, X, Search, CreditCard, DollarSign, Users, Package, BarChart3, Receipt, Trash2, Edit, Save } = lucide;

const API_BASE_URL = '/api';

const POSApp = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    todaySales: 0,
    transactionCount: 0,
    lowStockCount: 0
  });
  
  const [currentView, setCurrentView] = useState('pos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Food', stock: '', image: '📦' });
  const [loading, setLoading] = useState(false);

  // API Functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadTransactions();
    loadAnalytics();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await apiCall('/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await apiCall('/customers');
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await apiCall('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await apiCall('/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart functions
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const product = products.find(p => p.id === id);
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.min(quantity, product.stock) }
        : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setAmountReceived('');
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const change = parseFloat(amountReceived) - total;

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && parseFloat(amountReceived) < total) return;

    setLoading(true);
    try {
      const transactionData = {
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        customerId: selectedCustomer?.id || null,
        amountReceived: parseFloat(amountReceived) || total,
        change: paymentMethod === 'cash' ? Math.max(0, change) : 0
      };

      const transaction = await apiCall('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
      });

      // Refresh data
      await Promise.all([
        loadProducts(),
        loadTransactions(),
        loadAnalytics()
      ]);

      setLastTransaction({
        ...transaction,
        items: cart,
        customer: selectedCustomer
      });
      
      clearCart();
      setShowReceipt(true);
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Product management
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    
    setLoading(true);
    try {
      await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock),
          image: newProduct.image
        }),
      });
      
      setNewProduct({ name: '', price: '', category: 'Food', stock: '', image: '📦' });
      await loadProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    setLoading(true);
    try {
      await apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct),
      });
      
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setLoading(true);
    try {
      await apiCall(`/products/${id}`, {
        method: 'DELETE',
      });
      
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation Component
  const NavButton = ({ view, icon: Icon, label, active }) => (
    React.createElement('button', {
      onClick: () => setCurrentView(view),
      className: `flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`
    }, [
      React.createElement(Icon, { key: 'icon', size: 20 }),
      React.createElement('span', { key: 'label', className: 'font-medium' }, label)
    ])
  );

  // POS View Component
  const POSView = () => (
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 h-full' }, [
      // Products Section
      React.createElement('div', { key: 'products', className: 'lg:col-span-2 bg-white rounded-xl shadow-sm border' }, [
        React.createElement('div', { key: 'header', className: 'p-6 border-b' }, [
          React.createElement('div', { key: 'controls', className: 'flex flex-col sm:flex-row gap-4 mb-4' }, [
            React.createElement('div', { key: 'search', className: 'relative flex-1' }, [
              React.createElement(Search, { 
                key: 'search-icon',
                className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                size: 20 
              }),
              React.createElement('input', {
                key: 'search-input',
                type: 'text',
                placeholder: 'Search products...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: 'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              })
            ]),
            React.createElement('select', {
              key: 'category-select',
              value: selectedCategory,
              onChange: (e) => setSelectedCategory(e.target.value),
              className: 'px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, categories.map(cat => 
              React.createElement('option', { key: cat, value: cat }, cat)
            ))
          ])
        ]),
        React.createElement('div', { 
          key: 'products-grid',
          className: 'p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto' 
        }, filteredProducts.map(product =>
          React.createElement('button', {
            key: product.id,
            onClick: () => addToCart(product),
            disabled: product.stock <= 0,
            className: `p-4 rounded-lg border-2 transition-all ${
              product.stock <= 0
                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95'
            }`
          }, [
            React.createElement('div', { key: 'emoji', className: 'text-3xl mb-2' }, product.image),
            React.createElement('div', { key: 'name', className: 'font-medium text-sm mb-1' }, product.name),
            React.createElement('div', { key: 'price', className: 'text-blue-600 font-bold' }, `$${parseFloat(product.price).toFixed(2)}`),
            React.createElement('div', { key: 'stock', className: 'text-xs text-gray-500 mt-1' }, `Stock: ${product.stock}`)
          ])
        ))
      ]),

      // Cart Section
      React.createElement('div', { key: 'cart', className: 'bg-white rounded-xl shadow-sm border flex flex-col' }, [
        React.createElement('div', { key: 'cart-header', className: 'p-6 border-b' }, [
          React.createElement('h2', { className: 'text-xl font-bold flex items-center gap-2' }, [
            React.createElement(ShoppingCart, { key: 'cart-icon', size: 24 }),
            `Cart (${cart.length})`
          ])
        ]),
        React.createElement('div', { key: 'cart-content', className: 'flex-1 p-6' }, [
          cart.length === 0 ? (
            React.createElement('div', { className: 'text-center text-gray-400 py-8' }, [
              React.createElement(ShoppingCart, { key: 'empty-icon', size: 48, className: 'mx-auto mb-4 opacity-30' }),
              React.createElement('p', { key: 'empty-text' }, 'Cart is empty')
            ])
          ) : (
            React.createElement('div', { className: 'space-y-3 mb-6' }, cart.map(item =>
              React.createElement('div', { 
                key: item.id,
                className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg' 
              }, [
                React.createElement('div', { key: 'item-info', className: 'flex-1' }, [
                  React.createElement('div', { className: 'font-medium' }, item.name),
                  React.createElement('div', { className: 'text-sm text-gray-600' }, `$${parseFloat(item.price).toFixed(2)} each`)
                ]),
                React.createElement('div', { key: 'item-controls', className: 'flex items-center gap-2' }, [
                  React.createElement('button', {
                    onClick: () => updateQuantity(item.id, item.quantity - 1),
                    className: 'w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300'
                  }, React.createElement(Minus, { size: 16 })),
                  React.createElement('span', { className: 'w-8 text-center font-medium' }, item.quantity),
                  React.createElement('button', {
                    onClick: () => updateQuantity(item.id, item.quantity + 1),
                    className: 'w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300'
                  }, React.createElement(Plus, { size: 16 })),
                  React.createElement('button', {
                    onClick: () => removeFromCart(item.id),
                    className: 'w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 ml-2'
                  }, React.createElement(X, { size: 16 }))
                ])
              ])
            ))
          ),

          cart.length > 0 && [
            React.createElement('div', { key: 'totals', className: 'border-t pt-4 space-y-2 mb-6' }, [
              React.createElement('div', { className: 'flex justify-between' }, [
                React.createElement('span', { key: 'subtotal-label' }, 'Subtotal:'),
                React.createElement('span', { key: 'subtotal-value' }, `$${subtotal.toFixed(2)}`)
              ]),
              React.createElement('div', { className: 'flex justify-between' }, [
                React.createElement('span', { key: 'tax-label' }, 'Tax (8%):'),
                React.createElement('span', { key: 'tax-value' }, `$${tax.toFixed(2)}`)
              ]),
              React.createElement('div', { className: 'flex justify-between font-bold text-lg border-t pt-2' }, [
                React.createElement('span', { key: 'total-label' }, 'Total:'),
                React.createElement('span', { key: 'total-value' }, `$${total.toFixed(2)}`)
              ])
            ]),

            React.createElement('div', { key: 'payment', className: 'space-y-4' }, [
              React.createElement('div', { key: 'payment-method' }, [
                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Payment Method'),
                React.createElement('select', {
                  value: paymentMethod,
                  onChange: (e) => setPaymentMethod(e.target.value),
                  className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                }, [
                  React.createElement('option', { key: 'cash', value: 'cash' }, 'Cash'),
                  React.createElement('option', { key: 'card', value: 'card' }, 'Credit/Debit Card'),
                  React.createElement('option', { key: 'mobile', value: 'mobile' }, 'Mobile Payment')
                ])
              ]),

              paymentMethod === 'cash' && React.createElement('div', { key: 'cash-payment' }, [
                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Amount Received'),
                React.createElement('input', {
                  type: 'number',
                  step: '0.01',
                  value: amountReceived,
                  onChange: (e) => setAmountReceived(e.target.value),
                  placeholder: '0.00',
                  className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                }),
                amountReceived && parseFloat(amountReceived) >= total && React.createElement('div', {
                  className: 'mt-2 text-green-600 font-medium'
                }, `Change: $${change.toFixed(2)}`)
              ]),

              React.createElement('div', { key: 'action-buttons', className: 'flex gap-2' }, [
                React.createElement('button', {
                  onClick: clearCart,
                  className: 'flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
                }, 'Clear Cart'),
                React.createElement('button', {
                  onClick: processPayment,
                  disabled: loading || (paymentMethod === 'cash' && parseFloat(amountReceived) < total),
                  className: 'flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium'
                }, loading ? 'Processing...' : 'Process Payment')
              ])
            ])
          ]
        ])
      ])
    ])
  );

  // Inventory View Component
  const InventoryView = () => (
    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border' }, [
      React.createElement('div', { key: 'header', className: 'p-6 border-b' }, [
        React.createElement('h2', { className: 'text-xl font-bold flex items-center gap-2' }, [
          React.createElement(Package, { key: 'icon', size: 24 }),
          'Inventory Management'
        ])
      ]),
      
      React.createElement('div', { key: 'content', className: 'p-6' }, [
        // Add Product Form
        React.createElement('div', { key: 'add-form', className: 'bg-gray-50 p-4 rounded-lg mb-6' }, [
          React.createElement('h3', { className: 'font-medium mb-4' }, 'Add New Product'),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-5 gap-4' }, [
            React.createElement('input', {
              key: 'name',
              type: 'text',
              placeholder: 'Product name',
              value: newProduct.name,
              onChange: (e) => setNewProduct({...newProduct, name: e.target.value}),
              className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            React.createElement('input', {
              key: 'price',
              type: 'number',
              step: '0.01',
              placeholder: 'Price',
              value: newProduct.price,
              onChange: (e) => setNewProduct({...newProduct, price: e.target.value}),
              className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            React.createElement('select', {
              key: 'category',
              value: newProduct.category,
              onChange: (e) => setNewProduct({...newProduct, category: e.target.value}),
              className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'food', value: 'Food' }, 'Food'),
              React.createElement('option', { key: 'beverages', value: 'Beverages' }, 'Beverages')
            ]),
            React.createElement('input', {
              key: 'stock',
              type: 'number',
              placeholder: 'Stock',
              value: newProduct.stock,
              onChange: (e) => setNewProduct({...newProduct, stock: e.target.value}),
              className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            React.createElement('button', {
              key: 'add-btn',
              onClick: addProduct,
              disabled: loading,
              className: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
            }, [
              React.createElement(Plus, { key: 'plus-icon', size: 16 }),
              loading ? 'Adding...' : 'Add'
            ])
          ])
        ]),

        // Products Table
        React.createElement('div', { key: 'table', className: 'overflow-x-auto' }, [
          React.createElement('table', { className: 'w-full border-collapse' }, [
            React.createElement('thead', { key: 'thead' }, [
              React.createElement('tr', { className: 'bg-gray-50' }, [
                React.createElement('th', { key: 'product', className: 'text-left p-3 border-b' }, 'Product'),
                React.createElement('th', { key: 'category', className: 'text-left p-3 border-b' }, 'Category'),
                React.createElement('th', { key: 'price', className: 'text-left p-3 border-b' }, 'Price'),
                React.createElement('th', { key: 'stock', className: 'text-left p-3 border-b' }, 'Stock'),
                React.createElement('th', { key: 'actions', className: 'text-left p-3 border-b' }, 'Actions')
              ])
            ]),
            React.createElement('tbody', { key: 'tbody' }, products.map(product =>
              React.createElement('tr', { key: product.id, className: 'hover:bg-gray-50' }, [
                React.createElement('td', { key: 'product-info', className: 'p-3 border-b' }, [
                  React.createElement('div', { className: 'flex items-center gap-3' }, [
                    React.createElement('span', { key: 'emoji', className: 'text-2xl' }, product.image),
                    React.createElement('span', { key: 'name', className: 'font-medium' }, product.name)
                  ])
                ]),
                React.createElement('td', { key: 'category', className: 'p-3 border-b' }, product.category),
                React.createElement('td', { key: 'price', className: 'p-3 border-b' }, `$${parseFloat(product.price).toFixed(2)}`),
                React.createElement('td', { key: 'stock', className: 'p-3 border-b' }, [
                  React.createElement('span', {
                    className: `px-2 py-1 rounded-full text-xs ${
                      product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`
                  }, product.stock)
                ]),
                React.createElement('td', { key: 'actions', className: 'p-3 border-b' }, [
                  React.createElement('div', { className: 'flex gap-2' }, [
                    React.createElement('button', {
                      key: 'edit',
                      onClick: () => setEditingProduct(product),
                      className: 'p-1 text-blue-600 hover:bg-blue-100 rounded'
                    }, React.createElement(Edit, { size: 16 })),
                    React.createElement('button', {
                      key: 'delete',
                      onClick: () => deleteProduct(product.id),
                      disabled: loading,
                      className: 'p-1 text-red-600 hover:bg-red-100 rounded'
                    }, React.createElement(Trash2, { size: 16 }))
                  ])
                ])
              ])
            ))
          ])
        ])
      ])
    ])
  );

  // Sales Report View Component
  const SalesView = () => (
    React.createElement('div', { className: 'space-y-6' }, [
      // Stats Cards
      React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-4 gap-6' }, [
        React.createElement('div', { key: 'today-sales', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
          React.createElement('div', { className: 'flex items-center justify-between' }, [
            React.createElement('div', { key: 'content' }, [
              React.createElement('p', { className: 'text-gray-600 text-sm' }, "Today's Sales"),
              React.createElement('p', { className: 'text-2xl font-bold text-green-600' }, `$${analytics.todaySales.toFixed(2)}`)
            ]),
            React.createElement(DollarSign, { key: 'icon', className: 'text-green-600', size: 32 })
          ])
        ]),
        React.createElement('div', { key: 'total-sales', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
          React.createElement('div', { className: 'flex items-center justify-between' }, [
            React.createElement('div', { key: 'content' }, [
              React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Total Sales'),
              React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, `$${analytics.totalSales.toFixed(2)}`)
            ]),
            React.createElement(BarChart3, { key: 'icon', className: 'text-blue-600', size: 32 })
          ])
        ]),
        React.createElement('div', { key: 'transactions', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
          React.createElement('div', { className: 'flex items-center justify-between' }, [
            React.createElement('div', { key: 'content' }, [
              React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Transactions'),
              React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, analytics.transactionCount)
            ]),
            React.createElement(Receipt, { key: 'icon', className: 'text-purple-600', size: 32 })
          ])
        ]),
        React.createElement('div', { key: 'low-stock', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
          React.createElement('div', { className: 'flex items-center justify-between' }, [
            React.createElement('div', { key: 'content' }, [
              React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Low Stock Items'),
              React.createElement('p', { className: 'text-2xl font-bold text-red-600' }, analytics.lowStockCount)
            ]),
            React.createElement(Package, { key: 'icon', className: 'text-red-600', size: 32 })
          ])
        ])
      ]),

      // Recent Transactions
      React.createElement('div', { key: 'transactions-table', className: 'bg-white rounded-xl shadow-sm border' }, [
        React.createElement('div', { key: 'header', className: 'p-6 border-b' }, [
          React.createElement('h2', { className: 'text-xl font-bold' }, 'Recent Transactions')
        ]),
        React.createElement('div', { key: 'content', className: 'p-6' }, [
          transactions.length === 0 ? (
            React.createElement('p', { className: 'text-gray-500 text-center py-8' }, 'No transactions yet')
          ) : (
            React.createElement('div', { className: 'overflow-x-auto' }, [
              React.createElement('table', { className: 'w-full' }, [
                React.createElement('thead', { key: 'thead' }, [
                  React.createElement('tr', { className: 'bg-gray-50' }, [
                    React.createElement('th', { key: 'date', className: 'text-left p-3' }, 'Date'),
                    React.createElement('th', { key: 'items', className: 'text-left p-3' }, 'Items'),
                    React.createElement('th', { key: 'payment', className: 'text-left p-3' }, 'Payment'),
                    React.createElement('th', { key: 'total', className: 'text-left p-3' }, 'Total')
                  ])
                ]),
                React.createElement('tbody', { key: 'tbody' }, transactions.slice(0, 10).map(transaction =>
                  React.createElement('tr', { key: transaction.id, className: 'hover:bg-gray-50' }, [
                    React.createElement('td', { key: 'date', className: 'p-3 border-b' }, 
                      new Date(transaction.created_at).toLocaleString()
                    ),
                    React.createElement('td', { key: 'items', className: 'p-3 border-b' }, 
                      transaction.items ? transaction.items.map(item => item.name).join(', ') : 'N/A'
                    ),
                    React.createElement('td', { key: 'payment', className: 'p-3 border-b capitalize' }, 
                      transaction.payment_method
                    ),
                    React.createElement('td', { key: 'total', className: 'p-3 border-b font-medium' }, 
                      `${parseFloat(transaction.total).toFixed(2)}`
                    )
                  ])
                ))
              ])
            ])
          )
        ])
      ])
    ])
  );

  // Receipt Modal Component
  const ReceiptModal = () => {
    if (!showReceipt || !lastTransaction) return null;

    return React.createElement('div', { 
      className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' 
    }, [
      React.createElement('div', { key: 'modal', className: 'bg-white rounded-lg p-6 max-w-md w-full' }, [
        React.createElement('div', { key: 'header', className: 'text-center mb-6' }, [
          React.createElement('h2', { className: 'text-2xl font-bold' }, 'Receipt'),
          React.createElement('p', { className: 'text-gray-600' }, `Transaction #${lastTransaction.id}`),
          React.createElement('p', { className: 'text-sm text-gray-500' }, 
            new Date(lastTransaction.created_at || new Date()).toLocaleString()
          )
        ]),

        React.createElement('div', { key: 'items', className: 'space-y-2 mb-4' }, 
          lastTransaction.items.map(item =>
            React.createElement('div', { key: item.id, className: 'flex justify-between' }, [
              React.createElement('span', { key: 'item' }, `${item.name} x${item.quantity}`),
              React.createElement('span', { key: 'price' }, `${(item.price * item.quantity).toFixed(2)}`)
            ])
          )
        ),

        React.createElement('div', { key: 'totals', className: 'border-t pt-4 space-y-1' }, [
          React.createElement('div', { className: 'flex justify-between' }, [
            React.createElement('span', { key: 'label' }, 'Subtotal:'),
            React.createElement('span', { key: 'value' }, `${lastTransaction.subtotal.toFixed(2)}`)
          ]),
          React.createElement('div', { className: 'flex justify-between' }, [
            React.createElement('span', { key: 'label' }, 'Tax:'),
            React.createElement('span', { key: 'value' }, `${lastTransaction.tax.toFixed(2)}`)
          ]),
          React.createElement('div', { className: 'flex justify-between font-bold text-lg' }, [
            React.createElement('span', { key: 'label' }, 'Total:'),
            React.createElement('span', { key: 'value' }, `${lastTransaction.total.toFixed(2)}`)
          ]),
          lastTransaction.payment_method === 'cash' && lastTransaction.amount_received && [
            React.createElement('div', { key: 'received', className: 'flex justify-between' }, [
              React.createElement('span', { key: 'label' }, 'Amount Received:'),
              React.createElement('span', { key: 'value' }, `${lastTransaction.amount_received.toFixed(2)}`)
            ]),
            React.createElement('div', { key: 'change', className: 'flex justify-between' }, [
              React.createElement('span', { key: 'label' }, 'Change:'),
              React.createElement('span', { key: 'value' }, `${(lastTransaction.change_amount || 0).toFixed(2)}`)
            ])
          ]
        ]),

        React.createElement('div', { key: 'footer', className: 'text-center mt-6' }, [
          React.createElement('p', { className: 'text-sm text-gray-600 mb-4' }, 'Thank you for your business!'),
          React.createElement('button', {
            onClick: () => setShowReceipt(false),
            className: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          }, 'Close')
        ])
      ])
    ]);
  };

  // Edit Product Modal Component
  const EditProductModal = () => {
    if (!editingProduct) return null;

    const [editForm, setEditForm] = useState({
      name: editingProduct.name,
      price: editingProduct.price,
      category: editingProduct.category,
      stock: editingProduct.stock,
      image: editingProduct.image
    });

    const handleSave = () => {
      updateProduct(editingProduct.id, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        category: editForm.category,
        stock: parseInt(editForm.stock),
        image: editForm.image
      });
    };

    return React.createElement('div', {
      className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    }, [
      React.createElement('div', { key: 'modal', className: 'bg-white rounded-lg p-6 max-w-md w-full' }, [
        React.createElement('div', { key: 'header', className: 'flex justify-between items-center mb-6' }, [
          React.createElement('h2', { className: 'text-xl font-bold' }, 'Edit Product'),
          React.createElement('button', {
            onClick: () => setEditingProduct(null),
            className: 'text-gray-400 hover:text-gray-600'
          }, React.createElement(X, { size: 24 }))
        ]),

        React.createElement('div', { key: 'form', className: 'space-y-4' }, [
          React.createElement('div', { key: 'name-field' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Name'),
            React.createElement('input', {
              type: 'text',
              value: editForm.name,
              onChange: (e) => setEditForm({ ...editForm, name: e.target.value }),
              className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            })
          ]),
          React.createElement('div', { key: 'price-field' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Price'),
            React.createElement('input', {
              type: 'number',
              step: '0.01',
              value: editForm.price,
              onChange: (e) => setEditForm({ ...editForm, price: e.target.value }),
              className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            })
          ]),
          React.createElement('div', { key: 'category-field' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Category'),
            React.createElement('select', {
              value: editForm.category,
              onChange: (e) => setEditForm({ ...editForm, category: e.target.value }),
              className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'food', value: 'Food' }, 'Food'),
              React.createElement('option', { key: 'beverages', value: 'Beverages' }, 'Beverages')
            ])
          ]),
          React.createElement('div', { key: 'stock-field' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Stock'),
            React.createElement('input', {
              type: 'number',
              value: editForm.stock,
              onChange: (e) => setEditForm({ ...editForm, stock: e.target.value }),
              className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            })
          ]),
          React.createElement('div', { key: 'image-field' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Emoji'),
            React.createElement('input', {
              type: 'text',
              value: editForm.image,
              onChange: (e) => setEditForm({ ...editForm, image: e.target.value }),
              className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            })
          ])
        ]),

        React.createElement('div', { key: 'actions', className: 'flex gap-3 mt-6' }, [
          React.createElement('button', {
            onClick: () => setEditingProduct(null),
            className: 'flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
          }, 'Cancel'),
          React.createElement('button', {
            onClick: handleSave,
            disabled: loading,
            className: 'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2'
          }, [
            React.createElement(Save, { key: 'save-icon', size: 16 }),
            loading ? 'Saving...' : 'Save'
          ])
        ])
      ])
    ]);
  };

  // Main App Render
  return React.createElement('div', { className: 'min-h-screen bg-gray-100' }, [
    // Header
    React.createElement('header', { key: 'header', className: 'bg-white shadow-sm border-b' }, [
      React.createElement('div', { className: 'max-w-7xl mx-auto px-6 py-4' }, [
        React.createElement('div', { className: 'flex items-center justify-between' }, [
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'POS System'),
          React.createElement('div', { className: 'flex items-center gap-4' }, [
            React.createElement(NavButton, { 
              key: 'pos-nav',
              view: 'pos', 
              icon: ShoppingCart, 
              label: 'POS', 
              active: currentView === 'pos' 
            }),
            React.createElement(NavButton, { 
              key: 'inventory-nav',
              view: 'inventory', 
              icon: Package, 
              label: 'Inventory', 
              active: currentView === 'inventory' 
            }),
            React.createElement(NavButton, { 
              key: 'sales-nav',
              view: 'sales', 
              icon: BarChart3, 
              label: 'Sales', 
              active: currentView === 'sales' 
            })
          ])
        ])
      ])
    ]),

    // Main Content
    React.createElement('main', { key: 'main', className: 'max-w-7xl mx-auto p-6' }, [
      currentView === 'pos' && React.createElement(POSView, { key: 'pos-view' }),
      currentView === 'inventory' && React.createElement(InventoryView, { key: 'inventory-view' }),
      currentView === 'sales' && React.createElement(SalesView, { key: 'sales-view' })
    ]),

    // Modals
    React.createElement(ReceiptModal, { key: 'receipt-modal' }),
    React.createElement(EditProductModal, { key: 'edit-modal' }),

    // Loading Overlay
    loading && React.createElement('div', {
      key: 'loading-overlay',
      className: 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'
    }, [
      React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow-lg flex items-center gap-3' }, [
        React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' }),
        React.createElement('span', { className: 'text-gray-700' }, 'Loading...')
      ])
    ])
  ]);
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(React.createElement(POSApp), document.getElementById('root'));
});
