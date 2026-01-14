Aghosh Orphan Care Home – Donation & Management App
Overview

Aghosh Orphan Care Home is a full-stack web application built for Aghosh Orphan Care Home under Minhaj Welfare Foundation. The platform helps manage donations in a transparent and organized way, making it easy for donors to support orphaned children across essential needs such as healthcare, education, food, clothing, and general welfare.

The application reflects humanitarian and Islamic values, creating a warm and trustworthy experience. Elements like the “Assalamu Alaikum” greeting, Quranic verses, and a calm, respectful design are inspired by platforms such as Islamic Relief and Charity: Water.

The goal is simple: make giving easy, honest, and meaningful.

User Experience & Design

Simple and welcoming interface

Mobile-friendly and fully responsive

Light and dark mode support

Clear donation flow with confirmation

Trust-focused visuals and wording

System Architecture
Frontend Architecture

Framework: React 18 with TypeScript

Routing: Wouter (lightweight and fast)

State Management: TanStack React Query for server data

Styling: Tailwind CSS with theme variables

UI Components: shadcn/ui (built on Radix UI)

Forms & Validation: React Hook Form + Zod

Build Tool: Vite

Frontend Structure

Pages: Home, About, Programs, Donate, Impact, Contact, Admin (Login & Dashboard)

Layout: Sticky header, footer

Sections: Hero, Mission, Statistics, Donation Categories, Impact Stories

Theme: Full light/dark mode using a ThemeProvider

Backend Architecture

Runtime: Node.js with Express

Language: TypeScript (ES Modules)

API Style: RESTful JSON APIs under /api/*

Request Handling: JSON parsing with raw body support (for webhooks)

Core API Routes

/api/donations – Donation creation and listing

/api/programs – Orphan care programs

/api/impact-stories – Success and impact stories

/api/statistics – Donation summaries and totals

/api/admin/* – Admin authentication and protected actions

Data Storage

ORM: Drizzle ORM (PostgreSQL)

Schema: Shared between frontend and backend (shared/schema.ts)

Current Storage: In-memory storage (MemStorage) with easy migration path to PostgreSQL

Database Config: Controlled via DATABASE_URL

Core Data Models

Admins – Secure access to dashboard

Donations – Donor details, amount, category, payment method

Programs – Care initiatives

Impact Stories – Real stories showing donor impact

Build & Deployment

Development: Vite dev server with hot reload, proxied through Express

Production:

Client built to dist/public

Server bundled with esbuild to dist/index.cjs

Database: drizzle-kit push for schema updates

External Dependencies
Services

PostgreSQL – Main database

Session Storage: connect-pg-simple

Key Libraries

UI: Radix UI, shadcn/ui, Tailwind utilities

Forms: react-hook-form, zod

Data Fetching: @tanstack/react-query

Charts: Recharts

Dates: date-fns

Carousel: embla-carousel-react

Developer Tools

TypeScript (strict mode)

Path aliases (@/, @shared/)

Drizzle Kit for migrations

Replit plugins for smoother development

Recent Changes
January 2026 – MVP Release
Features Added

Public Pages – Home, About, Programs, Donate, Impact, Contact

Donation System

Category selection

Preset donation amounts

Donor details form

Payment method selection

Success message with receipt

Admin Dashboard

Secure login

Donation statistics

Category breakdown

Recent donations table

Create programs and impact stories

Theme Support

Light/dark mode

Saved using localStorage

Islamic Values

“Assalamu Alaikum” greeting

Quranic verses

Respectful humanitarian tone

Security Measures

SHA-256 password hashing for admin accounts

Token-based authentication (1-hour expiry)

Zod validation on all API inputs

Bearer token protection for admin routes

Secure session handling

Admin Access (Development Only)

Username: admin

Password: admin123

⚠️ Change credentials before production use

API Summary

GET /api/donations

POST /api/donations

GET /api/programs

POST /api/programs (auth required)

GET /api/impact-stories

POST /api/impact-stories

GET /api/statistics

POST /api/admin/login

POST /api/admin/logout

If you want next, I can:
