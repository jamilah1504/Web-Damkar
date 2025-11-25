import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Sesuaikan base URL Anda
const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });

// --- HELPER: Membersihkan URL Gambar ---
const getCleanImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\/?uploads\//, '');
  return `http://localhost:5000/uploads/${cleanPath}`;
};

// --- HELPER: Format Rupiah ---
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

// --- INTERFACES ---
interface LaporanLapanganType {
  jumlahKorban: number;
  estimasiKerugian: number | null;
  dugaanPenyebab: string | null;
  catatan: string | null;
}

interface Pelapor {
  id: number;
  name: string;
  email: string;
}

interface InsidenTerkait {
  id: number;
  judulInsiden: string;
  skalaInsiden: string;
  statusInsiden: string;
  // Hapus kurung siku [] di akhir
  Tugas?: { 
    id: number;
    laporanLapangan?: LaporanLapanganType;
  }; 
}

interface Laporan {
  id: number;
  jenisKejadian: string;
  deskripsi: string;
  alamatKejadian?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: 'Menunggu Verifikasi' | 'Diproses' | 'Selesai' | 'Ditolak';
  timestampDibuat: string;
  Dokumentasis: { fileUrl: string; tipeFile: string }[]; 
  Pelapor: Pelapor | null;
  Petugas: any | null;
  InsidenTerkait: InsidenTerkait | null;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getStatusConfig = (status: string) => {
  const configs = {
    Selesai: { color: 'success' as const, icon: CheckIcon, label: 'Selesai' },
    Ditolak: { color: 'error' as const, icon: CancelIcon, label: 'Ditolak' },
    Diproses: { color: 'warning' as const, icon: WarningIcon, label: 'Diproses' },
    'Menunggu Verifikasi': { color: 'info' as const, icon: WarningIcon, label: 'Menunggu' },
  };
  return configs[status as keyof typeof configs] || configs['Menunggu Verifikasi'];
};

const MasyarakatDetailLaporan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/reports/${id}`);
        const data = response.data;

        console.log("DATA DARI BACKEND:", data); // Debugging

        setLaporan({
          id: data.id,
          jenisKejadian: data.jenisKejadian,
          deskripsi: data.deskripsi,
          alamatKejadian: data.alamatKejadian,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          timestampDibuat: data.timestampDibuat,
          Dokumentasis: data.Dokumentasis || [],
          Pelapor: data.Pelapor || null,
          Petugas: data.Petugas || null,
          
          // Pastikan InsidenTerkait diambil utuh
          InsidenTerkait: data.InsidenTerkait || null, 
        });
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat detail laporan');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLaporan();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !laporan) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Laporan tidak ditemukan'}
        </Alert>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
          Kembali
        </Button>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(laporan.status);

  // --- LOGIKA EKSTRAKSI LAPORAN LAPANGAN ---
  // 1. Cek apakah ada Insiden Terkait
  // 2. Cek apakah Insiden punya Tugas (minimal 1)
  // 3. Cek apakah Tugas pertama punya laporanLapangan
  // (Karena struktur backend: Insiden -> Tugas[] -> laporanLapangan)
  const laporanLapangan = laporan.InsidenTerkait?.Tugas?.laporanLapangan;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', boxShadow: 1 }}>
          <ArrowBackIcon sx={{ color: 'black' }} />
        </IconButton>
        <Typography variant="h4" fontWeight={700} color="#333">
          Detail Laporan
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        {/* === KOLOM KIRI (Info Utama) === */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: 'white' }}>
            <Stack spacing={3}>
              {/* Judul & Tanggal */}
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {laporan.jenisKejadian}
                </Typography>
                <Chip
                  icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                  label={formatDate(laporan.timestampDibuat)}
                  size="small"
                  sx={{ mt: 1, bgcolor: '#f5f5f5', fontWeight: 500 }}
                />
              </Box>
              <Divider />

              {/* Deskripsi */}
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1} display="flex" alignItems="center" gap={1}>
                  <DescriptionIcon color="action" fontSize="small"/> Deskripsi
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                  {laporan.deskripsi || 'Tidak ada deskripsi.'}
                </Typography>
              </Box>

              {/* Lokasi */}
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1} display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon color="error" fontSize="small" /> Lokasi
                </Typography>
                <Typography variant="body1" color="text.primary" mb={1}>
                  {laporan.alamatKejadian || 'Lokasi GPS'}
                </Typography>
                
                {laporan.latitude && laporan.longitude && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocationOnIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${laporan.latitude},${laporan.longitude}`,
                        '_blank',
                      )
                    }
                  >
                    Lihat di Google Maps
                  </Button>
                )}
              </Box>

              {/* Status Laporan */}
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Status Terkini
                </Typography>
                <Chip
                  icon={<statusConfig.icon />}
                  label={statusConfig.label}
                  color={statusConfig.color}
                  sx={{ fontWeight: 600, fontSize: '1rem', p: 1.5, borderRadius: 2 }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* === KOLOM KANAN (Info Terkait & Hasil) === */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            
            {/* Card 1: Info Pelapor & Insiden */}
            {(laporan.Pelapor || laporan.InsidenTerkait) && (
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: 'white' }}>
                <Typography variant="h6" fontWeight={700} mb={2} color="#333">
                  Informasi Tambahan
                </Typography>
                <Stack spacing={2.5}>
                  {laporan.Pelapor && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          PELAPOR
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {laporan.Pelapor.name}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                  {laporan.InsidenTerkait && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <InfoIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          INSIDEN TERKAIT
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {laporan.InsidenTerkait.statusInsiden}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                          {laporan.InsidenTerkait.judulInsiden}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Card 2: Laporan Lapangan (HASIL KERJA PETUGAS) */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                // Logika Warna Background & Border
                bgcolor: laporanLapangan ? '#F1F8E9' : '#FFF8E1', // Hijau Muda vs Oranye Muda
                border: '1px solid',
                borderColor: laporanLapangan ? '#81C784' : '#FFB74D', // Hijau vs Oranye
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
                color={laporanLapangan ? 'success.main' : 'warning.main'}
                display="flex"
                alignItems="center"
                gap={1}
              >
                {laporanLapangan ? <CheckIcon/> : <WarningIcon/>}
                {laporanLapangan ? 'Laporan Lapangan (Selesai)' : 'Belum Ada Laporan Lapangan'}
              </Typography>
              
              {laporanLapangan ? (
                <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">Jumlah Korban</Typography>
                    <Typography variant="h6">{laporanLapangan.jumlahKorban} orang</Typography>
                  </Box>
                  {laporanLapangan.estimasiKerugian !== null && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">Estimasi Kerugian</Typography>
                      <Typography variant="h6" color="error.main">
                        {formatRupiah(laporanLapangan.estimasiKerugian)}
                      </Typography>
                    </Box>
                  )}
                  {laporanLapangan.dugaanPenyebab && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">Dugaan Penyebab</Typography>
                      <Typography variant="body1" fontWeight={500}>"{laporanLapangan.dugaanPenyebab}"</Typography>
                    </Box>
                  )}
                  {laporanLapangan.catatan && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">Catatan Petugas</Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        "{laporanLapangan.catatan}"
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Petugas damkar belum mengisi laporan hasil penanganan di lapangan. Mohon tunggu hingga proses selesai.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* === DOKUMENTASI (Gallery) === */}
      {laporan.Dokumentasis.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight={700} mb={3} color="#333">
            Dokumentasi Bukti
          </Typography>
          <Grid container spacing={2}>
            {laporan.Dokumentasis.map((doc, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: 4 },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => window.open(getCleanImageUrl(doc.fileUrl), '_blank')}
                >
                  {/* Cek Tipe File */}
                  {doc.tipeFile === 'Gambar' ? (
                    <Box
                      component="img"
                      src={getCleanImageUrl(doc.fileUrl)}
                      alt={`Bukti ${idx + 1}`}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                  ) : doc.tipeFile === 'Video' ? (
                    <Box
                      component="video"
                      src={getCleanImageUrl(doc.fileUrl)}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                      controls
                    />
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                      <Typography variant="caption">Format tidak didukung</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'white' }}>
                    <Chip 
                      label={doc.tipeFile} 
                      size="small" 
                      color={doc.tipeFile === 'Video' ? 'error' : 'primary'} 
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MasyarakatDetailLaporan;