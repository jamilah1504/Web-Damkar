import AdminEdukasi from '../pages/admin/Edukasi';

// Definisikan "akar" atau path dasar untuk setiap modul/peran
export const rootPaths = {
  authRoot: 'auth',
  adminRoot: 'admin',
  petugasRoot: 'petugas',
  masyarakatRoot: 'masyarakat',
  rootPaths: '',
};

// Definisikan semua path spesifik yang bersifat RELATIF terhadap root-nya
const paths = {
  // --- Path Publik ---
  landing: '/',

  // --- Path Otentikasi (Relatif terhadap /auth) ---
  login: 'login',
  register: 'register',

  // --- Path Admin (Relatif terhadap /admin) ---
  adminDashboard: 'dashboard',
  adminLaporanMasuk: 'laporan/masuk',
  adminLaporanRiwayat: 'laporan/riwayat',
  adminJadwal: 'jadwal',
  adminPeta: 'peta',
  adminNotifikasi: 'notifikasi',
  adminPengguna: 'pengguna',
  adminPengaturan: 'pengaturan',
  AdminEdukasi: 'edukasi',

  // --- Path Petugas (Relatif terhadap /petugas) ---
  petugasTugasAktif: 'tugas',
  petugasRiwayat: 'riwayat',
  petugasPeta: 'peta',

  // --- Path Masyarakat (Relatif terhadap /masyarakat) ---
  masyarakatDashboard: 'dashboard',
  masyarakatBuatLaporan: 'buat-laporan',
  masyarakatLacakLaporan: 'lacak-laporan',
  masyarakatAjukanKunjungan: 'ajukan-kunjungan',

  // --- Path Halaman Error ---
  unauthorized: '/unauthorized', // Ini path absolut
  notFound: '*',
};

export default paths;
