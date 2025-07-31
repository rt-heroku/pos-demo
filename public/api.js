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