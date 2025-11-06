import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress, // Untuk indikator loading
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

// --- (1) DEFINISI TIPE DATA (TYPESCRIPT) ---
// Tipe data ini harus cocok dengan data JSON yang dikirim oleh API
// berdasarkan controller 'insidenController.js'

interface IUserSimple {
  id: number;
  name: string;
  email?: string;
  pangkat?: string;
  nomorInduk?: string;
}

interface ILaporan {
  id: number;
  deskripsi: string;
  // ... tambahkan field lain dari model Laporan jika perlu
  Pelapor: IUserSimple; // Data pelapor dari 'include'
}

interface ITugas {
  id: number;
  PetugasDitugaskan: IUserSimple[]; // Array berisi petugas dari 'include'
}

// Ini adalah Tipe data utama untuk setiap baris
interface IInsidenData {
  id: number;
  judulInsiden: string;
  lokasi: string; // Pastikan model Insiden Anda punya 'lokasi'
  jenisKejadian: string;
  skalaInsiden: string;
  statusInsiden: string;
  Laporans: ILaporan[]; // 'as: Laporans' dari relasi Sequelize
  Tugas?: ITugas;     // 'as: Tugas' dari relasi Sequelize
}

// --- (2) KOMPONEN BARIS (ROW) ---
// Komponen terpisah untuk mengelola state buka/tutup
function Row(props: { row: IInsidenData }) {
  const { row } = props;
  const [open, setOpen] = useState(false); // State untuk buka/tutup

  return (
    <React.Fragment>
      {/* Baris utama yang terlihat */}
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>{row.id}</TableCell>
        <TableCell component="th" scope="row">
          {row.judulInsiden}
        </TableCell>
        <TableCell>{row.lokasi || 'Lokasi tidak ada'}</TableCell>
        <TableCell>{row.jenisKejadian}</TableCell>
        <TableCell>{row.skalaInsiden}</TableCell>
        <TableCell>
          <Chip 
            label={row.statusInsiden} 
            color={row.statusInsiden === 'Penanganan' ? 'warning' : (row.statusInsiden === 'Selesai' ? 'success' : 'default')} 
            size="small" 
          />
        </TableCell>
        <TableCell align="center">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Baris tersembunyi (collapsible content) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, padding: 2, backgroundColor: '#fafafa', borderRadius: 2 }}>
              
              {/* --- Laporan Terkait (dari row.Laporans) --- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Laporan Terkait</Typography>
                <Button variant="contained" color="error" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>
                  Tambah Laporan Terkait
                </Button>
              </Box>
              <Grid container spacing={2}>
                {row.Laporans?.map((laporan) => (
                  <Grid item xs={12} sm={6} md={4} key={laporan.id}>
                    <Card sx={{ display: 'flex', height: '100%' }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 120, objectFit: 'cover' }}
                        image={"https://via.placeholder.com/150"} // Ganti dengan foto laporan jika ada
                        alt="Foto Insiden"
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Typography component="div" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {laporan.Pelapor?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {laporan.Pelapor?.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {laporan.deskripsi.substring(0, 50)}...
                          </Typography>
                        </CardContent>
                        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" sx={{ color: 'red' }}><DeleteIcon fontSize="inherit" /></IconButton>
                          <IconButton size="small"><VisibilityIcon fontSize="inherit" /></IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* --- Petugas Terkait (dari row.Tugas.PetugasDitugaskan) --- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
                <Typography variant="h6">Petugas Terkait</Typography>
                <Button variant="contained" color="error" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>
                  Tambah Petugas
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {row.Tugas?.PetugasDitugaskan?.map((petugas) => (
                  <Chip
                    key={petugas.id}
                    label={`${petugas.name} - ${petugas.pangkat || 'Petugas'}`}
                    onDelete={() => { /* Logika hapus petugas */ }}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                  />
                ))}
                {(!row.Tugas || row.Tugas.PetugasDitugaskan.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Belum ada petugas ditugaskan.
                  </Typography>
                )}
              </Box>

              {/* --- Status Insiden --- */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Status Insiden</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={row.statusInsiden} color="warning" />
                  <Button variant="outlined" startIcon={<EditIcon />} sx={{ textTransform: 'none' }}>
                    Edit Status
                  </Button>
                </Box>
              </Box>
              
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// --- (3) KOMPONEN UTAMA (PAGE) ---
const AdminLaporanMasuk: React.FC = () => {
  // State untuk menyimpan data dari API
  const [dataInsiden, setDataInsiden] = useState<IInsidenData[]>([]);
  // State untuk status loading
  const [loading, setLoading] = useState<boolean>(true);
  // State untuk menyimpan pesan error
  const [error, setError] = useState<string | null>(null);

  // --- (4) FUNGSI FETCH DATA ---
  // useEffect dengan dependency array kosong [] akan berjalan
  // sekali saja saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Mulai loading
        setError(null);

        // Panggil API yang sudah kita buat
        const response = await fetch('http://localhost:5000/api/insiden/manajemen-laporan');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: IInsidenData[] = await response.json();
        
        setDataInsiden(data); // Simpan data ke state
        
      } catch (err: any) {
        setError(err.message); // Simpan pesan error jika gagal
      } finally {
        setLoading(false); // Berhenti loading (baik sukses atau gagal)
      }
    };

    fetchData(); // Panggil fungsinya
  }, []);

  // --- (5) TAMPILAN KONDISIONAL ---
  // Tampilkan loading spinner
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Memuat data manajemen laporan...</Typography>
      </Box>
    );
  }

  // Tampilkan pesan error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Gagal Memuat Data</Typography>
        <Typography color="error.secondary">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Coba Lagi
        </Button>
      </Box>
    );
  }

  // --- (6) TAMPILAN UTAMA JIKA DATA SUKSES ---
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Manajemen Laporan Masuk
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table aria-label="collapsible table">
          <TableHead sx={{ bgcolor: '#f9f9f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nama Insiden</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Jenis Kejadian</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Skala Insiden</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Mapping data dari state, BUKAN dummy data lagi */}
            {dataInsiden.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminLaporanMasuk;