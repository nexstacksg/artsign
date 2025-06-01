# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArtSign is a comprehensive custom manufacturing order management system designed to streamline the entire lifecycle of custom signage and printing orders. The platform serves as a centralized hub connecting customers, business owners, and contractors in a seamless workflow.

### Key Objectives
- Automate quotation generation with dynamic pricing calculations
- Enable real-time order tracking and status updates
- Facilitate efficient job assignment and contractor management
- Ensure quality control through systematic approval workflows
- Provide comprehensive financial tracking and reporting
- Support multi-department customer organizations

## Repository Structure

- `app-be/` - Backend API (Express.js + TypeScript + Prisma)
- `app-web/` - Customer e-commerce portal (Next.js)
- `app-admin/` - Administrative dashboard (Next.js)
- `app-mobile/` - Mobile app (React Native/Expo) - Future plan, not for now
- `packages/shared-types/` - Shared TypeScript types for all apps
- `artSign-admin/` - Legacy admin portal (to be migrated)
- `artSign-customer/` - Legacy customer portal (to be migrated)

## Common Development Commands

### Backend (app-be)

```bash
bun run dev              # Start dev server with hot reload
bun run prisma:migrate   # Run database migrations
bun run prisma:studio    # Open Prisma Studio GUI
bun run prisma:seed      # Seed database
bun run build           # Build TypeScript
bun run test            # Run tests
bun run lint            # Run ESLint
bun run format          # Run Prettier
```

### Web Apps (app-web, app-admin)

```bash
bun run dev             # Start Next.js dev server
bun run build           # Build for production
bun run start           # Start production server
bun run lint            # Run Next.js linting
```

### Mobile App (app-mobile)

```bash
bun run start           # Start Expo dev server
bun run android         # Run on Android
bun run ios             # Run on iOS
bun run web             # Run on web browser
bun run lint            # Run Expo linting
```

### Shared Types (packages/shared-types)

```bash
# Types are linked locally using file: protocol
# Import in any app:
import { UserRole, IUser } from '@app/shared-types';
```

## Type Sharing

All TypeScript types, interfaces, and enums are centralized in `packages/shared-types`:

```typescript
// Import shared types in any app
import { IUser, UserRole, ApiResponse } from '@app/shared-types';
```

See [packages/shared-types/README.md](packages/shared-types/README.md) for detailed usage.

## Architecture Notes

### Backend Architecture (app-be)

- RESTful API built with Express.js and TypeScript
- Prisma ORM for database operations
- JWT authentication with role-based access control
- Modular structure: controllers, services, models, middleware
- API versioning (v1) in routes

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server entry point
├── config/             # Configuration files
│   ├── jwt.ts         # JWT configuration
│   └── swagger.ts     # API documentation config
├── controllers/        # Request handlers
│   ├── auth/          # Authentication controllers
│   └── user/          # User management controllers
├── services/           # Business logic layer
│   ├── auth/          # Authentication services
│   └── user/          # User services
├── middleware/         # Express middleware
│   ├── auth/          # Auth middleware (authenticate, authorize)
│   ├── error/         # Error handling
│   └── validation/    # Request validation
│       └── schemas/   # Validation schemas
├── routes/             # API route definitions
│   └── api/
│       └── v1/        # Version 1 API routes
├── database/           # Database related
│   ├── client.ts      # Prisma client
│   └── seed.ts        # Database seeding
└── utils/              # Helper functions
    ├── auth.ts        # Auth utilities
    └── email.ts       # Email utilities
