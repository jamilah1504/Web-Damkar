import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

// -------------------------------------------------------------------------
// --- PERUBAHAN DIMULAI DI SINI ---
// Kita buat apiClient seperti di file EdukasiListPage.tsx
// Ini akan mem-bypass proxy Vite dan langsung menargetkan backend Anda.
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});
// --- PERUBAHAN SELESAI ---
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// ASUMSI SISTEM AUTENTIKASI ANDA
// (Ini tetap sama)
// -------------------------------------------------------------------------
const useAuth = () => {
  const userData = {
    id: 2,
    role: 'Masyarakat',
    name: 'Alya',
    email: 'alyamaraatunjamilah@gmail.com',
  };
  return { user: userData };
};
// -------------------------------------------------------------------------

// Definisikan tipe data Laporan (tetap sama)
interface Laporan {
  id: number;
  jenisKejadian: string;
  timestampDibuat: string;
  status: 'Menunggu Verifikasi' | 'Diproses' | 'Selesai' | 'Ditolak';
  // ...
}

// ... (steps dan getActiveStep tetap sama) ...
const steps = ['Menunggu Verifikasi', 'Diproses', 'Selesai'];

const getActiveStep = (status: Laporan['status']) => {
  const stepIndex = steps.indexOf(status);
  if (status === 'Ditolak') return -1;
  return stepIndex === -1 ? 0 : stepIndex;
};

const MasyarakatLacakLaporan: React.FC = () => {
  // --- State Management (tetap sama) ---
  const [laporanAktif, setLaporanAktif] = useState<Laporan | null>(null);
  const [riwayatList, setRiwayatList] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  // --- Data Fetching ---
  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      setError('User tidak ditemukan. Silakan login ulang.');
      return;
    }

    const fetchLaporan = async () => {
      try {
        setLoading(true);
        setError(null);

        // =================================================================
        // --- PERUBAHAN KEDUA DI SINI ---
        // Mengganti 'axios.get' dengan 'apiClient.get'
        // Path-nya '/reports' karena '/api' sudah ada di baseURL
        // =================================================================
        const response = await apiClient.get(`/reports?pelaporId=${user.id}`);

        // =================================================================
        // Data adalah 'response.data' (bukan response.data.data)
        // KARENA reportController (Kode 1) mengirim array langsung [ ... ]
        // =================================================================
        const allLaporan: Laporan[] = response.data;

        // Validasi jika 'allLaporan' ternyata bukan array
        if (!Array.isArray(allLaporan)) {
          console.error('Data dari server bukan array:', allLaporan);
          throw new Error('Format data dari server tidak terduga.');
        }

        // --- Logika Pemisahan Data (tetap sama) ---
        const aktif = allLaporan.find((l) => l.status !== 'Selesai' && l.status !== 'Ditolak');
        const riwayat = allLaporan.filter((l) => l.status === 'Selesai' || l.status === 'Ditolak');

        setLaporanAktif(aktif || null);
        setRiwayatList(riwayat);
      } catch (err: any) {
        console.error('Gagal fetch laporan:', err);
        setError(err.response?.data?.message || err.message || 'Gagal mengambil data laporan.');
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, [user]);

  // --- Render Logic (Tidak ada perubahan di sini) ---
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Memuat data laporan...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lacak & Riwayat Laporan
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Terjadi Kesalahan: {error}
        </Alert>
      )}

      {/* ... (Sisa JSX lainnya tetap sama) ... */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Status Laporan Aktif
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        {!laporanAktif ? (
          <Typography>Tidak ada laporan yang sedang aktif.</Typography>
        ) : (
          <>
            <Typography variant="h6" component="h2" gutterBottom>
              #{laporanAktif.id} - {laporanAktif.jenisKejadian}
            </Typography>

            {getActiveStep(laporanAktif.status) === -1 ? (
              <Alert severity="error">
                Mohon maaf, laporan Anda dengan ID #{laporanAktif.id} ditolak.
              </Alert>
            ) : (
              <Stepper activeStep={getActiveStep(laporanAktif.status)} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
          </>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Riwayat Laporan Anda
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Laporan</TableCell>
              <TableCell>Jenis Insiden</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Status Akhir</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riwayatList.length > 0 ? (
              riwayatList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>#{row.id}</TableCell>
                  <TableCell>{row.jenisKejadian}</TableCell>
                  <TableCell>
                    {new Date(row.timestampDibuat).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: row.status === 'Ditolak' ? 'red' : 'inherit',
                      }}
                    >
                      {row.status}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Anda belum memiliki riwayat laporan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MasyarakatLacakLaporan;
