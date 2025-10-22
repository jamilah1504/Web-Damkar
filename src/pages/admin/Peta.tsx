import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const AdminPeta: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analisis & Peta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visualisasikan lokasi rawan insiden dan pantau sebaran laporan.
      </Typography>

      <Paper sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Placeholder untuk Peta */}
        <Box
          sx={{
            height: '100%',
            width: '100%',
            bgcolor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            [Area Tampilan Peta Interaktif]
          </Typography>
        </Box>

        {/* Placeholder untuk Legenda/Info */}
        <Paper sx={{ position: 'absolute', top: 16, right: 16, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Legenda
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon color="error" />
              <Typography variant="body2">Area Rawan Kebakaran</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon color="primary" />
              <Typography variant="body2">Lokasi Insiden Aktif</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Paper>
    </Box>
  );
};

export default AdminPeta;
