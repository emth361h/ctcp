const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put(
  '/:id',
  [
    isAdmin,
    [
      check('username', 'Username is required').optional().not().isEmpty(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('role', 'Role must be either user or admin').optional().isIn(['user', 'admin']),
      check('active', 'Active must be a boolean').optional().isBoolean(),
      check('resourceLimits.containers', 'Containers limit must be a number').optional().isNumeric(),
      check('resourceLimits.cpuLimit', 'CPU limit must be a number').optional().isNumeric(),
      check('resourceLimits.memoryLimit', 'Memory limit must be a number').optional().isNumeric(),
      check('resourceLimits.storageLimit', 'Storage limit must be a number').optional().isNumeric()
    ]
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get user by ID
      let user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user fields
      const {
        username,
        email,
        password,
        role,
        active,
        resourceLimits
      } = req.body;
      
      if (username) user.username = username;
      if (email) user.email = email;
      if (password) user.password = password;
      if (role) user.role = role;
      if (active !== undefined) user.active = active;
      
      if (resourceLimits) {
        if (resourceLimits.containers !== undefined) {
          user.resourceLimits.containers = resourceLimits.containers;
        }
        if (resourceLimits.cpuLimit !== undefined) {
          user.resourceLimits.cpuLimit = resourceLimits.cpuLimit;
        }
        if (resourceLimits.memoryLimit !== undefined) {
          user.resourceLimits.memoryLimit = resourceLimits.memoryLimit;
        }
        if (resourceLimits.storageLimit !== undefined) {
          user.resourceLimits.storageLimit = resourceLimits.storageLimit;
        }
      }
      
      // Save updated user
      await user.save();
      
      // Return updated user without password
      user = await User.findById(req.params.id).select('-password');
      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.remove();
    
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
