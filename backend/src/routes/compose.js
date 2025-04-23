const express = require('express');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const dockerUtils = require('../utils/docker');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// Directory to store compose files
const COMPOSE_DIR = path.join(__dirname, '../../data/compose');

// Ensure compose directory exists
if (!fs.existsSync(COMPOSE_DIR)) {
  fs.mkdirSync(COMPOSE_DIR, { recursive: true });
}

/**
 * @route   GET /api/compose
 * @desc    Get all compose files
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const files = fs.readdirSync(COMPOSE_DIR);
    const composeFiles = files
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map(file => {
        const filePath = path.join(COMPOSE_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        };
      });
    
    res.json(composeFiles);
  } catch (error) {
    console.error('Get compose files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/compose/:name
 * @desc    Get compose file by name
 * @access  Private
 */
router.get('/:name', async (req, res) => {
  try {
    const filePath = path.join(COMPOSE_DIR, req.params.name);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Compose file not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedContent = yaml.parse(content);
    
    res.json({
      name: req.params.name,
      path: filePath,
      content: parsedContent,
      raw: content
    });
  } catch (error) {
    console.error(`Get compose file ${req.params.name} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/compose
 * @desc    Create compose file
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
      const filePath = path.join(COMPOSE_DIR, name);
      
      // Check if file already exists
      if (fs.existsSync(filePath)) {
        return res.status(400).json({ message: 'Compose file already exists' });
      }
      
      // Validate YAML content
      try {
        yaml.parse(content);
      } catch (yamlError) {
        return res.status(400).json({ message: 'Invalid YAML content', error: yamlError.message });
      }
      
      // Write file
      fs.writeFileSync(filePath, content);
      
      res.json({
        name,
        path: filePath,
        message: 'Compose file created'
      });
    } catch (error) {
      console.error('Create compose file error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/compose/:name
 * @desc    Update compose file
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
      const filePath = path.join(COMPOSE_DIR, req.params.name);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Compose file not found' });
      }
      
      const { content } = req.body;
      
      // Validate YAML content
      try {
        yaml.parse(content);
      } catch (yamlError) {
        return res.status(400).json({ message: 'Invalid YAML content', error: yamlError.message });
      }
      
      // Write file
      fs.writeFileSync(filePath, content);
      
      res.json({
        name: req.params.name,
        path: filePath,
        message: 'Compose file updated'
      });
    } catch (error) {
      console.error(`Update compose file ${req.params.name} error:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/compose/:name
 * @desc    Delete compose file
 * @access  Private
 */
router.delete('/:name', async (req, res) => {
  try {
    const filePath = path.join(COMPOSE_DIR, req.params.name);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Compose file not found' });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      name: req.params.name,
      message: 'Compose file deleted'
    });
  } catch (error) {
    console.error(`Delete compose file ${req.params.name} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/compose/:name/up
 * @desc    Run docker-compose up
 * @access  Private
 */
router.post('/:name/up', async (req, res) => {
  try {
    const filePath = path.join(COMPOSE_DIR, req.params.name);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Compose file not found' });
    }
    
    const projectName = req.body.projectName || path.parse(req.params.name).name;
    
    const result = await dockerUtils.runCompose(filePath, projectName, 'up');
    
    res.json({
      name: req.params.name,
      projectName,
      action: 'up',
      result
    });
  } catch (error) {
    console.error(`Run compose up ${req.params.name} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/compose/:name/down
 * @desc    Run docker-compose down
 * @access  Private
 */
router.post('/:name/down', async (req, res) => {
  try {
    const filePath = path.join(COMPOSE_DIR, req.params.name);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Compose file not found' });
    }
    
    const projectName = req.body.projectName || path.parse(req.params.name).name;
    
    const result = await dockerUtils.runCompose(filePath, projectName, 'down');
    
    res.json({
      name: req.params.name,
      projectName,
      action: 'down',
      result
    });
  } catch (error) {
    console.error(`Run compose down ${req.params.name} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
