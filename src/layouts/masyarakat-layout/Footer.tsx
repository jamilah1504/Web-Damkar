import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Stack, Divider } from '@mui/material';
import { Flame, Phone, MapPin, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1e293b', // Warna background dark slate (modern)
        color: '#cbd5e1', // Warna teks abu terang
        py: 6, // Padding atas-bawah
        mt: 'auto', // Mendorong footer ke bawah jika konten sedikit
        borderTop: '4px solid #d32f2f', // Aksen garis merah Damkar di atas
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* KOLOM 1: BRAND & SOSMED */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(211, 47, 47, 0.15)',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  color: '#ef4444',
                }}
              >
                <Flame size={32} />
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}
              >
                Damkar
                <br />
                Kab. Subang
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7, maxWidth: '90%' }}>
              Siap siaga 24 jam melayani masyarakat Kabupaten Subang dalam penanggulangan kebakaran,
              penyelamatan, dan evakuasi darurat.
            </Typography>
            <Stack direction="row" spacing={1}>
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <IconButton
                  key={index}
                  sx={{
                    color: '#cbd5e1',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: '#d32f2f', color: 'white' },
                  }}
                >
                  <Icon size={20} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* KOLOM 2: KONTAK DARURAT */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 2 }}>
              Kontak Darurat
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Phone size={20} color="#ef4444" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                    113
                  </Typography>
                  <Typography variant="caption">Call Center Nasional</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Phone size={20} color="#ef4444" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                    (0260) 411113
                  </Typography>
                  <Typography variant="caption">Markas Komando</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Mail size={20} color="#ef4444" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                    lapor@subang.go.id
                  </Typography>
                  <Typography variant="caption">Email Resmi</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* KOLOM 3: ALAMAT */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 2 }}>
              Lokasi Kantor
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <MapPin size={24} color="#ef4444" style={{ flexShrink: 0 }} />
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Jl. Dangdeur Indah No. 1,
                <br />
                Karanganyar, Kec. Subang,
                <br />
                Kabupaten Subang,
                <br />
                Jawa Barat 41211
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* COPYRIGHT */}
        <Typography variant="body2" align="center" sx={{ color: '#64748b' }}>
          &copy; {new Date().getFullYear()} Dinas Pemadam Kebakaran dan Penyelamatan Kabupaten
          Subang.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
