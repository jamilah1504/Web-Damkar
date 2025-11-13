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
} from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';
import axios from 'axios';
import authService from '../../services/authServices';
import paths, { rootPaths } from '../../routes/paths';

// Impor logo Anda di sini, misalnya:
import Logo from '../../assets/logo/image.png';

const Login = (): ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const nodeBackendUrl = 'http://localhost:5000/api/auth/verify-token';

  // ... (handleGoogleLogin dan handleSubmit tetap sama)
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const response = await axios.post(nodeBackendUrl, { idToken });

      if (response.status === 200) {
        console.log('Backend berhasil memproses login:', response.data);
        const userData = response.data.user;
        const customToken = response.data.myCustomToken;

        if (userData && userData.role) {
          const role = (userData.role || 'masyarakat')
            .replace(/\s/g, '')
            .toLowerCase();
          console.log('Role yang diproses (dari backend):', `[${role}]`);

          localStorage.setItem('role', role);
          if (customToken) {
            localStorage.setItem('token', customToken);
          }
          localStorage.setItem('user', JSON.stringify(userData));

          switch (role) {
            case 'admin':
              navigate(`/${rootPaths.adminRoot}/${paths.adminDashboard}`);
              break;
            case 'masyarakat':
              navigate(
                `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`,
              );
              break;
            case 'petugas':
              navigate(`/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`);
              break;
            default:
              console.warn(
                `Peran tidak dikenali: ${userData.role}, mengarahkan ke landing.`,
              );
              navigate(paths.landing);
          }
        } else {
          console.error('Data pengguna atau peran tidak diterima dari backend.');
          localStorage.setItem('role', 'masyarakat');
          navigate(
            `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`,
          );
        }
      }
    } catch (error) {
      console.error(
        'Error saat alur login Google:',
        error.response ? error.response.data : error.message,
      );
      setError('Login dengan Google gagal. Silakan coba lagi.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const userData = await authService.login({ email, password });
      console.log('Data pengguna setelah login:', userData);

      if (userData && userData.role) {
        const role = (userData.role || 'masyarakat')
          .replace(/\s/g, '')
          .toLowerCase();
        console.log('Role yang diproses (REGEX clean):', `[${role}]`);

        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        localStorage.setItem('role', role);
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }

        switch (role) {
          case 'admin':
            navigate(`/${rootPaths.adminRoot}/${paths.adminDashboard}`);
            break;
          case 'masyarakat':
            navigate(
              `/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`,
            );
            break;
          case 'petugas':
            navigate(`/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`);
            break;
          default:
            console.warn(`Peran tidak dikenali: ${userData.role}`);
            navigate(paths.landing);
        }
      } else {
        setError('Gagal mendapatkan data pengguna setelah login.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Login gagal. Periksa kembali email dan password Anda.',
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '50vh',
        minWidth: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // PERBAIKAN 1: Mengubah padding menjadi responsif
        padding: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: { xs: 4, md: 8 },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Kolom Kanan: Logo & Identitas */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 180,
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={Logo}
              style={{
                width: '100%',
                height: 'auto',
              }}
              alt=""
            />
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#333',
                mb: 0.5,
              }}
            >
              Pemadam Kebakaran
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#555',
              }}
            >
              Kabupaten Subang
            </Typography>
          </Box>
        </Box>

        {/* Kolom Kiri: Form Login */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            width: '100%',
          }}
        >
          {/* PERBAIKAN 2 & 3: Pindahkan sx ke InputProps dan tambahkan boxSizing */}
          <TextField
            fullWidth
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              mb: 2, // Margin tetap di sx utama

            }}
            InputProps={{
              sx: {
                backgroundColor: '#F0F0F0',
                borderRadius: '6px', // Target langsung
                boxSizing: 'border-box', // Menjamin konsistensi lebar
                '& fieldset': {
                  borderColor: '#C0C0C0',
                },
                '&:hover fieldset': {
                  borderColor: '#A0A0A0',
                },
              },
            }}
          />

          {/* PERBAIKAN 2 & 3: Pindahkan sx ke InputProps dan tambahkan boxSizing */}
          <TextField
            fullWidth
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 3, // Margin tetap di sx utama
            }}
            InputProps={{
              sx: {
                backgroundColor: '#F0F0F0',
                borderRadius: '6px', // Target langsung
                boxSizing: 'border-box', // Menjamin konsistensi lebar
                '& fieldset': {
                  borderColor: '#C0C0C0',
                },
                '&:hover fieldset': {
                  borderColor: '#A0A0A0',
                },
              },
            }}
          />

          {/* PERBAIKAN 3: Tambahkan boxSizing */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              backgroundColor: '#C83C3C',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '6px',
              textTransform: 'none',
              py: 1.2,
              boxSizing: 'border-box', // Menjamin konsistensi lebar
              '&:hover': {
                backgroundColor: '#B02A2A',
              },
            }}
          >
            Login
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Separator "Atau" */}
          <Divider sx={{ my: 2, color: '#BDBDBD' }}>
            <Typography variant="body2" sx={{ color: '#A0A0A0', px: 1 }}>
              Atau
            </Typography>
          </Divider>

          {/* PERBAIKAN 3: Tambahkan boxSizing */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={{
              mb: 2,
              backgroundColor: 'white',
              color: '#3C4043',
              borderColor: '#DADCE0',
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 500,
              py: 1.2,
              display: 'flex',
              gap: 1.5,
              boxSizing: 'border-box', // Menjamin konsistensi lebar
              '&:hover': {
                backgroundColor: '#F8F9FA',
                borderColor: '#DADCE0',
              },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Masuk dengan Google
          </Button>

          {/* Link Register */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#333',
            }}
          >
            Tidak punya akun?{' '}
            <MuiLink
              href={`/${rootPaths.authRoot}/register`}
              sx={{
                fontWeight: 'bold',
                color: '#333',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Register
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;