import React, { useState } from 'react';
import { Box, Drawer, CssBaseline } from '@mui/material';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

interface MasyarakatLayoutProps {
  children: React.ReactNode;
}

const MasyarakatLayout: React.FC<MasyarakatLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      <Topbar onDrawerToggle={handleDrawerToggle} />

      {/* Drawer untuk navigasi mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Peningkatan performa di mobile
      >
        <Sidebar onClose={handleDrawerToggle} />
      </Drawer>

      {/* Konten Utama Halaman */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
      
      {/* Anda bisa menambahkan Footer di sini jika diperlukan */}
      {/* <Footer /> */}
    </Box>
  );
};

export default MasyarakatLayout;