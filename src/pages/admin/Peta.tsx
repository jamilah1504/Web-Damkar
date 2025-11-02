import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import InteractiveMap from '../../components/InteractiveMap';

const AdminPeta: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Analisis & Peta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualisasikan lokasi rawan insiden dan pantau sebaran laporan. Klik pada peta untuk menambahkan lokasi rawan baru.
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ flexGrow: 1, borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <InteractiveMap height="100%" enableMarker={true} />
      </Box>
    </Box>
  );
};

export default AdminPeta;
