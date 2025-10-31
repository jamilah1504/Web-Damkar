import Grid from '@mui/material/Unstable_Grid2';
import { Stack } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';

import TopSellingProduct from 'components/sections/dashboard/Home/Sales/TopSellingProduct/TopSellingProduct';
import WebsiteVisitors from 'components/sections/dashboard/Home/Sales/WebsiteVisitors/WebsiteVisitors';
import SaleInfoCards from 'components/sections/dashboard/Home/Sales/SaleInfoSection/SaleInfoCards';
import BuyersProfile from 'components/sections/dashboard/Home/Sales/BuyersProfile/BuyersProfile';
import NewCustomers from 'components/sections/dashboard/Home/Sales/NewCustomers/NewCustomers';
import Revenue from 'components/sections/dashboard/Home/Sales/Revenue/Revenue';

import { drawerWidth } from 'layouts/main-layout';
import { getDashboardStats } from 'services/dashboardService';
import usersPng from 'assets/sale-info/profile.png';
import insidenPng from 'assets/sale-info/insiden.png';
import waktuTanggapPng from 'assets/sale-info/waktu.png';
import peringatanCepatPng from 'assets/sale-info/warning.png';

const Sales = (): ReactElement => {
  const [cardsData, setCardsData] = useState<any[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboardStats();
        const { users, laporan, insiden, lokasiRawan } = res.data.totalCounts;
        const date = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        setCardsData([
          { id: 1, image: insidenPng as any, title: 'Insiden Hari Ini', sales: insiden, increment: 0, date },
          { id: 2, image: waktuTanggapPng as any, title: 'Waktu Tanggap', sales: laporan, increment: 0, date },
          { id: 3, image: usersPng as any, title: 'Total Pengguna', sales: users, increment: 0, date },
          { id: 4, image: peringatanCepatPng as any, title: 'Peringatan Cepat', sales: lokasiRawan, increment: 0, date },
        ]);
      } catch (e) {
        const date = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const msg = 'Gagal mengambil data';
        setCardsData([
          { id: 1, image: insidenPng as any, title: 'Insiden Hari Ini', sales: msg, increment: 0, date },
          { id: 2, image: waktuTanggapPng as any, title: 'Waktu Tanggap', sales: msg, increment: 0, date },
          { id: 3, image: usersPng as any, title: 'Total Pengguna', sales: msg, increment: 0, date },
          { id: 4, image: peringatanCepatPng as any, title: 'Peringatan Cepat', sales: msg, increment: 0, date },
        ]);
      }
    })();
  }, []);
  return (
    <Grid
      container
      component="main"
      columns={12}
      spacing={3.75}
      flexGrow={1}
      pt={4.375}
      pr={1.875}
      pb={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        pl: { xs: 3.75, lg: 0 },
      }}
    >
      {!!cardsData && (
        <Grid xs={12}>
          <SaleInfoCards data={cardsData} />
        </Grid>
      )}
      <Grid xs={12} md={8}>
        <Revenue />
      </Grid>
      <Grid xs={12} md={4}>
        <WebsiteVisitors />
      </Grid>
      <Grid xs={12} lg={8}>
        <TopSellingProduct />
      </Grid>
      <Grid xs={12} lg={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column' }}
          gap={3.75}
          height={1}
          width={1}
        >
          <NewCustomers />
          <BuyersProfile />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Sales;
