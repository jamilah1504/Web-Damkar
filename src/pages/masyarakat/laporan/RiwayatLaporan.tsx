// src/pages/MasyarakatLacakLaporan.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card, // Tetap digunakan, tapi di-style ulang
  CardContent,
  CardMedia,
  Stack,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  InputAdornment, // Ditambahkan untuk ikon di TextField
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// useAuth (Tidak diubah)
const useAuth = () => {
  const [user, setUser] = React.useState<{ id?: number } | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { user };
};

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// === INTERFACES === (Tidak diubah)
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
  pelaporId: number;
  dokumentasi: { fileUrl: string; tipeFile: string }[];
  insiden?: { tugas?: { laporanLapangan?: LaporanLapanganType | null }[] } | null;
}

// === HELPER === (Tidak diubah)
const formatDate = (date: string) =>
  new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getStatusConfig = (status: string) => {
  const configs = {
    Selesai: { color: 'success' as const, icon: CheckIcon, label: 'Selesai' },
    Ditolak: { color: 'error' as const, icon: CancelIcon, label: 'Ditolak' },
    Diproses: { color: 'warning' as const, icon: WarningIcon, label: 'Diproses' },
    'Menunggu Verifikasi': {
      color: 'info' as const,
      icon: WarningIcon,
      label: 'Menunggu',
    },
  };
  return configs[status as keyof typeof configs] || configs['Menunggu Verifikasi'];
};

