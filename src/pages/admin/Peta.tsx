// src/pages/AdminPeta.tsx (Versi Final dengan Auth)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Modal, // Untuk form tambah
  TextField, // Untuk form tambah
  Backdrop,
  Fade,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import InteractiveMap, { IMapMarker } from '../../components/InteractiveMap';
import L from 'leaflet'; // Impor tipe LatLng

// --- (1) Tipe Data ---
// Tipe data dari API (controller Anda)
interface ILokasiFromAPI {
  id: number;
  namaLokasi: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
}

// Tipe data yang digunakan oleh UI (ditambah 'images')
interface ILokasiRawan extends ILokasiFromAPI {
  images: string[];
}

// --- (2) Style untuk Modal ---
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// --- (3) Komponen Utama Halaman ---
const AdminPeta: React.FC = () => {
  const [lokasiList, setLokasiList] = useState<ILokasiRawan[]>([]);
  const [selectedLokasi, setSelectedLokasi] = useState<ILokasiRawan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Modal Tambah Data
  const [openModal, setOpenModal] = useState(false);
  const [newLokasi, setNewLokasi] = useState<{
    namaLokasi: string;
    deskripsi: string;
    latitude: number | null;
    longitude: number | null;
  }>({ namaLokasi: '', deskripsi: '', latitude: null, longitude: null });

  // --- (4) Fungsi untuk Fetch Data (GET) ---
  const fetchData = async () => {
    // AMBIL TOKEN DARI LOCAL STORAGE
    // Ganti 'authToken' dengan key yang Anda gunakan
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Autentikasi tidak ditemukan. Silakan login kembali.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/lokasi-rawan', {
        headers: {
          'Authorization': `Bearer ${token}`, // <-- KIRIM TOKEN DI SINI
        },
      });

      if (response.status === 401) {
         setError('Sesi Anda berakhir. Silakan login kembali.');
         // Mungkin redirect ke login
         return;
      }
      if (!response.ok) {
        throw new Error(`Gagal memuat data: ${response.statusText}`);
      }

      const data: ILokasiFromAPI[] = await response.json();

      // Tambahkan placeholder 'images' ke data dari API
      const formattedData: ILokasiRawan[] = data.map(lokasi => ({
        ...lokasi,
        // Ganti dengan URL gambar asli jika ada
        images: ['https://via.placeholder.com/150/FF0000/FFFFFF?text=Foto1', 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Foto2']
      }));

      setLokasiList(formattedData);
      if (formattedData.length > 0) {
        setSelectedLokasi(formattedData[0]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchData saat komponen dimuat
  useEffect(() => {
    fetchData();
  }, []); // Dependensi kosong, panggil sekali

  // --- (5) Handler untuk Aksi ---

  // Handler saat penanda di peta diklik
  const handleMarkerClick = (marker: IMapMarker) => {
    const lokasi = lokasiList.find(l => l.id === marker.id);
    if (lokasi) {
      setSelectedLokasi(lokasi);
    }
  };

  // Handler saat peta diklik (membuka modal)
  const handleMapClick = (latlng: L.LatLng) => {
    setNewLokasi({
      namaLokasi: '',
      deskripsi: '',
      latitude: latlng.lat,
      longitude: latlng.lng,
    });
    setOpenModal(true);
  };

  // Handler saat form 'Tambah Lokasi' di-submit (POST)
  const handleSubmitBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // AMBIL TOKEN LAGI
    const token = localStorage.getItem('token');
    if (!token || !newLokasi.latitude || !newLokasi.longitude) {
      alert('Token atau koordinat tidak ditemukan');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/lokasi-rawan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <-- KIRIM TOKEN DI SINI
        },
        body: JSON.stringify({
          namaLokasi: newLokasi.namaLokasi,
          deskripsi: newLokasi.deskripsi,
          latitude: newLokasi.latitude,
          longitude: newLokasi.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menambah lokasi');
      }

      // Jika sukses, muat ulang data dari server
      await fetchData(); 
      setOpenModal(false); // Tutup modal

    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };


  // --- (6) Tampilan Render ---
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Judul */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analisis & Peta
        </Typography>
      </Stack>

      {/* Kontainer Utama (Peta + Sidebar) */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', gap: 2, overflow: 'hidden' }}>
        
        {/* === KOLOM KIRI (PETA) === */}
        <Box sx={{ flex: 1, position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Memuat Peta...</Typography>
            </Box>
          ) : error ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <InteractiveMap
              markers={lokasiList}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick} // Aktifkan fitur klik di peta
              centerCoordinates={selectedLokasi ? [selectedLokasi.latitude, selectedLokasi.longitude] : undefined}
            />
          )}
        </Box>

        {/* === KOLOM KANAN (SIDEBAR) === */}
        <Paper 
          sx={{ 
            width: 400,
            bgcolor: '#ffffff',
            borderRadius: 2, 
            boxShadow: 3,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <CircularProgress sx={{ alignSelf: 'center', mt: 4 }} />
          ) : selectedLokasi ? (
            <>
              {/* Detail Lokasi */}
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  Detail Lokasi
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {selectedLokasi.namaLokasi}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.9rem' }}>
                  {selectedLokasi.deskripsi}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  📍 {selectedLokasi.latitude.toFixed(5)}, {selectedLokasi.longitude.toFixed(5)}
                </Typography>
                <Grid container spacing={1}>
                  {selectedLokasi.images.map((img, index) => (
                    <Grid item xs={4} key={index}>
                      <Card sx={{ borderRadius: 1.5 }}>
                        <CardMedia component="img" height="80" image={img} alt={`Foto ${index + 1}`} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Lokasi Lainnya */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Lokasi lainnya
              </Typography>
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {lokasiList
                    .filter(l => l.id !== selectedLokasi.id)
                    .map((lokasi) => (
                      <Card key={lokasi.id} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardActionArea 
                          onClick={() => setSelectedLokasi(lokasi)}
                          sx={{ display: 'flex', justifyContent: 'flex-start', p: 1.5 }}
                        >
                          <CardMedia
                            component="img"
                            sx={{ width: 100, height: 70, borderRadius: 1.5 }}
                            image={lokasi.images[0]}
                            alt={lokasi.namaLokasi}
                          />
                          <Box sx={{ ml: 1.5 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                              {lokasi.namaLokasi}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              {lokasi.deskripsi.substring(0, 40)}...
                            </Typography>
                          </Box>
                        </CardActionArea>
                      </Card>
                    ))}
                </Stack>
              </Box>
            </>
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
              {error ? error : 'Belum ada lokasi rawan.'}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* --- (7) MODAL UNTUK TAMBAH LOKASI --- */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmitBaru}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="h2">
                Tambah Lokasi Rawan Baru
              </Typography>
              <IconButton onClick={() => setOpenModal(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Koordinat dipilih dari peta.
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              label="Latitude"
              value={newLokasi.latitude || ''}
              disabled // Tidak bisa diubah, diambil dari klik peta
            />
            <TextField
              margin="normal"
              fullWidth
              label="Longitude"
              value={newLokasi.longitude || ''}
              disabled // Tidak bisa diubah, diambil dari klik peta
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nama Lokasi"
              value={newLokasi.namaLokasi}
              onChange={(e) => setNewLokasi({ ...newLokasi, namaLokasi: e.target.value })}
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              label="Deskripsi (Opsional)"
              multiline
              rows={3}
              value={newLokasi.deskripsi}
              onChange={(e) => setNewLokasi({ ...newLokasi, deskripsi: e.target.value })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="error"
              sx={{ mt: 3, mb: 2 }}
            >
              Simpan Lokasi
            </Button>
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default AdminPeta;