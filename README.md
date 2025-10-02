# ZaTix - Event Management Platform

A modern event management and ticketing platform built with Next.js 15, React 19, and TypeScript.

## ✨ Features

- 🎫 **Event Management**: Create, manage, and publish events with comprehensive wizard
- 👥 **Multi-Role System**: Super Admin, EO Owner, Event PIC, Crew, Finance, Cashier
- 🔐 **Authentication**: Email-based auth with OTP verification
- 📊 **Dashboards**: Role-specific dashboards with analytics
- 💳 **Payment Integration**: Midtrans payment gateway with multiple methods
- 👔 **Staff Management**: Invite and manage event staff with role assignment
- 📄 **CMS**: Content management for homepage, articles, and pricing
- 🎨 **Modern UI**: Tailwind CSS + 50+ shadcn/ui components
- 📱 **Responsive**: Mobile-first design with optimized navigation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure .env.local with your credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **Auth**: Bearer Token (Laravel Sanctum)
- **Payment**: Midtrans
- **Testing**: Jest + React Testing Library

## 🛠️ Available Scripts

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint check
npm test             # Run tests
npm run type-check   # TypeScript validation
```

## 📚 Documentation

For detailed documentation, see:

- **[Complete Project Guide](docs/PROJECT_GUIDE.md)** - Architecture, features, and workflow
- **[Iterations](docs/iterations/)** - Agile sprint tracking and feature completion
- **[Bug Fixes](docs/bugfixes/)** - Resolved issues and diagnostics
- **[Technical Guides](docs/technical/)** - Midtrans, mobile app, and setup guides

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.zatix.id/api
NEXT_PUBLIC_USE_MOCKS=false

# Midtrans Payment Gateway
MIDTRANS_MERCHANT_ID=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

See `.env.example` for complete configuration.

## Tech Stack

### Core
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### UI/Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library built on Radix UI
- **Lucide React** - Icons

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **TypeScript** - Type checking

## Project Structure

```
/app/                 # Next.js App Router pages
├── dashboard/        # Dashboard pages
├── login/           # Authentication pages
└── layout.tsx       # Root layout

/components/         # React components
├── ui/             # shadcn/ui components
├── dashboard/      # Dashboard components
└── header.tsx      # Site header

/hooks/             # Custom React hooks
├── use-auth.tsx    # Authentication hook
└── use-toast.ts    # Toast notifications

/lib/               # Utility libraries
├── api.ts          # API client
└── utils.ts        # Helper functions

/types/             # TypeScript definitions
├── api.ts          # API types
└── auth/           # Authentication types
```

## Development Notes

- The app includes mock API responses for development when the backend is unavailable
- Authentication tokens are stored in localStorage
- The project supports multiple package managers (npm, pnpm, bun)
- Image optimization is enabled for better performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.