```

### Frontend Architecture (app-web, app-admin)

- Next.js 15+ with App Router
- Server-side rendering and API routes
- Tailwind CSS for styling
- TypeScript for type safety

```
src/
├── app/                # Next.js app directory
│   ├── (auth)/        # Authentication pages
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API client services
│   ├── api.ts         # Base API client
│   └── authService.ts # Auth API calls
└── middleware.ts       # Next.js middleware
```

### Shared Types Architecture (packages/shared-types)

- Centralized TypeScript definitions
- Shared enums, types, and interfaces
- Prisma schema for database models

```
src/
├── index.ts            # Main export file
├── enums/              # Enum definitions
│   └── index.ts       # Role, Status enums
├── models/             # Database models
│   ├── user.ts        # User model
│   └── schema.prisma  # Prisma schema
└── types/              # TypeScript types
    ├── auth.ts        # Authentication types
    ├── common.ts      # Common/shared types
    ├── customer.ts    # Customer types
    ├── order.ts       # Order types
    ├── product.ts     # Product types
    ├── quotation.ts   # Quotation types
    ├── invoice.ts     # Invoice types
    └── refund.ts      # Refund types
```

### Mobile Architecture (app-mobile)

- Expo SDK with React Native
- Tab-based navigation
- Themed components system
- Platform-specific code handling (iOS/Android)

### Key Integration Points

- Authentication: JWT tokens shared between web and mobile
- API: All clients communicate with app-be backend
- Database: PostgreSQL (production), SQLite (development)
- Shared Types: All apps use @app/shared-types for TypeScript definitions

## User Roles and Permissions

### Customer Roles
- **Customer Admin**: Full access to company account
- **Department User**: Limited to department orders
- **Viewer**: Read-only access to orders

### Internal Roles
- **Super Admin (Eric)**: Full system access
- **Admin**: Order and contractor management
- **Finance Admin**: Payment and invoice access
- **Support Agent**: Customer communication

### Contractor Roles
- **Lead Contractor**: Can assign sub-jobs
- **Standard Contractor**: Job execution only

## Core Features

### Quotation System
- Dynamic pricing engine with area/volume-based calculations
- Material and add-on service selection
- Bulk discount automation (30% off at 50+ SQF)
- Admin approval workflow

### Order Management
- Real-time order tracking
- Payment verification workflow
- Job assignment to contractors
- Quality control with completion evidence
- Rework management for complaints

### Financial Management
- Invoice generation and tracking
- Multiple payment methods (Stripe, PayPal)
- Contractor payment processing
- Financial reporting and analytics

## Important Considerations

1. **Migration in Progress**: Currently migrating from artSign-admin and artSign-customer to the new app-admin and app-web structure.

2. **Pricing Engine**: Complex pricing formulas based on dimensions, materials, and add-ons with automatic bulk discounts.

3. **Quality Assurance**: All completed jobs require photographic evidence before payment approval.

4. **Multi-tenant Architecture**: Supports multiple departments within customer organizations.

5. **Real-time Updates**: Uses Socket.io for live order status updates.

## Business Rules

### Pricing Rules
- Base pricing uses per-square-foot or per-cubic-foot calculations
- Bulk discounts apply automatically at 50+ SQF (30% discount)
- Material prices must be updatable without code changes
- All quotations require admin approval before customer viewing

### Order Processing Rules
- Orders require payment verification before job assignment
- Down payments must be minimum 50% of total order value
- Jobs can only be assigned to approved contractors
- Customer complaints trigger mandatory rework process

### Quality Assurance Rules
- All completed jobs require photographic evidence
- Admin must review completion evidence before approving payment
- Rework requests must be completed within 48 hours
- Customer satisfaction verification required for order closure

## Implementation Status

### Completed Features ✅
- User authentication and authorization
- Basic order management
- Quotation system
- Payment integration

### In Progress Features 🔄
- Contractor portal
- Quality control workflows
- Financial reporting
- Real-time updates

### Planned Features 📋
- Performance optimization
- Advanced analytics
- Mobile app development
- AI-powered pricing
- Multi-region deployment
- Enterprise features
- API marketplace
- White-label options

## API Endpoints Structure

The backend API follows RESTful conventions with versioning:
- Base URL: `/api/v1`
- Authentication: Bearer token in Authorization header
- Content-Type: application/json

Key endpoint patterns:
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/*` - User management
- `/api/v1/products/*` - Product catalog
- `/api/v1/orders/*` - Order management
- `/api/v1/quotations/*` - Quotation system
- `/api/v1/invoices/*` - Financial documents
- `/api/v1/contractors/*` - Contractor management
