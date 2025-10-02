// VoucherSelector Component
// Manages voucher selection and application logic

window.Components = window.Components || {};
window.Components.VoucherSelector = function({ 
    customer, 
    vouchers = [], 
    selectedVouchers = [], 
    onVoucherSelect, 
    onVoucherDeselect,
    onApplyVoucher,
    onRemoveVoucher,
    loading = false 
}) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterType, setFilterType] = React.useState('all');

    // Filter vouchers based on search and type
    const filteredVouchers = React.useMemo(() => {
        return vouchers.filter(voucher => {
            const matchesSearch = voucher.voucher_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                voucher.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = filterType === 'all' || voucher.voucher_type === filterType;
            
            return matchesSearch && matchesType;
        });
    }, [vouchers, searchTerm, filterType]);

    // Group vouchers by type
    const groupedVouchers = React.useMemo(() => {
        const groups = {
            Value: [],
            Discount: [],
            ProductSpecific: []
        };
        
        filteredVouchers.forEach(voucher => {
            if (groups[voucher.voucher_type]) {
                groups[voucher.voucher_type].push(voucher);
            }
        });
        
        return groups;
    }, [filteredVouchers]);

    // Handle voucher selection
    const handleVoucherSelect = (voucher) => {
        if (selectedVouchers.find(v => v.id === voucher.id)) {
            onVoucherDeselect?.(voucher);
        } else {
            onVoucherSelect?.(voucher);
        }
    };

    // Handle voucher application
    const handleApplyVoucher = (voucher) => {
        onApplyVoucher?.(voucher);
    };

    // Handle voucher removal
    const handleRemoveVoucher = (voucher) => {
        onRemoveVoucher?.(voucher);
    };

    // Check if voucher is already applied
    const isVoucherApplied = (voucher) => {
        return selectedVouchers.some(v => v.id === voucher.id);
    };

    // Get voucher type display name
    const getTypeDisplayName = (type) => {
        switch (type) {
            case 'Value': return 'Value Vouchers';
            case 'Discount': return 'Discount Vouchers';
            case 'ProductSpecific': return 'Product-Specific Vouchers';
            default: return type;
        }
    };

    // Get voucher type count
    const getTypeCount = (type) => {
        return groupedVouchers[type]?.length || 0;
    };

    return React.createElement('div', { className: 'voucher-selector' }, [
        // Header
        React.createElement('div', { key: 'header', className: 'mb-4' }, [
            React.createElement('h3', { 
                key: 'title', 
                className: 'text-lg font-semibold text-gray-900 dark:text-white mb-2' 
            }, 'Available Vouchers'),
            
            // Customer info
            customer && React.createElement('div', { 
                key: 'customer', 
                className: 'text-sm text-gray-600 dark:text-gray-400 mb-3' 
            }, `For: ${customer.name} (${customer.loyalty_number})`)
        ]),

        // Search and Filter Controls
        React.createElement('div', { key: 'controls', className: 'mb-4 space-y-2' }, [
            // Search Input
            React.createElement('div', { key: 'search', className: 'relative' }, [
                React.createElement('input', {
                    key: 'input',
                    type: 'text',
                    placeholder: 'Search vouchers...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    className: 'w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }),
                React.createElement('div', {
                    key: 'icon',
                    className: 'absolute left-3 top-2.5 text-gray-400'
                }, [
                    React.createElement('svg', {
                        key: 'search-icon',
                        className: 'w-5 h-5',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24'
                    }, [
                        React.createElement('path', {
                            key: 'path',
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        })
                    ])
                ])
            ]),

            // Type Filter
            React.createElement('div', { key: 'filter', className: 'flex space-x-2' }, [
                React.createElement('button', {
                    key: 'all',
                    onClick: () => setFilterType('all'),
                    className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filterType === 'all' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`
                }, `All (${vouchers.length})`),
                
                ...Object.keys(groupedVouchers).map(type => 
                    getTypeCount(type) > 0 && React.createElement('button', {
                        key: type,
                        onClick: () => setFilterType(type),
                        className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filterType === type 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`
                    }, `${getTypeDisplayName(type)} (${getTypeCount(type)})`)
                )
            ])
        ]),

        // Loading State
        loading && React.createElement('div', { 
            key: 'loading', 
            className: 'flex items-center justify-center py-8' 
        }, [
            React.createElement('div', { 
                key: 'spinner', 
                className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' 
            })
        ]),

        // No Vouchers State
        !loading && filteredVouchers.length === 0 && React.createElement('div', { 
            key: 'empty', 
            className: 'text-center py-8 text-gray-500 dark:text-gray-400' 
        }, [
            React.createElement('div', { key: 'icon', className: 'text-4xl mb-2' }, '🎫'),
            React.createElement('div', { key: 'message' }, 'No vouchers available')
        ]),

        // Voucher Groups
        !loading && filteredVouchers.length > 0 && React.createElement('div', { 
            key: 'vouchers', 
            className: 'space-y-6' 
        }, [
            ...Object.entries(groupedVouchers).map(([type, typeVouchers]) => 
                typeVouchers.length > 0 && React.createElement('div', { key: type }, [
                    // Type Header
                    React.createElement('div', { 
                        key: 'type-header', 
                        className: 'flex items-center justify-between mb-3' 
                    }, [
                        React.createElement('h4', { 
                            key: 'type-title', 
                            className: 'font-medium text-gray-900 dark:text-white' 
                        }, getTypeDisplayName(type)),
                        React.createElement('span', { 
                            key: 'type-count', 
                            className: 'text-sm text-gray-500 dark:text-gray-400' 
                        }, `${typeVouchers.length} available`)
                    ]),

                    // Voucher Cards
                    React.createElement('div', { 
                        key: 'voucher-cards', 
                        className: 'grid grid-cols-1 gap-3' 
                    }, typeVouchers.map(voucher => 
                        React.createElement('div', { key: voucher.id, className: 'relative' }, [
                            React.createElement(window.Components.VoucherCard, {
                                key: 'card',
                                voucher,
                                isSelected: isVoucherApplied(voucher),
                                onSelect: handleVoucherSelect,
                                onDeselect: handleVoucherSelect,
                                canSelect: true
                            }),
                            
                            // Action Buttons
                            React.createElement('div', { 
                                key: 'actions', 
                                className: 'absolute top-2 right-2 flex space-x-1' 
                            }, [
                                isVoucherApplied(voucher) ? 
                                    React.createElement('button', {
                                        key: 'remove',
                                        onClick: () => handleRemoveVoucher(voucher),
                                        className: 'px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                                    }, 'Remove') :
                                    React.createElement('button', {
                                        key: 'apply',
                                        onClick: () => handleApplyVoucher(voucher),
                                        className: 'px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
                                    }, 'Apply')
                            ])
                        ])
                    ))
                ])
            )
        ])
    ]);
};
