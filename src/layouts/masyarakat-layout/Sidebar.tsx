import React, { useState, useEffect } from 'react'; // <<< TAMBAHKAN useEffect
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Button, 
  Typography 
} from '@mui/material';
import { Home, Clock, Bell, LogIn, LogOut } from 'lucide-react'; // <<< TAMBAHKAN LogIn, LogOut
import paths, { rootPaths } from '../../routes/paths';
import { Link as RouterLink } from 'react-router-dom';

interface SidebarProps {
  onClose: () => void;
}

// Definisikan tipe data untuk user (sesuaikan dengan Topbar)
interface User {
  name: string;
}

const menuItems = [
  { text: 'Home', icon: <Home size={20} /> },
  { text: 'History', icon: <Clock size={20} /> },
  { text: 'Notification', icon: <Bell size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  // State untuk melacak item menu yang sedang aktif
  const [selectedIndex, setSelectedIndex] = useState(0);
  // <<< TAMBAHAN: State untuk user
  const [user, setUser] = useState<User | null>(null);

  // <<< TAMBAHAN: Cek localStorage saat komponen dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handler untuk mengubah item aktif dan menutup sidebar
  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
    onClose(); // Menutup sidebar saat item di-klik
  };

  // <<< TAMBAHAN: Handler untuk Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    onClose(); // Tutup sidebar
    window.location.href = '/auth/login'; // Arahkan ke login
  };

  return (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#dc2626', // Latar belakang merah
        color: '#fff',       // Warna teks & ikon utama
      }}
      role="presentation"
    >
      {/* Header Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <img src={'/logo.png'} alt="Logo Damkar" style={{ height: '35px', width: '35px' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Damkar Subang
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Daftar Menu (Wrapper) */}
      {/* Box ini akan selalu ada untuk mendorong tombol ke bawah */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {/* <<< MODIFIKASI: Tampilkan List Menu HANYA JIKA USER LOGIN */}
        {user && (
          <List sx={{ p: 1 }}>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => handleListItemClick(index)}
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
                      fontWeight: selectedIndex === index ? 600 : 400 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Tombol Login/Logout di bawah */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />

        {/* <<< MODIFIKASI: Tampilkan Tombol Logout atau Login */}
        {user ? (
          // --- Tombol Logout ---
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
          // --- Tombol Login ---
          <Button 
            fullWidth 
            component={RouterLink}
            variant="contained"
            to={`/${rootPaths.authRoot}/${paths.login}`}
            startIcon={<LogIn size={18} />} // <<< TAMBAHAN: Ikon
            onClick={onClose} // <<< TAMBAHAN: Tutup sidebar saat klik
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