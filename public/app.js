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

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadCustomers();
        loadTransactions();
        loadAnalytics();
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
            
            currentView === 'inventory' && React.createElement('div', { 
                key: 'inventory-view',
                className: 'bg-white rounded-xl shadow-sm border p-8 text-center' 
            }, [
                React.createElement('h2', { key: 'title', className: 'text-2xl font-bold mb-4' }, 'Inventory Management'),
                React.createElement('p', { key: 'message', className: 'text-gray-600' }, 'Inventory features available when connected to database.')
            ]),
            
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