# ZaTix Project Guide

**Complete development guide for the ZaTix event management platform**

*Last Updated: January 2025*

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Development Workflow](#development-workflow)
5. [Feature Status](#feature-status)
6. [API Integration](#api-integration)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Project Overview

**ZaTix** is a Next.js 15.2.4 event management and ticketing platform built with React 19, TypeScript, and Tailwind CSS. It features comprehensive authentication, event creation/management, and a dashboard system for multiple user roles.

### Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **Authentication**: Bearer Token (Laravel Sanctum)
- **API Client**: Custom fetch wrapper
- **Payment**: Midtrans Integration
- **Testing**: Jest + React Testing Library

### Key Features

- 🎫 Event creation and management with wizard
- 👥 Multi-role system (Super Admin, EO Owner, Event PIC, Crew, Finance, Cashier)
- 🔐 Email-based authentication with OTP verification
- 📊 Comprehensive dashboards for each role
- 💳 Midtrans payment integration
- 📱 Fully responsive design
- 🎨 Modern UI with 50+ shadcn/ui components
- 📄 Terms & Conditions acceptance system
- 👔 Event staff management

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zatix

# Install dependencies
npm install  # or: bun install

# Set up environment variables
cp .env.example .env.local

# Configure .env.local with your API URL and credentials

# Start development server
npm run dev  # or: bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run type-check   # Check TypeScript types
```

---

## Architecture

### App Router Structure

```
app/
├── (auth)/                      # Authentication routes
│   ├── login/
│   ├── register/
│   ├── verify-otp/
│   └── forgot-password/
├── dashboard/                   # Protected dashboard routes
│   ├── layout.tsx              # Protected route wrapper + sidebar
│   ├── super-admin/            # Super admin features
│   ├── eo-owner/               # Event organizer owner features
│   ├── event-pic/              # Event PIC features
│   ├── events/                 # Event management
│   ├── content/                # CMS features
│   ├── tnc/                    # Terms & Conditions
│   └── staff/                  # Staff management
├── events/                     # Public event pages
└── page.tsx                    # Homepage
```

### Component Structure

```
components/
├── ui/                         # shadcn/ui components (50+)
├── dashboard/                  # Dashboard-specific components
│   ├── sidebar.tsx            # Role-based navigation
│   ├── event-form.tsx         # Event creation wizard
│   └── staff-management.tsx   # Staff CRUD
├── event/                      # Event display components
├── payment/                    # Payment method components
├── protected-route.tsx         # Auth guard component
└── token-expiration-handler.tsx
```

### Authentication Flow

**Protected Routes**: All dashboard pages use `<ProtectedRoute>` wrapper with role requirements

```tsx
<ProtectedRoute requiredRoles={["eo-owner", "super-admin"]}>
  <DashboardLayout>
    <DashboardSidebar />
    {children}
  </DashboardLayout>
</ProtectedRoute>
```

**Authentication Hook**: `useAuth()` provides:
- `user`: Current user data
- `hasRole()`: Check user roles
- `canAccessDashboard()`: Dashboard access check
- Token management with auto-expiration

**Role Hierarchy**:
- `super-admin`: Platform-wide access
- `eo-owner`: Organization-level access
- `event-pic`: Event-level access
- `crew`/`finance`/`cashier`: Task-specific limited access

### Key Patterns

#### Form Validation (React Hook Form + Zod)

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" }
})
```

#### API Integration with Mock Fallback

```typescript
// lib/api.ts pattern
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false'

if (USE_MOCK_DATA || !response.ok) {
  return mockResponse // Auto-fallback to mocks
}
```

---

## Development Workflow

### 1. Environment Setup

Create `.env.local` with required variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.zatix.id/api
NODE_ENV=development
NEXT_PUBLIC_USE_MOCKS=false

# Midtrans Configuration
MIDTRANS_MERCHANT_ID=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

### 2. Making Changes

**Follow the minimal change principle**:
- Make the smallest possible changes
- Don't delete working code unnecessarily
- Ignore unrelated bugs/tests
- Always validate changes don't break existing behavior

### 3. Testing Workflow

```bash
# Type check
npm run type-check

# Run tests
npm test

# Watch mode for development
npm run test:watch

# Lint code
npm run lint
```

### 4. Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add event staff management"

# Push changes
git push origin main
```

---

## Feature Status

### ✅ Fully Implemented

**Authentication & User Management**
- User registration with role selection
- Email login with bearer token auth
- OTP verification system
- Password reset flow
- Role-based access control
- Token expiration handling
- Event organizer registration

**Dashboard System**
- Super Admin dashboard with verification
- EO Owner dashboard with organization management
- Event PIC dashboard with event access
- Role-based sidebar navigation
- Collapsible sidebar with mobile support

**Event Management**
- Event creation wizard (5 steps)
- Event listing and filtering
- Event detail pages
- Event poster upload
- Category and location management
- Event status management
- Staff assignment system

**Content Management**
- Homepage content management
- Article CRUD operations
- Pricing page management
- Hero section customization

**Terms & Conditions**
- TNC CRUD for super admin
- TNC acceptance modal for EO
- API integration for acceptance tracking

**Payment Integration**
- Midtrans payment gateway
- Multiple payment methods (Credit Card, Bank Transfer, E-Wallet)
- Payment status tracking
- Production/sandbox configuration

**Event Staff Management**
- Staff invitation system
- Role assignment (Event PIC, Crew, Finance, Cashier)
- Staff listing and management
- Email invitation workflow

### 🚧 In Progress

**Ticketing System**
- Ticket type management
- QR code generation
- Ticket purchase flow
- Payment processing

### 📋 Planned

**Advanced Features**
- Event analytics dashboard
- Revenue reporting
- Attendee management
- Check-in system
- Notification system
- Email campaigns

See `docs/iterations/` for detailed iteration tracking.

---

## API Integration

### Base Configuration

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zatix.id/api'

// Authentication header
const token = localStorage.getItem('token')
headers.Authorization = `Bearer ${token}`
```

### Mock-First Development

The project uses environment-controlled mock system:

```typescript
// Control via environment variable
NEXT_PUBLIC_USE_MOCKS=false  // Use real API only, fail on errors
NEXT_PUBLIC_USE_MOCKS=true   // Use mocks as fallback (default)
```

**Mock responses** are comprehensive and cover all endpoints with realistic role-based data.

### Key API Endpoints

**Authentication**
- `POST /register` - User registration
- `POST /verify-otp` - OTP verification
- `POST /login` - User login
- `POST /forgot-password` - Password reset

**Events**
- `GET /events` - List events
- `POST /events` - Create event
- `GET /events/{id}` - Event details
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event

**Staff Management**
- `GET /events/{eventId}/staff` - List event staff
- `POST /events/{eventId}/staff/invite` - Invite staff
- `DELETE /staff/{staffId}` - Remove staff

**TNC**
- `GET /tnc-events` - List TNC
- `POST /tnc-events/accept` - Accept TNC

### Image URLs

Use `getEventPosterUrl()` utility for consistent image path handling:

```typescript
import { getEventPosterUrl } from '@/lib/utils'

const imageUrl = getEventPosterUrl(event.poster_url)
```

---

## Testing

### Test Structure

```
__tests__/
├── components/
│   └── dashboard/
└── app/
    └── login/
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Test Example

```tsx
import { render, screen } from '@testing-library/react'
import { LoginPage } from '@/app/login/page'

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
```

---

## Deployment

### Production Checklist

- [ ] Update environment variables for production
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Configure production API URL
- [ ] Test all payment flows
- [ ] Configure webhook URLs
- [ ] Set up SSL certificate
- [ ] Test authentication flows
- [ ] Verify role-based access
- [ ] Test mobile responsiveness

### Build for Production

```bash
# Build the application
npm run build

# Test production build locally
npm start

# Deploy to hosting platform
# (Vercel, Netlify, or custom server)
```

### Environment Variables

Ensure production environment has all required variables from `.env.example`.

See `docs/technical/MIDTRANS_CONFIG.md` for detailed Midtrans production setup.

---

## Documentation Structure

```
docs/
├── PROJECT_GUIDE.md              # This file - Complete project guide
├── iterations/                   # Agile iteration tracking
│   ├── iteration-02-verification.md
│   ├── iteration-04-events.md
│   ├── iteration-05-ticket-purchase.md
│   └── iteration-homepage-enhancement.md
├── bugfixes/                     # Bug tracking and fixes
│   ├── otp-verification-500-error-diagnostic.md
│   └── registration-flow-fix-2025-01-15.md
├── technical/                    # Technical documentation
│   ├── MIDTRANS_CONFIG.md       # Midtrans setup guide
│   ├── MIDTRANS_QUICK_REF.md    # Quick reference
│   ├── mobile-app-development-prompt.md
│   └── mobile-app-issue-template.md
└── archives/                     # Completed summaries
    ├── HOMEPAGE_UPDATE_SUMMARY.md
    ├── QUICK_FIX_SUMMARY.md
    ├── REGISTRATION_OTP_ANALYSIS.md
    ├── MOBILE_IMPROVEMENTS.md
    └── MIDTRANS_PRODUCTION_CONFIG_SUMMARY.md
```

---

## Support & Resources

### Internal Documentation
- **Iterations**: See `docs/iterations/` for agile sprint tracking
- **Bug Fixes**: See `docs/bugfixes/` for resolved issues
- **Technical Guides**: See `docs/technical/` for setup guides

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Midtrans Documentation](https://docs.midtrans.com)

---

**Project Status**: 🟢 Active Development  
**Version**: 0.1.0  
**Last Major Update**: January 2025 - Event Staff Management System
