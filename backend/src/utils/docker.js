const Docker = require('dockerode');
const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

// Initialize Docker client
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * Get all containers
 * @param {boolean} all - Include stopped containers
 * @returns {Promise<Array>} - List of containers
 */
const getContainers = async (all = true) => {
  try {
    const containers = await docker.listContainers({ all });
    return containers;
  } catch (error) {
    console.error('Error getting containers:', error);
    throw error;
  }
};

/**
 * Get container by ID
 * @param {string} id - Container ID
 * @returns {Promise<Object>} - Container details
 */
const getContainer = async (id) => {
  try {
    const container = docker.getContainer(id);
    const info = await container.inspect();
    return info;
  } catch (error) {
    console.error(`Error getting container ${id}:`, error);
    throw error;
  }
};

/**
 * Get container stats
 * @param {string} id - Container ID
 * @returns {Promise<Object>} - Container stats
 */
const getContainerStats = async (id) => {
  try {
    const container = docker.getContainer(id);
    const stats = await container.stats({ stream: false });
    return stats;
  } catch (error) {
    console.error(`Error getting container stats ${id}:`, error);
    throw error;
  }
};

/**
 * Start container
 * @param {string} id - Container ID
 * @returns {Promise<void>}
 */
const startContainer = async (id) => {
  try {
    const container = docker.getContainer(id);
    await container.start();
  } catch (error) {
    console.error(`Error starting container ${id}:`, error);
    throw error;
  }
};

/**
 * Stop container
 * @param {string} id - Container ID
 * @returns {Promise<void>}
 */
const stopContainer = async (id) => {
  try {
    const container = docker.getContainer(id);
    await container.stop();
  } catch (error) {
    console.error(`Error stopping container ${id}:`, error);
    throw error;
  }
};

/**
 * Restart container
 * @param {string} id - Container ID
 * @returns {Promise<void>}
 */
const restartContainer = async (id) => {
  try {
    const container = docker.getContainer(id);
    await container.restart();
  } catch (error) {
    console.error(`Error restarting container ${id}:`, error);
    throw error;
  }
};

/**
 * Remove container
 * @param {string} id - Container ID
 * @param {boolean} force - Force remove running container
 * @returns {Promise<void>}
 */
const removeContainer = async (id, force = false) => {
  try {
    const container = docker.getContainer(id);
    await container.remove({ force });
  } catch (error) {
    console.error(`Error removing container ${id}:`, error);
    throw error;
  }
};

/**
 * Get container logs
 * @param {string} id - Container ID
 * @param {Object} options - Log options
 * @returns {Promise<string>} - Container logs
 */
const getContainerLogs = async (id, options = { tail: 100, stdout: true, stderr: true }) => {
  try {
    const container = docker.getContainer(id);
    const logs = await container.logs(options);
    return logs.toString('utf8');
  } catch (error) {
    console.error(`Error getting container logs ${id}:`, error);
    throw error;
  }
};

/**
 * Create container
 * @param {Object} options - Container options
 * @returns {Promise<Object>} - Created container
 */
