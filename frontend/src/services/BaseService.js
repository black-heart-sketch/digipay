import axios from 'axios';
import socketService from './socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/v1/api';

/**
 * Base service class with real-time updates via Socket.IO
 */
class BaseService {
  constructor(collectionName, endpoint) {
    this.collectionName = collectionName;
    this.endpoint = endpoint || collectionName;
    this.data = null;
    this.subscribers = new Set();
    this.initializeSocketListeners();
    this.initializeAxiosInterceptor();
  }

  /**
   * Initialize Axios interceptor to attach token
   */
  /**
   * Initialize Axios interceptor to attach token
   */
  initializeAxiosInterceptor() {
    // Create a custom axios instance if not using global
    this.client = axios.create({
      baseURL: API_BASE_URL
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize Socket.IO listeners for this collection
   */
  initializeSocketListeners() {
    socketService.connect();
    
    // Subscribe to collection changes
    socketService.subscribe(this.collectionName);

    // Listen for changes
    socketService.on(this.collectionName, (change) => {
      if (this.data !== null) {
        this.handleChange(change);
        this.notifySubscribers();
      }
    });

    // Handle connection errors
    socketService.on('connect_error', () => {
      console.error(`❌ Socket connection error for ${this.collectionName}`);
    });
  }

  /**
   * Handle database change events
   * @param {Object} change - MongoDB change stream event
   */
  handleChange(change) {
    if (!change) return;

    // Handle array case (list of items)
    if (Array.isArray(this.data)) {
      if (change.operationType === 'insert' && change.fullDocument) {
        this.data = [...this.data, change.fullDocument];
      } else if (change.operationType === 'update' && change.documentKey?._id) {
        const index = this.data.findIndex(
          (item) => item && item._id === change.documentKey._id
        );
        if (index !== -1) {
          const updatedData = [...this.data];
          updatedData[index] = {
            ...updatedData[index],
            ...(change.updateDescription?.updatedFields || {}),
          };
          this.data = updatedData;
        }
      } else if (change.operationType === 'delete' && change.documentKey?._id) {
        this.data = this.data.filter(
          (item) => item && item._id !== change.documentKey._id
        );
      }
    }
    // Handle object case (single item)
    else if (this.data !== null && typeof this.data === 'object') {
      if (change.operationType === 'update') {
        this.data = {
          ...this.data,
          ...(change.updateDescription?.updatedFields || {}),
        };
      } else if (change.operationType === 'insert' || change.operationType === 'delete') {
        this.data = change.fullDocument || null;
      }
    }
    // Initialize as array if not set
    else {
      this.data = change.operationType === 'insert' && change.fullDocument
        ? [change.fullDocument]
        : [];
    }
  }

  /**
   * Subscribe to data changes
   * @param {Function} callback - Callback function to call on data change
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of data changes
   */
  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      callback(this.data);
    });
  }

  /**
   * Get data from API
   * @param {Object} config - Axios config
   * @returns {Promise} Data
   */
  async getData(config = {}, forceRefetch = false) {
    if (this.data !== null && !forceRefetch && (!config.params || Object.keys(config.params).length === 0)) {
      return this.data;
    }

    const response = await this.client.get(`/${this.endpoint}`, config);
    
    // Only update cache if it's a general fetch (no search/filters), 
    // or we might overwrite full list with filtered results.
    // For simplicity in this user's case, we'll update it but ideally we should manage filtered state separately.
    // Given the "Dashboard" vs "Transactions" view contention, strictly updating this.data on every fetch
    // might be why Dashboard sees only what Transactions page fetched or vice versa.
    
    // Better strategy for this specific issue:
    // If filters are present, do NOT update this.data (global cache), just return result.
    if (config.params && Object.keys(config.params).length > 0) {
      return response.data.data || response.data;
    }

    this.data = response.data.data || response.data;
    this.notifySubscribers();
    return this.data;
  }

  /**
   * Get data by ID
   * @param {String} id - Item ID
   * @param {Object} config - Axios config
   * @returns {Promise} Item data
   */
  async getById(id, config = {}) {
    const response = await this.client.get(`/${this.endpoint}/${id}`, config);
    this.data = response.data.data || response.data;
    this.notifySubscribers();
    return this.data;
  }

  /**
   * Create new item
   * @param {Object} data - Item data
   * @param {Object} config - Axios config
   * @returns {Promise} Created item
   */
  async create(data, config = {}) {
    const response = await this.client.post(`/${this.endpoint}`, data, config);
    return response.data.data || response.data;
  }

  /**
   * Update item
   * @param {String} id - Item ID
   * @param {Object} data - Updated data
   * @param {Object} config - Axios config
   * @returns {Promise} Updated item
   */
  async update(id, data, config = {}) {
    const response = await this.client.put(`/${this.endpoint}/${id}`, data, config);
    return response.data.data || response.data;
  }

  /**
   * Delete item
   * @param {String} id - Item ID
   * @param {Object} config - Axios config
   * @returns {Promise} Delete response
   */
  async delete(id, config = {}) {
    const response = await this.client.delete(`/${this.endpoint}/${id}`, config);
    return response.data;
  }

  /**
   * Clear cached data
   */
  clearCache() {
    this.data = null;
    this.notifySubscribers();
  }

  /**
   * Cleanup method to remove socket listeners
   */
  cleanup() {
    socketService.unsubscribe(this.collectionName);
    socketService.removeAllListeners(this.collectionName);
    this.subscribers.clear();
  }
}

export default BaseService;
