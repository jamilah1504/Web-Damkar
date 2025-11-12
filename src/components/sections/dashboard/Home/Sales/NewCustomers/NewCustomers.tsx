import { ReactElement, useEffect, useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';

import IconifyIcon from 'components/base/IconifyIcon';
import CustomerItem from './CustomerItem';
import { getPetugasUsers, UserDto } from 'services/userService';

const NewCustomers = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [petugas, setPetugas] = useState<UserDto[] | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.target);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await getPetugasUsers();
        setPetugas(list);
      } catch (e) {
        console.error('Gagal mengambil data petugas:', e);
        setPetugas([]);
      }
    })();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 1,
        width: 1,
        boxShadow: (theme: any) => theme.shadows[4],
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2.5}>
        <Typography variant="subtitle1" color="text.primary">
          Petugas Aktif
        </Typography>
        <IconButton
          id="new-customers-button"
          aria-controls={open ? 'new-customers-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            bgcolor: open ? 'action.active' : 'transparent',
            padding: 1,
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
          id="new-customers-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'new-customers-button',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Last Week
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Last Month
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Last Year
            </Typography>
          </MenuItem>
        </Menu>
      </Stack>
      <Stack 
        pb={1.25}
        sx={{
          maxHeight: 'calc(5 * 95px)', // Tinggi untuk tepat 5 item (80px per item)
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme: any) => theme.palette.grey[300],
            borderRadius: '3px',
            '&:hover': {
              background: (theme: any) => theme.palette.grey[400],
            },
          },
        }}
      >
        {(petugas ?? []).map((u: UserDto) => (
          <CustomerItem
            key={u.id}
            name={u.name}
            subtitle={u.pangkat || u.role}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default NewCustomers;
