import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as CpuIcon,
  Storage as StorageIcon,
  People as UsersIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface AdminStats {
  system: {
    info: {
      NCPU: number;
      MemTotal: number;
      Name: string;
      KernelVersion: string;
      OperatingSystem: string;
      OSVersion: string;
      DockerRootDir: string;
    };
    dockerVersion: {
      Version: string;
      ApiVersion: string;
      MinAPIVersion: string;
      GitCommit: string;
      GoVersion: string;
      Os: string;
      Arch: string;
    };
  };
  resources: {
    totalCpuUsage: number;
    totalMemoryUsage: number;
    containers: Array<{
      id: string;
      name: string;
      cpuUsage: number;
      memoryUsage: number;
    }>;
  };
  containers: {
    total: number;
    running: number;
    stopped: number;
  };
  images: {
    total: number;
  };
  networks: {
    total: number;
  };
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/stats/admin');
        setStats(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching admin stats:', err);
        setError(err.response?.data?.message || 'Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* System Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">Host Name</TableCell>
                        <TableCell>{stats?.system.info.Name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Operating System</TableCell>
                        <TableCell>{stats?.system.info.OperatingSystem} {stats?.system.info.OSVersion}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Kernel Version</TableCell>
                        <TableCell>{stats?.system.info.KernelVersion}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">CPU Cores</TableCell>
                        <TableCell>{stats?.system.info.NCPU}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Total Memory</TableCell>
                        <TableCell>{Math.round((stats?.system.info.MemTotal || 0) / (1024 * 1024 * 1024))} GB</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">Docker Version</TableCell>
                        <TableCell>{stats?.system.dockerVersion.Version}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">API Version</TableCell>
                        <TableCell>{stats?.system.dockerVersion.ApiVersion}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Go Version</TableCell>
                        <TableCell>{stats?.system.dockerVersion.GoVersion}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Git Commit</TableCell>
                        <TableCell>{stats?.system.dockerVersion.GitCommit}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Docker Root Directory</TableCell>
                        <TableCell>{stats?.system.info.DockerRootDir}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Resource Usage */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Usage
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CpuIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">CPU Usage</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress
                          variant="determinate"
                          value={stats?.resources.totalCpuUsage || 0}
                          size={80}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" color="text.secondary">
                            {`${Math.round(stats?.resources.totalCpuUsage || 0)}%`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {`${stats?.system.info.NCPU || 0} CPU cores available`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Memory Usage</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress
                          variant="determinate"
                          value={stats?.resources.totalMemoryUsage || 0}
                          size={80}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" color="text.secondary">
                            {`${Math.round(stats?.resources.totalMemoryUsage || 0)}%`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round((stats?.system.info.MemTotal || 0) / (1024 * 1024 * 1024))} GB total memory`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Container Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Container Resource Usage
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Container ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>CPU Usage</TableCell>
                    <TableCell>Memory Usage</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.resources.containers.map((container) => (
                    <TableRow key={container.id}>
                      <TableCell>{container.id.substring(0, 12)}</TableCell>
                      <TableCell>{container.name}</TableCell>
                      <TableCell>{`${Math.round(container.cpuUsage)}%`}</TableCell>
                      <TableCell>{`${Math.round(container.memoryUsage)}%`}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => navigate(`/containers/${container.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* User Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                User Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/admin/users')}
                startIcon={<UsersIcon />}
              >
                Manage Users
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Manage user accounts, permissions, and resource limits.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Last Updated */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(stats?.timestamp || '').toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
