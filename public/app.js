const { useState, useEffect } = React;

const POSApp = () => {
    // Enhanced state management
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userSettings, setUserSettings] = useState({
        theme_mode: 'light',
        selected_location_id: null
    });
    
    const [analytics, setAnalytics] = useState({
        totalSales: 0,
        todaySales: 0,
        transactionCount: 0,
        lowStockCount: 0,
        totalCustomers: 0,
        activeCustomers: 0
    });
    
    // App state
    const [currentView, setCurrentView] = useState('settings'); // Start with settings for initial setup
    const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(true);
    const [loading, setLoading] = useState(false);
    const [appLoading, setAppLoading] = useState(true);
    const [componentsReady, setComponentsReady] = useState(false);
    
    // POS state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountReceived, setAmountReceived] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);

    // Loyalty system states
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [loyaltyNumber, setLoyaltyNumber] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [loyaltySearchTerm, setLoyaltySearchTerm] = useState('');
    const [customerHistory, setCustomerHistory] = useState([]);
    const [showCustomerHistory, setShowCustomerHistory] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({
        name: '', email: '', phone: ''
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

    // Check if required components are loaded
    useEffect(() => {
        const checkComponents = () => {
            const hasViews = window.Views && 
                window.Views.POSView && 
                window.Views.SettingsView && 
                window.Views.LoyaltyView && 
                window.Views.InventoryView && 
                window.Views.SalesView;
            const hasModals = window.Modals && 
                window.Modals.LoyaltyModal && 
                window.Modals.NewCustomerModal && 
                window.Modals.CustomerHistoryModal && 
                window.Modals.ReceiptModal && 
                window.Modals.ProductModal;
            const hasAPI = window.API;
            const hasIcons = window.Icons && window.Icons.ShoppingCart;

            if (hasViews && hasModals && hasAPI && hasIcons) {
                setComponentsReady(true);
                return true;
            }
            return false;
        };

        // Check immediately
        if (checkComponents()) {
            return;
        }

        // Poll for components if not ready
        const interval = setInterval(() => {
            if (checkComponents()) {
                clearInterval(interval);
            }
        }, 100);

        // Cleanup
        return () => clearInterval(interval);
    }, []);

    // Wait for components to be ready before initializing
    useEffect(() => {
        if (componentsReady) {
            initializeApp();
        }
    }, [componentsReady]);

    // Generate user identifier for settings
    const getUserId = () => {
        let userId = localStorage.getItem('pos_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pos_user_id', userId);
        }
        return userId;
    };

    // Apply theme when settings change
    useEffect(() => {
        if (userSettings.theme_mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [userSettings.theme_mode]);

    // Initialize the application
    const initializeApp = async () => {
        try {
            setAppLoading(true);
            
            // Check if setup is required
            try {
                const setupStatus = await fetch('/api/setup/status').then(r => r.json());
                setIsFirstTimeSetup(setupStatus.setupRequired);
            } catch (error) {
                console.error('Failed to check setup status:', error);
                // If API isn't ready, assume first-time setup
                setIsFirstTimeSetup(true);
            }
            
            // Load initial data
            await Promise.all([
                loadLocations(),
                loadUserSettings(),
                loadCustomers(),
                loadDetailedProducts(),
                loadProductFilters()
            ]);
            
            // If not first-time setup, load location-specific data
            if (!isFirstTimeSetup) {
                const userSettings = await loadUserSettings();
                if (userSettings.selected_location_id) {
                    const locations = await loadLocations();
                    const selectedLoc = locations.find(l => l.id === userSettings.selected_location_id);
                    if (selectedLoc) {
                        setSelectedLocation(selectedLoc);
                        await loadLocationSpecificData(selectedLoc.id);
                        setCurrentView('pos'); // Switch to POS view after setup
                    }
                }
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Don't show alert during development - just log the error
        } finally {
            setAppLoading(false);
        }
    };

    // Data loading functions with error handling
    const loadLocations = async () => {
        try {
            const data = await fetch('/api/locations').then(r => r.json());
            setLocations(data || []);
            return data || [];
        } catch (error) {
            console.error('Failed to load locations:', error);
            return [];
        }
    };

    const loadUserSettings = async () => {
        try {
            const userId = getUserId();
            const data = await fetch(`/api/settings/${userId}`).then(r => r.json());
            setUserSettings(data || { theme_mode: 'light' });
            return data || { theme_mode: 'light' };
        } catch (error) {
            console.error('Failed to load user settings:', error);
            return { theme_mode: 'light' };
        }
    };

    const loadLocationSpecificData = async (locationId) => {
        try {
            await Promise.all([
                loadProducts(locationId),
                loadTransactions(locationId),
                loadAnalytics(locationId)
            ]);
        } catch (error) {
            console.error('Failed to load location-specific data:', error);
        }
    };

    const loadProducts = async (locationId) => {
        try {
            const data = await fetch('/api/products').then(r => r.json());
            setProducts(data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
            setProducts([]);
        }
    };

    const loadTransactions = async (locationId) => {
        try {
            const data = await fetch(`/api/transactions/location/${locationId}`).then(r => r.json());
            setTransactions(data || []);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            setTransactions([]);
        }
    };

    const loadAnalytics = async (locationId) => {
        try {
            const data = await fetch(`/api/analytics/${locationId}`).then(r => r.json());
            setAnalytics(data || {
                totalSales: 0,
                todaySales: 0,
                transactionCount: 0,
                lowStockCount: 0
            });
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const loadCustomers = async () => {
        try {
            if (!window.API?.customers?.getAll) {
                console.warn('Customer API not available yet');
                return;
            }
            const data = await window.API.customers.getAll();
            setCustomers(data || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
            setCustomers([]);
        }
    };

    const loadDetailedProducts = async () => {
        try {
            setLoading(true);
            if (!window.API?.products) {
                console.warn('Products API not available yet');
                return;
            }

            try {
                const data = await window.API.products.getDetailed();
                setDetailedProducts(data || []);
            } catch (detailedError) {
                const basicProducts = await window.API.products.getAll();
                const enhancedProducts = (basicProducts || []).map(product => ({
                    ...product,
                    images: [], features: [], sku: product.sku || `SKU-${product.id}`,
                    brand: product.brand || '', collection: product.collection || '',
                    material: product.material || '', color: product.color || '',
                    product_type: product.product_type || product.category,
                    laptop_size: product.laptop_size || '', gender: product.gender || 'Unisex',
                    description: product.description || '', is_active: product.is_active !== false,
                    featured: product.featured || false
                }));
                setDetailedProducts(enhancedProducts);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            setDetailedProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadProductFilters = async () => {
        try {
            if (!window.API?.products?.getFilters) {
                setProductFilters({
                    collections: [], brands: [], materials: [], productTypes: [], colors: []
                });
                return;
            }
            const filters = await window.API.products.getFilters();
            setProductFilters(filters || {
                collections: [], brands: [], materials: [], productTypes: [], colors: []
            });
        } catch (error) {
            setProductFilters({
                collections: [], brands: [], materials: [], productTypes: [], colors: []
            });
        }
    };

    // Location management functions
    const handleLocationChange = async (location) => {
        if (!location) return;
        
        setLoading(true);
        try {
            setSelectedLocation(location);
            
            const userId = getUserId();
            await fetch(`/api/settings/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selected_location_id: location.id })
            });
            
            await loadLocationSpecificData(location.id);
            setCart([]);
            
            if (isFirstTimeSetup) {
                setIsFirstTimeSetup(false);
                setCurrentView('pos');
            }
            
        } catch (error) {
            console.error('Failed to change location:', error);
            alert('Failed to switch location. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLocation = async (locationData) => {
        setLoading(true);
        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create location');
            }
            
            const newLocation = await response.json();
            await loadLocations();
            await handleLocationChange(newLocation);
            alert('Location created successfully!');
        } catch (error) {
            console.error('Failed to create location:', error);
            alert(error.message || 'Failed to create location');
        } finally {
            setLoading(false);
        }
    };

    const handleThemeToggle = async (theme) => {
        try {
            const userId = getUserId();
            const response = await fetch(`/api/settings/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme_mode: theme })
            });
            
            if (response.ok) {
                const updatedSettings = await response.json();
                setUserSettings(updatedSettings);
            }
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    // Placeholder handlers for missing functionality
    const handleUpdateLocation = (locationId, locationData) => {
        console.log('Update location not implemented yet');
    };

    const handleLogoUpload = (locationId, logoBase64) => {
        console.log('Logo upload not implemented yet');
    };

    // Basic cart functions
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

    // Navigation Component
    const NavButton = ({ view, icon: Icon, label, active }) => (
        React.createElement('button', {
            onClick: () => setCurrentView(view),
            className: `flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                active 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`
        }, [
            React.createElement(Icon, { key: 'icon', size: 20 }),
            React.createElement('span', { key: 'label', className: 'font-medium' }, label)
        ])
    );

    // Loading screen for components not ready
    if (!componentsReady || appLoading) {
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center' 
        }, [
            React.createElement('div', { key: 'loading', className: 'text-center' }, [
                React.createElement('div', { 
                    key: 'spinner',
                    className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' 
                }),
                React.createElement('p', { 
                    key: 'text',
                    className: 'text-gray-600 dark:text-gray-300 text-lg' 
                }, !componentsReady ? 'Loading Components...' : 'Loading POS System...'),
                React.createElement('p', { 
                    key: 'subtext',
                    className: 'text-gray-500 dark:text-gray-400 text-sm mt-2' 
                }, !componentsReady ? 'Please wait while components load' : 'Initializing locations and settings')
            ])
        ]);
    }

    // Get icons safely
    const icons = window.Icons || {};
    const { ShoppingCart, Award, Package, BarChart3, Settings } = icons;

    // Safety check for icons
    if (!ShoppingCart) {
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-100 flex items-center justify-center' 
        }, [
            React.createElement('div', { className: 'text-center p-8 bg-white rounded-lg shadow' }, [
                React.createElement('h2', { className: 'text-xl font-bold text-red-600 mb-4' }, 'Missing Icons'),
                React.createElement('p', { className: 'text-gray-600' }, 'Icons not loaded. Please check icons.js file.')
            ])
        ]);
    }

    // First-time setup screen
    if (isFirstTimeSetup) {
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center' 
        }, [
            React.createElement('div', { 
                key: 'setup',
                className: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4' 
            }, [
                React.createElement('div', { key: 'header', className: 'text-center mb-6' }, [
                    React.createElement(Settings, { 
                        key: 'icon',
                        className: 'mx-auto mb-4 text-blue-600', 
                        size: 48 
                    }),
                    React.createElement('h2', { 
                        key: 'title',
                        className: 'text-2xl font-bold text-gray-900 dark:text-white mb-2' 
                    }, 'Welcome to POS System'),
                    React.createElement('p', { 
                        key: 'subtitle',
                        className: 'text-gray-600 dark:text-gray-300' 
                    }, 'Let\'s set up your first location to get started')
                ]),
                React.createElement('button', {
                    key: 'setup-btn',
                    onClick: () => setCurrentView('settings'),
                    className: 'w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                }, 'Set Up Location')
            ])
        ]);
    }

    // Simple view component for views that aren't ready yet
    const SimpleView = (title, message) => (
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 text-center' }, [
            React.createElement('h2', { key: 'title', className: 'text-2xl font-bold mb-4 dark:text-white' }, title),
            React.createElement('p', { key: 'message', className: 'text-gray-600 dark:text-gray-300' }, message)
        ])
    );

    // Main render
    return React.createElement('div', { className: 'min-h-screen bg-gray-100 dark:bg-gray-900' }, [
        // Header
        React.createElement('header', { 
            key: 'header', 
            className: 'bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700' 
        }, [
            React.createElement('div', { className: 'max-w-7xl mx-auto px-6 py-4' }, [
                React.createElement('div', { className: 'flex items-center justify-between' }, [
                    React.createElement('div', { key: 'logo-section', className: 'flex items-center gap-3' }, [
                        selectedLocation?.logo_base64 && React.createElement('img', {
                            key: 'location-logo',
                            src: selectedLocation.logo_base64,
                            alt: 'Store logo',
                            className: 'w-10 h-10 object-contain'
                        }),
                        React.createElement('div', { key: 'titles' }, [
                            React.createElement('h1', { 
                                className: 'text-2xl font-bold text-gray-900 dark:text-white' 
                            }, 'POS System'),
                            selectedLocation && React.createElement('p', { 
                                className: 'text-sm text-gray-600 dark:text-gray-300' 
                            }, `${selectedLocation.store_name} • ${selectedLocation.store_code}`)
                        ])
                    ]),
                    React.createElement('div', { key: 'nav', className: 'flex items-center gap-4' }, [
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
                        }),
                        React.createElement(NavButton, { 
                            key: 'settings-nav',
                            view: 'settings', 
                            icon: Settings, 
                            label: 'Settings', 
                            active: currentView === 'settings' 
                        })
                    ])
                ])
            ])
        ]),

        // Main Content
        React.createElement('main', { key: 'main', className: 'max-w-7xl mx-auto p-6' }, [
            // Safe rendering of views
            currentView === 'settings' && window.Views?.SettingsView ? 
                React.createElement(window.Views.SettingsView, { 
                    key: 'settings-view',
                    locations, selectedLocation, userSettings,
                    onLocationChange: handleLocationChange,
                    onCreateLocation: handleCreateLocation,
                    onUpdateLocation: handleUpdateLocation,
                    onThemeToggle: handleThemeToggle,
                    onLogoUpload: handleLogoUpload,
                    loading
                }) : 
                currentView === 'settings' ? 
                    SimpleView('Settings', 'Settings component is loading...') : null,

            currentView === 'pos' && !selectedLocation ? 
                React.createElement('div', { 
                    key: 'no-location',
                    className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-12 text-center' 
                }, [
                    React.createElement(Settings, { 
                        key: 'icon',
                        className: 'mx-auto mb-4 text-gray-400', 
                        size: 64 
                    }),
                    React.createElement('h3', { 
                        key: 'title',
                        className: 'text-xl font-semibold text-gray-900 dark:text-white mb-2' 
                    }, 'No Location Selected'),
                    React.createElement('p', { 
                        key: 'description',
                        className: 'text-gray-600 dark:text-gray-300 mb-6' 
                    }, 'Please select a location in Settings to use this feature'),
                    React.createElement('button', {
                        key: 'go-settings',
                        onClick: () => setCurrentView('settings'),
                        className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    }, 'Go to Settings')
                ]) : null,

            // Other views with fallbacks
            currentView === 'pos' && selectedLocation ? 
                SimpleView('POS', 'POS view will be available once all components are loaded.') : null,
            
            currentView === 'loyalty' ? 
                SimpleView('Loyalty', 'Loyalty management will be available when fully loaded.') : null,
                
            currentView === 'inventory' ? 
                SimpleView('Inventory', 'Inventory management will be available when fully loaded.') : null,
                
            currentView === 'sales' ? 
                SimpleView('Sales', 'Sales reporting will be available when fully loaded.') : null
        ]),

        // Loading Overlay
        loading && React.createElement('div', {
            key: 'loading-overlay',
            className: 'fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'
        }, [
            React.createElement('div', { 
                className: 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center gap-3' 
            }, [
                React.createElement('div', { 
                    className: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' 
                }),
                React.createElement('span', { 
                    className: 'text-gray-700 dark:text-gray-300' 
                }, 'Loading...')
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