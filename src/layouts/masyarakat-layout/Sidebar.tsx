import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button, Typography } from '@mui/material';
import { Home, Clock, Bell } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={onClose}
      onKeyDown={onClose}
    >
      {/* Header di dalam Sidebar */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <img src={'/logo.png'} alt="Logo Damkar" style={{ height: '35px', width: '35px' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Damkar Subang
        </Typography>
      </Box>
      <Divider />
      {/* Daftar Menu */}
      <List>
        {['Home', 'History', 'Notification'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index === 0 && <Home />}
                {index === 1 && <Clock />}
                {index === 2 && <Bell />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Tombol Login di bawah */}
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="contained">Login</Button>
      </Box>
    </Box>
  );
};

export default Sidebar;