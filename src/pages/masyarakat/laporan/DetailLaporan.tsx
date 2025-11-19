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
  Avatar, // <-- BARU: Untuk menampilkan pelapor
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Person as PersonIcon, // <-- BARU: Ikon pelapor
  Info as InfoIcon, // <-- BARU: Ikon insiden
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });

// --- (TIDAK BERUBAH) ---
interface LaporanLapanganType {
  jumlahKorban: number;
  estimasiKerugian: number | null;
  dugaanPenyebab: string | null;
  catatan: string | null;
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
// --- (AKHIR TIDAK BERUBAH) ---

// === PERBAIKAN 1: Perbarui Interface Laporan ===
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
  // Perbaikan nama field (D besar dan 's')
  Dokumentasis: { fileUrl: string; tipeFile: string }[]; 
  insiden?: { tugas?: { laporanLapangan?: LaporanLapanganType | null }[] } | null;
  // Tambahkan field yang hilang
  Pelapor: Pelapor | null;
  Petugas: any | null; // (Bisa didefinisikan lebih detail jika perlu)
  InsidenTerkait: InsidenTerkait | null;
}

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

        // === PERBAIKAN 2: Mapping data yang lengkap ===
        setLaporan({
          id: data.id,
          jenisKejadian: data.jenisKejadian,
          deskripsi: data.deskripsi,
          alamatKejadian: data.alamatKejadian,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          timestampDibuat: data.timestampDibuat,
          // Perbaikan mapping field
          Dokumentasis: data.Dokumentasis || [],
          insiden: data.insiden || null,
          // Tambahkan mapping field yang hilang
          Pelapor: data.Pelapor || null,
          Petugas: data.Petugas || null,
          InsidenTerkait: data.InsidenTerkait || null,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat detail laporan');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLaporan();
  }, [id]);

  // --- (Render Loading & Error tidak berubah) ---
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
  const laporanLapangan = laporan.insiden?.tugas?.[0]?.laporanLapangan;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'black' }} />
        </IconButton>
        <Typography variant="h4" fontWeight={700} color="#333">
          Detail Laporan
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        {/* === KOLOM KIRI (Info Utama) === */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'white' }}>
            <Stack spacing={3}>
              {/* Judul & Tanggal */}
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {laporan.jenisKejadian}
                </Typography>
                <Chip
                  icon={<CalendarIcon />}
                  label={formatDate(laporan.timestampDibuat)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              <Divider />

              {/* Deskripsi */}
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Deskripsi
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                  {laporan.deskripsi || 'Tidak ada deskripsi.'}
                </Typography>
              </Box>

              {/* Lokasi */}
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Lokasi
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationOnIcon color="primary" />
                  <Typography>{laporan.alamatKejadian || 'Lokasi GPS'}</Typography>
                </Stack>
                {laporan.latitude && laporan.longitude && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocationOnIcon />}
                    sx={{ mt: 1.5, borderRadius: 2 }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${laporan.latitude},${laporan.longitude}`,
                        '_blank',
                      )
                    }
                  >
                    Buka Peta
                  </Button>
                )}
              </Box>

              {/* Status Laporan */}
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Status Laporan Anda
                </Typography>
                <Chip
                  icon={<statusConfig.icon />}
                  label={statusConfig.label}
                  color={statusConfig.color}
                  sx={{ fontWeight: 600, fontSize: '1rem', p: 1 }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* === KOLOM KANAN (Info Terkait & Hasil) === */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            
            {/* === PERBAIKAN 4: Tampilkan Info Pelapor & Insiden === */}
            {(laporan.Pelapor || laporan.InsidenTerkait) && (
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, bgcolor: 'white' }}>
                <Typography variant="h6" fontWeight={700} mb={2} color="#333">
                  Detail Terkait
                </Typography>
                <Stack spacing={2.5}>
                  {laporan.Pelapor && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.2}}>
                          Pelapor
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
                        <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.2}}>
                          Insiden Terkait
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {laporan.InsidenTerkait.statusInsiden}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {laporan.InsidenTerkait.judulInsiden}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Laporan Lapangan (Kode Asli Anda) */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: laporanLapangan ? '#E8F5E9' : '#FFF3E0',
                border: laporanLapangan ? '1px solid #4CAF50' : '1px solid #FF9800',
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
                color={laporanLapangan ? 'success.main' : 'warning.main'}
              >
                {laporanLapangan ? 'Hasil Penanganan' : 'Belum Ada Laporan Lapangan'}
              </Typography>
              {laporanLapangan ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Korban</Typography>
                    <Typography variant="h6">{laporanLapangan.jumlahKorban} orang</Typography>
                  </Box>
                  {laporanLapangan.estimasiKerugian && (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Kerugian</Typography>
                      <Typography variant="h6">
                        Rp {laporanLapangan.estimasiKerugian.toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                  )}
                  {laporanLapangan.dugaanPenyebab && (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Penyebab</Typography>
                      <Typography variant="body1">"{laporanLapangan.dugaanPenyebab}"</Typography>
                    </Box>
                  )}
                  {laporanLapangan.catatan && (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Catatan</Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "{laporanLapangan.catatan}"
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Petugas belum mengirimkan laporan lapangan.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* === PERBAIKAN 5: Tampilkan Dokumentasi (Gambar & Video) === */}
      {laporan.Dokumentasis.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight={700} mb={3} color="#333">
            Dokumentasi
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
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => window.open(`http://localhost:5000/uploads/${doc.fileUrl}`, '_blank')}
                >
                  {/* Cek Tipe File! */}
                  {doc.tipeFile === 'Gambar' ? (
                    <Box
                      component="img"
                      src={`http://localhost:5000/uploads/${doc.fileUrl}`}
                      alt={`Bukti ${idx + 1}`}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                  ) : doc.tipeFile === 'Video' ? (
                    <Box
                      component="video"
                      src={`http://localhost:5000/uploads/${doc.fileUrl}`}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                      controls
                    />
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                      <Typography variant="caption">Format tidak didukung</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'white' }}>
                    <Typography variant="body2" fontWeight={500}>{doc.tipeFile} {idx + 1}</Typography>
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