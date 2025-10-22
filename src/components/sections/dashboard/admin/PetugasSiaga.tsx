import React from 'react';
import { Paper, Typography, Stack, Avatar, Box } from '@mui/material';
import { petugasSiagaData } from '../../../../data/dashboardAdminData'; // Impor data

const PetugasSiaga: React.FC = () => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Petugas Siaga
      </Typography>
      <Paper sx={{ p: 2, height: '100%' }}>
        <Stack spacing={2}>
          {petugasSiagaData.map((petugas) => (
            <Stack direction="row" spacing={2} key={petugas.id} alignItems="center">
              <Avatar>{petugas.avatarInitial}</Avatar>
              <Box>
                <Typography variant="subtitle1">{petugas.nama}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {petugas.pangkat}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </>
  );
};

export default PetugasSiaga;
