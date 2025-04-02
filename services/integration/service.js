/**
 * Integration Service
 * Handles integration with HR Case Management Software
 */

const axios = require('axios');
const config = require('../../config');

class IntegrationService {
  constructor() {
    this.apiUrl = config.integration.hrCaseManagement.apiUrl;
    this.apiKey = config.integration.hrCaseManagement.apiKey;
    this.enabled = config.integration.enabled;
    this.standaloneMode = config.integration.standaloneMode;

    // Initialize axios instance for HR Case Management API
    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      error => {
        console.error('HR Case Management API Error:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if integration is enabled
   * @returns {boolean} True if integration is enabled
   */
  isEnabled() {
    return this.enabled && !this.standaloneMode;
  }

  /**
   * Get health status of the integration
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    if (!this.isEnabled()) {
      return {
        status: 'disabled',
        hrCaseManagementStatus: 'unknown',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await this.apiClient.get('/health');
      return {
        status: 'connected',
        hrCaseManagementStatus: response.data.status || 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        hrCaseManagementStatus: 'unavailable',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process a document and integrate it with HR Case Management
   * @param {string} documentId - Document ID
   * @param {string} caseFileId - Case file ID (optional)
   * @returns {Promise<Object>} Integration result
   */
  async processDocument(documentId, caseFileId = null) {
    if (!this.isEnabled()) {
      throw new Error('Integration is not enabled');
    }

    try {
      const payload = {
        documentId,
        caseFileId
      };

      const response = await this.apiClient.post('/documents', payload);
      
      return {
        message: 'Document integrated successfully',
        result: response.data
      };
    } catch (error) {
      throw new Error(`Failed to integrate document: ${error.message}`);
    }
  }

  /**
   * Generate a document from a template and integrate it with HR Case Management
   * @param {string} templateId - Template ID
   * @param {string} caseFileId - Case file ID
   * @param {Object} additionalData - Additional data for template (optional)
   * @returns {Promise<Object>} Integration result
   */
  async generateTemplateDocument(templateId, caseFileId, additionalData = {}) {
    if (!this.isEnabled()) {
      throw new Error('Integration is not enabled');
    }

    try {
      const payload = {
        templateId,
        caseFileId,
        additionalData
      };

      const response = await this.apiClient.post('/templates', payload);
      
      return {
        message: 'Template document integrated successfully',
        result: response.data
      };
    } catch (error) {
      throw new Error(`Failed to generate template document: ${error.message}`);
    }
  }

  /**
   * Get case file data from HR Case Management
   * @param {string} caseFileId - Case file ID
   * @returns {Promise<Object>} Case file data
   */
  async getCaseFileData(caseFileId) {
    if (!this.isEnabled()) {
      throw new Error('Integration is not enabled');
    }

    try {
      const response = await this.apiClient.get(`/casefiles/${caseFileId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get case file data: ${error.message}`);
    }
  }

  /**
   * Send a notification to HR Case Management
   * @param {string} caseFileId - Case file ID
   * @param {string} type - Notification type
   * @param {Object} details - Notification details
   * @returns {Promise<Object>} Notification result
   */
  async sendNotification(caseFileId, type, details) {
    if (!this.isEnabled()) {
      throw new Error('Integration is not enabled');
    }

    try {
      const payload = {
        caseFileId,
        type,
        details
      };

      const response = await this.apiClient.post('/notifications', payload);
      
      return {
        message: 'Notification sent successfully',
        result: response.data
      };
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }
}

module.exports = new IntegrationService();
