import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from '@mui/material';
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';

import paths, { rootPaths } from '../../routes/paths';

interface User {
  name: string;
  role:string;
}

interface TopbarProps {
  onDrawerToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onDrawerToggle }) => {
  const [user, setUser] = useState<User | null>(null);

  const homePath = user
    ? (user.role.toLowerCase() === 'admin'
      ? `/${rootPaths.adminRoot}/${paths.adminDashboard}` // 1. Jika user = admin
      : (user.role.toLowerCase() === 'masyarakat'
        ? `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}` // 2. Jika user = masyarakat
        : `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`)) // 3. Fallback untuk role lain (misal: petugas)
    : paths.landing; // 4. Jika tidak login

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    window.location.href = '/auth/login';
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
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.2, display: { xs: 'none', sm: 'block' } }}
            >
              Kabupaten Subang
            </Typography>
          </Box>
        </Box>

        {/* Sisi Kanan: Navigasi */}
        <Box>
          {/* --- Desktop Nav --- */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            
            {/* --- PERBAIKAN BUG: Tombol Home dipindah ke luar conditional 'user' --- */}

            {user && (
              <>
                {/* Tombol Home sebelumnya ada di sini (ini bug) */}
                <Button
                  component={RouterLink}
                  to={homePath} // Menggunakan homePath dinamis
                  startIcon={<Home />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Home
                </Button>
                
                {/* --- Tombol History --- */}
                <Button
                  component={RouterLink}
                  to={`/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`}
                  startIcon={<Clock />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  History
                </Button>

                {/* --- Tombol Notifikasi --- */}
                <Button
                  component={RouterLink}
                  to="#!"
                  startIcon={<Bell />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Notification
                </Button>
              </>
            )}

            {/* --- Tombol Login/Logout Desktop --- */}
            {user ? (
              <Button
                variant="contained"
                startIcon={<LogOut size={18} />}
                onClick={handleLogout}
                sx={{
                  bgcolor: 'white',
                  color: '#d32f2f',
                  borderRadius: 4,
                  '&:hover': { bgcolor: '#f0f0f0' },
                }}
              >
                Logout ({user.name})
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to={`/${rootPaths.authRoot}/${paths.login}`}
                variant="contained"
                startIcon={<LogIn size={18} />}
                sx={{
                  bgcolor: 'white',
                  color: '#d32f2f',
                  borderRadius: 4,
                  '&:hover': { bgcolor: '#f0f0f0' },
                }}
              >
                Login
              </Button>
            )}
          </Box>
          {/* --- Akhir Desktop Nav --- */}


          {/* --- MODIFIKASI: Tampilan Mobile (Dinamis) --- */}
          {user ? (
            // Jika SUDAH LOGIN: Tampilkan Hamburger Menu
            <IconButton
              color="inherit"
              edge="end"
              onClick={onDrawerToggle}
              sx={{ display: { md: 'none' } }} // Hanya tampil di mobile
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Jika BELUM LOGIN: Tampilkan Tombol Login
            <Button
              component={RouterLink}
              to={`/${rootPaths.authRoot}/${paths.login}`}
              variant="contained"
              startIcon={<LogIn size={16} />} // Ikon sedikit lebih kecil
              sx={{
                display: { md: 'none' }, // Hanya tampil di mobile
                bgcolor: 'white',
                color: '#d32f2f',
                borderRadius: 4,
                '&:hover': { bgcolor: '#f0f0f0' },
                py: 1.5, // Padding vertikal lebih kecil
                px: 2.0, // Padding horizontal lebih kecil
                fontSize: '0.8rem', // Font lebih kecil
              }}
            >
              Login
            </Button>
          )}
          {/* --- Akhir Modifikasi Mobile --- */}

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;