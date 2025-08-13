window.Views = window.Views || {};

// --- Injected minimal SettingsView to fix React error #130 ---
window.Views.SettingsView = ({ userSettings = { theme_mode: 'light' }, locations = [], onSave = () => {} }) => {
    const [theme, setTheme] = React.useState(userSettings.theme_mode || 'light');
    const [locationId, setLocationId] = React.useState(userSettings.selected_location_id || null);

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return React.createElement('div', { className: 'p-6 max-w-3xl mx-auto' }, [
        React.createElement('h2', { key: 'h', className: 'text-2xl font-bold mb-4' }, 'System Settings'),
        React.createElement('div', { key: 'theme', className: 'mb-4' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Theme'),
            React.createElement('select', {
                value: theme,
                onChange: (e) => setTheme(e.target.value),
                className: 'px-3 py-2 border rounded-lg'
            }, [
                React.createElement('option', { key: 'light', value: 'light' }, 'Light'),
                React.createElement('option', { key: 'dark', value: 'dark' }, 'Dark')
            ])
        ]),
        React.createElement('div', { key: 'loc', className: 'mb-4' }, [
            React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Default Location'),
            React.createElement('select', {
                value: locationId || '',
                onChange: (e) => setLocationId(e.target.value ? Number(e.target.value) : null),
                className: 'px-3 py-2 border rounded-lg'
            }, [
                React.createElement('option', { key: 'none', value: '' }, 'Not set'),
                ...locations.map(l => React.createElement('option', { key: l.id, value: l.id }, l.name))
            ])
        ]),
        React.createElement('button', {
            key: 'save',
            className: 'px-4 py-2 bg-blue-600 text-white rounded-lg',
            onClick: () => onSave({ theme_mode: theme, selected_location_id: locationId })
        }, 'Save Settings')
    ]);
};
