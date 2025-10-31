import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        p: 2, 
        mt: 'auto', // Mendorong footer ke bawah
        backgroundColor: '#f5f5f5',
        textAlign: 'center' 
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} Pemadam Kebakaran Kabupaten Subang. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;