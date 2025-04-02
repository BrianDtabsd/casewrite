/**
 * Integration Routes
 * API routes for HR Case Management integration
 */

const express = require('express');
const router = express.Router();
const integrationService = require('./service');

/**
 * @route   GET /api/integration/health
 * @desc    Get integration health status
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await integrationService.getHealthStatus();
    res.json(healthStatus);
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
 * @route   POST /api/integration/documents
 * @desc    Process a document and integrate it with HR Case Management
 * @access  Private
 */
router.post('/documents', async (req, res) => {
  try {
    const { documentId, caseFileId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await integrationService.processDocument(documentId, caseFileId);
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
 * @route   POST /api/integration/templates
 * @desc    Generate a document from a template and integrate it with HR Case Management
 * @access  Private
 */
router.post('/templates', async (req, res) => {
  try {
    const { templateId, caseFileId, additionalData } = req.body;

    if (!templateId) {
      return res.status(400).json({
        error: {
          message: 'Template ID is required',
          status: 400
        }
      });
    }

    if (!caseFileId) {
      return res.status(400).json({
        error: {
          message: 'Case file ID is required',
          status: 400
        }
      });
    }

    const result = await integrationService.generateTemplateDocument(templateId, caseFileId, additionalData);
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
 * @route   GET /api/integration/casefiles/:id
 * @desc    Get case file data from HR Case Management
 * @access  Private
 */
router.get('/casefiles/:id', async (req, res) => {
  try {
    const caseFileId = req.params.id;

    if (!caseFileId) {
      return res.status(400).json({
        error: {
          message: 'Case file ID is required',
          status: 400
        }
      });
    }

    const caseFileData = await integrationService.getCaseFileData(caseFileId);
    res.json(caseFileData);
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
 * @route   POST /api/integration/notifications
 * @desc    Send a notification to HR Case Management
 * @access  Private
 */
router.post('/notifications', async (req, res) => {
  try {
    const { caseFileId, type, details } = req.body;

    if (!caseFileId) {
      return res.status(400).json({
        error: {
          message: 'Case file ID is required',
          status: 400
        }
      });
    }

    if (!type) {
      return res.status(400).json({
        error: {
          message: 'Notification type is required',
          status: 400
        }
      });
    }

    const result = await integrationService.sendNotification(caseFileId, type, details);
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
 * Middleware to check if integration is enabled
 */
function checkIntegrationEnabled(req, res, next) {
  if (!integrationService.isEnabled()) {
    return res.status(403).json({
      error: {
        message: 'Integration is not enabled',
        status: 403
      }
    });
  }
  next();
}

// Apply middleware to all routes except health check
router.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return checkIntegrationEnabled(req, res, next);
});

module.exports = router;
