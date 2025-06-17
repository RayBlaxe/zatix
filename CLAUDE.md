# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZaTix is a Next.js 15.2.4 event management and ticketing platform built with React 19, TypeScript, and Tailwind CSS. It features comprehensive authentication, event creation/management, and a dashboard system for event organizers.

## Development Commands

```bash
# Development server with Turbopack
npm run dev
l
# Production build  
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Note: Multiple package managers are supported (npm, pnpm, bun) - use the appropriate lockfile present.

## Architecture Overview

### App Router Structure
- **App Router** (Next.js 13+) with TypeScript
- **Protected routes** via `protected-route.tsx` wrapper
- **Authentication system** with login/register/OTP verification
- **Dashboard** with sidebar navigation for event organizers
- **Event creation wizard** for guided event setup

### Key Directories
- `/app/` - Next.js app router pages and layouts
- `/components/ui/` - shadcn/ui component library (40+ components)
- `/components/dashboard/` - Dashboard-specific components  
- `/lib/api.ts` - API client with mock responses for development
- `/hooks/use-auth.tsx` - Authentication state management
- `/types/` - TypeScript definitions for API and auth

### Technology Stack
- **UI Components**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **State**: React hooks and context patterns

## API Integration

- **Base URL**: `http://192.168.1.69:8000/api/` (configurable via `NEXT_PUBLIC_API_URL`)
- **Authentication**: Bearer token stored in localStorage
- **Mock responses**: Automatic fallback in development when API unavailable
- **Error handling**: Typed API responses with proper error states

## Build Configuration

- **Next.js config**: TypeScript/ESLint build errors disabled (`next.config.mjs`)
- **Image optimization**: Disabled (`unoptimized: true`)
- **Turbopack**: Enabled in development for faster builds
- **Path aliases**: `@/` maps to project root

## Authentication Flow

The app uses a complete authentication system:
1. Login/Register with email validation
2. OTP verification via email
3. Password reset functionality
4. Role-based access (customer/event organizer)
5. Protected route wrapper for authenticated pages

## Development Notes

- **No testing framework** currently configured
- **Mock API responses** handle development when backend unavailable
- **Multiple build targets** supported (can disable Turbopack if needed)
- **Accessibility-first** components via Radix UI foundation
- **Responsive design** with mobile-first Tailwind approach

## Component Patterns

Use existing patterns when adding new features:
- Follow shadcn/ui component structure in `/components/ui/`
- Use React Hook Form + Zod for form validation
- Implement proper TypeScript typing with `/types/` definitions
- Follow authentication patterns from existing auth pages
- Use dashboard layout patterns for new admin features