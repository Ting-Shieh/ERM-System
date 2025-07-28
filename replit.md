# Risk Assessment Application

## Overview
This is a full-stack web application for conducting enterprise risk self-assessments. The application allows users to fill out risk assessment forms with participant information and evaluate various risk categories including strategic and operational risks. Built with React frontend, Express backend, and designed for enterprise use with multilingual support (English/Chinese).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React Hook Form for form handling, TanStack Query for server state
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API**: RESTful endpoints for risk assessment CRUD operations
- **Storage**: In-memory storage (MemStorage) with interface for future database integration

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Defined in shared schema with Zod validation
- **Migration**: Drizzle Kit for schema management
- **Connection**: PostgreSQL database with full persistence

## Key Components

### Data Models
- **Risk Assessments**: Comprehensive entity covering all COSO ERM risk categories
  - **Participant Information**: Email, name, department with validation
  - **Acknowledgement**: Terms and conditions acceptance
  - **Strategic Risks**: Competition risk, market demand change risk
  - **Operational Risks**: Raw material price volatility, material shortage, new product development
  - **Financial Risks**: Credit risk, currency risk, funding cost risk  
  - **Emerging Risks**: Geopolitical conflict, technology cold war, AI transformation, carbon pricing
  - **Rating System**: Impact and likelihood ratings (1-5 scale) for each risk

### Form Handling
- **Participant Form**: Collects basic user information with real-time validation
- **Risk Assessment Form**: Multi-section form for risk evaluation
- **Validation**: Zod schemas for both client and server-side validation

### API Endpoints
- `POST /api/risk-assessments` - Create new assessment
- `GET /api/risk-assessments` - List all assessments
- `GET /api/risk-assessments/:id` - Get specific assessment

### UI Components
- Comprehensive shadcn/ui component library
- Custom forms with React Hook Form integration
- Responsive design with mobile support
- Corporate styling with blue color scheme

## Data Flow
1. User fills participant information form
2. Form validates in real-time, enables risk assessment section
3. User completes risk assessment with impact/likelihood ratings
4. Data validated client-side with Zod schemas
5. POST request sent to backend API
6. Server validates again and stores in memory
7. Success feedback shown to user

## External Dependencies

### Production Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Framework**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority
- **Data Fetching**: TanStack React Query
- **Database**: Drizzle ORM, Neon Database serverless
- **Validation**: Zod for schema validation
- **Utilities**: date-fns, clsx, lucide-react icons

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript setup with strict mode
- **Development**: tsx for running TypeScript in development

## Deployment Strategy

### Development
- Run with `npm run dev` using tsx to execute TypeScript directly
- Vite dev server for frontend with HMR
- Express server serves API and static files

### Production Build
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single production server serves both API and static frontend

### Database Migration
- `npm run db:push` uses Drizzle Kit to sync schema
- PostgreSQL connection configured via DATABASE_URL environment variable
- Current implementation uses in-memory storage as fallback

### Environment Requirements
- Node.js with ES module support
- PostgreSQL database connection via DATABASE_URL environment variable
- Production deployment expects single server setup

## Changelog
- July 01, 2025. Initial setup with complete COSO ERM framework implementation
- All 12 risk assessment categories implemented with bilingual support
- Database integration completed with PostgreSQL and Drizzle ORM
- Full data persistence with proper schema migration and validation
- July 23, 2025. **Major Enhancement**: Comprehensive Risk Management System Implementation
  - Integrated enhanced CSV dataset with 30+ risk management fields
  - Replaced COSO-based empty risk cards with authentic registry-based assessment system
  - Added comprehensive risk response strategies, monitoring indicators, and optimization suggestions
  - Enhanced assessment workflow with existing countermeasures display and historical data context
  - Implemented weighted risk levels and stakeholder information for improved decision-making
- July 24, 2025. **Complete Documentation & Export System**: Full Risk Registry Documentation
  - Generated comprehensive CSV export functionality with all 57 risk assessment cards
  - Created complete Registry-based Risk Assessment Cards documentation (Markdown)
  - Implemented automated risk statistics and categorization analysis
  - Established complete data export pipeline for enterprise risk management review
  - Achieved full documentation coverage: 5 ESG risks, 11 strategic risks, 35 operational risks, 4 financial risks, 2 compliance risks

## User Preferences
Preferred communication style: Simple, everyday language.