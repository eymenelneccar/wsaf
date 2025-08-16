# IQR Control - Business Management System

## Overview

IQR Control is a comprehensive Arabic-language business management system designed for service-oriented businesses. The application provides an integrated solution for managing customers, financial records, employees, and generating reports. Built with a modern full-stack architecture, it features a glass-morphism UI design with gradient themes and supports multi-user access with role-based permissions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for accessible, customizable interface elements
- **Styling**: Tailwind CSS with custom glass-morphism design system and gradient color schemes
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Internationalization**: Right-to-left (RTL) layout support with Arabic font integration (Noto Sans Arabic)

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API development
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express session with PostgreSQL session store for persistent user sessions
- **File Handling**: Multer middleware for file uploads with size and type restrictions
- **API Design**: RESTful API structure with comprehensive error handling and request logging

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Modular schema design with the following core entities:
  - Users table with role-based access control (viewer, editor, admin)
  - Customers table with subscription management and expiry tracking
  - Income entries with categorization (subscriptions, prints, other)
  - Expense entries with reason tracking
  - Employees table with position and salary information
  - Activities table for audit logging
  - Sessions table for authentication persistence

### Development Workflow
- **Build System**: Vite for fast development and optimized production builds
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Development Server**: Hot module replacement with error overlay for enhanced developer experience
- **Build Process**: Separate client and server builds with ESBuild for server-side bundling

### UI/UX Design System
- **Theme**: Dark mode with glass-morphism aesthetic using CSS variables
- **Components**: Reusable component library with consistent styling patterns
- **Gradients**: Custom gradient color system with predefined color combinations
- **Animations**: Smooth transitions and hover effects for enhanced user experience
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Security Implementation
- **Authentication Flow**: OIDC-based authentication with Replit integration
- **Session Security**: HTTP-only cookies with secure flags and configurable TTL
- **Input Validation**: Zod schema validation on both client and server sides
- **File Upload Security**: MIME type validation and file size restrictions
- **Authorization**: Role-based access control with middleware protection

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL with Neon serverless driver for scalable data storage
- **Authentication Provider**: Replit Auth service for user management and SSO
- **File Storage**: Local file system with configurable upload directory

### Development Tools
- **Package Manager**: npm with lock file for reproducible builds
- **Type Checking**: TypeScript compiler with strict configuration
- **Code Formatting**: Built-in formatter with consistent style guidelines

### UI Component Libraries
- **Base Components**: Radix UI for accessible primitives
- **Icon Library**: Lucide React for consistent iconography
- **Date Handling**: date-fns for internationalized date operations
- **Form Validation**: Zod for runtime type validation

### Build and Development
- **Frontend Bundler**: Vite with React plugin for optimized development
- **Backend Runtime**: Node.js with ES modules support
- **Development Enhancers**: Replit-specific plugins for error handling and debugging

### Third-Party Integrations
- **Font Services**: Google Fonts for Arabic typography (Noto Sans Arabic)
- **CSS Framework**: Tailwind CSS with PostCSS for utility-first styling
- **State Management**: TanStack Query for efficient data fetching and caching