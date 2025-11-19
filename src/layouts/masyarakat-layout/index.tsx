import React, { useState, useEffect, useCallback } from 'react';
import { Box, Drawer, CssBaseline } from '@mui/material';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import api from '../../api'; // Pastikan import api

interface MasyarakatLayoutProps {
  children: React.ReactNode;
}

const MasyarakatLayout: React.FC<MasyarakatLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State Notifikasi diangkat ke sini (Single Source of Truth)
  const [notifCount, setNotifCount] = useState<number>(0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // === LOGIC SMART AUTO REFRESH ===
  const fetchNotifikasi = useCallback(async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    try {
      // Mengambil data tanpa loading spinner agar tidak mengganggu UX
      const response = await api.get('/notifikasi');
      if (Array.isArray(response.data)) {
        setNotifCount(response.data.length);
      }
    } catch (error) {
      console.error("Silent refresh failed", error);
    }
  }, []);

  useEffect(() => {
    // 1. Fetch pertama kali saat mount
    fetchNotifikasi();

    // 2. Auto refresh setiap 60 detik (Interval Panjang = Ringan)
    const intervalId = setInterval(() => {
        fetchNotifikasi();
    }, 60000); 

    // 3. Refresh saat user kembali ke tab (Supaya terasa instan saat dibuka kembali)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifikasi();
      }
    };
    
    // 4. Refresh saat window mendapat fokus (klik mouse di window)
    window.addEventListener('focus', fetchNotifikasi);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', fetchNotifikasi);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifikasi]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      
      {/* Oper notifCount ke Topbar */}
      <Topbar 
        onDrawerToggle={handleDrawerToggle} 
        notifCount={notifCount} 
      />

      {/* Drawer untuk navigasi mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {/* Oper notifCount ke Sidebar juga */}
        <Sidebar 
            onClose={handleDrawerToggle} 
            notifCount={notifCount} 
        />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default MasyarakatLayout;