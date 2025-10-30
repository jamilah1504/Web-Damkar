import warning from 'assets/sale-info/warning.png';
import waktu from 'assets/sale-info/waktu.png';
import insiden from 'assets/sale-info/insiden.png';
import profile from 'assets/sale-info/profile.png';

interface SaleInfoData {
  id: number;
  image: string;
  title: string;
  sales: number;
  increment: number;
  date: string;
}

export const saleInfoData: SaleInfoData[] = [
  {
    id: 1,
    image: insiden,
    title: 'Insiden Hari Ini',
    sales: 230220,
    increment: 55,
    date: 'May 2022',
  },
  {
    id: 2,
    image: waktu,
    title: 'Waktu Tanggapan',
    sales: 3200,
    increment: 12,
    date: 'May 2022',
  },
  {
    id: 3,
    image: profile,
    title: 'Total Pengguna',
    sales: 2300,
    increment: 10,
    date: 'May 2022',
  },
  {
    id: 4,
    image: warning,
    title: 'Peringatan Cepat',
    sales: 2300,
    increment: 5,
    date: 'May 2022',
  },
];
