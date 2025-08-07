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
};

window.Modals.ProductModal = ({ 
    show, 
    onClose, 
    product, 
    onSave, 
    loading, 
    filters 
}) => {
    if (!show) return null;

    const { X, Plus, Trash2, Upload, Image } = window.Icons;
    
    const [formData, setFormData] = React.useState({
        name: '',
        sku: '',
        price: '',
        category: '',
        stock: '',
        productType: '',
        laptopSize: '',
        brand: '',
        collection: '',
        material: '',
        gender: 'Unisex',
        color: '',
        description: '',
        dimensions: '',
        weight: '',
        warrantyInfo: '',
        careInstructions: '',
        mainImageUrl: '',
        image: '📦',
        isActive: true,
        featured: false,
        images: [],
        features: []
    });

    const [activeTab, setActiveTab] = React.useState('basic');
    const [newFeature, setNewFeature] = React.useState({ name: '', value: '' });
    const [newImage, setNewImage] = React.useState({ url: '', alt: '', isPrimary: false });

    // Initialize form data when product changes
    React.useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                price: product.price?.toString() || '',
                category: product.category || '',
                stock: product.stock?.toString() || '',
                productType: product.product_type || '',
                laptopSize: product.laptop_size || '',
                brand: product.brand || '',
                collection: product.collection || '',
                material: product.material || '',
                gender: product.gender || 'Unisex',
                color: product.color || '',
                description: product.description || '',
                dimensions: product.dimensions || '',
                weight: product.weight?.toString() || '',
                warrantyInfo: product.warranty_info || '',
                careInstructions: product.care_instructions || '',
                mainImageUrl: product.main_image_url || '',
                image: product.image || '📦',
                isActive: product.is_active !== false,
                featured: product.featured || false,
                images: product.images || [],
                features: product.features || []
            });
        } else {
            // Reset form for new product
            setFormData({
                name: '',
                sku: '',
                price: '',
                category: '',
                stock: '',
                productType: '',
                laptopSize: '',
                brand: '',
                collection: '',
                material: '',
                gender: 'Unisex',
                color: '',
                description: '',
                dimensions: '',
                weight: '',
                warrantyInfo: '',
                careInstructions: '',
                mainImageUrl: '',
                image: '📦',
                isActive: true,
                featured: false,
                images: [],
                features: []
            });
        }
    }, [product]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addFeature = () => {
        if (newFeature.name.trim() && newFeature.value.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, { ...newFeature }]
            }));
            setNewFeature({ name: '', value: '' });
        }
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const addImage = () => {
        if (newImage.url.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { ...newImage, sortOrder: prev.images.length }]
            }));
            setNewImage({ url: '', alt: '', isPrimary: false });
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const setPrimaryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => ({
                ...img,
                isPrimary: i === index
            }))
        }));
    };

    // Working save function (based on the fix that worked)
    const handleSave = () => {
        console.log('=== ENHANCED SAVE TRIGGERED ===');
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

        console.log('Enhanced validation passed, calling onSave...');

        // Prepare data for submission with all enhanced fields
        const submitData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            weight: formData.weight ? parseFloat(formData.weight) : null
        };

        console.log('Enhanced save calling onSave with:', submitData);
        onSave(submitData);
    };

    const TabButton = ({ tab, label, active }) => (
        React.createElement('button', {
            type: 'button',
            onClick: () => setActiveTab(tab),
            className: `px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`
        }, label)
    );

    return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    }, [
        React.createElement('div', { 
            key: 'modal',
            className: 'bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'
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

            // Tab Navigation
            React.createElement('div', { key: 'tabs', className: 'px-6 py-3 border-b bg-gray-50' }, [
                React.createElement('div', { className: 'flex gap-2' }, [
                    React.createElement(TabButton, { 
                        key: 'basic', 
                        tab: 'basic', 
                        label: 'Basic Info', 
                        active: activeTab === 'basic' 
                    }),
                    React.createElement(TabButton, { 
                        key: 'details', 
                        tab: 'details', 
                        label: 'Details', 
                        active: activeTab === 'details' 
                    }),
                    React.createElement(TabButton, { 
                        key: 'images', 
                        tab: 'images', 
                        label: 'Images', 
                        active: activeTab === 'images' 
                    }),
                    React.createElement(TabButton, { 
                        key: 'features', 
                        tab: 'features', 
                        label: 'Features', 
                        active: activeTab === 'features' 
                    })
                ])
            ]),

            // Form Content
            React.createElement('div', { 
                key: 'content',
                className: 'flex-1 overflow-y-auto p-6'
            }, [
                // Basic Info Tab
                activeTab === 'basic' && React.createElement('div', { className: 'space-y-6' }, [
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
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

                        // SKU
                        React.createElement('div', { key: 'sku' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'SKU'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.sku,
                                onChange: (e) => handleInputChange('sku', e.target.value.toUpperCase()),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'Auto-generated if empty'
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

                        // Product Type
                        React.createElement('div', { key: 'productType' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Product Type'),
                            React.createElement('select', {
                                value: formData.productType,
                                onChange: (e) => handleInputChange('productType', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }, [
                                React.createElement('option', { key: 'empty', value: '' }, 'Select Type'),
                                React.createElement('option', { key: 'luggage', value: 'Luggage' }, 'Luggage'),
                                React.createElement('option', { key: 'backpack', value: 'Backpack' }, 'Backpack'),
                                React.createElement('option', { key: 'briefcase', value: 'Briefcase' }, 'Briefcase'),
                                React.createElement('option', { key: 'duffel', value: 'Duffel' }, 'Duffel'),
                                React.createElement('option', { key: 'tote', value: 'Tote' }, 'Tote'),
                                React.createElement('option', { key: 'portfolio', value: 'Portfolio' }, 'Portfolio'),
                                React.createElement('option', { key: 'accessory', value: 'Accessory' }, 'Accessory')
                            ])
                        ]),

                        // Brand
                        React.createElement('div', { key: 'brand' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Brand'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.brand,
                                onChange: (e) => handleInputChange('brand', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'e.g., TUMI, Samsonite'
                            })
                        ]),

                        // Collection
                        React.createElement('div', { key: 'collection' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Collection'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.collection,
                                onChange: (e) => handleInputChange('collection', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'e.g., 19 Degree, Alpha, Voyageur'
                            })
                        ])
                    ]),

                    // Description
                    React.createElement('div', { key: 'description' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Description'),
                        React.createElement('textarea', {
                            value: formData.description,
                            onChange: (e) => handleInputChange('description', e.target.value),
                            rows: 4,
                            className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            placeholder: 'Detailed product description...'
                        })
                    ]),

                    // Status toggles
                    React.createElement('div', { key: 'status', className: 'flex gap-6' }, [
                        React.createElement('label', { className: 'flex items-center gap-2' }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: formData.isActive,
                                onChange: (e) => handleInputChange('isActive', e.target.checked),
                                className: 'w-4 h-4 text-blue-600 rounded'
                            }),
                            React.createElement('span', { className: 'text-sm font-medium' }, 'Active Product')
                        ]),
                        React.createElement('label', { className: 'flex items-center gap-2' }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: formData.featured,
                                onChange: (e) => handleInputChange('featured', e.target.checked),
                                className: 'w-4 h-4 text-blue-600 rounded'
                            }),
                            React.createElement('span', { className: 'text-sm font-medium' }, 'Featured Product')
                        ])
                    ])
                ]),

                // Details Tab
                activeTab === 'details' && React.createElement('div', { className: 'space-y-6' }, [
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
                        // Material
                        React.createElement('div', { key: 'material' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Material'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.material,
                                onChange: (e) => handleInputChange('material', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'e.g., Ballistic Nylon, Polycarbonate, Leather'
                            })
                        ]),

                        // Color
                        React.createElement('div', { key: 'color' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Color'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.color,
                                onChange: (e) => handleInputChange('color', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'e.g., Black, Navy, Silver'
                            })
                        ]),

                        // Gender
                        React.createElement('div', { key: 'gender' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Gender'),
                            React.createElement('select', {
                                value: formData.gender,
                                onChange: (e) => handleInputChange('gender', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }, [
                                React.createElement('option', { key: 'unisex', value: 'Unisex' }, 'Unisex'),
                                React.createElement('option', { key: 'men', value: 'Men' }, 'Men'),
                                React.createElement('option', { key: 'women', value: 'Women' }, 'Women')
                            ])
                        ]),

                        // Laptop Size
                        React.createElement('div', { key: 'laptopSize' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Laptop Size'),
                            React.createElement('select', {
                                value: formData.laptopSize,
                                onChange: (e) => handleInputChange('laptopSize', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }, [
                                React.createElement('option', { key: 'none', value: '' }, 'Not Applicable'),
                                React.createElement('option', { key: '13', value: '13"' }, 'Up to 13"'),
                                React.createElement('option', { key: '15', value: '15"' }, 'Up to 15"'),
                                React.createElement('option', { key: '17', value: '17"' }, 'Up to 17"')
                            ])
                        ]),

                        // Dimensions
                        React.createElement('div', { key: 'dimensions' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Dimensions'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.dimensions,
                                onChange: (e) => handleInputChange('dimensions', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'e.g., 22" x 14" x 9"'
                            })
                        ]),

                        // Weight
                        React.createElement('div', { key: 'weight' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Weight (lbs)'),
                            React.createElement('input', {
                                type: 'number',
                                step: '0.1',
                                min: '0',
                                value: formData.weight,
                                onChange: (e) => handleInputChange('weight', e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: '0.0'
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
                    ]),

                    // Warranty Info
                    React.createElement('div', { key: 'warranty' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Warranty Information'),
                        React.createElement('textarea', {
                            value: formData.warrantyInfo,
                            onChange: (e) => handleInputChange('warrantyInfo', e.target.value),
                            rows: 3,
                            className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            placeholder: 'e.g., 5-year warranty against manufacturing defects'
                        })
                    ]),

                    // Care Instructions
                    React.createElement('div', { key: 'care' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Care Instructions'),
                        React.createElement('textarea', {
                            value: formData.careInstructions,
                            onChange: (e) => handleInputChange('careInstructions', e.target.value),
                            rows: 3,
                            className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            placeholder: 'Care and maintenance instructions...'
                        })
                    ])
                ]),

                // Images Tab
                activeTab === 'images' && React.createElement('div', { className: 'space-y-6' }, [
                    // Main Image URL
                    React.createElement('div', { key: 'main-image' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Main Image URL'),
                        React.createElement('input', {
                            type: 'url',
                            value: formData.mainImageUrl,
                            onChange: (e) => handleInputChange('mainImageUrl', e.target.value),
                            className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            placeholder: 'https://example.com/product-image.jpg'
                        })
                    ]),

                    // Additional Images
                    React.createElement('div', { key: 'additional-images' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-4' }, 'Additional Images'),
                        
                        // Add new image form
                        React.createElement('div', { className: 'bg-gray-50 p-4 rounded-lg mb-4' }, [
                            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-3' }, [
                                React.createElement('input', {
                                    type: 'url',
                                    value: newImage.url,
                                    onChange: (e) => setNewImage(prev => ({ ...prev, url: e.target.value })),
                                    className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: 'Image URL'
                                }),
                                React.createElement('input', {
                                    type: 'text',
                                    value: newImage.alt,
                                    onChange: (e) => setNewImage(prev => ({ ...prev, alt: e.target.value })),
                                    className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                    placeholder: 'Alt text'
                                }),
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('label', { className: 'flex items-center gap-2' }, [
                                        React.createElement('input', {
                                            type: 'checkbox',
                                            checked: newImage.isPrimary,
                                            onChange: (e) => setNewImage(prev => ({ ...prev, isPrimary: e.target.checked })),
                                            className: 'w-4 h-4 text-blue-600 rounded'
                                        }),
                                        React.createElement('span', { className: 'text-sm' }, 'Primary')
                                    ])
                                ])
                            ]),
                            React.createElement('button', {
                                type: 'button',
                                onClick: addImage,
                                className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                            }, [
                                React.createElement(Plus, { key: 'icon', size: 16 }),
                                'Add Image'
                            ])
                        ]),

                        // Images list
                        formData.images.length > 0 && React.createElement('div', { className: 'space-y-3' }, 
                            formData.images.map((image, index) => 
                                React.createElement('div', { 
                                    key: index,
                                    className: 'flex items-center gap-4 p-3 border rounded-lg' 
                                }, [
                                    React.createElement('div', { key: 'preview', className: 'w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden' }, [
                                        image.url ? React.createElement('img', {
                                            src: image.url,
                                            alt: image.alt,
                                            className: 'w-full h-full object-cover'
                                        }) : React.createElement(Image, { size: 24, className: 'text-gray-400' })
                                    ]),
                                    React.createElement('div', { key: 'info', className: 'flex-1' }, [
                                        React.createElement('div', { className: 'font-medium' }, image.alt || 'No alt text'),
                                        React.createElement('div', { className: 'text-sm text-gray-600 truncate' }, image.url),
                                        image.isPrimary && React.createElement('span', { 
                                            className: 'inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1' 
                                        }, 'Primary Image')
                                    ]),
                                    React.createElement('div', { key: 'actions', className: 'flex gap-2' }, [
                                        !image.isPrimary && React.createElement('button', {
                                            type: 'button',
                                            onClick: () => setPrimaryImage(index),
                                            className: 'px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'
                                        }, 'Set Primary'),
                                        React.createElement('button', {
                                            type: 'button',
                                            onClick: () => removeImage(index),
                                            className: 'p-1 text-red-600 hover:bg-red-50 rounded transition-colors'
                                        }, React.createElement(Trash2, { size: 16 }))
                                    ])
                                ])
                            )
                        )
                    ])
                ]),

                // Features Tab
                activeTab === 'features' && React.createElement('div', { className: 'space-y-6' }, [
                    React.createElement('div', { key: 'add-feature', className: 'bg-gray-50 p-4 rounded-lg' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-3' }, 'Add Feature'),
                        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-3' }, [
                            React.createElement('input', {
                                type: 'text',
                                value: newFeature.name,
                                onChange: (e) => setNewFeature(prev => ({ ...prev, name: e.target.value })),
                                className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'Feature name (e.g., Water Resistant, USB Port)'
                            }),
                            React.createElement('input', {
                                type: 'text',
                                value: newFeature.value,
                                onChange: (e) => setNewFeature(prev => ({ ...prev, value: e.target.value })),
                                className: 'p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                placeholder: 'Feature value (e.g., Yes, Integrated charging port)'
                            })
                        ]),
                        React.createElement('button', {
                            type: 'button',
                            onClick: addFeature,
                            className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        }, [
                            React.createElement(Plus, { key: 'icon', size: 16 }),
                            'Add Feature'
                        ])
                    ]),

                    // Features list
                    formData.features.length > 0 && React.createElement('div', { key: 'features-list' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-3' }, 'Product Features'),
                        React.createElement('div', { className: 'space-y-2' }, 
                            formData.features.map((feature, index) => 
                                React.createElement('div', { 
                                    key: index,
                                    className: 'flex items-center justify-between p-3 border rounded-lg' 
                                }, [
                                    React.createElement('div', { key: 'feature-info' }, [
                                        React.createElement('span', { className: 'font-medium' }, feature.name),
                                        React.createElement('span', { className: 'text-gray-600 ml-2' }, `: ${feature.value}`)
                                    ]),
                                    React.createElement('button', {
                                        key: 'remove',
                                        type: 'button',
                                        onClick: () => removeFeature(index),
                                        className: 'p-1 text-red-600 hover:bg-red-50 rounded transition-colors'
                                    }, React.createElement(Trash2, { size: 16 }))
                                ])
                            )
                        )
                    ])
                ])
            ]),

            // Footer - Using the working button structure
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
                    type: 'button',
                    onClick: () => {
                        console.log('Enhanced submit button clicked - calling handleSave');
                        handleSave(); // This is the working save function with all enhanced features
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
};

