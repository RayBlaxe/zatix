# GitHub Copilot Instructions

This file provides guidance for AI coding agents working with the ZaTix event management platform.

## Project Architecture

**Next.js 15 App Router** with React 19, TypeScript, and role-based authentication system.

### Core Authentication Flow
- **Protected Routes**: All dashboard pages use `<ProtectedRoute>` wrapper with role requirements
- **Authentication Hook**: `useAuth()` provides `user`, `hasRole()`, `canAccessDashboard()`, and token management
- **Token Storage**: Bearer tokens in localStorage with expiration handling via `isCurrentTokenExpired()`
- **Role-Based Access**: `requiredRoles` prop on ProtectedRoute, checked in `components/protected-route.tsx`

### Dashboard Architecture Pattern
The dashboard uses a **three-tier role system** with dynamic sidebar navigation:

```tsx
// Dashboard layout pattern in app/dashboard/layout.tsx
<ProtectedRoute requiredRoles={["eo-owner", "super-admin", "event-pic", "crew", "finance", "cashier"]}>
  <DashboardLayout>
    <DashboardSidebar /> {/* Role-based navigation */}
    {children}
  </DashboardLayout>
</ProtectedRoute>
```

**Role Hierarchy & Access Patterns**:
- **Main Roles**: `super-admin` (platform-wide access) → `eo-owner` (organization-level access) → `event-pic` (event-level access)
- **Sub-Roles under Event PIC**: `crew`, `finance`, `cashier` (task-specific limited access)

**Access Control Logic**: `components/dashboard/sidebar.tsx` dynamically generates navigation:
- `super-admin`: All platform features, verification, TNC management, global analytics
- `eo-owner`: Own organization's events, staff management, organization-level finance
- `event-pic`: Assigned events only, event-level staff, event-specific finance
- `crew`/`finance`/`cashier`: Limited task-specific dashboards and assigned event data

## API Integration Patterns

### Mock-First Development
The project uses **environment-controlled mock system** with automatic fallback:

```typescript
// Pattern in lib/api.ts
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false'
if (USE_MOCK_DATA || !response.ok) {
  return mockResponse // Comprehensive mock responses for all endpoints
}
```

**Mock Control Strategy**:
- `NEXT_PUBLIC_USE_MOCKS=false`: Use real API only, fail on errors
- `NEXT_PUBLIC_USE_MOCKS=true` OR undefined: Use mocks as fallback
- Auto-fallback on API errors ensures seamless navigation between pages
- Mock responses cover all project endpoints with realistic role-based data

### API Client Structure
- **Base URL**: `https://api.zatix.id/api` (configurable via `NEXT_PUBLIC_API_URL`)
- **Authentication**: Bearer token from localStorage automatically attached
- **Image URLs**: Use `getEventPosterUrl()` utility for consistent image path handling
- **Token Expiration**: Automatic logout and redirect on expired tokens

## Key Component Patterns

### Form Validation
All forms use **React Hook Form + Zod** validation pattern:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({...})
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
})
```

### UI Components
- **shadcn/ui**: 50+ components in `components/ui/` built on Radix UI
- **Styling**: Tailwind CSS with CSS variables for theming in `styles/globals.css`
- **Icons**: Lucide React throughout the application
- **Mobile Navigation**: Use Sheet components for responsive sidebar navigation
- **Data Tables**: `@tanstack/react-table` with custom column definitions pattern
- **Role-Based Rendering**: Conditional components using `hasRole()` hook
- **Modal Patterns**: Dialog components for CRUD operations (create/edit forms)
- **Loading States**: Consistent skeleton loading patterns across dashboard pages

## Critical Development Workflows

### Development Commands
```bash
bun dev              # Development with Turbopack (preferred)
npm run dev          # Alternative development server
npm run test         # Jest with React Testing Library
npm run type-check   # TypeScript validation
```

### Testing Strategy
- **Location**: `__tests__/` directories alongside components
- **Setup**: Jest configured with Next.js integration in `jest.config.js`
- **Coverage**: Focus on authentication, API integration, and role-based access

## Terms & Conditions System

The platform implements a **modal-based TNC acceptance workflow**:

- **Super Admin**: Full TNC CRUD in `/dashboard/tnc`
- **Event Organizers**: Must accept TNC before event creation via `TNCAcceptanceModal`
- **API Integration**: `GET /tnc-events` and `POST /tnc-events/accept` endpoints
- **State Management**: TNC acceptance status tracked in React hooks

## File Organization Conventions

```
app/                          # Next.js App Router pages
├── dashboard/               # Role-based protected dashboards
│   ├── layout.tsx          # Protected route wrapper + sidebar
│   └── [role-pages]/       # Role-specific functionality
components/
├── dashboard/              # Dashboard-specific components
├── ui/                     # shadcn/ui component library
└── [feature-name].tsx      # Feature-specific components
hooks/                      # Custom React hooks (auth, mobile, toast)
lib/                        # Utilities (API client, utils)
types/                      # TypeScript definitions by feature
```

## Documentation Dependencies

**🚨 MANDATORY PRE-WORK CHECKLIST** - Always follow this sequence:

### 1. **Essential Reading Phase**
- `CLAUDE.md`: **PRIMARY SOURCE** - Complete project context, iteration tracking, architectural decisions
- `FEATURES.md`: Current implementation status by feature area
- `ROADMAP.md`: Development priorities and planned features
- `docs/iterations/`: **CRITICAL** - Detailed completion status of 11 agile iterations

### 2. **Context Verification Phase**
- Check which iteration is currently active/completed
- Verify feature implementation status before adding/modifying
- Understand role-based access patterns for the target feature
- Review existing patterns in similar implemented features

**⚠️ IMPORTANT**: Never implement features without first checking `docs/iterations/` to understand what's already completed and what dependencies exist. The iteration tracking system ensures proper feature sequencing and prevents duplicate work.

## Integration Points

- **Payment**: Midtrans integration in `lib/midtrans.ts`
- **Image Storage**: Laravel backend with `/storage/` public path
- **QR Codes**: Event tickets with QR generation capabilities
- **Mobile Responsive**: Mobile-first Tailwind approach with Sheet components for mobile navigation

When adding features, follow the existing role-based patterns, use the established authentication flow, and maintain the mock-first development approach for API integration.