const createContainer = async (options) => {
  try {
    const container = await docker.createContainer(options);
    return container;
  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
};

/**
 * Get all networks
 * @returns {Promise<Array>} - List of networks
 */
const getNetworks = async () => {
  try {
    const networks = await docker.listNetworks();
    return networks;
  } catch (error) {
    console.error('Error getting networks:', error);
    throw error;
  }
};

/**
 * Get network by ID
 * @param {string} id - Network ID
 * @returns {Promise<Object>} - Network details
 */
const getNetwork = async (id) => {
  try {
    const network = docker.getNetwork(id);
    const info = await network.inspect();
    return info;
  } catch (error) {
    console.error(`Error getting network ${id}:`, error);
    throw error;
  }
};

/**
 * Create network
 * @param {Object} options - Network options
 * @returns {Promise<Object>} - Created network
 */
const createNetwork = async (options) => {
  try {
    const network = await docker.createNetwork(options);
    return network;
  } catch (error) {
    console.error('Error creating network:', error);
    throw error;
  }
};

/**
 * Remove network
 * @param {string} id - Network ID
 * @returns {Promise<void>}
 */
const removeNetwork = async (id) => {
  try {
    const network = docker.getNetwork(id);
    await network.remove();
  } catch (error) {
    console.error(`Error removing network ${id}:`, error);
    throw error;
  }
};

/**
 * Connect container to network
 * @param {string} networkId - Network ID
 * @param {string} containerId - Container ID
 * @returns {Promise<void>}
 */
const connectNetwork = async (networkId, containerId) => {
  try {
    const network = docker.getNetwork(networkId);
    await network.connect({ Container: containerId });
  } catch (error) {
    console.error(`Error connecting container ${containerId} to network ${networkId}:`, error);
    throw error;
  }
};

/**
 * Disconnect container from network
 * @param {string} networkId - Network ID
 * @param {string} containerId - Container ID
 * @returns {Promise<void>}
 */
const disconnectNetwork = async (networkId, containerId) => {
  try {
    const network = docker.getNetwork(networkId);
    await network.disconnect({ Container: containerId });
  } catch (error) {
    console.error(`Error disconnecting container ${containerId} from network ${networkId}:`, error);
    throw error;
  }
};

/**
 * Get all images
 * @returns {Promise<Array>} - List of images
 */
const getImages = async () => {
  try {
    const images = await docker.listImages();
    return images;
  } catch (error) {
    console.error('Error getting images:', error);
    throw error;
  }
};

/**
 * Get image by ID
 * @param {string} id - Image ID
 * @returns {Promise<Object>} - Image details
 */
const getImage = async (id) => {
  try {
    const image = docker.getImage(id);
    const info = await image.inspect();
    return info;
  } catch (error) {
    console.error(`Error getting image ${id}:`, error);
    throw error;
  }
};

/**
 * Pull image
 * @param {string} name - Image name
 * @param {string} tag - Image tag
 * @returns {Promise<void>}
 */
const pullImage = async (name, tag = 'latest') => {
  try {
    await docker.pull(`${name}:${tag}`);
  } catch (error) {
    console.error(`Error pulling image ${name}:${tag}:`, error);
    throw error;
  }
};

/**
 * Remove image
 * @param {string} id - Image ID
 * @param {boolean} force - Force remove
 * @returns {Promise<void>}
 */
const removeImage = async (id, force = false) => {
  try {
    const image = docker.getImage(id);
    await image.remove({ force });
  } catch (error) {
    console.error(`Error removing image ${id}:`, error);
    throw error;
  }
};

/**
 * Build image from Dockerfile
 * @param {string} context - Build context path
 * @param {Object} options - Build options
 * @returns {Promise<void>}
 */
const buildImage = async (context, options) => {
  try {
    await docker.buildImage(context, options);
  } catch (error) {
    console.error('Error building image:', error);
    throw error;
  }
};

/**
 * Run Docker Compose
 * @param {string} composeFile - Path to compose file
 * @param {string} projectName - Project name
 * @param {string} action - Action to perform (up, down, etc.)
 * @returns {Promise<Object>} - Result of compose action
 */
const runCompose = async (composeFile, projectName, action) => {
  try {
    // This is a simplified implementation
    // In a real application, you would use the docker-compose CLI or a library
    
    // Parse compose file
    const composeContent = fs.readFileSync(composeFile, 'utf8');
    const composeConfig = yaml.parse(composeContent);
    
    // Process compose config based on action
    if (action === 'up') {
      // Create networks
      if (composeConfig.networks) {
        for (const [name, config] of Object.entries(composeConfig.networks)) {
          await createNetwork({
            Name: `${projectName}_${name}`,
            ...config
          });
        }
      }
      
      // Create and start containers
      if (composeConfig.services) {
        for (const [name, config] of Object.entries(composeConfig.services)) {
          const containerConfig = {
            name: `${projectName}_${name}`,
            Image: config.image,
            Cmd: config.command ? config.command.split(' ') : undefined,
            Env: config.environment ? Object.entries(config.environment).map(([key, value]) => `${key}=${value}`) : undefined,
            ExposedPorts: config.ports ? config.ports.reduce((ports, port) => {
              const [hostPort, containerPort] = port.split(':');
              ports[`${containerPort}/tcp`] = {};
              return ports;
            }, {}) : undefined,
            HostConfig: {
              Binds: config.volumes ? config.volumes.map(volume => {
                const [hostPath, containerPath] = volume.split(':');
                return `${path.resolve(hostPath)}:${containerPath}`;
              }) : undefined,
              PortBindings: config.ports ? config.ports.reduce((bindings, port) => {
                const [hostPort, containerPort] = port.split(':');
                bindings[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
                return bindings;
              }, {}) : undefined,
              NetworkMode: config.network_mode || undefined
            }
          };
          
          const container = await createContainer(containerConfig);
          await container.start();
        }
      }
    } else if (action === 'down') {
      // Stop and remove containers
      if (composeConfig.services) {
        for (const [name] of Object.entries(composeConfig.services)) {
          const containerName = `${projectName}_${name}`;
          const containers = await docker.listContainers({ all: true, filters: { name: [containerName] } });
          
          if (containers.length > 0) {
            const container = docker.getContainer(containers[0].Id);
            await container.stop();
            await container.remove();
          }
        }
      }
      
      // Remove networks
      if (composeConfig.networks) {
        for (const [name] of Object.entries(composeConfig.networks)) {
          const networkName = `${projectName}_${name}`;
          const networks = await docker.listNetworks({ filters: { name: [networkName] } });
          
          if (networks.length > 0) {
            const network = docker.getNetwork(networks[0].Id);
            await network.remove();
          }
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error running compose ${action} for ${composeFile}:`, error);
    throw error;
  }
};

/**
 * Get system information
 * @returns {Promise<Object>} - System information
 */
const getSystemInfo = async () => {
  try {
    const info = await docker.info();
    return info;
  } catch (error) {
    console.error('Error getting system info:', error);
    throw error;
  }
};

/**
 * Get Docker version
 * @returns {Promise<Object>} - Docker version
 */
const getVersion = async () => {
  try {
    const version = await docker.version();
    return version;
  } catch (error) {
    console.error('Error getting Docker version:', error);
    throw error;
  }
};

/**
 * Get system-wide resource usage
 * @returns {Promise<Object>} - Resource usage
 */
const getResourceUsage = async () => {
  try {
    // Get all running containers
    const containers = await docker.listContainers();
    
    // Get stats for each container
    const containerStats = await Promise.all(
      containers.map(async (container) => {
        const stats = await getContainerStats(container.Id);
        return {
          id: container.Id,
          name: container.Names[0].replace(/^\//, ''),
          stats
        };
      })
    );
    
    // Calculate total CPU and memory usage
    let totalCpuUsage = 0;
    let totalMemoryUsage = 0;
    
    containerStats.forEach((container) => {
      // Calculate CPU usage percentage
      const cpuDelta = container.stats.cpu_stats.cpu_usage.total_usage - container.stats.precpu_stats.cpu_usage.total_usage;
      const systemCpuDelta = container.stats.cpu_stats.system_cpu_usage - container.stats.precpu_stats.system_cpu_usage;
      const cpuCount = container.stats.cpu_stats.online_cpus || container.stats.cpu_stats.cpu_usage.percpu_usage.length;
      const cpuUsage = (cpuDelta / systemCpuDelta) * cpuCount * 100;
      
      // Calculate memory usage
      const memoryUsage = container.stats.memory_stats.usage / container.stats.memory_stats.limit * 100;
      
      totalCpuUsage += cpuUsage;
      totalMemoryUsage += memoryUsage;
      
      // Add calculated values to container stats
      container.cpuUsage = cpuUsage;
      container.memoryUsage = memoryUsage;
    });
    
    // Get system info
    const info = await getSystemInfo();
    
    return {
      containers: containerStats,
      totalContainers: containers.length,
      totalCpuUsage,
      totalMemoryUsage,
      systemInfo: info
    };
  } catch (error) {
    console.error('Error getting resource usage:', error);
    throw error;
  }
};

module.exports = {
  getContainers,
  getContainer,
  getContainerStats,
  startContainer,
  stopContainer,
  restartContainer,
  removeContainer,
  getContainerLogs,
  createContainer,
  getNetworks,
  getNetwork,
  createNetwork,
  removeNetwork,
  connectNetwork,
  disconnectNetwork,
  getImages,
  getImage,
  pullImage,
  removeImage,
  buildImage,
  runCompose,
  getSystemInfo,
  getVersion,
  getResourceUsage
};
