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
  Alert,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';

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

  const getSnippet = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4, bgcolor: '#fef4ea', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Edukasi & Informasi
      </Typography>

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
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/masyarakat/edukasi/detail/${item.id}`}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={isImageUrl(item.fileUrl) ? item.fileUrl! : PLACEHOLDER_IMAGE}
                    alt={item.judul}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {item.judul}
                    </Typography>
                    <Chip
                      label={item.kategori}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {getSnippet(item.isiKonten)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>
              Belum ada konten edukasi yang tersedia.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default EdukasiListPage;
