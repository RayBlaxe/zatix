# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZaTix is a Next.js 15.2.4 event management and ticketing platform built with React 19, TypeScript, and Tailwind CSS. It features comprehensive authentication, event creation/management, and a dashboard system for event organizers with content management capabilities.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build  
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests
npm test
```

Note: Multiple package managers are supported (npm, bun) - use the appropriate lockfile present.

## Architecture Overview

### App Router Structure
- **App Router** (Next.js 13+) with TypeScript
- **Protected routes** via `protected-route.tsx` wrapper
- **Authentication system** with login/register/OTP verification
- **Dashboard** with collapsible sidebar navigation for event organizers
- **Content management** system for home, pricing, and articles
- **Event creation wizard** for guided event setup
- **Terms & Conditions system** with acceptance workflow for event creation

### File Structure
```
/app/
├── dashboard/
│   ├── content/
│   │   ├── articles/          # Article management with create functionality
│   │   ├── home/              # Home page content management
│   │   └── pricing/           # Pricing page management
│   ├── demo/                  # Demo page
│   ├── events/                # Event management with creation
│   ├── finance/               # Financial management
│   ├── roles/                 # Role and permissions management
│   ├── tnc/                   # Terms & Conditions management (Super Admin)
│   ├── layout.tsx             # Dashboard layout with sidebar
│   └── page.tsx               # Dashboard home
├── eo-registration/           # Event organizer registration
├── forgot-password/           # Password reset
├── login/                     # User authentication
├── register/                  # User registration
├── terms-and-conditions/      # Terms and conditions
├── verify-otp/                # OTP verification
├── wizard/                    # Event creation wizard
├── layout.tsx                 # Root layout
└── page.tsx                   # Landing page

/components/
├── dashboard/
│   ├── sidebar.tsx            # Collapsible dashboard sidebar
│   └── tnc-management.tsx     # TNC management component for Super Admin
├── content/                   # Content management components
│   ├── carousel-manager.tsx
│   ├── event-categories-manager.tsx
│   └── featured-events-manager.tsx
├── ui/                        # shadcn/ui components (50+ components)
├── header.tsx                 # Main header component
├── protected-route.tsx        # Route protection wrapper
├── theme-provider.tsx         # Theme context provider
├── tnc-acceptance-modal.tsx   # TNC acceptance modal for EO owners
└── user-account-nav.tsx       # User account navigation

/hooks/
├── use-auth.tsx               # Authentication state management
├── use-mobile.tsx             # Mobile device detection
└── use-toast.ts               # Toast notifications

/lib/
├── api.ts                     # API client with mock responses
└── utils.ts                   # Utility functions

/types/
├── api/                       # API type definitions
├── auth/                      # Authentication types
├── api.ts                     # General API types
└── terms.ts                   # Terms and conditions types (TNC system)

/styles/
└── globals.css                # Global styles with CSS variables
```

### Technology Stack
- **UI Components**: shadcn/ui built on Radix UI (50+ components)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **State**: React hooks and context patterns
- **Testing**: Jest with React Testing Library
- **Mobile**: Responsive design with mobile-first approach

## API Integration

- **Base URL**: `http://api.zatix.id/api` (configurable via `NEXT_PUBLIC_API_URL`)
- **Authentication**: Bearer token stored in localStorage
- **Mock responses**: Automatic fallback in development when API unavailable
- **Error handling**: Typed API responses with proper error states

## Build Configuration

- **Next.js config**: TypeScript/ESLint build errors disabled (`next.config.mjs`)
- **Image optimization**: Disabled (`unoptimized: true`)
- **Turbopack**: Enabled in development for faster builds
- **Path aliases**: `@/` maps to project root
- **Testing**: Jest configuration with setup files

## Authentication Flow

The app uses a complete authentication system:
1. Login/Register with email validation
2. OTP verification via email
3. Password reset functionality
4. Role-based access (customer/event organizer)
5. Protected route wrapper for authenticated pages
6. Event organizer registration flow

## Dashboard Features

- **Responsive sidebar**: Collapsible navigation with content management
- **Event management**: Full CRUD operations for events with TNC acceptance workflow
- **Content management**: Home page, pricing, and articles management
- **Finance tracking**: Revenue and transaction management
- **Role management**: User permissions and access control
- **Terms & Conditions management**: Super Admin TNC creation and management
- **Demo functionality**: Preview and testing capabilities

