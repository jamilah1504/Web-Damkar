import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from '@mui/material';
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useState } from 'react'; // 1. Impor useState dan useEffect

// Definisikan tipe data untuk user
interface User {
  name: string;
  // Anda bisa menambahkan properti lain seperti email, role, dll.
}

interface TopbarProps {
  onDrawerToggle: () => void;
  // Props 'user' dan 'onLogout' tidak lagi dibutuhkan di sini
}

const Topbar: React.FC<TopbarProps> = ({ onDrawerToggle }) => {
  // 2. Buat state untuk menampung data user
  const [user, setUser] = useState<User | null>(null);

  // 3. Gunakan useEffect untuk mengambil data dari localStorage saat komponen dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // Ambil data string dari localStorage
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Ubah string JSON menjadi objek dan simpan di state
    }
  }, []); // Array kosong [] berarti efek ini hanya berjalan sekali saat komponen mount

  // 4. Buat fungsi handleLogout di dalam komponen
  const handleLogout = () => {
    localStorage.removeItem('user'); // Hapus data dari localStorage
    setUser(null); // Set state user menjadi null
    window.location.href = '/auth/login'; // Arahkan kembali ke halaman login
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#d32f2f',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 10 } }}>
        {/* Sisi Kiri: Logo dan Judul */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <img src={'/logo2.png'} alt="Logo Damkar" style={{ height: '70px', width: '80px' }} />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              Pemadam Kebakaran
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.2, display: { xs: 'none', sm: 'block' } }}>
              Kabupaten Subang
            </Typography>
          </Box>
        </Box>

        {/* Sisi Kanan: Navigasi */}
        <Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button startIcon={<Home />} sx={{ color: 'white', textTransform: 'none' }}>Home</Button>
            
            {user && (
              <>
                <Button startIcon={<Clock />} sx={{ color: 'white', textTransform: 'none' }}>History</Button>
                <Button startIcon={<Bell />} sx={{ color: 'white', textTransform: 'none' }}>Notification</Button>
              </>
            )}

            {/* Logika kondisional sekarang menggunakan state internal 'user' */}
            {user ? (
              // Tombol Logout jika user ada
              <Button 
                variant="contained" 
                startIcon={<LogOut size={18} />}
                onClick={handleLogout} // 5. Panggil fungsi handleLogout internal
                sx={{ 
                  bgcolor: 'white', 
                  color: '#d32f2f', 
                  borderRadius: 4,
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
              >
                Logout ({user.name}) {/* Tampilkan nama user */}
              </Button>
            ) : (
              // Tombol Login jika user tidak ada
              <Button 
                variant="contained"
                startIcon={<LogIn size={18} />}
                onClick={() => { window.location.href = '/auth/login'; }}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#d32f2f', 
                  borderRadius: 4,
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
              >
                Login
              </Button>
            )}
          </Box>

          <IconButton
            color="inherit"
            edge="end"
            onClick={onDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;