import React from 'react';
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
import { laporanTerbaruData } from '../../../../data/dashboardAdminData'; // Impor data

const LaporanTerbaru: React.FC = () => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Laporan Insiden Terbaru
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Lokasi</TableCell>
              <TableCell>Jenis Insiden</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {laporanTerbaruData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>#{row.id}</TableCell>
                <TableCell>{row.lokasi}</TableCell>
                <TableCell>{row.jenisInsiden}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default LaporanTerbaru;
