import avgRevenue from 'assets/sale-info/avg-revenue.png';
import customers from 'assets/sale-info/customers.png';
import sales from 'assets/sale-info/sales.png';
import followers from 'assets/sale-info/followers.png';

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
    image: sales,
    title: 'Insiden Hari Ini',
    sales: 230220,
    increment: 55,
    date: 'May 2022',
  },
  {
    id: 2,
    image: customers,
    title: 'Waktu Tanggapan',
    sales: 3200,
    increment: 12,
    date: 'May 2022',
  },
  {
    id: 3,
    image: followers,
    title: 'Total Pengguna',
    sales: 2300,
    increment: 210,
    date: 'May 2022',
  },
  {
    id: 4,
    image: avgRevenue,
    title: 'Peringatan Cepat',
    sales: 2300,
    increment: 210,
    date: 'May 2022',
  },
];
