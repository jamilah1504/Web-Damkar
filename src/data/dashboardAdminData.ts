// File ini berisi semua data dummy untuk halaman dasbor admin.

// Interface untuk Kartu Ringkasan
export interface SummaryCardData {
  id: number;
  title: string;
  value: string;
  change: number;
  period: string;
}

// Interface untuk Tabel Laporan Terbaru
export interface LaporanTerbaruData {
  id: number;
  lokasi: string;
  jenisInsiden: string;
  status: 'Ditangani' | 'Selesai' | 'Verifikasi';
}

// Interface untuk Daftar Petugas Siaga
export interface PetugasSiagaData {
  id: number;
  nama: string;
  pangkat: string;
  avatarInitial: string;
}

// --- EKSPOR DATA ---

export const summaryCardsData: SummaryCardData[] = [
  { id: 1, title: 'Laporan Masuk (Hari Ini)', value: '8', change: 2, period: 'vs kemarin' },
  { id: 2, title: 'Petugas Siaga', value: '12', change: -1, period: 'dari shift lalu' },
  { id: 3, title: 'Waktu Respon Rata-rata', value: '7 Menit', change: -1, period: 'bulan ini' },
  { id: 4, title: 'Total Insiden (Bulan Ini)', value: '54', change: 5, period: 'vs bulan lalu' },
];

export const laporanTerbaruData: LaporanTerbaruData[] = [
  {
    id: 1024,
    lokasi: 'Jl. Pahlawan No. 45, Subang',
    jenisInsiden: 'Kebakaran Rumah',
    status: 'Ditangani',
  },
  {
    id: 1023,
    lokasi: 'Perum Gria Asri Blok C2, Cibogo',
    jenisInsiden: 'Penyelamatan Kucing',
    status: 'Ditangani',
  },
  {
    id: 1022,
    lokasi: 'Taman Kota Bunga, Subang',
    jenisInsiden: 'Pohon Tumbang',
    status: 'Selesai',
  },
  {
    id: 1021,
    lokasi: 'Pabrik Garmen Sejahtera',
    jenisInsiden: 'Kebakaran Gudang',
    status: 'Selesai',
  },
];

export const petugasSiagaData: PetugasSiagaData[] = [
  { id: 1, nama: 'Budi Santoso', pangkat: 'Komandan Regu', avatarInitial: 'B' },
  { id: 2, nama: 'Ahmad Yani', pangkat: 'Anggota Pemadam', avatarInitial: 'A' },
  { id: 3, nama: 'Citra Lestari', pangkat: 'Anggota Pemadam', avatarInitial: 'C' },
  { id: 4, nama: 'Dedi Kurniawan', pangkat: 'Pengemudi', avatarInitial: 'D' },
];
