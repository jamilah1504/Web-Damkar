// Login.tsx
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Link as MuiLink,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { auth } from '../../services/firebase';
import axios from 'axios';
import authService from '../../services/authServices';
import paths, { rootPaths } from '../../routes/paths';
import Logo from '../../assets/logo/image.png';

const Login = (): ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const nodeBackendUrl = 'http://localhost:5000/api/auth/verify-token';

  // Handler tetap sama (hanya ditambahkan loading state)
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post(nodeBackendUrl, { idToken });

      if (response.status === 200) {
        const { user, myCustomToken } = response.data;
        const role = (user.role || 'masyarakat').replace(/\s/g, '').toLowerCase();

        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(user));
        if (myCustomToken) localStorage.setItem('token', myCustomToken);

        const routes: Record<string, string> = {
          admin: `/${rootPaths.adminRoot}/${paths.adminDashboard}`,
          masyarakat: `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`,
          petugas: `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`,
        };

        navigate(routes[role] || paths.landing);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login dengan Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await authService.login({ email, password });
      const role = (userData.role || 'masyarakat').replace(/\s/g, '').toLowerCase();

      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('token', userData.token);

      const routes: Record<string, string> = {
        admin: `/${rootPaths.adminRoot}/${paths.adminDashboard}`,
        masyarakat: `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`,
        petugas: `/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`,
      };

      navigate(routes[role] || paths.landing);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: ' #FFFFFFFF ',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4 },
      }}
    >
      {/* Card utama dengan glassmorphism */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 960,
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Bagian Kiri - Branding */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'rgba(200, 60, 60, 0.9)',
            color: 'white',
            p: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3,
          }}
        >
          <Box sx={{ width: 160, height: 160 }}>
            <img
              src={Logo}
              alt="Logo Damkar Subang"
              style={{ width: '100%', height: 'auto', borderRadius: 12 }}
            />
          </Box>

          <Typography variant="h4" fontWeight={700} letterSpacing={1}>
            DAMKAR SUBANG
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
            Dinas Pemadam Kebakaran
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 300 }}>
            Sistem Informasi Pengaduan dan Penugasan Kebakaran Kabupaten Subang
          </Typography>
        </Box>

        {/* Bagian Kanan - Form Login */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'white',
            p: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={700} color="#2d3748" mb={1}>
            Selamat Datang Kembali
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Masuk untuk melanjutkan ke dashboard Anda
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: '#f7fafc',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: 2, backgroundColor: '#f7fafc' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.8,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(90deg, #C83C3C 0%, #E04F4F 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #B02A2A 0%, #C83C3C 100%)',
                },
                '&:disabled': {
                  background: '#cbd5e0',
                },
              }}
              variant="contained"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary">
              atau
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.93c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.46 3.28 15.02 2 12 2 7.7 2 3.99 4.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              py: 1.6,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: '#dadce0',
              color: '#3c4043',
              '&:hover': {
                bgcolor: '#f8f9fa',
                borderColor: '#dadce0',
              },
            }}
          >
            Lanjutkan dengan Google
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 4, color: '#718096' }}>
            Belum punya akun?{' '}
            <MuiLink
              href={`/${rootPaths.authRoot}/register`}
              sx={{
                fontWeight: 600,
                color: '#C83C3C',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Daftar di sini
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
