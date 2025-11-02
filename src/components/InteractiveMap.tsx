import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api';
import Swal from 'sweetalert2';

interface LokasiRawan {
  id: number;
  namaLokasi: string;
  latitude: number;
  longitude: number;
  deskripsi?: string;
}

interface InteractiveMapProps {
  height?: string | number;
  enableMarker?: boolean;
  onMarkerClick?: (lokasi: LokasiRawan) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  height = '100%',
  enableMarker = true,
  onMarkerClick,
}) => {
  const [lokasiRawanList, setLokasiRawanList] = useState<LokasiRawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLokasi, setEditingLokasi] = useState<LokasiRawan | null>(null);
  const [formData, setFormData] = useState({ namaLokasi: '', deskripsi: '' });
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Koordinat default (Subang, Jawa Barat)
  const defaultCenter = { lat: -6.5714, lng: 107.7636 };
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    fetchLokasiRawan();
  }, []);

  const fetchLokasiRawan = async () => {
    try {
      setLoading(true);
      const response = await api.get<LokasiRawan[]>('/lokasi-rawan');
      console.log('Lokasi rawan response:', response.data);
      setLokasiRawanList(response.data || []);
    } catch (error: any) {
      console.error('Error fetching lokasi rawan:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      const errorMessage = error.response?.status === 401
        ? 'Sesi telah berakhir. Silakan login ulang.'
        : error.response?.status === 403
        ? 'Anda tidak memiliki akses untuk melihat lokasi rawan.'
        : error.response?.data?.message || 'Gagal memuat data lokasi rawan.';
      
      Swal.fire({
        target: document.body,
        customClass: { container: 'highest-z-index' },
        title: 'Error',
        text: errorMessage,
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableMarker) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Konversi koordinat klik ke latitude/longitude (simplified)
    // Dalam implementasi nyata, gunakan library peta seperti Leaflet atau Google Maps
    const lat = center.lat + (0.5 - y / rect.height) * 0.1;
    const lng = center.lng + (x / rect.width - 0.5) * 0.1;

    setSelectedPoint({ x, y });
    setEditingLokasi(null);
    setFormData({ namaLokasi: '', deskripsi: '' });
    setIsDialogOpen(true);
  };

  const handleMarkerClick = (lokasi: LokasiRawan, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onMarkerClick) {
      onMarkerClick(lokasi);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPoint || !formData.namaLokasi.trim()) {
      Swal.fire({
        target: document.body,
        customClass: { container: 'highest-z-index' },
        title: 'Validasi',
        text: 'Nama lokasi harus diisi.',
        icon: 'warning',
      });
      return;
    }

    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const lat = center.lat + (0.5 - selectedPoint.y / rect.height) * 0.1;
    const lng = center.lng + (selectedPoint.x / rect.width - 0.5) * 0.1;

    try {
      if (editingLokasi) {
        await api.put(`/lokasi-rawan/${editingLokasi.id}`, {
          namaLokasi: formData.namaLokasi,
          deskripsi: formData.deskripsi,
          latitude: lat,
          longitude: lng,
        });
        Swal.fire({
          target: document.body,
          customClass: { container: 'highest-z-index' },
          title: 'Berhasil!',
          text: 'Lokasi rawan berhasil diperbarui.',
          icon: 'success',
        });
      } else {
        await api.post('/lokasi-rawan', {
          namaLokasi: formData.namaLokasi,
          deskripsi: formData.deskripsi,
          latitude: lat,
          longitude: lng,
        });
        Swal.fire({
          target: document.body,
          customClass: { container: 'highest-z-index' },
          title: 'Berhasil!',
          text: 'Lokasi rawan berhasil ditambahkan.',
          icon: 'success',
        });
      }
      setIsDialogOpen(false);
      setSelectedPoint(null);
      fetchLokasiRawan();
    } catch (error: any) {
      console.error('Error saving lokasi rawan:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      const errorMessage = error.response?.status === 401
        ? 'Sesi telah berakhir. Silakan login ulang.'
        : error.response?.status === 403
        ? 'Anda tidak memiliki akses untuk menambah lokasi rawan. Hanya Admin yang dapat menambah lokasi rawan.'
        : error.response?.status === 400
        ? error.response?.data?.message || 'Data yang dimasukkan tidak valid.'
        : error.response?.data?.message || 'Terjadi kesalahan saat menyimpan lokasi rawan.';
      
      Swal.fire({
        target: document.body,
        customClass: { container: 'highest-z-index' },
        title: 'Error',
        text: errorMessage,
        icon: 'error',
      });
    }
  };

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const result = await Swal.fire({
      target: document.body,
      customClass: { container: 'highest-z-index' },
      title: 'Hapus Lokasi?',
      text: 'Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/lokasi-rawan/${id}`);
        Swal.fire({
          target: document.body,
          customClass: { container: 'highest-z-index' },
          title: 'Dihapus!',
          text: 'Lokasi rawan berhasil dihapus.',
          icon: 'success',
        });
        fetchLokasiRawan();
      } catch (error: any) {
        console.error('Error deleting lokasi rawan:', error);
        const errorMessage = error.response?.status === 401
          ? 'Sesi telah berakhir. Silakan login ulang.'
          : error.response?.status === 403
          ? 'Anda tidak memiliki akses untuk menghapus lokasi rawan.'
          : error.response?.data?.message || 'Gagal menghapus lokasi rawan.';
        
        Swal.fire({
          target: document.body,
          customClass: { container: 'highest-z-index' },
          title: 'Error',
          text: errorMessage,
          icon: 'error',
        });
      }
    }
  };

  const handleEdit = (lokasi: LokasiRawan, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingLokasi(lokasi);
    setFormData({
      namaLokasi: lokasi.namaLokasi,
      deskripsi: lokasi.deskripsi || '',
    });

    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const latOffset = (lokasi.latitude - center.lat) / 0.1;
      const lngOffset = (lokasi.longitude - center.lng) / 0.1;
      const x = rect.width * (0.5 + lngOffset);
      const y = rect.height * (0.5 - latOffset);
      setSelectedPoint({ x, y });
      setIsDialogOpen(true);
    }
  };

  const convertCoordToPixel = (lat: number, lng: number) => {
    if (!mapContainerRef.current) return { x: 0, y: 0 };
    const rect = mapContainerRef.current.getBoundingClientRect();
    const latOffset = (lat - center.lat) / 0.1;
    const lngOffset = (lng - center.lng) / 0.1;
    return {
      x: rect.width * (0.5 + lngOffset),
      y: rect.height * (0.5 - latOffset),
    };
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: height === '100%' ? '100%' : height, flex: height === '100%' ? 1 : undefined }}>
      <Paper
        ref={mapContainerRef}
        onClick={handleMapClick}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 500,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          cursor: enableMarker ? 'crosshair' : 'default',
          bgcolor: 'grey.300',
          backgroundImage: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
        }}
      >
        {/* Grid lines */}
        <Box
          component="svg"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        >
          <line x1="0" y1="33%" x2="100%" y2="33%" stroke="#666" strokeWidth="1" />
          <line x1="0" y1="66%" x2="100%" y2="66%" stroke="#666" strokeWidth="1" />
          <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#666" strokeWidth="1" />
          <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#666" strokeWidth="1" />
        </Box>

        {/* Markers untuk lokasi rawan */}
        {lokasiRawanList.map((lokasi) => {
          const pixel = convertCoordToPixel(lokasi.latitude, lokasi.longitude);
          return (
            <Tooltip
              key={lokasi.id}
              title={
                <Stack>
                  <Typography variant="caption" fontWeight="bold">
                    {lokasi.namaLokasi}
                  </Typography>
                  {lokasi.deskripsi && (
                    <Typography variant="caption">{lokasi.deskripsi}</Typography>
                  )}
                </Stack>
              }
              arrow
            >
              <Box
                onClick={(e) => handleMarkerClick(lokasi, e)}
                onMouseEnter={() => setHoveredMarker(lokasi.id)}
                onMouseLeave={() => setHoveredMarker(null)}
                sx={{
                  position: 'absolute',
                  left: `${pixel.x}px`,
                  top: `${pixel.y}px`,
                  transform: 'translate(-50%, -100%)',
                  cursor: 'pointer',
                  zIndex: hoveredMarker === lokasi.id ? 10 : 5,
                }}
              >
                <LocationOnIcon
                  sx={{
                    fontSize: hoveredMarker === lokasi.id ? 40 : 32,
                    color: 'error.main',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    transition: 'font-size 0.2s',
                  }}
                />
                {hoveredMarker === lokasi.id && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      mt: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleEdit(lokasi, e)}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 24,
                        height: 24,
                      }}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(lokasi.id, e)}
                      sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                        width: 24,
                        height: 24,
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
                )}
              </Box>
            </Tooltip>
          );
        })}

        {/* Selected point marker */}
        {selectedPoint && (
          <Box
            sx={{
              position: 'absolute',
              left: `${selectedPoint.x}px`,
              top: `${selectedPoint.y}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 15,
            }}
          >
            <LocationOnIcon
              sx={{
                fontSize: 36,
                color: 'warning.main',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                animation: 'pulse 2s infinite',
              }}
            />
          </Box>
        )}

        {/* Legend */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            p: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Legenda
          </Typography>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon sx={{ fontSize: 20, color: 'error.main' }} />
              <Typography variant="caption">Lokasi Rawan</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon sx={{ fontSize: 20, color: 'warning.main' }} />
              <Typography variant="caption">Pilih Lokasi</Typography>
            </Stack>
            {enableMarker && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Klik pada peta untuk menambahkan lokasi rawan
              </Typography>
            )}
          </Stack>
        </Paper>
      </Paper>

      {/* Dialog untuk form lokasi rawan */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedPoint(null);
          setEditingLokasi(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingLokasi ? 'Edit Lokasi Rawan' : 'Tambah Lokasi Rawan'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nama Lokasi"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.namaLokasi}
              onChange={(e) => setFormData({ ...formData, namaLokasi: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Deskripsi"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              setSelectedPoint(null);
              setEditingLokasi(null);
            }}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: translate(-50%, -100%) scale(1);
            }
            50% {
              opacity: 0.7;
              transform: translate(-50%, -100%) scale(1.1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default InteractiveMap;

