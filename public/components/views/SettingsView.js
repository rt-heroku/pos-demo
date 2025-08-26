if (!window.Views) {
    window.Views = {};
}

// SettingsView Component
window.Views.SettingsView = ({ 
        locations,
        selectedLocation,
        userSettings,
        onLocationChange,
        onCreateLocation,
        onUpdateLocation,
        onThemeToggle,
        onLogoUpload,
        loading,
        currentUser,
        onLogout
    }) => {
        const { Settings, Plus, Upload, Moon, Sun, MapPin, Edit, Save, X, Image, Trash2, Database, Key, Copy, CheckCircle, Users, LogOut } = window.Icons;
        
        const [activeTab, setActiveTab] = React.useState('locations');
        const [showNewLocationModal, setShowNewLocationModal] = React.useState(false);
        const [editingLocation, setEditingLocation] = React.useState(null);
        const [isDarkMode, setIsDarkMode] = React.useState(userSettings?.theme_mode === 'dark');
        const [logoPreview, setLogoPreview] = React.useState(null);
        
        // System Settings State
        const [systemSettings, setSystemSettings] = React.useState([]);
        const [filteredSettings, setFilteredSettings] = React.useState([]);
        const [selectedCategory, setSelectedCategory] = React.useState('all');
        const [showSettingModal, setShowSettingModal] = React.useState(false);
        const [editingSetting, setEditingSetting] = React.useState(null);
        const [databaseInfo, setDatabaseInfo] = React.useState(null);
        const [copiedToClipboard, setCopiedToClipboard] = React.useState('');
        
        // FIX: Use a ref to track the form data to prevent re-renders from losing focus
        const formDataRef = React.useRef({
            store_code: '',
            store_name: '',
            brand: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            zip_code: '',
            phone: '',
            email: '',
            tax_rate: '0.08',
            manager_name: '',
            logo_base64: null
        });
        
        const [newLocationForm, setNewLocationForm] = React.useState(formDataRef.current);
        
        // System Setting Form
        const [settingForm, setSettingForm] = React.useState({
            setting_key: '',
            setting_value: '',
            description: '',
            category: 'general',
            setting_type: 'text'
        });

        // Load system settings
        React.useEffect(() => {
            if (activeTab === 'system') {
                loadSystemSettings();
                loadDatabaseInfo();
            }
        }, [activeTab]);

        // Users state
        const [users, setUsers] = React.useState([]);
        const [roles, setRoles] = React.useState([]);
        const [showCreateUserForm, setShowCreateUserForm] = React.useState(false);
        const [createUserForm, setCreateUserForm] = React.useState({
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role_id: ''
        });

        // User editing state
        const [showEditUserForm, setShowEditUserForm] = React.useState(false);
        const [editingUser, setEditingUser] = React.useState(null);
        const [editUserForm, setEditUserForm] = React.useState({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            role_id: '',
            is_active: true
        });

        // Password change state
        const [showPasswordModal, setShowPasswordModal] = React.useState(false);
        const [passwordForm, setPasswordForm] = React.useState({
            new_password: '',
            confirm_password: ''
        });
        const [changingPasswordFor, setChangingPasswordFor] = React.useState(null);

        // Load users when users tab is active
        React.useEffect(() => {
            if (activeTab === 'users' && currentUser?.permissions?.users?.read) {
                loadUsers();
                loadRoles();
            }
        }, [activeTab, currentUser]);

        const loadUsers = async () => {
            try {
                const data = await window.API.call('/users');
                setUsers(data);
            } catch (err) {
                console.error('Failed to load users:', err);
                setUsers([]);
            }
        };

        const loadRoles = async () => {
            try {
                const data = await window.API.call('/roles');
                setRoles(data);
            } catch (err) {
                console.error('Failed to load roles:', err);
                setRoles([]);
            }
        };

        const handleCreateUser = async (e) => {
            e.preventDefault();
            try {
                await window.API.call('/users', {
                    method: 'POST',
                    body: JSON.stringify(createUserForm)
                });

                await loadUsers();
                setShowCreateUserForm(false);
                setCreateUserForm({
                    username: '',
                    email: '',
                    password: '',
                    first_name: '',
                    last_name: '',
                    role_id: ''
                });
                alert('User created successfully!');
            } catch (err) {
                alert(err.message || 'Failed to create user');
            }
        };

        const handleEditUser = async (e) => {
            e.preventDefault();
            try {
                await window.API.call(`/users/${editingUser.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(editUserForm)
                });

                await loadUsers();
                setShowEditUserForm(false);
                setEditingUser(null);
                setEditUserForm({
                    username: '',
                    email: '',
                    first_name: '',
                    last_name: '',
                    role_id: '',
                    is_active: true
                });
                alert('User updated successfully!');
            } catch (err) {
                alert(err.message || 'Failed to update user');
            }
        };

        const handleDeleteUser = async (userId, username) => {
            if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
                return;
            }

            try {
                await window.API.call(`/users/${userId}`, {
                    method: 'DELETE'
                });

                await loadUsers();
                alert('User deleted successfully!');
            } catch (err) {
                alert(err.message || 'Failed to delete user');
            }
        };

        const handleChangePassword = async (e) => {
            e.preventDefault();
            
            if (passwordForm.new_password !== passwordForm.confirm_password) {
                alert('Passwords do not match!');
                return;
            }

            if (passwordForm.new_password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }

            try {
                await window.API.call(`/users/${changingPasswordFor.id}/password`, {
                    method: 'PUT',
                    body: JSON.stringify({ new_password: passwordForm.new_password })
                });

                setShowPasswordModal(false);
                setChangingPasswordFor(null);
                setPasswordForm({ new_password: '', confirm_password: '' });
                alert('Password changed successfully!');
            } catch (err) {
                alert(err.message || 'Failed to change password');
            }
        };

        const openEditUser = (user) => {
            setEditingUser(user);
            setEditUserForm({
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role_id: user.role_id,
                is_active: user.is_active
            });
            setShowEditUserForm(true);
        };

        const openChangePassword = (user) => {
            setChangingPasswordFor(user);
            setPasswordForm({ new_password: '', confirm_password: '' });
            setShowPasswordModal(true);
        };

        // Filter settings by category
        React.useEffect(() => {
            if (selectedCategory === 'all') {
                setFilteredSettings(systemSettings);
            } else {
                setFilteredSettings(systemSettings.filter(s => s.category === selectedCategory));
            }
        }, [selectedCategory, systemSettings]);

        const loadSystemSettings = async () => {
            try {
                const data = await window.API.call('/system-settings');
                setSystemSettings(data);
                setFilteredSettings(data);
            } catch (error) {
                console.error('Failed to load system settings:', error);
                setSystemSettings([]);
                setFilteredSettings([]);
            }
        };

        const loadDatabaseInfo = async () => {
            try {
                const data = await window.API.call('/system-settings/database/info');
                setDatabaseInfo(data);
            } catch (error) {
                console.error('Failed to load database info:', error);
                setDatabaseInfo(null);
            }
        };

        const handleSaveSetting = async () => {
            try {
                const method = editingSetting ? 'PUT' : 'POST';
                const url = editingSetting 
                    ? `/system-settings/${editingSetting.setting_key}`
                    : '/system-settings';
                
                const data = await window.API.call(url, {
                    method,
                    body: JSON.stringify(settingForm)
                });
                
                await loadSystemSettings();
                setShowSettingModal(false);
                setEditingSetting(null);
                setSettingForm({
                    setting_key: '',
                    setting_value: '',
                    description: '',
                    category: 'general',
                    setting_type: 'text'
                });
                
                alert('Setting saved successfully!');
            } catch (error) {
                alert(error.message || 'Failed to save setting');
            }
        };

        const handleDeleteSetting = async (key) => {
            if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) return;
            
            try {
                await window.API.call(`/system-settings/${key}`, {
                    method: 'DELETE'
                });
                
                await loadSystemSettings();
                alert('Setting deleted successfully!');
            } catch (error) {
                alert(error.message || 'Failed to delete setting');
            }
        };

        const handleEditSetting = (setting) => {
            setEditingSetting(setting);
            setSettingForm({
                setting_key: setting.setting_key,
                setting_value: setting.setting_value,
                description: setting.description || '',
                category: setting.category,
                setting_type: setting.setting_type
            });
            setShowSettingModal(true);
        };

        const copyToClipboard = (text, type) => {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedToClipboard(type);
                setTimeout(() => setCopiedToClipboard(''), 2000);
            });
        };

        // Handle dark mode toggle
        const handleThemeToggle = () => {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            onThemeToggle(newMode ? 'dark' : 'light');
            
            if (newMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        // Handle logo upload
        const handleLogoUpload = (event, isForLocation = false) => {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                
                if (isForLocation) {
                    // FIX: Update both ref and state
                    formDataRef.current.logo_base64 = base64;
                    setNewLocationForm(prev => ({
                        ...prev,
                        logo_base64: base64
                    }));
                    setLogoPreview(base64);
                } else {
                    onLogoUpload(selectedLocation.id, base64);
                }
            };
            reader.readAsDataURL(file);
        };

        // FIX: Optimized input change handler that updates ref first
        const handleInputChange = (field, value) => {
            formDataRef.current[field] = value;
            setNewLocationForm({...formDataRef.current});
        };

        // Handle create new location
        const handleCreateLocation = () => {
            const required = ['store_code', 'store_name', 'brand', 'address_line1', 'city', 'state', 'zip_code'];
            const missing = required.filter(field => !formDataRef.current[field].trim());
            
            if (missing.length > 0) {
                alert(`Please fill in required fields: ${missing.join(', ')}`);
                return;
            }

            if (!/^[A-Z0-9]{3,10}$/.test(formDataRef.current.store_code)) {
                alert('Store code must be 3-10 uppercase letters and numbers');
                return;
            }

            const taxRate = parseFloat(formDataRef.current.tax_rate);
            if (isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
                alert('Tax rate must be a decimal between 0 and 1 (e.g., 0.08 for 8%)');
                return;
            }

            onCreateLocation(formDataRef.current);
            setShowNewLocationModal(false);
            
            // Reset form
            formDataRef.current = {
                store_code: '',
                store_name: '',
                brand: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                zip_code: '',
                phone: '',
                email: '',
                tax_rate: '0.08',
                manager_name: '',
                logo_base64: null
            };
            setNewLocationForm(formDataRef.current);
            setLogoPreview(null);
        };

        const TabButton = ({ tab, label, icon: Icon, active }) => (
            React.createElement('button', {
                onClick: () => setActiveTab(tab),
                className: `flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                    active 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
            }, [
                React.createElement(Icon, { key: 'icon', size: 18 }),
                React.createElement('span', { key: 'label' }, label)
            ])
        );

        const CategoryBadge = ({ category }) => {
            const colors = {
                general: 'bg-gray-100 text-gray-800',
                pos: 'bg-blue-100 text-blue-800',
                loyalty: 'bg-green-100 text-green-800',
                inventory: 'bg-purple-100 text-purple-800',
                email: 'bg-yellow-100 text-yellow-800',
                integration: 'bg-indigo-100 text-indigo-800'
            };
            
            return React.createElement('span', {
                className: `px-2 py-1 rounded-full text-xs font-medium ${colors[category] || colors.general}`
            }, category);
        };

        const LocationCard = ({ location, isSelected }) => (
            React.createElement('div', {
                className: `border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`
            }, [
                React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-3' }, [
                    React.createElement('div', { key: 'info', className: 'flex-1' }, [
                        React.createElement('div', { className: 'flex items-center gap-2 mb-2' }, [
                            location.logo_base64 && React.createElement('img', {
                                key: 'logo',
                                src: location.logo_base64,
                                alt: `${location.store_name} logo`,
                                className: 'w-8 h-8 object-contain rounded'
                            }),
                            React.createElement('h3', { key: 'name', className: 'font-bold text-lg dark:text-white' }, 
                                location.store_name
                            ),
                            isSelected && React.createElement('span', {
                                key: 'selected-badge',
                                className: 'px-2 py-1 bg-blue-600 text-white text-xs rounded-full'
                            }, 'Selected')
                        ]),
                        React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300' }, 
                            `${location.brand} • ${location.store_code}`
                        ),
                        React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300' }, 
                            `${location.address_line1}, ${location.city}, ${location.state}`
                        )
                    ]),
                    React.createElement('button', {
                        key: 'edit-btn',
                        onClick: (e) => {
                            e.stopPropagation();
                            setEditingLocation(location);
                        },
                        className: 'p-2 text-gray-400 hover:text-blue-600 rounded transition-colors'
                    }, React.createElement(Edit, { size: 16 }))
                ]),
                React.createElement('div', { key: 'details', className: 'grid grid-cols-2 gap-4 text-sm' }, [
                    React.createElement('div', { key: 'tax' }, [
                        React.createElement('span', { className: 'text-gray-500 dark:text-gray-400' }, 'Tax Rate: '),
                        React.createElement('span', { className: 'font-medium dark:text-white' }, 
                            `${(location.tax_rate * 100).toFixed(2)}%`
                        )
                    ]),
                    React.createElement('div', { key: 'manager' }, [
                        React.createElement('span', { className: 'text-gray-500 dark:text-gray-400' }, 'Manager: '),
                        React.createElement('span', { className: 'font-medium dark:text-white' }, 
                            location.manager_name || 'Not assigned'
                        )
                    ])
                ])
            ])
        );

        const LocationFormModal_ = ({ show, onClose, title, isEdit = false }) => {return null;};

        // FIX: Optimized Location Form Modal that doesn't lose focus
        const LocationFormModal = ({ show, onClose, title, isEdit = false }) => {
            if (!show) return null;

            return React.createElement('div', {
                className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
            }, [
                React.createElement('div', { 
                    key: 'modal',
                    className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'
                }, [
                    React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                        React.createElement('h2', { className: 'text-xl font-bold dark:text-white' }, title),
                        React.createElement('button', {
                            onClick: () => {
                                setShowNewLocationModal(false);
                                setLogoPreview(null);
                                // Reset form
                                formDataRef.current = {
                                    store_code: '',
                                    store_name: '',
                                    brand: '',
                                    address_line1: '',
                                    address_line2: '',
                                    city: '',
                                    state: '',
                                    zip_code: '',
                                    phone: '',
                                    email: '',
                                    tax_rate: '0.08',
                                    manager_name: '',
                                    logo_base64: null
                                };
                                setNewLocationForm(formDataRef.current);
                            },
                            className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }, React.createElement(X, { size: 24 }))
                    ]),
                    
                    React.createElement('div', { key: 'form', className: 'p-6 space-y-6' }, [
                        // Logo upload section
                        React.createElement('div', { key: 'logo-section' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Store Logo'),
                            React.createElement('div', { className: 'flex items-center gap-4' }, [
                                React.createElement('div', { 
                                    className: 'w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700' 
                                }, [
                                    (logoPreview || newLocationForm.logo_base64) ? 
                                        React.createElement('img', {
                                            src: logoPreview || newLocationForm.logo_base64,
                                            alt: 'Logo preview',
                                            className: 'w-full h-full object-contain rounded'
                                        }) :
                                        React.createElement(Image, { size: 24, className: 'text-gray-400' })
                                ]),
                                React.createElement('input', {
                                    type: 'file',
                                    accept: 'image/*',
                                    onChange: (e) => handleLogoUpload(e, true),
                                    className: 'hidden',
                                    id: 'logo-upload'
                                }),
                                React.createElement('label', {
                                    htmlFor: 'logo-upload',
                                    className: 'flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors'
                                }, [
                                    React.createElement(Upload, { key: 'icon', size: 16 }),
                                    'Upload Logo'
                                ])
                            ])
                        ]),

                        // Basic information - FIX: Using value from state and onChange updates ref
                        React.createElement('div', { key: 'basic-info', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                            React.createElement('div', { key: 'store-code' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Store Code *'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: newLocationForm.store_code,
                                    onChange: (e) => handleInputChange('store_code', e.target.value.toUpperCase()),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'NYC001',
                                    maxLength: 10
                                })
                            ]),
                            React.createElement('div', { key: 'store-name' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Store Name *'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: newLocationForm.store_name,
                                    onChange: (e) => handleInputChange('store_name', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Manhattan Flagship'
                                })
                            ]),
                            React.createElement('div', { key: 'brand' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Brand *'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: newLocationForm.brand,
                                    onChange: (e) => handleInputChange('brand', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'TUMI'
                                })
                            ]),
                            React.createElement('div', { key: 'manager' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Manager Name'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: newLocationForm.manager_name,
                                    onChange: (e) => handleInputChange('manager_name', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'John Manager'
                                })
                            ])
                        ]),

                        // Address information
                        React.createElement('div', { key: 'address-section' }, [
                            React.createElement('h3', { className: 'text-lg font-semibold mb-4 dark:text-white' }, 'Address Information'),
                            React.createElement('div', { className: 'space-y-4' }, [
                                React.createElement('input', {
                                    type: 'text',
                                    value: newLocationForm.address_line1,
                                    onChange: (e) => handleInputChange('address_line1', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Street Address *'
                                }),
                                React.createElement('input', {
                                    type: 'text',
                                    value: newLocationForm.address_line2,
                                    onChange: (e) => handleInputChange('address_line2', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Apartment, suite, etc. (optional)'
                                }),
                                React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-4' }, [
                                    React.createElement('input', {
                                        type: 'text',
                                        value: newLocationForm.city,
                                        onChange: (e) => handleInputChange('city', e.target.value),
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                        placeholder: 'City *'
                                    }),
                                    React.createElement('input', {
                                        type: 'text',
                                        value: newLocationForm.state,
                                        onChange: (e) => handleInputChange('state', e.target.value),
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                        placeholder: 'State *',
                                        maxLength: 2
                                    }),
                                    React.createElement('input', {
                                        type: 'text',
                                        value: newLocationForm.zip_code,
                                        onChange: (e) => handleInputChange('zip_code', e.target.value),
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                        placeholder: 'ZIP Code *'
                                    })
                                ])
                            ])
                        ]),

                        // Contact and business information
                        React.createElement('div', { key: 'contact-section', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                            React.createElement('div', { key: 'phone' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Phone'),
                                React.createElement('input', {
                                    type: 'tel',
                                    value: newLocationForm.phone,
                                    onChange: (e) => handleInputChange('phone', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: '(555) 123-4567'
                                })
                            ]),
                            React.createElement('div', { key: 'email' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Email'),
                                React.createElement('input', {
                                    type: 'email',
                                    value: newLocationForm.email,
                                    onChange: (e) => handleInputChange('email', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'store@company.com'
                                })
                            ]),
                            React.createElement('div', { key: 'tax-rate', className: 'md:col-span-2' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Tax Rate (decimal) *'),
                                React.createElement('input', {
                                    type: 'number',
                                    step: '0.0001',
                                    min: '0',
                                    max: '1',
                                    value: newLocationForm.tax_rate,
                                    onChange: (e) => handleInputChange('tax_rate', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: '0.08'
                                }),
                                React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, 
                                    'Enter as decimal: 0.08 for 8%, 0.10 for 10%'
                                )
                            ])
                        ])
                    ]),

                    React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                        React.createElement('button', {
                            onClick: () => {
                                setShowNewLocationModal(false);
                                setLogoPreview(null);
                                formDataRef.current = {
                                    store_code: '',
                                    store_name: '',
                                    brand: '',
                                    address_line1: '',
                                    address_line2: '',
                                    city: '',
                                    state: '',
                                    zip_code: '',
                                    phone: '',
                                    email: '',
                                    tax_rate: '0.08',
                                    manager_name: '',
                                    logo_base64: null
                                };
                                setNewLocationForm(formDataRef.current);
                            },
                            disabled: loading,
                            className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
                        }, 'Cancel'),
                        React.createElement('button', {
                            onClick: handleCreateLocation,
                            disabled: loading,
                            className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2'
                        }, [
                            loading && React.createElement('div', { 
                                key: 'spinner',
                                className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                            }),
                            loading ? 'Creating...' : 'Create Location'
                        ])
                    ])
                ])
            ]);
        };

        // System Settings Modal
        const SystemSettingModal = ({ show, onClose }) => {
            if (!show) return null;

            return React.createElement('div', {
                className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
            }, [
                React.createElement('div', { 
                    key: 'modal',
                    className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg'
                }, [
                    React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                        React.createElement('h2', { className: 'text-xl font-bold dark:text-white' }, 
                            editingSetting ? 'Edit System Setting' : 'Add System Setting'
                        ),
                        React.createElement('button', {
                            onClick: onClose,
                            className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }, React.createElement(X, { size: 24 }))
                    ]),
                    
                    React.createElement('div', { key: 'form', className: 'p-6 space-y-4' }, [
                        React.createElement('div', { key: 'key' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Setting Key *'),
                            React.createElement('input', {
                                type: 'text',
                                value: settingForm.setting_key,
                                onChange: (e) => setSettingForm(prev => ({ ...prev, setting_key: e.target.value })),
                                disabled: !!editingSetting,
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600',
                                placeholder: 'e.g., company_email'
                            })
                        ]),
                        
                        React.createElement('div', { key: 'value' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Setting Value *'),
                            settingForm.setting_type === 'boolean' ? 
                                React.createElement('select', {
                                    value: settingForm.setting_value,
                                    onChange: (e) => setSettingForm(prev => ({ ...prev, setting_value: e.target.value })),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                }, [
                                    React.createElement('option', { key: 'true', value: 'true' }, 'True'),
                                    React.createElement('option', { key: 'false', value: 'false' }, 'False')
                                ]) :
                                React.createElement('input', {
                                    type: settingForm.setting_type === 'number' ? 'number' : 'text',
                                    value: settingForm.setting_value,
                                    onChange: (e) => setSettingForm(prev => ({ ...prev, setting_value: e.target.value })),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Setting value'
                                })
                        ]),
                        
                        React.createElement('div', { key: 'type', className: 'grid grid-cols-2 gap-4' }, [
                            React.createElement('div', { key: 'category' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Category'),
                                React.createElement('select', {
                                    value: settingForm.category,
                                    onChange: (e) => setSettingForm(prev => ({ ...prev, category: e.target.value })),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                }, [
                                    React.createElement('option', { key: 'general', value: 'general' }, 'General'),
                                    React.createElement('option', { key: 'pos', value: 'pos' }, 'POS'),
                                    React.createElement('option', { key: 'loyalty', value: 'loyalty' }, 'Loyalty'),
                                    React.createElement('option', { key: 'inventory', value: 'inventory' }, 'Inventory'),
                                    React.createElement('option', { key: 'email', value: 'email' }, 'Email'),
                                    React.createElement('option', { key: 'integration', value: 'integration' }, 'Integration')
                                ])
                            ]),
                            React.createElement('div', { key: 'type' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Type'),
                                React.createElement('select', {
                                    value: settingForm.setting_type,
                                    onChange: (e) => setSettingForm(prev => ({ ...prev, setting_type: e.target.value })),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                }, [
                                    React.createElement('option', { key: 'text', value: 'text' }, 'Text'),
                                    React.createElement('option', { key: 'number', value: 'number' }, 'Number'),
                                    React.createElement('option', { key: 'boolean', value: 'boolean' }, 'Boolean'),
                                    React.createElement('option', { key: 'json', value: 'json' }, 'JSON')
                                ])
                            ])
                        ]),
                        
                        React.createElement('div', { key: 'description' }, [
                            React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Description'),
                            React.createElement('textarea', {
                                value: settingForm.description,
                                onChange: (e) => setSettingForm(prev => ({ ...prev, description: e.target.value })),
                                rows: 3,
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                placeholder: 'Describe what this setting controls'
                            })
                        ])
                    ]),

                    React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                        React.createElement('button', {
                            onClick: onClose,
                            className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                        }, 'Cancel'),
                        React.createElement('button', {
                            onClick: handleSaveSetting,
                            className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
                        }, [
                            React.createElement(Save, { key: 'icon', size: 16 }),
                            editingSetting ? 'Update Setting' : 'Create Setting'
                        ])
                    ])
                ])
            ]);
        };

        return React.createElement('div', { className: 'space-y-6 dark:text-white' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                React.createElement('div', { className: 'flex items-center justify-between mb-6' }, [
                    React.createElement('div', { key: 'title' }, [
                        React.createElement('h2', { className: 'text-2xl font-bold flex items-center gap-3 dark:text-white' }, [
                            React.createElement(Settings, { key: 'icon', size: 28 }),
                            'Settings'
                        ]),
                        React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 mt-1' }, 
                            'Manage locations, system settings, and preferences'
                        )
                    ]),
                    React.createElement('div', { key: 'theme-toggle', className: 'flex items-center gap-4' }, [
                        React.createElement('span', { className: 'text-sm font-medium dark:text-gray-300' }, 'Theme:'),
                        React.createElement('button', {
                            onClick: handleThemeToggle,
                            className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`
                        }, [
                            React.createElement(isDarkMode ? Sun : Moon, { key: 'theme-icon', size: 20 }),
                            React.createElement('span', { key: 'theme-text', className: 'font-medium' }, 
                                isDarkMode ? 'Dark Mode' : 'Light Mode'
                            )
                        ])
                    ])
                ]),
                
                // Tab Navigation
                React.createElement('div', { key: 'tabs', className: 'flex gap-2' }, [
                    React.createElement(TabButton, { 
                        key: 'locations-tab',
                        tab: 'locations', 
                        label: 'Store Locations', 
                        icon: MapPin,
                        active: activeTab === 'locations' 
                    }),
                    currentUser?.role_name === 'admin' && React.createElement(TabButton, { 
                        key: 'system-tab',
                        tab: 'system', 
                        label: 'System Settings', 
                        icon: Settings,
                        active: activeTab === 'system' 
                    }),
                    currentUser?.permissions?.users?.read && React.createElement(TabButton, { 
                        key: 'users-tab',
                        tab: 'users', 
                        label: 'Users', 
                        icon: Users,
                        active: activeTab === 'users' 
                    })
                ]),
                
                // Logout Button
                React.createElement('div', { key: 'logout-section', className: 'flex justify-end mt-4' }, [
                    React.createElement('button', {
                        onClick: onLogout,
                        className: 'flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                    }, [
                        React.createElement(LogOut, { key: 'icon', size: 18 }),
                        React.createElement('span', { key: 'text' }, 'Logout')
                    ])
                ])
            ]),

            // Tab Content
            activeTab === 'locations' && React.createElement('div', { key: 'locations-content', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                React.createElement('div', { key: 'section-header', className: 'flex items-center justify-between mb-6' }, [
                    React.createElement('div', { key: 'title' }, [
                        React.createElement('h3', { className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                            React.createElement(MapPin, { key: 'icon', size: 24 }),
                            'Store Locations'
                        ]),
                        React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
                            `${locations.length} locations configured • Selected: ${selectedLocation?.store_name || 'None'}`
                        )
                    ]),
                    React.createElement('button', {
                        key: 'add-btn',
                        onClick: () => setShowNewLocationModal(true),
                        className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    }, [
                        React.createElement(Plus, { key: 'icon', size: 20 }),
                        'Add Location'
                    ])
                ]),

                // Current location selector
                selectedLocation && React.createElement('div', { key: 'current-location', className: 'mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'current-info', className: 'flex items-center gap-3' }, [
                            selectedLocation.logo_base64 && React.createElement('img', {
                                key: 'logo',
                                src: selectedLocation.logo_base64,
                                alt: 'Current location logo',
                                className: 'w-12 h-12 object-contain rounded'
                            }),
                            React.createElement('div', { key: 'details' }, [
                                React.createElement('h4', { className: 'font-bold text-blue-900 dark:text-blue-100' }, 
                                    `Currently Operating: ${selectedLocation.store_name}`
                                ),
                                React.createElement('p', { className: 'text-sm text-blue-700 dark:text-blue-200' }, 
                                    `${selectedLocation.address_line1}, ${selectedLocation.city} • Tax: ${(selectedLocation.tax_rate * 100).toFixed(2)}%`
                                )
                            ])
                        ]),
                        React.createElement('div', { key: 'logo-upload', className: 'flex items-center gap-2' }, [
                            React.createElement('input', {
                                type: 'file',
                                accept: 'image/*',
                                onChange: (e) => handleLogoUpload(e, false),
                                className: 'hidden',
                                id: 'current-logo-upload'
                            }),
                            React.createElement('label', {
                                htmlFor: 'current-logo-upload',
                                className: 'flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer transition-colors'
                            }, [
                                React.createElement(Upload, { key: 'icon', size: 16 }),
                                'Update Logo'
                            ])
                        ])
                    ])
                ]),

                // Location selection dropdown
                React.createElement('div', { key: 'location-selector', className: 'mb-6' }, [
                    React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Select Active Location'),
                    React.createElement('select', {
                        value: selectedLocation?.id || '',
                        onChange: (e) => {
                            const locationId = parseInt(e.target.value);
                            const location = locations.find(l => l.id === locationId);
                            onLocationChange(location);
                        },
                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    }, [
                        React.createElement('option', { key: 'empty', value: '' }, 'Select a location...'),
                        ...locations.map(location => 
                            React.createElement('option', { key: location.id, value: location.id }, 
                                `${location.store_name} (${location.store_code}) - ${location.city}, ${location.state}`
                            )
                        )
                    ])
                ]),

                // Locations grid
                locations.length > 0 ? (
                    React.createElement('div', { key: 'locations-grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' }, 
                        locations.map(location => 
                            React.createElement('div', {
                                key: location.id,
                                onClick: () => onLocationChange(location)
                            }, React.createElement(LocationCard, { 
                                location, 
                                isSelected: selectedLocation?.id === location.id 
                            }))
                        )
                    )
                ) : (
                    React.createElement('div', { key: 'no-locations', className: 'text-center py-12 text-gray-500 dark:text-gray-400' }, [
                        React.createElement(MapPin, { key: 'icon', className: 'mx-auto mb-4', size: 48 }),
                        React.createElement('p', { key: 'text', className: 'text-lg mb-2' }, 'No locations configured'),
                        React.createElement('p', { key: 'subtext', className: 'text-sm' }, 'Create your first location to get started')
                    ])
                )
            ]),

            // System Settings Tab
            activeTab === 'system' && currentUser?.role_name === 'admin' && React.createElement('div', { key: 'system-content', className: 'space-y-6' }, [
                // System Settings Section
                React.createElement('div', { key: 'system-settings', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                    React.createElement('div', { key: 'section-header', className: 'flex items-center justify-between mb-6' }, [
                        React.createElement('div', { key: 'title' }, [
                            React.createElement('h3', { className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                                React.createElement(Key, { key: 'icon', size: 24 }),
                                'System Settings'
                            ]),
                            React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
                                `${systemSettings.length} settings configured`
                            )
                        ]),
                        React.createElement('button', {
                            key: 'add-btn',
                            onClick: () => {
                                setEditingSetting(null);
                                setSettingForm({
                                    setting_key: '',
                                    setting_value: '',
                                    description: '',
                                    category: 'general',
                                    setting_type: 'text'
                                });
                                setShowSettingModal(true);
                            },
                            className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        }, [
                            React.createElement(Plus, { key: 'icon', size: 20 }),
                            'Add Setting'
                        ])
                    ]),

                    // Category Filter
                    React.createElement('div', { key: 'filters', className: 'mb-4' }, [
                        React.createElement('div', { className: 'flex gap-2 flex-wrap' }, [
                            React.createElement('button', {
                                onClick: () => setSelectedCategory('all'),
                                className: `px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === 'all' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`
                            }, 'All'),
                            ...['general', 'pos', 'loyalty', 'inventory', 'email', 'integration'].map(cat =>
                                React.createElement('button', {
                                    key: cat,
                                    onClick: () => setSelectedCategory(cat),
                                    className: `px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        selectedCategory === cat 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`
                                }, cat.charAt(0).toUpperCase() + cat.slice(1))
                            )
                        ])
                    ]),

                    // Settings Table
                    React.createElement('div', { key: 'settings-table', className: 'overflow-x-auto' }, [
                        React.createElement('table', { className: 'w-full' }, [
                            React.createElement('thead', { key: 'thead' }, [
                                React.createElement('tr', { className: 'border-b dark:border-gray-700' }, [
                                    React.createElement('th', { className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Key'),
                                    React.createElement('th', { className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Value'),
                                    React.createElement('th', { className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Category'),
                                    React.createElement('th', { className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Type'),
                                    React.createElement('th', { className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Description'),
                                    React.createElement('th', { className: 'text-center p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Actions')
                               ])
                           ]),
                           React.createElement('tbody', { key: 'tbody' }, 
                               filteredSettings.map(setting =>
                                   React.createElement('tr', { 
                                       key: setting.setting_key,
                                       className: 'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
                                   }, [
                                       React.createElement('td', { className: 'p-3 font-mono text-sm dark:text-white' }, setting.setting_key),
                                       React.createElement('td', { className: 'p-3' }, [
                                           React.createElement('div', { className: 'max-w-xs truncate text-sm dark:text-gray-300' }, 
                                               setting.setting_type === 'boolean' 
                                                   ? React.createElement('span', {
                                                       className: `px-2 py-1 rounded text-xs font-medium ${
                                                           setting.setting_value === 'true' 
                                                               ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                               : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                       }`
                                                   }, setting.setting_value)
                                                   : setting.setting_value
                                           )
                                       ]),
                                       React.createElement('td', { className: 'p-3' }, 
                                           React.createElement(CategoryBadge, { category: setting.category })
                                       ),
                                       React.createElement('td', { className: 'p-3' }, [
                                           React.createElement('span', { 
                                               className: 'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium' 
                                           }, setting.setting_type)
                                       ]),
                                       React.createElement('td', { className: 'p-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate' }, 
                                           setting.description
                                       ),
                                       React.createElement('td', { className: 'p-3' }, [
                                           React.createElement('div', { className: 'flex gap-1 justify-center' }, [
                                               React.createElement('button', {
                                                   onClick: () => handleEditSetting(setting),
                                                   className: 'p-1 text-gray-400 hover:text-blue-600 rounded transition-colors',
                                                   title: 'Edit'
                                               }, React.createElement(Edit, { size: 16 })),
                                               React.createElement('button', {
                                                   onClick: () => handleDeleteSetting(setting.setting_key),
                                                   className: 'p-1 text-gray-400 hover:text-red-600 rounded transition-colors',
                                                   title: 'Delete'
                                               }, React.createElement(Trash2, { size: 16 }))
                                           ])
                                       ])
                                   ])
                               )
                           )
                       ])
                   ])
               ]),

               // Database Connection Info
               React.createElement('div', { key: 'database-info', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                   React.createElement('div', { key: 'section-header', className: 'flex items-center gap-2 mb-6' }, [
                       React.createElement(Database, { key: 'icon', size: 24, className: 'text-gray-700 dark:text-gray-300' }),
                       React.createElement('h3', { className: 'text-xl font-bold dark:text-white' }, 'Database Connection')
                   ]),

                   databaseInfo ? React.createElement('div', { className: 'space-y-4' }, [
                       // PostgreSQL URL
                       React.createElement('div', { key: 'postgres-url' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'PostgreSQL Connection URL ($DATABASE_URL)'
                           ),
                           React.createElement('div', { className: 'flex gap-2' }, [
                               React.createElement('input', {
                                   type: 'text',
                                   value: databaseInfo.database_url,
                                   readOnly: true,
                                   className: 'flex-1 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white'
                               }),
                               React.createElement('button', {
                                   onClick: () => copyToClipboard(databaseInfo.database_url, 'postgres'),
                                   className: 'px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2'
                               }, [
                                   copiedToClipboard === 'postgres' 
                                       ? React.createElement(CheckCircle, { key: 'icon', size: 16, className: 'text-green-600' })
                                       : React.createElement(Copy, { key: 'icon', size: 16 }),
                                   copiedToClipboard === 'postgres' ? 'Copied!' : 'Copy'
                               ])
                           ])
                       ]),

                       // JDBC URL
                       React.createElement('div', { key: 'jdbc-url' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'JDBC Connection String'
                           ),
                           React.createElement('div', { className: 'flex gap-2' }, [
                               React.createElement('input', {
                                   type: 'text',
                                   value: databaseInfo.jdbc_format,
                                   readOnly: true,
                                   className: 'flex-1 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white'
                               }),
                               React.createElement('button', {
                                   onClick: () => copyToClipboard(databaseInfo.jdbc_format, 'jdbc'),
                                   className: 'px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2'
                               }, [
                                   copiedToClipboard === 'jdbc' 
                                       ? React.createElement(CheckCircle, { key: 'icon', size: 16, className: 'text-green-600' })
                                       : React.createElement(Copy, { key: 'icon', size: 16 }),
                                   copiedToClipboard === 'jdbc' ? 'Copied!' : 'Copy'
                               ])
                           ])
                       ]),

                       // SSL Mode
                       React.createElement('div', { key: 'ssl-mode' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'SSL Mode'),
                           React.createElement('div', { 
                               className: 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg' 
                           }, [
                               React.createElement('span', { 
                                   className: `px-2 py-1 rounded text-sm font-medium ${
                                       databaseInfo.ssl_mode === 'require' 
                                           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                           : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                   }`
                               }, databaseInfo.ssl_mode)
                           ])
                       ]),

                       // Connection Example
                       React.createElement('div', { key: 'connection-example', className: 'mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg' }, [
                           React.createElement('h4', { className: 'text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'Example: Using System Settings in SQL Queries'
                           ),
                           React.createElement('pre', { 
                               className: 'text-xs font-mono bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto' 
                           }, 
    `-- Get a system setting value in a query
    SELECT 
       *,
       get_system_setting('points_per_dollar')::INTEGER as points_multiplier,
       get_system_setting_or_default('company_name', 'Default Store') as store_name
    FROM transactions
    WHERE created_at >= CURRENT_DATE;

    -- Use system settings for calculations
    UPDATE customers 
    SET points = points + (
       100 * get_system_setting('points_per_dollar')::INTEGER
    )
    WHERE id = 1;`
                           )
                       ])
                   ]) : React.createElement('div', { className: 'text-center py-8 text-gray-500 dark:text-gray-400' }, [
                       React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4' }),
                       'Loading database information...'
                   ])
               ])
           ]),

           // Users Tab Content
           activeTab === 'users' && currentUser?.permissions?.users?.read && React.createElement('div', { key: 'users-content', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
               React.createElement('div', { key: 'section-header', className: 'flex items-center justify-between mb-6' }, [
                   React.createElement('div', { key: 'title' }, [
                       React.createElement('h3', { className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                           React.createElement(Users, { key: 'icon', size: 24 }),
                           'User Management'
                       ]),
                       React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
                           `${users.length} users • Manage system access and permissions`
                       )
                   ]),
                   currentUser?.permissions?.users?.write && React.createElement('button', {
                       key: 'add-user-btn',
                       onClick: () => setShowCreateUserForm(true),
                       className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                   }, [
                       React.createElement(Plus, { key: 'icon', size: 20 }),
                       'Add User'
                   ])
               ]),

                               // Users List
                React.createElement('div', { key: 'users-list', className: 'space-y-4' }, 
                    users.map(user => 
                        React.createElement('div', {
                            key: user.id,
                            className: 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
                        }, [
                            React.createElement('div', { key: 'user-header', className: 'flex items-center justify-between mb-2' }, [
                                React.createElement('div', { key: 'user-info' }, [
                                    React.createElement('h4', { className: 'font-semibold dark:text-white' }, 
                                        `${user.first_name} ${user.last_name}`
                                    ),
                                    React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300' }, 
                                        user.username
                                    )
                                ]),
                                React.createElement('div', { key: 'user-status', className: 'flex items-center gap-2' }, [
                                    React.createElement('span', { 
                                        className: `px-2 py-1 rounded-full text-xs font-medium ${
                                            user.is_active 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`
                                    }, user.is_active ? 'Active' : 'Inactive'),
                                    React.createElement('span', { 
                                        className: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }, user.role_name || 'No Role')
                                ])
                            ]),
                            React.createElement('div', { key: 'user-details', className: 'grid grid-cols-2 gap-4 text-sm mb-3' }, [
                                React.createElement('div', { key: 'email' }, [
                                    React.createElement('span', { className: 'text-gray-500 dark:text-gray-400' }, 'Email: '),
                                    React.createElement('span', { className: 'dark:text-white' }, user.email)
                                ]),
                                React.createElement('div', { key: 'last-login' }, [
                                    React.createElement('span', { className: 'text-gray-500 dark:text-gray-400' }, 'Last Login: '),
                                    React.createElement('span', { className: 'dark:text-white' }, 
                                        user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'
                                    )
                                ])
                            ]),
                            // Action buttons
                            currentUser?.permissions?.users?.write && React.createElement('div', { 
                                key: 'user-actions', 
                                className: 'flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600' 
                            }, [
                                React.createElement('button', {
                                    key: 'edit-btn',
                                    onClick: () => openEditUser(user),
                                    className: 'flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                                }, [
                                    React.createElement(Edit, { key: 'icon', size: 14 }),
                                    'Edit'
                                ]),
                                React.createElement('button', {
                                    key: 'password-btn',
                                    onClick: () => openChangePassword(user),
                                    className: 'flex items-center gap-1 px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors'
                                }, [
                                    React.createElement(Key, { key: 'icon', size: 14 }),
                                    'Password'
                                ]),
                                user.id !== currentUser?.id && React.createElement('button', {
                                    key: 'delete-btn',
                                    onClick: () => handleDeleteUser(user.id, user.username),
                                    className: 'flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
                                }, [
                                    React.createElement(Trash2, { key: 'icon', size: 14 }),
                                    'Delete'
                                ])
                            ])
                        ])
                    )
                ),

               // No users message
               users.length === 0 && React.createElement('div', { key: 'no-users', className: 'text-center py-12 text-gray-500 dark:text-gray-400' }, [
                   React.createElement(Users, { key: 'icon', className: 'mx-auto mb-4', size: 48 }),
                   React.createElement('p', { key: 'text', className: 'text-lg mb-2' }, 'No users found'),
                   React.createElement('p', { key: 'subtext', className: 'text-sm' }, 'Create your first user to get started')
               ])
           ]),

           // Create User Modal
           showCreateUserForm && React.createElement('div', {
               key: 'create-user-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-md'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { className: 'text-xl font-bold dark:text-white' }, 'Create New User'),
                       React.createElement('button', {
                           onClick: () => setShowCreateUserForm(false),
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, React.createElement(X, { size: 20 }))
                   ]),
                   React.createElement('form', { 
                       key: 'form',
                       onSubmit: handleCreateUser,
                       className: 'px-6 py-4 space-y-4'
                   }, [
                       React.createElement('div', { key: 'username' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Username'),
                           React.createElement('input', {
                               type: 'text',
                               value: createUserForm.username,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'email' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Email'),
                           React.createElement('input', {
                               type: 'email',
                               value: createUserForm.email,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'password' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Password'),
                           React.createElement('input', {
                               type: 'password',
                               value: createUserForm.password,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'first-name' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'First Name'),
                           React.createElement('input', {
                               type: 'text',
                               value: createUserForm.first_name,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, first_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'last-name' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Last Name'),
                           React.createElement('input', {
                               type: 'text',
                               value: createUserForm.last_name,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, last_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'role' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Role'),
                           React.createElement('select', {
                               value: createUserForm.role_id,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, role_id: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           }, [
                               React.createElement('option', { key: 'empty', value: '' }, 'Select a role...'),
                               ...roles.map(role => 
                                   React.createElement('option', { key: role.id, value: role.id }, role.name)
                               )
                           ])
                       ]),
                       React.createElement('div', { key: 'footer', className: 'flex gap-3 justify-end pt-4' }, [
                           React.createElement('button', {
                               type: 'button',
                               onClick: () => setShowCreateUserForm(false),
                               className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                           }, 'Cancel'),
                           React.createElement('button', {
                               type: 'submit',
                               className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
                           }, [
                               React.createElement(Plus, { key: 'icon', size: 16 }),
                               'Create User'
                           ])
                       ])
                   ])
               ])
           ]),

           // Edit User Modal
           showEditUserForm && React.createElement('div', {
               key: 'edit-user-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-md'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { className: 'text-xl font-bold dark:text-white' }, 'Edit User'),
                       React.createElement('button', {
                           onClick: () => setShowEditUserForm(false),
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, React.createElement(X, { size: 20 }))
                   ]),
                   React.createElement('form', { 
                       key: 'form',
                       onSubmit: handleEditUser,
                       className: 'px-6 py-4 space-y-4'
                   }, [
                       React.createElement('div', { key: 'username' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Username'),
                           React.createElement('input', {
                               type: 'text',
                               value: editUserForm.username,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, username: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'email' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Email'),
                           React.createElement('input', {
                               type: 'email',
                               value: editUserForm.email,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, email: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'first-name' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'First Name'),
                           React.createElement('input', {
                               type: 'text',
                               value: editUserForm.first_name,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, first_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'last-name' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Last Name'),
                           React.createElement('input', {
                               type: 'text',
                               value: editUserForm.last_name,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, last_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'role' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Role'),
                           React.createElement('select', {
                               value: editUserForm.role_id,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, role_id: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           }, [
                               React.createElement('option', { key: 'empty', value: '' }, 'Select a role...'),
                               ...roles.map(role => 
                                   React.createElement('option', { key: role.id, value: role.id }, role.name)
                               )
                           ])
                       ]),
                       React.createElement('div', { key: 'active-status' }, [
                           React.createElement('label', { className: 'flex items-center gap-2 dark:text-white' }, [
                               React.createElement('input', {
                                   type: 'checkbox',
                                   checked: editUserForm.is_active,
                                   onChange: (e) => setEditUserForm(prev => ({ ...prev, is_active: e.target.checked })),
                                   className: 'rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                               }),
                               React.createElement('span', { className: 'text-sm font-medium' }, 'Active Account')
                           ])
                       ]),
                       React.createElement('div', { key: 'footer', className: 'flex gap-3 justify-end pt-4' }, [
                           React.createElement('button', {
                               type: 'button',
                               onClick: () => setShowEditUserForm(false),
                               className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                           }, 'Cancel'),
                           React.createElement('button', {
                               type: 'submit',
                               className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
                           }, [
                               React.createElement(Save, { key: 'icon', size: 16 }),
                               'Update User'
                           ])
                       ])
                   ])
               ])
           ]),

           // Change Password Modal
           showPasswordModal && React.createElement('div', {
               key: 'password-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-md'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { className: 'text-xl font-bold dark:text-white' }, 
                           `Change Password for ${changingPasswordFor?.username}`
                       ),
                       React.createElement('button', {
                           onClick: () => setShowPasswordModal(false),
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, React.createElement(X, { size: 20 }))
                   ]),
                   React.createElement('form', { 
                       key: 'form',
                       onSubmit: handleChangePassword,
                       className: 'px-6 py-4 space-y-4'
                   }, [
                       React.createElement('div', { key: 'new-password' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'New Password'),
                           React.createElement('input', {
                               type: 'password',
                               value: passwordForm.new_password,
                               onChange: (e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value })),
                               required: true,
                               minLength: 6,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'confirm-password' }, [
                           React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Confirm Password'),
                           React.createElement('input', {
                               type: 'password',
                               value: passwordForm.confirm_password,
                               onChange: (e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value })),
                               required: true,
                               minLength: 6,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'footer', className: 'flex gap-3 justify-end pt-4' }, [
                           React.createElement('button', {
                               type: 'button',
                               onClick: () => setShowPasswordModal(false),
                               className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                           }, 'Cancel'),
                           React.createElement('button', {
                               type: 'submit',
                               className: 'px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2'
                           }, [
                               React.createElement(Key, { key: 'icon', size: 16 }),
                               'Change Password'
                           ])
                       ])
                   ])
               ])
           ]),

           // Modals
           React.createElement(LocationFormModal, {
               key: 'location-modal',
               show: showNewLocationModal,
               onClose: () => {
                   setShowNewLocationModal(false);
                   setLogoPreview(null);
                   formDataRef.current = {
                       store_code: '',
                       store_name: '',
                       brand: '',
                       address_line1: '',
                       address_line2: '',
                       city: '',
                       state: '',
                       zip_code: '',
                       phone: '',
                       email: '',
                       tax_rate: '0.08',
                       manager_name: '',
                       logo_base64: null
                   };
                   setNewLocationForm(formDataRef.current);
               },
               title: 'Create New Location'
           }),

           React.createElement(SystemSettingModal, {
               key: 'setting-modal',
               show: showSettingModal,
               onClose: () => {
                   setShowSettingModal(false);
                   setEditingSetting(null);
                   setSettingForm({
                       setting_key: '',
                       setting_value: '',
                       description: '',
                       category: 'general',
                       setting_type: 'text'
                   });
               }
           })
       ]);
    };