const MasyarakatLacakLaporan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allReports, setAllReports] = useState<Laporan[]>([]);
  const [filteredList, setFilteredList] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterJenis, setFilterJenis] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch Data (Tidak diubah)
  useEffect(() => {
    if (!user?.id) {
      setError('Silakan login terlebih dahulu.');
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/reports');
        const data: any[] = response.data;
        const userReports = data
          .filter((r: any) => r.pelaporId === user.id)
          .map(
            (r: any): Laporan => ({
              id: r.id,
              jenisKejadian: r.jenisKejadian,
              deskripsi: r.deskripsi,
              alamatKejadian: r.alamatKejadian,
              latitude: r.latitude,
              longitude: r.longitude,
              status: r.status,
              timestampDibuat: r.timestampDibuat,
              pelaporId: r.pelaporId,
              dokumentasi: r.dokumentasi || [],
              insiden: r.insiden || null,
            }),
          );
        setAllReports(userReports);
        setFilteredList(userReports);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat laporan');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user?.id]);

  // Filter (Tidak diubah)
  useEffect(() => {
    let filtered = allReports;
    if (filterJenis)
      filtered = filtered.filter((l) =>
        l.jenisKejadian.toLowerCase().includes(filterJenis.toLowerCase()),
      );
    if (filterTanggal)
      filtered = filtered.filter(
        (l) => new Date(l.timestampDibuat).toISOString().split('T')[0] === filterTanggal,
      );
    if (filterStatus) filtered = filtered.filter((l) => l.status === filterStatus);
    setFilteredList(filtered);
  }, [filterJenis, filterTanggal, filterStatus, allReports]);

  // *** STYLING CHANGE: Komponen Placeholder Foto ***
  // Didefinisikan di sini untuk digunakan dalam map
  const PlaceholderBox = () => (
    <Box
      sx={{
        height: 140, // Samakan tinggi dengan CardMedia
        borderRadius: 2,
        bgcolor: '#F0F0F0', // Warna abu-abu solid seperti desain
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary" fontSize={14} fontWeight={500}>
        Tidak ada foto
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          bgcolor: '#F8F9FA', // *** STYLING CHANGE ***
        }}
      >
        <CircularProgress size={60} thickness={5} />
        <Typography variant="h6" mt={3} color="text.secondary" fontWeight={500}>
          Memuat riwayat laporan...
        </Typography>
      </Box>
    );
  }

  return (
    // *** STYLING CHANGE: Latar belakang utama ***
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        {/* *** STYLING CHANGE: Judul Halaman *** */}
        <Typography variant="h4" fontWeight={600} color="#333">
          Riwayat Laporan
        </Typography>
        {/* *** STYLING CHANGE: Chip Jumlah Laporan *** */}
        <Chip
          label={`${filteredList.length} Laporan`}
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            px: 2,
            py: 2,
            borderRadius: 2, // 8px
            bgcolor: '#F7941D', // Orange dari desain
            color: 'white',
          }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontWeight: 500 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* FILTER */}
        <Grid item xs={12} lg={4}>
          {/* *** STYLING CHANGE: Filter Card *** */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2, // 8px
              bgcolor: 'white',
              borderColor: '#E0E0E0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Shadow lebih halus
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3} color="#333">
              Filter Laporan
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Jenis Kejadian"
                size="medium"
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                placeholder="Cari Banjir, Kebakaran..."
                // *** STYLING CHANGE: borderRadius ***
                InputProps={{ style: { borderRadius: 8 } }}
              />
              <TextField
                fullWidth
                label="Tanggal"
                type="date"
                size="medium"
                InputLabelProps={{ shrink: true }} // Ini penting untuk type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                InputProps={{
                  style: { borderRadius: 8 },
                  // endAdornment dihapus agar ikon kalender bawaan browser muncul
                }}
              />
              <TextField
                fullWidth
                select
                label="Status"
                size="medium"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                SelectProps={{ native: true }} // Ini sudah benar untuk tampilan bawaan
                InputProps={{ style: { borderRadius: 8 } }}
              >
                <option value="">Semua Status</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </TextField>
              {/* *** STYLING CHANGE: Tombol Reset *** */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  borderRadius: 2, // 8px
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: 0,
                  bgcolor: '#F7941D',
                  '&:hover': { bgcolor: '#E6891A', boxShadow: 0 },
                }}
                onClick={() => {
                  setFilterJenis('');
                  setFilterTanggal('');
                  setFilterStatus('');
                }}
              >
                Reset Filter
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* LIST LAPORAN */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {filteredList.length > 0 ? (
              filteredList.map((laporan) => {
                const images = laporan.dokumentasi || [];
                const statusConfig = getStatusConfig(laporan.status);

                // *** STYLING CHANGE: Rombak total Kartu Laporan ***
                return (
                  <Paper
                    key={laporan.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      p: 3,
                      width: '100%',
                      bgcolor: 'white',
                      borderColor: '#E0E0E0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* Baris 1: Jenis Kejadian */}
                      <Grid item xs={12} sm={6}>
                        <Chip
                          label={laporan.jenisKejadian}
                          sx={{
                            bgcolor: '#F7941D',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        sx={{
                          display: 'flex',
                          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        <Chip
                          icon={<CalendarIcon sx={{ color: 'white !important' }} />}
                          label={formatDate(laporan.timestampDibuat)}
                          size="medium"
                          sx={{
                            bgcolor: '#616161',
                            color: 'white',
                            fontWeight: 500,
                            borderRadius: '8px',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          {images.length > 0 ? (
                            <>
                              {images.slice(0, 2).map((doc, idx) => (
                                <Grid item xs={12} sm={6} key={idx}>
                                  <CardMedia
                                    component="img"
                                    height={140}
                                    image={`http://localhost:5000${doc.fileUrl}`}
                                    alt={`Bukti ${idx + 1}`}
                                    sx={{
                                      borderRadius: 2,
                                      objectFit: 'cover',
                                      cursor: 'pointer',
                                      transition: 'transform 0.3s',
                                      '&:hover': { transform: 'scale(1.05)' },
                                    }}
                                    onClick={() =>
                                      setSelectedImage(`http://localhost:5000${doc.fileUrl}`)
                                    }
                                  />
                                </Grid>
                              ))}
                              {images.length === 1 && (
                                <Grid item xs={12} sm={6}>
                                  <PlaceholderBox />
                                </Grid>
                              )}
                            </>
                          ) : (
                            <>
                              <Grid item xs={12} sm={6}>
                                <PlaceholderBox />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <PlaceholderBox />
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Grid>

                      {/* Baris 3: Lokasi, Status, Tombol */}
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Grid container alignItems="center" spacing={2}>
                          {/* Kiri: Lokasi + Status */}
                          <Grid item xs={12} md={6}>
                            <Stack spacing={1} alignItems="flex-start">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                              >
                                {laporan.alamatKejadian || '🗺️Lokasi GPS'}
                              </Typography>
                              <Chip
                                icon={<statusConfig.icon sx={{ fontSize: 18 }} />}
                                label={statusConfig.label}
                                color={statusConfig.color}
                                size="medium"
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                            </Stack>
                          </Grid>

                          {/* Kanan: Tombol-tombol */}
                          <Grid item xs={12} md={6}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                              sx={{ mt: { xs: 2, md: 0 } }}
                            >
                              <Button
                                variant="contained"
                                size="medium"
                                startIcon={<LocationOnIcon />}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  bgcolor: '#F7941D',
                                  color: 'white',
                                  boxShadow: 0,
                                  '&:hover': { bgcolor: '#E6891A', boxShadow: 0 },
                                }}
                                onClick={() => {
                                  if (laporan.latitude && laporan.longitude) {
                                    // *** PERBAIKAN LOGIKA: URL Google Maps yang benar ***
                                    window.open(
                                      `https://www.google.com/maps/search/?api=1&query=${laporan.latitude},${laporan.longitude}`,
                                      '_blank',
                                    );
                                  }
                                }}
                              >
                                Lihat Peta
                              </Button>
                              <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<VisibilityIcon />}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderColor: '#F7941D',
                                  color: '#F7941D',
                                  '&:hover': {
                                    bgcolor: '#F7941D',
                                    color: 'white',
                                    borderColor: '#F7941D',
                                  },
                                }}
                                onClick={() => navigate(`/masyarakat/laporan/detail/${laporan.id}`)}
                              >
                                Lihat Detail
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })
            ) : (
              // *** STYLING CHANGE: Tampilan "Belum Ada Laporan" ***
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 4, md: 8 },
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'white',
                  borderColor: '#E0E0E0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WarningIcon sx={{ fontSize: 60, color: 'grey.400', mb: 3 }} />
                <Typography variant="h5" fontWeight={600} color="text.primary" mb={1}>
                  Belum Ada Laporan
                </Typography>
                <Typography variant="body1" color="text.secondary" maxWidth={400}>
                  Laporan pertama Anda akan muncul di sini setelah dikirim.
                </Typography>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MasyarakatLacakLaporan;
