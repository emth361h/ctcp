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
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  ViewList as ContainersIcon,
  NetworkCheck as NetworksIcon,
  Image as ImagesIcon,
  Memory as MemoryIcon,
  Speed as CpuIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface ResourceStats {
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
  resources: {
    totalCpuUsage: number;
    totalMemoryUsage: number;
  };
  system: {
    info: {
      NCPU: number;
      MemTotal: number;
    };
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/stats/resources');
        setStats(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
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
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Resource Usage */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Usage
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Storage</Typography>
                    </Box>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Docker Images"
                          secondary={`${stats?.images.total || 0} images`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Containers"
                          secondary={`${stats?.containers.total || 0} containers (${stats?.containers.running || 0} running)`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContainersIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Containers</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {`${stats?.containers.running || 0} running, ${stats?.containers.stopped || 0} stopped`}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/containers')}>Manage Containers</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NetworksIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Networks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {`${stats?.networks.total || 0} networks configured`}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/networks')}>Manage Networks</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ImagesIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Images</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {`${stats?.images.total || 0} images available`}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/images')}>Manage Images</Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Admin Section */}
        {isAdmin && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Admin Actions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/admin/dashboard')}
                sx={{ mr: 2 }}
              >
                Admin Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
