import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Badge } from '@mui/material'; // 1. Tambah Badge
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';

import paths, { rootPaths } from '../../routes/paths';
interface User {
  name: string;
  role: string;
}

interface TopbarProps {
  onDrawerToggle: () => void;
  notifCount: number; // Tambahkan ini
}

const Topbar: React.FC<TopbarProps> = ({ onDrawerToggle, notifCount }) => { // Terima props
  const [user, setUser] = useState<User | null>(null);

  const homePath = user
    ? (user.role.toLowerCase() === 'admin'
      ? `/${rootPaths.adminRoot}/${paths.adminDashboard}`
      : (user.role.toLowerCase() === 'masyarakat'
        ? `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`
        : `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`))
    : paths.landing;

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
            
            {user && (
              <>
                <Button
                  component={RouterLink}
                  to={homePath}
                  startIcon={<Home />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Home
                </Button>
                
                <Button
                  component={RouterLink}
                  to={`/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`}
                  startIcon={<Clock />}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  History
                </Button>

                {/* --- 5. Tombol Notifikasi dengan Badge --- */}
                <Button
                  component={RouterLink}
                  to={`/${rootPaths.masyarakatRoot}/${paths.masyarakatNotifikasi}`}
                  startIcon={
                    <Badge 
                        badgeContent={notifCount} 
                        color="warning" // Pakai warna 'warning' (kuning/oranye) agar kontras dengan background merah
                        max={99}
                    >
                        <Bell />
                    </Badge>
                  }
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

          {/* --- Tampilan Mobile --- */}
          {user ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={onDrawerToggle}
              sx={{ display: { md: 'none'},
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#d32f2f' },

                }}
            >
              {/* Optional: Kasih badge juga di menu hamburger mobile jika diinginkan */}
               <Badge badgeContent={notifCount} color="warning" variant="dot">
                  <MenuIcon />
               </Badge>
            </IconButton>
          ) : (
            <Button
              component={RouterLink}
              to={`/${rootPaths.authRoot}/${paths.login}`}
              variant="contained"
              startIcon={<LogIn size={16} />}
              sx={{
                display: { md: 'none' },
                bgcolor: 'white',
                color: '#d32f2f',
                borderRadius: 4,
                '&:hover': { bgcolor: '#f0f0f0' },
                py: 1.5,
                px: 2.0,
                fontSize: '0.8rem',
              }}
            >
              Login
            </Button>
          )}

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;