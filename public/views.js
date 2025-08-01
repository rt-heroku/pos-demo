// public/views.js - View components
window.Views = {
    // POS View Component
    POSView: ({ 
        products, 
        cart, 
        selectedCustomer, 
        searchTerm, 
        setSearchTerm, 
        selectedCategory, 
        setSelectedCategory, 
        categories,
        onAddToCart, 
        onUpdateQuantity, 
        onRemoveFromCart, 
        onClearCart,
        onShowLoyaltyModal,
        onLoadCustomerHistory,
        onRemoveCustomer,
        subtotal,
        tax,
        total,
        paymentMethod,
        setPaymentMethod,
        amountReceived,
        setAmountReceived,
        change,
        onProcessPayment,
        loading
    }) => {
        const { ShoppingCart, Search, Users, Plus, Minus, X } = window.Icons;

        return React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 h-full' }, [
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
                }, products.map(product =>
                    React.createElement('button', {
                        key: product.id,
                        onClick: () => onAddToCart(product),
                        disabled: product.stock <= 0,
                        className: `p-4 rounded-lg border-2 transition-all ${
                            product.stock <= 0
                                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95'
                        }`
                    }, [
                        React.createElement('div', { key: 'image', className: 'text-3xl mb-2' }, product.image),
                        React.createElement('div', { key: 'name', className: 'font-medium text-sm mb-1' }, product.name),
                        React.createElement('div', { key: 'price', className: 'text-blue-600 font-bold' }, `${parseFloat(product.price).toFixed(2)}`),
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
                    // Customer info section
                    selectedCustomer ? (
                        React.createElement('div', { key: 'customer-info', className: 'mb-4 p-3 bg-green-50 border border-green-200 rounded-lg' }, [
                            React.createElement('div', { className: 'flex justify-between items-start' }, [
                                React.createElement('div', { key: 'customer-details' }, [
                                    React.createElement('div', { className: 'font-medium text-green-800' }, selectedCustomer.name),
                                    React.createElement('div', { className: 'text-sm text-green-600' }, selectedCustomer.loyalty_number),
                                    React.createElement('div', { className: 'text-sm text-green-600' }, `${selectedCustomer.points} points available`)
                                ]),
                                React.createElement('div', { key: 'customer-actions', className: 'flex gap-2' }, [
                                    React.createElement('button', {
                                        onClick: () => onLoadCustomerHistory(selectedCustomer.id),
                                        className: 'text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200'
                                    }, 'History'),
                                    React.createElement('button', {
                                        onClick: onRemoveCustomer,
                                        className: 'text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200'
                                    }, 'Remove')
                                ])
                            ])
                        ])
                    ) : (
                        React.createElement('button', {
                            key: 'add-customer-btn',
                            onClick: onShowLoyaltyModal,
                            className: 'mb-4 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2'
                        }, [
                            React.createElement(Users, { key: 'users-icon', size: 20 }),
                            'Add Loyalty Customer'
                        ])
                    ),

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
                                    React.createElement('div', { className: 'text-sm text-gray-600' }, `${parseFloat(item.price).toFixed(2)} each`)
                                ]),
                                React.createElement('div', { key: 'item-controls', className: 'flex items-center gap-2' }, [
                                    React.createElement('button', {
                                        onClick: () => onUpdateQuantity(item.id, item.quantity - 1),
                                        className: 'w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300'
                                    }, React.createElement(Minus, { size: 16 })),
                                    React.createElement('span', { className: 'w-8 text-center font-medium' }, item.quantity),
                                    React.createElement('button', {
                                        onClick: () => onUpdateQuantity(item.id, item.quantity + 1),
                                        className: 'w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300'
                                    }, React.createElement(Plus, { size: 16 })),
                                    React.createElement('button', {
                                        onClick: () => onRemoveFromCart(item.id),
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
                                React.createElement('span', { key: 'subtotal-value' }, `${subtotal.toFixed(2)}`)
                            ]),
                            React.createElement('div', { className: 'flex justify-between' }, [
                                React.createElement('span', { key: 'tax-label' }, 'Tax (8%):'),
                                React.createElement('span', { key: 'tax-value' }, `${tax.toFixed(2)}`)
                            ]),
                            React.createElement('div', { className: 'flex justify-between font-bold text-lg border-t pt-2' }, [
                                React.createElement('span', { key: 'total-label' }, 'Total:'),
                                React.createElement('span', { key: 'total-value' }, `${total.toFixed(2)}`)
                            ]),
                            selectedCustomer && React.createElement('div', { className: 'flex justify-between text-green-600 text-sm' }, [
                                React.createElement('span', { key: 'points-label' }, 'Points to earn:'),
                                React.createElement('span', { key: 'points-value' }, `+${Math.floor(total)} points`)
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
                                }, `Change: ${change.toFixed(2)}`)
                            ]),

                            React.createElement('div', { key: 'action-buttons', className: 'flex gap-2' }, [
                                React.createElement('button', {
                                    onClick: onClearCart,
                                    className: 'flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
                                }, 'Clear Cart'),
                                React.createElement('button', {
                                    onClick: onProcessPayment,
                                    disabled: loading || (paymentMethod === 'cash' && parseFloat(amountReceived) < total),
                                    className: 'flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium'
                                }, loading ? 'Processing...' : 'Process Payment')
                            ])
                        ])
                    ]
                ])
            ])
        ]);
    },

    // Loyalty View Component  
    LoyaltyView: ({ 
        loyaltyNumber, 
        setLoyaltyNumber, 
        onSearchByLoyalty, 
        loyaltySearchTerm, 
        setLoyaltySearchTerm, 
        customerSearchResults, 
        onLoadCustomerHistory, 
        loading 
    }) => {
        const { Award } = window.Icons;

        return React.createElement('div', { className: 'space-y-6' }, [
            React.createElement('div', { key: 'search-section', className: 'bg-white rounded-xl shadow-sm border p-6' }, [
                React.createElement('h2', { className: 'text-xl font-bold mb-4 flex items-center gap-2' }, [
                    React.createElement(Award, { key: 'icon', size: 24 }),
                    'Loyalty Customer Search'
                ]),
                
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                    React.createElement('div', { key: 'loyalty-search' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Search by Loyalty Number'),
                        React.createElement('div', { className: 'flex gap-2' }, [
                            React.createElement('input', {
                                type: 'text',
                                value: loyaltyNumber,
                                onChange: (e) => setLoyaltyNumber(e.target.value.toUpperCase()),
                                placeholder: 'LOY001',
                                className: 'flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }),
                            React.createElement('button', {
                                onClick: () => onSearchByLoyalty(loyaltyNumber),
                                disabled: !loyaltyNumber.trim() || loading,
                                className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors'
                            }, loading ? 'Searching...' : 'Search')
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'name-search' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Search by Name/Email'),
                        React.createElement('input', {
                            type: 'text',
                            value: loyaltySearchTerm,
                            onChange: (e) => setLoyaltySearchTerm(e.target.value),
                            placeholder: 'Enter name or email',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ])
                ]),

                customerSearchResults.length > 0 && React.createElement('div', { key: 'search-results', className: 'mt-4' }, [
                    React.createElement('h3', { className: 'font-medium mb-2' }, 'Search Results'),
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, 
                        customerSearchResults.map(customer => 
                            React.createElement('div', { key: customer.id, className: 'p-4 border rounded-lg hover:bg-gray-50' }, [
                                React.createElement('div', { className: 'flex justify-between items-start mb-2' }, [
                                    React.createElement('div', { key: 'customer-info' }, [
                                        React.createElement('div', { className: 'font-medium' }, customer.name),
                                        React.createElement('div', { className: 'text-sm text-gray-600' }, customer.loyalty_number),
                                        React.createElement('div', { className: 'text-sm text-gray-600' }, customer.email || 'No email')
                                    ]),
                                    React.createElement('button', {
                                        key: 'view-history-btn',
                                        onClick: () => onLoadCustomerHistory(customer.id),
                                        className: 'text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200'
                                    }, 'View History')
                                ]),
                                React.createElement('div', { className: 'grid grid-cols-3 gap-4 text-sm' }, [
                                    React.createElement('div', { key: 'points', className: 'text-center' }, [
                                        React.createElement('div', { className: 'font-bold text-lg text-green-600' }, customer.points),
                                        React.createElement('div', { className: 'text-gray-600' }, 'Points')
                                    ]),
                                    React.createElement('div', { key: 'spent', className: 'text-center' }, [
                                        React.createElement('div', { className: 'font-bold text-lg text-blue-600' }, `${parseFloat(customer.total_spent || 0).toFixed(0)}`),
                                        React.createElement('div', { className: 'text-gray-600' }, 'Total Spent')
                                    ]),
                                    React.createElement('div', { key: 'visits', className: 'text-center' }, [
                                        React.createElement('div', { className: 'font-bold text-lg text-purple-600' }, customer.visit_count || 0),
                                        React.createElement('div', { className: 'text-gray-600' }, 'Visits')
                                    ])
                                ])
                            ])
                        )
                    )
                ])
            ])
        ]);
    },

    // Sales View Component
    SalesView: ({ analytics, transactions }) => {
        const { DollarSign, BarChart3, Receipt, Users } = window.Icons;

        return React.createElement('div', { className: 'space-y-6' }, [
            // Stats Cards
            React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-4 gap-6' }, [
                React.createElement('div', { key: 'today-sales', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, "Today's Sales"),
                            React.createElement('p', { className: 'text-2xl font-bold text-green-600' }, `${analytics.todaySales.toFixed(2)}`)
                        ]),
                        React.createElement(DollarSign, { key: 'icon', className: 'text-green-600', size: 32 })
                    ])
                ]),
                React.createElement('div', { key: 'total-sales', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Total Sales'),
                            React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, `${analytics.totalSales.toFixed(2)}`)
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
                React.createElement('div', { key: 'customers', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Total Customers'),
                            React.createElement('p', { className: 'text-2xl font-bold text-indigo-600' }, analytics.totalCustomers)
                        ]),
                        React.createElement(Users, { key: 'icon', className: 'text-indigo-600', size: 32 })
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
                                        React.createElement('th', { key: 'customer', className: 'text-left p-3' }, 'Customer'),
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
                                        React.createElement('td', { key: 'customer', className: 'p-3 border-b' }, 
                                            transaction.customer_name ? 
                                                React.createElement('div', {}, [
                                                    React.createElement('div', { key: 'name', className: 'font-medium' }, transaction.customer_name),
                                                    React.createElement('div', { key: 'loyalty', className: 'text-xs text-gray-500' }, transaction.loyalty_number)
                                                ]) :
                                                React.createElement('span', { className: 'text-gray-400' }, 'Walk-in')
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
        ]);
    },
    InventoryView : ({ 
        products, 
        filters, 
        loading, 
        onAddProduct, 
        onEditProduct, 
        onDeleteProduct, 
        onBulkUpdate,
        onDuplicateProduct,
        searchFilters, 
        onFilterChange,
        selectedProducts,
        onProductSelect,
        onSelectAll,
        showProductModal,
        onShowProductModal,
        onCloseProductModal,
        currentProduct,
        viewMode,
        onViewModeChange
    }) => {
        const { Package, Plus, Edit, Trash2, Search, Grid3X3, List, Copy, Settings, Filter, Eye } = window.Icons;

        const [localSearchTerm, setLocalSearchTerm] = React.useState('');
        const [showFilters, setShowFilters] = React.useState(false);
        const [showBulkActions, setShowBulkActions] = React.useState(false);
        const [sortBy, setSortBy] = React.useState('name');
        const [sortOrder, setSortOrder] = React.useState('asc');

        // Debounced search
        React.useEffect(() => {
            const timer = setTimeout(() => {
                onFilterChange({ ...searchFilters, q: localSearchTerm });
            }, 300);
            return () => clearTimeout(timer);
        }, [localSearchTerm]);

        const handleBulkAction = (action, updates) => {
            if (selectedProducts.length === 0) {
                alert('Please select products first');
                return;
            }
            
            switch (action) {
                case 'activate':
                    onBulkUpdate(selectedProducts, { isActive: true });
                    break;
                case 'deactivate':
                    onBulkUpdate(selectedProducts, { isActive: false });
                    break;
                case 'feature':
                    onBulkUpdate(selectedProducts, { featured: true });
                    break;
                case 'unfeature':
                    onBulkUpdate(selectedProducts, { featured: false });
                    break;
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
                        selectedProducts.forEach(id => onDeleteProduct(id));
                    }
                    break;
                default:
                    if (updates) {
                        onBulkUpdate(selectedProducts, updates);
                    }
            }
        };

        const getStockStatus = (stock) => {
            if (stock <= 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
            if (stock <= 5) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
            if (stock <= 10) return { status: 'medium', color: 'bg-orange-100 text-orange-800', text: 'Medium Stock' };
            return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
        };

        const sortProducts = (productsToSort) => {
            return [...productsToSort].sort((a, b) => {
                let aValue = a[sortBy];
                let bValue = b[sortBy];
                
                // Handle different data types
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                
                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        };

        const sortedProducts = sortProducts(products);

const ProductCard = ({ product }) => {
    const stockInfo = getStockStatus(product.stock);
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    
    // Priority order for images: 1) Primary image from images array, 2) main_image_url, 3) emoji fallback
    const getProductImage = () => {
        if (primaryImage?.url) {
            return { type: 'url', src: primaryImage.url, alt: primaryImage.alt || product.name };
        }
        if (product.main_image_url) {
            return { type: 'url', src: product.main_image_url, alt: product.name };
        }
        return { type: 'emoji', src: product.image || '📦', alt: product.name };
    };

    const productImage = getProductImage();
    
    return React.createElement('div', { 
        className: `bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden ${
            selectedProducts.includes(product.id) ? 'ring-2 ring-blue-500' : ''
        }` 
    }, [
        // Product Image
        React.createElement('div', { key: 'image', className: 'relative h-48 bg-gray-100' }, [
            // Show actual image if available
            productImage.type === 'url' ? (
                React.createElement('img', {
                    key: 'product-img',
                    src: productImage.src,
                    alt: productImage.alt,
                    className: 'w-full h-full object-cover',
                    onError: (e) => {
                        // If image fails to load, show emoji fallback
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }
                })
            ) : null,
            
            // Emoji fallback (only shown if no URL image or if URL image fails)
            React.createElement('div', { 
                key: 'fallback',
                className: 'w-full h-full flex items-center justify-center text-6xl',
                style: { display: productImage.type === 'url' ? 'none' : 'flex' }
            }, productImage.src),
            
            // Stock badge
            React.createElement('div', { 
                key: 'stock-badge',
                className: `absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}` 
            }, stockInfo.text),
            
            // Featured badge
            product.featured && React.createElement('div', { 
                key: 'featured-badge',
                className: 'absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800' 
            }, '⭐ Featured'),
            
            // Selection checkbox
            React.createElement('div', { key: 'checkbox', className: 'absolute bottom-2 left-2' }, [
                React.createElement('input', {
                    type: 'checkbox',
                    checked: selectedProducts.includes(product.id),
                    onChange: (e) => onProductSelect(product.id, e.target.checked),
                    className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                })
            ]),

            // Active/Inactive indicator
            !product.is_active && React.createElement('div', { 
                key: 'inactive-overlay',
                className: 'absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center' 
            }, [
                React.createElement('span', { 
                    className: 'text-white font-medium px-3 py-1 bg-gray-800 rounded' 
                }, 'Inactive')
            ])
        ]),
        
        // Product Info (rest remains the same)
        React.createElement('div', { key: 'info', className: 'p-4' }, [
            React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-2' }, [
                React.createElement('div', { key: 'title-section', className: 'flex-1 pr-2' }, [
                    React.createElement('h3', { className: 'font-semibold text-lg line-clamp-2 mb-1' }, product.name),
                    React.createElement('p', { className: 'text-sm text-gray-600 font-mono' }, product.sku),
                    product.brand && React.createElement('p', { className: 'text-sm text-blue-600 font-medium' }, 
                        `${product.brand}${product.collection ? ` • ${product.collection}` : ''}`
                    )
                ]),
                React.createElement('div', { key: 'quick-actions', className: 'flex flex-col gap-1' }, [
                    React.createElement('button', {
                        onClick: () => onEditProduct(product),
                        className: 'p-1 text-gray-400 hover:text-blue-600 transition-colors rounded',
                        title: 'Edit Product'
                    }, React.createElement(Edit, { size: 16 })),
                    React.createElement('button', {
                        onClick: () => onDuplicateProduct(product.id),
                        className: 'p-1 text-gray-400 hover:text-green-600 transition-colors rounded',
                        title: 'Duplicate Product'
                    }, React.createElement(Copy, { size: 16 })),
                    React.createElement('button', {
                        onClick: () => onDeleteProduct(product.id),
                        className: 'p-1 text-gray-400 hover:text-red-600 transition-colors rounded',
                        title: 'Delete Product'
                    }, React.createElement(Trash2, { size: 16 }))
                ])
            ]),
            
            React.createElement('div', { key: 'details', className: 'space-y-3' }, [
                React.createElement('div', { className: 'flex justify-between items-center' }, [
                    React.createElement('span', { className: 'text-2xl font-bold text-green-600' }, 
                        `$${parseFloat(product.price).toFixed(2)}`
                    ),
                    React.createElement('div', { className: 'text-right' }, [
                        React.createElement('div', { className: 'text-sm font-medium' }, 
                            `Stock: ${product.stock}`
                        ),
                        React.createElement('div', { className: 'text-xs text-gray-500' }, 
                            product.category
                        )
                    ])
                ]),
                
                product.description && React.createElement('p', { 
                    className: 'text-sm text-gray-600 line-clamp-2' 
                }, product.description),
                
                // Product attributes
                React.createElement('div', { className: 'flex flex-wrap gap-1' }, [
                    product.material && React.createElement('span', { 
                        key: 'material',
                        className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                    }, product.material),
                    product.color && React.createElement('span', { 
                        key: 'color',
                        className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                    }, product.color),
                    product.laptop_size && React.createElement('span', { 
                        key: 'laptop',
                        className: 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded' 
                    }, `💻 ${product.laptop_size}`),
                    product.gender && product.gender !== 'Unisex' && React.createElement('span', { 
                        key: 'gender',
                        className: 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded' 
                    }, product.gender)
                ]),
                
                // Features preview
                product.features && product.features.length > 0 && React.createElement('div', { 
                    className: 'text-xs text-gray-500 flex items-center gap-1' 
                }, [
                    React.createElement('span', { key: 'features-icon' }, '✨'),
                    React.createElement('span', { key: 'features-count' }, `${product.features.length} features`)
                ])
            ])
        ])
    ]);
};
const ProductRow = ({ product }) => {
    const stockInfo = getStockStatus(product.stock);
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    
    // Priority order for images: 1) Primary image from images array, 2) main_image_url, 3) emoji fallback
    const getProductImage = () => {
        if (primaryImage?.url) {
            return { type: 'url', src: primaryImage.url, alt: primaryImage.alt || product.name };
        }
        if (product.main_image_url) {
            return { type: 'url', src: product.main_image_url, alt: product.name };
        }
        return { type: 'emoji', src: product.image || '📦', alt: product.name };
    };

    const productImage = getProductImage();
    
    return React.createElement('tr', { 
        className: `hover:bg-gray-50 border-b transition-colors ${
            selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
        } ${!product.is_active ? 'opacity-60' : ''}` 
    }, [
        React.createElement('td', { key: 'select', className: 'p-4' }, [
            React.createElement('input', {
                type: 'checkbox',
                checked: selectedProducts.includes(product.id),
                onChange: (e) => onProductSelect(product.id, e.target.checked),
                className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
            })
        ]),
        React.createElement('td', { key: 'product', className: 'p-4' }, [
            React.createElement('div', { className: 'flex items-center gap-3' }, [
                React.createElement('div', { className: 'w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0' }, [
                    // Show actual image if available
                    productImage.type === 'url' ? (
                        React.createElement('img', {
                            key: 'product-img',
                            src: productImage.src,
                            alt: productImage.alt,
                            className: 'w-full h-full object-cover',
                            onError: (e) => {
                                // If image fails to load, show emoji fallback
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }
                        })
                    ) : null,
                    
                    // Emoji fallback
                    React.createElement('span', { 
                        key: 'fallback',
                        className: 'text-xl',
                        style: { display: productImage.type === 'url' ? 'none' : 'block' }
                    }, productImage.src)
                ]),
                React.createElement('div', { className: 'min-w-0 flex-1' }, [
                    React.createElement('div', { className: 'font-medium truncate' }, product.name),
                    React.createElement('div', { className: 'text-sm text-gray-600 font-mono' }, product.sku),
                    product.brand && React.createElement('div', { className: 'text-sm text-blue-600' }, 
                        `${product.brand}${product.collection ? ` • ${product.collection}` : ''}`
                    )
                ])
            ])
        ]),
        React.createElement('td', { key: 'category', className: 'p-4' }, [
            React.createElement('div', { className: 'text-sm' }, product.category),
            product.product_type && React.createElement('div', { className: 'text-xs text-gray-500' }, product.product_type)
        ]),
        React.createElement('td', { key: 'price', className: 'p-4 font-medium text-green-600' }, 
            `$${parseFloat(product.price).toFixed(2)}`
        ),
        React.createElement('td', { key: 'attributes', className: 'p-4' }, [
            React.createElement('div', { className: 'flex flex-wrap gap-1' }, [
                product.material && React.createElement('span', { 
                    key: 'material',
                    className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                }, product.material),
                product.color && React.createElement('span', { 
                    key: 'color',
                    className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                }, product.color)
            ])
        ]),
        React.createElement('td', { key: 'stock', className: 'p-4' }, [
            React.createElement('div', { className: 'flex items-center gap-2' }, [
                React.createElement('span', { className: `px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}` }, 
                    product.stock
                ),
                React.createElement('span', { className: 'text-xs text-gray-500' }, stockInfo.text)
            ])
        ]),
        React.createElement('td', { key: 'status', className: 'p-4' }, [
            React.createElement('div', { className: 'flex flex-wrap gap-1' }, [
                React.createElement('span', { 
                    className: `px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }` 
                }, product.is_active ? 'Active' : 'Inactive'),
                product.featured && React.createElement('span', { 
                    key: 'featured',
                    className: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800' 
                }, '⭐ Featured')
            ])
        ]),
        React.createElement('td', { key: 'actions', className: 'p-4' }, [
            React.createElement('div', { className: 'flex gap-1' }, [
                React.createElement('button', {
                    onClick: () => onEditProduct(product),
                    className: 'p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors',
                    title: 'Edit'
                }, React.createElement(Edit, { size: 16 })),
                React.createElement('button', {
                    onClick: () => onDuplicateProduct(product.id),
                    className: 'p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors',
                    title: 'Duplicate'
                }, React.createElement(Copy, { size: 16 })),
                React.createElement('button', {
                    onClick: () => onDeleteProduct(product.id),
                    className: 'p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors',
                    title: 'Delete'
                }, React.createElement(Trash2, { size: 16 }))
            ])
        ])
    ]);
};
        const EmptyState = () => React.createElement('div', { 
            className: 'bg-white rounded-xl shadow-sm border p-12 text-center' 
        }, [
            React.createElement(Package, { 
                key: 'icon',
                className: 'mx-auto mb-4 text-gray-400', 
                size: 64 
            }),
            React.createElement('h3', { 
                key: 'title',
                className: 'text-xl font-semibold text-gray-900 mb-2' 
            }, 'No products found'),
            React.createElement('p', { 
                key: 'description',
                className: 'text-gray-600 mb-6 max-w-md mx-auto' 
            }, Object.keys(searchFilters).length > 0 
                ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                : 'Get started by adding your first product to the inventory.'
            ),
            React.createElement('button', {
                key: 'action',
                onClick: onShowProductModal,
                className: 'inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            }, [
                React.createElement(Plus, { key: 'icon', size: 20 }),
                'Add Product'
            ])
        ]);

        return React.createElement('div', { className: 'space-y-6' }, [
            // Header with controls
            React.createElement('div', { key: 'header', className: 'bg-white rounded-xl shadow-sm border p-6' }, [
                React.createElement('div', { className: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6' }, [
                    React.createElement('div', { key: 'title-section' }, [
                        React.createElement('h2', { className: 'text-2xl font-bold flex items-center gap-3' }, [
                            React.createElement(Package, { key: 'icon', size: 28 }),
                            'Product Inventory'
                        ]),
                        React.createElement('p', { className: 'text-gray-600 mt-1' }, [
                            `${products.length} products`,
                            products.filter(p => p.stock <= 5).length > 0 && 
                                ` • ${products.filter(p => p.stock <= 5).length} low stock`,
                            products.filter(p => !p.is_active).length > 0 && 
                                ` • ${products.filter(p => !p.is_active).length} inactive`
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'actions', className: 'flex flex-wrap gap-3' }, [
                        React.createElement('button', {
                            onClick: onShowProductModal,
                            className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        }, [
                            React.createElement(Plus, { key: 'icon', size: 20 }),
                            'Add Product'
                        ]),
                        
                        React.createElement('button', {
                            onClick: () => setShowFilters(!showFilters),
                            className: `flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                            }`
                        }, [
                            React.createElement(Filter, { key: 'icon', size: 20 }),
                            'Filters',
                            Object.keys(searchFilters).length > 0 && React.createElement('span', {
                                className: 'bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'
                            }, Object.keys(searchFilters).length)
                        ]),
                        
                        selectedProducts.length > 0 && React.createElement('button', {
                            onClick: () => setShowBulkActions(!showBulkActions),
                            className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        }, [
                            React.createElement(Settings, { key: 'icon', size: 20 }),
                            `Bulk Actions (${selectedProducts.length})`
                        ])
                    ])
                ]),

                // Quick search and view controls
                React.createElement('div', { className: 'flex flex-col sm:flex-row gap-4 items-center' }, [
                    React.createElement('div', { key: 'search', className: 'relative flex-1' }, [
                        React.createElement(Search, { 
                            className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                            size: 20 
                        }),
                        React.createElement('input', {
                            type: 'text',
                            value: localSearchTerm,
                            onChange: (e) => setLocalSearchTerm(e.target.value),
                            placeholder: 'Search products by name, SKU, description...',
                            className: 'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),
                    
                    React.createElement('div', { key: 'sort', className: 'flex items-center gap-2' }, [
                        React.createElement('select', {
                            value: sortBy,
                            onChange: (e) => setSortBy(e.target.value),
                            className: 'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'name', value: 'name' }, 'Name'),
                            React.createElement('option', { key: 'price', value: 'price' }, 'Price'),
                            React.createElement('option', { key: 'stock', value: 'stock' }, 'Stock'),
                            React.createElement('option', { key: 'created', value: 'created_at' }, 'Date Added')
                        ]),
                        React.createElement('button', {
                            onClick: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
                            className: 'p-2 border rounded-lg hover:bg-gray-50 transition-colors',
                            title: `Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`
                        }, sortOrder === 'asc' ? '↑' : '↓')
                    ]),
                    
                    // View mode toggle
                    React.createElement('div', { key: 'view-toggle', className: 'flex border rounded-lg overflow-hidden' }, [
                        React.createElement('button', {
                            onClick: () => onViewModeChange('grid'),
                            className: `p-2 transition-colors ${
                                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                            }`,
                            title: 'Grid View'
                        }, React.createElement(Grid3X3, { size: 20 })),
                        React.createElement('button', {
                            onClick: () => onViewModeChange('list'),
                            className: `p-2 transition-colors ${
                                viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                            }`,
                            title: 'List View'
                        }, React.createElement(List, { size: 20 }))
                    ])
                ])
            ]),

            // Filters panel
            showFilters && React.createElement('div', { key: 'filters', className: 'bg-white rounded-xl shadow-sm border p-6' }, [
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4' }, [
                    // Brand filter
                    React.createElement('div', { key: 'brand' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Brand'),
                        React.createElement('select', {
                            value: searchFilters.brand || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, brand: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Brands'),
                            ...(filters.brands || []).map(brand => 
                                React.createElement('option', { key: brand, value: brand }, brand)
                            )
                        ])
                    ]),
                    
                    // Collection filter
                    React.createElement('div', { key: 'collection' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Collection'),
                        React.createElement('select', {
                            value: searchFilters.collection || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, collection: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Collections'),
                            ...(filters.collections || []).map(collection => 
                                React.createElement('option', { key: collection, value: collection }, collection)
                            )
                        ])
                    ]),
                    
                    // Product Type filter
                    React.createElement('div', { key: 'type' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Type'),
                        React.createElement('select', {
                            value: searchFilters.productType || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, productType: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Types'),
                            ...(filters.productTypes || []).map(type => 
                                React.createElement('option', { key: type, value: type }, type)
                            )
                        ])
                    ]),
                    
                    // Material filter
                    React.createElement('div', { key: 'material' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Material'),
                        React.createElement('select', {
                            value: searchFilters.material || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, material: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Materials'),
                            ...(filters.materials || []).map(material => 
                                React.createElement('option', { key: material, value: material }, material)
                            )
                        ])
                    ]),
                    
                    // Status filter
                    React.createElement('div', { key: 'status' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Status'),
                        React.createElement('select', {
                            value: (() => {
                                if (searchFilters.inStock === 'true') return 'in-stock';
                                if (searchFilters.featured === 'true') return 'featured';
                                return '';
                            })(),
                            onChange: (e) => {
                                const value = e.target.value;
                                const newFilters = { ...searchFilters };
                                delete newFilters.inStock;
                                delete newFilters.featured;
                                
                                if (value === 'in-stock') newFilters.inStock = 'true';
                                else if (value === 'featured') newFilters.featured = 'true';
                                
                                onFilterChange(newFilters);
                            },
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Products'),
                            React.createElement('option', { key: 'in-stock', value: 'in-stock' }, 'In Stock Only'),
                            React.createElement('option', { key: 'featured', value: 'featured' }, 'Featured Only')
                        ])
                    ])
                ]),
                
                // Price range filters
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mt-4' }, [
                    React.createElement('div', { key: 'min-price' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Min Price ($)'),
                        React.createElement('input', {
                            type: 'number',
                            step: '0.01',
                            min: '0',
                            value: searchFilters.minPrice || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, minPrice: e.target.value || undefined }),
                            placeholder: '0.00',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),
                    React.createElement('div', { key: 'max-price' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Max Price ($)'),
                        React.createElement('input', {
                            type: 'number',
                            step: '0.01',
                            min: '0',
                            value: searchFilters.maxPrice || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, maxPrice: e.target.value || undefined }),
                            placeholder: '999.99',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ])
                ]),

                // Clear filters button
                Object.keys(searchFilters).length > 0 && React.createElement('div', { 
                    className: 'mt-4 pt-4 border-t flex justify-end' 
                }, [
                    React.createElement('button', {
                        onClick: () => onFilterChange({}),
                        className: 'px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
                    }, 'Clear All Filters')
                ])
            ]),

            // Bulk actions panel
            showBulkActions && selectedProducts.length > 0 && React.createElement('div', { 
                key: 'bulk-actions', 
                className: 'bg-white rounded-xl shadow-sm border p-6' 
            }, [
                React.createElement('div', { className: 'flex items-center justify-between mb-4' }, [
                    React.createElement('h3', { className: 'font-medium' }, `Bulk Actions (${selectedProducts.length} selected)`),
                    React.createElement('button', {
                        onClick: () => onSelectAll(false),
                        className: 'text-sm text-gray-500 hover:text-gray-700'
                    }, 'Clear Selection')
                ]),
                React.createElement('div', { className: 'flex flex-wrap gap-3' }, [
                    React.createElement('button', {
                        onClick: () => handleBulkAction('activate'),
                        className: 'px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors'
                    }, '✅ Activate'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('deactivate'),
                        className: 'px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors'
                    }, '⏸️ Deactivate'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('feature'),
                        className: 'px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
                    }, '⭐ Mark Featured'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('unfeature'),
                        className: 'px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors'
                    }, '⭐ Remove Featured'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('delete'),
                        className: 'px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors'
                    }, '🗑️ Delete Selected')
                ])
            ]),

            // Products display
            React.createElement('div', { key: 'products' }, [
                loading ? (
                    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border p-12 text-center' }, [
                        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' }),
                        React.createElement('p', { className: 'text-gray-600 text-lg' }, 'Loading products...'),
                        React.createElement('p', { className: 'text-gray-500 text-sm mt-2' }, 'Please wait while we fetch your inventory')
                    ])
                ) : sortedProducts.length === 0 ? (
                    React.createElement(EmptyState, { key: 'empty-state' })
                ) : viewMode === 'grid' ? (
                    // Grid view
                    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border' }, [
                        React.createElement('div', { className: 'p-6 border-b' }, [
                            React.createElement('div', { className: 'flex items-center justify-between mb-4' }, [
                                React.createElement('div', { className: 'flex items-center gap-4' }, [
                                    React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' }, [
                                        React.createElement('input', {
                                            type: 'checkbox',
                                            checked: selectedProducts.length === sortedProducts.length && sortedProducts.length > 0,
                                            onChange: (e) => onSelectAll(e.target.checked),
                                            className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                                        }),
                                        React.createElement('span', { className: 'text-sm font-medium' }, 'Select All')
                                    ])
                                ]),
                                React.createElement('div', { className: 'text-sm text-gray-600' }, 
                                    `Showing ${sortedProducts.length} products`
                                )
                            ])
                        ]),
                        React.createElement('div', { className: 'p-6' }, [
                            React.createElement('div', { 
                                className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
                            }, sortedProducts.map(product => 
                                React.createElement(ProductCard, { key: product.id, product })
                            ))
                        ])
                    ])
                ) : (
                    // List view
                    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border overflow-hidden' }, [
                        React.createElement('div', { className: 'overflow-x-auto' }, [
                            React.createElement('table', { className: 'w-full min-w-[800px]' }, [
                                React.createElement('thead', { key: 'thead', className: 'bg-gray-50 border-b' }, [
                                    React.createElement('tr', {}, [
                                        React.createElement('th', { key: 'select', className: 'p-4 text-left w-16' }, [
                                            React.createElement('input', {
                                                type: 'checkbox',
                                                checked: selectedProducts.length === sortedProducts.length && sortedProducts.length > 0,
                                                onChange: (e) => onSelectAll(e.target.checked),
                                                className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                                            })
                                        ]),
                                        React.createElement('th', { key: 'product', className: 'p-4 text-left font-medium text-gray-900' }, 'Product'),
                                        React.createElement('th', { key: 'category', className: 'p-4 text-left font-medium text-gray-900' }, 'Category'),
                                        React.createElement('th', { key: 'price', className: 'p-4 text-left font-medium text-gray-900' }, 'Price'),
                                        React.createElement('th', { key: 'attributes', className: 'p-4 text-left font-medium text-gray-900' }, 'Attributes'),
                                        React.createElement('th', { key: 'stock', className: 'p-4 text-left font-medium text-gray-900' }, 'Stock'),
                                        React.createElement('th', { key: 'status', className: 'p-4 text-left font-medium text-gray-900' }, 'Status'),
                                        React.createElement('th', { key: 'actions', className: 'p-4 text-left font-medium text-gray-900 w-32' }, 'Actions')
                                    ])
                                ]),
                                React.createElement('tbody', { key: 'tbody' }, 
                                    sortedProducts.map(product => React.createElement(ProductRow, { key: product.id, product }))
                                )
                            ])
                        ]),
                        React.createElement('div', { className: 'p-4 border-t bg-gray-50 text-center text-sm text-gray-600' }, 
                            `Showing ${sortedProducts.length} of ${products.length} products`
                        )
                    ])
                )
            ])
        ]);
    }
};