# Aghosh Orphan Care Home - Donation & Management App

## Overview

This is a full-stack web application for Aghosh Orphan Care Home under Minhaj Welfare Foundation. The platform enables transparent donations for orphaned children, supporting categories like healthcare, education, food, clothing, and general needs. The app reflects humanitarian and Islamic values, featuring an "Assalamu Alaikum" greeting and warm, trustworthy design inspired by Islamic Relief and Charity: Water.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

The frontend follows a page-based structure with reusable components:
- Pages: Home, About, Programs, Donate, Impact, Contact, Admin (Login/Dashboard)
- Layout components: Header (sticky navigation), Footer
- Section components: Hero, Mission, Statistics, Donation Categories, Impact Stories
- Full light/dark theme support via ThemeProvider

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Request Handling**: JSON body parsing with raw body preservation (for webhooks)

Key API routes:
- `/api/donations` - CRUD operations for donations
- `/api/programs` - Program management
- `/api/impact-stories` - Impact story management
- `/api/statistics` - Aggregated statistics
- `/api/admin/*` - Admin authentication and management

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Current Storage**: In-memory storage class (`MemStorage`) with interface for database migration
- **Database Config**: Drizzle Kit configured for PostgreSQL via `DATABASE_URL`

Core entities:
- Users (admin authentication)
- Donations (donor info, amount, category, payment method)
- Programs (orphan care initiatives)
- Impact Stories (success stories for donor engagement)

### Build System
- Development: Vite dev server with HMR, proxied through Express
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: `drizzle-kit push` for schema synchronization

## External Dependencies

### Third-Party Services
- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable)
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### Key NPM Packages
- **UI Framework**: @radix-ui/* components, class-variance-authority, clsx, tailwind-merge
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Data Fetching**: @tanstack/react-query
- **Date Handling**: date-fns
- **Carousel**: embla-carousel-react
- **Charts**: recharts (via shadcn chart component)

### Development Tools
- **TypeScript**: Strict mode enabled with path aliases (@/, @shared/)
- **Bundling**: Vite (frontend), esbuild (backend)
- **Database Tools**: drizzle-kit for migrations
- **Replit Integration**: @replit/vite-plugin-* for development experience

## Recent Changes

### January 2026 - Initial MVP Implementation

**Features Implemented:**
1. **Public Pages**: Home, About, Programs, Donate, Impact, Contact with full responsive design
2. **Donation System**: Category selection (healthcare, education, food, clothing, general), preset amounts, donor info, payment method selection, success confirmation with receipt
3. **Admin Dashboard**: Login system with token-based authentication, donation statistics, category breakdown, recent donations table, add stories/programs functionality
4. **Theme Support**: Light/dark mode toggle with localStorage persistence
5. **Islamic Values**: "Assalamu Alaikum" greeting, Quranic verses, respectful humanitarian tone

**Security Improvements:**
- SHA-256 password hashing for admin credentials
- Per-session token authentication with 1-hour expiry
- Zod validation on all API endpoints including PATCH operations
- Bearer token authorization for protected routes

**Admin Credentials:**
- Username: admin
- Password: admin123

**API Endpoints:**
- GET/POST /api/donations - Public donation submission and retrieval
- GET/POST /api/programs - Program listing and creation (POST requires auth)
- GET/POST /api/impact-stories - Story management
- GET /api/statistics - Aggregated donation statistics
- POST /api/admin/login - Admin authentication (returns session token)
- POST /api/admin/logout - Session invalidation