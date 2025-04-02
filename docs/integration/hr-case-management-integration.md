# Integrating CaseWrite with HR Case Management Software

This document provides a comprehensive guide on how to integrate the CaseWrite document processing and template management system with the HR Case Management Software.

## Overview

CaseWrite is designed to work both as a standalone product and as an integrated component of the HR Case Management Software. The integration allows for seamless document processing, template management, and AI-powered analysis within the HR case management workflow.

## Integration Methods

There are three primary methods for integrating CaseWrite with the HR Case Management Software:

1. **API Integration**: Using the CaseWrite API endpoints to interact with the system programmatically
2. **Module Integration**: Embedding CaseWrite as a module within the HR Case Management Software
3. **Shared Database**: Using a shared database for seamless data access between the two systems

## Prerequisites

Before integrating CaseWrite with the HR Case Management Software, ensure you have:

1. CaseWrite installed and running
2. HR Case Management Software installed and running
3. API keys and credentials for both systems
4. Network connectivity between the two systems

## API Integration

### Configuration

1. Set the following environment variables in the CaseWrite `.env` file:

```
HR_CASE_MANAGEMENT_API_URL=http://your-hr-case-management-url/api
HR_CASE_MANAGEMENT_API_KEY=your-api-key
INTEGRATION_ENABLED=true
STANDALONE_MODE=false
```

2. Set up the CaseWrite API credentials in the HR Case Management Software:

```
CASEWRITE_API_URL=http://your-casewrite-url/api
CASEWRITE_API_KEY=your-api-key
```

### API Endpoints

#### Document Processing

To process a document and integrate it with the HR Case Management Software:

```http
POST /api/integration/documents
Content-Type: application/json

{
  "documentId": "document-uuid",
  "caseFileId": "case-file-uuid" // Optional, if not provided, CaseWrite will determine the case file
}
```

Response:

```json
{
  "message": "Document integrated successfully",
  "result": {
    "success": true,
    "hrCaseManagementDocumentId": "hr-document-uuid",
    "caseFileId": "case-file-uuid"
  }
}
```

#### Template Generation

To generate a document from a template and integrate it with the HR Case Management Software:

```http
POST /api/integration/templates
Content-Type: application/json

{
  "templateId": "template-uuid",
  "caseFileId": "case-file-uuid",
  "additionalData": {
    // Optional additional data for template
  }
}
```

Response:

```json
{
  "message": "Template document integrated successfully",
  "result": {
    "success": true,
    "hrCaseManagementDocumentId": "hr-document-uuid",
    "caseFileId": "case-file-uuid",
    "followUpCreated": true
  }
}
```

#### Case File Data

To get case file data from the HR Case Management Software:

```http
GET /api/integration/casefiles/:id
```

Response:

```json
{
  "caseFile": {
    "id": "case-file-uuid",
    "caseNumber": "CASE-12345",
    "clientName": "John Doe",
    "clientEmail": "john.doe@example.com",
    "clientPhone": "123-456-7890",
    "caseManager": "Sarah Johnson",
    "status": "active",
    "caseType": "Leave Request",
    "notes": "Case notes here",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}
```

#### Notifications

To send a notification to the HR Case Management Software:

```http
POST /api/integration/notifications
Content-Type: application/json

{
  "caseFileId": "case-file-uuid",
  "type": "DOCUMENT_PROCESSED",
  "details": {
    "documentId": "document-uuid",
    "documentType": "Medical Report",
    "summary": "Document summary here"
  }
}
```

Response:

```json
{
  "message": "Notification sent successfully",
  "result": {
    "success": true,
    "notificationId": "notification-uuid"
  }
}
```

## Module Integration

For tighter integration, CaseWrite can be embedded as a module within the HR Case Management Software:

1. **Frontend Integration**: Embed the CaseWrite frontend components in the HR Case Management Software UI
2. **Backend Integration**: Deploy the CaseWrite services alongside the HR Case Management Software services
3. **Authentication Integration**: Use the HR Case Management Software's authentication system for CaseWrite

### Frontend Integration

The CaseWrite frontend components can be integrated into the HR Case Management Software UI:

```javascript
// Import CaseWrite components
import { DocumentUploader, TemplateSelector } from 'casewrite-components';

// Use CaseWrite components in HR Case Management Software UI
function CaseFileDocumentsTab({ caseFileId }) {
  return (
    <div>
      <h2>Documents</h2>
      <DocumentUploader caseFileId={caseFileId} />
      <h2>Templates</h2>
      <TemplateSelector caseFileId={caseFileId} />
    </div>
  );
}
```

### Backend Integration

The CaseWrite services can be deployed alongside the HR Case Management Software services:

```javascript
// Import CaseWrite services
const caseWriteServices = require('casewrite-services');

// Initialize CaseWrite services
caseWriteServices.initialize({
  hrCaseManagementApiUrl: 'http://localhost:4000/api',
  hrCaseManagementApiKey: 'your-api-key',
  integrationEnabled: true,
  standaloneMode: false
});

// Use CaseWrite services in HR Case Management Software
app.use('/api/documents', caseWriteServices.documentRoutes);
app.use('/api/templates', caseWriteServices.templateRoutes);
app.use('/api/ai', caseWriteServices.aiRoutes);
```

## Shared Database

For the most seamless integration, CaseWrite and the HR Case Management Software can share a database:

1. Configure both systems to use the same database:

```
# CaseWrite .env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hr_case_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# HR Case Management Software .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_case_management
DB_USER=postgres
DB_PASSWORD=postgres
```

2. Ensure the database schema is compatible with both systems

## Authentication and Authorization

### OAuth Integration

CaseWrite can use the HR Case Management Software's OAuth server for authentication:

1. Configure CaseWrite to use OAuth:

```
# CaseWrite .env
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_TOKEN_URL=https://hr-case-management.example.com/oauth/token
OAUTH_AUTHORIZATION_URL=https://hr-case-management.example.com/oauth/authorize
OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

2. Implement the OAuth flow in CaseWrite:

```javascript
// CaseWrite authentication routes
router.get('/auth/login', (req, res) => {
  const authUrl = `${process.env.OAUTH_AUTHORIZATION_URL}?client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${process.env.OAUTH_CALLBACK_URL}&response_type=code`;
  res.redirect(authUrl);
});

router.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  // Exchange code for token
  const tokenResponse = await axios.post(process.env.OAUTH_TOKEN_URL, {
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    code,
    redirect_uri: process.env.OAUTH_CALLBACK_URL,
    grant_type: 'authorization_code'
  });
  
  // Store token in session
  req.session.token = tokenResponse.data.access_token;
  
  res.redirect('/');
});
```

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Ensure the API URLs are correct
   - Verify API keys are valid
   - Check network connectivity between the systems

2. **Authentication Issues**:
   - Verify OAuth configuration
   - Check token expiration
   - Ensure proper authorization headers

3. **Data Synchronization Issues**:
   - Check database connection settings
   - Verify data models are compatible
   - Ensure proper error handling for data conflicts

### Logging

Enable detailed logging for troubleshooting:

```
# CaseWrite .env
LOG_LEVEL=debug
```

### Health Check

Use the health check endpoint to verify the integration status:

```http
GET /api/integration/health
```

Response:

```json
{
  "status": "connected",
  "hrCaseManagementStatus": "ok",
  "timestamp": "2025-03-29T15:30:00.000Z"
}
```

## Conclusion

By following this integration guide, you can seamlessly connect CaseWrite with the HR Case Management Software, enabling powerful document processing, template management, and AI-powered analysis capabilities within your HR case management workflow.
