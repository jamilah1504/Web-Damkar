import { MouseEventHandler, ReactElement } from 'react';
import {
  AppBar,
  Badge,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography, // <-- (1) PERBAIKAN: Typography sudah ditambahkan di sini
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { drawerWidth } from 'layouts/main-layout';

import { useLocation } from 'react-router-dom';
import capitalizePathname from 'helpers/capitalize-pathname';
import AccountDropdown from './AccountDropdown';
//import LanguageDropdown from './LanguageDropdown';
import Image from 'components/base/Image';
import logo from 'assets/logo/elegent-favicon-logo.png';

interface TopbarProps {
  handleDrawerToggle: MouseEventHandler;
}

const Topbar = ({ handleDrawerToggle }: TopbarProps): ReactElement => {
  const { pathname } = useLocation();
  const title = capitalizePathname(pathname);

  return (
    <AppBar
      sx={{
        width: { lg: `calc(100% - ${drawerWidth}px + 24px)` },
        ml: { lg: `${drawerWidth}px` },
      }}
    >
      <Toolbar
        sx={{
          p: 3.75,
        }}
      >
        <Stack direction="row" gap={1}>
          {/* ... (Kode IconButton Anda yang lain, tidak berubah) ... */}
          <Link href="/" width={40} height={40} display={{ xs: 'block', lg: 'none' }}>
            <IconButton color="inherit" sx={{ p: 0.75, bgcolor: 'inherit' }}>
              <Image src={logo} width={1} height={1} />
            </IconButton>
          </Link>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              width: 40,
              height: 40,
              m: 0,
              p: 0.75,
              display: { lg: 'none' },
              bgcolor: 'inherit',
            }}
          >
            <IconifyIcon icon="mdi:menu" />
          </IconButton>
          <IconButton
            color="inherit"
            sx={{
              width: 40,
              height: 40,
              p: 1,
              display: { xs: 'flex', lg: 'none' },
              mr: 'auto',
              bgcolor: 'inherit',
            }}
          >
            <IconifyIcon icon="mdi:search" width={1} height={1} />
          </IconButton>
        </Stack>
        <Stack
          display={{ xs: 'none', lg: 'flex' }}
          direction="row"
          gap={{ lg: 6.25 }}
          alignItems="center"
          flex={'1 1 auto'}
        >
          {/* --- (2) PERBAIKAN: Tanda { dan */ }
          <Typography variant="h5" component="h5" sx={{ fontWeight: 'bold' }}>
            {pathname === '/' ? 'Dashboard' : title}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={{ xs: 1, sm: 1.75 }}>
          {/* <LanguageDropdown /> */}
          <IconButton color="inherit" centerRipple sx={{ bgcolor: 'inherit', p: 0.75 }}>
            <Badge badgeContent={1} color="primary">
              <IconifyIcon icon="carbon:notification-filled" width={24} height={24} />
            </Badge>
          </IconButton>
          <AccountDropdown />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;