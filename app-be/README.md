# ArtSign Backend API

A comprehensive backend API for the ArtSign custom manufacturing and order management system. Built with Node.js, Express, TypeScript, and Prisma, this API provides complete functionality for managing customers, products, orders, quotations, and invoices in a custom printing and signage business.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification and password reset functionality
  - Role-based access control (SUPER_ADMIN, MANAGER, USER)
  - Secure middleware for route protection

- **Customer Management**
  - Customer profile creation and management
  - Credit limit and payment terms tracking
  - Customer type classification (Individual/Corporate)
  - Sales representative assignment

- **Product Catalog**
  - Comprehensive product management with categories
  - Dynamic pricing models (multi-factor, quantity-based, area-based, custom)
  - Stock tracking and low stock alerts
  - Product specifications and custom options

- **Order Management**
  - End-to-end order lifecycle management
  - Order status tracking and updates
  - Payment status monitoring
  - Shipping and tracking number management
  - Order cancellation and modifications

- **Quotation System**
  - Professional quotation generation
  - Customer approval/rejection workflow
  - Quotation-to-order conversion
  - Validity period management
  - Automated email sending capabilities

- **Invoice Management**
  - Automated invoice generation from orders
  - Payment tracking and overdue management
  - Invoice status management
  - Due date and payment term handling

- **Business Intelligence**
  - Comprehensive analytics and reporting
  - Financial metrics and dashboard data
  - Audit logging for all operations
  - Export capabilities for data analysis

- **Shared Type System**
  - Centralized TypeScript types in shared-types package
  - Type safety across all applications
  - Consistent interfaces for web, admin, and mobile apps

## Tech Stack

- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Validation**: express-validator
- **Types**: Shared types package (@app/shared-types)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- SQLite (included by default)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-be
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="file:./dev.db"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3100

# Email (for future use)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway (for future use)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

4. Generate Prisma client and run migrations:
```bash
bun run prisma:generate
bun run prisma:migrate
```

5. Seed the database (optional):
```bash
bun run prisma:seed
```

6. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:4000`

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/                   # Configuration files
│   ├── jwt.ts               # JWT configuration
│   └── swagger.ts           # Swagger configuration
├── controllers/              # Route controllers
│   ├── auth/                # Authentication controllers
│   ├── customer/            # Customer management
│   ├── invoice/             # Invoice management
│   ├── order/               # Order management
│   ├── product/             # Product management
│   ├── quotation/           # Quotation management
│   └── user/                # User management
├── database/                 # Database configuration
│   ├── client.ts            # Prisma client instance
│   └── seed.ts              # Database seed script
├── middleware/              # Express middleware
│   ├── auth/                # Authentication & authorization
│   ├── error/               # Error handling middleware
│   └── validation/          # Request validation
├── routes/                  # API routes
│   └── api/v1/              # Version 1 API routes
│       ├── auth.ts          # Authentication routes
│       ├── customers.ts     # Customer routes
│       ├── invoices.ts      # Invoice routes
│       ├── orders.ts        # Order routes
│       ├── products.ts      # Product routes
│       ├── quotations.ts    # Quotation routes
│       └── users.ts         # User routes
├── services/                # Business logic
│   ├── auth/                # Authentication services
│   ├── customer/            # Customer services
│   ├── invoice/             # Invoice services
│   ├── order/               # Order services
│   ├── product/             # Product services
│   ├── quotation/           # Quotation services
│   └── user/                # User services
└── utils/                   # Utility functions
    ├── auth.ts              # Authentication utilities
    └── email.ts             # Email utilities
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build TypeScript for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Run Prettier
- `bun run test` - Run tests
- `bun run prisma:generate` - Generate Prisma client
- `bun run prisma:migrate` - Run database migrations
- `bun run prisma:studio` - Open Prisma Studio GUI
- `bun run prisma:seed` - Seed database with sample data

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:4000/api-docs
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `GET /api/v1/auth/profile` - Get current user profile
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users
- `GET /api/v1/users` - Get all users (Manager+)
- `POST /api/v1/users` - Create a new user (Manager+)
- `GET /api/v1/users/:id` - Get user by ID (Self or Manager+)
- `PUT /api/v1/users/:id` - Update user (Self or Manager+)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)
- `PATCH /api/v1/users/:id/status` - Update user status (Manager+)
- `PUT /api/v1/users/my-profile` - Update current user profile
- `POST /api/v1/users/change-password` - Change password

### Customers
- `POST /api/v1/customers` - Create customer profile
- `GET /api/v1/customers` - Get all customers (Manager+)
- `GET /api/v1/customers/:id` - Get customer by ID (Manager+)
- `PUT /api/v1/customers/:id` - Update customer (Manager+)
- `DELETE /api/v1/customers/:id` - Delete customer (Admin only)
- `GET /api/v1/customers/me` - Get my customer profile
- `PUT /api/v1/customers/me` - Update my customer profile
- `GET /api/v1/customers/user/:userId` - Get customer by user ID (Manager+)

### Products
- `GET /api/v1/products` - Get all products (public)
- `GET /api/v1/products/featured` - Get featured products (public)
- `GET /api/v1/products/search` - Search products (public)
- `GET /api/v1/products/category/:categoryId` - Get products by category (public)
- `GET /api/v1/products/:id` - Get product by ID (public)
- `POST /api/v1/products` - Create product (Manager+)
- `PUT /api/v1/products/:id` - Update product (Manager+)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)
- `PATCH /api/v1/products/:id/stock` - Update product stock (Manager+)

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get all orders (Manager+)
- `GET /api/v1/orders/my-orders` - Get my orders
- `GET /api/v1/orders/:id` - Get order by ID (Self or Manager+)
- `GET /api/v1/orders/number/:orderNumber` - Get order by number (Manager+)
- `PUT /api/v1/orders/:id` - Update order (Manager+)
- `DELETE /api/v1/orders/:id` - Delete order (Admin only)
- `PATCH /api/v1/orders/:id/status` - Update order status (Manager+)
- `PATCH /api/v1/orders/:id/payment-status` - Update payment status (Manager+)
- `PATCH /api/v1/orders/:id/tracking` - Add tracking number (Manager+)
- `PATCH /api/v1/orders/:id/cancel` - Cancel order (Manager+)

### Quotations
- `POST /api/v1/quotations` - Create quotation (Manager+)
- `GET /api/v1/quotations` - Get all quotations (Manager+)
- `GET /api/v1/quotations/my-quotations` - Get my quotations
- `GET /api/v1/quotations/:id` - Get quotation by ID (Self or Manager+)
- `GET /api/v1/quotations/number/:quotationNumber` - Get by number (Manager+)
- `PUT /api/v1/quotations/:id` - Update quotation (Manager+)
- `DELETE /api/v1/quotations/:id` - Delete quotation (Admin only)
- `PATCH /api/v1/quotations/:id/status` - Update status (Manager+)
- `PATCH /api/v1/quotations/:id/send` - Send quotation (Manager+)
- `PATCH /api/v1/quotations/:id/accept` - Accept quotation
- `PATCH /api/v1/quotations/:id/reject` - Reject quotation
- `POST /api/v1/quotations/:id/convert-to-order` - Convert to order (Manager+)

### Invoices
- `POST /api/v1/invoices` - Create invoice (Manager+)
- `GET /api/v1/invoices` - Get all invoices (Manager+)
- `GET /api/v1/invoices/my-invoices` - Get my invoices
- `GET /api/v1/invoices/overdue` - Get overdue invoices (Manager+)
- `GET /api/v1/invoices/:id` - Get invoice by ID (Self or Manager+)
- `GET /api/v1/invoices/number/:invoiceNumber` - Get by number (Manager+)
- `GET /api/v1/invoices/order/:orderId` - Get invoices by order (Manager+)
- `PUT /api/v1/invoices/:id` - Update invoice (Manager+)
- `DELETE /api/v1/invoices/:id` - Delete invoice (Admin only)
- `PATCH /api/v1/invoices/:id/mark-paid` - Mark as paid (Manager+)
- `PATCH /api/v1/invoices/:id/mark-unpaid` - Mark as unpaid (Manager+)
- `POST /api/v1/invoices/generate-from-order/:orderId` - Generate from order (Manager+)

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  password               String
  firstName              String
  lastName               String
  phone                  String?
  role                   String    @default("USER") // USER, MANAGER, SUPER_ADMIN
  status                 String    @default("PENDING_VERIFICATION")
  refreshToken           String?
  lastLoginAt            DateTime?
  emailVerificationToken String?
  emailVerifiedAt        DateTime?
  passwordResetToken     String?
  passwordResetExpires   DateTime?
  
  // Profile fields
  about                  String?
  dateOfBirth            DateTime?
  gender                 String?
  imageUrl               String?
  language               String?   @default("en")
  currency               String?   @default("SGD")
  
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  
  // Relations
  customer               Customer?
  orders                 Order[]
  quotations             Quotation[]
  invoices               Invoice[]
  auditLogs              AuditLog[]
}
```

