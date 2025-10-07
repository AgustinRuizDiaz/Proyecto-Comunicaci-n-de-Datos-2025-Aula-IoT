import React, { useState, useEffect } from 'react';
import { classroomService, sensorService, userService } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import RoleBasedAccess, { AdminOnly, OperatorOnly, AdminOrOperator } from '../components/RoleBasedAccess';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClassrooms: 0,
    totalSensors: 0,
    activeSensors: 0,
    alerts: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const { on } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();

    // Listen for real-time sensor updates
    on('sensor_update', (data) => {
      console.log('Sensor update received:', data);
      loadDashboardData();
    });

    on('alert', (data) => {
      console.log('Alert received:', data);
      setStats(prev => ({ ...prev, alerts: prev.alerts + 1 }));
    });

    return () => {
      // Cleanup listeners
    };
  }, [on]);

  const loadDashboardData = async () => {
    try {
      const [classroomsRes, sensorsRes] = await Promise.all([
        classroomService.getAll(),
        sensorService.getAll()
      ]);

      const classrooms = classroomsRes.data.results || classroomsRes.data;
      const sensors = sensorsRes.data.results || sensorsRes.data;

      const newStats = {
        totalClassrooms: classrooms.length,
        totalSensors: sensors.length,
        activeSensors: sensors.filter(s => s.status === 'active').length,
        alerts: sensors.filter(s => s.status === 'alert').length,
        totalUsers: 0,
        activeUsers: 0
      };

      // Si es admin, cargar estadísticas de usuarios
      if (user.rol === 'Admin') {
        try {
          const usersRes = await userService.getAll();
          const users = usersRes.data.results || usersRes.data;
          newStats.totalUsers = users.length;
          newStats.activeUsers = users.filter(u => u.is_active).length;
        } catch (error) {
          console.error('Error loading users data:', error);
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard {user.rol === 'Admin' ? 'Administrador' : 'Operario'}
        </h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Aulas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClassrooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sensores Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSensors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sensores Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSensors}</p>
            </div>
          </div>
        </div>

        {/* Admin-only stats */}
        <AdminOnly>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </AdminOnly>

        {/* Operator sees alerts instead of users */}
        <OperatorOnly>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
              </div>
            </div>
          </div>
        </OperatorOnly>
      </div>

      {/* Admin-only quick actions */}
      <AdminOnly>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-blue-700 font-medium">Crear Usuario</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-green-700 font-medium">Crear Aula</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-purple-700 font-medium">Crear Sensor</span>
            </button>
          </div>
        </div>
      </AdminOnly>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
