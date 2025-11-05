import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, TextField, Button, Divider } from '@mui/material';

interface User {
  name: string;
  email: string;
}

const AdminPengaturan: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pengaturan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Konfigurasi umum untuk sistem dan akun Anda.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3} divider={<Divider />}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Profil Admin
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nama Lengkap"
                value={user?.name || ''}
                variant="outlined"
                fullWidth
                disabled
              />
              <TextField
                label="Email"
                value={user?.email || ''}
                variant="outlined"
                fullWidth
                disabled
              />
            </Stack>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Pengaturan Notifikasi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atur notifikasi email atau push notification untuk laporan baru.
            </Typography>
            {/* Di sini bisa ditambahkan Switch atau Checkbox */}
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Keamanan
            </Typography>
            <Button variant="outlined">Ubah Password</Button>
          </Box>
          <Box sx={{ pt: 2 }}>
            <Button variant="contained">Simpan Perubahan</Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminPengaturan;
