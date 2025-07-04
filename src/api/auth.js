import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API || '/api', // Use env variable in production
    withCredentials: true, // for cookies
});

export const loginUser = (email, password) =>
    API.post('/auth/login', { email, password });

export const getProfile = () => API.get('/auth/profile');

export const logoutUser = () => API.post('/auth/logout');
