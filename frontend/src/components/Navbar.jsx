import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import RoleBasedAccess, { AdminOnly, OperatorOnly } from './RoleBasedAccess'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material'
import { ExitToApp as LogoutIcon, Person as PersonIcon } from '@mui/icons-material'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <AppBar position="static" sx={{ bgcolor: '#1e40af', boxShadow: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/classrooms"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            '&:hover': { opacity: 0.9 }
          }}
        >
          🎓 GestorAulas
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Common navigation for all authenticated users */}
          <Button
            component={Link}
            to="/classrooms"
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              borderRadius: 2
            }}
          >
            Aulas
          </Button>

          <Button
            component={Link}
            to="/sensors"
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              borderRadius: 2
            }}
          >
            Sensores
          </Button>

          <Button
            component={Link}
            to="/history"
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              borderRadius: 2
            }}
          >
            Historial
          </Button>

          {/* Admin-only navigation */}
          <AdminOnly>
            <Button
              component={Link}
              to="/admin/users"
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: 2
              }}
            >
              USUARIOS
            </Button>
          </AdminOnly>

          {/* Operator-only navigation */}
          <OperatorOnly>
            <Button
              component={Link}
              to="/operator/sensors"
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              🔧 Mis Sensores
            </Button>
          </OperatorOnly>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 32, height: 32 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
            </Avatar>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                {user?.legajo}
              </Typography>
              <Chip
                label={user?.rol || 'Usuario'}
                size="small"
                sx={{
                  bgcolor: isAdmin ? '#ef4444' : '#10b981',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 18
                }}
              />
            </Box>
          </Box>

          <Tooltip title="Cerrar sesión">
            <IconButton
              onClick={handleLogout}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s'
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
