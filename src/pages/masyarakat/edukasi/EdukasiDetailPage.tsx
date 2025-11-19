// src/pages/masyarakat/edukasi/EdukasiDetailPage.tsx
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
  Grid,       // <-- Masih digunakan, tapi di level yang berbeda
  CardMedia,  // <-- Masih digunakan
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// (Interface dan fungsi helper tetap sama)
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

const newsFontFamily = "'Georgia', 'Times New Roman', serif";
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x160.png?text=Info+Damkar';

// =================================================================
//   PERBAIKAN: Komponen "Berita Lainnya" (Clean & Slide)
// =================================================================

interface OtherNewsCardProps {
  item: EdukasiItem;
}

// PERBAIKAN: Card dibuat lebih clean, tanpa Paper/Card
const OtherNewsCard: React.FC<OtherNewsCardProps> = ({ item }) => {
  return (
    // Box ini adalah item yang akan di-slide di mobile
    <Box
      sx={{
        width: { xs: 280, md: '100%' }, // Lebar tetap di mobile, penuh di grid
        flex: '0 0 auto', // Mencegah item menyusut di flexbox
      }}
    >
      <MuiLink
        component={RouterLink}
        to={`/edukasi/detail/${item.id}`}
        underline="none"
        color="inherit"
        sx={{ 
          display: 'block', 
          transition: 'opacity 0.2s ease',
          '&:hover': { opacity: 0.8 } 
        }}
      >
        <CardMedia
          component="img"
          height="150"
          image={isImageUrl(item.fileUrl) ? item.fileUrl! : PLACEHOLDER_IMAGE}
          alt={item.judul}
          sx={{ objectFit: 'cover', borderRadius: 2 }}
        />
        <Box sx={{ pt: 1.5 }}>
           <Chip label={item.kategori} size="small" variant="outlined" sx={{ mb: 1 }} />
           <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.judul}
          </Typography>
        </Box>
      </MuiLink>
    </Box>
  );
};

interface OtherNewsSectionProps {
  items: EdukasiItem[];
}

// PERBAIKAN: Section ini sekarang menjadi slider di mobile
const OtherNewsSection: React.FC<OtherNewsSectionProps> = ({ items }) => {
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
        Baca Juga
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {/* PERBAIKAN: 
        - Di 'xs' (mobile): display 'flex', overflowX 'auto' (menjadi slider)
        - Di 'md' (desktop): display 'grid', 3 kolom
      */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'grid' },
          gridTemplateColumns: { md: '1fr 1fr 1fr' },
          gap: { xs: 2, md: 3 },
          overflowX: { xs: 'auto', md: 'hidden' },
          // Sembunyikan scrollbar untuk tampilan clean
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none', // IE dan Edge
          'scrollbar-width': 'none', // Firefox
          pb: 1, // Padding bawah untuk shadow jika ada (meski sudah dihapus)
        }}
      >
        {items.map(item => (
          <OtherNewsCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  );
};


// =================================================================
//   Komponen Halaman Detail Utama
// =================================================================

const EdukasiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<EdukasiItem | null>(null);
  const [otherNews, setOtherNews] = useState<EdukasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOtherNews = async (currentId: number) => {
    // (Fungsi ini tidak perlu diubah)
    try {
      const response = await apiClient.get('/edukasi', { params: { limit: 4 } });
      if (response.data && response.data.data) {
        const allItems: EdukasiItem[] = response.data.data;
        const filtered = allItems.filter(item => item.id !== currentId);
        setOtherNews(filtered.slice(0, 3));
      }
    } catch (err) {
      console.error("Gagal mengambil berita lain:", err);
    }
  };

  useEffect(() => {
    // (Fungsi ini tidak perlu diubah)
    const fetchEdukasiDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      setOtherNews([]); 
      window.scrollTo(0, 0); 

      try {
        const response = await apiClient.get(`/edukasi/${id}`);
        setItem(response.data.data);
        fetchOtherNews(response.data.data.id);
      } catch (error: any) {
        console.error('Gagal mengambil detail:', error);
        setError(error.response?.data?.message || 'Konten tidak ditemukan atau server error.');
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

  if (error || !item) {
    // (Bagian error tidak perlu diubah)
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Konten tidak ditemukan.'}</Alert>
        <Button component={RouterLink} to="/edukasi/list" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Kembali ke Daftar
        </Button>
      </Container>
    );
  }

  // PERBAIKAN: Proses konten untuk mengganti \n menjadi <br />
  const processedContent = item.isiKonten.replace(/\n/g, '<br />');

  return (
    <Container maxWidth="md" sx={{ py: 4, bgcolor: 'grey.50' }}>
      <Button
        component={RouterLink}
        to="/edukasi/list"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Kembali ke Daftar
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        
        {/* (Bagian Metadata dan Judul tidak berubah) */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5} flexWrap="wrap">
          <Chip label={item.kategori} color="primary" size="small" sx={{ fontWeight: 600 }} />
          <Typography variant="body2" color="text.secondary">
            | {formatDate(item.timestampDibuat)}
          </Typography>
        </Stack>

        <Typography 
          variant="h2"
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            fontFamily: newsFontFamily,
            lineHeight: 1.2,
            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' } 
          }}
        >
          {item.judul}
        </Typography>

        {item.fileUrl && (
          // (Bagian Gambar/File tidak berubah)
          <Box sx={{ my: 3 }}>
            {isImageUrl(item.fileUrl) ? (
              <Box
                component="img"
                src={item.fileUrl}
                alt={item.judul}
                sx={{ width: '100%', maxHeight: 450, objectFit: 'cover', borderRadius: 2 }}
              />
            ) : (
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

        {/* PERBAIKAN: 
          Menggunakan 'processedContent' yang mengganti '\n' dengan '<br />'
          Ini akan menghormati 'enter' dari DB sambil tetap me-render HTML.
        */}
        <Box
          component="div"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          sx={{ 
            mt: 3, 
            lineHeight: 1.7, 
            fontSize: '1.1rem',
            fontFamily: newsFontFamily,
            color: '#333',
            // Styling untuk tag HTML di dalam konten
            '& p': { marginBottom: '1.2em' },
            '& strong': { fontWeight: 600 },
            '& ul, & ol': { marginBottom: '1.2em', paddingLeft: '30px' },
            '& li': { marginBottom: '0.5em' },
            '& a': { color: 'primary.main', textDecoration: 'underline' },
            // <br> akan berfungsi sebagai line break
          }}
        />
      </Paper>

      {/* Tampilkan bagian "Baca Juga" */}
      {otherNews.length > 0 && (
        <OtherNewsSection items={otherNews} />
      )}

    </Container>
  );
};

export default EdukasiDetailPage;