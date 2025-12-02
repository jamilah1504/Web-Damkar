// src/pages/admin/Peta.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Stack, Card, CardMedia, CardActionArea,
  CircularProgress, Modal, TextField, Fade, IconButton, Chip, Divider, Alert
} from '@mui/material';
import { 
  Close as CloseIcon, UploadFile as UploadFileIcon, Delete as DeleteIcon,
  Edit as EditIcon, ArrowBackIosNew as ArrowBackIcon, ArrowForwardIos as ArrowForwardIcon,
  ReportProblem as ReportIcon, Place as PlaceIcon
} from '@mui/icons-material';
import InteractiveMap, { 
  IMapMarker, 
  IMarkerRawan, 
  IMarkerLaporan 
} from '../../components/InteractiveMap';
import L from 'leaflet';

// --- KONFIGURASI SERVER ---
// Ganti port ini sesuai dengan port backend Anda (default 5000)
const API_BASE_URL = 'http://localhost:5000';

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
// --- (A) KOMPONEN SIDEBAR ---
// ====================================================================

interface UnifiedSidebarProps {
  loading: boolean;
  error: string | null;
  selectedItem: IMapMarker | null;
  itemList: IMapMarker[];
  onSelectItem: (item: IMapMarker) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  loading, error, selectedItem, itemList, onSelectItem, onEditClick, onDeleteClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper: Mendapatkan Judul Item
  const getTitle = (item: IMapMarker) => {
    return item.type === 'rawan' ? item.namaLokasi : item.judul_laporan;
  };

  // Helper: Mendapatkan URL Gambar yang Valid
  const getFullImageUrl = (url: string | undefined) => {
    if (!url) return 'https://via.placeholder.com/150?text=No+Image';
    // Jika URL sudah lengkap (misal dari Cloudinary), pakai langsung.
    // Jika URL relatif (misal /uploads/...), tambahkan API_BASE_URL.
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };

