import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            p: 6,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <LockIcon sx={{ fontSize: 80, mb: 3, color: '#ef4444' }} />

          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Acceso Denegado
          </Typography>

          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            No tienes permisos suficientes para acceder a esta página.
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
            Esta página requiere permisos especiales que no están asociados a tu cuenta actual.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                bgcolor: 'white',
                color: '#1e40af',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
                px: 4,
                py: 1.5,
              }}
            >
              Ir al Dashboard
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: '#3b82f6',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Cambiar de Usuario
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Unauthorized;
