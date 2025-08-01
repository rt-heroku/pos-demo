// public/app.js - Main POS Application
const { useState, useEffect } = React;

const POSApp = () => {
    // State management
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalSales: 0,
        todaySales: 0,
        transactionCount: 0,
        lowStockCount: 0,
        totalCustomers: 0,
        activeCustomers: 0
    });
    
    const [currentView, setCurrentView] = useState('pos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [loading, setLoading] = useState(false);

    // Loyalty system states
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [loyaltyNumber, setLoyaltyNumber] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [loyaltySearchTerm, setLoyaltySearchTerm] = useState('');
    const [customerHistory, setCustomerHistory] = useState([]);
    const [showCustomerHistory, setShowCustomerHistory] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

    // Inventory/Products states
    const [detailedProducts, setDetailedProducts] = useState([]);
    const [productFilters, setProductFilters] = useState({});
    const [searchFilters, setSearchFilters] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [productViewMode, setProductViewMode] = useState('grid');

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadCustomers();
        loadTransactions();
        loadAnalytics();
        loadDetailedProducts();
        loadProductFilters();
    }, []);

    // Data loading functions
    const loadProducts = async () => {
        try {
            const data = await window.API.products.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const loadCustomers = async () => {
        try {
            const data = await window.API.customers.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const loadTransactions = async () => {
        try {
            const data = await window.API.transactions.getAll();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    };

    const loadAnalytics = async () => {
        try {
            const data = await window.API.analytics.get();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    // Loyalty functions
    const searchCustomerByLoyalty = async (loyaltyNum) => {
        if (!loyaltyNum.trim()) return;
        
        try {
            setLoading(true);
            const customer = await window.API.customers.getByLoyalty(loyaltyNum);
            setSelectedCustomer(customer);
            setLoyaltyNumber(loyaltyNum);
            setShowLoyaltyModal(false);
        } catch (error) {
            if (error.message.includes('404')) {
                setNewCustomerForm({ ...newCustomerForm, loyaltyNumber: loyaltyNum.toUpperCase() });
                setShowNewCustomerForm(true);
            } else {
                console.error('Failed to search customer:', error);
                alert('Error searching for customer');
            }
        } finally {
            setLoading(false);
        }
    };

    const createNewCustomer = async () => {
        if (!newCustomerForm.name.trim()) {
            alert('Customer name is required');
            return;
        }

        try {
            setLoading(true);
            const customer = await window.API.loyalty.createCustomer({
                loyaltyNumber: newCustomerForm.loyaltyNumber || loyaltyNumber,
                name: newCustomerForm.name,
                email: newCustomerForm.email,
                phone: newCustomerForm.phone
            });
            
            setSelectedCustomer(customer);
            setLoyaltyNumber(customer.loyalty_number);
            setShowNewCustomerForm(false);
            setShowLoyaltyModal(false);
            setNewCustomerForm({ name: '', email: '', phone: '' });
            await loadCustomers();
            alert('New customer created successfully!');
        } catch (error) {
            console.error('Failed to create customer:', error);
            alert('Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const searchCustomers = async (query) => {
        if (!query.trim()) {
            setCustomerSearchResults([]);
            return;
        }

        try {
            const results = await window.API.customers.search(query);
            setCustomerSearchResults(results);
        } catch (error) {
            console.error('Failed to search customers:', error);
            setCustomerSearchResults([]);
        }
    };

    const loadCustomerHistory = async (customerId) => {
        try {
            setLoading(true);
            const history = await window.API.customers.getHistory(customerId);
            setCustomerHistory(history);
            setShowCustomerHistory(true);
        } catch (error) {
            console.error('Failed to load customer history:', error);
            alert('Failed to load customer history');
        } finally {
            setLoading(false);
        }
    };

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
        setLoyaltyNumber('');
    };

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const change = parseFloat(amountReceived) - total;
    const categories = ['All', ...new Set(products.map(p => p.category))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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

            const transaction = await window.API.transactions.create(transactionData);

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

    // Event handlers
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setLoyaltyNumber(customer.loyalty_number);
        setShowLoyaltyModal(false);
        setCustomerSearchResults([]);
        setLoyaltySearchTerm('');
    };

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null);
        setLoyaltyNumber('');
    };

    const handleLoyaltySearch = (query) => {
        setLoyaltySearchTerm(query);
        searchCustomers(query);
    };

// Enhanced product loading functions with fallbacks
const loadDetailedProducts = async () => {
    try {
        setLoading(true);
        // Try to load detailed products first
        try {
            const data = await window.API.products.getDetailed();
            setDetailedProducts(data);
        } catch (detailedError) {
            console.log('Detailed products not available, using basic products');
            // Fallback to basic products and enhance them client-side
            const basicProducts = await window.API.products.getAll();
            const enhancedProducts = basicProducts.map(product => ({
                ...product,
                images: [],
                features: [],
                // Add default values for missing fields
                sku: product.sku || `SKU-${product.id}`,
                brand: product.brand || '',
                collection: product.collection || '',
                material: product.material || '',
                color: product.color || '',
                product_type: product.product_type || product.category,
                laptop_size: product.laptop_size || '',
                gender: product.gender || 'Unisex',
                description: product.description || '',
                dimensions: product.dimensions || '',
                weight: product.weight || '',
                warranty_info: product.warranty_info || '',
                care_instructions: product.care_instructions || '',
                main_image_url: product.main_image_url || '',
                is_active: product.is_active !== false,
                featured: product.featured || false
            }));
            setDetailedProducts(enhancedProducts);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Show user-friendly error
        alert('Unable to load products. Please check your server connection.');
        setDetailedProducts([]);
    } finally {
        setLoading(false);
    }
};


const loadProductFilters = async () => {
    try {
        const filters = await window.API.products.getFilters();
        setProductFilters(filters);
    } catch (error) {
        console.log('Product filters not available, using empty filters');
        // Provide empty filters as fallback
        setProductFilters({
            collections: [],
            brands: [],
            materials: [],
            productTypes: [],
            colors: []
        });
    }
};
    // Product management functions
    const handleAddProduct = () => {
        setCurrentProduct(null);
        setShowProductModal(true);
    };

    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setShowProductModal(true);
    };

// Enhanced save product function with fallback
const handleSaveProduct = async (productData) => {
    try {
        setLoading(true);
        
        if (currentProduct) {
            // Try enhanced update first
            try {
                await window.API.products.updateEnhanced(currentProduct.id, productData);
            } catch (enhancedError) {
                console.log('Enhanced update not available, using basic update');
                // Fallback to basic update with only basic fields
                const basicData = {
                    name: productData.name,
                    price: productData.price,
                    category: productData.category,
                    stock: productData.stock,
                    image: productData.image
                };
                await window.API.products.update(currentProduct.id, basicData);
            }
        } else {
            // Try enhanced create first
            try {
                await window.API.products.createEnhanced(productData);
            } catch (enhancedError) {
                console.log('Enhanced create not available, using basic create');
                // Fallback to basic create with only basic fields
                const basicData = {
                    name: productData.name,
                    price: productData.price,
                    category: productData.category,
                    stock: productData.stock,
                    image: productData.image
                };
                await window.API.products.create(basicData);
            }
        }
        
        setShowProductModal(false);
        setCurrentProduct(null);
        await Promise.all([
            loadDetailedProducts(),
            loadProducts(),
            loadProductFilters()
        ]);
        
        alert(currentProduct ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (error) {
        console.error('Failed to save product:', error);
        alert('Failed to save product. Please try again.');
    } finally {
        setLoading(false);
    }
};
// Update the bulk operations to handle missing enhanced endpoints
const handleBulkUpdate = async (productIds, updates) => {
    try {
        setLoading(true);
        
        // Try enhanced bulk update first
        try {
            await window.API.products.bulkUpdate(productIds, updates);
        } catch (bulkError) {
            console.log('Bulk update not available, updating individually');
            // Fallback to individual updates
            for (const productId of productIds) {
                try {
                    await window.API.products.update(productId, updates);
                } catch (updateError) {
                    console.error(`Failed to update product ${productId}:`, updateError);
                }
            }
        }
        
        setSelectedProducts([]); // Clear selection
        await Promise.all([
            loadDetailedProducts(),
            loadProducts(),
            loadProductFilters()
        ]);
        alert(`${productIds.length} products updated successfully!`);
    } catch (error) {
        console.error('Failed to bulk update products:', error);
        alert('Failed to update some products. Please try again.');
    } finally {
        setLoading(false);
    }
};
const handleDuplicateProduct = async (productId) => {
    try {
        setLoading(true);
        
        // Try enhanced duplicate first
        try {
            await window.API.products.duplicate(productId);
        } catch (duplicateError) {
            console.log('Duplicate endpoint not available, creating manual copy');
            // Fallback to manual duplication
            const originalProduct = detailedProducts.find(p => p.id === productId);
            if (originalProduct) {
                const duplicateData = {
                    name: `${originalProduct.name} (Copy)`,
                    price: originalProduct.price,
                    category: originalProduct.category,
                    stock: 0, // Set stock to 0 for duplicates
                    image: originalProduct.image
                };
                await window.API.products.create(duplicateData);
            }
        }
        
        await Promise.all([
            loadDetailedProducts(),
            loadProducts(),
            loadProductFilters()
        ]);
        alert('Product duplicated successfully!');
    } catch (error) {
        console.error('Failed to duplicate product:', error);
        alert('Failed to duplicate product. Please try again.');
    } finally {
        setLoading(false);
    }
};
const searchProducts = async (filters) => {
    try {
        setLoading(true);
        // Try enhanced search first
        try {
            const data = await window.API.products.search(filters);
            setDetailedProducts(data);
        } catch (searchError) {
            console.log('Enhanced search not available, using basic filtering');
            // Fallback to client-side filtering
            const allProducts = await window.API.products.getAll();
            const filteredProducts = allProducts.filter(product => {
                // Apply basic filters
                if (filters.q && !product.name.toLowerCase().includes(filters.q.toLowerCase())) {
                    return false;
                }
                if (filters.category && product.category !== filters.category) {
                    return false;
                }
                if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
                    return false;
                }
                if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
                    return false;
                }
                if (filters.inStock === 'true' && product.stock <= 0) {
                    return false;
                }
                return true;
            });
            
            // Enhance the filtered products
            const enhancedProducts = filteredProducts.map(product => ({
                ...product,
                images: [],
                features: [],
                sku: product.sku || `SKU-${product.id}`,
                brand: product.brand || '',
                collection: product.collection || '',
                material: product.material || '',
                color: product.color || '',
                product_type: product.product_type || product.category,
                laptop_size: product.laptop_size || '',
                gender: product.gender || 'Unisex',
                description: product.description || '',
                is_active: product.is_active !== false,
                featured: product.featured || false
            }));
            
            setDetailedProducts(enhancedProducts);
        }
    } catch (error) {
        console.error('Failed to search products:', error);
        setDetailedProducts([]);
    } finally {
        setLoading(false);
    }
};

    const handleProductSelect = (productId, selected) => {
        setSelectedProducts(prev => 
            selected 
                ? [...prev, productId]
                : prev.filter(id => id !== productId)
        );
    };

    const handleSelectAllProducts = (selected) => {
        setSelectedProducts(selected ? detailedProducts.map(p => p.id) : []);
    };

    const handleFilterChange = (newFilters) => {
        setSearchFilters(newFilters);
        searchProducts(newFilters);
    };

    const handleViewModeChange = (mode) => {
        setProductViewMode(mode);
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

    // Get icons
    const { ShoppingCart, Award, Package, BarChart3 } = window.Icons;

    // Main render
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
                            key: 'loyalty-nav',
                            view: 'loyalty', 
                            icon: Award, 
                            label: 'Loyalty', 
                            active: currentView === 'loyalty' 
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
            currentView === 'pos' && React.createElement(window.Views.POSView, { 
                key: 'pos-view',
                products: filteredProducts,
                cart,
                selectedCustomer,
                searchTerm,
                setSearchTerm,
                selectedCategory,
                setSelectedCategory,
                categories,
                onAddToCart: addToCart,
                onUpdateQuantity: updateQuantity,
                onRemoveFromCart: removeFromCart,
                onClearCart: clearCart,
                onShowLoyaltyModal: () => setShowLoyaltyModal(true),
                onLoadCustomerHistory: loadCustomerHistory,
                onRemoveCustomer: handleRemoveCustomer,
                subtotal,
                tax,
                total,
                paymentMethod,
                setPaymentMethod,
                amountReceived,
                setAmountReceived,
                change,
                onProcessPayment: processPayment,
                loading
            }),
            
            currentView === 'loyalty' && React.createElement(window.Views.LoyaltyView, { 
                key: 'loyalty-view',
                loyaltyNumber,
                setLoyaltyNumber,
                onSearchByLoyalty: searchCustomerByLoyalty,
                loyaltySearchTerm,
                setLoyaltySearchTerm: handleLoyaltySearch,
                customerSearchResults,
                onLoadCustomerHistory: loadCustomerHistory,
                loading
            }),
            
            currentView === 'inventory' && React.createElement(window.Views.InventoryView, { 
                key: 'inventory-view',
                products: detailedProducts,
                filters: productFilters,
                loading,
                onAddProduct: handleAddProduct,
                onEditProduct: handleEditProduct,
                onDeleteProduct: handleDeleteProduct,
                onBulkUpdate: handleBulkUpdate,
                onDuplicateProduct: handleDuplicateProduct,
                searchFilters,
                onFilterChange: handleFilterChange,
                selectedProducts,
                onProductSelect: handleProductSelect,
                onSelectAll: handleSelectAllProducts,
                showProductModal,
                onShowProductModal: handleAddProduct,
                onCloseProductModal: () => setShowProductModal(false),
                currentProduct,
                viewMode: productViewMode,
                onViewModeChange: handleViewModeChange
            }),

            currentView === 'sales' && React.createElement(window.Views.SalesView, { 
                key: 'sales-view',
                analytics,
                transactions
            })
        ]),

        // Modals
        React.createElement(window.Modals.LoyaltyModal, { 
            key: 'loyalty-modal',
            show: showLoyaltyModal,
            onClose: () => setShowLoyaltyModal(false),
            loyaltyNumber,
            setLoyaltyNumber,
            onSearchByLoyalty: searchCustomerByLoyalty,
            loyaltySearchTerm,
            setLoyaltySearchTerm,
            onSearchCustomers: searchCustomers,
            customerSearchResults,
            onSelectCustomer: handleSelectCustomer,
            loading
        }),
        
        React.createElement(window.Modals.NewCustomerModal, { 
            key: 'new-customer-modal',
            show: showNewCustomerForm,
            onClose: () => setShowNewCustomerForm(false),
            newCustomerForm,
            setNewCustomerForm,
            onCreateCustomer: createNewCustomer,
            loyaltyNumber,
            loading
        }),
        
        React.createElement(window.Modals.CustomerHistoryModal, { 
            key: 'history-modal',
            show: showCustomerHistory,
            onClose: () => setShowCustomerHistory(false),
            customerHistory,
            loading
        }),
        
        React.createElement(window.Modals.ReceiptModal, { 
            key: 'receipt-modal',
            show: showReceipt,
            onClose: () => setShowReceipt(false),
            transaction: lastTransaction,
            subtotal,
            tax,
            total,
            paymentMethod,
            amountReceived,
            change
        }),

        React.createElement(window.Modals.ProductModal, {
            key: 'product-modal',
            show: showProductModal,
            onClose: () => {
                setShowProductModal(false);
                setCurrentProduct(null);
            },
            product: currentProduct,
            onSave: handleSaveProduct,
            loading,
            filters: productFilters
        }),

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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        ReactDOM.render(React.createElement(POSApp), document.getElementById('root'));
    });
} else {
    ReactDOM.render(React.createElement(POSApp), document.getElementById('root'));
}