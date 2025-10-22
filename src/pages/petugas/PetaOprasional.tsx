import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const PetugasPeta: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Peta Operasional
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Peta interaktif untuk melihat lokasi tugas, hidran, dan area rawan.
      </Typography>

      <Paper sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
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
            [Area Peta Interaktif Petugas]
          </Typography>
        </Box>
        <Paper sx={{ position: 'absolute', top: 16, right: 16, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Legenda
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon color="primary" />{' '}
              <Typography variant="body2">Lokasi Tugas Anda</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon sx={{ color: 'blue' }} />{' '}
              <Typography variant="body2">Titik Hidran</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon color="error" /> <Typography variant="body2">Area Rawan</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Paper>
    </Box>
  );
};

export default PetugasPeta;
