import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ReactElement, useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MapCard = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 1,
        flex: '1 1 auto',
        width: { xs: 'auto', sm: 0.5, lg: 'auto' },
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
            minHeight: 200,
          }}
        >
          {/* Map Container */}
          <Box
            sx={{
              height: '100%',
              width: '100%',
              bgcolor: 'grey.300',
              backgroundImage: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Simulated Map Elements */}
            <Box
              component="svg"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.3,
              }}
            >
              {/* Grid lines untuk simulasi peta */}
              <line x1="0" y1="33%" x2="100%" y2="33%" stroke="#666" strokeWidth="1" />
              <line x1="0" y1="66%" x2="100%" y2="66%" stroke="#666" strokeWidth="1" />
              <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#666" strokeWidth="1" />
              <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#666" strokeWidth="1" />
            </Box>

            {/* Location Markers */}
            <LocationOnIcon
              sx={{
                position: 'absolute',
                top: '30%',
                left: '40%',
                fontSize: 32,
                color: 'error.main',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '60%',
                right: '30%',
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: '2px solid white',
                boxShadow: 2,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '25%',
                left: '25%',
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                border: '2px solid white',
                boxShadow: 2,
              }}
            />
          </Box>

          {/* Legend */}
          <Paper
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              p: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  Insiden Aktif
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  Lokasi Rawan
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  Area Pantau
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default MapCard;

