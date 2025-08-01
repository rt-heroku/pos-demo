// public/api.js - API functions
window.API = {
    BASE_URL: '/api',

    // Generic API call function
    call: async function(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },

    // Products
    products: {
        // Existing functions
        getAll: () => window.API.call('/products'),
        create: (product) => window.API.call('/products', {
            method: 'POST',
            body: JSON.stringify(product)
        }),
        update: (id, product) => window.API.call(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        }),
        delete: (id) => window.API.call(`/products/${id}`, {
            method: 'DELETE'
        }),

        // Enhanced functions
        getDetailed: () => window.API.call('/products/detailed'),
        getById: (id) => window.API.call(`/products/${id}/detailed`),
        createEnhanced: (product) => window.API.call('/products/enhanced', {
            method: 'POST',
            body: JSON.stringify(product)
        }),
        updateEnhanced: (id, product) => window.API.call(`/products/${id}/enhanced`, {
            method: 'PUT',
            body: JSON.stringify(product)
        }),
        getFilters: () => window.API.call('/products/filters'),
        search: (params) => {
            const queryString = new URLSearchParams(
                Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
            ).toString();
            return window.API.call(`/products/search?${queryString}`);
        },
        bulkUpdate: (productIds, updates) => window.API.call('/products/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({ productIds, updates })
        }),
        getLowStock: (threshold = 10) => window.API.call(`/products/low-stock?threshold=${threshold}`),
        duplicate: (id) => window.API.call(`/products/${id}/duplicate`, {
            method: 'POST'
        })
    },
    // Customers
    customers: {
        getAll: () => window.API.call('/customers'),
        getByLoyalty: (loyaltyNumber) => window.API.call(`/customers/loyalty/${loyaltyNumber}`),
        search: (query) => window.API.call(`/customers/search/${query}`),
        getHistory: (id) => window.API.call(`/customers/${id}/history`),
        create: (customer) => window.API.call('/customers', {
            method: 'POST',
            body: JSON.stringify(customer)
        })
    },

    // Loyalty
    loyalty: {
        getDetails: (loyaltyNumber) => window.API.call(`/loyalty/${loyaltyNumber}`),
        createCustomer: (customerData) => window.API.call('/loyalty/create', {
            method: 'POST',
            body: JSON.stringify(customerData)
        })
    },

    // Transactions
    transactions: {
        getAll: () => window.API.call('/transactions'),
        create: (transaction) => window.API.call('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction)
        })
    },

    // Analytics
    analytics: {
        get: () => window.API.call('/analytics')
    }
};