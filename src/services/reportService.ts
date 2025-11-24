// services/reportService.ts (atau dimanapun file ini berada)
import api from '../api'; // Asumsi instance axios Anda

export interface LaporData {
  namaPelapor: string | null;
  jenisKejadian: string | null;
  detailKejadian: string | null;
  alamatKejadian: string | null;
  latitude: number | null;
  longitude: number | null;
  dokumen?: File[]; // Array of files
}

export const submitLaporan = async (data: LaporData) => {
  // Validasi Geolocation
  if (!data.latitude || !data.longitude) {
    throw new Error('Gagal mendapatkan lokasi terkini. Pastikan GPS aktif.');
  }
  
  // Validasi Data Kritis (Hasil AI)
  // Kita izinkan null jika AI gagal total, tapi sebaiknya di handle di UI
  if (!data.namaPelapor && !data.jenisKejadian) {
      throw new Error('AI gagal mengidentifikasi laporan. Silakan coba lagi dengan suara lebih jelas.');
  }

  const formData = new FormData();
  // Gunakan string kosong atau default jika null agar backend tidak error
  formData.append('namaPelapor', data.namaPelapor || 'Anonim');
  formData.append('jenisKejadian', data.jenisKejadian || 'Lainnya');
  formData.append('detailKejadian', data.detailKejadian || '-');
  formData.append('alamatKejadian', data.alamatKejadian || '-');
  formData.append('latitude', String(data.latitude));
  formData.append('longitude', String(data.longitude));

  // Append Video sebagai bukti dokumen
  if (data.dokumen && data.dokumen.length > 0) {
    data.dokumen.forEach((file) => {
      // Backend harus siap menerima field 'dokumen'
      formData.append('dokumen', file); 
    });
  }

  // Kirim data ke endpoint /reports
  return await api.post('/reports', formData);
};