// src/components/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // <-- Impor dari file .ts

// Definisikan tipe data untuk props komponen ini
interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'petugas' | 'masyarakat')[]; // `allowedRoles` adalah array of string (opsional)
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // 1. Periksa apakah user sudah login
  if (!isAuthenticated) {
    // Redirect ke halaman login jika belum, simpan lokasi halaman sebelumnya
    // agar bisa kembali setelah login berhasil.
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Periksa apakah peran user diizinkan
  // Jika props allowedRoles ada dan peran user (role) tidak ada di dalamnya
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect ke halaman "Unauthorized"
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Jika semua pemeriksaan lolos, tampilkan konten halaman
  return <Outlet />;
};

export default ProtectedRoute;