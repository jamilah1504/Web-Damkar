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
import { currencyFormat } from 'helpers/format-functions';
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
}

const columns: GridColDef<any>[] = [
  {
    field: 'id',
    headerName: 'NO',
  },
  {
    field: 'product',
    headerName: 'Lokasi',
    flex: 1,
    minWidth: 182.9625,
    valueGetter: (params: any) => {
      return params.title + ' ' + params.subtitle;
    },
    renderCell: (params: any) => {
      return (
        <Stack direction="row" spacing={1.5} alignItems="center" component={Link} href="#!">
          <Tooltip title={params.row.product.title} placement="top" arrow>
            <Avatar src={params.row.product.avatar} sx={{ objectFit: 'cover' }} />
          </Tooltip>
          <Stack direction="column" spacing={0.5} justifyContent="space-between">
            <Typography variant="body1" color="text.primary">
              {params.row.product.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row.product.subtitle}
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
    renderCell: (params: any) => (
      <Typography variant="body2" color="text.secondary" noWrap>
        {params.row.orders || '-'}
      </Typography>
    ),
  },
  {
    field: 'price',
    headerName: 'Jarak (KM)',
    flex: 0.75,
    minWidth: 137.221875,
    valueGetter: (params: any) => {
      return currencyFormat(params);
    },
  },
];

const TopSellingProduct = (): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [search, setSearch] = useState('');
  const [rowsData, setRowsData] = useState<LokasiRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        const mapped: LokasiRow[] = (data || []).map((d: any, idx: number) => ({
          id: d.id ?? idx + 1,
          product: {
            avatar: (d.images && d.images[0]) || placeholderImg,
            title: d.namaLokasi || d.nama_lokasi || 'Lokasi',
            subtitle: d.latitude && d.longitude ? `${d.latitude}, ${d.longitude}` : (d.deskripsi || ''),
          },
          orders: d.deskripsi || '-',
          price: 0, // TODO: isi jarak bila ada referensi koordinat pusat
        }));
        setRowsData(mapped);
      } catch (_e) {
        setRowsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLokasi();
  }, []);

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
      apiRef.current.setQuickFilterValues(
        searchValue.split(' ').filter((word: any) => word !== ''),
      );
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
            apiRef.current.autosizeColumns({
              includeOutliers: true,
              expand: true,
            });
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
