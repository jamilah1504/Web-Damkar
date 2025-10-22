import { ReactElement, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook untuk navigasi
import {
  Alert, // Untuk menampilkan pesan error dengan lebih baik
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import signupBanner from 'assets/authentication-banners/signup.png';
import IconifyIcon from 'components/base/IconifyIcon';
import firesponseLogo from 'assets/logo/fireresponse-logo.png';
import Image from 'components/base/Image';
import authService from '../../services/authServices'; // 2. Import authService (sesuaikan pathnya)

const SignUp = (): ReactElement => {
  // 3. Tambahkan state untuk semua input, error, dan navigasi
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  // 4. Buat fungsi handleSubmit untuk menangani logika registrasi
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(''); // Reset pesan error

    try {
      await authService.register({ name, email, password });
      // Jika registrasi berhasil, arahkan ke halaman login atau dashboard
      navigate('/auth/login'); // Anda bisa juga arahkan ke '/dashboard'
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <Stack
      direction="row"
      bgcolor="background.paper"
      boxShadow={(theme) => theme.shadows[3]}
      height={591}
      width={{ md: 960 }}
    >
      <Stack width={{ md: 0.5 }} m={2.5} gap={8}>
        <Link href="/" width="fit-content">
          <Image src={firesponseLogo} width={152.6} />
        </Link>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          alignItems="center"
          gap={2.5}
          width={330}
          mx="auto"
          noValidate
        >
          <Typography variant="h3">Signup</Typography>
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink htmlFor="name">
              Name
            </InputLabel>
            <TextField
              variant="filled"
              placeholder="Enter your full name"
              id="name"
              required
              // 6. Hubungkan dengan state 'name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ width: 16, height: 16 }}>
                    <IconifyIcon icon="mdi:user" width={1} height={1} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink htmlFor="email">
              Email
            </InputLabel>
            {/* Menggunakan TextField agar konsisten */}
            <TextField
              variant="filled"
              placeholder="Enter your email"
              id="email"
              type="email"
              required
              // 7. Hubungkan dengan state 'email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ width: 16, height: 16 }}>
                    <IconifyIcon icon="ic:baseline-email" width={1} height={1} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink htmlFor="password">
              Password
            </InputLabel>
            <TextField
              variant="filled"
              placeholder="********"
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              // 8. Hubungkan dengan state 'password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {showPassword ? (
                        <IconifyIcon icon="ic:baseline-key-off" />
                      ) : (
                        <IconifyIcon icon="ic:baseline-key" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          {/* 9. Tambahkan type="submit" pada tombol */}
          <Button type="submit" variant="contained" fullWidth>
            Sign up
          </Button>

          {/* 10. Tampilkan pesan error jika ada */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Already have an account ?{' '}
            <Link
              href="/auth/login"
              underline="hover"
              fontSize={(theme) => theme.typography.body1.fontSize}
            >
              Log in
            </Link>
          </Typography>
        </Stack>
      </Stack>
      <Suspense
        fallback={
          <Skeleton variant="rectangular" height={1} width={1} sx={{ bgcolor: 'primary.main' }} />
        }
      >
        <Image
          alt="Signup banner"
          src={signupBanner}
          sx={{
            width: 0.5,
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Suspense>
    </Stack>
  );
};

export default SignUp;
