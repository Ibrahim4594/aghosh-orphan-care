# Aghosh Orphan Care - Donation Management System

A full-stack web application for managing donations to orphaned children. Built with React, Express, TypeScript, and PostgreSQL.

## Features

- Donor registration and authentication
- Admin dashboard for managing programs and impact stories
- Multiple donation categories (health, education, food, clothing, general)
- Stripe payment integration (optional)
- Bank transfer option for donations
- Multi-language support
- Dark/Light theme toggle
- Mobile responsive design

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **Payments**: Stripe (optional)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Local Setup

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run the installer and follow the setup wizard
- Remember your postgres password

**Mac:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE orphanage_connect;

# Exit
\q
```

### 3. Clone and Install Dependencies

```bash
cd Orphanage-Connect
npm install
```

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and update the DATABASE_URL with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/orphanage_connect
```

### 5. Initialize Database Schema

```bash
npm run db:push
```

This will create all the necessary tables and seed the database with initial data.

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5000

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

## Stripe Setup (Optional)

To enable card payments:

1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

For webhook testing locally:
```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

Add the webhook secret to `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── hooks/         # Custom hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── db.ts              # Database connection
│   └── stripeClient.ts    # Stripe integration
├── shared/                 # Shared code
│   └── schema.ts          # Database schema & types
└── migrations/            # Database migrations
```

## API Endpoints

### Public
- `GET /api/programs` - List programs
- `GET /api/impact-stories` - List stories
- `GET /api/statistics` - Get statistics
- `POST /api/donations` - Create donation
- `GET /api/donations` - List donations

### Donor Auth
- `POST /api/donor/signup` - Register donor
- `POST /api/donor/login` - Login donor
- `GET /api/donor/session` - Check session
- `GET /api/donor/donations` - Donation history

### Admin Auth
- `POST /api/admin/login` - Admin login
- `POST /api/programs` - Create program (auth required)
- `POST /api/impact-stories` - Create story (auth required)

### Stripe
- `GET /api/stripe/status` - Check if Stripe is configured
- `POST /api/donate/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Webhook handler

## License

MIT
