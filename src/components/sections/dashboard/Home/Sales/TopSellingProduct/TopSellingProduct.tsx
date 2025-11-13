import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Divider,
  InputAdornment,
  LinearProgress,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
  debounce,
} from '@mui/material';
import { DataGrid, GridApi, GridColDef, GridSlots, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
// Hapus data dummy dan gunakan data dari API lokasi-rawan
// import { DataRow, rows } from 'data/products';
import CustomPagination from './CustomPagination';
import placeholderImg from 'assets/top-selling-products/relaxingChair.jpg';

// Tipe baris yang dipakai dalam tabel ini (disederhanakan untuk data lokasi)
interface LokasiRow {
  id: number;
  product: {
    avatar: string;
    title: string;
    subtitle: string;
  };
  orders: string; // gunakan untuk deskripsi
  price: number; // gunakan untuk jarak (km) bila tersedia
  latitude?: number;
  longitude?: number;
}

// Fungsi untuk menghitung jarak antara dua koordinat menggunakan formula Haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const columns: GridColDef<any>[] = [
  {
    field: 'no',
    headerName: 'NO',
    width: 80,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    renderCell: (params: any) => {
      if (!params || !params.row || !params.api) {
        return (
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
            -
          </Typography>
        );
      }
      // Hitung nomor urut berdasarkan pagination
      const apiRef = params.api;
      const paginationModel = apiRef.state?.pagination?.paginationModel;
      const page = paginationModel?.page || 0;
      const pageSize = paginationModel?.pageSize || 5;
      
      // Dapatkan semua baris yang terlihat (setelah sorting/filtering)
      const allRows = apiRef.getSortedRows();
      const rowIndex = allRows.findIndex((row: any) => row.id === params.row.id);
      
      // Hitung nomor urut: (halaman saat ini * jumlah item per halaman) + index + 1
      // Pastikan rowIndex valid (>= 0)
      const no = rowIndex >= 0 ? page * pageSize + rowIndex + 1 : params.row.id;
      
      return (
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
          {no}
        </Typography>
      );
    },
  },
  {
    field: 'product',
    headerName: 'Lokasi',
    flex: 1,
    minWidth: 182.9625,
    valueGetter: (params: any) => {
      if (!params || !params.row || !params.row.product) {
        return '';
      }
      const title = params.row.product.title || '';
      const subtitle = params.row.product.subtitle || '';
      return `${title} ${subtitle}`.trim();
    },
    renderCell: (params: any) => {
      if (!params || !params.row || !params.row.product) {
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      }
      return (
        <Stack direction="row" spacing={1.5} alignItems="center" component={Link} href="#!">
          <Tooltip title={params.row.product.title || '-'} placement="top" arrow>
            <Avatar src={params.row.product.avatar || placeholderImg} sx={{ objectFit: 'cover' }} />
          </Tooltip>
          <Stack direction="column" spacing={0.5} justifyContent="space-between">
            <Typography variant="body1" color="text.primary">
              {params.row.product.title || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row.product.subtitle || '-'}
            </Typography>
          </Stack>
        </Stack>
      );
    },
    sortComparator: (v1: string, v2: string) => v1.localeCompare(v2),
  },
  {
    field: 'orders',
    headerName: 'Deskripsi',
    flex: 1,
    minWidth: 180,
    renderCell: (params: any) => {
      if (!params || !params.row) {
        return (
          <Typography variant="body2" color="text.secondary" noWrap>
            -
          </Typography>
        );
      }
      return (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.row.orders || '-'}
        </Typography>
      );
    },
  },
  {
    field: 'price',
    headerName: 'Jarak (KM)',
    flex: 0.75,
    minWidth: 137.221875,
    renderCell: (params: any) => {
      if (!params || !params.row) {
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      }
      const distance = params.row.price || 0;
      if (distance === 0) {
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      }
      return (
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
          {distance.toFixed(2)} km
        </Typography>
      );
    },
    valueGetter: (params: any) => {
      if (!params || !params.row) {
        return 0;
      }
      return params.row.price || 0;
    },
  },
];

