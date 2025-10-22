import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

// Data dummy untuk riwayat laporan
const dummyRiwayat = [
  { id: 1021, jenis: 'Kebakaran Rumah', tanggal: '19/09/2025', status: 'Selesai' },
  { id: 1015, jenis: 'Penyelamatan Kucing', tanggal: '15/09/2025', status: 'Selesai' },
];

const steps = ['Laporan Diterima', 'Tim Menuju Lokasi', 'Sedang Ditangani', 'Selesai'];

const MasyarakatLacakLaporan: React.FC = () => {
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lacak & Riwayat Laporan
      </Typography>

      {/* Bagian Lacak Laporan Aktif */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Status Laporan Aktif: #1024 - Kebakaran Rumah
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={2} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Bagian Riwayat Laporan */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Riwayat Laporan Anda
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Laporan</TableCell>
              <TableCell>Jenis Insiden</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Status Akhir</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyRiwayat.map((row) => (
              <TableRow key={row.id}>
                <TableCell>#{row.id}</TableCell>
                <TableCell>{row.jenis}</TableCell>
                <TableCell>{row.tanggal}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MasyarakatLacakLaporan;
