import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
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

interface NewUser {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  active: boolean;
  resourceLimits: {
    containers: number;
    cpuLimit: number;
    memoryLimit: number;
    storageLimit: number;
  };
}

const initialNewUser: NewUser = {
  username: '',
  email: '',
  password: '',
  role: 'user',
  active: true,
  resourceLimits: {
    containers: 5,
    cpuLimit: 2,
    memoryLimit: 2048,
    storageLimit: 10
  }
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>(initialNewUser);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = () => {
    setNewUser(initialNewUser);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleRoleChange = (e: any) => {
    setNewUser({ ...newUser, role: e.target.value });
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, active: e.target.checked });
  };

  const handleResourceLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      resourceLimits: {
        ...newUser.resourceLimits,
        [name]: Number(value)
      }
    });
  };

  const handleCreateUser = async () => {
    try {
      await axios.post('/api/auth/register', {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        active: newUser.active,
        resourceLimits: newUser.resourceLimits
      });
      
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
      
      handleCloseDialog();
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to create user',
        severity: 'error'
      });
    }
  };

  const handleOpenDeleteDialog = (userId: string) => {
    setDeleteUserId(userId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteUserId(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      await axios.delete(`/api/users/${deleteUserId}`);
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add User
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Resource Limits</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'admin' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Inactive'}
                        color={user.active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Containers: {user.resourceLimits.containers}
                      </Typography>
                      <Typography variant="body2">
                        CPU: {user.resourceLimits.cpuLimit} cores
                      </Typography>
                      <Typography variant="body2">
                        Memory: {user.resourceLimits.memoryLimit} MB
                      </Typography>
                      <Typography variant="body2">
                        Storage: {user.resourceLimits.storageLimit} GB
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(user.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
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
                  checked={newUser.active}
                  onChange={handleActiveChange}
                  name="active"
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Resource Limits
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Containers"
              name="containers"
              type="number"
              value={newUser.resourceLimits.containers}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="CPU Cores"
              name="cpuLimit"
              type="number"
              value={newUser.resourceLimits.cpuLimit}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Memory (MB)"
              name="memoryLimit"
              type="number"
              value={newUser.resourceLimits.memoryLimit}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 512 } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Storage (GB)"
              name="storageLimit"
              type="number"
              value={newUser.resourceLimits.storageLimit}
              onChange={handleResourceLimitChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={!newUser.username || !newUser.email || !newUser.password}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default Users;
