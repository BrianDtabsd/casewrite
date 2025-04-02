# CaseWrite

CaseWrite is an AI-powered document and letter assistant designed to work with case management systems. It can function both as a standalone product and as an integrated component of the HR Case Management Software.

## Features

- Document processing and analysis
- Template management and generation
- AI-powered content creation and summarization
- Integration with case management systems
- Email webhook support
- Multi-user authentication and authorization

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/casewrite.git
cd casewrite
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the `.env.example` template:
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file.

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Project Structure

```
casewrite/
├── docs/                  # Documentation
│   ├── architecture/      # Architecture diagrams and descriptions
│   ├── integration/       # Integration guides
│   └── user-guide/        # User guides and tutorials
├── services/              # Service modules
│   ├── ai-service/        # AI processing service
│   ├── document-service/  # Document handling service
│   └── integration/       # Integration with external systems
├── src/                   # Source code
│   └── api/               # API routes and controllers
├── config.js              # Configuration settings
├── index.js               # Application entry point
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Integration

CaseWrite can be integrated with HR Case Management Software through:

1. **API Integration**: Using the CaseWrite API endpoints
2. **Module Integration**: Embedding CaseWrite as a module
3. **Shared Database**: Using a shared database for seamless data access

For detailed integration instructions, see the [HR Case Management Integration Guide](docs/integration/hr-case-management-integration.md).

## API Documentation

The CaseWrite API provides endpoints for:

- Document processing and analysis
- Template management and generation
- User authentication and authorization
- Integration with case management systems

API documentation is available at `/api/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
