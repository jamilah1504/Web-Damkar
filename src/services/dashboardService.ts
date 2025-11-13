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
  try {
    const userRaw = localStorage.getItem('user');
    let token;
    
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        token = user?.token;
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }

    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await api.get('/dashboard/stats', { headers });
    
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to fetch dashboard stats');
    }
    
    return res.data as DashboardStatsResponse;
  } catch (error: any) {
    console.error('Dashboard service error:', error);
    if (error.response) {
      // Server responded with error status
      throw {
        ...error,
        message: error.response.data?.message || error.message,
      };
    } else if (error.request) {
      // Request made but no response
      throw {
        ...error,
        message: 'Tidak dapat terhubung ke server',
      };
    } else {
      // Something else happened
      throw error;
    }
  }
}

export interface LaporanVisualizationResponse {
  success: boolean;
  data: {
    labels: string[];
    laporan: number[];
    insiden: number[];
    period: string;
  };
}

export async function getLaporanVisualization(period: 'daily' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<LaporanVisualizationResponse> {
  try {
    const userRaw = localStorage.getItem('user');
    let token;
    
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        token = user?.token;
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }

    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await api.get(`/dashboard/visualization?period=${period}`, { headers });
    
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.message || 'Failed to fetch visualization data');
    }
    
    return res.data as LaporanVisualizationResponse;
  } catch (error: any) {
    console.error('Visualization service error:', error);
    if (error.response) {
      throw {
        ...error,
        message: error.response.data?.message || error.message,
      };
    } else if (error.request) {
      throw {
        ...error,
        message: 'Tidak dapat terhubung ke server',
      };
    } else {
      throw error;
    }
  }
}


