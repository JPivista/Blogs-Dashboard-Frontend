import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API || '/api',
    withCredentials: true,
});

export const listBlogs = (params) => API.get('/blogs', { params });
export const getBlog = (idOrSlug) => API.get(`/blogs/${idOrSlug}`);
export const createBlog = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
        } else if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });
    return API.post('/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateBlog = (idOrSlug, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
        } else if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });
    return API.put(`/blogs/${idOrSlug}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteBlog = (idOrSlug) => API.delete(`/blogs/${idOrSlug}`); 