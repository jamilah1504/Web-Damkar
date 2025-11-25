import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Badge } from '@mui/material';
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';

import paths, { rootPaths } from '../../routes/paths';

interface User {
  name: string;
  role: string;
}

interface TopbarProps {
  onDrawerToggle: () => void;
  notifCount: number;
}

const Topbar: React.FC<TopbarProps> = ({ onDrawerToggle, notifCount }) => {
  const [user, setUser] = useState<User | null>(null);

  const homePath = user
    ? user.role.toLowerCase() === 'admin'
      ? `/${rootPaths.adminRoot}/${paths.adminDashboard}`
      : user.role.toLowerCase() === 'masyarakat'
      ? `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`
      : `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`
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

  // Font standar sistem
  const commonFont = 'system-ui, -apple-system, sans-serif';

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#d32f2f',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontFamily: commonFont,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 10 } }}>
        {/* Sisi Kiri: Logo dan Judul */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <img src={'/logo2.png'} alt="Logo Damkar" style={{ height: '70px', width: '80px' }} />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold', // TEBAL
                lineHeight: 1.2,
                fontFamily: commonFont,
                fontSize: '1.3rem', // Sedikit diperbesar agar lebih tegas
              }}
            >
              Pemadam Kebakaran
            </Typography>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.2,
                display: { xs: 'none', sm: 'block' },
                fontFamily: commonFont,
                fontWeight: 'bold', // TEBAL
                opacity: 0.9,
              }}
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
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontFamily: commonFont,
                    fontWeight: 'bold', // TEBAL
                    fontSize: '1rem',
                  }}
                >
                  Home
                </Button>

                <Button
                  component={RouterLink}
                  to={`/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`}
                  startIcon={<Clock />}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontFamily: commonFont,
                    fontWeight: 'bold', // TEBAL
                    fontSize: '1rem',
                  }}
                >
                  History
                </Button>

                {/* --- Tombol Notifikasi dengan Badge --- */}
                <Button
                  component={RouterLink}
                  to={`/${rootPaths.masyarakatRoot}/${paths.masyarakatNotifikasi}`}
                  startIcon={
                    <Badge
                      badgeContent={notifCount}
                      color="warning"
                      max={99}
                      sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }} // Badge text tebal
                    >
                      <Bell />
                    </Badge>
                  }
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontFamily: commonFont,
                    fontWeight: 'bold', // TEBAL
                    fontSize: '1rem',
                  }}
                >
                  Pemberitahuan
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
                  textTransform: 'none',
                  fontFamily: commonFont,
                  fontWeight: 'bold', // TEBAL
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
                  textTransform: 'none',
                  fontFamily: commonFont,
                  fontWeight: 'bold', // TEBAL
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
              sx={{
                display: { md: 'none' },
                bgcolor: '#d32f2f',
                '&:hover': { bgcolor: '#d32f2f' },
              }}
            >
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
                textTransform: 'none',
                fontFamily: commonFont,
                fontWeight: 'bold', // TEBAL
                '&:hover': { bgcolor: '#f0f0f0' },
                py: 1.5,
                px: 2.0,
                fontSize: '0.9rem',
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
