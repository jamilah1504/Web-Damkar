// SignUp.tsx
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography, Divider, Link as MuiLink } from '@mui/material';
import authService from '../../services/authServices';
import paths, { rootPaths } from '../../routes/paths';
import logo from '../../assets/logo/image.png';

const SignUp = (): ReactElement => {
  // --- Logika State (TETAP SAMA) ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Opsional: ditambahkan untuk feedback UI
  const navigate = useNavigate();

  // --- Logika Handler (TETAP SAMA) ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({ name, email, password });
      navigate(`/${rootPaths.authRoot}/${paths.login}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
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
      {/* Card utama dengan glassmorphism (SAMA SEPERTI LOGIN) */}
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
        {/* Bagian Kiri - Branding (SAMA SEPERTI LOGIN) */}
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
              src={logo}
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

        {/* Bagian Kanan - Form SignUp (STYLE DISAMAKAN) */}
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
            Buat Akun Baru
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Daftar untuk mengakses layanan kami
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nama Lengkap" // Label disesuaikan agar lebih informatif daripada placeholder
              placeholder="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: '#f7fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: '#f7fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: '#f7fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
                  },
                },
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
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Sudah memiliki akun?
            </Typography>
          </Divider>

          <Typography variant="body2" align="center" sx={{ color: '#718096' }}>
            Silakan login{' '}
            <MuiLink
              href={`/${rootPaths.authRoot}/${paths.login}`}
              sx={{
                fontWeight: 600,
                color: '#C83C3C',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              di sini
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