const TopSellingProduct = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [rowsData, setRowsData] = useState<LokasiRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Ambil lokasi saat ini menggunakan geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Tidak dapat mendapatkan lokasi saat ini:', error.message);
          // Fallback ke koordinat default (contoh: Jakarta)
          setCurrentLocation({
            lat: -6.2088,
            lon: 106.8456,
          });
        }
      );
    } else {
      console.warn('Geolocation tidak didukung oleh browser');
      // Fallback ke koordinat default
      setCurrentLocation({
        lat: -6.2088,
        lon: 106.8456,
      });
    }
  }, []);

  // Ambil data dari endpoint yang sama dengan halaman Analisis & Peta
  useEffect(() => {
    const fetchLokasi = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setRowsData([]);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/lokasi-rawan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Gagal memuat data');
        const data = await res.json();
        
        // Hitung jarak jika lokasi saat ini sudah tersedia
        const mapped: LokasiRow[] = (data || []).map((d: any, idx: number) => {
          let distance = 0;
          const lat = d.latitude || d.lat || null;
          const lon = d.longitude || d.lng || d.lon || null;
          
          if (currentLocation && lat && lon) {
            try {
              distance = calculateDistance(
                currentLocation.lat,
                currentLocation.lon,
                lat,
                lon
              );
            } catch (error) {
              console.warn('Error calculating distance:', error);
              distance = 0;
            }
          }
          
          return {
            id: d.id ?? idx + 1,
            product: {
              avatar: (d.images && Array.isArray(d.images) && d.images[0]) || placeholderImg,
              title: d.namaLokasi || d.nama_lokasi || 'Lokasi',
              subtitle: lat && lon ? `${lat}, ${lon}` : (d.deskripsi || ''),
            },
            orders: d.deskripsi || '-',
            price: distance || 0,
            latitude: lat,
            longitude: lon,
          };
        });
        setRowsData(mapped);
      } catch (_e) {
        setRowsData([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Hanya fetch jika lokasi saat ini sudah tersedia atau sudah timeout
    if (currentLocation !== null) {
      fetchLokasi();
    }
  }, [currentLocation]);

  const visibleColumns = useMemo(
    () =>
      columns
        .map((column) => {
          if (column.field === 'refunds') {
            return {
              ...column,
              getApplyQuickFilterFn: undefined,
              filterable: false,
            };
          }
          return column;
        }),
    [columns],
  );

  const handleGridSearch = useMemo(() => {
    return debounce((searchValue) => {
      if (apiRef.current) {
        apiRef.current.setQuickFilterValues(
          searchValue.split(' ').filter((word: any) => word !== ''),
        );
      }
    }, 250);
  }, [apiRef]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.currentTarget.value;
    setSearch(searchValue);
    handleGridSearch(searchValue);
  };

  return (
    <Stack
      bgcolor="background.paper"
      borderRadius={5}
      width={1}
      boxShadow={(theme) => theme.shadows[4]}
      height={1}
    >
      <Stack
        direction={{ sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        padding={3.75}
        gap={3.75}
      >
        <Typography variant="h5" color="text.primary">
          Tabel Lokasi Rawan
        </Typography>
        <TextField
          variant="filled"
          placeholder="Search..."
          id="search-input"
          name="table-search-input"
          onChange={handleChange}
          value={search}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                <IconifyIcon icon="mdi:search" width={1} height={1} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Divider />
      <Stack height={1}>
        <DataGrid
          apiRef={apiRef}
          columns={visibleColumns}
          rows={rowsData}
          getRowHeight={() => 70}
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnSelector
          disableRowSelectionOnClick
          rowSelection={false}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          pageSizeOptions={[5]}
          loading={loading}
          onResize={() => {
            if (apiRef.current) {
              apiRef.current.autosizeColumns({
                includeOutliers: true,
                expand: true,
              });
            }
          }}
          slots={{
            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
            pagination: CustomPagination,
            noRowsOverlay: () => <section>No rows available</section>,
          }}
          sx={{
            height: 1,
            width: 1,
          }}
        />
      </Stack>
    </Stack>
  );
};

export default TopSellingProduct;
