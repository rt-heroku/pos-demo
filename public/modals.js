// public/modals.js - Modal components
window.Modals = {
    // Loyalty Modal Component
    LoyaltyModal: ({ 
        show, 
        onClose, 
        loyaltyNumber, 
        setLoyaltyNumber, 
        onSearchByLoyalty, 
        loyaltySearchTerm, 
        setLoyaltySearchTerm, 
        onSearchCustomers, 
        customerSearchResults, 
        onSelectCustomer, 
        loading 
    }) => {
        if (!show) return null;

        const { X } = window.Icons;

        return React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        }, [
            React.createElement('div', { key: 'modal', className: 'bg-white rounded-lg p-6 max-w-md w-full' }, [
                React.createElement('div', { key: 'header', className: 'flex justify-between items-center mb-6' }, [
                    React.createElement('h2', { className: 'text-xl font-bold' }, 'Loyalty Customer'),
                    React.createElement('button', {
                        onClick: onClose,
                        className: 'text-gray-400 hover:text-gray-600'
                    }, React.createElement(X, { size: 24 }))
                ]),

                React.createElement('div', { key: 'content', className: 'space-y-4' }, [
                    React.createElement('div', { key: 'loyalty-input' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Loyalty Number'),
                        React.createElement('input', {
                            type: 'text',
                            value: loyaltyNumber,
                            onChange: (e) => setLoyaltyNumber(e.target.value.toUpperCase()),
                            placeholder: 'Enter loyalty number (e.g., LOY001)',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),

                    React.createElement('button', {
                        onClick: () => onSearchByLoyalty(loyaltyNumber),
                        disabled: !loyaltyNumber.trim() || loading,
                        className: 'w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors'
                    }, loading ? 'Searching...' : 'Search Customer'),

                    React.createElement('div', { key: 'divider', className: 'text-center text-gray-500' }, 'OR'),

                    React.createElement('div', { key: 'search-input' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Search by Name/Email'),
                        React.createElement('input', {
                            type: 'text',
                            value: loyaltySearchTerm,
                            onChange: (e) => {
                                setLoyaltySearchTerm(e.target.value);
                                onSearchCustomers(e.target.value);
                            },
                            placeholder: 'Enter name or email',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),

                    customerSearchResults.length > 0 && React.createElement('div', { key: 'search-results', className: 'max-h-40 overflow-y-auto border rounded-lg' }, 
                        customerSearchResults.map(customer => 
                            React.createElement('button', {
                                key: customer.id,
                                onClick: () => onSelectCustomer(customer),
                                className: 'w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0'
                            }, [
                                React.createElement('div', { key: 'name', className: 'font-medium' }, customer.name),
                                React.createElement('div', { key: 'details', className: 'text-sm text-gray-600' }, 
                                    `${customer.loyalty_number} • ${customer.points} points • ${customer.email || 'No email'}`
                                )
                            ])
                        )
                    )
                ])
            ])
        ]);
    },

    // New Customer Form Modal
    NewCustomerModal: ({ 
        show, 
        onClose, 
        newCustomerForm, 
        setNewCustomerForm, 
        onCreateCustomer, 
        loyaltyNumber, 
        loading 
    }) => {
        if (!show) return null;

        const { X } = window.Icons;

        return React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        }, [
            React.createElement('div', { key: 'modal', className: 'bg-white rounded-lg p-6 max-w-md w-full' }, [
                React.createElement('div', { key: 'header', className: 'flex justify-between items-center mb-6' }, [
                    React.createElement('h2', { className: 'text-xl font-bold' }, 'Create New Customer'),
                    React.createElement('button', {
                        onClick: onClose,
                        className: 'text-gray-400 hover:text-gray-600'
                    }, React.createElement(X, { size: 24 }))
                ]),

                React.createElement('div', { key: 'form', className: 'space-y-4' }, [
                    React.createElement('div', { key: 'loyalty-display' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Loyalty Number'),
                        React.createElement('input', {
                            type: 'text',
                            value: newCustomerForm.loyaltyNumber || loyaltyNumber,
                            readOnly: true,
                            className: 'w-full p-2 border rounded-lg bg-gray-100'
                        })
                    ]),
                    React.createElement('div', { key: 'name-field' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Name *'),
                        React.createElement('input', {
                            type: 'text',
                            value: newCustomerForm.name,
                            onChange: (e) => setNewCustomerForm({...newCustomerForm, name: e.target.value}),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            required: true
                        })
                    ]),
                    React.createElement('div', { key: 'email-field' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Email'),
                        React.createElement('input', {
                            type: 'email',
                            value: newCustomerForm.email,
                            onChange: (e) => setNewCustomerForm({...newCustomerForm, email: e.target.value}),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),
                    React.createElement('div', { key: 'phone-field' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Phone'),
                        React.createElement('input', {
                            type: 'tel',
                            value: newCustomerForm.phone,
                            onChange: (e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value}),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ])
                ]),

                React.createElement('div', { key: 'actions', className: 'flex gap-3 mt-6' }, [
                    React.createElement('button', {
                        onClick: onClose,
                        className: 'flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
                    }, 'Cancel'),
                    React.createElement('button', {
                        onClick: onCreateCustomer,
                        disabled: loading || !newCustomerForm.name.trim(),
                        className: 'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors'
                    }, loading ? 'Creating...' : 'Create Customer')
                ])
            ])
        ]);
    },

    // Customer History Modal
    CustomerHistoryModal: ({ show, onClose, customerHistory, loading }) => {
        if (!show) return null;

        const { X } = window.Icons;

        return React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        }, [
            React.createElement('div', { key: 'modal', className: 'bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto' }, [
                React.createElement('div', { key: 'header', className: 'flex justify-between items-center mb-6' }, [
                    React.createElement('h2', { className: 'text-xl font-bold' }, 'Customer Purchase History'),
                    React.createElement('button', {
                        onClick: onClose,
                        className: 'text-gray-400 hover:text-gray-600'
                    }, React.createElement(X, { size: 24 }))
                ]),

                React.createElement('div', { key: 'history', className: 'space-y-4' }, 
                    customerHistory.length === 0 ? 
                        React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'No purchase history found') :
                        customerHistory.map(transaction => 
                            React.createElement('div', { key: transaction.id, className: 'border rounded-lg p-4' }, [
                                React.createElement('div', { key: 'transaction-header', className: 'flex justify-between items-start mb-3' }, [
                                    React.createElement('div', { key: 'date-info' }, [
                                        React.createElement('div', { className: 'font-medium' }, 
                                            new Date(transaction.created_at).toLocaleDateString()
                                        ),
                                        React.createElement('div', { className: 'text-sm text-gray-600' }, 
                                            `Transaction #${transaction.id} • ${transaction.payment_method}`
                                        )
                                    ]),
                                    React.createElement('div', { key: 'total-info', className: 'text-right' }, [
                                        React.createElement('div', { className: 'font-bold text-lg' }, 
                                            `$${parseFloat(transaction.total).toFixed(2)}`
                                        ),
                                        React.createElement('div', { className: 'text-sm text-green-600' }, 
                                            `+${transaction.points_earned} points`
                                        )
                                    ])
                                ]),
                                React.createElement('div', { key: 'items', className: 'space-y-2' }, 
                                    transaction.items && transaction.items.map((item, index) => 
                                        React.createElement('div', { key: index, className: 'flex justify-between text-sm bg-gray-50 p-2 rounded' }, [
                                            React.createElement('span', { key: 'item-name' }, `${item.name} x${item.quantity}`),
                                            React.createElement('span', { key: 'item-total' }, `$${parseFloat(item.subtotal).toFixed(2)}`)
                                        ])
                                    )
                                )
                            ])
                        )
                )
            ])
        ]);
    },

    // Receipt Modal Component
    ReceiptModal: ({ show, onClose, transaction, subtotal, tax, total, paymentMethod, amountReceived, change }) => {
        if (!show || !transaction) return null;

        return React.createElement('div', { 
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' 
        }, [
            React.createElement('div', { key: 'modal', className: 'bg-white rounded-lg p-6 max-w-md w-full' }, [
                React.createElement('div', { key: 'header', className: 'text-center mb-6' }, [
                    React.createElement('h2', { className: 'text-2xl font-bold' }, 'Receipt'),
                    React.createElement('p', { className: 'text-gray-600' }, `Transaction #${transaction.id}`),
                    React.createElement('p', { className: 'text-sm text-gray-500' }, 
                        new Date().toLocaleString()
                    )
                ]),

                transaction.customer && React.createElement('div', { key: 'customer-info', className: 'mb-4 p-3 bg-green-50 border border-green-200 rounded' }, [
                    React.createElement('div', { className: 'font-medium text-green-800' }, transaction.customer.name),
                    React.createElement('div', { className: 'text-sm text-green-600' }, `${transaction.customer.loyalty_number} • +${Math.floor(total)} points earned`)
                ]),

                React.createElement('div', { key: 'items', className: 'space-y-2 mb-4' }, 
                    transaction.items.map(item =>
                        React.createElement('div', { key: item.id, className: 'flex justify-between' }, [
                            React.createElement('span', { key: 'item' }, `${item.name} x${item.quantity}`),
                            React.createElement('span', { key: 'price' }, `$${(item.price * item.quantity).toFixed(2)}`)
                        ])
                    )
                ),

                React.createElement('div', { key: 'totals', className: 'border-t pt-4 space-y-1' }, [
                    React.createElement('div', { className: 'flex justify-between' }, [
                        React.createElement('span', { key: 'label' }, 'Subtotal:'),
                        React.createElement('span', { key: 'value' }, `$${subtotal.toFixed(2)}`)
                    ]),
                    React.createElement('div', { className: 'flex justify-between' }, [
                        React.createElement('span', { key: 'label' }, 'Tax:'),
                        React.createElement('span', { key: 'value' }, `$${tax.toFixed(2)}`)
                    ]),
                    React.createElement('div', { className: 'flex justify-between font-bold text-lg' }, [
                        React.createElement('span', { key: 'label' }, 'Total:'),
                        React.createElement('span', { key: 'value' }, `$${total.toFixed(2)}`)
                    ]),
                    paymentMethod === 'cash' && amountReceived && [
                        React.createElement('div', { key: 'received', className: 'flex justify-between' }, [
                            React.createElement('span', { key: 'label' }, 'Amount Received:'),
                            React.createElement('span', { key: 'value' }, `$${parseFloat(amountReceived).toFixed(2)}`)
                        ]),
                        React.createElement('div', { key: 'change', className: 'flex justify-between' }, [
                            React.createElement('span', { key: 'label' }, 'Change:'),
                            React.createElement('span', { key: 'value' }, `$${change.toFixed(2)}`)
                        ])
                    ]
                ]),

                React.createElement('div', { key: 'footer', className: 'text-center mt-6' }, [
                    React.createElement('p', { className: 'text-sm text-gray-600 mb-4' }, 'Thank you for your business!'),
                    React.createElement('button', {
                        onClick: onClose,
                        className: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                    }, 'Close')
                ])
            ])
        ]);
    },

    //Product Modal
    ProductModal : ({ 
            show, 
            onClose, 
            product, 
            onSave, 
            loading, 
            filters 
        }) => {
            if (!show) return null;

            const { X } = window.Icons;
            
            const [formData, setFormData] = React.useState({
                name: '',
                price: '',
                category: '',
                stock: '',
                image: '📦'
            });

            // Initialize form data when product changes
            React.useEffect(() => {
                if (product) {
                    setFormData({
                        name: product.name || '',
                        price: product.price?.toString() || '',
                        category: product.category || '',
                        stock: product.stock?.toString() || '',
                        image: product.image || '📦'
                    });
                } else {
                    setFormData({
                        name: '',
                        price: '',
                        category: '',
                        stock: '',
                        image: '📦'
                    });
                }
            }, [product]);

            const handleInputChange = (field, value) => {
                setFormData(prev => ({ ...prev, [field]: value }));
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                console.log('=== FORM SUBMIT TRIGGERED ===');
                console.log('Form data:', formData);
                
                // Validation
                if (!formData.name.trim()) {
                    alert('Product name is required');
                    return;
                }
                if (!formData.price || parseFloat(formData.price) < 0) {
                    alert('Valid price is required');
                    return;
                }
                if (!formData.category.trim()) {
                    alert('Category is required');
                    return;
                }
                if (!formData.stock || parseInt(formData.stock) < 0) {
                    alert('Valid stock quantity is required');
                    return;
                }

                console.log('Validation passed, calling onSave...');

                // Prepare data for submission
                const submitData = {
                    name: formData.name.trim(),
                    price: parseFloat(formData.price),
                    category: formData.category.trim(),
                    stock: parseInt(formData.stock),
                    image: formData.image
                };

                console.log('Calling onSave with:', submitData);
                onSave(submitData);
            };

            // IMPORTANT: Handle button click directly instead of relying on form submission
            const handleSaveClick = () => {
                console.log('=== SAVE BUTTON DIRECT CLICK ===');
                
                // Validation
                if (!formData.name.trim()) {
                    alert('Product name is required');
                    return;
                }
                if (!formData.price || parseFloat(formData.price) < 0) {
                    alert('Valid price is required');
                    return;
                }
                if (!formData.category.trim()) {
                    alert('Category is required');
                    return;
                }
                if (!formData.stock || parseInt(formData.stock) < 0) {
                    alert('Valid stock quantity is required');
                    return;
                }

                console.log('Direct click validation passed');

                // Prepare data for submission
                const submitData = {
                    name: formData.name.trim(),
                    price: parseFloat(formData.price),
                    category: formData.category.trim(),
                    stock: parseInt(formData.stock),
                    image: formData.image
                };

                console.log('Direct click calling onSave with:', submitData);
                onSave(submitData);
            };

            return React.createElement('div', {
                className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
            }, [
                React.createElement('div', { 
                    key: 'modal',
                    className: 'bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'
                }, [
                    // Header
                    React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b flex justify-between items-center' }, [
                        React.createElement('h2', { className: 'text-xl font-bold' }, 
                            product ? 'Edit Product' : 'Add New Product'
                        ),
                        React.createElement('button', {
                            onClick: onClose,
                            className: 'text-gray-400 hover:text-gray-600 transition-colors'
                        }, React.createElement(X, { size: 24 }))
                    ]),

                    // Form Content - Make sure form and submit button are properly connected
                    React.createElement('div', { key: 'content', className: 'flex-1 overflow-y-auto p-6' }, [
                        React.createElement('div', { className: 'space-y-4' }, [
                            // Product Name
                            React.createElement('div', { key: 'name' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Product Name *'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: formData.name,
                                    onChange: (e) => handleInputChange('name', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: 'Enter product name',
                                    required: true
                                })
                            ]),

                            // Price
                            React.createElement('div', { key: 'price' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Price *'),
                                React.createElement('input', {
                                    type: 'number',
                                    step: '0.01',
                                    min: '0',
                                    value: formData.price,
                                    onChange: (e) => handleInputChange('price', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: '0.00',
                                    required: true
                                })
                            ]),

                            // Category
                            React.createElement('div', { key: 'category' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Category *'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: formData.category,
                                    onChange: (e) => handleInputChange('category', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: 'e.g., Luggage, Backpacks, Accessories',
                                    required: true
                                })
                            ]),

                            // Stock
                            React.createElement('div', { key: 'stock' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Stock Quantity *'),
                                React.createElement('input', {
                                    type: 'number',
                                    min: '0',
                                    value: formData.stock,
                                    onChange: (e) => handleInputChange('stock', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: '0',
                                    required: true
                                })
                            ]),

                            // Emoji Icon
                            React.createElement('div', { key: 'emoji' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Emoji Icon'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: formData.image,
                                    onChange: (e) => handleInputChange('image', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: '📦'
                                })
                            ])
                        ])
                    ]),

                    // Footer with buttons OUTSIDE of form but with direct click handlers
                    React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end' }, [
                        React.createElement('button', {
                            type: 'button',
                            onClick: () => {
                                console.log('Cancel button clicked');
                                onClose();
                            },
                            disabled: loading,
                            className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
                        }, 'Cancel'),
                        React.createElement('button', {
                            type: 'button', // Changed to button and using direct click handler
                            onClick: () => {
                                console.log('Submit button clicked - calling handleSaveClick');
                                handleSaveClick(); // Use direct click handler
                            },
                            disabled: loading,
                            className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2'
                        }, [
                            loading && React.createElement('div', { 
                                key: 'spinner',
                                className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                            }),
                            loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')
                        ])
                    ])
                ])
            ]);
        }

};