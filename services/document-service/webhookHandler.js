/**
 * Document Service Webhook Handler
 * Handles incoming webhooks for document processing
 */

const documentService = require('./service');
const crypto = require('crypto');
const config = require('../../config');

/**
 * Verify webhook signature
 * @param {Object} req - Express request object
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if signature is valid
 */
function verifySignature(req, secret) {
  try {
    // Get signature from headers
    const signature = req.headers['x-webhook-signature'];
    
    if (!signature) {
      return false;
    }
    
    // Create HMAC using webhook secret
    const hmac = crypto.createHmac('sha256', secret);
    
    // Update HMAC with request body
    hmac.update(JSON.stringify(req.body));
    
    // Get digest
    const digest = hmac.digest('hex');
    
    // Compare digest with signature
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Handle email webhook
 * @param {Object} data - Webhook data
 * @returns {Promise<Object>} Processing result
 */
async function handleEmailWebhook(data) {
  try {
    // Extract relevant data from email webhook
    const webhookData = {
      source: 'email',
      documentUrl: data.attachments?.[0]?.url,
      documentType: data.attachments?.[0]?.contentType,
      metadata: {
        filename: data.attachments?.[0]?.filename,
        sender: data.sender,
        subject: data.subject,
        receivedAt: data.receivedAt,
        emailId: data.emailId
      }
    };
    
    // Process the document
    return await documentService.processWebhookDocument(webhookData);
  } catch (error) {
    throw new Error(`Failed to handle email webhook: ${error.message}`);
  }
}

/**
 * Handle scanner webhook
 * @param {Object} data - Webhook data
 * @returns {Promise<Object>} Processing result
 */
async function handleScannerWebhook(data) {
  try {
    // Extract relevant data from scanner webhook
    const webhookData = {
      source: 'scanner',
      documentUrl: data.documentUrl,
      documentType: data.documentType || 'application/pdf',
      metadata: {
        filename: data.filename,
        scannedBy: data.scannedBy,
        scannedAt: data.scannedAt,
        deviceId: data.deviceId,
        resolution: data.resolution
      }
    };
    
    // Process the document
    return await documentService.processWebhookDocument(webhookData);
  } catch (error) {
    throw new Error(`Failed to handle scanner webhook: ${error.message}`);
  }
}

/**
 * Handle external system webhook
 * @param {Object} data - Webhook data
 * @returns {Promise<Object>} Processing result
 */
async function handleExternalSystemWebhook(data) {
  try {
    // Extract relevant data from external system webhook
    const webhookData = {
      source: data.source || 'external',
      documentUrl: data.documentUrl,
      documentType: data.documentType,
      metadata: {
        filename: data.filename,
        externalId: data.externalId,
        externalSystem: data.externalSystem,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        additionalData: data.additionalData
      }
    };
    
    // Process the document
    return await documentService.processWebhookDocument(webhookData);
  } catch (error) {
    throw new Error(`Failed to handle external system webhook: ${error.message}`);
  }
}

/**
 * Process webhook request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function processWebhook(req, res) {
  try {
    const webhookType = req.params.type;
    const webhookSecret = config.webhooks?.[webhookType]?.secret;
    
    // Verify webhook signature if secret is configured
    if (webhookSecret && !verifySignature(req, webhookSecret)) {
      return res.status(401).json({
        error: {
          message: 'Invalid webhook signature',
          status: 401
        }
      });
    }
    
    let result;
    
    // Process webhook based on type
    switch (webhookType) {
      case 'email':
        result = await handleEmailWebhook(req.body);
        break;
      case 'scanner':
        result = await handleScannerWebhook(req.body);
        break;
      case 'external':
        result = await handleExternalSystemWebhook(req.body);
        break;
      default:
        return res.status(400).json({
          error: {
            message: `Unsupported webhook type: ${webhookType}`,
            status: 400
          }
        });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
}

module.exports = {
  processWebhook,
  handleEmailWebhook,
  handleScannerWebhook,
  handleExternalSystemWebhook
};
