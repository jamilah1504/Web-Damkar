// src/api/axiosConfig.js

import axios from 'axios';

// Buat instance Axios dengan konfigurasi default
const api = axios.create({
    // Set base URL untuk semua request
    // Ganti 5000 dengan port backend Anda jika berbeda
    baseURL: 'http://localhost:5000/api' 
});

export default api;