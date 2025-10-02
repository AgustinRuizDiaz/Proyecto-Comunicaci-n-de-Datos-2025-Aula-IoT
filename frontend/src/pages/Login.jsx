import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  CssBaseline
} from '@mui/material'
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material'

const Login = () => {
  const [credentials, setCredentials] = useState({
    legajo: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(credentials.legajo, credentials.password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
            backgroundColor: 'white',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#1e40af', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ mb: 1, color: '#1e40af', fontWeight: 'bold' }}>
            Gestor de Aulas
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: '#64748b', textAlign: 'center' }}>
            Sistema de Gestión de Aulas Universitarias con IoT
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="legajo"
              label="Número de Legajo"
              name="legajo"
              autoComplete="username"
              autoFocus
              value={credentials.legajo}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e40af',
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e40af',
                  },
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#1e40af',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)',
                '&:hover': {
                  backgroundColor: '#1e3a8a',
                  boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4)',
                },
                '&:disabled': {
                  background: '#94a3b8',
                  color: '#64748b',
                }
              }}
            >
              {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Sistema de Gestión de Aulas Universitarias
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography variant="body2" sx={{ mt: 3, color: '#64748b', textAlign: 'center' }}>
          © 2025 Universidad - Sistema de Gestión de Aulas
        </Typography>
      </Box>
    </Container>
  )
}

export default Login
