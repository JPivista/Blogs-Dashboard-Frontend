import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API || 'http://localhost:7010/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// SEO Metadata API functions
export const seoMetadataAPI = {
    // Create new SEO metadata
    create: async (formData) => {
        try {
            const response = await api.post('/seo-metadata', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all SEO metadata with pagination and search
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/seo-metadata', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get SEO metadata by page identifier
    getByPage: async (pageIdentifier) => {
        try {
            const response = await api.get(`/seo-metadata/page/${pageIdentifier}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get SEO metadata by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/seo-metadata/id/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update SEO metadata
    update: async (id, formData) => {
        try {
            const response = await api.put(`/seo-metadata/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete SEO metadata
    delete: async (id) => {
        try {
            const response = await api.delete(`/seo-metadata/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Bulk update SEO metadata
    bulkUpdate: async (updates) => {
        try {
            const response = await api.put('/seo-metadata/bulk/update', { updates });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default seoMetadataAPI;
