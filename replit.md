# MCM Alerts - Notification System

## Overview

MCM Alerts is a full-stack web application for monitoring website uptime and sending real-time notifications. The system provides a comprehensive notification platform with Firebase Cloud Messaging integration, user subscription management, and real-time alerts for various monitoring events.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Structure
The application follows a modern full-stack architecture with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Notifications**: Firebase Cloud Messaging (FCM)
- **UI Framework**: Tailwind CSS with shadcn/ui components

### Directory Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend application
├── shared/          # Shared schema and types
├── attached_assets/ # Static assets
└── migrations/      # Database migrations
```

## Key Components

### Frontend Architecture
- **React Router**: Using `wouter` for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database Access**: Drizzle ORM with PostgreSQL
- **Session Management**: express-session with PostgreSQL store
- **Authentication**: Passport.js with OpenID Connect strategy
- **Real-time Notifications**: Firebase Admin SDK

### Database Schema
The application uses three main tables:
- **sessions**: Session storage (required for Replit Auth)
- **users**: User profiles and authentication data
- **subscriptions**: User notification preferences and FCM tokens
- **notifications**: Notification history and tracking

### Authentication Flow
1. Users authenticate through Replit's OpenID Connect provider
2. Session data is stored in PostgreSQL using connect-pg-simple
3. User profiles are automatically created/updated on login
4. Protected routes verify authentication status

## Data Flow

### Notification System
1. **Subscription Management**: Users can enable/disable notification types and configure delivery preferences
2. **FCM Token Registration**: Frontend requests notification permissions and registers FCM tokens
3. **Notification Delivery**: Server sends notifications via Firebase Cloud Messaging
4. **History Tracking**: All notifications are logged in the database

### API Structure
- **Authentication Routes**: `/api/auth/*` - User authentication and profile management
- **Subscription Routes**: `/api/subscriptions/*` - Notification subscription management
- **Notification Routes**: `/api/notifications/*` - Notification history and triggers

## External Dependencies

### Primary Services
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Firebase**: Cloud Messaging for push notifications
- **Replit Auth**: OpenID Connect authentication provider

### Key Libraries
- **Frontend**: React, TanStack Query, Tailwind CSS, shadcn/ui, Firebase SDK
- **Backend**: Express.js, Drizzle ORM, Passport.js, Firebase Admin SDK
- **Shared**: Zod for schema validation, date-fns for date utilities

### Development Tools
- **Build**: Vite for frontend, esbuild for backend
- **Database**: Drizzle Kit for migrations and schema management
- **TypeScript**: Full TypeScript support across the stack

## Deployment Strategy

### Production Build
- Frontend builds to `dist/public` using Vite
- Backend compiles to `dist/index.js` using esbuild
- Static assets are served from the Express server

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for authentication
- Firebase configuration variables for Cloud Messaging

### Development Setup
- Uses Vite dev server with HMR for frontend development
- Express server runs with tsx for TypeScript execution
- Database schema is managed with Drizzle migrations

The application is designed to run on Replit's platform with specific integrations for their development environment, including error overlays and cartographer plugins for enhanced debugging.