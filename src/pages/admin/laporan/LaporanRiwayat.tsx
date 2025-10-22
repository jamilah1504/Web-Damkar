import { ReactElement, useState } from 'react';
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
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

// Tipe untuk data laporan yang di-generate
interface GeneratedReport {
  id: number; // Menambahkan ID untuk identifikasi unik
  title: string;
  period: string;
  totalIncidents: number;
  averageResponseTime: string;
}

// Data dummy awal untuk riwayat laporan yang sudah ada
const initialRiwayatLaporan: GeneratedReport[] = [
  {
    id: 202508,
    title: 'Laporan Insiden Bulanan',
    period: 'Agustus 2025',
    totalIncidents: 48,
    averageResponseTime: '8 Menit 05 Detik',
  },
  {
    id: 202507,
    title: 'Laporan Insiden Bulanan',
    period: 'Juli 2025',
    totalIncidents: 62,
    averageResponseTime: '7 Menit 40 Detik',
  },
];

const AdminLaporanPeriodik = (): ReactElement => {
  // State untuk filter
  const [reportType, setReportType] = useState('bulanan');
  const [month, setMonth] = useState('2025-09');

  // State untuk preview laporan yang baru di-generate
  const [previewData, setPreviewData] = useState<GeneratedReport | null>(null);

  // State untuk menyimpan daftar riwayat laporan (READ)
  const [riwayatLaporan, setRiwayatLaporan] = useState<GeneratedReport[]>(initialRiwayatLaporan);

  // Fungsi CREATE
  const handleGenerateReport = () => {
    const newId = Date.now(); // Generate ID unik sederhana
    const dummyReport: GeneratedReport = {
      id: newId,
      title: 'Laporan Insiden Bulanan',
      period: 'September 2025',
      totalIncidents: 54,
      averageResponseTime: '7 Menit 15 Detik',
    };
    // Tampilkan di area preview
    setPreviewData(dummyReport);
    // Tambahkan ke daftar riwayat
    setRiwayatLaporan([dummyReport, ...riwayatLaporan]);
  };

  // Fungsi DELETE
  const handleDeleteReport = (idToDelete: number) => {
    // Filter array untuk menghapus laporan dengan ID yang sesuai
    setRiwayatLaporan(riwayatLaporan.filter((report) => report.id !== idToDelete));
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
              </Select>
            </FormControl>
            <TextField
              label="Pilih Bulan & Tahun"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={handleGenerateReport}>
              Generate Laporan
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
              <Button variant="outlined" startIcon={<IconifyIcon icon="ph:file-pdf-fill" />}>
                Export ke PDF
              </Button>
              <Button variant="outlined" startIcon={<IconifyIcon icon="ph:file-xls-fill" />}>
                Export ke Excel
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
            <Typography color="text.secondary">Hasil generate akan ditampilkan di sini.</Typography>
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
              {riwayatLaporan.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>{row.totalIncidents}</TableCell>
                  <TableCell align="center">
                    <Button size="small" sx={{ mr: 1 }}>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default AdminLaporanPeriodik;
