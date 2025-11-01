// src/pages/masyarakat/laporan/DetailLaporan.tsx
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });

interface LaporanLapanganType {
  jumlahKorban: number;
  estimasiKerugian: number | null;
  dugaanPenyebab: string | null;
  catatan: string | null;
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
  dokumentasi: { fileUrl: string; tipeFile: string }[];
  insiden?: { tugas?: { laporanLapangan?: LaporanLapanganType | null }[] } | null;
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

        setLaporan({
          id: data.id,
          jenisKejadian: data.jenisKejadian,
          deskripsi: data.deskripsi,
          alamatKejadian: data.alamatKejadian,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          timestampDibuat: data.timestampDibuat,
          dokumentasi: data.dokumentasi || [],
          insiden: data.insiden || null,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat detail laporan');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLaporan();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
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
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'white' }}>
            <Stack spacing={3}>
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
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Deskripsi
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  {laporan.deskripsi || 'Tidak ada deskripsi.'}
                </Typography>
              </Box>
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
                    sx={{ mt: 1, borderRadius: 2 }}
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
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Status
                </Typography>
                <Chip
                  icon={<statusConfig.icon />}
                  label={statusConfig.label}
                  color={statusConfig.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 4,
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
                  <Typography variant="body2" fontWeight={600}>
                    Korban
                  </Typography>
                  <Typography variant="h6">{laporanLapangan.jumlahKorban} orang</Typography>
                </Box>
                {laporanLapangan.estimasiKerugian && (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Kerugian
                    </Typography>
                    <Typography variant="h6">
                      Rp {laporanLapangan.estimasiKerugian.toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                )}
                {laporanLapangan.dugaanPenyebab && (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Penyebab
                    </Typography>
                    <Typography variant="body1">"{laporanLapangan.dugaanPenyebab}"</Typography>
                  </Box>
                )}
                {laporanLapangan.catatan && (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Catatan
                    </Typography>
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
        </Grid>
      </Grid>

      {laporan.dokumentasi.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Dokumentasi
          </Typography>
          <Grid container spacing={2}>
            {laporan.dokumentasi.map((doc, idx) => (
              <Grid item xs={6} sm={4} md={3} key={idx}>
                <Paper
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: '0.3s',
                  }}
                  onClick={() => window.open(`http://localhost:5000${doc.fileUrl}`, '_blank')}
                >
                  <img
                    src={`http://localhost:5000${doc.fileUrl}`}
                    alt={`Bukti ${idx + 1}`}
                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="caption">Bukti {idx + 1}</Typography>
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
