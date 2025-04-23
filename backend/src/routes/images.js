const express = require('express');
const { check, validationResult } = require('express-validator');
const dockerUtils = require('../utils/docker');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/images
 * @desc    Get all images
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const images = await dockerUtils.getImages();
    res.json(images);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/images/:id
 * @desc    Get image by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const image = await dockerUtils.getImage(req.params.id);
    res.json(image);
  } catch (error) {
    console.error(`Get image ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/images/pull
 * @desc    Pull image
 * @access  Private
 */
router.post(
  '/pull',
  [
    check('name', 'Image name is required').not().isEmpty(),
    check('tag', 'Image tag is required').optional()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await dockerUtils.pullImage(req.body.name, req.body.tag || 'latest');
      res.json({ message: `Image ${req.body.name}:${req.body.tag || 'latest'} pulled` });
    } catch (error) {
      console.error(`Pull image ${req.body.name}:${req.body.tag || 'latest'} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/images/:id
 * @desc    Remove image
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    await dockerUtils.removeImage(req.params.id, force);
    res.json({ message: 'Image removed' });
  } catch (error) {
    console.error(`Remove image ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/images/build
 * @desc    Build image from Dockerfile
 * @access  Private
 */
router.post(
  '/build',
  [
    check('context', 'Build context is required').not().isEmpty(),
    check('tag', 'Image tag is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const buildOptions = {
        t: req.body.tag,
        dockerfile: req.body.dockerfile || 'Dockerfile',
        buildargs: req.body.buildargs || {},
        labels: req.body.labels || {}
      };
      
      await dockerUtils.buildImage(req.body.context, buildOptions);
      res.json({ message: `Image ${req.body.tag} built` });
    } catch (error) {
      console.error(`Build image ${req.body.tag} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
