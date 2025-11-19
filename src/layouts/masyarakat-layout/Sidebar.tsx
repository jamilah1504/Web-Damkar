import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Button, 
  Typography,
  Badge // 1. Import Badge
} from '@mui/material';
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react';
import paths, { rootPaths } from '../../routes/paths';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  onClose: () => void;
}

interface User {
  name: string;
  role: string; // Tambahkan role
}

interface SidebarProps {
  onClose: () => void;
  notifCount: number; // Tambahkan ini
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, notifCount }) => { 
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation(); // Untuk mendeteksi URL aktif

  // Cek localStorage saat komponen dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  // 5. Tentukan Path Home berdasarkan Role
  const homePath = user
    ? (user.role.toLowerCase() === 'admin'
      ? `/${rootPaths.adminRoot}/${paths.adminDashboard}`
      : (user.role.toLowerCase() === 'masyarakat'
        ? `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`
        : `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`))
    : paths.landing;

  // 6. Definisikan Menu Items secara Dinamis (agar bisa akses state)
  const menuItems = [
    { 
      text: 'Home', 
      icon: <Home size={20} />, 
      path: homePath 
    },
    { 
      text: 'History', 
      icon: <Clock size={20} />, 
      path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}` 
    },
    { 
      text: 'Notification', 
      icon: (
        <Badge badgeContent={notifCount} color="warning" max={99}>
           <Bell size={20} />
        </Badge>
      ), 
      path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatNotifikasi}` 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    onClose();
    window.location.href = '/auth/login';
  };

  return (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#dc2626',
        color: '#fff',
      }}
      role="presentation"
    >
      {/* Header Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <img src={'/logo2.png'} alt="Logo Damkar" style={{ height: '35px', width: '35px' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Damkar Subang
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Daftar Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {user && (
          <List sx={{ p: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink} // Jadikan Link
                  to={item.path}         // Arahkan ke Path
                  onClick={onClose}      // Tutup sidebar saat diklik
                  // Highlight jika URL saat ini cocok dengan path menu
                  selected={location.pathname === item.path} 
                  sx={{
                    m: 1,
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.25)', 
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: 'white',
                      minWidth: 'auto',
                      mr: 1.5,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: location.pathname === item.path ? 600 : 400 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer Login/Logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />

        {user ? (
          <Button 
            fullWidth 
            variant="contained"
            startIcon={<LogOut size={18} />}
            onClick={handleLogout}
            sx={{
              bgcolor: '#fff', 
              color: '#dc2626',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            Logout ({user.name})
          </Button>
        ) : (
          <Button 
            fullWidth 
            component={RouterLink}
            variant="contained"
            to={`/${rootPaths.authRoot}/${paths.login}`}
            startIcon={<LogIn size={18} />}
            onClick={onClose}
            sx={{
              bgcolor: '#fff', 
              color: '#dc2626',
              '&:hover': {
                bgcolor: '#f1f5f9',
              }
            }}
          >
            Login
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;