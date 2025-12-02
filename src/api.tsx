// src/api/axiosConfig.js

import axios from 'axios';


// Buat instance Axios dengan konfigurasi default
const api = axios.create({
    // Set base URL untuk semua request
    // Ganti 5000 dengan port backend Anda jika berbeda
    baseURL: 'http://localhost:5000/api' 
});
const BASE_URL= 'http://localhost:5000' 


// Interceptor untuk menambahkan token authentication ke setiap request
api.interceptors.request.use(
    (config) => {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                if (user?.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api; {BASE_URL};