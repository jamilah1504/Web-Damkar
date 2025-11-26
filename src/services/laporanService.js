import axios from 'axios';
import { formatMonth, formatDay } from '../utils/dateFormat';

const API_URL = 'http://localhost:5000'; // ubah sesuai server kamu

export async function fetchLaporanBulanan(date, token) {
  const month = formatMonth(date); // contoh: 2025-11

  return await axios.get(`${API_URL}/preview?type=bulanan&month=${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchLaporanHarian(date, token) {
  const day = formatDay(date); // contoh: 2025-11-26

  return await axios.get(`${API_URL}/preview?type=harian&date=${day}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchRiwayat(token) {
  return await axios.get(`${API_URL}/laporan-periodik`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
