import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API || '/api',
    withCredentials: true,
});

export const getAllCategories = () => API.get('/categories');
export const getMainCategories = () => API.get('/categories/main');
export const getSubcategories = (parentId) => API.get(`/categories/subcategories/${parentId}`);
export const getCategoryById = (id) => API.get(`/categories/${id}`);
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const getCategoryBlogCounts = () => API.get('/categories/blog-counts');
export const getBlogsByCategory = (categoryId) => API.get(`/categories/${categoryId}/blogs`); 