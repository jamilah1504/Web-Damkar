import paths, { rootPaths } from '../routes/paths';

// 1. Interface dan Tipe Data
export interface NavItem {
  title: string;
  path: string;
  icon?: string;
  collapsible: boolean;
  sublist?: NavItem[];
}

export type UserRole = 'admin' | 'petugas' | 'masyarakat';

// 2. Definisi Navigasi untuk setiap peran

// == NAVIGASI UNTUK ADMIN ==
const navItemsAdmin: NavItem[] = [
  {
    title: 'Dashboard',
    path: `/${rootPaths.adminRoot}/${paths.adminDashboard}`, // Hasil -> /admin/dashboard
    icon: 'ion:stats-chart-sharp',
    collapsible: false,
  },
  {
    title: 'Manajemen Laporan',
    path: `#!`, // Arahkan ke anak pertama
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
        icon: 'ph:history-fill',
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
    path: `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`, // Hasil -> /petugas/tugas
    icon: 'ion:list-sharp',
    collapsible: false,
  },
  {
    title: 'Riwayat Tugas',
    path: `/${rootPaths.petugasRoot}/${paths.petugasRiwayat}`, // Hasil -> /petugas/riwayat
    icon: 'ion:checkmark-done-sharp',
    collapsible: false,
  },
  {
    title: 'Peta Operasional',
    path: `/${rootPaths.petugasRoot}/${paths.petugasPeta}`, // Hasil -> /petugas/peta
    icon: 'ion:map-sharp',
    collapsible: false,
  },
];

// == NAVIGASI UNTUK MASYARAKAT ==
const navItemsMasyarakat: NavItem[] = [
  {
    title: 'Beranda',
    path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`, // Hasil -> /masyarakat/dashboard
    icon: 'ion:home-sharp',
    collapsible: false,
  },
  {
    title: 'Laporan Saya',
    path: `/${rootPaths.masyarakatRoot}/${paths.masyarakatLacakLaporan}`, // Arahkan ke anak pertama
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
    title: 'Informasi Publik',
    path: '/info-publik', // Asumsi ada rute publik untuk ini
    icon: 'ion:map-sharp',
    collapsible: false,
  },
  {
    title: 'Profil Saya',
    path: '/profil', // Asumsi ada rute profil umum
    icon: 'ion:person-sharp',
    collapsible: false,
  },
];

// 3. Fungsi Factory untuk mendapatkan navigasi sesuai peran
export const getNavItemsByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'admin':
      return navItemsAdmin;
    case 'petugas':
      return navItemsPetugas;
    case 'masyarakat':
      return navItemsMasyarakat;
    default:
      // Mengembalikan array kosong jika peran tidak dikenali
      return [];
  }
};
