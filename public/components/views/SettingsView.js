/**
 * SettingsView Component
 * 
 * A comprehensive settings management component for the POS system that handles:
 * - System settings configuration and management
 * - MuleSoft Loyalty Sync integration
 * - Database connection management
 * - Location management
 * - User preferences
 * - Members sync from loyalty cloud
 * 
 * Features:
 * - Real-time configuration status indicators
 * - MuleSoft API integration for loyalty programs and journal types
 * - Database credentials parsing and formatting (YAML/Java properties)
 * - Salesforce configuration templates
 * - Members loading and syncing with detailed results
 * - Responsive design with dark mode support
 * 
 * @author Rodrigo Torres
 * @version 1.0.0
 * @since 2025-01-11
 */

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
        const { Settings, Plus, Upload, Moon, Sun, MapPin, Edit, Save, X, Image, Trash2, Database, Key, Copy, CheckCircle, Users, LogOut, RefreshCw } = window.Icons;
        
        // Simple icon component for products
        const ProductsIcon = ({ size = 18 }) => React.createElement('span', { style: { fontSize: size } }, '📦');
        
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
        
        // MuleSoft Loyalty Sync State
        const [mulesoftConfig, setMulesoftConfig] = React.useState({
            endpoint: '',
            loyaltyProgramId: '',
            journalTypeId: '',
            journalSubtypeId: '',
            enrollmentJournalSubtypeId: ''
        });
        const [loyaltyPrograms, setLoyaltyPrograms] = React.useState([]);
        const [journalTypes, setJournalTypes] = React.useState([]);
        const [loadingPrograms, setLoadingPrograms] = React.useState(false);
        const [loadingJournalTypes, setLoadingJournalTypes] = React.useState(false);
        
        // Members sync state
        const [showMembersModal, setShowMembersModal] = React.useState(false);
        const [members, setMembers] = React.useState([]);
        const [loadingMembers, setLoadingMembers] = React.useState(false);
        const [syncingMembers, setSyncingMembers] = React.useState(false);
        const [syncResults, setSyncResults] = React.useState(null);
        const [showSyncResults, setShowSyncResults] = React.useState(false);
        
        // Test data loading state
    const [loadingTestData, setLoadingTestData] = React.useState(false);
    const [testDataOutput, setTestDataOutput] = React.useState('');
    const [showTestDataOutput, setShowTestDataOutput] = React.useState(false);
    const [showLoadFromCloudModal, setShowLoadFromCloudModal] = React.useState(false);
        const [showDataLoaderModal, setShowDataLoaderModal] = React.useState(false);
        const [showLoyaltyResultsModal, setShowLoyaltyResultsModal] = React.useState(false);
        const [loyaltyResults, setLoyaltyResults] = React.useState(null);
        const [syncingLoyalty, setSyncingLoyalty] = React.useState(false);
        
        // Products management state
        const [showDeleteProductsModal, setShowDeleteProductsModal] = React.useState(false);
        const [showGenerateProductsModal, setShowGenerateProductsModal] = React.useState(false);
        const [showGeneratedHistoryModal, setShowGeneratedHistoryModal] = React.useState(false);
        const [productsFromCloud, setProductsFromCloud] = React.useState([]);
        const [selectedProducts, setSelectedProducts] = React.useState([]);
        const [loadingProducts, setLoadingProducts] = React.useState(false);
        const [creatingProducts, setCreatingProducts] = React.useState(false);
        const [expandedProducts, setExpandedProducts] = React.useState(new Set());
        const [existingProducts, setExistingProducts] = React.useState([]);
        const [generatedHistory, setGeneratedHistory] = React.useState([]);
        const [loadingHistory, setLoadingHistory] = React.useState(false);
        const [historySearchTerm, setHistorySearchTerm] = React.useState('');
        const [selectedBatch, setSelectedBatch] = React.useState(null);
        
        // Generate products form state
        const [generateForm, setGenerateForm] = React.useState({
            numberOfProducts: 5,
            brand: '',
            segment: '',
            brandUrl: ''
        });
        
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
                loadMulesoftConfig();
            } else if (activeTab === 'products') {
                loadMulesoftConfig();
                loadGeneratedHistory();
                loadExistingProducts();
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
                const { setting_key, setting_value, description, category, setting_type, is_encrypted } = settingForm;
                
                const settingOptions = {
                    description: description,
                    category: category,
                    setting_type: setting_type,
                    encrypt: is_encrypted || false
                };
                
                if (editingSetting) {
                    await window.API.systemSettings.update(setting_key, setting_value, settingOptions);
                } else {
                    await window.API.systemSettings.set(setting_key, setting_value, settingOptions);
                }
                
                await loadSystemSettings();
                setShowSettingModal(false);
                setEditingSetting(null);
                setSettingForm({
                    setting_key: '',
                    setting_value: '',
                    description: '',
                    category: 'general',
                    setting_type: 'text',
                    is_encrypted: false
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

        // MuleSoft Loyalty Sync Functions
        const loadMulesoftConfig = async () => {
            try {
                const settings = await window.API.systemSettings.getAll();
                const config = {
                    endpoint: settings.find(s => s.setting_key === 'mulesoft_loyalty_sync_endpoint')?.setting_value || '',
                    loyaltyProgramId: settings.find(s => s.setting_key === 'loyalty_program_id')?.setting_value || '',
                    journalTypeId: settings.find(s => s.setting_key === 'journal_type_id')?.setting_value || '',
                    journalSubtypeId: settings.find(s => s.setting_key === 'journal_subtype_id')?.setting_value || '',
                    enrollmentJournalSubtypeId: settings.find(s => s.setting_key === 'enrollment_journal_subtype_id')?.setting_value || ''
                };
                setMulesoftConfig(config);
                
                // Load programs and journal types if endpoint is configured
                if (config.endpoint) {
                    await loadLoyaltyPrograms(config.endpoint);
                    await loadJournalTypes(config.endpoint);
                }
            } catch (error) {
                console.error('Failed to load MuleSoft config:', error);
            }
        };

        const loadLoyaltyPrograms = async (endpoint) => {
            if (!endpoint) return;
            
            setLoadingPrograms(true);
            try {
                const response = await fetch(`${endpoint}/programs`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const programs = await response.json();
                setLoyaltyPrograms(programs);
            } catch (error) {
                console.error('Failed to load loyalty programs:', error);
                setLoyaltyPrograms([]);
            } finally {
                setLoadingPrograms(false);
            }
        };

        const loadJournalTypes = async (endpoint) => {
            if (!endpoint) return;
            
            setLoadingJournalTypes(true);
            try {
                const response = await fetch(`${endpoint}/journaltypes`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const types = await response.json();
                setJournalTypes(types);
            } catch (error) {
                console.error('Failed to load journal types:', error);
                setJournalTypes([]);
            } finally {
                setLoadingJournalTypes(false);
            }
        };

        const saveMulesoftSetting = async (key, value, encrypt = false) => {
            try {
                // Skip saving if value is empty or null
                if (!value || value.trim() === '') {
                    console.log(`Skipping save for ${key} - empty value`);
                    return true;
                }
                
                const existingSetting = systemSettings.find(s => s.setting_key === key);
                
                const settingOptions = {
                    description: getSettingDescription(key),
                    category: 'integration',
                    setting_type: 'text',
                    encrypt: encrypt
                };
                
                if (existingSetting) {
                    await window.API.systemSettings.update(key, value, settingOptions);
                } else {
                    await window.API.systemSettings.set(key, value, settingOptions);
                }
                
                await loadSystemSettings();
                return true;
            } catch (error) {
                console.error(`Failed to save ${key}:`, error);
                alert(`Failed to save ${key}: ${error.message}`);
                return false;
            }
        };

        const getSettingDescription = (key) => {
            const descriptions = {
                'mulesoft_loyalty_sync_endpoint': 'MuleSoft Loyalty Sync API endpoint URL',
                'loyalty_program_id': 'Selected loyalty program ID for MuleSoft integration',
                'journal_type_id': 'Selected journal type ID for MuleSoft integration',
                'journal_subtype_id': 'Selected journal subtype ID for MuleSoft integration'
            };
            return descriptions[key] || '';
        };

        const handleEndpointChange = async (value) => {
            setMulesoftConfig(prev => ({ ...prev, endpoint: value }));
            await saveMulesoftSetting('mulesoft_loyalty_sync_endpoint', value);
            
            if (value) {
                await loadLoyaltyPrograms(value);
                await loadJournalTypes(value);
            } else {
                setLoyaltyPrograms([]);
                setJournalTypes([]);
            }
        };

        const handleLoyaltyProgramChange = async (value) => {
            setMulesoftConfig(prev => ({ ...prev, loyaltyProgramId: value }));
            await saveMulesoftSetting('loyalty_program_id', value);
        };

        const handleJournalTypeChange = async (value) => {
            setMulesoftConfig(prev => ({ 
                ...prev, 
                journalTypeId: value,
                journalSubtypeId: '' // Reset subtype when type changes
            }));
            await saveMulesoftSetting('journal_type_id', value);
            // Don't save empty subtype - it will be skipped by saveMulesoftSetting
        };

        const handleJournalSubtypeChange = async (value) => {
            setMulesoftConfig(prev => ({ ...prev, journalSubtypeId: value }));
            await saveMulesoftSetting('journal_subtype_id', value);
        };

        const handleEnrollmentJournalSubtypeChange = async (value) => {
            setMulesoftConfig(prev => ({ ...prev, enrollmentJournalSubtypeId: value }));
            await saveMulesoftSetting('enrollment_journal_subtype_id', value);
        };

        const refreshLoyaltyPrograms = async () => {
            if (mulesoftConfig.endpoint) {
                await loadLoyaltyPrograms(mulesoftConfig.endpoint);
            }
        };

        const refreshJournalTypes = async () => {
            if (mulesoftConfig.endpoint) {
                await loadJournalTypes(mulesoftConfig.endpoint);
            }
        };

        // Members sync functions
        const loadMembers = async () => {
            if (!mulesoftConfig.endpoint) {
                alert('Please configure the MuleSoft endpoint first');
                return;
            }

            setLoadingMembers(true);
            try {
                const response = await fetch(`${mulesoftConfig.endpoint}/members`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const membersData = await response.json();
                setMembers(membersData);
                setShowMembersModal(true);
            } catch (error) {
                console.error('Failed to load members:', error);
                alert(`Failed to load members: ${error.message}`);
            } finally {
                setLoadingMembers(false);
            }
        };

        const syncMembers = async () => {
            if (!mulesoftConfig.loyaltyProgramId) {
                alert('Please select a loyalty program first');
                return;
            }

            if (!confirm('This will replace current customer data. Are you sure you want to continue?')) {
                return;
            }

            setSyncingMembers(true);
            try {
                const response = await fetch(`${mulesoftConfig.endpoint}/bulk/sync/members?program=${mulesoftConfig.loyaltyProgramId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const results = await response.json();
                setSyncResults(results);
                setShowSyncResults(true);
                setShowMembersModal(false);
            } catch (error) {
                console.error('Failed to sync members:', error);
                alert(`Failed to sync members: ${error.message}`);
            } finally {
                setSyncingMembers(false);
            }
        };

        const closeMembersModal = () => {
            setShowMembersModal(false);
            setMembers([]);
        };

        const closeSyncResults = () => {
            setShowSyncResults(false);
            setSyncResults(null);
        };

        // Test data loading function
        const loadTestData = async () => {
            if (!confirm('This will load sample data into your database. This may add duplicate records. Continue?')) {
                return;
            }

            setLoadingTestData(true);
            setTestDataOutput('');
            setShowTestDataOutput(true);
            
            try {
                const response = await window.API.call('/load-test-data', {
                    method: 'POST'
                });
                
                if (response.success) {
                    const output = response.output;
                    let fullOutput = '';
                    
                    if (output.stdout) {
                        fullOutput += 'STDOUT:\n' + output.stdout + '\n\n';
                    }
                    
                    if (output.stderr) {
                        fullOutput += 'STDERR:\n' + output.stderr + '\n\n';
                    }
                    
                    setTestDataOutput(fullOutput || 'Test data loaded successfully with no output.');
                } else {
                    setTestDataOutput('Error: ' + (response.error || 'Unknown error occurred'));
                }
            } catch (error) {
                console.error('Failed to load test data:', error);
                setTestDataOutput('Failed to load test data: ' + error.message);
            } finally {
                setLoadingTestData(false);
            }
        };

        const closeTestDataOutput = () => {
            setShowTestDataOutput(false);
            setTestDataOutput('');
        };

        const closeLoadFromCloudModal = () => {
            setShowLoadFromCloudModal(false);
        };

        const handleProductsLoaded = () => {
            // Refresh the existing products list when products are loaded from cloud
            loadExistingProducts();
        };

        // Products Management Functions
        const loadProductsFromCloud = async () => {
            if (!mulesoftConfig.endpoint) {
                alert('Please configure the MuleSoft endpoint first');
                return;
            }

            setLoadingProducts(true);
            try {
                const response = await fetch(`${mulesoftConfig.endpoint}/products/loyalty`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const productsData = await response.json();
                console.log('=== Products from MuleSoft API ===');
                console.log('Products data:', productsData);
                console.log('First product:', productsData[0]);
                console.log('===================================');
                setProductsFromCloud(productsData);
                setSelectedProducts([]);
                setExpandedProducts(new Set());
            } catch (error) {
                console.error('Failed to load products:', error);
                alert(`Failed to load products: ${error.message}`);
            } finally {
                setLoadingProducts(false);
            }
        };

        const generateProducts = async () => {
            if (!mulesoftConfig.endpoint) {
                alert('Please configure the MuleSoft endpoint first');
                return;
            }

            if (!generateForm.brand.trim()) {
                alert('Please enter a brand name');
                return;
            }

            if (generateForm.numberOfProducts < 1 || generateForm.numberOfProducts > 10) {
                alert('Number of products must be between 1 and 10');
                return;
            }

            setLoadingProducts(true);
            try {
                const params = new URLSearchParams({
                    n: generateForm.numberOfProducts.toString(),
                    segment: generateForm.segment,
                    brand: generateForm.brand
                });

                if (generateForm.brandUrl.trim()) {
                    params.append('brand_url', generateForm.brandUrl);
                }

                const response = await fetch(`${mulesoftConfig.endpoint}/products/generate?${params}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const productsData = await response.json();
                
                // Save generated products to database
                const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await window.API.call('/generated-products/save', {
                    method: 'POST',
                    body: JSON.stringify({
                        batchId: batchId,
                        products: productsData,
                        metadata: {
                            brand: generateForm.brand,
                            segment: generateForm.segment,
                            brandUrl: generateForm.brandUrl,
                            numberOfProducts: generateForm.numberOfProducts,
                            generatedAt: new Date().toISOString()
                        }
                    })
                });
                
                // Clear the modal and refresh the generated history
                setShowGenerateProductsModal(false);
                setProductsFromCloud([]);
                setSelectedProducts([]);
                setExpandedProducts(new Set());
                
                // Refresh the generated history to show the new batch
                await loadGeneratedHistory();
            } catch (error) {
                console.error('Failed to generate products:', error);
                alert(`Failed to generate products: ${error.message}`);
            } finally {
                setLoadingProducts(false);
            }
        };

        const createSelectedProducts = async () => {
            if (selectedProducts.length === 0) {
                alert('Please select at least one product to create');
                return;
            }

            setCreatingProducts(true);
            try {
                const response = await window.API.call('/products/import', {
                    method: 'POST',
                    body: JSON.stringify(selectedProducts)
                });

                alert(`Successfully imported ${selectedProducts.length} products to MuleSoft!`);
                setSelectedProducts([]);
                setProductsFromCloud([]);
            } catch (error) {
                console.error('Failed to import products:', error);
                alert(`Failed to import products: ${error.message}`);
            } finally {
                setCreatingProducts(false);
            }
        };

        const deleteAllProducts = async () => {
            try {
                const response = await window.API.call('/products', {
                    method: 'DELETE'
                });
                alert('All products have been deleted successfully!');
                setShowDeleteProductsModal(false);
            } catch (error) {
                console.error('Failed to delete products:', error);
                alert(`Failed to delete products: ${error.message}`);
            }
        };

        const toggleProductSelection = (product) => {
            console.log('=== Product Selection Debug ===');
            console.log('Product being toggled:', product);
            console.log('Product SKU:', product.sku);
            console.log('Product name:', product.product_name);
            console.log('Current selected products:', selectedProducts);
            
            setSelectedProducts(prev => {
                // Create a more robust unique identifier that works even without SKU
                const getProductId = (p) => {
                    // Try SKU first, then fall back to a combination of name and other unique fields
                    if (p.sku && p.sku.trim()) {
                        return p.sku;
                    }
                    // Fallback to a combination of name and other fields for uniqueness
                    return `${p.product_name || 'unnamed'}_${p.collection || 'no-collection'}_${p.pricing?.price || 'no-price'}`;
                };
                
                const productId = getProductId(product);
                const isSelected = prev.some(p => getProductId(p) === productId);
                
                console.log('Product ID:', productId);
                console.log('Is product selected?', isSelected);
                
                if (isSelected) {
                    const newSelection = prev.filter(p => getProductId(p) !== productId);
                    console.log('Removing product, new selection:', newSelection);
                    return newSelection;
                } else {
                    const newSelection = [...prev, product];
                    console.log('Adding product, new selection:', newSelection);
                    return newSelection;
                }
            });
            console.log('================================');
        };

        const toggleProductExpansion = (sku) => {
            setExpandedProducts(prev => {
                const newSet = new Set(prev);
                if (newSet.has(sku)) {
                    newSet.delete(sku);
                } else {
                    newSet.add(sku);
                }
                return newSet;
            });
        };

        // Generated History Functions
        const loadGeneratedHistory = async () => {
            setLoadingHistory(true);
            try {
                const response = await window.API.call('/generated-products/history');
                setGeneratedHistory(response);
            } catch (error) {
                console.error('Failed to load generated history:', error);
                alert(`Failed to load generated history: ${error.message}`);
            } finally {
                setLoadingHistory(false);
            }
        };

        const deleteBatch = async (batchId) => {
            if (!confirm(`Are you sure you want to delete Batch ${batchId}? This action cannot be undone.`)) {
                return;
            }

            try {
                await window.API.call('/generated-products/delete-batch', {
                    method: 'DELETE',
                    body: JSON.stringify({ batchId: batchId })
                });
                
                alert(`Batch ${batchId} deleted successfully`);
                await loadGeneratedHistory(); // Refresh the history
            } catch (error) {
                console.error('Failed to delete batch:', error);
                alert(`Failed to delete batch: ${error.message}`);
            }
        };

        const openGeneratedHistory = () => {
            setShowGeneratedHistoryModal(true);
            loadGeneratedHistory();
        };

        const closeGeneratedHistory = () => {
            setShowGeneratedHistoryModal(false);
            setGeneratedHistory([]);
            setSelectedBatch(null);
            setHistorySearchTerm('');
        };

        const selectBatch = (batchId) => {
            setSelectedBatch(batchId);
        };

        const filteredHistory = React.useMemo(() => {
            if (!historySearchTerm.trim()) return generatedHistory;
            
            return generatedHistory.map(batch => ({
                ...batch,
                products: batch.products.filter(product => 
                    product.product_name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                    product.sku.toLowerCase().includes(historySearchTerm.toLowerCase())
                )
            })).filter(batch => batch.products.length > 0);
        }, [generatedHistory, historySearchTerm]);

        // Check if products already exist in the database
        const checkExistingProducts = async (products) => {
            try {
                const productNames = products.map(p => p.product_name);
                const response = await window.API.call('/products/check-existing', {
                    method: 'POST',
                    body: JSON.stringify({ skus: productNames }) // Using skus parameter name for compatibility
                });
                return response.existingSkus || [];
            } catch (error) {
                console.error('Failed to check existing products:', error);
                return [];
            }
        };

        const loadExistingProducts = async () => {
            try {
                const response = await window.API.call('/products');
                if (response && response.products) {
                    const productNames = response.products.map(p => p.name);
                    setExistingProducts(productNames);
                }
            } catch (error) {
                console.error('Failed to load existing products:', error);
                setExistingProducts([]);
            }
        };

        const sendToLoyalty = async () => {
            try {
                setSyncingLoyalty(true);
                
                const response = await fetch('/api/loyalty/products/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                setLoyaltyResults(result);
                setShowLoyaltyResultsModal(true);
                
            } catch (error) {
                console.error('Error sending products to Loyalty:', error);
                setLoyaltyResults({
                    summary: 'Failed to send products to Loyalty Cloud',
                    statistics: { totalProcessed: 0, created: 0, updated: 0, failed: 1 },
                    failures: [{ product_name: 'System Error', error: error.message }]
                });
                setShowLoyaltyResultsModal(true);
            } finally {
                setSyncingLoyalty(false);
            }
        };

        const parseDatabaseCredentialsYAML = (databaseUrl) => {
            try {
                const url = new URL(databaseUrl);
                const host = url.hostname;
                const port = url.port || '5432';
                const user = url.username;
                const password = url.password;
                const database = url.pathname.substring(1); // Remove leading slash
                
                return `#Environment
env: "prod"
#DB Configuration
db:
  host: "${host}"
  port: "${port}"
  user: "${user}"
  password: "${password}"
  database: "${database}"

#Mule AI Chain Configuration
mac:
  heroku.inference_key: ""
  openai_key: ""

#Salesforce configurations
sfdc:
  url: "http://login.salesforce.com/services/Soap/u/64.0"
  token: 
  password: 
  account: `;
            } catch (error) {
                return `#Environment
env: "prod"
#DB Configuration
db:
  host: ""
  port: ""
  user: ""
  password: ""
  database: ""

#Mule AI Chain Configuration
mac:
  heroku.inference_key: ""
  openai_key: ""

#Salesforce configurations
sfdc:
  url: "http://login.salesforce.com/services/Soap/u/64.0"
  token: 
  password: 
  account: `;
            }
        };

        const parseDatabaseCredentialsJava = (databaseUrl) => {
            try {
                const url = new URL(databaseUrl);
                const host = url.hostname;
                const port = url.port || '5432';
                const user = url.username;
                const password = url.password;
                const database = url.pathname.substring(1); // Remove leading slash
                
                return `#Environment
env=prod
#DB Configuration
db.host=${host}
db.port=${port}
db.user=${user}
db.password=${password}
db.database=${database}

#Mule AI Chain Configuration
mac.heroku.inference_key=
mac.openai_key=

#Salesforce configurations
sfdc.url=http://login.salesforce.com/services/Soap/u/64.0
sfdc.token=
sfdc.password=
sfdc.account=`;
            } catch (error) {
                return `#Environment
env=prod
#DB Configuration
db.host=
db.port=
db.user=
db.password=
db.database=

#Mule AI Chain Configuration
mac.heroku.inference_key=
mac.openai_key=

#Salesforce configurations
sfdc.url=http://login.salesforce.com/services/Soap/u/64.0
sfdc.token=
sfdc.password=
sfdc.account=`;
            }
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

            // Check image dimensions using document.createElement
            const img = document.createElement('img');
            img.onload = () => {
                if (img.width > 2048 || img.height > 2048) {
                    alert(`Image dimensions should not exceed 2048x2048 pixels. Current size: ${img.width}x${img.height}`);
                    return;
                }
                
                // Proceed with upload if dimensions are valid
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    
                    // Update both the ref and the state
                    formDataRef.current.logo_base64 = base64;
                    setNewLocationForm(prev => ({
                        ...prev,
                        logo_base64: base64
                    }));
                };
                reader.readAsDataURL(file);
            };
            img.onerror = () => {
                alert('Invalid image file');
                return;
            };
            img.src = URL.createObjectURL(file);
        };

        // Handle logo removal
        const handleLogoRemove = (isForLocation = false) => {
            // Update both the ref and the state
            formDataRef.current.logo_base64 = null;
            setNewLocationForm(prev => ({
                ...prev,
                logo_base64: null
            }));
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
                key: 'category-badge',
                className: `px-2 py-1 rounded-full text-xs font-medium ${colors[category] || colors.general}`
            }, category);
        };

        const LocationCard = ({ location, isSelected }) => (
            React.createElement('div', {   key: 'location-card',
                className: `border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`
            }, [
                React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-3' }, [
                    React.createElement('div', { key: 'info', className: 'flex-1' }, [
                        React.createElement('div', { key: 'info-container', className: 'flex items-center gap-2 mb-2' }, [
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
                        React.createElement('p', {key: 'brand-store-code', className: 'text-sm text-gray-600 dark:text-gray-300' }, 
                            `${location.brand} • ${location.store_code}`
                        ),
                        React.createElement('p', {key: 'address', className: 'text-sm text-gray-600 dark:text-gray-300' }, 
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
                    }, React.createElement(Edit, {key: 'edit-icon', size: 16 }))
                ]),
                React.createElement('div', { key: 'details', className: 'grid grid-cols-2 gap-4 text-sm' }, [
                    React.createElement('div', { key: 'tax' }, [
                        React.createElement('span', { key: 'tax-label', className: 'text-gray-500 dark:text-gray-400' }, 'Tax Rate: '),
                        React.createElement('span', { key: 'tax-value', className: 'font-medium dark:text-white' }, 
                            `${(location.tax_rate * 100).toFixed(2)}%`
                        )
                    ]),
                    React.createElement('div', { key: 'manager' }, [
                        React.createElement('span', { key: 'manager-label', className: 'text-gray-500 dark:text-gray-400' }, 'Manager: '),
                        React.createElement('span', { key: 'manager-value', className: 'font-medium dark:text-white' }, 
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

            return React.createElement('div', {key: 'location-form-modal',
                className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
            }, [
                React.createElement('div', { 
                    key: 'modal',
                    className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'
                }, [
                    React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                        React.createElement('h2', {key: 'title', className: 'text-xl font-bold dark:text-white' }, title),
                        React.createElement('button', {
                            key: 'close-btn',
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
                        }, React.createElement(X, {key: 'close-icon', size: 24 }))
                    ]),
                    
                    React.createElement('div', { key: 'form', className: 'p-6 space-y-6' }, [
                        // Logo upload section
                        React.createElement('div', { key: 'logo-section' }, [
                            React.createElement('label', { key: 'logo-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Store Logo'),
                            React.createElement('div', { key: 'logo-container', className: 'flex items-center gap-4' }, [
                                React.createElement('div', { 
                                    key: 'logo-preview',
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
                                    key: 'logo-upload-input',
                                    type: 'file',
                                    accept: 'image/*',
                                    onChange: (e) => handleLogoUpload(e, true),
                                    className: 'hidden',
                                    id: 'logo-upload'
                                }),
                                React.createElement('div', {
                                    key: 'logo-buttons',
                                    className: 'flex items-center gap-2'
                                }, [
                                    React.createElement('label', {
                                        key: 'logo-upload-label',
                                        htmlFor: 'logo-upload',
                                        className: 'flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors'
                                    }, [
                                        React.createElement(Upload, { key: 'icon', size: 16 }),
                                        'Upload Logo'
                                    ]),
                                    (logoPreview || newLocationForm.logo_base64) && React.createElement('button', {
                                        key: 'remove-logo-button',
                                        type: 'button',
                                        onClick: () => handleLogoRemove(true),
                                        className: 'flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 cursor-pointer transition-colors'
                                    }, [
                                        React.createElement('span', { key: 'remove-icon' }, '×'),
                                        'Remove'
                                    ])
                                ])
                            ])
                        ]),

                        // Basic information - FIX: Using value from state and onChange updates ref
                        React.createElement('div', { key: 'basic-info', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                            React.createElement('div', { key: 'store-code' }, [
                                React.createElement('label', { key: 'store-code-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Store Code *'),
                                React.createElement('input', {
                                    key: 'store-code-input',
                                    type: 'text',
                                    value: newLocationForm.store_code,
                                    onChange: (e) => handleInputChange('store_code', e.target.value.toUpperCase()),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'NYC001',
                                    maxLength: 10
                                })
                            ]),
                            React.createElement('div', { key: 'store-name' }, [
                                React.createElement('label', { key: 'store-name-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Store Name *'),
                                React.createElement('input', {
                                    key: 'store-name-input',
                                    type: 'text',
                                    value: newLocationForm.store_name,
                                    onChange: (e) => handleInputChange('store_name', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Manhattan Flagship'
                                })
                            ]),
                            React.createElement('div', { key: 'brand' }, [
                                React.createElement('label', { key: 'brand-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Brand *'),
                                React.createElement('input', {
                                    key: 'brand-input',
                                    type: 'text',
                                    value: newLocationForm.brand,
                                    onChange: (e) => handleInputChange('brand', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'TUMI'
                                })
                            ]),
                            React.createElement('div', { key: 'manager' }, [
                                React.createElement('label', { key: 'manager-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Manager Name'),
                                React.createElement('input', {
                                    key: 'manager-input',
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
                            React.createElement('h3', { key: 'address-title', className: 'text-lg font-semibold mb-4 dark:text-white' }, 'Address Information'),
                            React.createElement('div', { key: 'address-container', className: 'space-y-4' }, [
                                React.createElement('input', {
                                    key: 'address-line1-input',
                                    type: 'text',
                                    value: newLocationForm.address_line1,
                                    onChange: (e) => handleInputChange('address_line1', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Street Address *'
                                }),
                                React.createElement('input', {
                                    key: 'address-line2-input',
                                    type: 'text',
                                    value: newLocationForm.address_line2,
                                    onChange: (e) => handleInputChange('address_line2', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'Apartment, suite, etc. (optional)'
                                }),
                                React.createElement('div', { key: 'address-city-state-zip-container', className: 'grid grid-cols-2 md:grid-cols-3 gap-4' }, [
                                    React.createElement('input', {
                                        key: 'city-input',
                                        type: 'text',
                                        value: newLocationForm.city,
                                        onChange: (e) => handleInputChange('city', e.target.value),
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                        placeholder: 'City *'
                                    }),
                                    React.createElement('input', {
                                        key: 'state-input',
                                        type: 'text',
                                        value: newLocationForm.state,
                                        onChange: (e) => handleInputChange('state', e.target.value),
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                        placeholder: 'State *',
                                        maxLength: 2
                                    }),
                                    React.createElement('input', {
                                        key: 'zip-code-input',
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
                                React.createElement('label', { key: 'phone-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Phone'),
                                React.createElement('input', {
                                    key: 'phone-input',
                                    type: 'tel',
                                    value: newLocationForm.phone,
                                    onChange: (e) => handleInputChange('phone', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: '(555) 123-4567'
                                })
                            ]),
                            React.createElement('div', { key: 'email' }, [
                                React.createElement('label', { key: 'email-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Email'),
                                React.createElement('input', {
                                    key: 'email-input',
                                    type: 'email',
                                    value: newLocationForm.email,
                                    onChange: (e) => handleInputChange('email', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: 'store@company.com'
                                })
                            ]),
                            React.createElement('div', { key: 'tax-rate', className: 'md:col-span-2' }, [
                                React.createElement('label', { key: 'tax-rate-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Tax Rate (decimal) *'),
                                React.createElement('input', {
                                    key: 'tax-rate-input',
                                    type: 'number',
                                    step: '0.0001',
                                    min: '0',
                                    max: '1',
                                    value: newLocationForm.tax_rate,
                                    onChange: (e) => handleInputChange('tax_rate', e.target.value),
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                    placeholder: '0.08'
                                }),
                                React.createElement('p', { key: 'tax-rate-subtext', className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, 
                                    'Enter as decimal: 0.08 for 8%, 0.10 for 10%'
                                )
                            ])
                        ])
                    ]),

                    React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                        React.createElement('button', {
                            key: 'cancel-btn',
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
                            key: 'save-btn',
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


        return React.createElement('div', { key: 'settings-container', className: 'space-y-6 dark:text-white' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                React.createElement('div', { key: 'header-container', className: 'flex items-center justify-between mb-6' }, [
                    React.createElement('div', { key: 'title' }, [
                        React.createElement('h2', {key: 'title-header', className: 'text-2xl font-bold flex items-center gap-3 dark:text-white' }, [
                            React.createElement(Settings, { key: 'icon', size: 28 }),
                            'Settings'
                        ]),
                        React.createElement('p', {key: 'title-subtext', className: 'text-gray-600 dark:text-gray-300 mt-1' }, 
                            'Manage locations, system settings, and preferences'
                        )
                    ]),
                    React.createElement('div', { key: 'theme-toggle', className: 'flex items-center gap-4' }, [
                        React.createElement('span', {key: 'theme-label', className: 'text-sm font-medium dark:text-gray-300' }, 'Theme:'),
                        React.createElement('button', {
                            key: 'theme-toggle-btn',
                            onClick: handleThemeToggle,
                            className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`
                        }, [
                            React.createElement(isDarkMode ? Sun : Moon, { key: 'theme-icon', size: 20 }),
                            React.createElement('span', { key: 'theme-label', className: 'font-medium' }, 
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
                    currentUser?.role === 'admin' && React.createElement(TabButton, { 
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
                    }),
                    currentUser?.role === 'admin' && React.createElement(TabButton, { 
                        key: 'products-tab',
                        tab: 'products', 
                        label: 'Data Management', 
                        icon: ProductsIcon,
                        active: activeTab === 'products' 
                    })
                ]),
                
                // Logout Button
                React.createElement('div', { key: 'logout-section', className: 'flex justify-end mt-4' }, [
                    React.createElement('button', {
                        key: 'logout-btn',
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
                        React.createElement('h3', {key: 'title-header', className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                            React.createElement(MapPin, { key: 'icon', size: 24 }),
                            'Store Locations'
                        ]),
                        React.createElement('p', {key: 'title-subtext', className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
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
                    React.createElement('div', {key: 'current-location-container', className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'current-info', className: 'flex items-center gap-3' }, [
                            selectedLocation.logo_base64 && React.createElement('img', {
                                key: 'logo',
                                src: selectedLocation.logo_base64,
                                alt: 'Current location logo',
                                className: 'w-12 h-12 object-contain rounded'
                            }),
                            React.createElement('div', { key: 'details' }, [
                                React.createElement('h4', {key: 'current-location-name', className: 'font-bold text-blue-900 dark:text-blue-100' }, 
                                    `Currently Operating: ${selectedLocation.store_name}`
                                ),
                                React.createElement('p', {key: 'current-location-address', className: 'text-sm text-blue-700 dark:text-blue-200' }, 
                                    `${selectedLocation.address_line1}, ${selectedLocation.city} • Tax: ${(selectedLocation.tax_rate * 100).toFixed(2)}%`
                                )
                            ])
                        ]),
                        React.createElement('div', { key: 'logo-upload', className: 'flex items-center gap-2' }, [
                            React.createElement('input', {
                                key: 'current-logo-upload',
                                type: 'file',
                                accept: 'image/*',
                                onChange: (e) => handleLogoUpload(e, false),
                                className: 'hidden',
                                id: 'current-logo-upload'
                            }),
                            React.createElement('label', {
                                key: 'current-logo-upload-label',
                                htmlFor: 'current-logo-upload',
                                className: 'flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer transition-colors'
                            }, [
                                React.createElement(Upload, { key: 'icon', size: 16 }),
                                'Update Logo'
                            ]),
                            selectedLocation.logo_base64 && React.createElement('button', {
                                key: 'remove-current-logo-button',
                                type: 'button',
                                onClick: () => handleLogoRemove(false),
                                className: 'flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 cursor-pointer transition-colors'
                            }, [
                                React.createElement('span', { key: 'remove-icon' }, '×'),
                                'Remove'
                            ])
                        ])
                    ])
                ]),

                // Location selection dropdown
                React.createElement('div', { key: 'location-selector', className: 'mb-6' }, [
                    React.createElement('label', { key: 'location-selector-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Select Active Location'),
                    React.createElement('select', {
                        key: 'location-selector-select',
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
            activeTab === 'system' && currentUser?.role === 'admin' && React.createElement('div', { key: 'system-content', className: 'space-y-6' }, [
                // MuleSoft Loyalty Sync Configuration
                React.createElement('div', { key: 'mulesoft-config', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                    React.createElement('div', { key: 'section-header', className: 'flex items-center gap-2 mb-6' }, [
                        React.createElement('div', { key: 'icon', className: 'w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center' }, [
                            React.createElement('svg', { key: 'svg', className: 'w-5 h-5 text-blue-600 dark:text-blue-400', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
                                React.createElement('path', { key: 'path', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' })
                            ])
                        ]),
                        React.createElement('div', { key: 'title-section' }, [
                            React.createElement('h3', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 'MuleSoft Loyalty Sync'),
                            React.createElement('p', { key: 'subtitle', className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
                                'Configure MuleSoft loyalty program integration settings'
                            )
                        ])
                    ]),

                    React.createElement('div', { key: 'config-form', className: 'space-y-6' }, [
                        // Endpoint URL
                        React.createElement('div', { key: 'endpoint-section' }, [
                            React.createElement('label', { key: 'endpoint-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 
                                'MuleSoft Loyalty Sync Endpoint URL'
                            ),
                            React.createElement('input', {
                                key: 'endpoint-input',
                                type: 'url',
                                value: mulesoftConfig.endpoint,
                                onChange: (e) => handleEndpointChange(e.target.value),
                                className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                                placeholder: 'https://your-mulesoft-instance.cloudhub.io/api/loyalty'
                            }),
                            React.createElement('p', { key: 'endpoint-help', className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, 
                                'Enter the base URL for your MuleSoft loyalty sync API'
                            )
                        ]),

                        // Loyalty Programs Dropdown
                        React.createElement('div', { key: 'programs-section' }, [
                            React.createElement('div', { key: 'programs-header', className: 'flex items-center justify-between mb-2' }, [
                                React.createElement('label', { key: 'programs-label', className: 'block text-sm font-medium dark:text-white' }, 
                                    'Loyalty Program'
                                ),
                                React.createElement('button', {
                                    key: 'programs-refresh-btn',
                                    onClick: refreshLoyaltyPrograms,
                                    disabled: !mulesoftConfig.endpoint || loadingPrograms,
                                    className: 'p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                                    title: 'Refresh loyalty programs'
                                }, React.createElement(RefreshCw, { 
                                    key: 'refresh-icon',
                                    size: 16,
                                    className: loadingPrograms ? 'animate-spin' : ''
                                }))
                            ]),
                            React.createElement('div', { key: 'programs-container', className: 'relative' }, [
                                React.createElement('select', {
                                    key: 'programs-select',
                                    value: mulesoftConfig.loyaltyProgramId,
                                    onChange: (e) => handleLoyaltyProgramChange(e.target.value),
                                    disabled: !mulesoftConfig.endpoint || loadingPrograms,
                                    className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }, [
                                    React.createElement('option', { key: 'empty-program', value: '' }, 
                                        loadingPrograms ? 'Loading programs...' : 'Select a loyalty program...'
                                    ),
                                    ...loyaltyPrograms.map(program => 
                                        React.createElement('option', { key: program.Id, value: program.Id }, program.Name)
                                    )
                                ])
                            ]),
                            !mulesoftConfig.endpoint && React.createElement('p', { key: 'programs-help', className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, 
                                'Configure the endpoint URL first to load available programs'
                            )
                        ]),

                        // Journal Types and Subtypes
                        React.createElement('div', { key: 'journal-section' }, [
                            React.createElement('div', { key: 'journal-header', className: 'flex items-center justify-between mb-2' }, [
                                React.createElement('label', { key: 'journal-label', className: 'block text-sm font-medium dark:text-white' }, 
                                    'Journal Type & Subtypes'
                                ),
                                React.createElement('button', {
                                    key: 'journal-refresh-btn',
                                    onClick: refreshJournalTypes,
                                    disabled: !mulesoftConfig.endpoint || loadingJournalTypes,
                                    className: 'p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                                    title: 'Refresh journal types'
                                }, React.createElement(RefreshCw, { 
                                    key: 'refresh-icon',
                                    size: 16,
                                    className: loadingJournalTypes ? 'animate-spin' : ''
                                }))
                            ]),
                            React.createElement('div', { key: 'journal-container', className: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
                                // Journal Type
                                React.createElement('div', { key: 'journal-type' }, [
                                    React.createElement('label', { key: 'journal-type-label', className: 'block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400' }, 
                                        'Journal Type'
                                    ),
                                    React.createElement('div', { key: 'journal-type-container', className: 'relative' }, [
                                        React.createElement('select', {
                                            key: 'journal-type-select',
                                            value: mulesoftConfig.journalTypeId,
                                            onChange: (e) => handleJournalTypeChange(e.target.value),
                                            disabled: !mulesoftConfig.endpoint || loadingJournalTypes,
                                            className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                        }, [
                                            React.createElement('option', { key: 'empty-type', value: '' }, 
                                                loadingJournalTypes ? 'Loading types...' : 'Select journal type...'
                                            ),
                                            ...journalTypes.map(journalType => 
                                                React.createElement('option', { key: journalType.JournalType.Id, value: journalType.JournalType.Id }, 
                                                    journalType.JournalType.Name
                                                )
                                            )
                                        ])
                                    ])
                                ]),

                                // Journal Subtype
                                React.createElement('div', { key: 'journal-subtype' }, [
                                    React.createElement('label', { key: 'journal-subtype-label', className: 'block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400' }, 
                                        'Transaction Journal Subtype'
                                    ),
                                    React.createElement('select', {
                                        key: 'journal-subtype-select',
                                        value: mulesoftConfig.journalSubtypeId,
                                        onChange: (e) => handleJournalSubtypeChange(e.target.value),
                                        disabled: !mulesoftConfig.journalTypeId,
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                    }, [
                                        React.createElement('option', { key: 'empty-subtype', value: '' }, 
                                            !mulesoftConfig.journalTypeId ? 'Select journal type first...' : 'Select journal subtype...'
                                        ),
                                        ...(mulesoftConfig.journalTypeId ? 
                                            journalTypes
                                                .find(jt => jt.JournalType.Id === mulesoftConfig.journalTypeId)
                                                ?.JournalSubTypes?.map(subtype => 
                                                    React.createElement('option', { key: subtype.Id, value: subtype.Id }, subtype.Name)
                                                ) || []
                                            : []
                                        )
                                    ])
                                ]),

                                // Enrollment TJ Subtype
                                React.createElement('div', { key: 'enrollment-journal-subtype' }, [
                                    React.createElement('label', { key: 'enrollment-journal-subtype-label', className: 'block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400' }, 
                                        'Enrollment TJ Subtype'
                                    ),
                                    React.createElement('select', {
                                        key: 'enrollment-journal-subtype-select',
                                        value: mulesoftConfig.enrollmentJournalSubtypeId,
                                        onChange: (e) => handleEnrollmentJournalSubtypeChange(e.target.value),
                                        disabled: !mulesoftConfig.journalTypeId,
                                        className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                    }, [
                                        React.createElement('option', { key: 'empty-enrollment-subtype', value: '' }, 
                                            !mulesoftConfig.journalTypeId ? 'Select journal type first...' : 'Select enrollment subtype...'
                                        ),
                                        ...(mulesoftConfig.journalTypeId ? 
                                            journalTypes
                                                .find(jt => jt.JournalType.Id === mulesoftConfig.journalTypeId)
                                                ?.JournalSubTypes?.map(subtype => 
                                                    React.createElement('option', { key: subtype.Id, value: subtype.Id }, subtype.Name)
                                                ) || []
                                            : []
                                        )
                                    ])
                                ])
                            ]),
                            !mulesoftConfig.endpoint && React.createElement('p', { key: 'journal-help', className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, 
                                'Configure the endpoint URL first to load available journal types'
                            )
                        ]),

                        // Configuration Status
                        React.createElement('div', { key: 'status-section', className: 'mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg' }, [
                            React.createElement('h4', { key: 'status-title', className: 'text-sm font-medium mb-2 dark:text-white' }, 
                                'Configuration Status'
                            ),
                            React.createElement('div', { key: 'status-items', className: 'space-y-2 text-sm' }, [
                                React.createElement('div', { key: 'endpoint-status', className: 'flex items-center gap-2' }, [
                                    React.createElement('div', { 
                                        key: 'endpoint-indicator',
                                        className: `w-2 h-2 rounded-full ${mulesoftConfig.endpoint ? 'bg-green-500' : 'bg-gray-400'}` 
                                    }),
                                    React.createElement('span', { key: 'endpoint-text', className: 'dark:text-gray-300' }, 
                                        `Endpoint: ${mulesoftConfig.endpoint ? 'Configured' : 'Not configured'}`
                                    )
                                ]),
                                React.createElement('div', { key: 'program-status', className: 'flex items-center gap-2' }, [
                                    React.createElement('div', { 
                                        key: 'program-indicator',
                                        className: `w-2 h-2 rounded-full ${mulesoftConfig.loyaltyProgramId ? 'bg-green-500' : 'bg-gray-400'}` 
                                    }),
                                    React.createElement('span', { key: 'program-text', className: 'dark:text-gray-300' }, 
                                        `Loyalty Program: ${mulesoftConfig.loyaltyProgramId ? 'Selected' : 'Not selected'}`
                                    )
                                ]),
                                React.createElement('div', { key: 'journal-status', className: 'flex items-center gap-2' }, [
                                    React.createElement('div', { 
                                        key: 'journal-indicator',
                                        className: `w-2 h-2 rounded-full ${mulesoftConfig.journalTypeId && mulesoftConfig.journalSubtypeId && mulesoftConfig.enrollmentJournalSubtypeId ? 'bg-green-500' : 'bg-gray-400'}` 
                                    }),
                                    React.createElement('span', { key: 'journal-text', className: 'dark:text-gray-300' }, 
                                        `Journal Types & Subtypes: ${mulesoftConfig.journalTypeId && mulesoftConfig.journalSubtypeId && mulesoftConfig.enrollmentJournalSubtypeId ? 'Selected' : 'Not selected'}`
                                    )
                                ])
                            ])
                        ])
                    ]),

                    // Load Members from Loyalty Cloud
                    React.createElement('div', { key: 'load-members-section', className: 'mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg' }, [
                        React.createElement('h4', { key: 'load-members-title', className: 'text-sm font-medium mb-3 dark:text-white' }, 
                            'Load Members from Loyalty Cloud'
                        ),
                        React.createElement('p', { key: 'load-members-description', className: 'text-xs text-gray-600 dark:text-gray-400 mb-4' }, 
                            'Load and sync loyalty program members from the MuleSoft loyalty cloud system'
                        ),
                        React.createElement('button', {
                            key: 'load-members-btn',
                            onClick: loadMembers,
                            disabled: !mulesoftConfig.endpoint || loadingMembers,
                            className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        }, [
                            loadingMembers && React.createElement('div', { 
                                key: 'loading-spinner',
                                className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                            }),
                            React.createElement('span', { key: 'btn-text' }, 
                                loadingMembers ? 'Loading Members...' : 'Load Members from Cloud'
                            )
                        ])
                    ]),

                    // Load Test Data Section
                    React.createElement('div', { key: 'load-test-data-section', className: 'mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg' }, [
                        React.createElement('h4', { key: 'load-test-data-title', className: 'text-sm font-medium mb-3 dark:text-white' }, 
                            'Load Test Data'
                        ),
                        React.createElement('p', { key: 'load-test-data-description', className: 'text-xs text-gray-600 dark:text-gray-400 mb-4' }, 
                            'Load sample data into the database for testing and development purposes'
                        ),
                        React.createElement('button', {
                            key: 'load-test-data-btn',
                            onClick: loadTestData,
                            disabled: loadingTestData,
                            className: 'flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        }, [
                            loadingTestData && React.createElement('div', { 
                                key: 'loading-spinner',
                                className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                            }),
                            React.createElement('span', { key: 'btn-text' }, 
                                loadingTestData ? 'Loading Test Data...' : 'Load Test Data'
                            )
                        ])
                    ]),

                    // Encrypted Settings Section
                    React.createElement('div', { key: 'encrypted-settings-section', className: 'mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800' }, [
                        React.createElement('h4', { key: 'encrypted-title', className: 'text-sm font-medium mb-3 dark:text-white flex items-center gap-2' }, [
                            React.createElement('div', { key: 'lock-icon', className: 'w-4 h-4' }, '🔒'),
                            'Encrypted Settings'
                        ]),
                        React.createElement('p', { key: 'encrypted-description', className: 'text-xs text-gray-600 dark:text-gray-400 mb-4' }, 
                            'Store sensitive data like API keys and passwords securely with encryption'
                        ),
                        React.createElement('div', { key: 'encrypted-examples', className: 'space-y-3' }, [
                            React.createElement('div', { key: 'api-key-example', className: 'flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700' }, [
                                React.createElement('div', { key: 'api-key-info' }, [
                                    React.createElement('h5', { key: 'api-key-title', className: 'text-sm font-medium dark:text-white' }, 'API Key Example'),
                                    React.createElement('p', { key: 'api-key-desc', className: 'text-xs text-gray-500 dark:text-gray-400' }, 'Store external API keys securely')
                                ]),
                                React.createElement('button', {
                                    key: 'api-key-btn',
                                    onClick: () => {
                                        setEditingSetting(null);
                                        setSettingForm({
                                            setting_key: 'external_api_key',
                                            setting_value: '',
                                            description: 'External API key for third-party integrations',
                                            category: 'integration',
                                            setting_type: 'password',
                                            is_encrypted: true
                                        });
                                        setShowSettingModal(true);
                                    },
                                    className: 'px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                                }, 'Add API Key')
                            ]),
                            React.createElement('div', { key: 'password-example', className: 'flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700' }, [
                                React.createElement('div', { key: 'password-info' }, [
                                    React.createElement('h5', { key: 'password-title', className: 'text-sm font-medium dark:text-white' }, 'Password Example'),
                                    React.createElement('p', { key: 'password-desc', className: 'text-xs text-gray-500 dark:text-gray-400' }, 'Store database or service passwords securely')
                                ]),
                                React.createElement('button', {
                                    key: 'password-btn',
                                    onClick: () => {
                                        setEditingSetting(null);
                                        setSettingForm({
                                            setting_key: 'external_service_password',
                                            setting_value: '',
                                            description: 'Password for external service authentication',
                                            category: 'integration',
                                            setting_type: 'password',
                                            is_encrypted: true
                                        });
                                        setShowSettingModal(true);
                                    },
                                    className: 'px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                                }, 'Add Password')
                            ])
                        ]),
                        React.createElement('div', { key: 'encrypted-note', className: 'mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200' }, [
                            '💡 Tip: Encrypted settings are automatically decrypted when retrieved for API calls'
                        ])
                    ])
                ]),

                // System Settings Section
                React.createElement('div', { key: 'system-settings', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
                    React.createElement('div', { key: 'section-header', className: 'flex items-center justify-between mb-6' }, [
                        React.createElement('div', { key: 'title' }, [
                            React.createElement('h3', {key: 'title-header ', className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                                React.createElement(Key, { key: 'icon', size: 24 }),
                                'System Settings'
                            ]),
                            React.createElement('p', {key: 'title-subtext', className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
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
                        React.createElement('div', {key: 'filters-container', className: 'flex gap-2 flex-wrap' }, [
                            React.createElement('button', {
                                key: 'all-btn',
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
                        React.createElement('table', { key: 'settings-table', className: 'w-full' }, [
                            React.createElement('thead', { key: 'thead' }, [
                                React.createElement('tr', { key: 'tr', className: 'border-b dark:border-gray-700' }, [
                                    React.createElement('th', { key: 'key-header', className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Key'),
                                    React.createElement('th', { key: 'value-header', className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Value'),
                                    React.createElement('th', { key: 'category-header', className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Category'),
                                    React.createElement('th', { key: 'type-header', className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Type'),
                                    React.createElement('th', { key: 'description-header', className: 'text-left p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Description'),
                                    React.createElement('th', { key: 'actions-header', className: 'text-center p-3 font-medium text-gray-700 dark:text-gray-300' }, 'Actions')
                               ])
                           ]),
                           React.createElement('tbody', { key: 'tbody' }, 
                               filteredSettings.map(setting =>
                                   React.createElement('tr', { key: 'tr', 
                                       key: setting.setting_key,
                                       className: 'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
                                   }, [
                                       React.createElement('td', { key: 'key-cell', className: 'p-3 font-mono text-sm dark:text-white' }, setting.setting_key),
                                       React.createElement('td', { key: 'value-cell', className: 'p-3' }, [
                                           React.createElement('div', { key: 'value-div', className: 'max-w-xs truncate text-sm dark:text-gray-300' }, 
                                               setting.setting_type === 'boolean' 
                                                   ? React.createElement('span', {
                                                       key: 'boolean-span',
                                                       className: `px-2 py-1 rounded text-xs font-medium ${
                                                           setting.setting_value === 'true' 
                                                               ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                               : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                       }`
                                                   }, setting.setting_value)
                                                   : setting.setting_value
                                           )
                                       ]),
                                       React.createElement('td', { key: 'category-cell', className: 'p-3' }, 
                                           React.createElement(CategoryBadge, { category: setting.category })
                                       ),
                                       React.createElement('td', { key: 'type-cell', className: 'p-3' }, [
                                           React.createElement('span', { key: 'type-span', 
                                               className: 'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium' 
                                           }, setting.setting_type)
                                       ]),
                                       React.createElement('td', { key: 'description-cell', className: 'p-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate' }, 
                                           setting.description
                                       ),
                                       React.createElement('td', { key: 'actions-cell', className: 'p-3' }, [
                                           React.createElement('div', { key: 'actions-div', className: 'flex gap-1 justify-center' }, [
                                               React.createElement('button', {
                                                   key: 'edit-btn',
                                                   onClick: () => handleEditSetting(setting),
                                                   className: 'p-1 text-gray-400 hover:text-blue-600 rounded transition-colors',
                                                   title: 'Edit'
                                               }, React.createElement(Edit, { size: 16 })),
                                               React.createElement('button', {
                                                   key: 'delete-btn',
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
                       React.createElement('h3', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 'Database Connection')
                   ]),

                   databaseInfo ? React.createElement('div', { key: 'database-info-container', className: 'space-y-4' }, [
                       // PostgreSQL URL
                       React.createElement('div', { key: 'postgres-url' }, [
                           React.createElement('label', { key: 'postgres-url-label', className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'PostgreSQL Connection URL ($DATABASE_URL)'
                           ),
                           React.createElement('div', { key: 'postgres-url-container', className: 'flex gap-2' }, [
                               React.createElement('input', {
                                   key: 'postgres-url-input',
                                   type: 'text',
                                   value: databaseInfo.database_url,
                                   readOnly: true,
                                   className: 'flex-1 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white'
                               }),
                               React.createElement('button', {
                                   key: 'postgres-url-copy-btn',
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
                           React.createElement('label', { key: 'jdbc-url-label', className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'JDBC Connection String'
                           ),
                           React.createElement('div', { key: 'jdbc-url-container', className: 'flex gap-2' }, [
                               React.createElement('input', {
                                   key: 'jdbc-url-input',
                                   type: 'text',
                                   value: databaseInfo.jdbc_format,
                                   readOnly: true,
                                   className: 'flex-1 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white'
                               }),
                               React.createElement('button', {
                                   key: 'jdbc-url-copy-btn',
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
                           React.createElement('label', { key: 'ssl-mode-label', className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'SSL Mode'),
                           React.createElement('div', { key: 'ssl-mode-container', 
                               className: 'p-3 bg-gray-100 dark:bg-gray-700 rounded-lg' 
                           }, [
                               React.createElement('span', { key: 'ssl-mode-span', 
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
                           React.createElement('h4', { key: 'example-title', className: 'text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'Example: Using System Settings in SQL Queries'
                           ),
                           React.createElement('pre', { key: 'example-pre', 
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
                       ]),

                       // PostgreSQL Credentials - YAML Format
                       React.createElement('div', { key: 'credentials-yaml-section', className: 'mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg' }, [
                           React.createElement('h4', { key: 'credentials-yaml-title', className: 'text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'PostgreSQL Credentials (YAML Property File Format)'
                           ),
                           React.createElement('div', { key: 'credentials-yaml-container', className: 'flex gap-2' }, [
                               React.createElement('pre', { key: 'credentials-yaml-pre', 
                                   className: 'flex-1 text-xs font-mono bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto' 
                               }, databaseInfo ? parseDatabaseCredentialsYAML(databaseInfo.database_url) : 'Loading credentials...'),
                               React.createElement('button', {
                                   key: 'credentials-yaml-copy-btn',
                                   onClick: () => copyToClipboard(databaseInfo ? parseDatabaseCredentialsYAML(databaseInfo.database_url) : '', 'credentials-yaml'),
                                   className: 'px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2'
                               }, [
                                   copiedToClipboard === 'credentials-yaml' 
                                       ? React.createElement(CheckCircle, { key: 'icon', size: 16, className: 'text-green-600' })
                                       : React.createElement(Copy, { key: 'icon', size: 16 }),
                                   copiedToClipboard === 'credentials-yaml' ? 'Copied!' : 'Copy'
                               ])
                           ])
                       ]),

                       // PostgreSQL Credentials - Java Properties Format
                       React.createElement('div', { key: 'credentials-java-section', className: 'mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg' }, [
                           React.createElement('h4', { key: 'credentials-java-title', className: 'text-sm font-medium mb-2 dark:text-gray-300' }, 
                               'PostgreSQL Credentials (Java Property File Format)'
                           ),
                           React.createElement('div', { key: 'credentials-java-container', className: 'flex gap-2' }, [
                               React.createElement('pre', { key: 'credentials-java-pre', 
                                   className: 'flex-1 text-xs font-mono bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto' 
                               }, databaseInfo ? parseDatabaseCredentialsJava(databaseInfo.database_url) : 'Loading credentials...'),
                               React.createElement('button', {
                                   key: 'credentials-java-copy-btn',
                                   onClick: () => copyToClipboard(databaseInfo ? parseDatabaseCredentialsJava(databaseInfo.database_url) : '', 'credentials-java'),
                                   className: 'px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2'
                               }, [
                                   copiedToClipboard === 'credentials-java' 
                                       ? React.createElement(CheckCircle, { key: 'icon', size: 16, className: 'text-green-600' })
                                       : React.createElement(Copy, { key: 'icon', size: 16 }),
                                   copiedToClipboard === 'credentials-java' ? 'Copied!' : 'Copy'
                               ])
                           ])
                       ])
                   ]) : React.createElement('div', { key: 'loading-container', className: 'text-center py-8 text-gray-500 dark:text-gray-400' }, [
                       React.createElement('div', { key: 'loading-div', className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4' }),
                       'Loading database information...'
                   ])
               ])
           ]),

           // Users Tab Content
           activeTab === 'users' && currentUser?.permissions?.users?.read && React.createElement('div', { key: 'users-content', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
               React.createElement('div', { key: 'section-header', className: 'flex items-center justify-between mb-6' }, [
                   React.createElement('div', { key: 'title' }, [
                       React.createElement('h3', { key: 'title-header', className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                           React.createElement(Users, { key: 'icon', size: 24 }),
                           'User Management'
                       ]),
                       React.createElement('p', { key: 'title-subtext', className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
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
                                    React.createElement('h4', { key: 'user-name', className: 'font-semibold dark:text-white' }, 
                                        `${user.first_name} ${user.last_name}`
                                    ),
                                    React.createElement('p', { key: 'user-username', className: 'text-sm text-gray-600 dark:text-gray-300' }, 
                                        user.username
                                    )
                                ]),
                                React.createElement('div', { key: 'user-status', className: 'flex items-center gap-2' }, [
                                    React.createElement('span', { key: 'user-status-span', 
                                        className: `px-2 py-1 rounded-full text-xs font-medium ${
                                            user.is_active 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`
                                    }, user.is_active ? 'Active' : 'Inactive'),
                                    React.createElement('span', { key: 'user-role-span', 
                                        className: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }, user.role || 'No Role')
                                ])
                            ]),
                            React.createElement('div', { key: 'user-details', className: 'grid grid-cols-2 gap-4 text-sm mb-3' }, [
                                React.createElement('div', { key: 'email' }, [
                                    React.createElement('span', { key: 'email-label', className: 'text-gray-500 dark:text-gray-400' }, 'Email: '),
                                    React.createElement('span', { key: 'email-value', className: 'dark:text-white' }, user.email)
                                ]),
                                React.createElement('div', { key: 'last-login' }, [
                                    React.createElement('span', { key: 'last-login-label', className: 'text-gray-500 dark:text-gray-400' }, 'Last Login: '),
                                    React.createElement('span', { key: 'last-login-value', className: 'dark:text-white' }, 
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
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 'Create New User'),
                       React.createElement('button', {
                           key: 'close-btn',
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
                           React.createElement('label', { key: 'username-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Username'),
                           React.createElement('input', {
                               key: 'username-input',
                               type: 'text',
                               value: createUserForm.username,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'email' }, [
                           React.createElement('label', { key: 'email-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Email'),
                           React.createElement('input', {
                               key: 'email-input',
                               type: 'email',
                               value: createUserForm.email,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'password' }, [
                           React.createElement('label', { key: 'password-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Password'),
                           React.createElement('input', {
                               key: 'password-input',
                               type: 'password',
                               value: createUserForm.password,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'first-name' }, [
                           React.createElement('label', { key: 'first-name-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'First Name'),
                           React.createElement('input', {
                               key: 'first-name-input',
                               type: 'text',
                               value: createUserForm.first_name,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, first_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'last-name' }, [
                           React.createElement('label', { key: 'last-name-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Last Name'),
                           React.createElement('input', {
                               key: 'last-name-input',
                               type: 'text',
                               value: createUserForm.last_name,
                               onChange: (e) => setCreateUserForm(prev => ({ ...prev, last_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'role' }, [
                           React.createElement('label', { key: 'role-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Role'),
                           React.createElement('select', {
                               key: 'role-select',
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
                               key: 'cancel-btn',
                               type: 'button',
                               onClick: () => setShowCreateUserForm(false),
                               className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                           }, 'Cancel'),
                           React.createElement('button', {
                               key: 'create-btn',
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
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 'Edit User'),
                       React.createElement('button', {
                           key: 'close-btn',
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
                           React.createElement('label', { key: 'username-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Username'),
                           React.createElement('input', {
                               key: 'username-input',
                               type: 'text',
                               value: editUserForm.username,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, username: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'email' }, [
                           React.createElement('label', { key: 'email-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Email'),
                           React.createElement('input', {
                               key: 'email-input',
                               type: 'email',
                               value: editUserForm.email,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, email: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'first-name' }, [
                           React.createElement('label', { key: 'first-name-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'First Name'),
                           React.createElement('input', {
                               key: 'first-name-input',
                               type: 'text',
                               value: editUserForm.first_name,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, first_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'last-name' }, [
                           React.createElement('label', { key: 'last-name-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Last Name'),
                           React.createElement('input', {
                               key: 'last-name-input',
                               type: 'text',
                               value: editUserForm.last_name,
                               onChange: (e) => setEditUserForm(prev => ({ ...prev, last_name: e.target.value })),
                               required: true,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'role' }, [
                           React.createElement('label', { key: 'role-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Role'),
                           React.createElement('select', {
                               key: 'role-select',
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
                           React.createElement('label', { key: 'active-status-label', className: 'flex items-center gap-2 dark:text-white' }, [
                               React.createElement('input', {
                                   key: 'active-status-input',
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
                               key: 'cancel-btn',
                               type: 'button',
                               onClick: () => setShowEditUserForm(false),
                               className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                           }, 'Cancel'),
                           React.createElement('button', {
                               key: 'update-btn',
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
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           `Change Password for ${changingPasswordFor?.username}`
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
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
                           React.createElement('label', { key: 'new-password-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'New Password'),
                           React.createElement('input', {
                               key: 'new-password-input',
                               type: 'password',
                               value: passwordForm.new_password,
                               onChange: (e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value })),
                               required: true,
                               minLength: 6,
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'confirm-password' }, [
                           React.createElement('label', { key: 'confirm-password-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Confirm Password'),
                           React.createElement('input', {
                               key: 'confirm-password-input',
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
                               key: 'cancel-btn',
                               type: 'button',
                               onClick: () => setShowPasswordModal(false),
                               className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                           }, 'Cancel'),
                           React.createElement('button', {
                               key: 'change-btn',
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

           // Product Management Tab Content
           activeTab === 'products' && currentUser?.role === 'admin' && React.createElement('div', { key: 'products-content', className: 'space-y-6' }, [
               // Modern Product Management Section
               React.createElement('div', { key: 'product-management-section', className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8' }, [
                   React.createElement('div', { key: 'section-header', className: 'flex items-center gap-3 mb-8' }, [
                       React.createElement('div', { key: 'icon-container', className: 'w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shadow-lg' }, [
                           React.createElement('span', { key: 'icon', className: 'text-2xl' }, '📦')
                       ]),
                       React.createElement('div', { key: 'title-section' }, [
                           React.createElement('h2', { key: 'title', className: 'text-2xl font-bold text-gray-900 dark:text-white' }, 
                               'Data Management'
                           ),
                           React.createElement('p', { key: 'subtitle', className: 'text-gray-600 dark:text-gray-300 mt-1' }, 
                               'Manage your product catalog with AI-powered generation and cloud sync'
                           )
                       ])
                   ]),

                   // Action Cards Grid
                   React.createElement('div', { key: 'actions-grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, [
                       // Delete All Products Card
                       React.createElement('div', { key: 'delete-card', className: 'bg-white dark:bg-gray-800 rounded-xl p-6 border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-200' }, [
                           React.createElement('div', { key: 'card-header', className: 'flex items-center gap-3 mb-4' }, [
                               React.createElement('div', { key: 'icon', className: 'w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center' }, [
                                   React.createElement('span', { key: 'icon-text', className: 'text-red-600 dark:text-red-400 text-lg' }, '🗑️')
                               ]),
                               React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 dark:text-white' }, 'Delete All Products')
                           ]),
                           React.createElement('p', { key: 'description', className: 'text-sm text-gray-600 dark:text-gray-400 mb-4' }, 
                               'Permanently remove all product data from the system'
                           ),
                           React.createElement('button', {
                               key: 'delete-btn',
                               onClick: () => setShowDeleteProductsModal(true),
                               className: 'w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md'
                           }, 'Delete All Products')
                       ]),

                       // Load Products Card
                       React.createElement('div', { key: 'load-card', className: 'bg-white dark:bg-gray-800 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200' }, [
                           React.createElement('div', { key: 'card-header', className: 'flex items-center gap-3 mb-4' }, [
                               React.createElement('div', { key: 'icon', className: 'w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center' }, [
                                   React.createElement('span', { key: 'icon-text', className: 'text-blue-600 dark:text-blue-400 text-lg' }, '☁️')
                               ]),
                               React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 dark:text-white' }, 'Load from Cloud')
                           ]),
                           React.createElement('p', { key: 'description', className: 'text-sm text-gray-600 dark:text-gray-400 mb-4' }, 
                               'Import products from your MuleSoft loyalty cloud instance'
                           ),
                           React.createElement('button', {
                               key: 'load-btn',
                               onClick: () => setShowLoadFromCloudModal(true),
                               disabled: !mulesoftConfig.endpoint,
                               className: 'w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed'
                           }, 'Load from Loyalty Cloud')
                       ]),

                       // Generate Products Card
                       React.createElement('div', { key: 'generate-card', className: 'bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-200' }, [
                           React.createElement('div', { key: 'card-header', className: 'flex items-center gap-3 mb-4' }, [
                               React.createElement('div', { key: 'icon', className: 'w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center' }, [
                                   React.createElement('span', { key: 'icon-text', className: 'text-green-600 dark:text-green-400 text-lg' }, '✨')
                               ]),
                               React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 dark:text-white' }, 'AI Generation')
                           ]),
                           React.createElement('p', { key: 'description', className: 'text-sm text-gray-600 dark:text-gray-400 mb-4' }, 
                               'Generate new products using AI with custom parameters'
                           ),
                           React.createElement('button', {
                               key: 'generate-btn',
                               onClick: () => setShowGenerateProductsModal(true),
                               disabled: !mulesoftConfig.endpoint,
                               className: 'w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed'
                           }, 'Generate Products')
                       ]),

                       // Data Loader Card
                       React.createElement('div', { key: 'data-loader-card', className: 'bg-white dark:bg-gray-800 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all duration-200' }, [
                           React.createElement('div', { key: 'card-header', className: 'flex items-center gap-3 mb-4' }, [
                               React.createElement('div', { key: 'icon', className: 'w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center' }, [
                                   React.createElement('span', { key: 'icon-text', className: 'text-purple-600 dark:text-purple-400 text-lg' }, '📊')
                               ]),
                               React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 dark:text-white' }, 'Data Loader')
                           ]),
                           React.createElement('p', { key: 'description', className: 'text-sm text-gray-600 dark:text-gray-400 mb-4' }, 
                               'Import products or customers from CSV files with intelligent field mapping'
                           ),
                           React.createElement('button', {
                               key: 'data-loader-btn',
                               onClick: () => setShowDataLoaderModal(true),
                               className: 'w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md'
                           }, 'Data Loader')
                       ]),

                       // Send to Loyalty Card
                       React.createElement('div', { key: 'loyalty-card', className: 'bg-white dark:bg-gray-800 rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all duration-200' }, [
                           React.createElement('div', { key: 'card-header', className: 'flex items-center gap-3 mb-4' }, [
                               React.createElement('div', { key: 'icon', className: 'w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center' }, [
                                   React.createElement('span', { key: 'icon-text', className: 'text-orange-600 dark:text-orange-400 text-lg' }, '🎯')
                               ]),
                               React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 dark:text-white' }, 'Send to Loyalty')
                           ]),
                           React.createElement('p', { key: 'description', className: 'text-sm text-gray-600 dark:text-gray-400 mb-4' }, 
                               'Sync your products with Loyalty Cloud for enhanced customer engagement'
                           ),
                           React.createElement('button', {
                               key: 'loyalty-btn',
                               onClick: sendToLoyalty,
                               disabled: syncingLoyalty,
                               className: `w-full px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm ${
                                   syncingLoyalty 
                                       ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                                       : 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-md'
                               }`
                           }, syncingLoyalty ? 'Syncing...' : 'Send to Loyalty')
                       ])
                   ]),

                   // Create Products Button (when products are loaded)
                   productsFromCloud.length > 0 && React.createElement('div', { key: 'create-section', className: 'mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800' }, [
                       React.createElement('div', { key: 'create-header', className: 'flex items-center justify-between mb-4' }, [
                           React.createElement('div', { key: 'create-info' }, [
                               React.createElement('h3', { key: 'create-title', className: 'font-semibold text-gray-900 dark:text-white' }, 'Ready to Create Products'),
                               React.createElement('p', { key: 'create-subtitle', className: 'text-sm text-gray-600 dark:text-gray-400' }, 
                                   `${selectedProducts.length} of ${productsFromCloud.length} products selected`
                               )
                           ]),
                           React.createElement('button', {
                               key: 'create-btn',
                               onClick: createSelectedProducts,
                               disabled: selectedProducts.length === 0 || creatingProducts,
                               className: 'px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed'
                           }, creatingProducts ? 'Creating...' : `Create ${selectedProducts.length} Products`)
                       ])
                   ])
               ]),

               // Generated Products History Section
               React.createElement('div', { key: 'history-section', className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8' }, [
                   React.createElement('div', { key: 'history-header', className: 'flex items-center justify-between mb-6' }, [
                       React.createElement('div', { key: 'history-title-section' }, [
                           React.createElement('h3', { key: 'history-title', className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                               React.createElement('span', { key: 'history-icon', className: 'text-2xl' }, '📋'),
                               'Generated Products History'
                           ]),
                           React.createElement('p', { key: 'history-subtitle', className: 'text-gray-600 dark:text-gray-300 text-sm mt-1' }, 
                               'View and manage your AI-generated product batches'
                           )
                       ])
                   ]),

                   // Search and Filter Controls
                   React.createElement('div', { key: 'search-controls', className: 'flex flex-col sm:flex-row gap-4 mb-6' }, [
                       React.createElement('div', { key: 'search-input', className: 'flex-1' }, [
                           React.createElement('input', {
                               key: 'search-field',
                               type: 'text',
                               placeholder: 'Search by product name or SKU...',
                               value: historySearchTerm,
                               onChange: (e) => setHistorySearchTerm(e.target.value),
                               className: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'batch-filter', className: 'min-w-48' }, [
                           React.createElement('select', {
                               key: 'batch-select',
                               value: selectedBatch || '',
                               onChange: (e) => setSelectedBatch(e.target.value || null),
                               className: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                           }, [
                               React.createElement('option', { key: 'all-batches', value: '' }, 'All Batches'),
                               ...generatedHistory.map(batch => 
                                   React.createElement('option', { 
                                       key: `batch-${batch.batchId}`, 
                                       value: batch.batchId 
                                   }, `Batch ${batch.batchId} - ${batch.brand || 'Unknown Brand'} (${batch.totalProducts} products)`)
                               )
                           ])
                       ]),
                       React.createElement('button', {
                           key: 'refresh-btn',
                           onClick: loadGeneratedHistory,
                           disabled: loadingHistory,
                           className: 'p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                           title: 'Refresh generated products history'
                       }, React.createElement(RefreshCw, { 
                           key: 'refresh-icon',
                           size: 16,
                           className: loadingHistory ? 'animate-spin' : ''
                       }))
                   ]),

                   // History Content
                   loadingHistory ? React.createElement('div', { key: 'loading', className: 'flex justify-center py-12' }, [
                       React.createElement('div', { key: 'spinner', className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' })
                   ]) : filteredHistory.length === 0 ? React.createElement('div', { key: 'empty', className: 'text-center py-12 text-gray-500 dark:text-gray-400' }, 
                       'No generated products found'
                   ) : React.createElement('div', { key: 'batches-list', className: 'space-y-6' }, 
                       filteredHistory
                           .filter(batch => !selectedBatch || batch.batchId === selectedBatch)
                           .map(batch => {
                               // Process products for this batch
                               const processedProducts = batch.products
                                   .flat()
                                   .filter(product => product !== null && product !== undefined)
                                   .map(product => {
                                       if (typeof product === 'string') {
                                           try {
                                               return JSON.parse(product);
                                           } catch (e) {
                                               console.error('Error parsing product in preview:', e);
                                               return product;
                                           }
                                       }
                                       return product;
                                   });

                               return React.createElement('div', { 
                                   key: `batch-${batch.batchId}`,
                                   className: 'border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'
                               }, [
                                   React.createElement('div', { key: 'batch-header', className: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600' }, [
                                       React.createElement('div', { key: 'batch-info', className: 'flex justify-between items-center' }, [
                                           React.createElement('div', { key: 'batch-details' }, [
                                               React.createElement('h4', { key: 'batch-title', className: 'font-semibold text-lg dark:text-white' }, 
                                                   `Batch ${batch.batchId}`
                                               ),
                                               React.createElement('p', { key: 'batch-meta', className: 'text-sm text-gray-600 dark:text-gray-400' }, 
                                                   `${batch.totalProducts} products • ${batch.brand || 'Unknown Brand'} • ${batch.segment || 'No Segment'} • Generated ${new Date(batch.createdAt).toLocaleDateString()}`
                                               )
                                           ]),
                                           React.createElement('div', { key: 'batch-actions', className: 'flex items-center gap-2' }, [
                                               React.createElement('button', {
                                                   key: 'delete-batch-btn',
                                                   onClick: () => deleteBatch(batch.batchId),
                                                   className: 'p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors',
                                                   title: 'Delete this batch'
                                               }, React.createElement(Trash2, { 
                                                   key: 'delete-icon',
                                                   size: 16
                                               })),
                                               React.createElement('button', {
                                                   key: 'view-batch-btn',
                                                   onClick: () => {
                                                       // Ensure products are properly formatted and flatten any nested arrays
                                                       const formattedProducts = batch.products
                                                           .flat() // Flatten any nested arrays
                                                           .filter(product => product !== null && product !== undefined) // Remove null/undefined products
                                                           .map(product => {
                                                               // If product is a string, try to parse it
                                                               if (typeof product === 'string') {
                                                                   try {
                                                                       return JSON.parse(product);
                                                                   } catch (e) {
                                                                       console.error('Error parsing product:', e);
                                                                       return product;
                                                                   }
                                                               }
                                                                   return product;
                                                           });
                                                       
                                                       console.log('=== Products from Generated History ===');
                                                       console.log('Formatted products:', formattedProducts);
                                                       console.log('First product:', formattedProducts[0]);
                                                       console.log('========================================');
                                                       setProductsFromCloud(formattedProducts);
                                                       setSelectedProducts([]);
                                                       setExpandedProducts(new Set());
                                                   },
                                                   className: 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md'
                                               }, 'View Products')
                                           ])
                                       ])
                                   ]),
                                   React.createElement('div', { key: 'batch-products', className: 'p-6' }, [
                                       React.createElement('div', { key: 'products-grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' }, 
                                           (() => {
                                               // Create product preview elements
                                               const productElements = processedProducts.slice(0, 6).map((product, index) => 
                                                   React.createElement('div', { 
                                                       key: `product-${index}`,
                                                       className: 'p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200'
                                                   }, [
                                                       React.createElement('div', { key: 'product-header', className: 'flex justify-between items-start mb-3' }, [
                                                           React.createElement('h5', { key: 'product-name', className: 'font-medium text-sm dark:text-white truncate flex-1 mr-2' }, 
                                                               product.product_name
                                                           ),
                                                           React.createElement('span', { key: 'product-sku', className: 'text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded' }, 
                                                               product.sku
                                                           )
                                                       ]),
                                                       React.createElement('p', { key: 'product-price', className: 'text-sm font-semibold text-green-600 dark:text-green-400 mb-2' }, 
                                                           product.pricing?.price || 'N/A'
                                                       ),
                                                       React.createElement('p', { key: 'product-description', className: 'text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3' }, 
                                                           product.short_description || 'No description'
                                                       ),
                                                       React.createElement('div', { key: 'product-status', className: 'flex justify-between items-center' }, [
                                                           React.createElement('span', { 
                                                               key: 'status-badge',
                                                               className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                           }, 'Generated'),
                                                           existingProducts.includes(product.product_name) && React.createElement('span', { 
                                                               key: 'exists-badge',
                                                               className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                           }, 'Exists')
                                                       ])
                                                   ])
                                               );
                                               
                                               // Add "more products" element if needed
                                               if (processedProducts.length > 6) {
                                                   productElements.push(
                                                       React.createElement('div', { key: 'more-products', className: 'col-span-full text-center py-4' }, [
                                                           React.createElement('p', { key: 'more-text', className: 'text-sm text-gray-500 dark:text-gray-400' }, 
                                                               `+${processedProducts.length - 6} more products`
                                                           )
                                                       ])
                                                   );
                                               }
                                               
                                               return productElements;
                                           })()
                                       )
                                   ])
                               ]);
                           })
                   )
               ])
           ]),

           React.createElement(window.Modals.SystemSettingModal, {
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
               },
               editingSetting: editingSetting,
               X: X,
               settingForm: settingForm,
               setSettingForm: setSettingForm,
               handleSaveSetting: handleSaveSetting,
               Save: Save
           }),

           // Delete Products Confirmation Modal
           showDeleteProductsModal && React.createElement('div', {
               key: 'delete-products-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-md'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold text-red-600 dark:text-red-400' }, 
                           '⚠️ Delete All Products'
                       )
                   ]),
                   React.createElement('div', { key: 'body', className: 'px-6 py-4' }, [
                       React.createElement('p', { key: 'warning', className: 'text-gray-700 dark:text-gray-300 mb-4' }, 
                           'This action will permanently delete ALL product data from the system. This cannot be undone.'
                       ),
                       React.createElement('p', { key: 'confirm', className: 'text-sm text-gray-600 dark:text-gray-400' }, 
                           'Are you sure you want to continue?'
                       )
                   ]),
                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                       React.createElement('button', {
                           key: 'cancel-btn',
                           onClick: () => setShowDeleteProductsModal(false),
                           className: 'px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
                       }, 'Cancel'),
                       React.createElement('button', {
                           key: 'delete-btn',
                           onClick: deleteAllProducts,
                           className: 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                       }, 'Delete All Products')
                   ])
               ])
           ]),

           // Generate Products Modal
           showGenerateProductsModal && React.createElement('div', {
               key: 'generate-products-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           '✨ Generate Products with Mule'
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: () => setShowGenerateProductsModal(false),
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, '✕')
                   ]),
                   React.createElement('div', { key: 'body', className: 'px-6 py-4 space-y-4' }, [
                       React.createElement('div', { key: 'number-field' }, [
                           React.createElement('label', { key: 'number-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Number of products to generate (max 10)'),
                           React.createElement('input', {
                               key: 'number-input',
                               type: 'number',
                               min: 1,
                               max: 10,
                               value: generateForm.numberOfProducts,
                               onChange: (e) => setGenerateForm(prev => ({ ...prev, numberOfProducts: parseInt(e.target.value) || 1 })),
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'brand-field' }, [
                           React.createElement('label', { key: 'brand-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Brand *'),
                           React.createElement('input', {
                               key: 'brand-input',
                               type: 'text',
                               value: generateForm.brand,
                               onChange: (e) => setGenerateForm(prev => ({ ...prev, brand: e.target.value })),
                               placeholder: 'Type your own brand or an existing one',
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'segment-field' }, [
                           React.createElement('label', { key: 'segment-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Segment'),
                           React.createElement('input', {
                               key: 'segment-input',
                               type: 'text',
                               value: generateForm.segment,
                               onChange: (e) => setGenerateForm(prev => ({ ...prev, segment: e.target.value })),
                               placeholder: 'Segment the products',
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       React.createElement('div', { key: 'url-field' }, [
                           React.createElement('label', { key: 'url-label', className: 'block text-sm font-medium mb-2 dark:text-white' }, 'URL of current Brand'),
                           React.createElement('input', {
                               key: 'url-input',
                               type: 'url',
                               value: generateForm.brandUrl,
                               onChange: (e) => setGenerateForm(prev => ({ ...prev, brandUrl: e.target.value })),
                               placeholder: 'https://example.com (optional)',
                               className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                           })
                       ]),
                       generateForm.brandUrl && React.createElement('div', { key: 'url-note', className: 'p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg' }, [
                           React.createElement('p', { key: 'url-note-text', className: 'text-sm text-blue-800 dark:text-blue-200' }, 
                               'Note: The provided URL will be used as an example for generating products with similar style and characteristics.'
                           )
                       ])
                   ]),
                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                       React.createElement('button', {
                           key: 'cancel-btn',
                           onClick: () => setShowGenerateProductsModal(false),
                           className: 'px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
                       }, 'Cancel'),
                       React.createElement('button', {
                           key: 'generate-btn',
                           onClick: generateProducts,
                           disabled: loadingProducts,
                           className: 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                       }, loadingProducts ? 'Generating...' : 'Generate')
                   ])
               ])
           ]),

           // Products Table Modal
           productsFromCloud.length > 0 && React.createElement('div', {
               key: 'products-table-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           `Generated products for "${productsFromCloud[0]?.brand || productsFromCloud[0]?.collection || 'Unknown Brand'}"`
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: () => setProductsFromCloud([]),
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, '✕')
                   ]),
                   React.createElement('div', { key: 'body', className: 'px-6 py-4 overflow-y-auto max-h-[60vh]' }, [
                       React.createElement('div', { key: 'table-container', className: 'overflow-x-auto' }, [
                           React.createElement('table', { key: 'products-table', className: 'w-full text-sm' }, [
                               React.createElement('thead', { key: 'table-head' }, [
                                   React.createElement('tr', { key: 'header-row', className: 'border-b dark:border-gray-700' }, [
                                       React.createElement('th', { key: 'select-header', className: 'text-left py-2 px-3 dark:text-white' }, 'Select'),
                                       React.createElement('th', { key: 'collection-header', className: 'text-left py-2 px-3 dark:text-white' }, 'Collection'),
                                       React.createElement('th', { key: 'name-header', className: 'text-left py-2 px-3 dark:text-white' }, 'Product Name'),
                                       React.createElement('th', { key: 'price-header', className: 'text-left py-2 px-3 dark:text-white' }, 'Price'),
                                       React.createElement('th', { key: 'description-header', className: 'text-left py-2 px-3 dark:text-white' }, 'Short Description'),
                                       React.createElement('th', { key: 'sku-header', className: 'text-left py-2 px-3 dark:text-white' }, 'SKU'),
                                       React.createElement('th', { key: 'details-header', className: 'text-left py-2 px-3 dark:text-white' }, 'Details')
                                   ])
                               ]),
                               React.createElement('tbody', { key: 'table-body' }, 
                                   productsFromCloud.map((product, index) => [
                                           React.createElement('tr', { 
                                               key: `product-row-${index}`,
                                               className: `border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedProducts.some(p => {
                                                   const getProductId = (prod) => {
                                                       if (prod.sku && prod.sku.trim()) {
                                                           return prod.sku;
                                                       }
                                                       return `${prod.product_name || 'unnamed'}_${prod.collection || 'no-collection'}_${prod.pricing?.price || 'no-price'}`;
                                                   };
                                                   return getProductId(p) === getProductId(product);
                                               }) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`
                                           }, [
                                               React.createElement('td', { key: 'select-cell', className: 'py-2 px-3' }, [
                                                   React.createElement('input', {
                                                       key: 'checkbox',
                                                       type: 'checkbox',
                                                       checked: selectedProducts.some(p => {
                                                           const getProductId = (prod) => {
                                                               if (prod.sku && prod.sku.trim()) {
                                                                   return prod.sku;
                                                               }
                                                               return `${prod.product_name || 'unnamed'}_${prod.collection || 'no-collection'}_${prod.pricing?.price || 'no-price'}`;
                                                           };
                                                           return getProductId(p) === getProductId(product);
                                                       }),
                                                       onChange: () => toggleProductSelection(product),
                                                       className: 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                                                   })
                                               ]),
                                           React.createElement('td', { key: 'collection-cell', className: 'py-2 px-3 dark:text-white' }, product.collection || 'N/A'),
                                           React.createElement('td', { key: 'name-cell', className: 'py-2 px-3 dark:text-white font-medium' }, product.product_name),
                                           React.createElement('td', { key: 'price-cell', className: 'py-2 px-3 dark:text-white' }, product.pricing?.price || 'N/A'),
                                           React.createElement('td', { key: 'description-cell', className: 'py-2 px-3 dark:text-white' }, product.short_description || 'N/A'),
                                           React.createElement('td', { key: 'sku-cell', className: 'py-2 px-3 dark:text-white font-mono text-xs' }, product.sku),
                                           React.createElement('td', { key: 'details-cell', className: 'py-2 px-3' }, [
                                               React.createElement('button', {
                                                   key: 'expand-btn',
                                                   onClick: () => toggleProductExpansion(product.sku),
                                                   className: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                               }, expandedProducts.has(product.sku) ? '−' : '+')
                                           ])
                                       ]),
                                       // Expanded details row
                                       expandedProducts.has(product.sku) && React.createElement('tr', { 
                                           key: `product-details-${index}`,
                                           className: 'bg-gray-50 dark:bg-gray-700/30'
                                       }, [
                                           React.createElement('td', { 
                                               key: 'details-content',
                                               colSpan: 7,
                                               className: 'py-4 px-3'
                                           }, [
                                               React.createElement('div', { key: 'details-container', className: 'space-y-3' }, [
                                                   React.createElement('div', { key: 'description-section' }, [
                                                       React.createElement('h4', { key: 'description-title', className: 'font-medium text-gray-900 dark:text-white mb-2' }, 'Description'),
                                                       React.createElement('p', { key: 'description-text', className: 'text-gray-700 dark:text-gray-300 text-sm' }, product.description || 'No description available')
                                                   ]),
                                                   product.dimensions && React.createElement('div', { key: 'dimensions-section' }, [
                                                       React.createElement('h4', { key: 'dimensions-title', className: 'font-medium text-gray-900 dark:text-white mb-2' }, 'Dimensions'),
                                                       React.createElement('p', { key: 'dimensions-text', className: 'text-gray-700 dark:text-gray-300 text-sm' }, product.dimensions.dimensions || 'N/A')
                                                   ]),
                                                   product.special_features && product.special_features.length > 0 && React.createElement('div', { key: 'features-section' }, [
                                                       React.createElement('h4', { key: 'features-title', className: 'font-medium text-gray-900 dark:text-white mb-2' }, 'Special Features'),
                                                       React.createElement('ul', { key: 'features-list', className: 'list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1' },
                                                           product.special_features.map((feature, featureIndex) => 
                                                               React.createElement('li', { key: `feature-${featureIndex}` }, feature)
                                                           )
                                                       )
                                                   ]),
                                                   product.care_instructions && React.createElement('div', { key: 'care-section' }, [
                                                       React.createElement('h4', { key: 'care-title', className: 'font-medium text-gray-900 dark:text-white mb-2' }, 'Care Instructions'),
                                                       React.createElement('p', { key: 'care-text', className: 'text-gray-700 dark:text-gray-300 text-sm' }, product.care_instructions)
                                                   ]),
                                                   product.warranty && React.createElement('div', { key: 'warranty-section' }, [
                                                       React.createElement('h4', { key: 'warranty-title', className: 'font-medium text-gray-900 dark:text-white mb-2' }, 'Warranty'),
                                                       React.createElement('p', { key: 'warranty-text', className: 'text-gray-700 dark:text-gray-300 text-sm' }, product.warranty)
                                                   ])
                                               ])
                                           ])
                                       ])
                                   ]).flat()
                               )
                           ])
                       ])
                   ]),
                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('div', { key: 'selection-info', className: 'text-sm text-gray-600 dark:text-gray-400' }, 
                           `${selectedProducts.length} of ${productsFromCloud.length} products selected`
                       ),
                       React.createElement('div', { key: 'action-buttons', className: 'flex gap-3' }, [
                           React.createElement('button', {
                               key: 'close-btn',
                               onClick: () => setProductsFromCloud([]),
                               className: 'px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
                           }, 'Close'),
                           React.createElement('button', {
                               key: 'create-btn',
                               onClick: createSelectedProducts,
                               disabled: selectedProducts.length === 0 || creatingProducts,
                               className: 'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                           }, creatingProducts ? 'Creating...' : `Create ${selectedProducts.length} Products`)
                       ])
                   ])
               ])
           ]),

           // Generated History Modal
           showGeneratedHistoryModal && React.createElement('div', {
               key: 'generated-history-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           '📋 Generated Products History'
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeGeneratedHistory,
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, '✕')
                   ]),
                   React.createElement('div', { key: 'body', className: 'px-6 py-4 overflow-y-auto max-h-[60vh]' }, [
                       // Search and Filter Section
                       React.createElement('div', { key: 'search-section', className: 'mb-4' }, [
                           React.createElement('div', { key: 'search-container', className: 'flex gap-4 items-center' }, [
                               React.createElement('div', { key: 'search-field', className: 'flex-1' }, [
                                   React.createElement('input', {
                                       key: 'search-input',
                                       type: 'text',
                                       value: historySearchTerm,
                                       onChange: (e) => setHistorySearchTerm(e.target.value),
                                       placeholder: 'Search by product name or SKU...',
                                       className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                   })
                               ]),
                               React.createElement('div', { key: 'batch-filter', className: 'min-w-48' }, [
                                   React.createElement('select', {
                                       key: 'batch-select',
                                       value: selectedBatch || '',
                                       onChange: (e) => setSelectedBatch(e.target.value || null),
                                       className: 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                   }, [
                                       React.createElement('option', { key: 'all-batches', value: '' }, 'All Batches'),
                                       ...generatedHistory.map(batch => 
                                           React.createElement('option', { 
                                               key: `batch-${batch.batchId}`, 
                                               value: batch.batchId 
                                           }, `Batch ${batch.batchId} - ${batch.brand || 'Unknown Brand'} (${batch.totalProducts} products)`)
                                       )
                                   ])
                               ])
                           ])
                       ]),
                       
                       // Batches List
                       loadingHistory ? React.createElement('div', { key: 'loading', className: 'flex justify-center py-8' }, [
                           React.createElement('div', { key: 'spinner', className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' })
                       ]) : filteredHistory.length === 0 ? React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500 dark:text-gray-400' }, 
                           'No generated products found'
                       ) : React.createElement('div', { key: 'batches-list', className: 'space-y-4' }, 
                           filteredHistory
                               .filter(batch => !selectedBatch || batch.batchId === selectedBatch)
                               .map(batch => [
                                   React.createElement('div', { 
                                       key: `batch-${batch.batchId}`,
                                       className: 'border dark:border-gray-700 rounded-lg overflow-hidden'
                                   }, [
                                       React.createElement('div', { key: 'batch-header', className: 'bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600' }, [
                                           React.createElement('div', { key: 'batch-info', className: 'flex justify-between items-center' }, [
                                               React.createElement('div', { key: 'batch-details' }, [
                                                   React.createElement('h3', { key: 'batch-title', className: 'font-medium dark:text-white' }, 
                                                       `Batch ${batch.batchId}`
                                                   ),
                                                   React.createElement('p', { key: 'batch-meta', className: 'text-sm text-gray-600 dark:text-gray-400' }, 
                                                       `${batch.totalProducts} products • ${batch.brand || 'Unknown Brand'} • ${batch.segment || 'No Segment'} • Generated ${new Date(batch.createdAt).toLocaleDateString()}`
                                                   )
                                               ]),
                                               React.createElement('div', { key: 'batch-actions', className: 'flex items-center gap-2' }, [
                                                   React.createElement('button', {
                                                       key: 'delete-batch-btn',
                                                       onClick: () => deleteBatch(batch.batchId),
                                                       className: 'p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors',
                                                       title: 'Delete this batch'
                                                   }, React.createElement(Trash2, { 
                                                       key: 'delete-icon',
                                                       size: 16
                                                   })),
                                                   React.createElement('button', {
                                                       key: 'view-batch-btn',
                                                       onClick: () => {
                                                           // Ensure products are properly formatted and flatten any nested arrays
                                                           const formattedProducts = batch.products
                                                               .flat() // Flatten any nested arrays
                                                               .filter(product => product !== null && product !== undefined) // Remove null/undefined products
                                                               .map(product => {
                                                                   // If product is a string, try to parse it
                                                                   if (typeof product === 'string') {
                                                                       try {
                                                                           return JSON.parse(product);
                                                                       } catch (e) {
                                                                           console.error('Error parsing product:', e);
                                                                           return product;
                                                                       }
                                                                   }
                                                                   return product;
                                                               });
                                                           
                                                           console.log('=== Products from Generated History Modal ===');
                                                           console.log('Formatted products:', formattedProducts);
                                                           console.log('First product:', formattedProducts[0]);
                                                           console.log('=============================================');
                                                           setProductsFromCloud(formattedProducts);
                                                           setSelectedProducts([]);
                                                           setExpandedProducts(new Set());
                                                           setShowGeneratedHistoryModal(false);
                                                       },
                                                       className: 'px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                                                   }, 'View Products')
                                               ])
                                           ])
                                       ]),
                                       React.createElement('div', { key: 'batch-products', className: 'p-4' }, [
                                           React.createElement('div', { key: 'products-grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' }, 
                                               (() => {
                                                   // Process products the same way as in View Products button
                                                   const processedProducts = batch.products
                                                       .flat() // Flatten any nested arrays
                                                       .filter(product => product !== null && product !== undefined) // Remove null/undefined products
                                                       .map(product => {
                                                           // If product is a string, try to parse it
                                                           if (typeof product === 'string') {
                                                               try {
                                                                   return JSON.parse(product);
                                                               } catch (e) {
                                                                   console.error('Error parsing product in preview:', e);
                                                                   return product;
                                                               }
                                                           }
                                                           return product;
                                                       });
                                                   
                                                   return processedProducts.slice(0, 6).map((product, index) => [
                                                   React.createElement('div', { 
                                                       key: `product-${index}`,
                                                       className: 'p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800'
                                                   }, [
                                                       React.createElement('div', { key: 'product-header', className: 'flex justify-between items-start mb-2' }, [
                                                           React.createElement('h4', { key: 'product-name', className: 'font-medium text-sm dark:text-white truncate' }, 
                                                               product.product_name
                                                           ),
                                                           React.createElement('span', { key: 'product-sku', className: 'text-xs text-gray-500 dark:text-gray-400 font-mono' }, 
                                                               product.sku
                                                           )
                                                       ]),
                                                       React.createElement('p', { key: 'product-price', className: 'text-sm font-medium text-green-600 dark:text-green-400' }, 
                                                           product.pricing?.price || 'N/A'
                                                       ),
                                                       React.createElement('p', { key: 'product-description', className: 'text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2' }, 
                                                           product.short_description || 'No description'
                                                       ),
                                                       // Check if product already exists
                                                       React.createElement('div', { key: 'product-status', className: 'mt-2' }, [
                                                           React.createElement('span', { 
                                                               key: 'status-badge',
                                                               className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                           }, 'Generated')
                                                       ])
                                                   ])
                                               ]);
                                               })()
                                           ),
                                           (() => {
                                               const processedProducts = batch.products
                                                   .flat()
                                                   .filter(product => product !== null && product !== undefined);
                                               return processedProducts.length > 6 && React.createElement('div', { key: 'more-products', className: 'mt-3 text-center' }, [
                                                   React.createElement('p', { key: 'more-text', className: 'text-sm text-gray-500 dark:text-gray-400' }, 
                                                       `+${processedProducts.length - 6} more products`
                                                   )
                                               ]);
                                           })()
                                       ])
                                   ])
                               ]).flat()
                       )
                   ]),
                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex justify-end' }, [
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeGeneratedHistory,
                           className: 'px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
                       }, 'Close')
                   ])
               ])
           ]),

           // Members Modal
           showMembersModal && React.createElement('div', {
               key: 'members-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           `Loyalty Members (${members.length} found)`
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeMembersModal,
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, React.createElement(X, { size: 24 }))
                   ]),
                   
                   React.createElement('div', { key: 'content', className: 'p-6' }, [
                       React.createElement('div', { key: 'warning', className: 'mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg' }, [
                           React.createElement('p', { key: 'warning-text', className: 'text-sm text-yellow-800 dark:text-yellow-200' }, 
                               '⚠️ This action will replace current customer data. Please review the members below before proceeding.'
                           )
                       ]),
                       
                       React.createElement('div', { key: 'members-list', className: 'max-h-96 overflow-y-auto border dark:border-gray-700 rounded-lg' }, [
                           React.createElement('table', { key: 'members-table', className: 'w-full' }, [
                               React.createElement('thead', { key: 'thead', className: 'bg-gray-50 dark:bg-gray-700 sticky top-0' }, [
                                   React.createElement('tr', { key: 'header-row' }, [
                                       React.createElement('th', { key: 'membership-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Membership #'),
                                       React.createElement('th', { key: 'name-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Name'),
                                       React.createElement('th', { key: 'email-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Email'),
                                       React.createElement('th', { key: 'tier-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Tier'),
                                       React.createElement('th', { key: 'points-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Points')
                                   ])
                               ]),
                               React.createElement('tbody', { key: 'tbody', className: 'bg-white dark:bg-gray-800 divide-y dark:divide-gray-700' }, 
                                   members.map((member, index) => 
                                       React.createElement('tr', { key: `member-${index}`, className: 'hover:bg-gray-50 dark:hover:bg-gray-700' }, [
                                           React.createElement('td', { key: 'membership', className: 'px-4 py-3 text-sm font-medium text-gray-900 dark:text-white' }, 
                                               member.MembershipNumber
                                           ),
                                           React.createElement('td', { key: 'name', className: 'px-4 py-3 text-sm text-gray-900 dark:text-white' }, 
                                               member.Contact?.Name || 'N/A'
                                           ),
                                           React.createElement('td', { key: 'email', className: 'px-4 py-3 text-sm text-gray-900 dark:text-white' }, 
                                               member.Contact?.Email || 'N/A'
                                           ),
                                           React.createElement('td', { key: 'tier', className: 'px-4 py-3 text-sm' }, [
                                               React.createElement('span', { 
                                                   key: 'tier-badge',
                                                   className: `px-2 py-1 text-xs font-medium rounded-full ${
                                                       member.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                       member.tier === 'Silver' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                                                       'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                   }`
                                               }, member.tier || 'N/A')
                                           ]),
                                           React.createElement('td', { key: 'points', className: 'px-4 py-3 text-sm text-gray-900 dark:text-white' }, 
                                               member.points?.[0]?.PointsBalance || 0
                                           )
                                       ])
                                   )
                               )
                           ])
                       ])
                   ]),

                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                       React.createElement('button', {
                           key: 'cancel-btn',
                           onClick: closeMembersModal,
                           className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                       }, 'Cancel'),
                       React.createElement('button', {
                           key: 'sync-btn',
                           onClick: syncMembers,
                           disabled: syncingMembers,
                           className: 'px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2'
                       }, [
                           syncingMembers && React.createElement('div', { 
                               key: 'sync-spinner',
                               className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                           }),
                           syncingMembers ? 'Syncing...' : 'Sync Members'
                       ])
                   ])
               ])
           ]),

           // Sync Results Modal
           showSyncResults && React.createElement('div', {
               key: 'sync-results-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           'Members Sync Results'
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeSyncResults,
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, React.createElement(X, { size: 24 }))
                   ]),
                   
                   React.createElement('div', { key: 'content', className: 'p-6' }, [
                       React.createElement('div', { key: 'summary', className: 'mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg' }, [
                           React.createElement('h3', { key: 'summary-title', className: 'text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2' }, 
                               'Sync Summary'
                           ),
                           React.createElement('div', { key: 'summary-stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-4' }, [
                               React.createElement('div', { key: 'total', className: 'text-center' }, [
                                   React.createElement('div', { key: 'total-number', className: 'text-2xl font-bold text-blue-900 dark:text-blue-100' }, 
                                       syncResults?.length || 0
                                   ),
                                   React.createElement('div', { key: 'total-label', className: 'text-sm text-blue-700 dark:text-blue-200' }, 'Total Processed')
                               ]),
                               React.createElement('div', { key: 'success', className: 'text-center' }, [
                                   React.createElement('div', { key: 'success-number', className: 'text-2xl font-bold text-green-600' }, 
                                       syncResults?.filter(r => r.success === 'true').length || 0
                                   ),
                                   React.createElement('div', { key: 'success-label', className: 'text-sm text-green-700 dark:text-green-200' }, 'Successful')
                               ]),
                               React.createElement('div', { key: 'failed', className: 'text-center' }, [
                                   React.createElement('div', { key: 'failed-number', className: 'text-2xl font-bold text-red-600' }, 
                                       syncResults?.filter(r => r.success === 'false').length || 0
                                   ),
                                   React.createElement('div', { key: 'failed-label', className: 'text-sm text-red-700 dark:text-red-200' }, 'Failed')
                               ]),
                               React.createElement('div', { key: 'synced', className: 'text-center' }, [
                                   React.createElement('div', { key: 'synced-number', className: 'text-2xl font-bold text-blue-600' }, 
                                       syncResults?.filter(r => r.success === 'true' && r.affectedRows > 0).length || 0
                                   ),
                                   React.createElement('div', { key: 'synced-label', className: 'text-sm text-blue-700 dark:text-blue-200' }, 'New Members')
                               ])
                           ])
                       ]),
                       
                       React.createElement('div', { key: 'results-list', className: 'max-h-96 overflow-y-auto border dark:border-gray-700 rounded-lg' }, [
                           React.createElement('table', { key: 'results-table', className: 'w-full' }, [
                               React.createElement('thead', { key: 'thead', className: 'bg-gray-50 dark:bg-gray-700 sticky top-0' }, [
                                   React.createElement('tr', { key: 'header-row' }, [
                                       React.createElement('th', { key: 'status-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Status'),
                                       React.createElement('th', { key: 'loyalty-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Loyalty #'),
                                       React.createElement('th', { key: 'name-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Name'),
                                       React.createElement('th', { key: 'email-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Email'),
                                       React.createElement('th', { key: 'error-header', className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider' }, 'Error')
                                   ])
                               ]),
                               React.createElement('tbody', { key: 'tbody', className: 'bg-white dark:bg-gray-800 divide-y dark:divide-gray-700' }, 
                                   syncResults?.map((result, index) => 
                                       React.createElement('tr', { key: `result-${index}`, className: 'hover:bg-gray-50 dark:hover:bg-gray-700' }, [
                                           React.createElement('td', { key: 'status', className: 'px-4 py-3 text-sm' }, [
                                               React.createElement('span', { 
                                                   key: 'status-badge',
                                                   className: `px-2 py-1 text-xs font-medium rounded-full ${
                                                       result.success === 'true' 
                                                           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                           : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                   }`
                                               }, result.success === 'true' ? 'Success' : 'Failed')
                                           ]),
                                           React.createElement('td', { key: 'loyalty', className: 'px-4 py-3 text-sm font-medium text-gray-900 dark:text-white' }, 
                                               result.loyalty_number
                                           ),
                                           React.createElement('td', { key: 'name', className: 'px-4 py-3 text-sm text-gray-900 dark:text-white' }, 
                                               result.name || 'N/A'
                                           ),
                                           React.createElement('td', { key: 'email', className: 'px-4 py-3 text-sm text-gray-900 dark:text-white' }, 
                                               result.email || 'N/A'
                                           ),
                                           React.createElement('td', { key: 'error', className: 'px-4 py-3 text-sm text-red-600 dark:text-red-400 max-w-xs truncate' }, 
                                               result.error || ''
                                           )
                                       ])
                                   ) || []
                               )
                           ])
                       ])
                   ]),

                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeSyncResults,
                           className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                       }, 'Close')
                   ])
               ])
           ]),

           // Test Data Output Modal
           showTestDataOutput && React.createElement('div', {
               key: 'test-data-output-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', { 
                   key: 'modal',
                   className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'
               }, [
                   React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center' }, [
                       React.createElement('h2', { key: 'title', className: 'text-xl font-bold dark:text-white' }, 
                           'Test Data Loading Output'
                       ),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeTestDataOutput,
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                       }, React.createElement(X, { size: 24 }))
                   ]),
                   
                   React.createElement('div', { key: 'content', className: 'p-6' }, [
                       React.createElement('div', { key: 'output-container', className: 'bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto' }, [
                           React.createElement('pre', { key: 'output-text', className: 'whitespace-pre-wrap' }, 
                               testDataOutput || 'No output available'
                           )
                       ])
                   ]),

                   React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t dark:border-gray-700 flex gap-3 justify-end' }, [
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: closeTestDataOutput,
                           className: 'px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'
                       }, 'Close')
                   ])
               ])
           ]),

           // Load from Cloud Modal
           showLoadFromCloudModal && React.createElement(window.Modals.LoadFromCloudModal, {
               key: 'load-from-cloud-modal',
               show: showLoadFromCloudModal,
               onClose: closeLoadFromCloudModal,
               onProductsLoaded: handleProductsLoaded
           }),

           // Data Loader Modal
           showDataLoaderModal && React.createElement(window.Modals.DataLoaderModal, {
               key: 'data-loader-modal',
               show: showDataLoaderModal,
               onClose: () => setShowDataLoaderModal(false),
               onImportComplete: () => {
                   setShowDataLoaderModal(false);
                   // Refresh the page to show updated data
                   window.location.reload();
               }
           }),

           // Loyalty Results Modal
           showLoyaltyResultsModal && loyaltyResults && React.createElement('div', {
               key: 'loyalty-results-modal',
               className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
           }, [
               React.createElement('div', {
                   key: 'modal-content',
                   className: 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden'
               }, [
                   // Modal Header
                   React.createElement('div', {
                       key: 'modal-header',
                       className: 'flex items-center justify-between p-6 border-b dark:border-gray-700'
                   }, [
                       React.createElement('div', {
                           key: 'header-content',
                           className: 'flex items-center gap-3'
                       }, [
                           React.createElement('div', {
                               key: 'icon',
                               className: 'w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center'
                           }, [
                               React.createElement('span', { key: 'icon-text', className: 'text-orange-600 dark:text-orange-400 text-lg' }, '🎯')
                           ]),
                           React.createElement('h2', {
                               key: 'title',
                               className: 'text-xl font-bold text-gray-900 dark:text-white'
                           }, 'Loyalty Sync Results')
                       ]),
                       React.createElement('button', {
                           key: 'close-btn',
                           onClick: () => setShowLoyaltyResultsModal(false),
                           className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                       }, [
                           React.createElement('span', { key: 'close-icon', className: 'text-2xl' }, '×')
                       ])
                   ]),

                   // Modal Body
                   React.createElement('div', {
                       key: 'modal-body',
                       className: 'p-6 space-y-6 max-h-[60vh] overflow-y-auto'
                   }, [
                       // Summary
                       React.createElement('div', {
                           key: 'summary-section',
                           className: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'
                       }, [
                           React.createElement('h3', {
                               key: 'summary-title',
                               className: 'font-semibold text-blue-900 dark:text-blue-100 mb-2'
                           }, 'Summary'),
                           React.createElement('p', {
                               key: 'summary-text',
                               className: 'text-blue-800 dark:text-blue-200 whitespace-pre-line'
                           }, loyaltyResults.summary || 'No summary available')
                       ]),

                       // Statistics
                       React.createElement('div', {
                           key: 'statistics-section',
                           className: 'grid grid-cols-2 md:grid-cols-4 gap-4'
                       }, [
                           React.createElement('div', {
                               key: 'total-processed',
                               className: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center'
                           }, [
                               React.createElement('div', {
                                   key: 'total-number',
                                   className: 'text-2xl font-bold text-gray-900 dark:text-white'
                               }, loyaltyResults.statistics?.totalProcessed || 0),
                               React.createElement('div', {
                                   key: 'total-label',
                                   className: 'text-sm text-gray-600 dark:text-gray-400'
                               }, 'Total Processed')
                           ]),
                           React.createElement('div', {
                               key: 'created',
                               className: 'bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center'
                           }, [
                               React.createElement('div', {
                                   key: 'created-number',
                                   className: 'text-2xl font-bold text-green-600 dark:text-green-400'
                               }, loyaltyResults.statistics?.created || 0),
                               React.createElement('div', {
                                   key: 'created-label',
                                   className: 'text-sm text-gray-600 dark:text-gray-400'
                               }, 'Created')
                           ]),
                           React.createElement('div', {
                               key: 'updated',
                               className: 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center'
                           }, [
                               React.createElement('div', {
                                   key: 'updated-number',
                                   className: 'text-2xl font-bold text-blue-600 dark:text-blue-400'
                               }, loyaltyResults.statistics?.updated || 0),
                               React.createElement('div', {
                                   key: 'updated-label',
                                   className: 'text-sm text-gray-600 dark:text-gray-400'
                               }, 'Updated')
                           ]),
                           React.createElement('div', {
                               key: 'failed',
                               className: 'bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center'
                           }, [
                               React.createElement('div', {
                                   key: 'failed-number',
                                   className: 'text-2xl font-bold text-red-600 dark:text-red-400'
                               }, loyaltyResults.statistics?.failed || 0),
                               React.createElement('div', {
                                   key: 'failed-label',
                                   className: 'text-sm text-gray-600 dark:text-gray-400'
                               }, 'Failed')
                           ])
                       ]),

                       // Failures (if any)
                       loyaltyResults.failures && loyaltyResults.failures.length > 0 && React.createElement('div', {
                           key: 'failures-section',
                           className: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'
                       }, [
                           React.createElement('h3', {
                               key: 'failures-title',
                               className: 'font-semibold text-red-900 dark:text-red-100 mb-3'
                           }, 'Failures'),
                           React.createElement('div', {
                               key: 'failures-list',
                               className: 'space-y-2 max-h-40 overflow-y-auto'
                           }, loyaltyResults.failures.map((failure, index) => 
                               React.createElement('div', {
                                   key: `failure-${index}`,
                                   className: 'bg-white dark:bg-gray-800 rounded p-3 border border-red-200 dark:border-red-700'
                               }, [
                                   React.createElement('div', {
                                       key: 'failure-product',
                                       className: 'font-medium text-gray-900 dark:text-white'
                                   }, failure.product_name || 'Unknown Product'),
                                   React.createElement('div', {
                                       key: 'failure-error',
                                       className: 'text-sm text-red-600 dark:text-red-400 mt-1'
                                   }, failure.error || 'Unknown error')
                               ])
                           ))
                       ])
                   ]),

                   // Modal Footer
                   React.createElement('div', {
                       key: 'modal-footer',
                       className: 'flex justify-end p-6 border-t dark:border-gray-700'
                   }, [
                       React.createElement('button', {
                           key: 'close-button',
                           onClick: () => setShowLoyaltyResultsModal(false),
                           className: 'px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors'
                       }, 'Close')
                   ])
               ])
           ])
       ]);
    };