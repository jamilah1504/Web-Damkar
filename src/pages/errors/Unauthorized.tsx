import { ReactElement } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as Nav, useNavigate } from 'react-router-dom';
import logo from 'assets/logo/elegant-logo.png';
// Ganti dengan gambar yang sesuai untuk halaman "Unauthorized" / 403
import error403 from 'assets/404/404.jpg'; 
import Image from 'components/base/Image';

const Unauthorized = (): ReactElement => {
  const navigate = useNavigate();

  const renderHeader: ReactElement = (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 20,
        left: 20,
        width: 1,
        lineHeight: 0,
      }}
    >
      {/* Menggunakan Nav agar bisa kembali ke halaman utama jika diklik */}
      <Nav to="/">
        <Image src={logo} width={82.6} />
      </Nav>
    </Box>
  );

  return (
    <>
      {renderHeader}
      <Container>
        <Stack
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          mx="auto"
          maxWidth={480}
          py={12}
        >
          <Typography variant="h2" sx={{ mb: 3 }}>
            Access Denied
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Sorry, you do not have permission to access this page. Please contact an administrator if you believe this is an error.
          </Typography>
          <Image
            src={error403} // <-- Menggunakan gambar 403
            sx={{
              mx: 'auto',
              width: 1,
              height: 'auto',
              my: { xs: 5, sm: 10 },
            }}
          />
          {/* Opsi 1: Tombol Kembali ke Halaman Utama */}
          <Button component={Nav} to="/" size="large" variant="contained">
            Back to Home
          </Button>

          {/* Opsi 2 (Alternatif): Tombol Kembali ke Halaman Sebelumnya */}
          {/* <Button onClick={() => navigate(-1)} size="large" variant="contained">
            Go Back
          </Button> */}
        </Stack>
      </Container>
    </>
  );
};

export default Unauthorized;