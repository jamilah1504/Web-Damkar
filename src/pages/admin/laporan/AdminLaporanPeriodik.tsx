import { ReactElement, useState, useEffect } from 'react';
import axios from 'axios';
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
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });

// --- TIPE DATA SEDERHANA ---
interface PreviewData {
  title: string;
  period: string;
  totalIncidents: number;
  averageResponseTime: string;
}

interface ReportItem {
  id: number;
  title: string;
  period: string;
  totalIncidents: number;
  averageResponseTime: string;
  fileUrl?: string;
}

const AdminLaporanPeriodik = (): ReactElement => {
  const currentDate = new Date();
  const [type, setType] = useState('bulanan');
  const [month, setMonth] = useState(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [history, setHistory] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportTypes, setReportTypes] = useState<string[]>([]);

  const fetchReportTypes = async () => {
    try {
      const { data } = await apiClient.get('/laporan-periodik/types'); // Pastikan endpoint ini benar
      setReportTypes(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal ambil jenis laporan.');
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await apiClient.get('/laporan-periodik');
      setHistory(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal ambil riwayat.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
    fetchHistory();
  }, []);

  const generatePreview = async () => {
    setLoading(true);
    setPreview(null);
    setError(null);
    try {
      const { data } = await apiClient.get('/laporan-periodik/preview', {
        params: { type, month },
      });
      setPreview(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal generate preview.');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    const params = new URLSearchParams({ type, month, format });
    window.open(`/api/laporan-periodik/export?${params}`, '_blank');
    setTimeout(fetchHistory, 2000);
  };

  const deleteReport = async (id: number) => {
    try {
      await apiClient.delete(`/laporan-periodik/${id}`);
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal hapus.');
    }
  };

  return (
    <Grid container spacing={3} sx={{ p: 3, bgcolor: '#fff4ea' }}>
      <Grid item xs={12}>
        <Typography variant="h4">Laporan Periodik</Typography>
        <Typography color="text.secondary">Generate dan kelola laporan operasional.</Typography>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {/* FILTER */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Filter</Typography>
          <Stack spacing={3} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Jenis Laporan</InputLabel>
              <Select value={type} label="Jenis Laporan" onChange={(e) => setType(e.target.value)}>
                {reportTypes.map((reportType) => (
                  <MenuItem key={reportType} value={reportType}>
                    {reportType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Bulan & Tahun"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={generatePreview} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Generate Preview'}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* PREVIEW */}
      <Grid item xs={12} md={8}>
        {preview ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" align="center">
              {preview.title}
            </Typography>
            <Typography color="text.secondary" align="center" mb={3}>
              Periode: {preview.period}
            </Typography>

            <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
              <Typography variant="h4" color="primary">
                {preview.totalIncidents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Insiden
              </Typography>
              <Typography variant="body1" mt={2}>
                {preview.averageResponseTime}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Waktu Respon Rata-rata
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="ph:file-pdf-fill" />}
                onClick={() => exportReport('pdf')}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="ph:file-xls-fill" />}
                onClick={() => exportReport('excel')}
              >
                Export Excel
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
              {loading ? 'Memuat...' : 'Klik "Generate Preview" untuk melihat data.'}
            </Typography>
          </Paper>
        )}
      </Grid>

      {/* RIWAYAT */}
      <Grid item xs={12}>
        <Typography variant="h6" mb={2}>
          Riwayat Laporan
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Judul</TableCell>
                <TableCell>Periode</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Respon</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingHistory ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Belum ada riwayat.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.period}</TableCell>
                    <TableCell>{r.totalIncidents}</TableCell>
                    <TableCell>{r.averageResponseTime}</TableCell>
                    <TableCell align="center">
                      {r.fileUrl ? (
                        <Button size="small" href={r.fileUrl} target="_blank" sx={{ mr: 1 }}>
                          Download
                        </Button>
                      ) : (
                        <Button size="small" disabled sx={{ mr: 1 }}>
                          Download
                        </Button>
                      )}
                      <IconButton color="error" size="small" onClick={() => deleteReport(r.id)}>
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
