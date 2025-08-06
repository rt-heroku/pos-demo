// Simplified main POS Application - Progressive Loading
// This version doesn't wait for all components, just handles them as they become available

const { useState, useEffect } = React;

const POSApp = () => {
    // Basic state management
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userSettings, setUserSettings] = useState({
        theme_mode: 'light',
        selected_location_id: null
    });
    
    // App state
    const [currentView, setCurrentView] = useState('settings');
    const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(true);
    const [loading, setLoading] = useState(false);
    const [appLoading, setAppLoading] = useState(true);

    // Initialize the application
    useEffect(() => {
        initializeApp();
    }, []);

    // Apply theme when settings change
    useEffect(() => {
        if (userSettings.theme_mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [userSettings.theme_mode]);

    // Generate user identifier for settings
    const getUserId = () => {
        let userId = localStorage.getItem('pos_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pos_user_id', userId);
        }
        return userId;
    };

    // Initialize the application
    const initializeApp = async () => {
        console.log('Initializing app...');
        try {
            setAppLoading(true);
            
            // Load basic data
            await loadLocations();
            await loadUserSettings();
            // Check if setup is required
            try {
                const response = await fetch('/api/setup/status');
                if (response.ok) {
                    const setupStatus = await response.json();
                    setIsFirstTimeSetup(setupStatus.setupRequired);
                    console.log('Setup required:', setupStatus.setupRequired);
                } else {
                    console.log('Setup API not available, assuming first-time setup');
                    setIsFirstTimeSetup(true);
                }
            } catch (error) {
                console.log('Setup API not available, assuming first-time setup');
                setIsFirstTimeSetup(true);
            }
            
            // Load basic data
            await loadLocations();
            await loadUserSettings();
            
            console.log('App initialization complete');
        } catch (error) {
            console.error('Failed to initialize app:', error);
        } finally {
            setAppLoading(false);
        }
    };

    // Data loading functions
    const loadLocations = async () => {
        try {
            const response = await fetch('/api/locations');
            if (response.ok) {
                const data = await response.json();
                setLocations(data || []);
                console.log('Loaded locations:', data?.length || 0);
                return data || [];
            }
        } catch (error) {
            console.error('Failed to load locations:', error);
        }
        return [];
    };

    const loadUserSettings = async () => {
        try {
            const userId = getUserId();
            const response = await fetch(`/api/settings/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserSettings(data || { theme_mode: 'light' });
                console.log('Loaded user settings:', data);
                return data || { theme_mode: 'light' };
            }
        } catch (error) {
            console.error('Failed to load user settings:', error);
        }
        return { theme_mode: 'light' };
    };

    // Location management functions
    const handleLocationChange = async (location) => {
        if (!location) return;
        
        console.log('Changing location to:', location.store_name);
        setLoading(true);
        try {
            setSelectedLocation(location);
            
            // Save to user settings
            const userId = getUserId();
            const response = await fetch(`/api/settings/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selected_location_id: location.id })
            });
            
            if (response.ok) {
                const updatedSettings = await response.json();
                setUserSettings(updatedSettings);
            }
            
            // If this was first-time setup, switch to POS view
            if (isFirstTimeSetup) {
                setIsFirstTimeSetup(false);
                setCurrentView('pos');
            }
            
            console.log('Location changed successfully, isFirstTimeSetup' + isFirstTimeSetup);
        } catch (error) {
            console.error('Failed to change location:', error);
            alert('Failed to switch location. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLocation = async (locationData) => {
        console.log('Creating location:', locationData);
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
            console.log('Created location:', newLocation);
            
            // Reload locations
            await loadLocations();
            
            // Auto-select the new location
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
                console.log('Theme changed to:', theme);
            }
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    // Placeholder handlers
    const handleUpdateLocation = (locationId, locationData) => {
        console.log('Update location not implemented yet');
    };

    const handleLogoUpload = (locationId, logoBase64) => {
        console.log('Logo upload not implemented yet');
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

    // Simple view component
    const SimpleView = (title, message) => (
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 text-center' }, [
            React.createElement('h2', { key: 'title', className: 'text-2xl font-bold mb-4 dark:text-white' }, title),
            React.createElement('p', { key: 'message', className: 'text-gray-600 dark:text-gray-300' }, message)
        ])
    );

    // Loading screen for initial app load
    if (appLoading) {
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
                }, 'Loading POS System...'),
                React.createElement('p', { 
                    key: 'subtext',
                    className: 'text-gray-500 dark:text-gray-400 text-sm mt-2' 
                }, 'Initializing application')
            ])
        ]);
    }

    // Get icons safely
    const icons = window.Icons || {};
    const { ShoppingCart, Award, Package, BarChart3, Settings } = icons;

    // Check if basic icons are available
    if (!ShoppingCart) {
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-100 flex items-center justify-center' 
        }, [
            React.createElement('div', { className: 'text-center p-8 bg-white rounded-lg shadow max-w-md' }, [
                React.createElement('h2', { className: 'text-xl font-bold text-red-600 mb-4' }, 'Icons Not Loaded'),
                React.createElement('p', { className: 'text-gray-600 mb-4' }, 'The icons.js file is not loaded or has errors.'),
                React.createElement('button', {
                    onClick: () => window.location.reload(),
                    className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                }, 'Reload Page'),
                React.createElement('div', { className: 'mt-4 text-left text-xs text-gray-500' }, [
                    React.createElement('p', { key: 'debug1' }, 'Debug info:'),
                    React.createElement('p', { key: 'debug2' }, `window.Icons exists: ${!!window.Icons}`),
                    React.createElement('p', { key: 'debug3' }, `ShoppingCart exists: ${!!icons.ShoppingCart}`)
                ])
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
            // Settings view
            currentView === 'settings' ? (
                window.Views && window.Views.SettingsView ? 
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
                    SimpleView('Settings', 'Settings view is loading... Please make sure views.js is loaded correctly.')
            ) : null,

            // No location selected message
            (currentView === 'pos' || currentView === 'sales') && !selectedLocation ? 
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

            // Other views with simple placeholders
            currentView === 'pos' && selectedLocation ? 
                SimpleView('POS', 'POS view will be available once all components are loaded.') : null,
            
            currentView === 'loyalty' ? 
                SimpleView('Loyalty', 'Loyalty management will be available when fully loaded.') : null,
                
            currentView === 'inventory' ? 
                SimpleView('Inventory', 'Inventory management will be available when fully loaded.') : null,
                
            currentView === 'sales' ? 
                SimpleView('Sales', 'Sales reporting will be available when fully loaded.') : null,

            // Debug info for development
            React.createElement('div', { key: 'debug', className: 'mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400' }, [
                React.createElement('p', { key: 'debug1' }, `Current view: ${currentView}`),
                React.createElement('p', { key: 'debug2' }, `Selected location: ${selectedLocation?.store_name || 'None'}`),
                React.createElement('p', { key: 'debug3' }, `Locations loaded: ${locations.length}`),
                React.createElement('p', { key: 'debug4' }, `window.Views exists: ${!!window.Views}`),
                React.createElement('p', { key: 'debug5' }, `window.API exists: ${!!window.API}`),
                React.createElement('p', { key: 'debug6' }, `Theme: ${userSettings.theme_mode}`)
            ])
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