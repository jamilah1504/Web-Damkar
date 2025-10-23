import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Button,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Sesuaikan port
});

interface EdukasiItem {
  id: number;
  judul: string;
  isiKonten: string;
  kategori: string;
  fileUrl: string | null;
  timestampDibuat: string;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const EdukasiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Mengambil ID dari URL
  const [item, setItem] = useState<EdukasiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEdukasiDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get(`/edukasi/${id}`);
        setItem(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil detail edukasi:', error);
        setError('Gagal mengambil data dari server atau konten tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };

    fetchEdukasiDetail();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to="/edukasi" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Kembali ke Daftar
        </Button>
      </Container>
    );
  }

  if (!item) {
    return <Container sx={{ py: 4 }}>=</Container>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        component={RouterLink}
        to="/edukasi/EdukasiListPage"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Kembali ke Daftar
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {item.judul}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Chip label={item.kategori} color="primary" />
          <Typography variant="caption" color="text.secondary">
            Diposting pada {formatDate(item.timestampDibuat)}
          </Typography>
        </Stack>

        {/* Menampilkan Gambar atau Link File */}
        {item.fileUrl && (
          <Box sx={{ my: 3 }}>
            {isImageUrl(item.fileUrl) ? (
              <Box
                component="img"
                src={item.fileUrl}
                alt={item.judul}
                sx={{
                  width: '100%',
                  maxHeight: 450,
                  objectFit: 'cover',
                  borderRadius: 2,
                }}
              />
            ) : (
              // Jika file tapi bukan gambar (misal: PDF)
              <Button
                component={MuiLink}
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<AttachFileIcon />}
              >
                Lihat/Unduh Lampiran
              </Button>
            )}
          </Box>
        )}

        {/* Isi Konten Utama */}
        <Typography
          variant="body1"
          component="div"
          sx={{
            mt: 3,
            lineHeight: 1.7,
            fontSize: '1.1rem',
            whiteSpace: 'pre-wrap', // Menjaga format line break dari admin
          }}
        >
          {item.isiKonten}
        </Typography>
      </Paper>
    </Container>
  );
};

export default EdukasiDetailPage;
