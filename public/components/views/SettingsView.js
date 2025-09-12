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

        // MuleSoft Loyalty Sync Functions
        const loadMulesoftConfig = async () => {
            try {
                const settings = await window.API.call('/system-settings');
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

        const saveMulesoftSetting = async (key, value) => {
            try {
                const existingSetting = systemSettings.find(s => s.setting_key === key);
                const method = existingSetting ? 'PUT' : 'POST';
                const url = existingSetting ? `/system-settings/${key}` : '/system-settings';
                
                const settingData = {
                    setting_key: key,
                    setting_value: value,
                    description: getSettingDescription(key),
                    category: 'integration',
                    setting_type: 'text'
                };
                
                await window.API.call(url, {
                    method,
                    body: JSON.stringify(settingData)
                });
                
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
            await saveMulesoftSetting('journal_subtype_id', '');
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

#Salesforce configurations
sfdc.url=http://login.salesforce.com/
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

#Salesforce configurations
sfdc.url=http://login.salesforce.com/
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
                                React.createElement('label', {
                                    key: 'logo-upload-label',
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
           ])
       ]);
    };