import { ReactElement, useState, useEffect } from 'react';
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
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import api from '../../../api';

// =============================
// INTERFACES
// =============================
interface BreakdownItem {
  jenisKejadian: string;
  count: number;
}

interface PreviewData {
  title: string;
  period: string;
  totalIncidents: number;
  averageResponseTime: string;
  breakdown: BreakdownItem[];
  generatedAt?: string;
}

interface ReportItem {
  id: number;
  title: string;
  period: string;
  totalIncidents?: number;
  fileUrl?: string;
  timestampDibuat: string;
}

// =============================
// MAIN COMPONENT
// =============================
const AdminLaporanPeriodik = (): ReactElement => {
  const today = new Date();

  // --- FILTER STATE ---
  const [mode, setMode] = useState<'harian' | 'bulanan' | 'triwulan' | 'tahunan'>('harian');
  const [date, setDate] = useState(today.toISOString().split('T')[0]);
  const [month, setMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
  );
  const [quarter, setQuarter] = useState('1');
  const [year, setYear] = useState(String(today.getFullYear()));

  // --- DATA STATE ---
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [history, setHistory] = useState<ReportItem[]>([]);

  // --- UI STATE ---
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // =============================
  // GET PARAMS HELPER
  // =============================
  const getParams = (format?: string) => {
    const params: any = { type: mode };
    if (mode === 'harian') params.date = date;
    if (mode === 'bulanan') params.month = month;
    if (mode === 'triwulan') {
      params.quarter = quarter;
      params.year = year;
    }
    if (mode === 'tahunan') params.year = year;
    if (format) params.format = format;
    return params;
  };

  // =============================
  // FETCH HISTORY
  // =============================
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/laporan-periodik');
      setHistory(data.data || []);
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // =============================
  // GENERATE PREVIEW
  // =============================
  const generatePreview = async () => {
    setLoadingPreview(true);
    setError(null);
    setPreview(null);

    try {
      const response = await api.get('laporan-periodik/preview', { params: getParams() });
      setPreview(response.data.data);
    } catch (err: any) {
      console.error('Error preview:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Gagal memuat preview. Pastikan parameter benar.');
    } finally {
      setLoadingPreview(false);
    }
  };

  // =============================
  // EXPORT FILE — DIPERBAIKI TOTAL (INI YANG BIKIN DOWNLOAD JALAN!)
  // =============================
  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(format);
    setError(null);

    try {
      const response = await api.get('laporan-periodik/export', {
        params: getParams(format),
        responseType: 'blob',
        timeout: 300000, // 5 menit (PDF bisa lama)
      });

      // Nama file yang rapi
      let filename = `Laporan_${mode}`;
      if (mode === 'harian') filename += `_${date}`;
      if (mode === 'bulanan') filename += `_${month}`;
      if (mode === 'triwulan') filename += `_Q${quarter}_${year}`;
      if (mode === 'tahunan') filename += `_${year}`;
      filename += `_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

      const blob = new Blob([response.data], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Refresh history
      fetchHistory();
    } catch (err: any) {
      console.error('Export error:', err);

      if (err.response) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          setError(json.message || 'Gagal export laporan');
        } catch {
          setError(
            err.response.status === 404
              ? 'Tidak ada data insiden pada periode ini.'
              : 'Parameter tidak valid. Periksa kembali pilihan periode.',
          );
        }
      } else {
        setError('Gagal terhubung ke server. Cek backend.');
      }
    } finally {
      setExportLoading(null);
    }
  };

  // =============================
  // DELETE REPORT
  // =============================
  const deleteReport = async (id: number) => {
    if (!confirm('Yakin menghapus laporan ini? File akan ikut terhapus.')) return;
    try {
      await api.delete(`laporan-periodik/${id}`);
      fetchHistory();
    } catch (err) {
      alert('Gagal menghapus laporan.');
    }
  };

  // =============================
  // RENDER UI
  // =============================
  return (
    <Grid container spacing={3} sx={{ p: 3, bgcolor: '#fff4ea', minHeight: '100vh' }}>
      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight="bold" color="#000">
          Pusat Laporan & Statistik Insiden
        </Typography>
        <Typography color="text.secondary">
          Generate laporan berkala dan unduh dalam format PDF atau Excel.
        </Typography>
      </Grid>

      {/* ERROR ALERT */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* FILTER PANEL */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Filter Data
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Jenis Periode</InputLabel>
              <Select
                value={mode}
                label="Jenis Periode"
                onChange={(e) => setMode(e.target.value as any)}
              >
                <MenuItem value="harian">Harian</MenuItem>
                <MenuItem value="bulanan">Bulanan</MenuItem>
                <MenuItem value="triwulan">Triwulan</MenuItem>
                <MenuItem value="tahunan">Tahunan</MenuItem>
              </Select>
            </FormControl>

            {mode === 'harian' && (
              <TextField
                label="Tanggal"
                type="date"
                size="small"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {mode === 'bulanan' && (
              <TextField
                label="Bulan & Tahun"
                type="month"
                size="small"
                fullWidth
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {mode === 'triwulan' && (
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kuartal</InputLabel>
                  <Select
                    value={quarter}
                    label="Kuartal"
                    onChange={(e) => setQuarter(e.target.value)}
                  >
                    <MenuItem value="1">Q1 (Jan-Mar)</MenuItem>
                    <MenuItem value="2">Q2 (Apr-Jun)</MenuItem>
                    <MenuItem value="3">Q3 (Jul-Sep)</MenuItem>
                    <MenuItem value="4">Q4 (Okt-Des)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Tahun"
                  type="number"
                  size="small"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Stack>
            )}
            {mode === 'tahunan' && (
              <TextField
                label="Tahun"
                type="number"
                size="small"
                fullWidth
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={generatePreview}
              disabled={loadingPreview}
              startIcon={
                loadingPreview ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconifyIcon icon="ph:magnifying-glass-bold" />
                )
              }
            >
              {loadingPreview ? 'Memproses...' : 'Tampilkan Preview'}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* PREVIEW RESULT */}
      <Grid item xs={12} md={8}>
        {preview ? (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                {preview.title}
              </Typography>
              <Chip
                label={preview.period}
                color="primary"
                variant="outlined"
                sx={{ mt: 1, fontWeight: 'bold' }}
              />
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <Card
                  sx={{ bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="error.main">
                      {preview.totalIncidents}
                    </Typography>
                    <Typography variant="subtitle2">Total Insiden</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{ bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      {preview.averageResponseTime}
                    </Typography>
                    <Typography variant="subtitle2">Rata-rata Waktu Respon</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="bold" mb={2}>
              Detail Kejadian
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>
                      <b>Jenis Kejadian</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Jumlah</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.breakdown.length > 0 ? (
                    preview.breakdown.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>{b.jenisKejadian}</TableCell>
                        <TableCell align="right">
                          <Chip label={b.count} size="small" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleExport('pdf')}
                disabled={!!exportLoading || preview.totalIncidents === 0}
                startIcon={
                  exportLoading === 'pdf' ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconifyIcon icon="ph:file-pdf-fill" />
                  )
                }
              >
                {exportLoading === 'pdf' ? 'Membuat PDF...' : 'Download PDF'}
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleExport('excel')}
                disabled={!!exportLoading || preview.totalIncidents === 0}
                startIcon={
                  exportLoading === 'excel' ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconifyIcon icon="ph:file-xls-fill" />
                  )
                }
              >
                {exportLoading === 'excel' ? 'Membuat Excel...' : 'Download Excel'}
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper
            sx={{
              p: 6,
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 3,
            }}
          >
            <IconifyIcon icon="ph:chart-bar-duotone" width={80} height={80} color="#9e9e9e" />
            <Typography color="text.secondary" mt={2} textAlign="center">
              Pilih periode lalu klik "Tampilkan Preview" untuk melihat data
            </Typography>
          </Paper>
        )}
      </Grid>

      {/* HISTORY */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Arsip Laporan
          </Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.200' }}>
                <TableRow>
                  <TableCell>Judul</TableCell>
                  <TableCell>Periode</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Dibuat</TableCell>
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
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Belum ada laporan
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <b>{r.title}</b>
                      </TableCell>
                      <TableCell>{r.period}</TableCell>
                      <TableCell>
                        <Chip
                          label={r.fileUrl ? 'Tersedia' : 'Hilang'}
                          color={r.fileUrl ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(r.timestampDibuat).toLocaleString('id-ID')}</TableCell>
                      <TableCell align="center">
                        {r.fileUrl && (
                          <IconButton
                            href={`http://localhost:5000${r.fileUrl}`}
                            target="_blank"
                            color="primary"
                          >
                            <IconifyIcon icon="ph:download-simple-bold" />
                          </IconButton>
                        )}
                        <IconButton color="error" onClick={() => deleteReport(r.id)}>
                          <IconifyIcon icon="ph:trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminLaporanPeriodik;
