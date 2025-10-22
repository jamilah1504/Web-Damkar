// src/services/authService.js

import api from '../api'; // Impor instance Axios yang sudah kita konfigurasi

// Fungsi untuk registrasi
const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        
        // Jika registrasi berhasil dan ada token di response
        if (response.data.token) {
            // Simpan data user (termasuk token) ke Local Storage
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        
        return response.data;
    } catch (error) {
        // Lemparkan error agar bisa ditangkap di komponen
        throw error;
    }
};

// Fungsi untuk login
const login = async (userData) => {
    try {
        const response = await api.post('/auth/login', userData);
        
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fungsi untuk logout
const logout = () => {
    // Hapus data user dari Local Storage
    localStorage.removeItem('user');
};

const authService = {
    register,
    login,
    logout,
};

export default authService;