import { ReactElement } from 'react';
import { Typography, Card, CardContent, CardActions, Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Menggunakan Grid v2 untuk fleksibilitas

// Data dummy untuk tugas yang sedang berjalan
const dummyTugasAktif = [
  {
    id: 1024,
    jenis: 'Kebakaran Rumah',
    lokasi: 'Jl. Pahlawan No. 45, Subang',
    status: 'Menuju Lokasi',
  },
  {
    id: 1023,
    jenis: 'Penyelamatan Hewan',
    lokasi: 'Perum Gria Asri Blok C2, Cibogo',
    status: 'Sedang Ditangani',
  },
  { id: 1025, jenis: 'Pohon Tumbang', lokasi: 'Taman Kota Bunga', status: 'Menuju Lokasi' },
];

const PetugasTugasAktif = (): ReactElement => {
  return (
    <Grid container component="main" spacing={3} flexGrow={1} sx={{ p: 3, bgcolor: '#fff4ea' }}>
      {/* Judul Halaman */}
      <Grid xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tugas Aktif
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Daftar tugas yang sedang berjalan dan membutuhkan perhatian Anda.
        </Typography>
      </Grid>

      {/* Daftar Kartu Tugas */}
      {dummyTugasAktif.map((tugas) => (
        <Grid xs={12} sm={6} lg={4} key={tugas.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                {tugas.jenis}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {tugas.lokasi}
              </Typography>
              <Typography variant="body2">
                Status Saat Ini: <strong>{tugas.status}</strong>
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained">
                Lihat Detail
              </Button>
              <Button size="small">Update Status</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}

      {/* Pesan jika tidak ada tugas */}
      {dummyTugasAktif.length === 0 && (
        <Grid xs={12}>
          <Typography>Tidak ada tugas aktif saat ini.</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default PetugasTugasAktif;
