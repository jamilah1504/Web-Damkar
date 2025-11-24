import { ReactElement, useMemo, useRef, useState, useEffect } from 'react';
import { Box, Button, Divider, Stack, Typography, useTheme, CircularProgress } from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { PieDataItemOption } from 'echarts/types/src/chart/pie/PieSeries.js';
import WebsiteVisitorsChart from './WebsiteVisitorsChart';
import api from '../../../../../../api';

interface KejadianData {
  total: number;
  kebakaran: number;
  nonKebakaran: number;
}

const WebsiteVisitors = (): ReactElement => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kejadianData, setKejadianData] = useState<KejadianData>({ total: 0, kebakaran: 0, nonKebakaran: 0 });
  const chartRef = useRef<EChartsReactCore | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mengambil data dari tabel insiden
        const response = await api.get('/insiden');
        
        // Menghitung jumlah kejadian kebakaran dan non-kebakaran
        const kebakaran = response.data.filter((insiden: any) => 
          insiden.jenisKejadian && insiden.jenisKejadian.toLowerCase().includes('kebakaran')
        ).length;
        
        const nonKebakaran = response.data.length - kebakaran;
        
        setKejadianData({
          total: response.data.length,
          kebakaran,
          nonKebakaran
        });
        
      } catch (err) {
        console.error('Gagal mengambil data kejadian:', err);
        setError('Gagal memuat data kejadian');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const seriesData: PieDataItemOption[] = [
    { value: kejadianData.kebakaran, name: 'Kebakaran' },
    { value: kejadianData.nonKebakaran, name: 'Non Kebakaran' },
  ];

  const legendData = [
    { name: 'Kebakaran', icon: 'circle' },
    { name: 'Non Kebakaran', icon: 'circle' },
  ];

  const pieChartColors = [
    theme.palette.error.main, // Warna merah untuk Kebakaran
    theme.palette.primary.main, // Warna biru untuk Non Kebakaran
  ];
  const onChartLegendSelectChanged = (name: string) => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      instance.dispatchAction({
        type: 'legendToggleSelect',
        name: name,
      });
    }
  };
  const [visitorType, setVisitorType] = useState<any>({
    Kebakaran: false,
    'Non Kebakaran': false,
  });

  const toggleClicked = (name: string) => {
    setVisitorType((prevState: any) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };
  const totalVisitors = useMemo(
    () => kejadianData.total,
    [kejadianData.total],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        minHeight: 460,
        height: 1,
        boxShadow: theme.shadows[4],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle1" color="text.primary" p={2.5}>
        Kejadian Mingguan
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }}>
        <Stack direction="row" justifyContent="center" flex={'1 1 0%'}>
          <WebsiteVisitorsChart
            chartRef={chartRef}
            seriesData={seriesData}
            colors={pieChartColors}
            legendData={legendData}
            sx={{
              width: 222,
              maxHeight: 222,
              mx: 'auto',
            }}
          />
        </Stack>
        <Stack
          spacing={1}
          divider={<Divider />}
          sx={{ px: 2.5, py: 2.5 }}
          justifyContent="center"
          alignItems="stretch"
          flex={'1 1 0%'}
        >
          {Array.isArray(seriesData) &&
            seriesData.map((dataItem, index) => (
              <Button
                key={dataItem.name}
                variant="text"
                fullWidth
                onClick={() => {
                  toggleClicked(dataItem.name as string);
                  onChartLegendSelectChanged(dataItem.name as string);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  p: 0,
                  borderRadius: 1,
                  opacity: visitorType[`${dataItem.name}`] ? 0.5 : 1,
                }}
                disableRipple
              >
                <Stack direction="row" alignItems="center" gap={1} width={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: visitorType[`${dataItem.name}`]
                        ? 'action.disabled'
                        : pieChartColors[index],
                      borderRadius: 400,
                    }}
                  ></Box>
                  <Typography variant="body1" color="text.secondary" flex={1} textAlign={'left'}>
                    {dataItem.name}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {((parseInt(`${dataItem.value}`) / totalVisitors) * 100).toFixed(0)}%
                  </Typography>
                </Stack>
              </Button>
            ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default WebsiteVisitors;
