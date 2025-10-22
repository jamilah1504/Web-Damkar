import { ReactElement } from 'react';
import {
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
} from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';

import IconifyIcon from '../../../components/base/IconifyIcon';
// import logo from '../../../assets/logo/elegant-logo.png';
import logo from '../../../assets/logo/fireresponse-logo.png';
import Image from '../../../components/base/Image';
import NavButton from './NavButton';
import paths, { rootPaths } from '../../../routes/paths';
interface NavItem {
  title: string;
  path: string;
  icon?: string;
  collapsible: boolean;
  sublist?: NavItem[];
}
type UserRole = 'admin' | 'petugas' | 'masyarakat';

// == NAVIGASI UNTUK ADMIN ==
const navItemsAdmin: NavItem[] = [
  {
    title: 'Dashboard',
    path: `/${rootPaths.adminRoot}/${paths.adminDashboard}`,
    icon: 'ion:stats-chart-sharp',
    collapsible: false,
  },
  {
    title: 'Manajemen Laporan',
    path: '#!',
    icon: 'ph:file-text-fill',
    collapsible: true,
    sublist: [
      {
        title: 'Laporan Masuk',
        path: `/${rootPaths.adminRoot}/${paths.adminLaporanMasuk}`,
        icon: 'ph:file-text-fill',
        collapsible: false,
      },
      {
        title: 'Riwayat Laporan',
        path: `/${rootPaths.adminRoot}/${paths.adminLaporanRiwayat}`,
        icon: 'ph:file-text-fill',
        collapsible: false,
      },
    ],
  },
  {
    title: 'Jadwal Edukasi',
    path: `/${rootPaths.adminRoot}/${paths.adminJadwal}`,
    icon: 'ph:calendar-fill',
    collapsible: false,
  },
  {
    title: 'Manajemen Konten Edukasi',
    path: `/${rootPaths.adminRoot}/${paths.AdminEdukasi}`,
    icon: 'ph:book-open-fill',
    collapsible: false,
  },
  {
    title: 'Analisis & Peta',
    path: `/${rootPaths.adminRoot}/${paths.adminPeta}`,
    icon: 'ion:map-sharp',
    collapsible: false,
  },
  {
    title: 'Manajemen Pengguna',
    path: `/${rootPaths.adminRoot}/${paths.adminPengguna}`,
    icon: 'ph:users-three-fill',
    collapsible: false,
  },
  {
    title: 'Pengaturan',
    path: `/${rootPaths.adminRoot}/${paths.adminPengaturan}`,
    icon: 'ion:settings-sharp',
    collapsible: false,
  },
];

// == NAVIGASI UNTUK PETUGAS ==
const navItemsPetugas: NavItem[] = [
  {
    title: 'Tugas Aktif',
    path: `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`,
    icon: 'ion:list-sharp',
    collapsible: false,
  },
  {
    title: 'Riwayat Tugas',
    path: `/${rootPaths.petugasRoot}/${paths.petugasRiwayat}`,
    icon: 'ion:checkmark-done-sharp',
    collapsible: false,
  },
  {
    title: 'Peta Operasional',
    path: `/${rootPaths.petugasRoot}/${paths.petugasPeta}`,
    icon: 'ion:map-sharp',
    collapsible: false,
  },
];

// == NAVIGASI UNTUK MASYARAKAT ==
const navItemsMasyarakat: NavItem[] = [
  {
    title: 'Beranda',
    path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`,
    icon: 'ion:home-sharp',
    collapsible: false,
  },
  {
    title: 'Laporan Saya',
    path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`,
    icon: 'ph:file-text-fill',
    collapsible: true,
    sublist: [
      {
        title: 'Lacak Laporan',
        path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`,
        collapsible: false,
      },
      {
        title: 'Buat Laporan Baru',
        path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatBuatLaporan}`,
        collapsible: false,
      },
    ],
  },
  {
    title: 'Ajukan Kunjungan',
    path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatAjukanKunjungan}`,
    icon: 'ph:calendar-plus-fill',
    collapsible: false,
  },
];

// 4. Buat fungsi untuk mendapatkan menu sesuai peran
const getNavItemsByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'admin':
      return navItemsAdmin;
    case 'petugas':
      return navItemsPetugas;
    case 'masyarakat':
      return navItemsMasyarakat;
    default:
      return [];
  }
};

const Sidebar = (): ReactElement => {
  // Tentukan peran pengguna saat ini (ini akan dinamis di aplikasi nyata)
  const currentUserRole: UserRole = 'admin';

  // Panggil fungsi untuk mendapatkan item navigasi yang sesuai
  const navItems = getNavItemsByRole(currentUserRole);

  return (
    <Stack
      justifyContent="space-between"
      bgcolor="background.paper"
      height={1}
      boxShadow={(theme) => theme.shadows[4]}
      sx={{
        overflow: 'hidden',
        margin: { xs: 0, lg: 3.75 },
        borderRadius: { xs: 0, lg: 5 },
        '&:hover': {
          overflowY: 'auto',
        },
        width: 218,
      }}
    >
      <Link
        component={RouterLink}
        to="/"
        sx={{
          position: 'fixed',
          zIndex: 5,
          mt: 6.25,
          mx: 4.0625,
          mb: 3.75,
          bgcolor: 'background.paper',
          borderRadius: 5,
        }}
      >
        <Image
          src={logo}
          width={150} // Fixed width for the logo
          height={50} // Fixed height to maintain aspect ratio
          style={{ objectFit: 'contain' }} // Ensure the logo scales properly
          alt="Logo"
        />
      </Link>
      <Divider
        sx={{
          mx: 4.0625, // Match the horizontal margin of the logo
          mt: 13.75, // Position below the logo (mt: 6.25 + height: 50px + mb: 3.75)
          borderColor: '#ccc', // Subtle gray line
          width: 150, // Match the logo's width for alignment
        }}
      />
      <Stack
        justifyContent="space-between"
        height={1}
        sx={{
          overflow: 'hidden',
          '&:hover': {
            overflowY: 'auto',
          },
          width: 218,
        }}
      >
        <List
          sx={{
            mx: 2.5,
            py: 1.25,
            flex: '1 1 auto',
            width: 178,
          }}
        >
          {navItems.map((navItem, index) => (
            <NavButton key={index} navItem={navItem} />
          ))}
        </List>
        <List sx={{ mx: 2.5 }}>
          <ListItem sx={{ mx: 0, my: 2.5 }}>
            <ListItemButton
              component={RouterLink}
              to="/auth/login"
              sx={{
                backgroundColor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white',
                  opacity: 1.5,
                },
              }}
            >
              <ListItemIcon>
                <IconifyIcon icon="ri:logout-circle-line" />
              </ListItemIcon>
              <ListItemText>Log out</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>
    </Stack>
  );
};

export default Sidebar;
