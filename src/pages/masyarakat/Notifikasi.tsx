import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Collapse, Stack, Paper, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // Pastikan path ini sesuai dengan lokasi file api.js/ts Anda

// 1. Sesuaikan Tipe Data dengan Response API
interface NotifikasiData {
  id: number;
  judul: string;     // API: "judul"
  isiPesan: string;  // API: "isiPesan"
  timestamp: string; // API: "timestamp" (ISO String)
  userId: number | null;
}

// Helper: Format Tanggal (Custom: Jam, Hari Tanggal Bulan Tahun)
const formatTanggal = (isoString: string) => {
  if (!isoString) return '-';
  const date = new Date(isoString);

  // Array Nama Hari & Bulan (Bahasa Indonesia)
  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Ambil komponen waktu
  const dayName = namaHari[date.getDay()];      // Nama Hari (0-6)
  const dayDate = date.getDate();               // Tanggal (1-31)
  const monthName = namaBulan[date.getMonth()]; // Nama Bulan (0-11)
  const year = date.getFullYear();              // Tahun

  // Format jam (HH:mm)
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Susun format: "17:00, Sabtu 17 Agustus 2024"
  // Jika Anda ingin huruf kecil semua (sabtu, agustus), ubah menjadi:
  // return `${hours}:${minutes}, ${dayName.toLowerCase()} ${dayDate} ${monthName.toLowerCase()} ${year}`;
  
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
        bgcolor: '#F3F4F6',
        border: '1px solid #D1D5DB',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: '#E5E7EB',
        }
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
              mb: 0.5 
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
                 lineHeight: 1.5
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
            {expanded ? <KeyboardArrowUpIcon sx={{ color: '#374151' }} /> : <KeyboardArrowDownIcon sx={{ color: '#374151' }} />}
        </Box>
      </Stack>

      {/* Timestamp dari API yang sudah diformat */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#EF4444',
            fontSize: '0.75rem',
            fontWeight: 500 
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
        // Panggil endpoint backend
        // Jika Anda tidak menggunakan instance 'api', ganti dengan axios.get('http://localhost:5000/api/notifikasi')
        const response = await api.get('/notifikasi');
        
        // Pastikan response adalah array
        if (Array.isArray(response.data)) {
            setNotifikasiList(response.data);
        } else {
            setNotifikasiList([]);
        }
      } catch (err) {
        console.error("Gagal mengambil notifikasi:", err);
        setError("Gagal memuat notifikasi. Periksa koneksi server.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifikasi();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ color: '#DC2626', p: 0, '&:hover': { bgcolor: 'transparent' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: '#DC2626', fontSize: '1.25rem' }}>
          Notifikasi
        </Typography>
      </Stack>

      {/* Content List */}
      <Box>
        {loading ? (
            // Tampilan Loading
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress color="error" />
            </Box>
        ) : error ? (
            // Tampilan Error
            <Typography color="error" align="center" sx={{ mt: 5 }}>{error}</Typography>
        ) : notifikasiList.length === 0 ? (
            // Tampilan Data Kosong
            <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
                Tidak ada notifikasi saat ini.
            </Typography>
        ) : (
            // Render List Data dari API
            notifikasiList.map((notif) => (
                <NotificationCard key={notif.id} item={notif} />
            ))
        )}
      </Box>
      
    </Box>
  );
};

export default NotifikasiPage;