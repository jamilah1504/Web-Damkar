import React from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Jadwal {
  id: number;
  namaSekolah: string;
  tanggal: string;
  jumlahPeserta: number;
  status: 'Terjadwal' | 'Selesai' | 'Dibatalkan';
}

const dummyJadwal: Jadwal[] = [
  {
    id: 1,
    namaSekolah: 'SMK Negeri 1 Subang',
    tanggal: '25 September 2025',
    jumlahPeserta: 50,
    status: 'Terjadwal',
  },
  {
    id: 2,
    namaSekolah: 'SMA Negeri 2 Subang',
    tanggal: '15 September 2025',
    jumlahPeserta: 75,
    status: 'Selesai',
  },
  {
    id: 3,
    namaSekolah: 'SMP IT As-Syifa',
    tanggal: '10 Oktober 2025',
    jumlahPeserta: 120,
    status: 'Terjadwal',
  },
  {
    id: 4,
    namaSekolah: 'Universitas Subang',
    tanggal: '05 Agustus 2025',
    jumlahPeserta: 30,
    status: 'Dibatalkan',
  },
];

const AdminJadwal: React.FC = () => {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#fff4ea', // Warna latar belakang yang sama dengan sidebar
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Memastikan penuh tinggi layar
        width: '100%', // Memastikan lebar penuh
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Jadwal Edukasi
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manajemen jadwal untuk kegiatan edukasi kepada publik.
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#fff', // Sama dengan latar belakang Box
          borderRadius: 2,
          boxShadow: 'none', // Menghilangkan bayangan default
          width: '100%', // Memastikan lebar penuh
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
            {dummyJadwal.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: '#fff4ea' }, // Efek hover halus
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
    </Box>
  );
};

export default AdminJadwal;