// Add/Edit Customer Modal
window.Modals.CustomerFormModal = ({ 
    show, 
    onClose, 
    customer, 
    onSave, 
    loading 
}) => {
    if (!show) return null;

    const { X, User, Save } = window.Icons;
    
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        loyalty_number: '',
        points: 0,
        notes: '',
        member_status: 'Active',
        member_type: 'Individual',
        enrollment_date: new Date().toISOString().split('T')[0],
        customer_tier: 'Bronze'
    });
    
    const [errors, setErrors] = React.useState({});

    // Initialize form data when customer changes
    React.useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                loyalty_number: customer.loyalty_number || '',
                points: customer.points || 0,
                notes: customer.notes || '',
                member_status: customer.member_status || 'Active',
                member_type: customer.member_type || 'Individual',
                enrollment_date: customer.enrollment_date ? customer.enrollment_date.split('T')[0] : new Date().toISOString().split('T')[0],
                customer_tier: customer.customer_tier || 'Bronze'
            });
        } else {
            // Reset form for new customer
            setFormData({
                name: '',
                email: '',
                phone: '',
                loyalty_number: '',
                points: 0,
                notes: '',
                member_status: 'Active',
                member_type: 'Individual',
                enrollment_date: new Date().toISOString().split('T')[0],
                customer_tier: 'Bronze'
            });
        }
        setErrors({});
    }, [customer, show]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Customer name is required';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (formData.phone && !/^[\d\s\-\(\)\+]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!customer && formData.loyalty_number && !/^[A-Z]{3}\d{3}$/.test(formData.loyalty_number)) {
            newErrors.loyalty_number = 'Loyalty number format: LOY001 (3 letters + 3 numbers)';
        }

        if (formData.points < 0) {
            newErrors.points = 'Points cannot be negative';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;
        
        const saveData = {
            ...formData,
            points: parseInt(formData.points) || 0
        };
        
        // If creating new customer and no loyalty number provided, let backend generate it
        if (!customer && !formData.loyalty_number.trim()) {
            delete saveData.loyalty_number;
        }
        
        onSave(saveData);
    };

    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    }, [
        React.createElement('div', { 
            key: 'modal',
            className: 'bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden'
        }, [
            // Header
            React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b flex justify-between items-center' }, [
                React.createElement('h2', { className: 'text-xl font-bold flex items-center gap-2' }, [
                    React.createElement(User, { key: 'icon', size: 24 }),
                    customer ? 'Edit Customer' : 'Add New Customer'
                ]),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'text-gray-400 hover:text-gray-600 transition-colors'
                }, React.createElement(X, { size: 24 }))
            ]),

            // Form Content
            React.createElement('div', { key: 'content', className: 'p-6 space-y-6' }, [
                // Basic Information
                React.createElement('div', { key: 'basic-info', className: 'space-y-4' }, [
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 border-b pb-2' }, [
                        // Member Type
                        React.createElement('div', { key: 'member-type' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Member Type'),
                            React.createElement('select', {
                                value: formData.member_type,
                                onChange: (e) => handleInputChange('member_type', e.target.value),
                                className: 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                                disabled: !!customer // Don't allow changing member type for existing customers
                            }, [
                                React.createElement('option', { key: 'individual', value: 'Individual' }, 'Individual'),
                                React.createElement('option', { key: 'corporate', value: 'Corporate' }, 'Corporate')
                            ]),
                            customer && React.createElement('p', { 
                                className: 'text-gray-500 text-xs mt-1' 
                            }, 'Member type cannot be changed after creation')
                        ])
                    ])
                ]),

                // Member Information
                React.createElement('div', { key: 'member-info', className: 'space-y-4' }, [
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 border-b pb-2' }, 
                        'Member Information'
                    ),
                    
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // Member Status
                        React.createElement('div', { key: 'member-status' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Member Status'),
                            React.createElement('select', {
                                value: formData.member_status,
                                onChange: (e) => handleInputChange('member_status', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    formData.member_status === 'Active' ? 'border-green-300 bg-green-50' :
                                    formData.member_status === 'Inactive' ? 'border-gray-300 bg-gray-50' :
                                    formData.member_status === 'Under Fraud Investigation' ? 'border-yellow-300 bg-yellow-50' :
                                    formData.member_status === 'Fraudulent Member' ? 'border-red-300 bg-red-50' :
                                    'border-purple-300 bg-purple-50'
                                }`
                            }, [
                                React.createElement('option', { key: 'active', value: 'Active' }, '✅ Active'),
                                React.createElement('option', { key: 'inactive', value: 'Inactive' }, '⏸️ Inactive'),
                                React.createElement('option', { key: 'fraud-investigation', value: 'Under Fraud Investigation' }, '⚠️ Under Fraud Investigation'),
                                React.createElement('option', { key: 'merged', value: 'Merged' }, '🔄 Merged'),
                                React.createElement('option', { key: 'fraudulent', value: 'Fraudulent Member' }, '🚨 Fraudulent Member')
                            ]),
                            React.createElement('p', { 
                                className: 'text-xs mt-1',
                                style: { 
                                    color: formData.member_status === 'Active' ? '#059669' :
                                           formData.member_status === 'Inactive' ? '#6b7280' :
                                           formData.member_status === 'Under Fraud Investigation' ? '#d97706' :
                                           formData.member_status === 'Fraudulent Member' ? '#dc2626' :
                                           '#7c3aed'
                                }
                            }, 
                                formData.member_status === 'Active' ? 'Customer can make purchases and earn points' :
                                formData.member_status === 'Inactive' ? 'Customer account is temporarily disabled' :
                                formData.member_status === 'Under Fraud Investigation' ? 'Account under review for suspicious activity' :
                                formData.member_status === 'Merged' ? 'Account has been merged with another account' :
                                'Account flagged for fraudulent activity'
                            )
                        ]),

                        // Enrollment Date
                        React.createElement('div', { key: 'enrollment-date' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Member Since'),
                            React.createElement('input', {
                                type: 'date',
                                value: formData.enrollment_date,
                                onChange: (e) => handleInputChange('enrollment_date', e.target.value),
                                max: new Date().toISOString().split('T')[0], // Can't be future date
                                className: 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }),
                            React.createElement('p', { 
                                className: 'text-gray-500 text-xs mt-1' 
                            }, 'Date when customer enrolled in loyalty program')
                        ]),

                        // Customer Tier (display with manual override option)
                        React.createElement('div', { key: 'customer-tier' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Customer Tier'),
                            React.createElement('select', {
                                value: formData.customer_tier,
                                onChange: (e) => handleInputChange('customer_tier', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    formData.customer_tier === 'Bronze' ? 'border-amber-600 bg-amber-50' :
                                    formData.customer_tier === 'Silver' ? 'border-gray-400 bg-gray-50' :
                                    formData.customer_tier === 'Gold' ? 'border-yellow-500 bg-yellow-50' :
                                    'border-purple-500 bg-purple-50'
                                }`
                            }, [
                                React.createElement('option', { key: 'bronze', value: 'Bronze' }, '🥉 Bronze'),
                                React.createElement('option', { key: 'silver', value: 'Silver' }, '🥈 Silver'),
                                React.createElement('option', { key: 'gold', value: 'Gold' }, '🥇 Gold'),
                                React.createElement('option', { key: 'platinum', value: 'Platinum' }, '💎 Platinum')
                            ]),
                            React.createElement('p', { 
                                className: 'text-gray-500 text-xs mt-1' 
                            }, customer ? 'Tier is auto-calculated but can be manually overridden' : 'Initial tier - will be recalculated based on activity'),
                            
                            // Show tier benefits
                            React.createElement('div', { className: 'mt-2 p-2 bg-gray-50 rounded text-xs' }, [
                                React.createElement('strong', { key: 'benefits-label' }, 'Tier Benefits: '),
                                React.createElement('span', { key: 'benefits-text' }, 
                                    formData.customer_tier === 'Bronze' ? 'Basic loyalty benefits, 1x points earning' :
                                    formData.customer_tier === 'Silver' ? 'Enhanced benefits, 1.25x points earning, priority support' :
                                    formData.customer_tier === 'Gold' ? 'Premium benefits, 1.5x points earning, exclusive offers' :
                                    'VIP benefits, 2x points earning, personal concierge service'
                                )
                            ])
                        ])
                    ])
                ]),

                // Loyalty Information (for editing existing customers)
                customer && React.createElement('div', { key: 'loyalty-info', className: 'space-y-4' }, [
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 border-b pb-2' }, 
                        'Loyalty Information'
                    ),
                    
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // Points (editable for adjustments)
                        React.createElement('div', { key: 'points' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Points Balance'),
                            React.createElement('input', {
                                type: 'number',
                                min: '0',
                                value: formData.points,
                                onChange: (e) => handleInputChange('points', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.points ? 'border-red-500' : 'border-gray-300'
                                }`,
                                placeholder: '0'
                            }),
                            errors.points && React.createElement('p', { 
                                className: 'text-red-500 text-sm mt-1' 
                            }, errors.points),
                            React.createElement('p', { 
                                className: 'text-gray-500 text-xs mt-1' 
                            }, 'Adjust points balance if needed')
                        ]),

                        // Customer Stats (read-only display with enhanced info)
                        React.createElement('div', { key: 'stats', className: 'space-y-3' }, [
                            React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Total Spent: '),
                                React.createElement('span', { className: 'text-green-600 font-bold' }, 
                                    `${parseFloat(customer.total_spent || 0).toFixed(2)}`
                                )
                            ]),
                            React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Visit Count: '),
                                React.createElement('span', { className: 'text-blue-600 font-bold' }, 
                                    customer.visit_count || 0
                                )
                            ]),
                            customer.last_visit && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Last Visit: '),
                                React.createElement('span', { className: 'text-purple-600 font-bold' }, 
                                    new Date(customer.last_visit).toLocaleDateString()
                                )
                            ]),
                            customer.tier_calculation_number && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Tier Score: '),
                                React.createElement('span', { className: 'text-indigo-600 font-bold' }, 
                                    parseFloat(customer.tier_calculation_number).toFixed(2)
                                )
                            ]),
                            // Member duration
                            customer.enrollment_date && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Member For: '),
                                React.createElement('span', { className: 'text-orange-600 font-bold' }, 
                                    (() => {
                                        const enrollDate = new Date(customer.enrollment_date);
                                        const now = new Date();
                                        const diffTime = Math.abs(now - enrollDate);
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        const years = Math.floor(diffDays / 365);
                                        const months = Math.floor((diffDays % 365) / 30);
                                        
                                        if (years > 0) {
                                            return years === 1 ? '1 year' : `${years} years`;
                                        } else if (months > 0) {
                                            return months === 1 ? '1 month' : `${months} months`;
                                        } else {
                                            return `${diffDays} days`;
                                        }
                                    })()
                                )
                            ])
                        ])
                    ],'Basic Information'
                    ),
                    
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // Customer Name
                        React.createElement('div', { key: 'name' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Customer Name *'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.name,
                                onChange: (e) => handleInputChange('name', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`,
                                placeholder: 'Enter customer name'
                            }),
                            errors.name && React.createElement('p', { 
                                className: 'text-red-500 text-sm mt-1' 
                            }, errors.name)
                        ]),

                        // Email
                        React.createElement('div', { key: 'email' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Email Address'),
                            React.createElement('input', {
                                type: 'email',
                                value: formData.email,
                                onChange: (e) => handleInputChange('email', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`,
                                placeholder: 'customer@example.com'
                            }),
                            errors.email && React.createElement('p', { 
                                className: 'text-red-500 text-sm mt-1' 
                            }, errors.email)
                        ]),

                        // Phone
                        React.createElement('div', { key: 'phone' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Phone Number'),
                            React.createElement('input', {
                                type: 'tel',
                                value: formData.phone,
                                onChange: (e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    handleInputChange('phone', formatted);
                                },
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`,
                                placeholder: '(555) 123-4567'
                            }),
                            errors.phone && React.createElement('p', { 
                                className: 'text-red-500 text-sm mt-1' 
                            }, errors.phone)
                        ]),

                        // Loyalty Number (only for new customers or display for existing)
                        React.createElement('div', { key: 'loyalty' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Loyalty Number'),
                            React.createElement('input', {
                                type: 'text',
                                value: formData.loyalty_number,
                                onChange: (e) => handleInputChange('loyalty_number', e.target.value.toUpperCase()),
                                disabled: !!customer, // Disable editing for existing customers
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.loyalty_number ? 'border-red-500' : 'border-gray-300'
                                } ${customer ? 'bg-gray-100' : ''}`,
                                placeholder: customer ? 'Auto-assigned' : 'LOY001 (optional - auto-generated if empty)'
                            }),
                            errors.loyalty_number && React.createElement('p', { 
                                className: 'text-red-500 text-sm mt-1' 
                            }, errors.loyalty_number),
                            !customer && React.createElement('p', { 
                                className: 'text-gray-500 text-xs mt-1' 
                            }, 'Leave empty to auto-generate loyalty number')
                        ])
                    ])
                ]),

                // Loyalty Information (for editing existing customers)
                customer && React.createElement('div', { key: 'loyalty-info', className: 'space-y-4' }, [
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 border-b pb-2' }, 
                        'Loyalty Information'
                    ),
                    
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // Points (editable for adjustments)
                        React.createElement('div', { key: 'points' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Points Balance'),
                            React.createElement('input', {
                                type: 'number',
                                min: '0',
                                value: formData.points,
                                onChange: (e) => handleInputChange('points', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.points ? 'border-red-500' : 'border-gray-300'
                                }`,
                                placeholder: '0'
                            }),
                            errors.points && React.createElement('p', { 
                                className: 'text-red-500 text-sm mt-1' 
                            }, errors.points),
                            React.createElement('p', { 
                                className: 'text-gray-500 text-xs mt-1' 
                            }, 'Adjust points balance if needed')
                        ]),

                        // Customer Stats (read-only display)
                        React.createElement('div', { key: 'stats', className: 'space-y-3' }, [
                            React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Total Spent: '),
                                React.createElement('span', { className: 'text-green-600 font-bold' }, 
                                    `${parseFloat(customer.total_spent || 0).toFixed(2)}`
                                )
                            ]),
                            React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Visit Count: '),
                                React.createElement('span', { className: 'text-blue-600 font-bold' }, 
                                    customer.visit_count || 0
                                )
                            ]),
                            customer.last_visit && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700' }, 'Last Visit: '),
                                React.createElement('span', { className: 'text-purple-600 font-bold' }, 
                                    new Date(customer.last_visit).toLocaleDateString()
                                )
                            ])
                        ])
                    ])
                ]),

                // Notes
                React.createElement('div', { key: 'notes', className: 'space-y-4' }, [
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 border-b pb-2' }, 
                        'Additional Notes'
                    ),
                    React.createElement('textarea', {
                        value: formData.notes,
                        onChange: (e) => handleInputChange('notes', e.target.value),
                        rows: 3,
                        className: 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                        placeholder: 'Add any special notes about this customer...'
                    })
                ])
            ]),

            // Footer
            React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end' }, [
                React.createElement('button', {
                    onClick: onClose,
                    disabled: loading,
                    className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
                }, 'Cancel'),
                React.createElement('button', {
                    onClick: handleSave,
                    disabled: loading || !formData.name.trim(),
                    className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2'
                }, [
                    loading && React.createElement('div', { 
                        key: 'spinner',
                        className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                    }),
                    React.createElement(Save, { key: 'icon', size: 16 }),
                    loading ? 'Saving...' : (customer ? 'Update Customer' : 'Create Customer')
                ])
            ])
        ])
    ]);
};

