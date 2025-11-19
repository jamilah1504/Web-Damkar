import React, { useEffect, useState } from 'react';
import { 
  Box, Grid, Paper, Typography, Card, CardContent, Stack, CircularProgress,
  TextField, MenuItem, Button, IconButton, Tooltip as MuiTooltip, Divider
} from '@mui/material';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import api from '../../api'; 
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportData {
  id: number;
  deskripsi: string;
  jenisKejadian: string; 
  status: string;
  timestampDibuat: string;
}

const GrafikLaporan: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // 1. State Data Mentah (Master) vs Data Hasil Filter
  const [masterData, setMasterData] = useState<ReportData[]>([]);
  
  // 2. State untuk Filter Controls
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    jenis: 'All',
    status: 'All'
  });

  // 3. State Statistik (Untuk Chart)
  const [stats, setStats] = useState({
    total: 0,
    kebakaran: 0,
    nonKebakaran: 0,
    dailyLabels: [] as string[],
    dailyValues: [] as number[],
    jenisLabels: [] as string[],
    jenisValues: [] as number[],
    statusLabels: [] as string[],
    statusValues: [] as number[],
  });

  // === FETCH DATA AWAL ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports');
        const rawData: ReportData[] = response.data;
        
        // Simpan ke Master Data (Jangan diubah-ubah)
        setMasterData(rawData);
        
        // Proses data awal (tanpa filter)
        processData(rawData);
      } catch (error) {
        console.error("Gagal memuat data grafik", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // === LOGIC FILTERING ===
  // Dijalankan setiap kali user mengubah input filter
  useEffect(() => {
    if (masterData.length === 0) return;

    let filtered = [...masterData];

    // A. Filter Jenis Kejadian
    if (filters.jenis !== 'All') {
      if (filters.jenis === 'Lainnya') {
        filtered = filtered.filter(d => !d.jenisKejadian || (d.jenisKejadian.toLowerCase() !== 'kebakaran' && d.jenisKejadian.toLowerCase() !== 'non kebakaran'));
      } else {
        filtered = filtered.filter(d => d.jenisKejadian?.toLowerCase() === filters.jenis.toLowerCase());
      }
    }

    // B. Filter Status
    if (filters.status !== 'All') {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    // C. Filter Tanggal (Start Date)
    if (filters.startDate) {
      const start = new Date(filters.startDate).setHours(0,0,0,0);
      filtered = filtered.filter(d => new Date(d.timestampDibuat).getTime() >= start);
    }

    // D. Filter Tanggal (End Date)
    if (filters.endDate) {
      const end = new Date(filters.endDate).setHours(23,59,59,999);
      filtered = filtered.filter(d => new Date(d.timestampDibuat).getTime() <= end);
    }

    // Proses ulang data yang sudah disaring untuk grafik
    processData(filtered);

  }, [filters, masterData]);

  // === LOGIC PENGOLAHAN DATA CHART ===
  const processData = (data: ReportData[]) => {
    // 1. Hitung Kartu Ringkasan
    const total = data.length;
    const kebakaran = data.filter(d => d.jenisKejadian?.toLowerCase() === 'kebakaran').length;
    const nonKebakaran = data.filter(d => d.jenisKejadian?.toLowerCase() === 'non kebakaran').length;

    // 2. Tren Harian (Line Chart)
    const dateMap: { [key: string]: number } = {};
    const sortedByDate = [...data].sort((a, b) => new Date(a.timestampDibuat).getTime() - new Date(b.timestampDibuat).getTime());
    
    sortedByDate.forEach(item => {
      const date = new Date(item.timestampDibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    // 3. Jenis Kejadian (Doughnut)
    const jenisMap: { [key: string]: number } = {};
    data.forEach(item => {
      let jenis = item.jenisKejadian ? item.jenisKejadian : 'Lainnya';
      jenis = jenis.charAt(0).toUpperCase() + jenis.slice(1).toLowerCase();
      jenisMap[jenis] = (jenisMap[jenis] || 0) + 1;
    });

    // 4. Status (Bar Chart)
    const statusMap: { [key: string]: number } = {};
    data.forEach(item => {
      const status = item.status || 'Tanpa Status';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    setStats({
      total, kebakaran, nonKebakaran,
      dailyLabels: Object.keys(dateMap),
      dailyValues: Object.values(dateMap),
      jenisLabels: Object.keys(jenisMap),
      jenisValues: Object.values(jenisMap),
      statusLabels: Object.keys(statusMap),
      statusValues: Object.values(statusMap),
    });
  };

  // Handlers
  const handleFilterChange = (prop: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [prop]: event.target.value });
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', jenis: 'All', status: 'All' });
  };

  // Data Chart Config
  const trendData = {
    labels: stats.dailyLabels,
    datasets: [{
      label: 'Jumlah Laporan',
      data: stats.dailyValues,
      borderColor: '#d32f2f', backgroundColor: 'rgba(211, 47, 47, 0.2)', tension: 0.4, fill: true,
    }],
  };

  const jenisData = {
    labels: stats.jenisLabels,
    datasets: [{
      data: stats.jenisValues,
      backgroundColor: ['#d32f2f', '#fbbf24', '#9ca3af', '#3b82f6'], borderWidth: 1,
    }],
  };

  const statusData = {
    labels: stats.statusLabels,
    datasets: [{
      label: 'Status',
      data: stats.statusValues,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], borderRadius: 5,
    }],
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <div className="title-bar">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h2 className="page-title">Grafik Kejadian</h2>
        </div>
        <Button startIcon={<RestartAltIcon />} onClick={resetFilters} variant="outlined" color="error">
          Reset Filter
        </Button>
      </Stack>

      {/* === BAGIAN 1: PANEL FILTER === */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, borderTop: '4px solid #d32f2f' }}>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <FilterListIcon color="action" />
            <Typography variant="h6" fontWeight="bold">Filter Data</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Dari Tanggal" type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate} onChange={handleFilterChange('startDate')}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Sampai Tanggal" type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate} onChange={handleFilterChange('endDate')}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select fullWidth label="Jenis Kejadian"
              value={filters.jenis} onChange={handleFilterChange('jenis')}
              size="small"
            >
              <MenuItem value="All">Semua Jenis</MenuItem>
              <MenuItem value="Kebakaran">Kebakaran</MenuItem>
              <MenuItem value="Non Kebakaran">Non Kebakaran</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select fullWidth label="Status Laporan"
              value={filters.status} onChange={handleFilterChange('status')}
              size="small"
            >
              <MenuItem value="All">Semua Status</MenuItem>
              <MenuItem value="Menunggu Verifikasi">Menunggu Verifikasi</MenuItem>
              <MenuItem value="Investigasi">Investigasi</MenuItem>
              <MenuItem value="Diproses">Diproses</MenuItem>
              <MenuItem value="Selesai">Selesai</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* === BAGIAN 2: SUMMARY CARDS (TERPENGARUH FILTER) === */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '5px solid #1976d2', boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">TOTAL (TERFILTER)</Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">{stats.total}</Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 50, color: '#1976d2', opacity: 0.2 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '5px solid #d32f2f', boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">KEBAKARAN</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#d32f2f' }}>{stats.kebakaran}</Typography>
                </Box>
                <LocalFireDepartmentIcon sx={{ fontSize: 50, color: '#d32f2f', opacity: 0.2 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '5px solid #f59e0b', boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">NON KEBAKARAN</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#f59e0b' }}>{stats.nonKebakaran}</Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 50, color: '#f59e0b', opacity: 0.2 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === BAGIAN 3: GRAFIK === */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tren Kejadian</Typography>
            <Box sx={{ height: '320px', width: '100%' }}>
              <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Proporsi Jenis</Typography>
            <Box sx={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={jenisData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Sebaran Status</Typography>
            <Box sx={{ height: '250px' }}>
              <Bar data={statusData} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GrafikLaporan;