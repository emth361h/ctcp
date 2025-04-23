import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  active: boolean;
  createdAt: string;
  lastLogin: string;
  resourceLimits: {
    containers: number;
    cpuLimit: number;
    memoryLimit: number;
    storageLimit: number;
  };
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleRoleChange = (e: any) => {
    if (!user) return;
    
    setUser({ ...user, role: e.target.value });
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    setUser({ ...user, active: e.target.checked });
  };

  const handleResourceLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    const { name, value } = e.target;
    setUser({
      ...user,
      resourceLimits: {
        ...user.resourceLimits,
        [name]: Number(value)
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await axios.put(`/api/users/${id}`, {
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
        resourceLimits: user.resourceLimits
      });
      
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error updating user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update user',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">User not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Edit User
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
        >
          Back to Users
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={user.username}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={user.role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={user.active}
                  onChange={handleActiveChange}
                  name="active"
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resource Limits
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Containers"
              name="containers"
              type="number"
              value={user.resourceLimits.containers}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="CPU Cores"
              name="cpuLimit"
              type="number"
              value={user.resourceLimits.cpuLimit}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Memory (MB)"
              name="memoryLimit"
              type="number"
              value={user.resourceLimits.memoryLimit}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 512 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Storage (GB)"
              name="storageLimit"
              type="number"
              value={user.resourceLimits.storageLimit}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1">
                      {user.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(user.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetail;