#### Customer Model
```prisma
model Customer {
  id             String    @id @default(cuid())
  userId         String    @unique
  companyName    String?
  taxId          String?
  customerType   String    @default("INDIVIDUAL") // INDIVIDUAL, CORPORATE
  creditLimit    Float     @default(0)
  creditUsed     Float     @default(0)
  totalSpent     Float     @default(0)
  paymentTerms   String    @default("IMMEDIATE") // IMMEDIATE, NET_30, NET_60
  contactPerson  String?
  salesman       String?
  customerStatus String    @default("ACTIVE") // ACTIVE, INACTIVE
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Relations
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Product Model
```prisma
model Product {
  id                String    @id @default(cuid())
  name              String
  description       String
  categoryId        String
  price             Float
  pricingModel      String    @default("fixed")
  trackStock        Boolean   @default(false)
  currentStock      Int       @default(0)
  lowStockThreshold Int       @default(10)
  status            String    @default("ACTIVE")
  featured          Boolean   @default(false)
  sku               String    @unique
  imageUrls         String?   // JSON array
  specifications    String?   // JSON object
  features          String?   // JSON array
  colorOptions      String?   // JSON array
  sizeOptions       String?   // JSON array
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  category          Category  @relation(fields: [categoryId], references: [id])
  orderItems        OrderItem[]
  quotationItems    QuotationItem[]
}
```

### Enums (stored as strings for SQLite compatibility)

- **UserRole**: USER, MANAGER, SUPER_ADMIN
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- **CustomerType**: INDIVIDUAL, CORPORATE
- **CustomerStatus**: ACTIVE, INACTIVE
- **OrderStatus**: COMPLETED, PROCESSING, CANCELLED, PENDING_PAYMENT, IN_PROGRESS, ASSIGNED
- **PaymentStatus**: PAID, UNPAID, OVERDUE, PENDING, PARTIAL
- **PaymentTerms**: IMMEDIATE, NET_30, NET_60
- **InvoiceStatus**: PAID, UNPAID, OVERDUE
- **QuotationStatus**: PENDING, APPROVED, REJECTED, DRAFT, SENT, ACCEPTED, EXPIRED
- **ProductCategory**: FLYERS, BUSINESS_CARDS, BANNERS, CUSTOM, POSTERS, STICKERS, LABELS, BROCHURES, ENVELOPES, SIGNAGE, WRAPS, MAGNETS
- **ProductStatus**: IN_STOCK, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED
- **PricingModel**: MULTI_FACTOR, QUANTITY_BASED, AREA_BASED, CUSTOM

## Shared Types System

This API uses a centralized type system via the `@app/shared-types` package:

- **Type Safety**: All interfaces are strongly typed
- **Consistency**: Same types used across web, admin, and mobile apps  
- **Maintainability**: Single source of truth for all type definitions
- **Developer Experience**: Excellent IntelliSense and error catching

### Example Usage
```typescript
import { 
  ICreateOrderService, 
  IUpdateOrderService, 
  OrderStatus, 
  UserRole 
} from '@app/shared-types';
```

## Authorization Levels

- **Public**: No authentication required
- **Authenticated**: Valid JWT token required
- **Manager+**: MANAGER or SUPER_ADMIN role required
- **Admin Only**: SUPER_ADMIN role required
- **Self or Manager+**: User can access own resources, or Manager+ can access any

## Test Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super.admin@example.com | Password123 |
| Manager | manager@example.com | Password123 |
| User | user1@example.com | Password123 |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Node environment | No | development |
| PORT | Server port | No | 4000 |
| DATABASE_URL | Database connection string | Yes | - |
| JWT_SECRET | JWT signing secret | Yes | - |
| JWT_REFRESH_SECRET | Refresh token secret | Yes | - |
| JWT_EXPIRES_IN | Access token expiry | No | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | No | 7d |
| BCRYPT_ROUNDS | Password hashing rounds | No | 10 |
| CORS_ORIGIN | Allowed CORS origins | No | * |
| EMAIL_HOST | SMTP host | No | - |
| EMAIL_PORT | SMTP port | No | 587 |
| EMAIL_USER | SMTP username | No | - |
| EMAIL_PASS | SMTP password | No | - |

## Production Deployment

### Database Migration

For production with PostgreSQL:

1. Update `DATABASE_URL` in production environment
2. Change schema.prisma provider to `postgresql`
3. Convert string enums to native PostgreSQL enums
4. Run production migrations:
```bash
bun prisma migrate deploy
```

### Build and Deploy

```bash
# Build the application
bun run build

# Start production server
bun run start
```

## Security Considerations

- JWT tokens with short expiry and refresh token rotation
- Password hashing with bcrypt
- Input validation on all endpoints
- Role-based authorization
- CORS configuration
- Rate limiting
- Audit logging for all operations
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and formatting
6. Submit a pull request

## License

This project is licensed under the MIT License.