/**
 * Webhook Routes
 * API routes for handling webhooks from external systems
 */

const express = require('express');
const router = express.Router();
const { processWebhook } = require('../../services/document-service/webhookHandler');

/**
 * Middleware to parse raw body for webhook signature verification
 */
function rawBodyParser(req, res, next) {
  let data = '';
  req.setEncoding('utf8');

  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    req.rawBody = data;
    next();
  });
}

/**
 * @route   POST /api/webhooks/:type
 * @desc    Process webhook from external system
 * @access  Public
 */
router.post('/:type', rawBodyParser, async (req, res) => {
  try {
    // Parse JSON body if content-type is application/json
    if (req.headers['content-type'] === 'application/json') {
      req.body = JSON.parse(req.rawBody);
    }
    
    // Process webhook
    await processWebhook(req, res);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/webhooks/status
 * @desc    Check webhook service status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    message: 'Webhook service is running',
    timestamp: new Date().toISOString(),
    supportedWebhooks: ['email', 'scanner', 'external']
  });
});

/**
 * @route   GET /api/webhooks/docs
 * @desc    Get webhook documentation
 * @access  Public
 */
router.get('/docs', (req, res) => {
  res.json({
    documentation: {
      email: {
        endpoint: '/api/webhooks/email',
        method: 'POST',
        contentType: 'application/json',
        description: 'Webhook for processing email attachments',
        requiredFields: ['sender', 'subject', 'receivedAt', 'emailId', 'attachments'],
        attachmentsFormat: [
          {
            url: 'https://example.com/attachment.pdf',
            filename: 'attachment.pdf',
            contentType: 'application/pdf'
          }
        ],
        security: 'HMAC SHA-256 signature in x-webhook-signature header'
      },
      scanner: {
        endpoint: '/api/webhooks/scanner',
        method: 'POST',
        contentType: 'application/json',
        description: 'Webhook for processing scanned documents',
        requiredFields: ['documentUrl', 'filename', 'scannedBy', 'scannedAt', 'deviceId'],
        security: 'HMAC SHA-256 signature in x-webhook-signature header'
      },
      external: {
        endpoint: '/api/webhooks/external',
        method: 'POST',
        contentType: 'application/json',
        description: 'Webhook for processing documents from external systems',
        requiredFields: ['documentUrl', 'source', 'externalId', 'externalSystem'],
        security: 'HMAC SHA-256 signature in x-webhook-signature header'
      }
    },
    securityDetails: {
      signatureGeneration: 'HMAC SHA-256 of the request body using the webhook secret',
      headerName: 'x-webhook-signature',
      example: 'x-webhook-signature: 5c52d2f26a9aacf73d0bbb7e1b34049477a0b5f1f1bc5b1b9ddc994ce992d8d8'
    }
  });
});

module.exports = router;
