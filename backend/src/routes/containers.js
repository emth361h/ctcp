const express = require('express');
const { check, validationResult } = require('express-validator');
const dockerUtils = require('../utils/docker');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/containers
 * @desc    Get all containers
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const containers = await dockerUtils.getContainers(all);
    res.json(containers);
  } catch (error) {
    console.error('Get containers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/containers/:id
 * @desc    Get container by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const container = await dockerUtils.getContainer(req.params.id);
    res.json(container);
  } catch (error) {
    console.error(`Get container ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/containers/:id/stats
 * @desc    Get container stats
 * @access  Private
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await dockerUtils.getContainerStats(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error(`Get container stats ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/containers/:id/logs
 * @desc    Get container logs
 * @access  Private
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const options = {
      tail: parseInt(req.query.tail) || 100,
      stdout: req.query.stdout !== 'false',
      stderr: req.query.stderr !== 'false'
    };
    
    const logs = await dockerUtils.getContainerLogs(req.params.id, options);
    res.send(logs);
  } catch (error) {
    console.error(`Get container logs ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/containers/:id/start
 * @desc    Start container
 * @access  Private
 */
router.post('/:id/start', async (req, res) => {
  try {
    await dockerUtils.startContainer(req.params.id);
    res.json({ message: 'Container started' });
  } catch (error) {
    console.error(`Start container ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/containers/:id/stop
 * @desc    Stop container
 * @access  Private
 */
router.post('/:id/stop', async (req, res) => {
  try {
    await dockerUtils.stopContainer(req.params.id);
    res.json({ message: 'Container stopped' });
  } catch (error) {
    console.error(`Stop container ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/containers/:id/restart
 * @desc    Restart container
 * @access  Private
 */
router.post('/:id/restart', async (req, res) => {
  try {
    await dockerUtils.restartContainer(req.params.id);
    res.json({ message: 'Container restarted' });
  } catch (error) {
    console.error(`Restart container ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/containers/:id
 * @desc    Remove container
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    await dockerUtils.removeContainer(req.params.id, force);
    res.json({ message: 'Container removed' });
  } catch (error) {
    console.error(`Remove container ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/containers
 * @desc    Create container
 * @access  Private
 */
router.post(
  '/',
  [
    check('Image', 'Image is required').not().isEmpty(),
    check('name', 'Name is required').optional()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const containerOptions = {
        Image: req.body.Image,
        name: req.body.name,
        Cmd: req.body.Cmd,
        Env: req.body.Env,
        ExposedPorts: req.body.ExposedPorts,
        HostConfig: req.body.HostConfig
      };
      
      const container = await dockerUtils.createContainer(containerOptions);
      
      if (req.body.start) {
        await container.start();
      }
      
      res.json(container);
    } catch (error) {
      console.error('Create container error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
