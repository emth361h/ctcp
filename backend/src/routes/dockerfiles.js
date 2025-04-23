const express = require('express');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const dockerUtils = require('../utils/docker');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// Directory to store Dockerfiles
const DOCKERFILE_DIR = path.join(__dirname, '../../data/dockerfiles');

// Ensure Dockerfile directory exists
if (!fs.existsSync(DOCKERFILE_DIR)) {
  fs.mkdirSync(DOCKERFILE_DIR, { recursive: true });
}

/**
 * @route   GET /api/dockerfiles
 * @desc    Get all Dockerfiles
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const files = fs.readdirSync(DOCKERFILE_DIR);
    const dockerfiles = files
      .filter(file => !fs.statSync(path.join(DOCKERFILE_DIR, file)).isDirectory())
      .map(file => {
        const filePath = path.join(DOCKERFILE_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        };
      });
    
    res.json(dockerfiles);
  } catch (error) {
    console.error('Get Dockerfiles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/dockerfiles/:name
 * @desc    Get Dockerfile by name
 * @access  Private
 */
router.get('/:name', async (req, res) => {
  try {
    const filePath = path.join(DOCKERFILE_DIR, req.params.name);
    
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return res.status(404).json({ message: 'Dockerfile not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    res.json({
      name: req.params.name,
      path: filePath,
      content
    });
  } catch (error) {
    console.error(`Get Dockerfile ${req.params.name} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/dockerfiles
 * @desc    Create Dockerfile
 * @access  Private
 */
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, content } = req.body;
      const filePath = path.join(DOCKERFILE_DIR, name);
      
      // Check if file already exists
      if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        return res.status(400).json({ message: 'Dockerfile already exists' });
      }
      
      // Write file
      fs.writeFileSync(filePath, content);
      
      res.json({
        name,
        path: filePath,
        message: 'Dockerfile created'
      });
    } catch (error) {
      console.error('Create Dockerfile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/dockerfiles/:name
 * @desc    Update Dockerfile
 * @access  Private
 */
router.put(
  '/:name',
  [
    check('content', 'Content is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const filePath = path.join(DOCKERFILE_DIR, req.params.name);
      
      // Check if file exists
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        return res.status(404).json({ message: 'Dockerfile not found' });
      }
      
      const { content } = req.body;
      
      // Write file
      fs.writeFileSync(filePath, content);
      
      res.json({
        name: req.params.name,
        path: filePath,
        message: 'Dockerfile updated'
      });
    } catch (error) {
      console.error(`Update Dockerfile ${req.params.name} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/dockerfiles/:name
 * @desc    Delete Dockerfile
 * @access  Private
 */
router.delete('/:name', async (req, res) => {
  try {
    const filePath = path.join(DOCKERFILE_DIR, req.params.name);
    
    // Check if file exists
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return res.status(404).json({ message: 'Dockerfile not found' });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      name: req.params.name,
      message: 'Dockerfile deleted'
    });
  } catch (error) {
    console.error(`Delete Dockerfile ${req.params.name} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/dockerfiles/:name/build
 * @desc    Build image from Dockerfile
 * @access  Private
 */
router.post(
  '/:name/build',
  [
    check('tag', 'Image tag is required').not().isEmpty(),
    check('context', 'Build context is required').optional()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const filePath = path.join(DOCKERFILE_DIR, req.params.name);
      
      // Check if file exists
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        return res.status(404).json({ message: 'Dockerfile not found' });
      }
      
      const { tag, context, buildargs, labels } = req.body;
      
      // Create temporary build context
      const buildContext = context || path.join(DOCKERFILE_DIR, 'build-context-' + Date.now());
      
      if (!context) {
        // If no context provided, create a temporary one and copy the Dockerfile
        if (!fs.existsSync(buildContext)) {
          fs.mkdirSync(buildContext, { recursive: true });
        }
        
        fs.copyFileSync(filePath, path.join(buildContext, 'Dockerfile'));
      }
      
      const buildOptions = {
        t: tag,
        buildargs: buildargs || {},
        labels: labels || {}
      };
      
      await dockerUtils.buildImage(buildContext, buildOptions);
      
      // Clean up temporary build context if created
      if (!context) {
        fs.unlinkSync(path.join(buildContext, 'Dockerfile'));
        fs.rmdirSync(buildContext);
      }
      
      res.json({
        name: req.params.name,
        tag,
        message: `Image ${tag} built from Dockerfile ${req.params.name}`
      });
    } catch (error) {
      console.error(`Build image from Dockerfile ${req.params.name} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
