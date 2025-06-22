# ZaTix - Event Management Platform

A modern event management and ticketing platform built with Next.js 15, React 19, and TypeScript.

## Features

- 🎫 Event creation and management
- 👤 User authentication with OTP verification
- 📊 Event organizer dashboard
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 📱 Responsive design
- 🔒 Role-based access control

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zatix
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - Check TypeScript types

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://zatix.zamanweb.com/api/
NODE_ENV=development
```

## API Integration

The app connects to the backend API at `https://zatix.zamanweb.com/api/`. 

### Authentication Flow

1. **Registration**: User registers with email/password
2. **OTP Verification**: Email verification via OTP
3. **Login**: Bearer token authentication
4. **Protected Routes**: Automatic token validation

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