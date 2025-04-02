/**
 * Document Service Routes
 * API routes for document processing, conversion, and management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentService = require('./service');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await documentService.getDocument(documentId);
    res.json(document);
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
 * @route   POST /api/documents/upload
 * @desc    Upload a document
 * @access  Private
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'No file uploaded',
          status: 400
        }
      });
    }

    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    const result = await documentService.uploadDocument(req.file, metadata);
    res.status(201).json(result);
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
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const result = await documentService.deleteDocument(documentId);
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
 * @route   POST /api/documents/parse
 * @desc    Parse a document to extract structured data
 * @access  Private
 */
router.post('/parse', async (req, res) => {
  try {
    const { documentId, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await documentService.parseDocument(documentId, options);
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
 * @route   POST /api/documents/validate
 * @desc    Validate a document against a schema or set of rules
 * @access  Private
 */
router.post('/validate', async (req, res) => {
  try {
    const { documentId, schema } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    if (!schema) {
      return res.status(400).json({
        error: {
          message: 'Validation schema is required',
          status: 400
        }
      });
    }

    const result = await documentService.validateDocument(documentId, schema);
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
 * @route   POST /api/documents/convert
 * @desc    Convert a document to a different format
 * @access  Private
 */
router.post('/convert', async (req, res) => {
  try {
    const { documentId, targetFormat, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    if (!targetFormat) {
      return res.status(400).json({
        error: {
          message: 'Target format is required',
          status: 400
        }
      });
    }

    const result = await documentService.convertDocument(documentId, targetFormat, options);
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
 * @route   POST /api/documents/merge
 * @desc    Merge multiple documents into a single document
 * @access  Private
 */
router.post('/merge', async (req, res) => {
  try {
    const { documentIds, options } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
      return res.status(400).json({
        error: {
          message: 'At least two document IDs are required',
          status: 400
        }
      });
    }

    const result = await documentService.mergeDocuments(documentIds, options);
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
 * @route   POST /api/documents/split
 * @desc    Split a document into multiple documents
 * @access  Private
 */
router.post('/split', async (req, res) => {
  try {
    const { documentId, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await documentService.splitDocument(documentId, options);
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
 * @route   POST /api/documents/extract-text
 * @desc    Extract text from a document
 * @access  Private
 */
router.post('/extract-text', async (req, res) => {
  try {
    const { documentId, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await documentService.extractText(documentId, options);
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
 * @route   POST /api/documents/redact
 * @desc    Redact sensitive information from a document
 * @access  Private
 */
router.post('/redact', async (req, res) => {
  try {
    const { documentId, patterns, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
      return res.status(400).json({
        error: {
          message: 'At least one redaction pattern is required',
          status: 400
        }
      });
    }

    const result = await documentService.redactDocument(documentId, patterns, options);
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
 * @route   POST /api/documents/compare
 * @desc    Compare two documents and highlight differences
 * @access  Private
 */
router.post('/compare', async (req, res) => {
  try {
    const { documentId1, documentId2, options } = req.body;

    if (!documentId1 || !documentId2) {
      return res.status(400).json({
        error: {
          message: 'Both document IDs are required',
          status: 400
        }
      });
    }

    const result = await documentService.compareDocuments(documentId1, documentId2, options);
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
 * @route   POST /api/documents/preview
 * @desc    Generate a document preview
 * @access  Private
 */
router.post('/preview', async (req, res) => {
  try {
    const { documentId, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await documentService.generatePreview(documentId, options);
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
 * @route   POST /api/documents/ocr
 * @desc    Process a document using OCR
 * @access  Private
 */
router.post('/ocr', async (req, res) => {
  try {
    const { documentId, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await documentService.processOcr(documentId, options);
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
 * @route   POST /api/documents/sign
 * @desc    Add a digital signature to a document
 * @access  Private
 */
router.post('/sign', async (req, res) => {
  try {
    const { documentId, signatureData, options } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    if (!signatureData) {
      return res.status(400).json({
        error: {
          message: 'Signature data is required',
          status: 400
        }
      });
    }

    const result = await documentService.signDocument(documentId, signatureData, options);
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
 * @route   POST /api/documents/verify-signature
 * @desc    Verify a document's digital signature
 * @access  Private
 */
router.post('/verify-signature', async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: {
          message: 'Document ID is required',
          status: 400
        }
      });
    }

    const result = await documentService.verifySignature(documentId);
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
