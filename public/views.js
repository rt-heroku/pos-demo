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
                        React.createElement('div', { key: 'emoji', className: 'text-3xl mb-2' }, product.image),
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
    }
};