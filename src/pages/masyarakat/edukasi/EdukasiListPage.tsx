// src/pages/masyarakat/edukasi/EdukasiListPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Button,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
// Impor ikon untuk tampilan kosong
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

interface EdukasiItem {
  id: number;
  judul: string;
  isiKonten: string;
  kategori: string;
  fileUrl: string | null;
  timestampDibuat: string;
}

const isImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x160.png?text=Info+Damkar';

// Fungsi helper untuk membersihkan HTML dari snippet
const stripHtml = (html: string) => {
  if (typeof window === 'undefined') {
    // Handle SSR atau lingkungan non-browser
    return html.replace(/<[^>]*>?/gm, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const EdukasiListPage: React.FC = () => {
  const [edukasiList, setEdukasiList] = useState<EdukasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEdukasi = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/edukasi');
      setEdukasiList(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data edukasi:', error);
      setError('Gagal mengambil data dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdukasi();
  }, []);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // Latar belakang diubah menjadi abu-abu muda yang netral
    <Container sx={{ py: 4, minHeight: '100vh', maxWidth: 'lg' }}>
      <Button
        component={Link}
        to="/masyarakat/dashboard"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Kembali ke Home
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {edukasiList.length > 0 ? (
          edukasiList.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3, // Sedikit lebih bulat
                    // Shadow modern yang lebih lembut
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    // Transisi untuk hover effect
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/masyarakat/edukasi/detail/${item.id}`}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
        _           component="img"
                    height="160"
                    image={isImageUrl(item.fileUrl) ? item.fileUrl! : PLACEHOLDER_IMAGE}
                    alt={item.judul}
                    sx={{ objectFit: 'cover' }} // Memastikan gambar tidak gepeng
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h2" 
                        sx={{
                          fontWeight: 600,
                          // Batasi judul 2 baris
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '3.2rem', // (1.6rem line-height * 2)
                        }}
                      >
                      {item.judul}
                    </Typography>
                    <Chip
                      label={item.kategori}
            _         size="small"
                        // Style chip yang lebih modern
                      variant="filled"
                        color="warning" // Asumsi tema damkar (bisa 'primary' jika biru)
                      sx={{ 
                            mb: 1.5,
                            bgcolor: 'warning.light', // Latar oranye muda
                            color: 'warning.dark', // Teks oranye tua
                            fontWeight: 500,
                            alignSelf: 'flex-start'
                          }}
                    />
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          // Batasi deskripsi 3 baris
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {/* Gunakan fungsi stripHtml di sini */}
                      {stripHtml(item.isiKonten)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            {/* Tampilan kosong dengan ikon */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mt: 5, 
              color: 'text.secondary',
              p: 3,
              bgcolor: 'white',
              borderRadius: 2
            }}>
              <InfoOutlinedIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography align="center" variant="h6">
                Belum ada konten edukasi
              </Typography>
              <Typography align="center" color="text.secondary">
                Konten baru akan segera ditambahkan.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default EdukasiListPage;