/**
 * apiService.js
 * Centralized service for API communication.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generate Basic Auth header
const getAuthHeaders = () => {
    const user = import.meta.env.VITE_ADMIN_USER;
    const pass = import.meta.env.VITE_ADMIN_PASS;
    const credentials = btoa(`${user}:${pass}`);
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
    };
};

export const mueblesService = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/muebles`);
        if (!response.ok) throw new Error('Failed to fetch furniture');
        return response.json();
    },

    create: async (mueble) => {
        const response = await fetch(`${BASE_URL}/muebles`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(mueble)
        });
        return response.ok;
    },

    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/muebles/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.ok;
    }
};