## Terms & Conditions System

The platform implements a comprehensive TNC system with role-based access:

### Super Admin Features
- **TNC Management Dashboard** (`/dashboard/tnc`): View, create, edit, and delete TNC items
- **TNC Types**: Support for "event" and "general" TNC categories
- **API Endpoints**: 
  - `GET /tnc` - Retrieve all TNC items with authentication

### Event Organizer Features
- **Pre-Event Creation TNC**: Modal popup requiring acceptance before event creation
- **TNC Acceptance Workflow**: 
  1. EO Owner clicks "Create Event"
  2. System checks if TNC has been accepted
  3. If not accepted, shows TNC modal with full content
  4. EO Owner must check acceptance checkbox
  5. System records acceptance via API
  6. Event creation form becomes available
- **API Endpoints**:
  - `GET /tnc-events` - Get event-specific TNC with acceptance status
  - `POST /tnc-events/accept` - Record TNC acceptance

### Implementation Details
- **TNC Types**: `TNCItem`, `TNCListResponse`, `TNCEventResponse`, `TNCAcceptResponse`
- **API Integration**: Full mock responses for development environment
- **Components**:
  - `TNCAcceptanceModal`: Modal for EO owner TNC acceptance
  - `TNCManagement`: Super Admin dashboard component
- **Authentication**: Bearer token authentication for all TNC endpoints
- **State Management**: React hooks for TNC acceptance status tracking

## Development Notes

- **Testing framework**: Jest with React Testing Library configured
- **Mock API responses**: Handle development when backend unavailable
- **Multiple build targets**: Support for different deployment environments
- **Accessibility-first**: Components via Radix UI foundation
- **Responsive design**: Mobile-first Tailwind approach with breakpoints
- **Content management**: Expandable sidebar sections for organized navigation

## Component Patterns

Use existing patterns when adding new features:
- Follow shadcn/ui component structure in `/components/ui/`
- Use React Hook Form + Zod for form validation
- Implement proper TypeScript typing with `/types/` definitions
- Follow authentication patterns from existing auth pages
- Use dashboard layout patterns for new admin features
- Implement responsive design with mobile-first approach
- Use collapsible components for complex navigation structures

## 🚨 MANDATORY PRE-WORK CHECKLIST

**CRITICAL: Claude MUST follow this checklist before starting ANY task:**

### 1. **Documentation Reading Phase**
- [ ] Read CLAUDE.md (this file) completely
- [ ] Read FEATURES.md to understand current feature implementation status
- [ ] Read ROADMAP.md to understand planned features and priorities
- [ ] Read DEVELOPMENT-WORKFLOW.md for process guidelines

### 2. **Codebase Understanding Phase**
- [ ] Identify relevant files/components mentioned in the task
- [ ] Check existing implementations for similar features
- [ ] Understand current architecture patterns in the affected areas
- [ ] Verify dependencies and integration points

### 3. **Planning Phase**
- [ ] Update TodoWrite with findings from documentation review
- [ ] Plan approach based on existing patterns and architecture
- [ ] Identify potential conflicts with existing features
- [ ] Define success criteria and testing approach

### 4. **Implementation Phase**
- [ ] Follow established patterns from existing code
- [ ] Maintain consistency with current architecture
- [ ] Update relevant documentation files after completion
- [ ] Run linting and type checking before considering task complete

### 5. **Documentation Update Phase**
- [ ] Update FEATURES.md with new/modified features
- [ ] Update ROADMAP.md if priorities changed
- [ ] Update CLAUDE.md if new patterns were established
- [ ] Commit changes with proper documentation

## Workflow Enforcement

**Every response must start with:** "Let me first check the current documentation to understand the project state..."

**Before making ANY code changes, Claude must:**
1. Reference specific sections from the documentation
2. Explain how the planned changes align with existing architecture
3. Identify which features are affected and their current status
4. Plan the implementation approach based on documented patterns

**After completing ANY task, Claude must:**
1. Update the appropriate documentation files
2. Verify the changes align with the established patterns
3. Update the TodoWrite status to reflect completion
4. Confirm all documentation is current and accurate

This ensures continuity and prevents duplicate work or architectural inconsistencies.