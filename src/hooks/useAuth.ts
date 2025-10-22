// src/hooks/useAuth.ts

// Definisikan tipe data yang akan dikembalikan oleh hook
interface AuthState {
  isAuthenticated: boolean;
  role: 'admin' | 'petugas' | 'masyarakat' | null;
}

export const useAuth = (): AuthState => {
  const user: AuthState = {
    isAuthenticated: true,
    role: 'admin', // Ganti dengan 'petugas', 'masyarakat', atau null
  };

  return user;
};