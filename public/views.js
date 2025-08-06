// public/views.js - View components
window.Views = {
    // POS View Component
    POSView : ({ 
        products, 
        cart, 
        selectedCustomer, 
        searchTerm, 
        setSearchTerm, 
        selectedCategory, 
        setSelectedCategory, 
        categories,
        onAddToCart, 
        onUpdateQuantity, 
        onRemoveFromCart, 
        onClearCart,
        onShowLoyaltyModal,
        onLoadCustomerHistory,
        onRemoveCustomer,
        subtotal,
        tax,
        total,
        discount,
        discountAmount,
        setDiscountAmount,
        discountType,
        setDiscountType,
        paymentMethod,
        setPaymentMethod,
        amountReceived,
        setAmountReceived,
        change,
        onProcessPayment,
        loading
    }) => {
        const { ShoppingCart, Search, Users, Plus, Minus, X, CreditCard, DollarSign, Percent } = window.Icons;

        // Credit card validation state
        const [creditCardForm, setCreditCardForm] = React.useState({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: ''
        });
        const [cardValidation, setCardValidation] = React.useState({
            isValid: false,
            cardType: null,
            errors: {}
        });

        // Credit card validation functions
        const validateCreditCard = (cardNumber) => {
            // Remove spaces and non-digits
            const cleanNumber = cardNumber.replace(/\D/g, '');
            
            // Check if empty
            if (!cleanNumber) {
                return { isValid: false, cardType: null, error: 'Card number is required' };
            }

            // Luhn algorithm for credit card validation
            const luhnCheck = (num) => {
                let sum = 0;
                let isEven = false;
                
                for (let i = num.length - 1; i >= 0; i--) {
                    let digit = parseInt(num[i]);
                    
                    if (isEven) {
                        digit *= 2;
                        if (digit > 9) {
                            digit = digit.toString().split('').map(Number).reduce((a, b) => a + b, 0);
                        }
                    }
                    
                    sum += digit;
                    isEven = !isEven;
                }
                
                return sum % 10 === 0;
            };

            // Determine card type
            const getCardType = (number) => {
                const patterns = {
                    'Visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
                    'MasterCard': /^5[1-5][0-9]{14}$/,
                    'American Express': /^3[47][0-9]{13}$/,
                    'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/
                };

                for (const [type, pattern] of Object.entries(patterns)) {
                    if (pattern.test(number)) {
                        return type;
                    }
                }
                return null;
            };

            // Check length (13-19 digits for most cards)
            if (cleanNumber.length < 13 || cleanNumber.length > 19) {
                return { isValid: false, cardType: null, error: 'Invalid card number length' };
            }

            // Get card type
            const cardType = getCardType(cleanNumber);
            if (!cardType) {
                return { isValid: false, cardType: null, error: 'Unsupported card type' };
            }

            // Luhn check
            const isValid = luhnCheck(cleanNumber);
            if (!isValid) {
                return { isValid: false, cardType, error: 'Invalid card number' };
            }

            return { isValid: true, cardType, error: null };
        };

        const validateExpiryDate = (expiry) => {
            if (!expiry) return { isValid: false, error: 'Expiry date is required' };
            
            const match = expiry.match(/^(\d{2})\/(\d{2})$/);
            if (!match) return { isValid: false, error: 'Format: MM/YY' };
            
            const month = parseInt(match[1]);
            const year = 2000 + parseInt(match[2]);
            
            if (month < 1 || month > 12) {
                return { isValid: false, error: 'Invalid month' };
            }
            
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                return { isValid: false, error: 'Card expired' };
            }
            
            return { isValid: true, error: null };
        };

        const validateCVV = (cvv, cardType) => {
            if (!cvv) return { isValid: false, error: 'CVV is required' };
            
            const expectedLength = cardType === 'American Express' ? 4 : 3;
            if (cvv.length !== expectedLength) {
                return { isValid: false, error: `CVV must be ${expectedLength} digits` };
            }
            
            if (!/^\d+$/.test(cvv)) {
                return { isValid: false, error: 'CVV must be numeric' };
            }
            
            return { isValid: true, error: null };
        };

        // Handle credit card input changes
        const handleCreditCardChange = (field, value) => {
            let formattedValue = value;
            
            // Format card number with spaces
            if (field === 'cardNumber') {
                formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                if (formattedValue.length > 19) return; // Max length with spaces
            }
            
            // Format expiry date
            if (field === 'expiryDate') {
                formattedValue = value.replace(/\D/g, '');
                if (formattedValue.length >= 2) {
                    formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
                }
                if (formattedValue.length > 5) return;
            }
            
            // CVV - only numbers
            if (field === 'cvv') {
                formattedValue = value.replace(/\D/g, '');
                if (formattedValue.length > 4) return;
            }

            setCreditCardForm(prev => ({
                ...prev,
                [field]: formattedValue
            }));

            // Real-time validation
            if (field === 'cardNumber') {
                const validation = validateCreditCard(formattedValue);
                setCardValidation(prev => ({
                    ...prev,
                    isValid: validation.isValid,
                    cardType: validation.cardType,
                    errors: { ...prev.errors, cardNumber: validation.error }
                }));
            }
        };

        // Format card number for display (show only last 4 digits)
        const formatCardNumberForDisplay = (cardNumber) => {
            const cleanNumber = cardNumber.replace(/\D/g, '');
            if (cleanNumber.length < 4) return '';
            return '**** **** **** ' + cleanNumber.slice(-4);
        };

        // Helper function to get product image with priority order
        const getProductImage = (product) => {
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            if (primaryImage?.url) {
                return { type: 'url', src: primaryImage.url, alt: primaryImage.alt || product.name };
            }
            if (product.main_image_url) {
                return { type: 'url', src: product.main_image_url, alt: product.name };
            }
            return { type: 'emoji', src: product.image || '📦', alt: product.name };
        };

        // Enhanced ProductCard component
        const ProductCard = ({ product }) => {
            const productImage = getProductImage(product);
            const isOutOfStock = product.stock <= 0;
            
            return React.createElement('button', {
                onClick: () => onAddToCart(product),
                disabled: isOutOfStock,
                className: `p-4 rounded-lg border-2 transition-all duration-200 ${
                    isOutOfStock
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md active:scale-95 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`
            }, [
                React.createElement('div', { key: 'image-container', className: 'relative mb-3' }, [
                    React.createElement('div', { className: 'w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center' }, [
                        productImage.type === 'url' ? (
                            React.createElement('img', {
                                key: 'product-img',
                                src: productImage.src,
                                alt: productImage.alt,
                                className: 'w-full h-full object-cover',
                                onError: (e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            })
                        ) : null,
                        
                        React.createElement('div', { 
                            key: 'fallback',
                            className: 'w-full h-full flex items-center justify-center text-4xl',
                            style: { display: productImage.type === 'url' ? 'none' : 'flex' }
                        }, productImage.src)
                    ]),
                    
                    React.createElement('div', { 
                        key: 'stock-indicator',
                        className: `absolute top-1 right-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isOutOfStock 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : product.stock <= 5 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`
                    }, isOutOfStock ? 'Out' : product.stock <= 5 ? 'Low' : 'In Stock'),
                    
                    (product.brand || product.collection) && React.createElement('div', { 
                        key: 'brand-badge',
                        className: 'absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 max-w-full truncate'
                    }, product.brand || product.collection)
                ]),
                
                React.createElement('div', { key: 'info', className: 'text-center' }, [
                    React.createElement('div', { key: 'name', className: 'font-medium text-sm mb-1 line-clamp-2 dark:text-white' }, product.name),
                    React.createElement('div', { key: 'price', className: 'text-blue-600 dark:text-blue-400 font-bold text-lg' }, `$${parseFloat(product.price).toFixed(2)}`),
                    React.createElement('div', { key: 'stock', className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, `Stock: ${product.stock}`),
                    
                    React.createElement('div', { key: 'details', className: 'flex flex-wrap gap-1 justify-center mt-2' }, [
                        product.material && React.createElement('span', { 
                            key: 'material',
                            className: 'px-1 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded' 
                        }, product.material),
                        product.laptop_size && React.createElement('span', { 
                            key: 'laptop',
                            className: 'px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded' 
                        }, product.laptop_size)
                    ])
                ])
            ]);
        };

        return React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 h-full' }, [
            // Products Section
            React.createElement('div', { key: 'products', className: 'lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700' }, [
                React.createElement('div', { key: 'header', className: 'p-6 border-b dark:border-gray-700' }, [
                    React.createElement('div', { key: 'title', className: 'mb-4' }, [
                        React.createElement('h2', { className: 'text-xl font-bold dark:text-white' }, 'Products'),
                        React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 text-sm' }, `${products.length} products available`)
                    ]),
                    React.createElement('div', { key: 'controls', className: 'flex flex-col sm:flex-row gap-4' }, [
                        React.createElement('div', { key: 'search', className: 'relative flex-1' }, [
                            React.createElement(Search, { 
                                key: 'search-icon',
                                className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                                size: 20 
                            }),
                            React.createElement('input', {
                                key: 'search-input',
                                type: 'text',
                                placeholder: 'Search products...',
                                value: searchTerm,
                                onChange: (e) => setSearchTerm(e.target.value),
                                className: 'w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                            })
                        ]),
                        React.createElement('select', {
                            key: 'category-select',
                            value: selectedCategory,
                            onChange: (e) => setSelectedCategory(e.target.value),
                            className: 'px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                        }, categories.map(cat => 
                            React.createElement('option', { key: cat, value: cat }, cat)
                        ))
                    ])
                ]),
                React.createElement('div', { 
                    key: 'products-grid',
                    className: 'p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto' 
                }, products.map(product =>
                    React.createElement(ProductCard, { key: product.id, product })
                ))
            ]),

            // Enhanced Cart Section with Discount System
            React.createElement('div', { key: 'cart', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col' }, [
                React.createElement('div', { key: 'cart-header', className: 'p-6 border-b dark:border-gray-700' }, [
                    React.createElement('h2', { className: 'text-xl font-bold flex items-center gap-2 dark:text-white' }, [
                        React.createElement(ShoppingCart, { key: 'cart-icon', size: 24 }),
                        `Cart (${cart.length})`
                    ])
                ]),
                React.createElement('div', { key: 'cart-content', className: 'flex-1 p-6' }, [
                    // Enhanced customer info section
                    selectedCustomer ? (
                        React.createElement('div', { key: 'customer-info', className: 'mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg' }, [
                            React.createElement('div', { className: 'flex justify-between items-start' }, [
                                React.createElement('div', { key: 'customer-details' }, [
                                    React.createElement('div', { className: 'font-semibold text-green-800 dark:text-green-200 text-lg' }, selectedCustomer.name),
                                    React.createElement('div', { className: 'text-sm text-green-700 dark:text-green-300 font-mono' }, selectedCustomer.loyalty_number),
                                    React.createElement('div', { className: 'text-sm text-green-600 dark:text-green-400 flex items-center gap-1' }, [
                                        React.createElement('span', { key: 'points-icon' }, '⭐'),
                                        React.createElement('span', { key: 'points-text' }, `${selectedCustomer.points} points available`)
                                    ])
                                ]),
                                React.createElement('div', { key: 'customer-actions', className: 'flex gap-2' }, [
                                    React.createElement('button', {
                                        onClick: () => onLoadCustomerHistory(selectedCustomer.id),
                                        className: 'text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors'
                                    }, 'History'),
                                    React.createElement('button', {
                                        onClick: onRemoveCustomer,
                                        className: 'text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors'
                                    }, 'Remove')
                                ])
                            ])
                        ])
                    ) : (
                        React.createElement('button', {
                            key: 'add-customer-btn',
                            onClick: onShowLoyaltyModal,
                            className: 'mb-4 w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2'
                        }, [
                            React.createElement(Users, { key: 'users-icon', size: 20 }),
                            'Add Loyalty Customer'
                        ])
                    ),

                    // Enhanced cart items display
                    cart.length === 0 ? (
                        React.createElement('div', { className: 'text-center text-gray-400 py-12' }, [
                            React.createElement(ShoppingCart, { key: 'empty-icon', size: 64, className: 'mx-auto mb-4 opacity-30' }),
                            React.createElement('p', { key: 'empty-text', className: 'text-lg' }, 'Cart is empty'),
                            React.createElement('p', { key: 'empty-subtext', className: 'text-sm mt-2' }, 'Add products to get started')
                        ])
                    ) : (
                        React.createElement('div', { className: 'space-y-3 mb-6' }, cart.map(item => {
                            const itemImage = getProductImage(item);
                            return React.createElement('div', { 
                                key: item.id,
                                className: 'flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600' 
                            }, [
                                React.createElement('div', { key: 'item-image', className: 'w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0' }, [
                                    itemImage.type === 'url' ? (
                                        React.createElement('img', {
                                            key: 'img',
                                            src: itemImage.src,
                                            alt: itemImage.alt,
                                            className: 'w-full h-full object-cover',
                                            onError: (e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }
                                        })
                                    ) : null,
                                    React.createElement('div', { 
                                        key: 'fallback',
                                        className: 'w-full h-full flex items-center justify-center text-lg',
                                        style: { display: itemImage.type === 'url' ? 'none' : 'flex' }
                                    }, itemImage.src)
                                ]),
                                
                                React.createElement('div', { key: 'item-info', className: 'flex-1 min-w-0' }, [
                                    React.createElement('div', { className: 'font-medium truncate dark:text-white' }, item.name),
                                    React.createElement('div', { className: 'text-sm text-gray-600 dark:text-gray-400' }, `$${parseFloat(item.price).toFixed(2)} each`),
                                    (item.brand || item.material) && React.createElement('div', { className: 'text-xs text-gray-500 dark:text-gray-400' }, 
                                        [item.brand, item.material].filter(Boolean).join(' • ')
                                    )
                                ]),
                                
                                React.createElement('div', { key: 'item-controls', className: 'flex items-center gap-2' }, [
                                    React.createElement('button', {
                                        onClick: () => onUpdateQuantity(item.id, item.quantity - 1),
                                        className: 'w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors'
                                    }, React.createElement(Minus, { size: 16 })),
                                    React.createElement('span', { className: 'w-8 text-center font-medium dark:text-white' }, item.quantity),
                                    React.createElement('button', {
                                        onClick: () => onUpdateQuantity(item.id, item.quantity + 1),
                                        className: 'w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors'
                                    }, React.createElement(Plus, { size: 16 })),
                                    React.createElement('button', {
                                        onClick: () => onRemoveFromCart(item.id),
                                        className: 'w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 ml-2 transition-colors'
                                    }, React.createElement(X, { size: 16 }))
                                ])
                            ]);
                        }))
                    ),

                    cart.length > 0 && [
                        // Discount Section
                        React.createElement('div', { key: 'discount', className: 'border-t dark:border-gray-600 pt-4 mb-4' }, [
                            React.createElement('h4', { className: 'font-medium mb-3 dark:text-white flex items-center gap-2' }, [
                                React.createElement(Percent, { size: 18 }),
                                'Discount'
                            ]),
                            React.createElement('div', { className: 'grid grid-cols-3 gap-2 mb-2' }, [
                                React.createElement('select', {
                                    key: 'discount-type',
                                    value: discountType,
                                    onChange: (e) => setDiscountType(e.target.value),
                                    className: 'px-3 py-2 text-sm border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                }, [
                                    React.createElement('option', { key: 'fixed', value: 'fixed' }, '$'),
                                    React.createElement('option', { key: 'percentage', value: 'percentage' }, '%')
                                ]),
                                React.createElement('input', {
                                    key: 'discount-amount',
                                    type: 'number',
                                    step: discountType === 'percentage' ? '1' : '0.01',
                                    min: '0',
                                    max: discountType === 'percentage' ? '100' : undefined,
                                    value: discountAmount,
                                    onChange: (e) => setDiscountAmount(e.target.value),
                                    placeholder: discountType === 'percentage' ? '10' : '5.00',
                                    className: 'col-span-2 px-3 py-2 text-sm border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                })
                            ]),
                            discount > 0 && React.createElement('div', { className: 'text-sm text-green-600 dark:text-green-400 font-medium' }, 
                                `Discount Applied: -$${discount.toFixed(2)}`
                            )
                        ]),

                        // Totals Section
                        React.createElement('div', { key: 'totals', className: 'border-t dark:border-gray-600 pt-4 space-y-2 mb-6' }, [
                            React.createElement('div', { className: 'flex justify-between dark:text-white' }, [
                                React.createElement('span', { key: 'subtotal-label' }, 'Subtotal:'),
                                React.createElement('span', { key: 'subtotal-value' }, `$${(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}`)
                            ]),
                            discount > 0 && React.createElement('div', { className: 'flex justify-between text-green-600 dark:text-green-400' }, [
                                React.createElement('span', { key: 'discount-label' }, 'Discount:'),
                                React.createElement('span', { key: 'discount-value' }, `-${discount.toFixed(2)}`)
                            ]),
                            React.createElement('div', { className: 'flex justify-between dark:text-white' }, [
                                React.createElement('span', { key: 'tax-label' }, 'Tax:'),
                                React.createElement('span', { key: 'tax-value' }, `${tax.toFixed(2)}`)
                            ]),
                            React.createElement('div', { className: 'flex justify-between font-bold text-lg border-t dark:border-gray-600 pt-2 dark:text-white' }, [
                                React.createElement('span', { key: 'total-label' }, 'Total:'),
                                React.createElement('span', { key: 'total-value' }, `${total.toFixed(2)}`)
                            ]),
                            selectedCustomer && React.createElement('div', { className: 'flex justify-between text-green-600 dark:text-green-400 text-sm' }, [
                                React.createElement('span', { key: 'points-label' }, 'Points to earn:'),
                                React.createElement('span', { key: 'points-value' }, `+${Math.floor(total)} points`)
                            ])
                        ]),

                        // Enhanced Payment Section
                        React.createElement('div', { key: 'payment', className: 'space-y-4' }, [
                            React.createElement('div', { key: 'payment-method' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Payment Method'),
                                React.createElement('select', {
                                    value: paymentMethod,
                                    onChange: (e) => {
                                        setPaymentMethod(e.target.value);
                                        // Reset credit card form when switching away from card
                                        if (e.target.value !== 'card') {
                                            setCreditCardForm({
                                                cardNumber: '', expiryDate: '', cvv: '', cardholderName: ''
                                            });
                                            setCardValidation({
                                                isValid: false, cardType: null, errors: {}
                                            });
                                        }
                                    },
                                    className: 'w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                }, [
                                    React.createElement('option', { key: 'cash', value: 'cash' }, 'Cash'),
                                    React.createElement('option', { key: 'card', value: 'card' }, 'Credit/Debit Card'),
                                    React.createElement('option', { key: 'mobile', value: 'mobile' }, 'Mobile Payment')
                                ])
                            ]),

                            // Cash Payment
                            paymentMethod === 'cash' && React.createElement('div', { key: 'cash-payment' }, [
                                React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Amount Received'),
                                React.createElement('input', {
                                    type: 'number',
                                    step: '0.01',
                                    min: total.toFixed(2),
                                    value: amountReceived,
                                    onChange: (e) => setAmountReceived(e.target.value),
                                    placeholder: total.toFixed(2),
                                    className: 'w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                }),
                                amountReceived && parseFloat(amountReceived) >= total && React.createElement('div', {
                                    className: 'mt-2 text-green-600 dark:text-green-400 font-medium'
                                }, `Change: ${change.toFixed(2)}`)
                            ]),

                            // Credit Card Payment
                            paymentMethod === 'card' && React.createElement('div', { key: 'card-payment', className: 'space-y-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-1 gap-4' }, [
                                    // Cardholder Name
                                    React.createElement('div', { key: 'cardholder' }, [
                                        React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Cardholder Name'),
                                        React.createElement('input', {
                                            type: 'text',
                                            value: creditCardForm.cardholderName,
                                            onChange: (e) => handleCreditCardChange('cardholderName', e.target.value),
                                            placeholder: 'John Doe',
                                            className: 'w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                        })
                                    ]),

                                    // Card Number
                                    React.createElement('div', { key: 'card-number' }, [
                                        React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Card Number'),
                                        React.createElement('div', { className: 'relative' }, [
                                            React.createElement('input', {
                                                type: 'text',
                                                value: creditCardForm.cardNumber,
                                                onChange: (e) => handleCreditCardChange('cardNumber', e.target.value),
                                                placeholder: '1234 5678 9012 3456',
                                                className: `w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                                                    cardValidation.errors.cardNumber 
                                                        ? 'border-red-500 focus:ring-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                                }`
                                            }),
                                            // Card type indicator
                                            cardValidation.cardType && React.createElement('div', {
                                                className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-blue-600 dark:text-blue-400'
                                            }, cardValidation.cardType),
                                            React.createElement(CreditCard, {
                                                className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                                                size: 20
                                            })
                                        ]),
                                        cardValidation.errors.cardNumber && React.createElement('p', {
                                            className: 'text-sm text-red-500 mt-1'
                                        }, cardValidation.errors.cardNumber)
                                    ]),

                                    // Expiry and CVV
                                    React.createElement('div', { key: 'expiry-cvv', className: 'grid grid-cols-2 gap-4' }, [
                                        React.createElement('div', { key: 'expiry' }, [
                                            React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'Expiry Date'),
                                            React.createElement('input', {
                                                type: 'text',
                                                value: creditCardForm.expiryDate,
                                                onChange: (e) => handleCreditCardChange('expiryDate', e.target.value),
                                                placeholder: 'MM/YY',
                                                className: 'w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                            })
                                        ]),
                                        React.createElement('div', { key: 'cvv' }, [
                                            React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-white' }, 'CVV'),
                                            React.createElement('input', {
                                                type: 'text',
                                                value: creditCardForm.cvv,
                                                onChange: (e) => handleCreditCardChange('cvv', e.target.value),
                                                placeholder: '123',
                                                className: 'w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                                            })
                                        ])
                                    ])
                                ]),

                                // Card validation status
                                creditCardForm.cardNumber && React.createElement('div', { 
                                    className: `p-3 rounded-lg border ${
                                        cardValidation.isValid 
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                                    }`
                                }, [
                                    React.createElement('div', { className: 'flex items-center gap-2' }, [
                                        React.createElement('span', { className: 'font-medium' }, 
                                            cardValidation.isValid ? '✓ Card Valid' : '✗ Card Invalid'
                                        ),
                                        cardValidation.cardType && React.createElement('span', { className: 'text-sm' }, 
                                            `(${cardValidation.cardType})`
                                        )
                                    ]),
                                    creditCardForm.cardNumber && React.createElement('div', { className: 'text-sm mt-1' }, 
                                        formatCardNumberForDisplay(creditCardForm.cardNumber)
                                    )
                                ])
                            ]),

                            // Mobile Payment
                            paymentMethod === 'mobile' && React.createElement('div', { key: 'mobile-payment', className: 'p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg' }, [
                                React.createElement('p', { className: 'text-blue-800 dark:text-blue-200 text-sm' }, 
                                    'Customer will pay using mobile payment (Apple Pay, Google Pay, etc.)'
                                )
                            ]),

                            // Action Buttons
                            React.createElement('div', { key: 'action-buttons', className: 'flex gap-2 pt-4' }, [
                                React.createElement('button', {
                                    onClick: onClearCart,
                                    className: 'flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
                                }, 'Clear Cart'),
                                React.createElement('button', {
                                    onClick: onProcessPayment,
                                    disabled: loading || (
                                        paymentMethod === 'cash' && parseFloat(amountReceived) < total
                                    ) || (
                                        paymentMethod === 'card' && (!cardValidation.isValid || !creditCardForm.cardholderName.trim() || !creditCardForm.expiryDate || !creditCardForm.cvv)
                                    ),
                                    className: 'flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2'
                                }, [
                                    loading && React.createElement('div', { 
                                        className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-white' 
                                    }),
                                    React.createElement(paymentMethod === 'card' ? CreditCard : DollarSign, { size: 18 }),
                                    loading ? 'Processing...' : `Pay ${total.toFixed(2)}`
                                ])
                            ])
                        ])
                    ]
                ])
            ])
        ]);
    },

    // Loyalty View Component  
    LoyaltyView: ({ 
        loyaltyNumber, 
        setLoyaltyNumber, 
        onSearchByLoyalty, 
        loyaltySearchTerm, 
        setLoyaltySearchTerm, 
        customerSearchResults, 
        onLoadCustomerHistory, 
        loading 
    }) => {
        const { Award } = window.Icons;

        return React.createElement('div', { className: 'space-y-6' }, [
            React.createElement('div', { key: 'search-section', className: 'bg-white rounded-xl shadow-sm border p-6' }, [
                React.createElement('h2', { className: 'text-xl font-bold mb-4 flex items-center gap-2' }, [
                    React.createElement(Award, { key: 'icon', size: 24 }),
                    'Loyalty Customer Search'
                ]),
                
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
                    React.createElement('div', { key: 'loyalty-search' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Search by Loyalty Number'),
                        React.createElement('div', { className: 'flex gap-2' }, [
                            React.createElement('input', {
                                type: 'text',
                                value: loyaltyNumber,
                                onChange: (e) => setLoyaltyNumber(e.target.value.toUpperCase()),
                                placeholder: 'LOY001',
                                className: 'flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }),
                            React.createElement('button', {
                                onClick: () => onSearchByLoyalty(loyaltyNumber),
                                disabled: !loyaltyNumber.trim() || loading,
                                className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors'
                            }, loading ? 'Searching...' : 'Search')
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'name-search' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Search by Name/Email'),
                        React.createElement('input', {
                            type: 'text',
                            value: loyaltySearchTerm,
                            onChange: (e) => setLoyaltySearchTerm(e.target.value),
                            placeholder: 'Enter name or email',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ])
                ]),

                customerSearchResults.length > 0 && React.createElement('div', { key: 'search-results', className: 'mt-4' }, [
                    React.createElement('h3', { className: 'font-medium mb-2' }, 'Search Results'),
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, 
                        customerSearchResults.map(customer => 
                            React.createElement('div', { key: customer.id, className: 'p-4 border rounded-lg hover:bg-gray-50' }, [
                                React.createElement('div', { className: 'flex justify-between items-start mb-2' }, [
                                    React.createElement('div', { key: 'customer-info' }, [
                                        React.createElement('div', { className: 'font-medium' }, customer.name),
                                        React.createElement('div', { className: 'text-sm text-gray-600' }, customer.loyalty_number),
                                        React.createElement('div', { className: 'text-sm text-gray-600' }, customer.email || 'No email')
                                    ]),
                                    React.createElement('button', {
                                        key: 'view-history-btn',
                                        onClick: () => onLoadCustomerHistory(customer.id),
                                        className: 'text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200'
                                    }, 'View History')
                                ]),
                                React.createElement('div', { className: 'grid grid-cols-3 gap-4 text-sm' }, [
                                    React.createElement('div', { key: 'points', className: 'text-center' }, [
                                        React.createElement('div', { className: 'font-bold text-lg text-green-600' }, customer.points),
                                        React.createElement('div', { className: 'text-gray-600' }, 'Points')
                                    ]),
                                    React.createElement('div', { key: 'spent', className: 'text-center' }, [
                                        React.createElement('div', { className: 'font-bold text-lg text-blue-600' }, `${parseFloat(customer.total_spent || 0).toFixed(0)}`),
                                        React.createElement('div', { className: 'text-gray-600' }, 'Total Spent')
                                    ]),
                                    React.createElement('div', { key: 'visits', className: 'text-center' }, [
                                        React.createElement('div', { className: 'font-bold text-lg text-purple-600' }, customer.visit_count || 0),
                                        React.createElement('div', { className: 'text-gray-600' }, 'Visits')
                                    ])
                                ])
                            ])
                        )
                    )
                ])
            ])
        ]);
    },

    // Sales View Component
    SalesView: ({ analytics, transactions }) => {
        const { DollarSign, BarChart3, Receipt, Users } = window.Icons;

        return React.createElement('div', { className: 'space-y-6' }, [
            // Stats Cards
            React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-4 gap-6' }, [
                React.createElement('div', { key: 'today-sales', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, "Today's Sales"),
                            React.createElement('p', { className: 'text-2xl font-bold text-green-600' }, `${analytics.todaySales.toFixed(2)}`)
                        ]),
                        React.createElement(DollarSign, { key: 'icon', className: 'text-green-600', size: 32 })
                    ])
                ]),
                React.createElement('div', { key: 'total-sales', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Total Sales'),
                            React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, `${analytics.totalSales.toFixed(2)}`)
                        ]),
                        React.createElement(BarChart3, { key: 'icon', className: 'text-blue-600', size: 32 })
                    ])
                ]),
                React.createElement('div', { key: 'transactions', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Transactions'),
                            React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, analytics.transactionCount)
                        ]),
                        React.createElement(Receipt, { key: 'icon', className: 'text-purple-600', size: 32 })
                    ])
                ]),
                React.createElement('div', { key: 'customers', className: 'bg-white p-6 rounded-xl shadow-sm border' }, [
                    React.createElement('div', { className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'content' }, [
                            React.createElement('p', { className: 'text-gray-600 text-sm' }, 'Total Customers'),
                            React.createElement('p', { className: 'text-2xl font-bold text-indigo-600' }, analytics.totalCustomers)
                        ]),
                        React.createElement(Users, { key: 'icon', className: 'text-indigo-600', size: 32 })
                    ])
                ])
            ]),

            // Recent Transactions
            React.createElement('div', { key: 'transactions-table', className: 'bg-white rounded-xl shadow-sm border' }, [
                React.createElement('div', { key: 'header', className: 'p-6 border-b' }, [
                    React.createElement('h2', { className: 'text-xl font-bold' }, 'Recent Transactions')
                ]),
                React.createElement('div', { key: 'content', className: 'p-6' }, [
                    transactions.length === 0 ? (
                        React.createElement('p', { className: 'text-gray-500 text-center py-8' }, 'No transactions yet')
                    ) : (
                        React.createElement('div', { className: 'overflow-x-auto' }, [
                            React.createElement('table', { className: 'w-full' }, [
                                React.createElement('thead', { key: 'thead' }, [
                                    React.createElement('tr', { className: 'bg-gray-50' }, [
                                        React.createElement('th', { key: 'date', className: 'text-left p-3' }, 'Date'),
                                        React.createElement('th', { key: 'customer', className: 'text-left p-3' }, 'Customer'),
                                        React.createElement('th', { key: 'items', className: 'text-left p-3' }, 'Items'),
                                        React.createElement('th', { key: 'payment', className: 'text-left p-3' }, 'Payment'),
                                        React.createElement('th', { key: 'total', className: 'text-left p-3' }, 'Total')
                                    ])
                                ]),
                                React.createElement('tbody', { key: 'tbody' }, transactions.slice(0, 10).map(transaction =>
                                    React.createElement('tr', { key: transaction.id, className: 'hover:bg-gray-50' }, [
                                        React.createElement('td', { key: 'date', className: 'p-3 border-b' }, 
                                            new Date(transaction.created_at).toLocaleString()
                                        ),
                                        React.createElement('td', { key: 'customer', className: 'p-3 border-b' }, 
                                            transaction.customer_name ? 
                                                React.createElement('div', {}, [
                                                    React.createElement('div', { key: 'name', className: 'font-medium' }, transaction.customer_name),
                                                    React.createElement('div', { key: 'loyalty', className: 'text-xs text-gray-500' }, transaction.loyalty_number)
                                                ]) :
                                                React.createElement('span', { className: 'text-gray-400' }, 'Walk-in')
                                        ),
                                        React.createElement('td', { key: 'items', className: 'p-3 border-b' }, 
                                            transaction.items ? transaction.items.map(item => item.name).join(', ') : 'N/A'
                                        ),
                                        React.createElement('td', { key: 'payment', className: 'p-3 border-b capitalize' }, 
                                            transaction.payment_method
                                        ),
                                        React.createElement('td', { key: 'total', className: 'p-3 border-b font-medium' }, 
                                            `${parseFloat(transaction.total).toFixed(2)}`
                                        )
                                    ])
                                ))
                            ])
                        ])
                    )
                ])
            ])
        ]);
    },
    InventoryView : ({ 
        products, 
        filters, 
        loading, 
        onAddProduct, 
        onEditProduct, 
        onDeleteProduct, 
        onBulkUpdate,
        onDuplicateProduct,
        searchFilters, 
        onFilterChange,
        selectedProducts,
        onProductSelect,
        onSelectAll,
        showProductModal,
        onShowProductModal,
        onCloseProductModal,
        currentProduct,
        viewMode,
        onViewModeChange
    }) => {
        const { Package, Plus, Edit, Trash2, Search, Grid3X3, List, Copy, Settings, Filter, Eye } = window.Icons;

        const [localSearchTerm, setLocalSearchTerm] = React.useState('');
        const [showFilters, setShowFilters] = React.useState(false);
        const [showBulkActions, setShowBulkActions] = React.useState(false);
        const [sortBy, setSortBy] = React.useState('name');
        const [sortOrder, setSortOrder] = React.useState('asc');

        // Debounced search
        React.useEffect(() => {
            const timer = setTimeout(() => {
                onFilterChange({ ...searchFilters, q: localSearchTerm });
            }, 300);
            return () => clearTimeout(timer);
        }, [localSearchTerm]);

        const handleBulkAction = (action, updates) => {
            if (selectedProducts.length === 0) {
                alert('Please select products first');
                return;
            }
            
            switch (action) {
                case 'activate':
                    onBulkUpdate(selectedProducts, { isActive: true });
                    break;
                case 'deactivate':
                    onBulkUpdate(selectedProducts, { isActive: false });
                    break;
                case 'feature':
                    onBulkUpdate(selectedProducts, { featured: true });
                    break;
                case 'unfeature':
                    onBulkUpdate(selectedProducts, { featured: false });
                    break;
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
                        selectedProducts.forEach(id => onDeleteProduct(id));
                    }
                    break;
                default:
                    if (updates) {
                        onBulkUpdate(selectedProducts, updates);
                    }
            }
        };

        const getStockStatus = (stock) => {
            if (stock <= 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
            if (stock <= 5) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
            if (stock <= 10) return { status: 'medium', color: 'bg-orange-100 text-orange-800', text: 'Medium Stock' };
            return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
        };

        const sortProducts = (productsToSort) => {
            return [...productsToSort].sort((a, b) => {
                let aValue = a[sortBy];
                let bValue = b[sortBy];
                
                // Handle different data types
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                
                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        };

        const sortedProducts = sortProducts(products);

const ProductCard = ({ product }) => {
    const stockInfo = getStockStatus(product.stock);
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    
    // Priority order for images: 1) Primary image from images array, 2) main_image_url, 3) emoji fallback
    const getProductImage = () => {
        if (primaryImage?.url) {
            return { type: 'url', src: primaryImage.url, alt: primaryImage.alt || product.name };
        }
        if (product.main_image_url) {
            return { type: 'url', src: product.main_image_url, alt: product.name };
        }
        return { type: 'emoji', src: product.image || '📦', alt: product.name };
    };

    const productImage = getProductImage();
    
    return React.createElement('div', { 
        className: `bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden ${
            selectedProducts.includes(product.id) ? 'ring-2 ring-blue-500' : ''
        }` 
    }, [
        // Product Image
        React.createElement('div', { key: 'image', className: 'relative h-48 bg-gray-100 items-center justify-center' }, [
            // Show actual image if available centered
            productImage.type === 'url' ? (
                React.createElement('img', {
                    key: 'product-img',
                    src: productImage.src,
                    alt: productImage.alt,
                    className: 'h-full items-center justify-center object-cover',
                    onError: (e) => {
                        // If image fails to load, show emoji fallback
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }
                })
            ) : null,
            
            // Emoji fallback (only shown if no URL image or if URL image fails)
            React.createElement('div', { 
                key: 'fallback',
                className: 'w-full h-full flex items-center justify-center text-6xl',
                style: { display: productImage.type === 'url' ? 'none' : 'flex' }
            }, productImage.src),
            
            // Stock badge
            React.createElement('div', { 
                key: 'stock-badge',
                className: `absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}` 
            }, stockInfo.text),
            
            // Featured badge
            product.featured && React.createElement('div', { 
                key: 'featured-badge',
                className: 'absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800' 
            }, '⭐ Featured'),
            
            // Selection checkbox
            React.createElement('div', { key: 'checkbox', className: 'absolute bottom-2 left-2' }, [
                React.createElement('input', {
                    type: 'checkbox',
                    checked: selectedProducts.includes(product.id),
                    onChange: (e) => onProductSelect(product.id, e.target.checked),
                    className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                })
            ]),

            // Active/Inactive indicator
            !product.is_active && React.createElement('div', { 
                key: 'inactive-overlay',
                className: 'absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center' 
            }, [
                React.createElement('span', { 
                    className: 'text-white font-medium px-3 py-1 bg-gray-800 rounded' 
                }, 'Inactive')
            ])
        ]),
        
        // Product Info (rest remains the same)
        React.createElement('div', { key: 'info', className: 'p-4' }, [
            React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-2' }, [
                React.createElement('div', { key: 'title-section', className: 'flex-1 pr-2' }, [
                    React.createElement('h3', { className: 'font-semibold text-lg line-clamp-2 mb-1' }, product.name),
                    React.createElement('p', { className: 'text-sm text-gray-600 font-mono' }, product.sku),
                    product.brand && React.createElement('p', { className: 'text-sm text-blue-600 font-medium' }, 
                        `${product.brand}${product.collection ? ` • ${product.collection}` : ''}`
                    )
                ]),
                React.createElement('div', { key: 'quick-actions', className: 'flex flex-col gap-1' }, [
                    React.createElement('button', {
                        onClick: () => onEditProduct(product),
                        className: 'p-1 text-gray-400 hover:text-blue-600 transition-colors rounded',
                        title: 'Edit Product'
                    }, React.createElement(Edit, { size: 16 })),
                    React.createElement('button', {
                        onClick: () => onDuplicateProduct(product.id),
                        className: 'p-1 text-gray-400 hover:text-green-600 transition-colors rounded',
                        title: 'Duplicate Product'
                    }, React.createElement(Copy, { size: 16 })),
                    React.createElement('button', {
                        onClick: () => onDeleteProduct(product.id),
                        className: 'p-1 text-gray-400 hover:text-red-600 transition-colors rounded',
                        title: 'Delete Product'
                    }, React.createElement(Trash2, { size: 16 }))
                ])
            ]),
            
            React.createElement('div', { key: 'details', className: 'space-y-3' }, [
                React.createElement('div', { className: 'flex justify-between items-center' }, [
                    React.createElement('span', { className: 'text-2xl font-bold text-green-600' }, 
                        `$${parseFloat(product.price).toFixed(2)}`
                    ),
                    React.createElement('div', { className: 'text-right' }, [
                        React.createElement('div', { className: 'text-sm font-medium' }, 
                            `Stock: ${product.stock}`
                        ),
                        React.createElement('div', { className: 'text-xs text-gray-500' }, 
                            product.category
                        )
                    ])
                ]),
                
                product.description && React.createElement('p', { 
                    className: 'text-sm text-gray-600 line-clamp-2' 
                }, product.description),
                
                // Product attributes
                React.createElement('div', { className: 'flex flex-wrap gap-1' }, [
                    product.material && React.createElement('span', { 
                        key: 'material',
                        className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                    }, product.material),
                    product.color && React.createElement('span', { 
                        key: 'color',
                        className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                    }, product.color),
                    product.laptop_size && React.createElement('span', { 
                        key: 'laptop',
                        className: 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded' 
                    }, `💻 ${product.laptop_size}`),
                    product.gender && product.gender !== 'Unisex' && React.createElement('span', { 
                        key: 'gender',
                        className: 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded' 
                    }, product.gender)
                ]),
                
                // Features preview
                product.features && product.features.length > 0 && React.createElement('div', { 
                    className: 'text-xs text-gray-500 flex items-center gap-1' 
                }, [
                    React.createElement('span', { key: 'features-icon' }, '✨'),
                    React.createElement('span', { key: 'features-count' }, `${product.features.length} features`)
                ])
            ])
        ])
    ]);
};
const ProductRow = ({ product }) => {
    const stockInfo = getStockStatus(product.stock);
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    
    // Priority order for images: 1) Primary image from images array, 2) main_image_url, 3) emoji fallback
    const getProductImage = () => {
        if (primaryImage?.url) {
            return { type: 'url', src: primaryImage.url, alt: primaryImage.alt || product.name };
        }
        if (product.main_image_url) {
            return { type: 'url', src: product.main_image_url, alt: product.name };
        }
        return { type: 'emoji', src: product.image || '📦', alt: product.name };
    };

    const productImage = getProductImage();
    
    return React.createElement('tr', { 
        className: `hover:bg-gray-50 border-b transition-colors ${
            selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
        } ${!product.is_active ? 'opacity-60' : ''}` 
    }, [
        React.createElement('td', { key: 'select', className: 'p-4' }, [
            React.createElement('input', {
                type: 'checkbox',
                checked: selectedProducts.includes(product.id),
                onChange: (e) => onProductSelect(product.id, e.target.checked),
                className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
            })
        ]),
        React.createElement('td', { key: 'product', className: 'p-4' }, [
            React.createElement('div', { className: 'flex items-center gap-3' }, [
                React.createElement('div', { className: 'w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0' }, [
                    // Show actual image if available
                    productImage.type === 'url' ? (
                        React.createElement('img', {
                            key: 'product-img',
                            src: productImage.src,
                            alt: productImage.alt,
                            className: 'w-full h-full object-cover',
                            onError: (e) => {
                                // If image fails to load, show emoji fallback
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }
                        })
                    ) : null,
                    
                    // Emoji fallback
                    React.createElement('span', { 
                        key: 'fallback',
                        className: 'text-xl',
                        style: { display: productImage.type === 'url' ? 'none' : 'block' }
                    }, productImage.src)
                ]),
                React.createElement('div', { className: 'min-w-0 flex-1' }, [
                    React.createElement('div', { className: 'font-medium truncate' }, product.name),
                    React.createElement('div', { className: 'text-sm text-gray-600 font-mono' }, product.sku),
                    product.brand && React.createElement('div', { className: 'text-sm text-blue-600' }, 
                        `${product.brand}${product.collection ? ` • ${product.collection}` : ''}`
                    )
                ])
            ])
        ]),
        React.createElement('td', { key: 'category', className: 'p-4' }, [
            React.createElement('div', { className: 'text-sm' }, product.category),
            product.product_type && React.createElement('div', { className: 'text-xs text-gray-500' }, product.product_type)
        ]),
        React.createElement('td', { key: 'price', className: 'p-4 font-medium text-green-600' }, 
            `$${parseFloat(product.price).toFixed(2)}`
        ),
        React.createElement('td', { key: 'attributes', className: 'p-4' }, [
            React.createElement('div', { className: 'flex flex-wrap gap-1' }, [
                product.material && React.createElement('span', { 
                    key: 'material',
                    className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                }, product.material),
                product.color && React.createElement('span', { 
                    key: 'color',
                    className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded' 
                }, product.color)
            ])
        ]),

        React.createElement('td', { key: 'stock', className: 'p-4' }, [
            React.createElement('div', { className: 'flex items-center gap-2' }, [
                React.createElement('span', { className: `px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}` }, 
                    product.stock
                ),
                React.createElement('span', { className: 'text-xs text-gray-500' }, stockInfo.text)
            ])
        ]),

        React.createElement('td', { key: 'status', className: 'p-4' }, [
            React.createElement('div', { className: 'flex flex-wrap gap-1' }, [
                React.createElement('span', { 
                    className: `px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }` 
                }, product.is_active ? 'Active' : 'Inactive'),
                product.featured && React.createElement('span', { 
                    key: 'featured',
                    className: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800' 
                }, '⭐ Featured')
            ])
        ]),
        React.createElement('td', { key: 'actions', className: 'p-4' }, [
            React.createElement('div', { className: 'flex gap-1' }, [
                React.createElement('button', {
                    onClick: () => onEditProduct(product),
                    className: 'p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors',
                    title: 'Edit'
                }, React.createElement(Edit, { size: 16 })),
                React.createElement('button', {
                    onClick: () => onDuplicateProduct(product.id),
                    className: 'p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors',
                    title: 'Duplicate'
                }, React.createElement(Copy, { size: 16 })),
                React.createElement('button', {
                    onClick: () => onDeleteProduct(product.id),
                    className: 'p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors',
                    title: 'Delete'
                }, React.createElement(Trash2, { size: 16 }))
            ])
        ])
    ]);
};
        const EmptyState = () => React.createElement('div', { 
            className: 'bg-white rounded-xl shadow-sm border p-12 text-center' 
        }, [
            React.createElement(Package, { 
                key: 'icon',
                className: 'mx-auto mb-4 text-gray-400', 
                size: 64 
            }),
            React.createElement('h3', { 
                key: 'title',
                className: 'text-xl font-semibold text-gray-900 mb-2' 
            }, 'No products found'),
            React.createElement('p', { 
                key: 'description',
                className: 'text-gray-600 mb-6 max-w-md mx-auto' 
            }, Object.keys(searchFilters).length > 0 
                ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                : 'Get started by adding your first product to the inventory.'
            ),
            React.createElement('button', {
                key: 'action',
                onClick: onShowProductModal,
                className: 'inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            }, [
                React.createElement(Plus, { key: 'icon', size: 20 }),
                'Add Product'
            ])
        ]);

        return React.createElement('div', { className: 'space-y-6' }, [
            // Header with controls
            React.createElement('div', { key: 'header', className: 'bg-white rounded-xl shadow-sm border p-6' }, [
                React.createElement('div', { className: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6' }, [
                    React.createElement('div', { key: 'title-section' }, [
                        React.createElement('h2', { className: 'text-2xl font-bold flex items-center gap-3' }, [
                            React.createElement(Package, { key: 'icon', size: 28 }),
                            'Product Inventory'
                        ]),
                        React.createElement('p', { className: 'text-gray-600 mt-1' }, [
                            `${products.length} products`,
                            products.filter(p => p.stock <= 5).length > 0 && 
                                ` • ${products.filter(p => p.stock <= 5).length} low stock`,
                            products.filter(p => !p.is_active).length > 0 && 
                                ` • ${products.filter(p => !p.is_active).length} inactive`
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'actions', className: 'flex flex-wrap gap-3' }, [
                        React.createElement('button', {
                            onClick: onShowProductModal,
                            className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        }, [
                            React.createElement(Plus, { key: 'icon', size: 20 }),
                            'Add Product'
                        ]),
                        
                        React.createElement('button', {
                            onClick: () => setShowFilters(!showFilters),
                            className: `flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                            }`
                        }, [
                            React.createElement(Filter, { key: 'icon', size: 20 }),
                            'Filters',
                            Object.keys(searchFilters).length > 0 && React.createElement('span', {
                                className: 'bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'
                            }, Object.keys(searchFilters).length)
                        ]),
                        
                        selectedProducts.length > 0 && React.createElement('button', {
                            onClick: () => setShowBulkActions(!showBulkActions),
                            className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        }, [
                            React.createElement(Settings, { key: 'icon', size: 20 }),
                            `Bulk Actions (${selectedProducts.length})`
                        ])
                    ])
                ]),

                // Quick search and view controls
                React.createElement('div', { className: 'flex flex-col sm:flex-row gap-4 items-center' }, [
                    React.createElement('div', { key: 'search', className: 'relative flex-1' }, [
                        React.createElement(Search, { 
                            className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                            size: 20 
                        }),
                        React.createElement('input', {
                            type: 'text',
                            value: localSearchTerm,
                            onChange: (e) => setLocalSearchTerm(e.target.value),
                            placeholder: 'Search products by name, SKU, description...',
                            className: 'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),
                    
                    React.createElement('div', { key: 'sort', className: 'flex items-center gap-2' }, [
                        React.createElement('select', {
                            value: sortBy,
                            onChange: (e) => setSortBy(e.target.value),
                            className: 'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'name', value: 'name' }, 'Name'),
                            React.createElement('option', { key: 'price', value: 'price' }, 'Price'),
                            React.createElement('option', { key: 'stock', value: 'stock' }, 'Stock'),
                            React.createElement('option', { key: 'created', value: 'created_at' }, 'Date Added')
                        ]),
                        React.createElement('button', {
                            onClick: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
                            className: 'p-2 border rounded-lg hover:bg-gray-50 transition-colors',
                            title: `Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`
                        }, sortOrder === 'asc' ? '↑' : '↓')
                    ]),
                    
                    // View mode toggle
                    React.createElement('div', { key: 'view-toggle', className: 'flex border rounded-lg overflow-hidden' }, [
                        React.createElement('button', {
                            onClick: () => onViewModeChange('grid'),
                            className: `p-2 transition-colors ${
                                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                            }`,
                            title: 'Grid View'
                        }, React.createElement(Grid3X3, { size: 20 })),
                        React.createElement('button', {
                            onClick: () => onViewModeChange('list'),
                            className: `p-2 transition-colors ${
                                viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                            }`,
                            title: 'List View'
                        }, React.createElement(List, { size: 20 }))
                    ])
                ])
            ]),

            // Filters panel
            showFilters && React.createElement('div', { key: 'filters', className: 'bg-white rounded-xl shadow-sm border p-6' }, [
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4' }, [
                    // Brand filter
                    React.createElement('div', { key: 'brand' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Brand'),
                        React.createElement('select', {
                            value: searchFilters.brand || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, brand: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Brands'),
                            ...(filters.brands || []).map(brand => 
                                React.createElement('option', { key: brand, value: brand }, brand)
                            )
                        ])
                    ]),
                    
                    // Collection filter
                    React.createElement('div', { key: 'collection' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Collection'),
                        React.createElement('select', {
                            value: searchFilters.collection || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, collection: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Collections'),
                            ...(filters.collections || []).map(collection => 
                                React.createElement('option', { key: collection, value: collection }, collection)
                            )
                        ])
                    ]),
                    
                    // Product Type filter
                    React.createElement('div', { key: 'type' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Type'),
                        React.createElement('select', {
                            value: searchFilters.productType || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, productType: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Types'),
                            ...(filters.productTypes || []).map(type => 
                                React.createElement('option', { key: type, value: type }, type)
                            )
                        ])
                    ]),
                    
                    // Material filter
                    React.createElement('div', { key: 'material' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Material'),
                        React.createElement('select', {
                            value: searchFilters.material || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, material: e.target.value || undefined }),
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Materials'),
                            ...(filters.materials || []).map(material => 
                                React.createElement('option', { key: material, value: material }, material)
                            )
                        ])
                    ]),
                    
                    // Status filter
                    React.createElement('div', { key: 'status' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Status'),
                        React.createElement('select', {
                            value: (() => {
                                if (searchFilters.inStock === 'true') return 'in-stock';
                                if (searchFilters.featured === 'true') return 'featured';
                                return '';
                            })(),
                            onChange: (e) => {
                                const value = e.target.value;
                                const newFilters = { ...searchFilters };
                                delete newFilters.inStock;
                                delete newFilters.featured;
                                
                                if (value === 'in-stock') newFilters.inStock = 'true';
                                else if (value === 'featured') newFilters.featured = 'true';
                                
                                onFilterChange(newFilters);
                            },
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }, [
                            React.createElement('option', { key: 'all', value: '' }, 'All Products'),
                            React.createElement('option', { key: 'in-stock', value: 'in-stock' }, 'In Stock Only'),
                            React.createElement('option', { key: 'featured', value: 'featured' }, 'Featured Only')
                        ])
                    ])
                ]),
                
                // Price range filters
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mt-4' }, [
                    React.createElement('div', { key: 'min-price' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Min Price ($)'),
                        React.createElement('input', {
                            type: 'number',
                            step: '0.01',
                            min: '0',
                            value: searchFilters.minPrice || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, minPrice: e.target.value || undefined }),
                            placeholder: '0.00',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ]),
                    React.createElement('div', { key: 'max-price' }, [
                        React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Max Price ($)'),
                        React.createElement('input', {
                            type: 'number',
                            step: '0.01',
                            min: '0',
                            value: searchFilters.maxPrice || '',
                            onChange: (e) => onFilterChange({ ...searchFilters, maxPrice: e.target.value || undefined }),
                            placeholder: '999.99',
                            className: 'w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        })
                    ])
                ]),

                // Clear filters button
                Object.keys(searchFilters).length > 0 && React.createElement('div', { 
                    className: 'mt-4 pt-4 border-t flex justify-end' 
                }, [
                    React.createElement('button', {
                        onClick: () => onFilterChange({}),
                        className: 'px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
                    }, 'Clear All Filters')
                ])
            ]),

            // Bulk actions panel
            showBulkActions && selectedProducts.length > 0 && React.createElement('div', { 
                key: 'bulk-actions', 
                className: 'bg-white rounded-xl shadow-sm border p-6' 
            }, [
                React.createElement('div', { className: 'flex items-center justify-between mb-4' }, [
                    React.createElement('h3', { className: 'font-medium' }, `Bulk Actions (${selectedProducts.length} selected)`),
                    React.createElement('button', {
                        onClick: () => onSelectAll(false),
                        className: 'text-sm text-gray-500 hover:text-gray-700'
                    }, 'Clear Selection')
                ]),
                React.createElement('div', { className: 'flex flex-wrap gap-3' }, [
                    React.createElement('button', {
                        onClick: () => handleBulkAction('activate'),
                        className: 'px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors'
                    }, '✅ Activate'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('deactivate'),
                        className: 'px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors'
                    }, '⏸️ Deactivate'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('feature'),
                        className: 'px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
                    }, '⭐ Mark Featured'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('unfeature'),
                        className: 'px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors'
                    }, '⭐ Remove Featured'),
                    React.createElement('button', {
                        onClick: () => handleBulkAction('delete'),
                        className: 'px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors'
                    }, '🗑️ Delete Selected')
                ])
            ]),

            // Products display
            React.createElement('div', { key: 'products' }, [
                loading ? (
                    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border p-12 text-center' }, [
                        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' }),
                        React.createElement('p', { className: 'text-gray-600 text-lg' }, 'Loading products...'),
                        React.createElement('p', { className: 'text-gray-500 text-sm mt-2' }, 'Please wait while we fetch your inventory')
                    ])
                ) : sortedProducts.length === 0 ? (
                    React.createElement(EmptyState, { key: 'empty-state' })
                ) : viewMode === 'grid' ? (
                    // Grid view
                    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border' }, [
                        React.createElement('div', { className: 'p-6 border-b' }, [
                            React.createElement('div', { className: 'flex items-center justify-between mb-4' }, [
                                React.createElement('div', { className: 'flex items-center gap-4' }, [
                                    React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' }, [
                                        React.createElement('input', {
                                            type: 'checkbox',
                                            checked: selectedProducts.length === sortedProducts.length && sortedProducts.length > 0,
                                            onChange: (e) => onSelectAll(e.target.checked),
                                            className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                                        }),
                                        React.createElement('span', { className: 'text-sm font-medium' }, 'Select All')
                                    ])
                                ]),
                                React.createElement('div', { className: 'text-sm text-gray-600' }, 
                                    `Showing ${sortedProducts.length} products`
                                )
                            ])
                        ]),
                        React.createElement('div', { className: 'p-6' }, [
                            React.createElement('div', { 
                                className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
                            }, sortedProducts.map(product => 
                                React.createElement(ProductCard, { key: product.id, product })
                            ))
                        ])
                    ])
                ) : (
                    // List view
                    React.createElement('div', { className: 'bg-white rounded-xl shadow-sm border overflow-hidden' }, [
                        React.createElement('div', { className: 'overflow-x-auto' }, [
                            React.createElement('table', { className: 'w-full min-w-[800px]' }, [
                                React.createElement('thead', { key: 'thead', className: 'bg-gray-50 border-b' }, [
                                    React.createElement('tr', {}, [
                                        React.createElement('th', { key: 'select', className: 'p-4 text-left w-16' }, [
                                            React.createElement('input', {
                                                type: 'checkbox',
                                                checked: selectedProducts.length === sortedProducts.length && sortedProducts.length > 0,
                                                onChange: (e) => onSelectAll(e.target.checked),
                                                className: 'w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                                            })
                                        ]),
                                        React.createElement('th', { key: 'product', className: 'p-4 text-left font-medium text-gray-900' }, 'Product'),
                                        React.createElement('th', { key: 'category', className: 'p-4 text-left font-medium text-gray-900' }, 'Category'),
                                        React.createElement('th', { key: 'price', className: 'p-4 text-left font-medium text-gray-900' }, 'Price'),
                                        React.createElement('th', { key: 'attributes', className: 'p-4 text-left font-medium text-gray-900' }, 'Attributes'),
                                        React.createElement('th', { key: 'stock', className: 'p-4 text-left font-medium text-gray-900' }, 'Stock'),
                                        React.createElement('th', { key: 'status', className: 'p-4 text-left font-medium text-gray-900' }, 'Status'),
                                        React.createElement('th', { key: 'actions', className: 'p-4 text-left font-medium text-gray-900 w-32' }, 'Actions')
                                    ])
                                ]),
                                React.createElement('tbody', { key: 'tbody' }, 
                                    sortedProducts.map(product => React.createElement(ProductRow, { key: product.id, product }))
                                )
                            ])
                        ]),
                        React.createElement('div', { className: 'p-4 border-t bg-gray-50 text-center text-sm text-gray-600' }, 
                            `Showing ${sortedProducts.length} of ${products.length} products`
                        )
                    ])
                )
            ])
        ]);
    },

    // Settings View Component for Multi-Location POS System
    SettingsView : ({ 
        locations,
        selectedLocation,
        userSettings,
        onLocationChange,
        onCreateLocation,
        onUpdateLocation,
        onThemeToggle,
        onLogoUpload,
        loading
    }) => {
        const { Settings, Plus, Upload, Moon, Sun, MapPin, Edit, Save, X, Image } = window.Icons;
        
        const [showNewLocationModal, setShowNewLocationModal] = React.useState(false);
        const [editingLocation, setEditingLocation] = React.useState(null);
        const [isDarkMode, setIsDarkMode] = React.useState(userSettings?.theme_mode === 'dark');
        const [logoPreview, setLogoPreview] = React.useState(null);
        
        const [newLocationForm, setNewLocationForm] = React.useState({
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

        // Handle dark mode toggle
        const handleThemeToggle = () => {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            onThemeToggle(newMode ? 'dark' : 'light');
            
            // Apply theme to document
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

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                
                if (isForLocation) {
                    setNewLocationForm(prev => ({
                        ...prev,
                        logo_base64: base64
                    }));
                    setLogoPreview(base64);
                } else {
                    // Update current location logo
                    onLogoUpload(selectedLocation.id, base64);
                }
            };
            reader.readAsDataURL(file);
        };

        // Handle form input changes
        const handleInputChange = (field, value) => {
            setNewLocationForm(prev => ({
                ...prev,
                [field]: value
            }));
        };

        // Handle create new location
        const handleCreateLocation = () => {
            // Validate required fields
            const required = ['store_code', 'store_name', 'brand', 'address_line1', 'city', 'state', 'zip_code'];
            const missing = required.filter(field => !newLocationForm[field].trim());
            
            if (missing.length > 0) {
                alert(`Please fill in required fields: ${missing.join(', ')}`);
                return;
            }

            // Validate store code format
            if (!/^[A-Z0-9]{3,10}$/.test(newLocationForm.store_code)) {
                alert('Store code must be 3-10 uppercase letters and numbers');
                return;
            }

            // Validate tax rate
            const taxRate = parseFloat(newLocationForm.tax_rate);
            if (isNaN(taxRate) || taxRate < 0 || taxRate > 1) {
                alert('Tax rate must be a decimal between 0 and 1 (e.g., 0.08 for 8%)');
                return;
            }

            onCreateLocation(newLocationForm);
            setShowNewLocationModal(false);
            setNewLocationForm({
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
            setLogoPreview(null);
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
console.log('RT Views - Locations:');
console.dir(locations);
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
                            onClick: onClose,
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
                                    logoPreview || newLocationForm.logo_base64 ? 
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

                        // Basic information
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
                            onClick: onClose,
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
                            'Manage locations, preferences, and system settings'
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
                ])
            ]),

            // Location Management
            React.createElement('div', { key: 'locations', className: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6' }, [
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

            // Modals
            React.createElement(LocationFormModal, {
                key: 'new-location-modal',
                show: showNewLocationModal,
                onClose: () => {
                    setShowNewLocationModal(false);
                    setLogoPreview(null);
                    setNewLocationForm({
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
                },
                title: 'Create New Location'
            })
        ]);
    }
};
