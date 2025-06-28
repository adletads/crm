# ClientFlow Pro - CRM Application

## Overview
ClientFlow Pro is a comprehensive Customer Relationship Management (CRM) application built as a full-stack web application. It provides project managers and teams with tools to manage clients, tasks, follow-ups, and business interactions in a centralized dashboard. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: express-session with PostgreSQL store
- **Development**: Hot module replacement via Vite middleware

### Database Schema
The application uses a relational PostgreSQL database with the following core entities:
- **Users**: Authentication and user management
- **Clients**: Customer/client information with status tracking
- **Tasks**: Project tasks with priority levels and due dates
- **Follow-ups**: Scheduled client interactions and reminders
- **Interactions**: Historical communication records
- **CRM Integrations**: External system connections

## Key Components

### Data Layer
- **Drizzle ORM**: Type-safe database operations with schema validation
- **Drizzle Zod**: Automatic schema validation from database definitions
- **Storage Interface**: Abstracted data access layer for CRUD operations
- **Migration System**: Database schema versioning via drizzle-kit

### Authentication & Authorization
- **Session-based Authentication**: Secure user sessions with PostgreSQL storage
- **Role-based Access**: Project Manager role system for user permissions
- **Password Security**: Encrypted password storage

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Component Library**: Consistent UI components with shadcn/ui
- **Dark/Light Theme**: CSS variables-based theming system
- **Accessibility**: ARIA-compliant components from Radix UI
- **Toast Notifications**: User feedback system for actions

### Business Logic
- **Client Management**: Complete client lifecycle from lead to active customer
- **Task Tracking**: Priority-based task management with status updates
- **Follow-up Scheduling**: Automated reminders and interaction tracking
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Search & Filtering**: Dynamic client and task filtering capabilities

## Data Flow

### Client-Server Communication
1. **API Requests**: Frontend makes HTTP requests to Express REST endpoints
2. **Data Validation**: Zod schemas validate incoming request data
3. **Database Operations**: Drizzle ORM handles PostgreSQL interactions
4. **Response Formatting**: Structured JSON responses with error handling
5. **State Management**: TanStack Query caches and synchronizes server state

### Real-time Updates
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Cache Invalidation**: Automatic data refresh after mutations
- **Error Handling**: Graceful degradation with user notification

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitive components
- **Form Validation**: Zod schema validation library
- **Date Handling**: date-fns for date formatting and manipulation
- **Icons**: Lucide React icon library
- **HTTP Client**: Fetch API with custom wrapper functions

### Development Dependencies
- **Build Tools**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint and TypeScript compiler
- **Development Server**: Vite dev server with HMR
- **Replit Integration**: Development banner and cartographer plugins

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express middleware integration
- **Hot Reloading**: Full-stack hot module replacement
- **Database**: Neon development database with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served via Express static middleware
- **Database Migration**: Drizzle kit push for schema updates

### Hosting Considerations
- **Environment**: Node.js runtime with ES module support
- **Database**: PostgreSQL-compatible hosting with connection pooling
- **Static Files**: CDN-ready asset optimization
- **Session Storage**: PostgreSQL-backed session management

## Changelog
- June 28, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.