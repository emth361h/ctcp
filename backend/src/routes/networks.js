const express = require('express');
const { check, validationResult } = require('express-validator');
const dockerUtils = require('../utils/docker');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/networks
 * @desc    Get all networks
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const networks = await dockerUtils.getNetworks();
    res.json(networks);
  } catch (error) {
    console.error('Get networks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/networks/:id
 * @desc    Get network by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const network = await dockerUtils.getNetwork(req.params.id);
    res.json(network);
  } catch (error) {
    console.error(`Get network ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/networks
 * @desc    Create network
 * @access  Private
 */
router.post(
  '/',
  [
    check('Name', 'Name is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const networkOptions = {
        Name: req.body.Name,
        Driver: req.body.Driver || 'bridge',
        Internal: req.body.Internal || false,
        EnableIPv6: req.body.EnableIPv6 || false,
        Options: req.body.Options || {}
      };
      
      const network = await dockerUtils.createNetwork(networkOptions);
      res.json(network);
    } catch (error) {
      console.error('Create network error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/networks/:id
 * @desc    Remove network
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    await dockerUtils.removeNetwork(req.params.id);
    res.json({ message: 'Network removed' });
  } catch (error) {
    console.error(`Remove network ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/networks/:id/connect
 * @desc    Connect container to network
 * @access  Private
 */
router.post(
  '/:id/connect',
  [
    check('containerId', 'Container ID is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await dockerUtils.connectNetwork(req.params.id, req.body.containerId);
      res.json({ message: 'Container connected to network' });
    } catch (error) {
      console.error(`Connect container to network ${req.params.id} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/networks/:id/disconnect
 * @desc    Disconnect container from network
 * @access  Private
 */
router.post(
  '/:id/disconnect',
  [
    check('containerId', 'Container ID is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await dockerUtils.disconnectNetwork(req.params.id, req.body.containerId);
      res.json({ message: 'Container disconnected from network' });
    } catch (error) {
      console.error(`Disconnect container from network ${req.params.id} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
