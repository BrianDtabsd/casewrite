/**
 * AI Service
 * Handles AI-powered document processing, analysis, and generation
 */

const axios = require('axios');
const config = require('../../config');

class AIService {
  constructor() {
    this.provider = config.ai.provider;
    this.openaiConfig = config.ai.openai;
    
    // Initialize OpenAI API client if using OpenAI
    if (this.provider === 'openai') {
      this.openaiClient = axios.create({
        baseURL: 'https://api.openai.com/v1',
        headers: {
          'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Add response interceptor for error handling
    if (this.openaiClient) {
      this.openaiClient.interceptors.response.use(
        response => response,
        error => {
          console.error('AI Provider API Error:', error.message);
          if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
          }
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Check if AI service is properly configured
   * @returns {boolean} True if AI service is configured
   */
  isConfigured() {
    if (this.provider === 'openai') {
      return !!this.openaiConfig.apiKey;
    }
    return false;
  }

  /**
   * Get AI service status
   * @returns {Promise<Object>} Status information
   */
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        status: 'not_configured',
        provider: this.provider,
        message: 'AI service is not properly configured',
        timestamp: new Date().toISOString()
      };
    }

    try {
      if (this.provider === 'openai') {
        // Check OpenAI API status by listing models (lightweight call)
        const response = await this.openaiClient.get('/models');
        return {
          status: 'operational',
          provider: this.provider,
          model: this.openaiConfig.model,
          availableModels: response.data.data.map(model => model.id),
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        status: 'unknown',
        provider: this.provider,
        message: 'Unknown AI provider',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        provider: this.provider,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available AI models
   * @returns {Promise<Object>} Available models
   */
  async getModels() {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    try {
      if (this.provider === 'openai') {
        const response = await this.openaiClient.get('/models');
        return {
          provider: this.provider,
          models: response.data.data.map(model => ({
            id: model.id,
            name: model.id,
            description: model.description || '',
            created: model.created,
            owned_by: model.owned_by
          })),
          currentModel: this.openaiConfig.model
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to get AI models: ${error.message}`);
    }
  }

  /**
   * Generate a document using AI
   * @param {Object} data - Document generation data
   * @param {string} data.templateId - Template ID (optional)
   * @param {string} data.documentType - Type of document to generate
   * @param {Object} data.context - Context data for document generation
   * @returns {Promise<Object>} Generated document
   */
  async generateDocument(data) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    const { templateId, documentType, context } = data;

    if (!documentType) {
      throw new Error('Document type is required');
    }

    try {
      if (this.provider === 'openai') {
        // Prepare system message based on document type and template
        let systemMessage = `You are an expert in creating professional ${documentType} documents.`;
        
        if (templateId) {
          systemMessage += ' Use the specified template structure and formatting.';
        }

        // Prepare user message with context
        const userMessage = `Please generate a ${documentType} document with the following information:\n\n${JSON.stringify(context, null, 2)}`;

        // Call OpenAI API
        const response = await this.openaiClient.post('/chat/completions', {
          model: this.openaiConfig.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: this.openaiConfig.temperature,
          max_tokens: this.openaiConfig.maxTokens
        });

        return {
          content: response.data.choices[0].message.content,
          documentType,
          templateId: templateId || null,
          metadata: {
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to generate document: ${error.message}`);
    }
  }

  /**
   * Analyze text using AI
   * @param {Object} data - Text analysis data
   * @param {string} data.text - Text to analyze
   * @param {string} data.analysisType - Type of analysis to perform
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeText(data) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    const { text, analysisType } = data;

    if (!text) {
      throw new Error('Text is required');
    }

    if (!analysisType) {
      throw new Error('Analysis type is required');
    }

    try {
      if (this.provider === 'openai') {
        // Prepare system message based on analysis type
        const systemMessage = `You are an expert in ${analysisType} analysis.`;
        
        // Prepare user message with text to analyze
        const userMessage = `Please analyze the following text using ${analysisType} analysis:\n\n${text}`;

        // Call OpenAI API
        const response = await this.openaiClient.post('/chat/completions', {
          model: this.openaiConfig.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: this.openaiConfig.temperature,
          max_tokens: this.openaiConfig.maxTokens
        });

        return {
          analysis: response.data.choices[0].message.content,
          analysisType,
          metadata: {
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  }

  /**
   * Extract information from a document
   * @param {Object} data - Information extraction data
   * @param {string} data.documentId - Document ID
   * @param {Array} data.fields - Fields to extract (optional)
   * @param {string} data.documentContent - Document content (if documentId not provided)
   * @returns {Promise<Object>} Extracted information
   */
  async extractInformation(data) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    const { documentId, fields, documentContent } = data;

    if (!documentId && !documentContent) {
      throw new Error('Either documentId or documentContent is required');
    }

    try {
      // For this implementation, we'll assume documentContent is provided
      // In a real implementation, you would fetch the document content using documentId
      const content = documentContent || `[Document content for ID: ${documentId}]`;

      if (this.provider === 'openai') {
        // Prepare system message based on fields to extract
        let systemMessage = 'You are an expert in extracting structured information from documents.';
        
        if (fields && fields.length > 0) {
          systemMessage += ` Extract the following fields: ${fields.join(', ')}.`;
        }

        // Prepare user message with document content
        const userMessage = `Please extract key information from the following document:\n\n${content}`;

        // Call OpenAI API
        const response = await this.openaiClient.post('/chat/completions', {
          model: this.openaiConfig.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3, // Lower temperature for more deterministic extraction
          max_tokens: this.openaiConfig.maxTokens
        });

        return {
          information: response.data.choices[0].message.content,
          documentId: documentId || null,
          fields: fields || [],
          metadata: {
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to extract information: ${error.message}`);
    }
  }

  /**
   * Summarize a document
   * @param {Object} data - Document summarization data
   * @param {string} data.documentId - Document ID
   * @param {number} data.maxLength - Maximum length of summary (optional)
   * @param {string} data.documentContent - Document content (if documentId not provided)
   * @returns {Promise<Object>} Document summary
   */
  async summarizeDocument(data) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    const { documentId, maxLength, documentContent } = data;

    if (!documentId && !documentContent) {
      throw new Error('Either documentId or documentContent is required');
    }

    try {
      // For this implementation, we'll assume documentContent is provided
      // In a real implementation, you would fetch the document content using documentId
      const content = documentContent || `[Document content for ID: ${documentId}]`;

      if (this.provider === 'openai') {
        // Prepare system message based on max length
        let systemMessage = 'You are an expert in summarizing documents concisely while preserving key information.';
        
        if (maxLength) {
          systemMessage += ` Limit the summary to approximately ${maxLength} words.`;
        }

        // Prepare user message with document content
        const userMessage = `Please summarize the following document:\n\n${content}`;

        // Call OpenAI API
        const response = await this.openaiClient.post('/chat/completions', {
          model: this.openaiConfig.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.5,
          max_tokens: this.openaiConfig.maxTokens
        });

        return {
          summary: response.data.choices[0].message.content,
          documentId: documentId || null,
          maxLength: maxLength || null,
          metadata: {
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to summarize document: ${error.message}`);
    }
  }

  /**
   * Generate a response to a query
   * @param {Object} data - Response generation data
   * @param {string} data.query - Query to respond to
   * @param {Object} data.context - Context data for response generation
   * @returns {Promise<Object>} Generated response
   */
  async generateResponse(data) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    const { query, context } = data;

    if (!query) {
      throw new Error('Query is required');
    }

    try {
      if (this.provider === 'openai') {
        // Prepare system message with context
        let systemMessage = 'You are a helpful assistant providing accurate and relevant information.';
        
        if (context) {
          systemMessage += ` Use the following context information: ${JSON.stringify(context, null, 2)}`;
        }

        // Prepare user message with query
        const userMessage = query;

        // Call OpenAI API
        const response = await this.openaiClient.post('/chat/completions', {
          model: this.openaiConfig.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: this.openaiConfig.temperature,
          max_tokens: this.openaiConfig.maxTokens
        });

        return {
          response: response.data.choices[0].message.content,
          query,
          metadata: {
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Classify a document
   * @param {Object} data - Document classification data
   * @param {string} data.documentId - Document ID
   * @param {Array} data.categories - Categories to classify into (optional)
   * @param {string} data.documentContent - Document content (if documentId not provided)
   * @returns {Promise<Object>} Document classification
   */
  async classifyDocument(data) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not properly configured');
    }

    const { documentId, categories, documentContent } = data;

    if (!documentId && !documentContent) {
      throw new Error('Either documentId or documentContent is required');
    }

    try {
      // For this implementation, we'll assume documentContent is provided
      // In a real implementation, you would fetch the document content using documentId
      const content = documentContent || `[Document content for ID: ${documentId}]`;

      if (this.provider === 'openai') {
        // Prepare system message based on categories
        let systemMessage = 'You are an expert in document classification.';
        
        if (categories && categories.length > 0) {
          systemMessage += ` Classify the document into one or more of the following categories: ${categories.join(', ')}.`;
        } else {
          systemMessage += ' Determine the most appropriate categories for the document.';
        }

        // Prepare user message with document content
        const userMessage = `Please classify the following document:\n\n${content}`;

        // Call OpenAI API
        const response = await this.openaiClient.post('/chat/completions', {
          model: this.openaiConfig.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3, // Lower temperature for more deterministic classification
          max_tokens: this.openaiConfig.maxTokens
        });

        return {
          classification: response.data.choices[0].message.content,
          documentId: documentId || null,
          categories: categories || [],
          metadata: {
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Unknown AI provider');
    } catch (error) {
      throw new Error(`Failed to classify document: ${error.message}`);
    }
  }
}

module.exports = new AIService();
