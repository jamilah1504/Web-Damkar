import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Paper,
  CircularProgress,
  Button, // Pastikan Button diimport dari satu sumber saja
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

// 1. Sesuaikan Tipe Data dengan Response API
interface NotifikasiData {
  id: number;
  judul: string;
  isiPesan: string;
  timestamp: string;
  userId: number | null;
}

// Helper: Format Tanggal
const formatTanggal = (isoString: string) => {
  if (!isoString) return '-';
  const date = new Date(isoString);

  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const namaBulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayName = namaHari[date.getDay()];
  const dayDate = date.getDate();
  const monthName = namaBulan[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}, ${dayName} ${dayDate} ${monthName} ${year}`;
};

// Komponen Kartu Individual
const NotificationCard: React.FC<{ item: NotifikasiData }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      elevation={0}
      onClick={toggleExpand}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: '#FFFFFF', // UBAH DISINI: Jadi Putih
        border: '1px solid #E5E7EB', // Border diperhalus sedikit
        borderRadius: '12px', // Radius sedikit diperbesar biar lebih modern
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Tambah shadow tipis agar box 'pop up'
        '&:hover': {
          bgcolor: '#F9FAFB', // Efek hover jadi abu sangat muda
          borderColor: '#D1D5DB',
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box sx={{ width: '90%' }}>
          {/* Judul dari API */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              color: '#DC2626',
              mb: 0.5,
            }}
          >
            {item.judul}
          </Typography>

          <Box>
            {/* Pesan Collapsed */}
            {!expanded && (
              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  lineHeight: 1.5,
                }}
              >
                {item.isiPesan}
              </Typography>
            )}

            {/* Pesan Expanded */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.5 }}>
                {item.isiPesan}
              </Typography>
            </Collapse>
          </Box>
        </Box>

        <Box>
          {expanded ? (
            <KeyboardArrowUpIcon sx={{ color: '#9CA3AF' }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ color: '#9CA3AF' }} />
          )}
        </Box>
      </Stack>

      {/* Timestamp dari API yang sudah diformat */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#6B7280',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {formatTanggal(item.timestamp)}
        </Typography>
      </Box>
    </Paper>
  );
};

const NotifikasiPage: React.FC = () => {
  const navigate = useNavigate();

  // State untuk data API
  const [notifikasiList, setNotifikasiList] = useState<NotifikasiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data saat komponen dimuat
  useEffect(() => {
    const fetchNotifikasi = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notifikasi');

        if (Array.isArray(response.data)) {
          setNotifikasiList(response.data);
        } else {
          setNotifikasiList([]);
        }
      } catch (err) {
        console.error('Gagal mengambil notifikasi:', err);
        setError('Gagal memuat notifikasi. Periksa koneksi server.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifikasi();
  }, []);

  return (
    // Tambahkan bgcolor pada container utama agar box putih terlihat kontras
    <Box sx={{ minHeight: '100vh', p: 2, bgcolor: '#f3f4f6' }}>
      {/* Header */}
      <Button
        component={Link}
        to="/masyarakat/dashboard"
        startIcon={<ArrowBackIcon />}
        size="large"
        variant="contained"
        sx={{
          mb: 3,
          backgroundColor: '#d32f2f',
          color: '#fff',
          fontWeight: 'bold',
          padding: '10px 24px',
          '&:hover': {
            backgroundColor: '#b71c1c',
          },
        }}
      >
        Kembali ke Home
      </Button>

      {/* Content List */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress color="error" />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ mt: 5 }}>
            {error}
          </Typography>
        ) : notifikasiList.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
            Tidak ada notifikasi saat ini.
          </Typography>
        ) : (
          notifikasiList.map((notif) => <NotificationCard key={notif.id} item={notif} />)
        )}
      </Box>
    </Box>
  );
};

export default NotifikasiPage;
