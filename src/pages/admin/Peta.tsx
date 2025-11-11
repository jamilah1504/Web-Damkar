// src/pages/admin/Peta.tsx (Refactor: Sidebar dipisah ke komponen lokal)
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Modal,
  TextField,
  Fade,
  IconButton,
} from '@mui/material';
import { 
  Close as CloseIcon, 
  UploadFile as UploadFileIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon
} from '@mui/icons-material';
import InteractiveMap, { IMapMarker } from '../../components/InteractiveMap';
import L from 'leaflet';

// --- (1) Tipe Data ---
interface ILokasiFromAPI {
  id: number;
  namaLokasi: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
  images: string[]; 
}
type ILokasiRawan = ILokasiFromAPI;


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

// ====================================================================
// --- (A) KOMPONEN SIDEBAR (DIPISAHKAN TAPI TETAP 1 FILE) ---
// ====================================================================

// Definisikan semua props yang akan diterima dari AdminPeta
interface LokasiSidebarProps {
  loading: boolean;
  error: string | null;
  selectedLokasi: ILokasiRawan | null;
  lokasiList: ILokasiRawan[];
  onSelectItem: (lokasi: ILokasiRawan) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const LokasiSidebar: React.FC<LokasiSidebarProps> = ({
  loading,
  error,
  selectedLokasi,
  lokasiList,
  onSelectItem,
  onEditClick,
  onDeleteClick,
}) => {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150; 
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Paper 
      sx={{ width: 400, height: '100%', bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3, p: 2.5, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      {loading ? (
        <CircularProgress sx={{ alignSelf: 'center', mt: 4 }} />
      ) : selectedLokasi ? (
        <>
          {/* Detail Lokasi */}
          <Box mb={3} sx={{ flexShrink: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>Detail Lokasi</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{selectedLokasi.namaLokasi}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.9rem' }}>{selectedLokasi.deskripsi}</Typography>
            
            {/* Kontainer Koordinat + Tombol Scroll */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                📍 {selectedLokasi.latitude.toFixed(5)}, {selectedLokasi.longitude.toFixed(5)}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={() => handleScroll('left')} sx={{ border: '1px solid #ddd', borderRadius: '4px', color: 'error.main' }}>
                  <ArrowBackIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
                <IconButton size="small" onClick={() => handleScroll('right')} sx={{ border: '1px solid #ddd', borderRadius: '4px', color: 'error.main' }}>
                  <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Kontainer Gambar Scrollable */}
            <Box sx={{ overflow: 'hidden', position: 'relative' }}>
              <Box
                ref={scrollContainerRef} 
                sx={{
                  display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth',
                  gap: 1, py: 0.5,
                  '&::-webkit-scrollbar': { display: 'none' },
                  '-ms-overflow-style': 'none', 'scrollbar-width': 'none',
                }}
              >
                {selectedLokasi.images.map((img, index) => (
                  <Box key={index} sx={{ minWidth: 120, flexShrink: 0 }}> 
                    <Card sx={{ borderRadius: 1.5, boxShadow: 'none', border: 'none' }}>
                      <CardMedia component="img" height="80" image={img} alt={`Foto ${selectedLokasi.namaLokasi} ${index + 1}`} />
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Grup Tombol Aksi (Edit & Hapus) */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                fullWidth
                onClick={onEditClick} // <-- Gunakan prop
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                fullWidth
                onClick={onDeleteClick} // <-- Gunakan prop
              >
                Hapus
              </Button>
            </Stack>
          </Box>

          {/* Lokasi Lainnya */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, flexShrink: 0 }}>
            Lokasi lainnya
          </Typography>
          <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, boxSizing: 'border-box' }}>
            <Stack spacing={2}>
              {lokasiList
                .filter(l => l.id !== selectedLokasi.id)
                .map((lokasi) => (
                  <Card key={lokasi.id} sx={{ borderRadius: 2, flexShrink: 0, height: '100px', boxShadow: 'none', border: 'none' }}>
                    <CardActionArea 
                      onClick={() => onSelectItem(lokasi)} // <-- Gunakan prop
                      sx={{ display: 'flex', justifyContent: 'flex-start', p: 1.5, height: '100%' }}
                    >
                      <CardMedia
                        component="img"
                        sx={{ width: 80, height: 70, borderRadius: 1.5, flexShrink: 0 }}
                        image={lokasi.images[0] || 'https://via.placeholder.com/150'}
                        alt={lokasi.namaLokasi}
                      />
                      <Box sx={{ ml: 1.5, overflow: 'hidden', flex: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lokasi.namaLokasi}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {lokasi.deskripsi?.substring(0, 40) || 'Tanpa deskripsi'}...
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
  );
};


// ====================================================================
// --- (B) KOMPONEN HALAMAN UTAMA (ADMIN PETA) ---
// ====================================================================

const AdminPeta: React.FC = () => {
  // --- State (Semua state tetap di sini) ---
  const [lokasiList, setLokasiList] = useState<ILokasiRawan[]>([]);
  const [selectedLokasi, setSelectedLokasi] = useState<ILokasiRawan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [formData, setFormData] = useState({ 
    namaLokasi: '',
    deskripsi: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMapPanningEnabled, setIsMapPanningEnabled] = useState<boolean>(true);


  // --- (Semua Fungsi & Handlers tetap di sini) ---
  const fetchData = async () => {
    // ... (Fungsi fetchData Anda, tidak berubah)
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Autentikasi tidak ditemukan. Silakan login kembali.');
      setLoading(false); return;
    }
    try {
      setLoading(true); setError(null);
      const response = await fetch('http://localhost:5000/api/lokasi-rawan', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) {
         setError('Sesi Anda berakhir. Silakan login kembali.'); return;
      }
      if (!response.ok) {
        throw new Error(`Gagal memuat data: ${response.statusText}`);
      }
      const data: ILokasiRawan[] = await response.json(); 
      setLokasiList(data);
      if (selectedLokasi) {
        const updatedSelected = data.find(l => l.id === selectedLokasi.id);
        if (updatedSelected) { setSelectedLokasi(updatedSelected); }
        else { setSelectedLokasi(data.length > 0 ? data[0] : null); }
      } else if (data.length > 0) {
        setSelectedLokasi(data[0]);
      }
    } catch (err: any) {
      setError(err.message); console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); 

  // Disable page-level scrolling while this page is mounted.
  // We only change the document/body overflow dynamically so other pages are unaffected.
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const handleMarkerClick = (marker: IMapMarker) => {
    // ... (Tidak berubah)
    const lokasi = lokasiList.find(l => l.id === marker.id);
    if (lokasi) {
      setIsMapPanningEnabled(true); 
      setSelectedLokasi(lokasi);
    }
  };

  const handleMapClick = (latlng: L.LatLng) => {
    // ... (Tidak berubah)
    setIsEditMode(false); 
    setFormData({ 
      namaLokasi: '', deskripsi: '',
      latitude: latlng.lat, longitude: latlng.lng,
    });
    setImageFiles([]); 
    setOpenModal(true);
  };

  const handleOpenEditModal = () => {
    // ... (Tidak berubah)
    if (!selectedLokasi) return;
    setIsEditMode(true); 
    setFormData({ 
      namaLokasi: selectedLokasi.namaLokasi,
      deskripsi: selectedLokasi.deskripsi,
      latitude: selectedLokasi.latitude,
      longitude: selectedLokasi.longitude,
    });
    setImageFiles([]); 
    setOpenModal(true);
  };

  const handleSubmitBaru = async () => {
    // ... (Fungsi ini sudah benar)
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    if (!token || !formData.latitude || !formData.longitude) {
      alert('Token atau koordinat tidak ditemukan');
      setIsSubmitting(false); return;
    }
    const formBody = new FormData();
    formBody.append('namaLokasi', formData.namaLokasi);
    formBody.append('deskripsi', formData.deskripsi);
    formBody.append('latitude', String(formData.latitude));
    formBody.append('longitude', String(formData.longitude));
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        formBody.append('images', file); 
      }
    }
    try {
      const response = await fetch('http://localhost:5000/api/lokasi-rawan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formBody, 
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menambah lokasi');
      }
      await fetchData(); 
      setOpenModal(false);
      setImageFiles([]); 
    } catch (err: any) {
      console.error(err); alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateLokasi = async () => {
    // ... (Tidak berubah)
    if (!selectedLokasi) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Autentikasi gagal');
      setIsSubmitting(false); return;
    }
    const formBody = new FormData();
    formBody.append('namaLokasi', formData.namaLokasi);
    formBody.append('deskripsi', formData.deskripsi);
    formBody.append('latitude', String(formData.latitude));
    formBody.append('longitude', String(formData.longitude));
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        formBody.append('images', file); 
      }
    }
    try {
      const response = await fetch(`http://localhost:5000/api/lokasi-rawan/${selectedLokasi.id}`, {
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}` },
        body: formBody, 
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal memperbarui lokasi');
      }
      await fetchData(); 
      setOpenModal(false);
    } catch (err: any) {
      console.error(err); alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLokasi = async () => {
    // ... (Tidak berubah)
    if (!selectedLokasi) return;
    const { id, namaLokasi } = selectedLokasi;
    const isConfirmed = window.confirm(
      `Anda yakin ingin menghapus "${namaLokasi}"? \n\nTindakan ini tidak dapat dibatalkan!`
    );
    if (isConfirmed) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Autentikasi gagal. Silakan login ulang.'); return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/lokasi-rawan/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal menghapus lokasi');
        }
        alert(`Lokasi "${namaLokasi}" telah berhasil dihapus.`);
        setIsMapPanningEnabled(false);
        const newList = lokasiList.filter(l => l.id !== id);
        setLokasiList(newList);
        setSelectedLokasi(newList.length > 0 ? newList[0] : null);
        setTimeout(() => { setIsMapPanningEnabled(true); }, 100);
      } catch (err: any) {
        console.error(err); alert('Error! ' + err.message);
      }
    }
  };

  const handleDeleteImage = async (imageUrlToDelete: string) => {
    // ... (Tidak berubah)
    if (!selectedLokasi) return;
    const isConfirmed = window.confirm("Anda yakin ingin menghapus gambar ini?");
    if (!isConfirmed) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Autentikasi gagal. Silakan login ulang.');
      return;
    }
    setIsSubmitting(true); 
    try {
      const response = await fetch(`http://localhost:5000/api/lokasi-rawan/${selectedLokasi.id}/delete-image`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: imageUrlToDelete }) 
      });
      if (!response.ok) {
        throw new Error('Gagal menghapus gambar');
      }
      alert('Gambar berhasil dihapus.');
      setSelectedLokasi(prev => {
        if (!prev) return null;
        const newImages = prev.images.filter(img => img !== imageUrlToDelete);
        return { ...prev, images: newImages };
      });
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Error! ' + err.message);
    } finally {
      setIsSubmitting(false); 
    }
  };

  // --- Handler baru untuk mem-proxy klik "Lokasi Lainnya" ---
  const handleSelectItem = (lokasi: ILokasiRawan) => {
    setIsMapPanningEnabled(true); 
    setSelectedLokasi(lokasi);
  };


  // --- (5) Tampilan Render ---
  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Judul (Dihapus) */}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', gap: 2, overflow: 'hidden' }}>
        
        {/* === KOLOM KIRI (PETA) === */}
        <Box sx={{ flex: 1, position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
          {loading ? ( 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress /><Typography sx={{ ml: 2 }}>Memuat Peta...</Typography>
            </Box>
          ) : error ? ( 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <InteractiveMap
              markers={lokasiList}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick} 
              centerCoordinates={isMapPanningEnabled && selectedLokasi ? [selectedLokasi.latitude, selectedLokasi.longitude] : undefined}
            />
          )}
        </Box>

        {/* === KOLOM KANAN (SIDEBAR) === */}
        {/* --- JSX Sidebar diganti dengan komponen baru --- */}
        <LokasiSidebar
          loading={loading}
          error={error}
          selectedLokasi={selectedLokasi}
          lokasiList={lokasiList}
          onSelectItem={handleSelectItem}
          onEditClick={handleOpenEditModal}
          onDeleteClick={handleDeleteLokasi}
        />
        
      </Box>

      {/* --- (7) MODAL (Tidak berubah) --- */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        // ... (props modal lainnya)
      >
        <Fade in={openModal}>
          <Box sx={modalStyle} component="form" onSubmit={(e) => {
            e.preventDefault();
            isEditMode ? handleUpdateLokasi() : handleSubmitBaru();
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="h2">
                {isEditMode ? 'Edit Lokasi Rawan' : 'Tambah Lokasi Rawan Baru'}
              </Typography>
              <IconButton onClick={() => setOpenModal(false)}><CloseIcon /></IconButton>
            </Stack>
            
            <TextField
              margin="normal" required fullWidth label="Nama Lokasi"
              value={formData.namaLokasi}
              onChange={(e) => setFormData({ ...formData, namaLokasi: e.target.value })}
              autoFocus
            />
            <TextField
              margin="normal" fullWidth label="Deskripsi (Opsional)"
              multiline rows={3}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />

            {isEditMode && selectedLokasi && selectedLokasi.images.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>Gambar saat ini:</Typography>
                <Paper variant="outlined" sx={{ maxHeight: 150, overflowY: 'auto', p: 1 }}>
                  <Stack spacing={1}>
                    {selectedLokasi.images.map((imgUrl) => (
                      <Box key={imgUrl} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f9f9f9', p: 0.5, borderRadius: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '80%' }}
                        >
                          {imgUrl.substring(imgUrl.lastIndexOf('/') + 1)} 
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteImage(imgUrl)}
                          title="Hapus gambar ini"
                          disabled={isSubmitting}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            )}
            
            <Button
              variant="outlined" component="label" fullWidth
              startIcon={<UploadFileIcon />} sx={{ mt: 2 }}
            >
              {imageFiles.length === 0 
                ? (isEditMode ? 'Upload Gambar Tambahan' : 'Upload Gambar (Bisa Banyak)')
                : `${imageFiles.length} file dipilih`
              }
              <input
                type="file" hidden accept="image/png, image/jpeg, image/jpg"
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    setImageFiles(Array.from(e.target.files));
                  }
                }}
              />
            </Button>
            
            <Button
              type="submit" fullWidth variant="contained" color="error"
              disabled={isSubmitting} sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : (isEditMode ? 'Simpan Perubahan' : 'Simpan Lokasi')}
            </Button>
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default AdminPeta;