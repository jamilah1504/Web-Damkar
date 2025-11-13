// SignUp.tsx
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import authService from '../../services/authServices';
import paths, { rootPaths } from '../../routes/paths';
import logo from '../../assets/logo/image.png';

const SignUp = (): ReactElement => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      await authService.register({ name, email, password });
      navigate(`/${rootPaths.authRoot}/${paths.login}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.',
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
        backgroundColor: '#fff',
        // Mengurangi padding di layar HP agar tidak ada gap
        padding: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          // PERBAIKAN 1: Mengubah urutan flex
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: { xs: 4, md: 8 },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* PERBAIKAN 1: Kolom Logo & Identitas dipindah ke atas */}
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
          <Box
            component="img"
            src={logo}
            alt="Logo Yudha Brama Jaya"
            sx={{
              width: 180,
              height: 180,
            }}
          />
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

        {/* Kolom Kiri: Form Registrasi */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* PERBAIKAN 2: Styling dipindah ke InputProps */}
          <TextField
            fullWidth
            placeholder="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{
              mb: 1.5,
            }}
            InputProps={{
              sx: {
                backgroundColor: '#EEEEEE',
                borderRadius: '6px', // Konsisten
                boxSizing: 'border-box',
                '& fieldset': {
                  borderColor: '#C0C0C0',
                },
                '&:hover fieldset': {
                  borderColor: '#A0A0A0',
                },
              },
            }}
          />

          {/* PERBAIKAN 2: Styling dipindah ke InputProps */}
          <TextField
            fullWidth
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              mb: 1.5,
            }}
            InputProps={{
              sx: {
                backgroundColor: '#EEEEEE',
                borderRadius: '6px', // Konsisten
                boxSizing: 'border-box',
                '& fieldset': {
                  borderColor: '#C0C0C0',
                },
                '&:hover fieldset': {
                  borderColor: '#A0A0A0',
                },
              },
            }}
          />

          {/* PERBAIKAN 2: Styling dipindah ke InputProps */}
          <TextField
            fullWidth
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 3,
            }}
            InputProps={{
              sx: {
                backgroundColor: '#EEEEEE',
                borderRadius: '6px', // Konsisten
                boxSizing: 'border-box',
                '& fieldset': {
                  borderColor: '#C0C0C0',
                },
                '&:hover fieldset': {
                  borderColor: '#A0A0A0',
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              backgroundColor: '#C83C3C',
              color: 'white',
              fontWeight: 'bold',
              // PERBAIKAN 2: Mengubah borderRadius menjadi 6px
              borderRadius: '6px',
              boxSizing: 'border-box',
              textTransform: 'none',
              py: 1.2,
              '&:hover': {
                backgroundColor: '#B02A2A',
              },
            }}
          >
            Simpan
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Link Login */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#333',
            }}
          >
            Sudah punya akun?{' '}
            <MuiLink
              href={`/${rootPaths.authRoot}/${paths.login}`}
              sx={{
                fontWeight: 'bold',
                color: '#333',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Login
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;