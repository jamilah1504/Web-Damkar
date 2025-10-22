import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const dummyTips = [
  {
    id: 1,
    title: 'Cara Mencegah Kebakaran di Dapur',
    summary: 'Kenali penyebab umum kebakaran di dapur dan langkah-langkah pencegahannya.',
  },
  {
    id: 2,
    title: 'Apa yang Harus Dilakukan Saat Ada Ular di Rumah?',
    summary: 'Tetap tenang dan ikuti panduan aman untuk menangani hewan liar.',
  },
  {
    id: 3,
    title: 'Pentingnya APAR di Lingkungan Anda',
    summary: 'Pelajari jenis-jenis APAR dan cara penggunaannya saat keadaan darurat.',
  },
];

const InformasiPublik: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Informasi Publik
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Peta lokasi rawan dan tips keselamatan untuk Anda dan keluarga.
      </Typography>

      {/* Bagian Peta */}
      <Paper sx={{ height: '400px', width: '100%', mb: 4, position: 'relative' }}>
        <Box
          sx={{
            height: '100%',
            bgcolor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            [Area Peta Lokasi Rawan]
          </Typography>
        </Box>
      </Paper>

      {/* Bagian Tips Keselamatan */}
      <Typography variant="h5" component="h2" gutterBottom>
        Tips & Edukasi Keselamatan
      </Typography>
      <Grid container spacing={3}>
        {dummyTips.map((tip) => (
          <Grid item xs={12} md={4} key={tip.id}>
            <Card>
              <CardActionArea>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tip.summary}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InformasiPublik;
