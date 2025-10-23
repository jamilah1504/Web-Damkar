import { ReactElement, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress, // Untuk loading
  Alert, // Untuk error
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

// Konfigurasi apiClient (sesuaikan jika perlu)
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Sesuaikan port jika backend berbeda
});

// Tipe untuk data laporan
interface GeneratedReport {
  id: number;
  title: string;
  period: string;
  totalIncidents: number;
  averageResponseTime: string;
  // Tambahkan field lain jika ada, misal: fileUrl
}

// Tipe untuk preview (mungkin belum punya ID)
type ReportPreview = Omit<GeneratedReport, 'id'>;

const AdminLaporanPeriodik = (): ReactElement => {
  // State untuk filter
  const [reportType, setReportType] = useState('bulanan');
  const [month, setMonth] = useState('2025-09'); // Default ke bulan yg valid

  // State untuk preview laporan
  const [previewData, setPreviewData] = useState<ReportPreview | null>(null);

  // State untuk daftar riwayat laporan (READ)
  const [riwayatLaporan, setRiwayatLaporan] = useState<GeneratedReport[]>([]);

  // State untuk loading dan error
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- FUNGSI READ (Riwayat) ---
  const fetchRiwayat = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      // Asumsi: GET /api/laporan/riwayat mengembalikan daftar laporan
      const response = await apiClient.get('/laporan');
      setRiwayatLaporan(response.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil riwayat:', err);
      setError('Gagal mengambil riwayat laporan.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Panggil fetchRiwayat saat komponen pertama kali dimuat
  useEffect(() => {
    fetchRiwayat();
  }, []);

  // --- FUNGSI PREVIEW (dari Tombol Generate) ---
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setPreviewData(null);
    setError(null);
    try {
      // Asumsi: GET /api/laporan/preview mengembalikan data statistik untuk preview
      const response = await apiClient.get('/laporan/preview', {
        params: {
          type: reportType,
          month: month,
        },
      });
      setPreviewData(response.data.data);
    } catch (err: any) {
      console.error('Gagal generate preview:', err);
      setError(err.response?.data?.message || 'Gagal men-generate preview laporan.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- FUNGSI EXPORT (sekaligus CREATE) ---
  const handleExport = async (format: 'pdf' | 'excel') => {
    setError(null);
    try {
      // Asumsi: GET /api/laporan/export akan men-generate file DAN menyimpan ke riwayat
      const params = new URLSearchParams({
        type: reportType,
        month: month,
        format: format,
      });

      const url = `${apiClient.defaults.baseURL}/laporan/export?${params.toString()}`;

      // Buka URL di tab baru untuk memicu download
      window.open(url, '_blank');

      // Beri jeda sedikit agar backend sempat memproses dan menyimpan
      // lalu refresh daftar riwayat
      setTimeout(() => {
        fetchRiwayat();
        setPreviewData(null); // Kosongkan preview setelah diekspor
      }, 2000); // refresh setelah 2 detik
    } catch (err: any) {
      console.error('Gagal export:', err);
      setError(err.response?.data?.message || 'Gagal mengekspor laporan.');
    }
  };

  // --- FUNGSI DELETE ---
  const handleDeleteReport = async (idToDelete: number) => {
    setError(null);
    try {
      // Asumsi: DELETE /api/laporan/riwayat/:id untuk menghapus
      await apiClient.delete(`/laporan/riwayat/${idToDelete}`);
      // Refresh daftar riwayat setelah berhasil hapus
      fetchRiwayat();
    } catch (err: any) {
      console.error('Gagal menghapus:', err);
      setError(err.response?.data?.message || 'Gagal menghapus laporan.');
    }
  };

  return (
    <Grid container spacing={3} sx={{ p: 3, bgcolor: '#fff4ea' }}>
      {/* Judul Halaman */}
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Laporan Periodik
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate dan kelola rekapitulasi data operasional.
        </Typography>
      </Grid>

      {/* Error Global */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {/* Generator (CREATE) */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Filter & Opsi
          </Typography>
          <Stack spacing={3} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Jenis Laporan</InputLabel>
              <Select
                value={reportType}
                label="Jenis Laporan"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="bulanan">Bulanan</MenuItem>
                {/* Tambahkan opsi lain jika ada */}
              </Select>
            </FormControl>
            <TextField
              label="Pilih Bulan & Tahun"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={isGenerating} // Disable tombol saat loading
            >
              {isGenerating ? <CircularProgress size={24} /> : 'Generate Preview'}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* Preview Hasil Generate */}
      <Grid item xs={12} md={8}>
        {previewData ? (
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6">Preview: {previewData.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={2}>
              Periode: {previewData.period}
            </Typography>
            <Stack spacing={2} mb={3}>
              <Typography>
                <strong>Total Insiden:</strong> {previewData.totalIncidents}
              </Typography>
              <Typography>
                <strong>Waktu Respon Rata-rata:</strong> {previewData.averageResponseTime}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="ph:file-pdf-fill" />}
                onClick={() => handleExport('pdf')}
              >
                Export ke PDF & Simpan
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="ph:file-xls-fill" />}
                onClick={() => handleExport('excel')}
              >
                Export ke Excel & Simpan
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              {isGenerating ? <CircularProgress /> : 'Hasil preview akan ditampilkan di sini.'}
            </Typography>
          </Paper>
        )}
      </Grid>

      {/* Tabel Riwayat Laporan (READ & DELETE) */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
          Riwayat Laporan Periodik
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Judul Laporan</TableCell>
                <TableCell>Periode</TableCell>
                <TableCell>Total Insiden</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingHistory ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : riwayatLaporan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    Belum ada riwayat laporan.
                  </TableCell>
                </TableRow>
              ) : (
                riwayatLaporan.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>{row.totalIncidents}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        sx={{ mr: 1 }}
                        // Jika backend menyimpan URL file, gunakan ini:
                        // href={row.fileUrl}
                        // target="_blank"
                        // Untuk saat ini, kita asumsikan download hanya dari export baru
                        disabled // Hapus disabled jika punya fileUrl
                      >
                        Download
                      </Button>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteReport(row.id)}
                      >
                        <IconifyIcon icon="ph:trash-fill" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default AdminLaporanPeriodik;
