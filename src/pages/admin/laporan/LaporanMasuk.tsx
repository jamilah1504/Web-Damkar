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
  ButtonGroup,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const dummyLaporanMasuk = [
  {
    id: 1025,
    pelapor: 'Andi',
    lokasi: 'Jl. Otista No. 12',
    waktu: '20:15 WIB',
    status: 'Menunggu Verifikasi',
  },
  {
    id: 1026,
    pelapor: 'Siti',
    lokasi: 'Toko Roti Lezat, Ciereng',
    waktu: '20:30 WIB',
    status: 'Menunggu Verifikasi',
  },
];

const AdminLaporanMasuk: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Laporan Masuk
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Verifikasi dan disposisikan laporan darurat yang baru masuk dari masyarakat.
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Laporan</TableCell>
              <TableCell>Nama Pelapor</TableCell>
              <TableCell>Lokasi Kejadian</TableCell>
              <TableCell>Waktu Laporan</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyLaporanMasuk.map((row) => (
              <TableRow key={row.id}>
                <TableCell>#{row.id}</TableCell>
                <TableCell>{row.pelapor}</TableCell>
                <TableCell>{row.lokasi}</TableCell>
                <TableCell>{row.waktu}</TableCell>
                <TableCell align="center">
                  <ButtonGroup variant="outlined" size="small">
                    <Button color="primary">Verifikasi</Button>
                    <Button color="secondary">Lihat Detail</Button>
                    <Button color="error">Tolak</Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{ mr: 1 }}
                    >
                      Verifikasi
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                    >
                      Tolak
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminLaporanMasuk;
