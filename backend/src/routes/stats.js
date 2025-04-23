const express = require('express');
const dockerUtils = require('../utils/docker');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/stats/system
 * @desc    Get system information
 * @access  Private
 */
router.get('/system', async (req, res) => {
  try {
    const info = await dockerUtils.getSystemInfo();
    res.json(info);
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/version
 * @desc    Get Docker version
 * @access  Private
 */
router.get('/version', async (req, res) => {
  try {
    const version = await dockerUtils.getVersion();
    res.json(version);
  } catch (error) {
    console.error('Get Docker version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/resources
 * @desc    Get resource usage
 * @access  Private
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = await dockerUtils.getResourceUsage();
    res.json(resources);
  } catch (error) {
    console.error('Get resource usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/containers/:id
 * @desc    Get container stats
 * @access  Private
 */
router.get('/containers/:id', async (req, res) => {
  try {
    const stats = await dockerUtils.getContainerStats(req.params.id);
    
    // Calculate CPU usage percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage.length;
    const cpuUsage = (cpuDelta / systemCpuDelta) * cpuCount * 100;
    
    // Calculate memory usage
    const memoryUsage = stats.memory_stats.usage / stats.memory_stats.limit * 100;
    
    // Calculate network I/O
    let networkRx = 0;
    let networkTx = 0;
    
    if (stats.networks) {
      Object.keys(stats.networks).forEach(iface => {
        networkRx += stats.networks[iface].rx_bytes;
        networkTx += stats.networks[iface].tx_bytes;
      });
    }
    
    // Calculate block I/O
    let blockRead = 0;
    let blockWrite = 0;
    
    if (stats.blkio_stats && stats.blkio_stats.io_service_bytes_recursive) {
      stats.blkio_stats.io_service_bytes_recursive.forEach(stat => {
        if (stat.op === 'Read') {
          blockRead += stat.value;
        } else if (stat.op === 'Write') {
          blockWrite += stat.value;
        }
      });
    }
    
    res.json({
      id: req.params.id,
      cpuUsage,
      memoryUsage,
      memoryUsageBytes: stats.memory_stats.usage,
      memoryLimitBytes: stats.memory_stats.limit,
      networkRx,
      networkTx,
      blockRead,
      blockWrite,
      timestamp: new Date(),
      rawStats: stats
    });
  } catch (error) {
    console.error(`Get container stats ${req.params.id} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/admin
 * @desc    Get admin dashboard stats
 * @access  Admin
 */
router.get('/admin', isAdmin, async (req, res) => {
  try {
    // Get resource usage
    const resources = await dockerUtils.getResourceUsage();
    
    // Get system info
    const systemInfo = await dockerUtils.getSystemInfo();
    
    // Get Docker version
    const dockerVersion = await dockerUtils.getVersion();
    
    // Get all containers
    const containers = await dockerUtils.getContainers(true);
    
    // Get all images
    const images = await dockerUtils.getImages();
    
    // Get all networks
    const networks = await dockerUtils.getNetworks();
    
    // Calculate container stats
    const runningContainers = containers.filter(c => c.State === 'running').length;
    const stoppedContainers = containers.filter(c => c.State === 'exited').length;
    
    res.json({
      system: {
        info: systemInfo,
        dockerVersion
      },
      resources,
      containers: {
        total: containers.length,
        running: runningContainers,
        stopped: stoppedContainers
      },
      images: {
        total: images.length
      },
      networks: {
        total: networks.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
