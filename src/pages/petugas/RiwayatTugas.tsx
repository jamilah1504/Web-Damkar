import { ReactElement } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// Data tiruan untuk riwayat tugas yang sudah selesai
const dummyRiwayatTugas = [
  {
    id: 1022,
    jenis: 'Pohon Tumbang',
    lokasi: 'Taman Kota Bunga',
    tanggal: '19/09/2025',
    status: 'Selesai',
  },
  {
    id: 1021,
    jenis: 'Kebakaran Gudang',
    lokasi: 'Pabrik Garmen Sejahtera',
    tanggal: '18/09/2025',
    status: 'Selesai',
  },
  {
    id: 1019,
    jenis: 'Penyelamatan Ular',
    lokasi: 'Kantor Desa Sukamaju',
    tanggal: '17/09/2025',
    status: 'Selesai',
  },
  {
    id: 1018,
    jenis: 'Banjir Lokal',
    lokasi: 'Jl. Raya Cipeundeuy',
    tanggal: '16/09/2025',
    status: 'Selesai',
  },
];

const PetugasRiwayatTugas = (): ReactElement => {
  return (
    <Grid container component="main" spacing={3} flexGrow={1} sx={{ p: 3, bgcolor: '#fff4ea' }}>
      {/* Judul Halaman */}
      <Grid xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Riwayat Tugas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Arsip semua tugas yang telah Anda selesaikan.
        </Typography>
      </Grid>

      {/* Tabel Riwayat */}
      <Grid xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID Tugas</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jenis Insiden</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tanggal Selesai</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status Akhir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummyRiwayatTugas.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>#{row.id}</TableCell>
                  <TableCell>{row.jenis}</TableCell>
                  <TableCell>{row.lokasi}</TableCell>
                  <TableCell>{row.tanggal}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default PetugasRiwayatTugas;