  // Helper: Mendapatkan Gambar Utama untuk Thumbnail List
  const getMainImage = (item: IMapMarker) => {
    if (item.type === 'rawan') {
      return item.images && item.images.length > 0 
        ? getFullImageUrl(item.images[0]) 
        : 'https://via.placeholder.com/150?text=No+Image';
    } else {
      // Untuk laporan, ambil foto bukti
      return getFullImageUrl(item.foto_bukti);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150; 
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Paper sx={{ width: 400, height: '100%', bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3, p: 2.5, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      {loading ? (
        <CircularProgress sx={{ alignSelf: 'center', mt: 4 }} />
      ) : selectedItem ? (
        <>
          {/* HEADER DETAIL */}
          <Box mb={2} sx={{ flexShrink: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
               {selectedItem.type === 'rawan' ? (
                 <Chip icon={<PlaceIcon />} label="Lokasi Rawan" color="error" size="small" variant="outlined" />
               ) : (
                 <Chip icon={<ReportIcon />} label={`Status: ${selectedItem.status}`} color="warning" size="small" />
               )}
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 1 }}>
              {getTitle(selectedItem)}
            </Typography>

            {selectedItem.type === 'laporan' && (
              <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                 Pelapor: <strong>{selectedItem.nama_pelapor || 'Anonim'}</strong> • {selectedItem.created_at?.substring(0, 10)}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.9rem', maxHeight: 100, overflowY: 'auto' }}>
              {selectedItem.type === 'rawan' ? selectedItem.deskripsi : selectedItem.deskripsi_laporan}
            </Typography>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                📍 {Number(selectedItem.latitude).toFixed(5)}, {Number(selectedItem.longitude).toFixed(5)}
              </Typography>
              
              {selectedItem.type === 'rawan' && selectedItem.images.length > 1 && (
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => handleScroll('left')} sx={{ border: '1px solid #ddd' }}><ArrowBackIcon sx={{ fontSize: '1rem' }} /></IconButton>
                  <IconButton size="small" onClick={() => handleScroll('right')} sx={{ border: '1px solid #ddd' }}><ArrowForwardIcon sx={{ fontSize: '1rem' }} /></IconButton>
                </Stack>
              )}
            </Stack>

            {/* AREA GAMBAR DETAIL */}
            <Box sx={{ overflow: 'hidden', position: 'relative', mb: 2 }}>
              <Box ref={scrollContainerRef} sx={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: 1, py: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                {selectedItem.type === 'rawan' ? (
                   // Render Gambar Lokasi Rawan (Bisa Banyak)
                   selectedItem.images.map((img, index) => (
                    <Box key={index} sx={{ minWidth: 120, flexShrink: 0 }}> 
                      <Card sx={{ borderRadius: 1.5, boxShadow: 'none' }}>
                        <CardMedia component="img" height="80" image={getFullImageUrl(img)} alt={`Foto ${index + 1}`} sx={{ objectFit: 'cover' }} />
                      </Card>
                    </Box>
                  ))
                ) : (
                   // Render Gambar Laporan (Single)
                   selectedItem.foto_bukti ? (
                     <Card sx={{ width: '100%', flexShrink: 0, boxShadow: 'none' }}>
                        <CardMedia 
                          component="img" 
                          height="180" 
                          image={getFullImageUrl(selectedItem.foto_bukti)} 
                          sx={{ borderRadius: 1.5, objectFit: 'cover' }} 
                        />
                     </Card>
                   ) : (
                     <Box sx={{ width: '100%', p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'gray' }}>Tidak ada foto bukti.</Typography>
                     </Box>
                   )
                )}
              </Box>
            </Box>
            
            {/* ACTION BUTTONS (Khusus Rawan) */}
            {selectedItem.type === 'rawan' && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon />} fullWidth onClick={onEditClick}>Edit</Button>
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} fullWidth onClick={onDeleteClick}>Hapus</Button>
              </Stack>
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* LIST ITEM LAINNYA */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, flexShrink: 0 }}>Daftar di Peta</Typography>
          <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <Stack spacing={1}>
              {itemList
                .filter(l => !(l.id === selectedItem.id && l.type === selectedItem.type)) // Hide selected
                .map((item) => (
                  <Card key={`${item.type}-${item.id}`} sx={{ borderRadius: 2, flexShrink: 0, height: '80px', boxShadow: 'none', border: '1px solid #eee' }}>
                    <CardActionArea onClick={() => onSelectItem(item)} sx={{ display: 'flex', justifyContent: 'flex-start', p: 1, height: '100%' }}>
                      <CardMedia 
                        component="img" 
                        sx={{ width: 60, height: 60, borderRadius: 1.5, flexShrink: 0, objectFit: 'cover' }} 
                        image={getMainImage(item)} 
                        alt="thumbnail" 
                      />
                      <Box sx={{ ml: 1.5, overflow: 'hidden', flex: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getTitle(item)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                             {item.type === 'laporan' ? <ReportIcon color="warning" sx={{ fontSize: 14 }} /> : <PlaceIcon color="error" sx={{ fontSize: 14 }} />}
                             <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{item.type === 'rawan' ? 'Rawan' : 'Laporan'}</Typography>
                        </Stack>
                      </Box>
                    </CardActionArea>
                  </Card>
                ))}
            </Stack>
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
           <Typography variant="body1">Pilih marker di peta untuk melihat detail.</Typography>
           {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      )}
    </Paper>
  );
};

// ====================================================================
// --- (B) KOMPONEN HALAMAN UTAMA ---
// ====================================================================

const AdminPeta: React.FC = () => {
  const [lokasiRawanList, setLokasiRawanList] = useState<IMarkerRawan[]>([]);
  const [laporanList, setLaporanList] = useState<IMarkerLaporan[]>([]);
  const [selectedItem, setSelectedItem] = useState<IMapMarker | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapPanningEnabled, setIsMapPanningEnabled] = useState<boolean>(true);
  
  // Modal State (Lokasi Rawan)
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [formData, setFormData] = useState({ namaLokasi: '', deskripsi: '', latitude: null as number | null, longitude: null as number | null });
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- FETCH DATA UTAMA ---
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Autentikasi tidak ditemukan. Silakan login kembali.'); setLoading(false); return; }
    
    try {
      setLoading(true); setError(null);
      
      // Ambil data Lokasi Rawan & Laporan secara paralel
      // Menggunakan API_BASE_URL agar port 5000 terpanggil
      const [resRawan, resLaporan] = await Promise.all([
        fetch(`${API_BASE_URL}/api/lokasi-rawan`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/laporan`, { headers: { 'Authorization': `Bearer ${token}` } }) 
      ]);

      if (!resRawan.ok) throw new Error("Gagal memuat lokasi rawan");
      
      const rawRawan = await resRawan.json();
      const rawLaporan = resLaporan.ok ? await resLaporan.json() : [];

      // 1. Map Lokasi Rawan
      const mappedRawan: IMarkerRawan[] = rawRawan.map((item: any) => ({
        ...item,
        type: 'rawan',
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        // Pastikan images array ada
        images: Array.isArray(item.images) ? item.images : [] 
      }));

      // 2. Map Laporan (Sinkron dengan reportController.js yang baru)
      const mappedLaporan: IMarkerLaporan[] = rawLaporan
        .filter((item: any) => item.latitude && item.longitude) // Filter koordinat valid
        .map((item: any) => ({
          type: 'laporan',
          id: item.id,
          judul_laporan: item.jenisKejadian || 'Laporan Masuk', 
          deskripsi_laporan: item.deskripsi, 
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          status: item.status,
          created_at: item.timestampDibuat,
          // Ambil nama dari relasi Pelapor
          nama_pelapor: item.Pelapor?.name || 'Masyarakat', 
          // Ambil foto dari relasi Dokumentasis (array ke-0)
          foto_bukti: (item.Dokumentasis && item.Dokumentasis.length > 0) 
              ? item.Dokumentasis[0].fileUrl 
              : null,
      }));

      setLokasiRawanList(mappedRawan);
      setLaporanList(mappedLaporan);

    } catch (err: any) {
      setError(err.message); console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); 

  // Gabungkan kedua list untuk ditampilkan di map
  const mapMarkers: IMapMarker[] = useMemo(() => [...lokasiRawanList, ...laporanList], [lokasiRawanList, laporanList]);

  // Handle Klik Marker
  const handleMarkerClick = (marker: IMapMarker) => {
    setIsMapPanningEnabled(true); 
    setSelectedItem(marker);
  };

  // Handle Klik Peta (Untuk tambah lokasi rawan baru)
  const handleMapClick = (latlng: L.LatLng) => {
    setIsEditMode(false); 
    setSelectedItem(null);
    setFormData({ namaLokasi: '', deskripsi: '', latitude: latlng.lat, longitude: latlng.lng });
    setImageFiles([]); 
    setOpenModal(true);
  };

  // --- LOGIKA MODAL (CREATE/UPDATE LOKASI RAWAN) ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const formBody = new FormData();
    formBody.append('namaLokasi', formData.namaLokasi);
    formBody.append('deskripsi', formData.deskripsi);
    formBody.append('latitude', String(formData.latitude));
    formBody.append('longitude', String(formData.longitude));
    imageFiles.forEach(file => formBody.append('images', file));

    try {
        let url = `${API_BASE_URL}/api/lokasi-rawan`;
        let method = 'POST';

        if (isEditMode && selectedItem && selectedItem.type === 'rawan') {
            url = `${API_BASE_URL}/api/lokasi-rawan/${selectedItem.id}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formBody,
        });

        if (!response.ok) throw new Error("Gagal menyimpan data");
        
        await fetchData(); // Refresh data
        setOpenModal(false);
        setImageFiles([]);

    } catch (e: any) {
        alert(e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteLokasi = async () => {
      if (!selectedItem || selectedItem.type !== 'rawan') return;
      if (!window.confirm(`Hapus ${selectedItem.namaLokasi}?`)) return;

      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/lokasi-rawan/${selectedItem.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if(!response.ok) throw new Error("Gagal menghapus");
          
          alert("Berhasil dihapus");
          setSelectedItem(null);
          await fetchData();
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleDeleteImage = async (imgUrl: string) => {
      if (!selectedItem || selectedItem.type !== 'rawan') return;
      if (!window.confirm("Hapus gambar ini?")) return;
      
      try {
          const token = localStorage.getItem('token');
          await fetch(`${API_BASE_URL}/api/lokasi-rawan/${selectedItem.id}/delete-image`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ imageUrl: imgUrl })
          });
          fetchData();
          // Manual update state lokal agar UI responsif (opsional)
          setSelectedItem(prev => prev && prev.type === 'rawan' ? {...prev, images: prev.images.filter(i => i !== imgUrl)} : prev);
      } catch (e) { console.error(e); }
  }


  return (
    <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', overflow: 'hidden', boxSizing: 'border-box' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', gap: 2, overflow: 'hidden' }}>
        
        {/* MAP CONTAINER */}
        <Box sx={{ flex: 1, position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
          {loading && !selectedItem ? ( 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress /><Typography sx={{ ml: 2 }}>Memuat Peta...</Typography>
            </Box>
          ) : (
            <InteractiveMap
              markers={mapMarkers}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick} 
              centerCoordinates={isMapPanningEnabled && selectedItem ? [Number(selectedItem.latitude), Number(selectedItem.longitude)] : undefined}
            />
          )}
        </Box>

        {/* SIDEBAR CONTAINER */}
        <UnifiedSidebar
          loading={loading} error={error} selectedItem={selectedItem} itemList={mapMarkers}
          onSelectItem={(item) => { setIsMapPanningEnabled(true); setSelectedItem(item); }}
          onEditClick={() => { setIsEditMode(true); setOpenModal(true); }}
          onDeleteClick={handleDeleteLokasi}
        />
      </Box>

      {/* MODAL (Create/Edit Lokasi Rawan) */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Fade in={openModal}>
          <Box sx={modalStyle} component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{isEditMode ? 'Edit Lokasi Rawan' : 'Tambah Lokasi Rawan'}</Typography>
              <IconButton onClick={() => setOpenModal(false)}><CloseIcon /></IconButton>
            </Stack>
            
            <TextField
              margin="normal" required fullWidth label="Nama Lokasi"
              value={formData.namaLokasi}
              onChange={(e) => setFormData({ ...formData, namaLokasi: e.target.value })}
            />
            <TextField
              margin="normal" fullWidth label="Deskripsi" multiline rows={3}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />

             {/* List Gambar Existing (Khusus Edit Mode) */}
             {isEditMode && selectedItem && selectedItem.type === 'rawan' && selectedItem.images.length > 0 && (
                <Box mt={2}>
                    <Typography variant="caption">Gambar saat ini:</Typography>
                    <Stack spacing={0.5} mt={0.5}>
                        {selectedItem.images.map(img => (
                            <Stack direction="row" justifyContent="space-between" bgcolor="#f5f5f5" p={0.5} borderRadius={1} key={img}>
                                <Typography variant="caption" noWrap sx={{maxWidth: 250}}>{img.split('/').pop()}</Typography>
                                <IconButton size="small" color="error" onClick={() => handleDeleteImage(img)}><CloseIcon fontSize="small"/></IconButton>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            )}

            <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />} sx={{ mt: 2 }}>
              {imageFiles.length === 0 ? 'Upload Gambar' : `${imageFiles.length} file dipilih`}
              <input type="file" hidden multiple accept="image/*" onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))} />
            </Button>
            
            <Button type="submit" fullWidth variant="contained" color="error" disabled={isSubmitting} sx={{ mt: 3 }}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Simpan'}
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AdminPeta;