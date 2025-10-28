export const rootPaths = {
  authRoot: 'auth',
  adminRoot: 'admin',
  petugasRoot: 'petugas',
  masyarakatRoot: 'masyarakat',
};

const paths = {
  // --- Path Publik ---
  landing: '/',

  // --- Path Otentikasi ---
  login: 'login',
  register: 'register',

  // --- Path Admin ---
  adminDashboard: 'dashboard',
  adminLaporanMasuk: 'laporan/masuk',
  adminLaporanPeriodik: 'laporan/laporan-periodik',
  adminJadwal: 'jadwal',
  adminPeta: 'peta',
  adminNotifikasi: 'notifikasi',
  adminPengguna: 'pengguna',
  adminPengaturan: 'pengaturan',
  adminEdukasi: 'edukasi',

  // --- Path Petugas ---
  petugasTugasAktif: 'tugas',
  petugasRiwayat: 'riwayat',
  petugasPeta: 'peta',

  // --- Path Masyarakat ---
  masyarakatDashboard: 'dashboard',
  masyarakatEdukasi: 'edukasi/list',
  masyarakatEdukasiDetail: 'edukasi/detail/:id',
  masyarakatBuatLaporan: 'buat-laporan',
  masyarakatLacakLaporan: 'lacak-laporan',
  masyarakatAjukanKunjungan: 'ajukan-kunjungan',

  // --- Path Halaman Error ---
  unauthorized: '/unauthorized',
  notFound: '*',
};

export default paths;
