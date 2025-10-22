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
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const dummyPengguna = [
  { id: 1, nama: 'Admin Utama', email: 'admin@damkar.go.id', peran: 'Admin' },
  { id: 2, nama: 'Budi Santoso', email: 'budi.s@damkar.go.id', peran: 'Petugas' },
  { id: 3, nama: 'Citra Lestari', email: 'citra.l@damkar.go.id', peran: 'Petugas' },
  { id: 4, nama: 'Andi (Warga)', email: 'andi.warga@email.com', peran: 'Masyarakat' },
];

const AdminPengguna: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Manajemen Pengguna
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola akun dan hak akses pengguna sistem.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Tambah Pengguna
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama Lengkap</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Peran (Role)</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyPengguna.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nama}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.peran}</TableCell>
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

export default AdminPengguna;
