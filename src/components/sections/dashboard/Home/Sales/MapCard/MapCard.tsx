import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme,
  Fab,
  Tooltip,
  Zoom
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ReactElement, useEffect, useState } from 'react';
import InteractiveMap, { IMapMarker } from 'components/InteractiveMapCard';
// Import Icon Material UI
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '../../../../../../api';

interface ExtendedMapMarker extends IMapMarker {
  description?: string;
  images: string[];
  image?: string; 
}

const MapCard = (): ReactElement => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // === STATE BARU UNTUK TOGGLE LIST ===
  const [isListOpen, setIsListOpen] = useState<boolean>(true);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [markers, setMarkers] = useState<ExtendedMapMarker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewState, setViewState] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  const openMenu = Boolean(anchorEl);

  const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  // Resize fix map
  useEffect(() => {
    if (!loading && !error) {
      const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
      return () => clearTimeout(t);
    }
  }, [loading, error, isListOpen]); // Trigger resize saat list dibuka/tutup

  // Fetch Data
  useEffect(() => {
    const fetchMarkers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Autentikasi tidak ditemukan.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get('/lokasi-rawan');
        const data = await res.data;
        
        const mapped: ExtendedMapMarker[] = (data || []).map((d: any) => ({
          id: d.id,
          latitude: parseFloat(d.latitude),
          longitude: parseFloat(d.longitude),
          namaLokasi: d.namaLokasi || 'Lokasi Tanpa Nama',
          description: d.deskripsi || 'Tidak ada deskripsi',
          images: d.images || [],
          image: (d.images && d.images.length > 0) ? d.images[0] : 'https://via.placeholder.com/150?text=No+Image',
        }));

        setMarkers(mapped);

        if (mapped.length > 0) {
          setViewState({
            lat: mapped[0].latitude,
            lng: mapped[0].longitude,
            zoom: 13
          });
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  const handleLocationClick = (marker: ExtendedMapMarker) => {
    setSelectedId(marker.id);
    setViewState({
      lat: marker.latitude,
      lng: marker.longitude,
      zoom: 16 
    });
    
    // Di mobile, opsional: tutup list setelah memilih agar peta terlihat penuh
    if (isMobile) {
        // setIsListOpen(false); // Uncomment jika ingin auto-close di mobile
    }
  };

  const handleToggleList = () => {
    setIsListOpen(!isListOpen);
  };

  return (
    <Stack
      sx={{
        bgcolor: 'common.white',
        borderRadius: 4,
        height: '80vh',
        minHeight: 500,
        width: '100%',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      
      {/* === LAYER 1: PETA === */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
           <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.8)' }}><Alert severity="error">{error}</Alert></Box>
        ) : (
           <InteractiveMap
             markers={markers}
             center={viewState ? [viewState.lat, viewState.lng] : undefined}
             zoom={viewState?.zoom}
             activeMarkerId={selectedId} 
           />
        )}
      </Box>

      {/* === LAYER 2: TOMBOL BUKA LIST (HANYA MUNCUL JIKA LIST DITUTUP) === */}
      <Zoom in={!isListOpen && !loading && !error}>
        <Fab
            variant="extended"
            size="medium"
            onClick={handleToggleList}
            sx={{
                position: 'absolute',
                zIndex: 1000,
                // Desktop: Pojok Kiri Atas | Mobile: Tengah Bawah
                top: { xs: 'auto', md: 20 },
                left: { xs: '50%', md: 20 },
                bottom: { xs: 30, md: 'auto' },
                transform: { xs: 'translateX(-50%)', md: 'none' }, 
                textTransform: 'none',
                backgroundColor: 'white',
                color: 'black',
                '&:hover': { backgroundColor: '#f5f5f5' }
            }}
        >
            <FormatListBulletedIcon sx={{ mr: 1 }} />
             Lokasi Rawan
        </Fab>
      </Zoom>

      {/* === LAYER 3: FLOATING LIST (CARD) === */}
      {!loading && !error && (
        <Zoom in={isListOpen}>
            <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                // Responsive Position
                top: { xs: 'auto', md: 20 },
                bottom: { xs: 0, md: 20 },
                left: { xs: 0, md: 20 },
                width: { xs: '100%', md: 350 },
                height: { xs: '45%', md: 'auto' },
                maxHeight: { xs: '60%', md: 'calc(100% - 40px)' },

                borderRadius: { xs: '20px 20px 0 0', md: 3 },
                bgcolor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                display: isListOpen ? 'flex' : 'none', // Logic display
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out'
            }}
            >
                {/* Header List */}
                <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                px={2} 
                py={1.5} 
                borderBottom="1px solid" 
                borderColor="grey.200"
                bgcolor="white"
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnIcon color="error" />
                        <Typography variant="subtitle1" fontWeight="700">
                        Lokasi Rawan ({markers.length})
                        </Typography>
                    </Stack>
                    
                    <Stack direction="row" spacing={1}>
                        
                        {/* Tombol Close (X atau Panah Bawah) */}
                        <Tooltip title="Tutup Daftar">
                            <IconButton onClick={handleToggleList} size="small" sx={{ bgcolor: 'white', color:'black' }}>
                                {isMobile ? <KeyboardArrowDownIcon /> : <CloseIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Content List */}
                <Box sx={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    p: 1.5,
                    // Custom Scrollbar
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' }
                }}>
                    <Stack spacing={1.5}>
                        {markers.map((marker) => {
                          const isSelected = selectedId === marker.id;
                          return (
                            <Box 
                                key={marker.id}
                                onClick={() => handleLocationClick(marker)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    bgcolor: isSelected ? 'primary.lighter' : 'white',
                                    border: '1px solid',
                                    borderColor: isSelected ? 'primary.main' : 'grey.200',
                                    boxShadow: isSelected ? '0 2px 8px rgba(211, 47, 47, 0.15)' : 'none',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'grey.50'
                                    }
                                }}
                            >
                                {/* Item Content */}
                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                    <Avatar 
                                        variant="rounded" 
                                        src={marker.image} // Thumbnail
                                        sx={{ width: 50, height: 50, bgcolor: 'grey.300' }}
                                    >
                                        <LocationOnIcon />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                            {marker.namaLokasi}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 2
                                        }}>
                                            {marker.description}
                                        </Typography>
                                        
                                        {/* Gallery Preview */}
                                        {marker.images.length > 0 && (
                                            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                                                <PhotoLibraryIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
                                                <Typography variant="caption" fontSize="10px" color="text.secondary">
                                                    {marker.images.length} Foto
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                </Stack>

                                {/* Horizontal Image Scroll (Optional: Muncul jika dipilih) */}
                                {isSelected && marker.images.length > 0 && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        gap: 1, 
                                        overflowX: 'auto', 
                                        mt: 1.5, 
                                        pb: 0.5,
                                        '&::-webkit-scrollbar': { height: 0 } // Hide scrollbar
                                    }}>
                                        {marker.images.map((imgUrl, i) => (
                                            <Box 
                                                key={i} 
                                                component="img" 
                                                src={imgUrl} 
                                                sx={{ 
                                                    width: 60, 
                                                    height: 60, 
                                                    borderRadius: 1, 
                                                    objectFit: 'cover',
                                                    border: '1px solid #eee' 
                                                }} 
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                          )
                        })}
                        
                        {markers.length === 0 && (
                            <Typography variant="body2" textAlign="center" color="text.secondary" py={2}>
                                Tidak ada data lokasi.
                            </Typography>
                        )}
                    </Stack>
                </Box>
            </Paper>
        </Zoom>
      )}

    </Stack>
  );
};

export default MapCard;