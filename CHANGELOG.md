# Changelog

All notable changes to the OBO-Berk project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Thai number-to-text conversion using BAHTTEXT.js for PDF total amount display
- Automatic conversion of numbers to Thai pronunciation (e.g., "1,234.56" → "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบหกสตางค์")

### Changed
- Reorganized documentation into `docs/` directory for better organization
- Updated port configuration to avoid macOS conflicts (5000→5001, 6000→3001)

## [1.0.0] - 2025-10-17

### Added
- Initial release of OBO-Berk expense tracking system
- User registration and management with full CRUD operations
- Project management per user
- Expense tracking with multiple categories (eating, traveling, etc.)
- Receipt file upload and storage functionality
- PDF export with expense tables and embedded receipt images
- Thai language support with THSarabunNew fonts
- Docker containerization (production and development modes)
- MongoDB database integration
- RESTful API endpoints for all operations
- React frontend with TailwindCSS
- Responsive UI design
- File upload with Multer
- PDF generation with PDFKit
- Receipt preview functionality
- Edit capabilities for users, projects, and expenses
- Health check endpoint for monitoring

### Infrastructure
- Docker Compose setup for easy deployment
- Development environment with hot reload
- Nginx configuration for production
- MongoDB with persistent volumes
- Automated startup scripts (start.sh, start.bat)
- Makefile for common operations

### Documentation
- Comprehensive README with setup instructions
- Quick start guide (5-minute setup)
- Docker usage guide
- Production deployment guide
- Testing checklist
- Feature documentation
- Port configuration guide

## Version History

### Port Configuration Changes
- **v1.0.1** (2025-10-17): Changed backend ports from 5000→5001 (internal) and 6000→3001 (external) to avoid macOS AirDrop conflicts and Chrome unsafe port restrictions

### Documentation Updates
- **v1.0.1** (2025-10-17): Consolidated all documentation into `docs/` directory with index

---

## Legend

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security vulnerability fixes