// Confirmation Modal for Deleting Customers
window.Modals.CustomerDeleteModal = ({ 
    show, 
    onClose, 
    customer, 
    onConfirm, 
    loading 
}) => {
    if (!show || !customer) return null;

    const { X, Trash2, AlertTriangle } = window.Icons;

    return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    }, [
        React.createElement('div', { 
            key: 'modal',
            className: 'bg-white rounded-lg w-full max-w-md'
        }, [
            // Header
            React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b flex justify-between items-center' }, [
                React.createElement('h2', { className: 'text-xl font-bold text-red-600 flex items-center gap-2' }, [
                    React.createElement(Trash2, { key: 'icon', size: 24 }),
                    'Delete Customer'
                ]),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'text-gray-400 hover:text-gray-600 transition-colors'
                }, React.createElement(X, { size: 24 }))
            ]),

            // Content
            React.createElement('div', { key: 'content', className: 'p-6' }, [
                React.createElement('div', { className: 'flex items-start gap-4 mb-4' }, [
                    React.createElement(AlertTriangle, { 
                        key: 'warning-icon',
                        className: 'text-red-500 mt-1', 
                        size: 24 
                    }),
                    React.createElement('div', { key: 'warning-text' }, [
                        React.createElement('h3', { className: 'font-semibold text-gray-900 mb-2' }, 
                            'Are you sure you want to delete this customer?'
                        ),
                        React.createElement('p', { className: 'text-gray-600 text-sm mb-4' }, 
                            'This action cannot be undone. All customer data and purchase history will be permanently removed.'
                        )
                    ])
                ]),

                // Customer Info
                React.createElement('div', { className: 'bg-gray-50 p-4 rounded-lg border' }, [
                    React.createElement('div', { className: 'font-semibold text-lg' }, customer.name),
                    React.createElement('div', { className: 'text-blue-600 font-mono text-sm' }, customer.loyalty_number),
                    customer.email && React.createElement('div', { className: 'text-gray-600 text-sm' }, customer.email),
                    React.createElement('div', { className: 'mt-2 flex gap-4 text-sm' }, [
                        React.createElement('span', { key: 'points' }, [
                            React.createElement('strong', { key: 'label' }, 'Points: '),
                            React.createElement('span', { key: 'value', className: 'text-green-600' }, customer.points || 0)
                        ]),
                        React.createElement('span', { key: 'visits' }, [
                            React.createElement('strong', { key: 'label' }, 'Visits: '),
                            React.createElement('span', { key: 'value', className: 'text-blue-600' }, customer.visit_count || 0)
                        ]),
                        React.createElement('span', { key: 'spent' }, [
                            React.createElement('strong', { key: 'label' }, 'Spent: '),
                            React.createElement('span', { key: 'value', className: 'text-purple-600' }, 
                                `${parseFloat(customer.total_spent || 0).toFixed(2)}`
                            )
                        ])
                    ])
                ])
            ]),

            // Footer
            React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end' }, [
                React.createElement('button', {
                    onClick: onClose,
                    disabled: loading,
                    className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
                }, 'Cancel'),
                React.createElement('button', {
                    onClick: () => onConfirm(customer.id),
                    disabled: loading,
                    className: 'px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2'
                }, [
                    loading && React.createElement('div', { 
                        key: 'spinner',
                        className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                    }),
                    React.createElement(Trash2, { key: 'icon', size: 16 }),
                    loading ? 'Deleting...' : 'Delete Customer'
                ])
            ])
        ])
    ]);
};

