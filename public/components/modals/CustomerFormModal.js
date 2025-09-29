// Add/Edit Customer Modal
if (!window.Modals) {
    window.Modals = {};
}

window.Modals.CustomerFormModal = function CustomerFormModal({
    show,
    onClose,
    customer,
    onSave,
    loading
}) {
    if (!show) return null;

    const { X, User, Save } = window.Icons;

    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        loyalty_number: '',
        points: 0,
        notes: '',
        member_status: 'Active',
        member_type: 'Individual',
        enrollment_date: new Date().toISOString().split('T')[0],
        customer_tier: 'Bronze',
        date_of_birth: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        country: ''
    });

    const [errors, setErrors] = React.useState({});

    // Initialize form data when customer changes
    React.useEffect(() => {
        if (customer) {
            // Split existing name into first and last name if available
            const nameParts = (customer.name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            setFormData({
                first_name: customer.first_name || firstName,
                last_name: customer.last_name || lastName,
                email: customer.email || '',
                phone: customer.phone || '',
                loyalty_number: customer.loyalty_number || '',
                points: customer.points || 0,
                notes: customer.notes || '',
                member_status: customer.member_status || 'Active',
                member_type: customer.member_type || 'Individual',
                enrollment_date: customer.enrollment_date ? customer.enrollment_date.split('T')[0] : new Date().toISOString().split('T')[0],
                customer_tier: customer.customer_tier || 'Bronze',
                date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : ''
            });
        } else {
            // Reset form for new customer
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                loyalty_number: '',
                points: 0,
                notes: '',
                member_status: 'Active',
                member_type: 'Individual',
                enrollment_date: new Date().toISOString().split('T')[0],
                customer_tier: 'Bronze',
                date_of_birth: ''
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

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
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
            name: `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim(), // Combine first and last name
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
            className: 'bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'
        }, [
            // Header
            React.createElement('div', { key: 'header', className: 'px-6 py-4 border-b flex justify-between items-center' }, [
                React.createElement('h2', { key: 'header-container', className: 'text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2' }, [
                    React.createElement(User, { key: 'icon', size: 24 }),
                    customer ? 'Edit Customer' : 'Add New Customer'
                ]),
                React.createElement('button', {
                    key: 'close-button',
                    onClick: onClose,
                    className: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                }, React.createElement(X, { key: 'close-icon', size: 24 }))
            ]),

            // Form Content
            React.createElement('div', { key: 'content', className: 'p-6 space-y-6 overflow-y-auto flex-1' }, [
                // Basic Information
                React.createElement('div', { key: 'member-container', className: 'space-y-4' }, [
                    React.createElement('h3', { key: 'member-type-header', className: 'text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2' }, 'Member Type'),
                    
                    // Member Type
                    React.createElement('div', { key: 'member-type' }, [
                        React.createElement('label', { key: 'member-type-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Member Type'),
                        React.createElement('select', {
                            key: 'member-type-select',
                            value: formData.member_type,
                            onChange: (e) => handleInputChange('member_type', e.target.value),
                            className: 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                            disabled: !!customer // Don't allow changing member type for existing customers
                        }, [
                            React.createElement('option', { key: 'individual', value: 'Individual' }, 'Individual'),
                            React.createElement('option', { key: 'corporate', value: 'Corporate' }, 'Corporate')
                        ]),
                        customer && React.createElement('p', {
                            key: 'member-type-note',
                            className: 'text-gray-500 dark:text-gray-400 text-xs mt-1'
                        }, 'Member type cannot be changed after creation')
                    ])
                ]),

                // Member Information
                React.createElement('div', { key: 'member-info', className: 'space-y-4' }, [
                    React.createElement('h3', { key: 'member-info-header', className: 'text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2' },
                        'Member Information'
                    ),

                    React.createElement('div', { key: 'member-info-container', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // First Name
                        React.createElement('div', { key: 'first-name' }, [
                            React.createElement('label', { key: 'first-name-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'First Name *'),
                            React.createElement('input', {
                                key: 'first-name-input',
                                type: 'text',
                                value: formData.first_name,
                                onChange: (e) => handleInputChange('first_name', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`,
                                placeholder: 'Enter first name'
                            }),
                            errors.first_name && React.createElement('p', {
                                key: 'first-name-error',
                                className: 'text-red-500 text-sm mt-1'
                            }, errors.first_name)
                        ]),

                        // Last Name
                        React.createElement('div', { key: 'last-name' }, [
                            React.createElement('label', { key: 'last-name-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Last Name *'),
                            React.createElement('input', {
                                key: 'last-name-input',
                                type: 'text',
                                value: formData.last_name,
                                onChange: (e) => handleInputChange('last_name', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`,
                                placeholder: 'Enter last name'
                            }),
                            errors.last_name && React.createElement('p', {
                                key: 'last-name-error',
                                className: 'text-red-500 text-sm mt-1'
                            }, errors.last_name)
                        ]),

                        // Email
                        React.createElement('div', { key: 'email' }, [
                            React.createElement('label', { key: 'email-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Email Address'),
                            React.createElement('input', {
                                key: 'email-input',
                                type: 'email',
                                value: formData.email,
                                onChange: (e) => handleInputChange('email', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`,
                                placeholder: 'customer@example.com'
                            }),
                            errors.email && React.createElement('p', {
                                key: 'email-error',
                                className: 'text-red-500 text-sm mt-1'
                            }, errors.email)
                        ]),

                        // Phone
                        React.createElement('div', { key: 'phone' }, [
                            React.createElement('label', { key: 'phone-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Phone Number'),
                            React.createElement('input', {
                                key: 'phone-input',
                                type: 'tel',
                                value: formData.phone,
                                onChange: (e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    handleInputChange('phone', formatted);
                                },
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`,
                                placeholder: '(555) 123-4567'
                            }),
                            errors.phone && React.createElement('p', {
                                key: 'phone-error',
                                className: 'text-red-500 text-sm mt-1'
                            }, errors.phone)
                        ]),

                        // Date of Birth
                        React.createElement('div', { key: 'date-of-birth' }, [
                            React.createElement('label', { key: 'date-of-birth-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Date of Birth'),
                            React.createElement('input', {
                                key: 'date-of-birth-input',
                                type: 'date',
                                value: formData.date_of_birth,
                                onChange: (e) => handleInputChange('date_of_birth', e.target.value),
                                max: new Date().toISOString().split('T')[0], // Can't be future date
                                className: 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }),
                            React.createElement('p', {
                                key: 'date-of-birth-note',
                                className: 'text-gray-500 dark:text-gray-400 text-xs mt-1'
                            }, 'Optional - used for birthday promotions')
                        ]),

                        // Loyalty Number (only for new customers or display for existing)
                        React.createElement('div', { key: 'loyalty' }, [
                            React.createElement('label', { key: 'loyalty-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Loyalty Number'),
                            React.createElement('input', {
                                key: 'loyalty-input',
                                type: 'text',
                                value: formData.loyalty_number,
                                onChange: (e) => handleInputChange('loyalty_number', e.target.value.toUpperCase()),
                                disabled: !!customer, // Disable editing for existing customers
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.loyalty_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    } ${customer ? 'bg-gray-100 dark:bg-gray-600' : ''}`,
                                placeholder: customer ? 'Auto-assigned' : 'LOY001 (optional - auto-generated if empty)'
                            }),
                            errors.loyalty_number && React.createElement('p', {
                                key: 'loyalty-error',
                                className: 'text-red-500 text-sm mt-1'
                            }, errors.loyalty_number),
                            !customer && React.createElement('p', {
                                key: 'loyalty-note',
                                className: 'text-gray-500 dark:text-gray-400 text-xs mt-1'
                            }, 'Leave empty to auto-generate loyalty number')
                        ])
                    ])
                ]),

                React.createElement('div', { key: 'member-info-container', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                    // Member Status
                    React.createElement('div', { key: 'member-status' }, [
                        React.createElement('label', { key: 'member-status-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Member Status'),
                        React.createElement('select', {
                            key: 'member-status-select',
                            value: formData.member_status,
                            onChange: (e) => handleInputChange('member_status', e.target.value),
                            className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${formData.member_status === 'Active' ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' :
                                formData.member_status === 'Inactive' ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' :
                                    formData.member_status === 'Under Fraud Investigation' ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' :
                                        formData.member_status === 'Fraudulent Member' ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' :
                                            'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                }`
                        }, [
                            React.createElement('option', { key: 'active', value: 'Active' }, '✅ Active'),
                            React.createElement('option', { key: 'inactive', value: 'Inactive' }, '⏸️ Inactive'),
                            React.createElement('option', { key: 'fraud-investigation', value: 'Under Fraud Investigation' }, '⚠️ Under Fraud Investigation'),
                            React.createElement('option', { key: 'merged', value: 'Merged' }, '🔄 Merged'),
                            React.createElement('option', { key: 'fraudulent', value: 'Fraudulent Member' }, '🚨 Fraudulent Member')
                        ]),
                        React.createElement('p', {
                            key: 'member-status-note',
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
                        React.createElement('label', { key: 'enrollment-date-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Member Since'),
                        React.createElement('input', {
                            key: 'enrollment-date-input',
                            type: 'date',
                            value: formData.enrollment_date,
                            onChange: (e) => handleInputChange('enrollment_date', e.target.value),
                            max: new Date().toISOString().split('T')[0], // Can't be future date
                            className: 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }),
                        React.createElement('p', {
                            key: 'enrollment-date-note',
                            className: 'text-gray-500 dark:text-gray-400 text-xs mt-1'
                        }, 'Date when customer enrolled in loyalty program')
                    ]),

                    // Customer Tier (display with manual override option)
                    React.createElement('div', { key: 'customer-tier' }, [
                        React.createElement('label', { key: 'customer-tier-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Customer Tier'),
                        React.createElement('select', {
                            key: 'customer-tier-select',
                            value: formData.customer_tier,
                            onChange: (e) => handleInputChange('customer_tier', e.target.value),
                            className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.customer_tier === 'Bronze' ? 'border-amber-600 bg-amber-50' :
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
                            key: 'customer-tier-note',
                            className: 'text-gray-500 dark:text-gray-400 text-xs mt-1'
                        }, customer ? 'Tier is auto-calculated but can be manually overridden' : 'Initial tier - will be recalculated based on activity'),

                        // Show tier benefits
                        React.createElement('div', { key: 'benefits-container', className: 'mt-2 p-2 bg-gray-50 rounded text-xs' }, [
                            React.createElement('strong', { key: 'benefits-label' }, 'Tier Benefits: '),
                            React.createElement('span', { key: 'benefits-text' },
                                customer ? formData.customer_tier === 'Bronze' ? 'Basic loyalty benefits, 1x points earning' :
                                    formData.customer_tier === 'Silver' ? 'Enhanced benefits, 1.25x points earning, priority support' :
                                        formData.customer_tier === 'Gold' ? 'Premium benefits, 1.5x points earning, exclusive offers' :
                                            'VIP benefits, 2x points earning, personal concierge service' :
                                    'Basic loyalty benefits, 1x points earning'
                            )
                        ])
                    ])
                ]),
                // Loyalty Information (for editing existing customers)
                customer && React.createElement('div', { key: 'loyalty-info', className: 'space-y-4' }, [
                    React.createElement('h3', { key: 'loyalty-info-header', className: 'text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2' },
                        'Loyalty Information'
                    ),

                    React.createElement('div', { key: 'loyalty-info-container', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // Points (editable for adjustments)
                        React.createElement('div', { key: 'points' }, [
                            React.createElement('label', { key: 'points-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Points Balance'),
                            React.createElement('input', {
                                key: 'points-input',
                                type: 'number',
                                min: '0',
                                value: formData.points,
                                onChange: (e) => handleInputChange('points', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.points ? 'border-red-500' : 'border-gray-300'
                                    }`,
                                placeholder: '0'
                            }),
                            errors.points && React.createElement('p', {
                                key: 'points-error',
                                className: 'text-red-500 text-sm mt-1'
                            }, errors.points),
                            React.createElement('p', {
                                key: 'points-note',
                                className: 'text-gray-500 dark:text-gray-400 text-xs mt-1'
                            }, 'Adjust points balance if needed')
                        ]),

                        // Customer Stats (read-only display with enhanced info)
                        React.createElement('div', { key: 'stats', className: 'space-y-3' }, [
                            React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700 dark:text-gray-300' }, 'Total Spent: '),
                                React.createElement('span', { className: 'text-green-600 font-bold' },
                                    `${parseFloat(customer.total_spent || 0).toFixed(2)}`
                                )
                            ]),
                            React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700 dark:text-gray-300' }, 'Visit Count: '),
                                React.createElement('span', { className: 'text-blue-600 font-bold' },
                                    customer.visit_count || 0
                                )
                            ]),
                            customer.last_visit && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700 dark:text-gray-300' }, 'Last Visit: '),
                                React.createElement('span', { className: 'text-purple-600 font-bold' },
                                    new Date(customer.last_visit).toLocaleDateString()
                                )
                            ]),
                            customer.tier_calculation_number && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700 dark:text-gray-300' }, 'Tier Score: '),
                                React.createElement('span', { className: 'text-indigo-600 font-bold' },
                                    parseFloat(customer.tier_calculation_number).toFixed(2)
                                )
                            ]),
                            // Member duration
                            customer.enrollment_date && React.createElement('div', { className: 'text-sm' }, [
                                React.createElement('span', { className: 'font-medium text-gray-700 dark:text-gray-300' }, 'Member For: '),
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
                    ]),

                ]),

                // Address Information
                React.createElement('div', { key: 'address-info', className: 'space-y-4' }, [
                    React.createElement('h3', { key: 'address-header', className: 'text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2' },
                        'Address Information'
                    ),
                    React.createElement('div', { key: 'address-container', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                        // Address Line 1
                        React.createElement('div', { key: 'address-line1' }, [
                            React.createElement('label', { key: 'address-line1-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Address Line 1'),
                            React.createElement('input', {
                                key: 'address-line1-input',
                                type: 'text',
                                value: formData.address_line1,
                                onChange: (e) => handleInputChange('address_line1', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.address_line1 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
                            })
                        ]),
                        // Address Line 2
                        React.createElement('div', { key: 'address-line2' }, [
                            React.createElement('label', { key: 'address-line2-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Address Line 2'),
                            React.createElement('input', {
                                key: 'address-line2-input',
                                type: 'text',
                                value: formData.address_line2,
                                onChange: (e) => handleInputChange('address_line2', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.address_line2 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
                            })
                        ]),
                        // City
                        React.createElement('div', { key: 'city' }, [
                            React.createElement('label', { key: 'city-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'City'),
                            React.createElement('input', {
                                key: 'city-input',
                                type: 'text',
                                value: formData.city,
                                onChange: (e) => handleInputChange('city', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
                            })
                        ]),
                        // State
                        React.createElement('div', { key: 'state' }, [
                            React.createElement('label', { key: 'state-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'State/Province'),
                            React.createElement('input', {
                                key: 'state-input',
                                type: 'text',
                                value: formData.state,
                                onChange: (e) => handleInputChange('state', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
                            })
                        ]),
                        // ZIP Code
                        React.createElement('div', { key: 'zip-code' }, [
                            React.createElement('label', { key: 'zip-code-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'ZIP/Postal Code'),
                            React.createElement('input', {
                                key: 'zip-code-input',
                                type: 'text',
                                value: formData.zip_code,
                                onChange: (e) => handleInputChange('zip_code', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.zip_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
                            })
                        ]),
                        // Country
                        React.createElement('div', { key: 'country' }, [
                            React.createElement('label', { key: 'country-label', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, 'Country'),
                            React.createElement('input', {
                                key: 'country-input',
                                type: 'text',
                                value: formData.country,
                                onChange: (e) => handleInputChange('country', e.target.value),
                                className: `w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
                            })
                        ])
                    ])
                ]),

                // Notes
                React.createElement('div', { key: 'notes', className: 'space-y-4' }, [
                    React.createElement('h3', { key: 'notes-header', className: 'text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2' },
                        'Additional Notes'
                    ),
                    React.createElement('textarea', {
                        key: 'notes-textarea',
                        value: formData.notes,
                        onChange: (e) => handleInputChange('notes', e.target.value),
                        rows: 3,
                        className: 'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                        placeholder: 'Add any special notes about this customer...'
                    })
                ]),
            ]),

            // Footer
            React.createElement('div', { key: 'footer', className: 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex gap-3 justify-end' }, [
                React.createElement('button', {
                    key: 'cancel-button',
                    onClick: onClose,
                    disabled: loading,
                    className: 'px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
                }, 'Cancel'),
                React.createElement('button', {
                    key: 'save-button',
                    onClick: handleSave,
                    disabled: loading || !formData.first_name.trim() || !formData.last_name.trim(),
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
