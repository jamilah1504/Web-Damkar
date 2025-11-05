// Login.tsx
import { ReactElement, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
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
import loginBanner from 'assets/authentication-banners/login.png';
import IconifyIcon from 'components/base/IconifyIcon';
import firesponseLogo from 'assets/logo/fireresponse-logo.png';
import Image from 'components/base/Image';
import authService from '../../services/authServices';
import paths, { rootPaths } from '../../routes/paths';
import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';
import axios from 'axios';
 

const Login = (): ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const nodeBackendUrl = 'http://localhost:5000/api/auth/verify-token';
  
  const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();

      try {
        // 1. Memulai alur Google Sign-In (Pop-up)
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // 2. Mendapatkan ID Token Firebase (JWT)
        const idToken = await user.getIdToken();

        // 3. Kirim token ke backend Node.js Anda
        // Backend akan memverifikasi, lalu MENCARI atau MEMBUAT user di DB
        const response = await axios.post(nodeBackendUrl, { idToken });

        // 4. Backend berhasil memproses (status 200 OK)
        if (response.status === 200) {
          console.log("Backend berhasil memproses login:", response.data);

          // Ambil data dari respons backend
          const userData = response.data.user; // { uid, email, name, role }
          const customToken = response.data.myCustomToken; // Token JWT kustom Anda

          // --- INI ADALAH LOGIKA DARI SNIPPET 1 ANDA, DIMASUKKAN KE SINI ---
          
          // Cek jika backend mengirim data user dan role
          if (userData && userData.role) {
            
            // Bersihkan role: default ke 'masyarakat', hapus spasi, dan lowercase
            const role = (userData.role || 'masyarakat').replace(/\s/g, '').toLowerCase();
            console.log('Role yang diproses (dari backend):', `[${role}]`);

            // Simpan role dan token kustom dari backend ke localStorage
            localStorage.setItem('role', role);
            if (customToken) {
              localStorage.setItem('token', customToken); // Ini adalah token backend Anda
            }
            localStorage.setItem('user', JSON.stringify(userData));


            // Arahkan pengguna berdasarkan role
            switch (role) {
              case 'admin':
                navigate(`/${rootPaths.adminRoot}/${paths.adminDashboard}`);
                break;
              case 'masyarakat':
                navigate(`/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`);
                break;
              case 'petugas':
                navigate(`/${rootPaths.petugasRoot}/${paths.petugasTugasAktif}`);
                break;
              default:
                // Ini terjadi jika backend memberi role aneh (misal: 'supervisor')
                console.warn(`Peran tidak dikenali: ${userData.role}, mengarahkan ke landing.`);
                navigate(paths.landing);
            }
          } else {
            // Skenario darurat jika backend tidak mengembalikan data user/role
            console.error("Data pengguna atau peran tidak diterima dari backend.");
            // Arahkan ke halaman default 'masyarakat' sesuai permintaan Anda
            localStorage.setItem('role', 'masyarakat');
            navigate(`/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`);
          }
        }

      } catch (error) {
        console.error("Error saat alur login Google:", error.response ? error.response.data : error.message);
        // Tampilkan error ke pengguna
      }
    };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const userData = await authService.login({ email, password });
      console.log('Data pengguna setelah login:', userData);

      if (userData && userData.role) {
        const role = (userData.role || 'masyarakat').replace(/\s/g, '').toLowerCase();
        console.log('Role yang diproses (REGEX clean):', `[${role}]`);

        localStorage.setItem('role', role);
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }

        switch (role) {
          case 'admin':
            navigate(`/${rootPaths.adminRoot}/${paths.adminDashboard}`);
            break;
          case 'masyarakat':
            navigate(`/${rootPaths.masyarakatRoot}/${paths.masyarakatDashboard}`);
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
        err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.',
      );
    }
  };

  return (
    <Stack
      direction="row"
      bgcolor="background.paper"
      boxShadow={(theme) => theme.shadows[3]}
      height={560}
      width={{ md: 960 }}
    >
      <Stack width={{ md: 0.5 }} m={2.5} gap={8}>
        <Link href="/" width="fit-content">
          <Image src={firesponseLogo} width={152.6} alt="Firesponse Logo" />
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
          <Typography variant="h3">Login</Typography>
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink htmlFor="email">
              Email
            </InputLabel>
            <TextField
              variant="filled"
              placeholder="Enter your email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconifyIcon icon="ic:baseline-email" />
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
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
          <Typography variant="body1" sx={{ alignSelf: 'flex-end' }}>
            <Link href={`/${rootPaths.authRoot}/forgot-password`} underline="hover">
              Forget password
            </Link>
          </Typography>
          <Button type="submit" variant="contained" fullWidth>
            Log in
          </Button>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            Don't have an account ?{' '}
            <Link
              href={`/${rootPaths.authRoot}/register`}
              underline="hover"
              fontSize={(theme) => theme.typography.body1.fontSize}
            >
              Sign up
            </Link>
          </Typography>
          <button onClick={handleGoogleLogin}>
            Masuk dengan Google
          </button>
        </Stack>
      </Stack>
      <Suspense
        fallback={
          <Skeleton variant="rectangular" height={1} width={1} sx={{ bgcolor: 'primary.main' }} />
        }
      >
        <Image
          alt="Login banner"
          src={loginBanner}
          sx={{ width: 0.5, display: { xs: 'none', md: 'block' } }}
        />
      </Suspense>
    </Stack>
  );
};

export default Login;
