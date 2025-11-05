import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // 1. Impor Link dari React Router
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from '@mui/material';
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';

// 2. Impor definisi path Anda
import paths, { rootPaths } from '../../routes/paths';

// Definisikan tipe data untuk user
interface User {
  name: string;
}

interface TopbarProps {
  onDrawerToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onDrawerToggle }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Hapus data dari localStorage
    localStorage.removeItem('token'); // Hapus data dari localStorage
    localStorage.removeItem('role'); // Hapus data dari localStorage
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
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {/* --- PERBAIKAN 1: Tombol Home --- */}
            <Button
              component={RouterLink}
              to={paths.landing} // Mengarah ke "/"
              startIcon={<Home />}
              sx={{ color: 'white', textTransform: 'none' }}
            >
              Home
            </Button>

            {user && (
              <>
                {/* --- PERBAIKAN 2: Tombol History --- */}
                <Button
                  component={RouterLink}
                  // Mengarah ke rute yang menampilkan RiwayatLaporan.tsx
                  to={`/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`}
                  startIcon={<Clock />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  History
                </Button>

                {/* --- PERBAIKAN 3: Tombol Notifikasi (sementara) --- */}
                <Button
                  component={RouterLink}
                  to="#!" // Ganti "#!" dengan path notifikasi jika sudah ada
                  startIcon={<Bell />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Notification
                </Button>
              </>
            )}

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
              // --- PERBAIKAN 4: Tombol Login ---
              <Button
                component={RouterLink}
                to={`/${rootPaths.authRoot}/${paths.login}`} // Mengarah ke /auth/login
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
