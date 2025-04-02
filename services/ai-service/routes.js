/**
 * AI Service Routes
 * API routes for AI-powered document processing, analysis, and generation
 */

const express = require('express');
const router = express.Router();
const aiService = require('./service');

/**
 * Middleware to check if AI service is configured
 */
function checkAiServiceConfigured(req, res, next) {
  if (!aiService.isConfigured()) {
    return res.status(503).json({
      error: {
        message: 'AI service is not properly configured',
        status: 503
      }
    });
  }
  next();
}

/**
 * @route   GET /api/ai/status
 * @desc    Get AI service status
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const status = await aiService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/ai/models
 * @desc    Get available AI models
 * @access  Public
 */
router.get('/models', checkAiServiceConfigured, async (req, res) => {
  try {
    const models = await aiService.getModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/ai/generate-document
 * @desc    Generate a document using AI
 * @access  Private
 */
router.post('/generate-document', checkAiServiceConfigured, async (req, res) => {
  try {
    const { templateId, documentType, context } = req.body;

    if (!documentType) {
      return res.status(400).json({
        error: {
          message: 'Document type is required',
          status: 400
        }
      });
    }

    if (!context || typeof context !== 'object') {
      return res.status(400).json({
        error: {
          message: 'Context data is required and must be an object',
          status: 400
        }
      });
    }

    const result = await aiService.generateDocument({
      templateId,
      documentType,
      context
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/ai/analyze-text
 * @desc    Analyze text using AI
 * @access  Private
 */
router.post('/analyze-text', checkAiServiceConfigured, async (req, res) => {
  try {
    const { text, analysisType } = req.body;

    if (!text) {
      return res.status(400).json({
        error: {
          message: 'Text is required',
          status: 400
        }
      });
    }

    if (!analysisType) {
      return res.status(400).json({
        error: {
          message: 'Analysis type is required',
          status: 400
        }
      });
    }

    const result = await aiService.analyzeText({
      text,
      analysisType
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/ai/extract-information
 * @desc    Extract information from a document
 * @access  Private
 */
router.post('/extract-information', checkAiServiceConfigured, async (req, res) => {
  try {
    const { documentId, fields, documentContent } = req.body;

    if (!documentId && !documentContent) {
      return res.status(400).json({
        error: {
          message: 'Either documentId or documentContent is required',
          status: 400
        }
      });
    }

    const result = await aiService.extractInformation({
      documentId,
      fields,
      documentContent
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/ai/summarize-document
 * @desc    Summarize a document
 * @access  Private
 */
router.post('/summarize-document', checkAiServiceConfigured, async (req, res) => {
  try {
    const { documentId, maxLength, documentContent } = req.body;

    if (!documentId && !documentContent) {
      return res.status(400).json({
        error: {
          message: 'Either documentId or documentContent is required',
          status: 400
        }
      });
    }

    const result = await aiService.summarizeDocument({
      documentId,
      maxLength,
      documentContent
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/ai/generate-response
 * @desc    Generate a response to a query
 * @access  Private
 */
router.post('/generate-response', checkAiServiceConfigured, async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({
        error: {
          message: 'Query is required',
          status: 400
        }
      });
    }

    const result = await aiService.generateResponse({
      query,
      context
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/ai/classify-document
 * @desc    Classify a document
 * @access  Private
 */
router.post('/classify-document', checkAiServiceConfigured, async (req, res) => {
  try {
    const { documentId, categories, documentContent } = req.body;

    if (!documentId && !documentContent) {
      return res.status(400).json({
        error: {
          message: 'Either documentId or documentContent is required',
          status: 400
        }
      });
    }

    const result = await aiService.classifyDocument({
      documentId,
      categories,
      documentContent
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

module.exports = router;
