import api from '../api';

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    totalCounts: {
      users: number;
      laporan: number;
      insiden: number;
      lokasiRawan: number;
    };
    distributions: Record<string, any>;
    recent: Record<string, any>;
  };
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const userRaw = localStorage.getItem('user');
  const token = userRaw ? JSON.parse(userRaw)?.token : undefined;

  const res = await api.get('/dashboard/stats', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data as DashboardStatsResponse;
}


