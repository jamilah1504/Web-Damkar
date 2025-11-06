import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Jadwal {
  id: number;
  namaSekolah: string;
  tanggal: string;
  jumlahPeserta: number;
  status: 'Terjadwal' | 'Selesai' | 'Dibatalkan';
}

const AdminJadwal: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJadwal = async () => {
    try {
      const response = await axios.get('/api/jadwal'); // Ganti dengan endpoint API yang sesuai
      setJadwalList(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data jadwal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#fff4ea',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Jadwal Edukasi
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manajemen jadwal untuk kegiatan edukasi kepada publik.
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: 'none',
            width: '100%',
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="tabel jadwal edukasi">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: '#fff' } }}>
                <TableCell>Nama Sekolah/Instansi</TableCell>
                <TableCell align="center">Tanggal</TableCell>
                <TableCell align="center">Jumlah Peserta</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jadwalList.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: '#fff4ea' },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {row.namaSekolah}
                  </TableCell>
                  <TableCell align="center">{row.tanggal}</TableCell>
                  <TableCell align="center">{row.jumlahPeserta}</TableCell>
                  <TableCell align="center">{row.status}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}>
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminJadwal;
