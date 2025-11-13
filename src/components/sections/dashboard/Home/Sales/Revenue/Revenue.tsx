import { ReactElement, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, Typography, useTheme, CircularProgress } from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import RevenueChart from './RevenueChart';
import { LineSeriesOption } from 'echarts';
import { getLaporanVisualization } from 'services/dashboardService';

const Revenue = (): ReactElement => {
  const theme = useTheme();
  const chartRef = useRef<EChartsReactCore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<{
    labels: string[];
    laporan: number[];
    insiden: number[];
  }>({
    labels: [],
    laporan: [],
    insiden: [],
  });
  const [currentPeriod, setCurrentPeriod] = useState<'daily' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const lineChartColors = [
    theme.palette.secondary.main,
    theme.palette.primary.main,
  ];

  const legendData = [
    { name: 'Laporan', icon: 'circle' },
    { name: 'Insiden', icon: 'circle' },
  ];

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getLaporanVisualization(currentPeriod);
        if (response.success && response.data) {
          setChartData({
            labels: response.data.labels,
            laporan: response.data.laporan,
            insiden: response.data.insiden,
          });
        }
      } catch (error) {
        console.error('Error fetching visualization data:', error);
        // Set default empty data jika error
        setChartData({
          labels: [],
          laporan: [],
          insiden: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPeriod]);

  const seriesData: LineSeriesOption[] = [
    {
      id: 1,
      data: chartData.laporan,
      type: 'line',
      smooth: true,
      color: lineChartColors[0],
      name: 'Laporan',
      legendHoverLink: true,
      showSymbol: true,
      symbolSize: 8,
      lineStyle: {
        width: 3,
      },
    },
    {
      id: 2,
      data: chartData.insiden,
      type: 'line',
      smooth: true,
      color: lineChartColors[1],
      name: 'Insiden',
      legendHoverLink: true,
      showSymbol: true,
      symbolSize: 8,
      lineStyle: {
        width: 3,
      },
    },
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

  const [revenueAdType, setRevenueAdType] = useState<any>({
    'Laporan': false,
    'Insiden': false,
  });

  const toggleClicked = (name: string) => {
    setRevenueAdType((prevState: any) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handlePeriodChange = (period: 'daily' | 'monthly' | 'quarterly' | 'yearly') => {
    setCurrentPeriod(period);
  };

  return (
    <Stack
      bgcolor="common.white"
      borderRadius={5}
      minHeight={460}
      height={1}
      mx="auto"
      boxShadow={theme.shadows[4]}
    >
      <Stack
        direction={{ sm: 'row' }}
        justifyContent={{ sm: 'space-between' }}
        alignItems={{ sm: 'center' }}
        gap={2}
        padding={3.75}
      >
        <Typography variant="h5" color="text.primary">
          Visualisasi Laporan Kebakaran
        </Typography>
        <Stack direction="row" gap={2} flexWrap="wrap">
          {/* Tombol periode */}
          <Stack direction="row" gap={1}>
            <Button
              variant={currentPeriod === 'daily' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePeriodChange('daily')}
            >
              Harian
            </Button>
            <Button
              variant={currentPeriod === 'monthly' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePeriodChange('monthly')}
            >
              Bulanan
            </Button>
            <Button
              variant={currentPeriod === 'quarterly' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePeriodChange('quarterly')}
            >
              Triwulan
            </Button>
            <Button
              variant={currentPeriod === 'yearly' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePeriodChange('yearly')}
            >
              Tahunan
            </Button>
          </Stack>
          {/* Legend untuk series */}
          <Stack direction="row" gap={2}>
            {Array.isArray(seriesData) &&
              seriesData.map((dataItem, index) => (
                <Button
                  key={dataItem.id}
                  variant="text"
                  onClick={() => {
                    toggleClicked(dataItem.name as string);
                    onChartLegendSelectChanged(dataItem.name as string);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    borderRadius: 1,
                    opacity: revenueAdType[`${dataItem.name}`] ? 0.5 : 1,
                  }}
                  disableRipple
                >
                  <Stack direction="row" alignItems="center" gap={1} width={1}>
                    <Box
                      sx={{
                        width: 13,
                        height: 13,
                        bgcolor: revenueAdType[`${dataItem.name}`]
                          ? 'action.disabled'
                          : lineChartColors[index],
                        borderRadius: 400,
                      }}
                    ></Box>
                    <Typography variant="body2" color="text.secondary" flex={1} textAlign={'left'}>
                      {dataItem.name}
                    </Typography>
                  </Stack>
                </Button>
              ))}
          </Stack>
        </Stack>
      </Stack>
      <Box flex={1} sx={{ position: 'relative' }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <RevenueChart
            chartRef={chartRef}
            sx={{ minHeight: 1 }}
            seriesData={seriesData}
            legendData={legendData}
            colors={lineChartColors}
            labels={chartData.labels}
          />
        )}
      </Box>
    </Stack>
  );
};

export default Revenue;
