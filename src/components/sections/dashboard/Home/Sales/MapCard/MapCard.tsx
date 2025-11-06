import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ReactElement, useEffect, useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InteractiveMap, { IMapMarker } from 'components/InteractiveMap';

const MapCard = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [markers, setMarkers] = useState<IMapMarker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Sinkronkan data peta dengan halaman Analisis & Peta
  useEffect(() => {
    const fetchMarkers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Autentikasi tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch('http://localhost:5000/api/lokasi-rawan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Gagal memuat data peta: ${res.statusText}`);
        }
        const data = await res.json();
        const mapped: IMapMarker[] = (data || []).map((d: any) => ({
          id: d.id,
          latitude: d.latitude,
          longitude: d.longitude,
          namaLokasi: d.namaLokasi || d.nama_lokasi || 'Lokasi',
        }));
        setMarkers(mapped);
      } catch (e: any) {
        setError(e.message || 'Terjadi kesalahan saat memuat peta');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  return (
    <Stack
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 1,
        width: 1,
        boxShadow: (theme) => theme.shadows[4],
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2.5}>
        <Typography variant="subtitle1" color="text.primary">
          Peta Lokasi
        </Typography>
        <IconButton
          id="map-card-button"
          aria-controls={open ? 'map-card-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            bgcolor: open ? 'action.active' : 'transparent',
            p: 1,
            width: 36,
            height: 36,
            '&:hover': {
              bgcolor: 'action.active',
            },
          }}
        >
          <IconifyIcon icon="ph:dots-three-outline-fill" color="text.secondary" />
        </IconButton>
        <Menu
          id="map-card-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'map-card-button',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Lihat Detail
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Refresh
            </Typography>
          </MenuItem>
        </Menu>
      </Stack>
      
      <Stack
        flex={1}
        sx={{
          padding: (theme) => theme.spacing(0, 2.5, 2.5),
          height: '100%',
        }}
      >
        <Paper
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            minHeight: 400,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>Memuat peta...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <Box sx={{ height: '100%', width: '100%' }}>
              <InteractiveMap
                markers={markers}
                onMarkerClick={() => {}}
              />
            </Box>
          )}
        </Paper>
      </Stack>
    </Stack>
  );
};

export default MapCard;

