# KCA University IT Helpdesk System

A modern, role-based ticketing system for KCA University ICT Directorate built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## Features

- **Three User Roles**: Students, ICT Technicians, ICT Director
- **Ticket Lifecycle**: Open → Assigned → In Progress → Resolved → Closed (with Reopen)
- **Role-based Dashboards**: Customized views for each role
- **Real-time Updates**: SWR for optimistic UI updates
- **PDF Reports**: Single ticket and date-range resolution summaries
- **Email Notifications**: Automated notifications for ticket events
- **File Attachments**: Support for screenshots and documents
- **Audit Trail**: Complete status change history
- **Accessibility**: WCAG 2.1 AA compliant
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Credentials provider)
- **State Management**: SWR for data fetching
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: @react-pdf/renderer
- **Email**: Nodemailer
- **Charts**: Recharts
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kca-helpdesk
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

5. Start the development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Demo Accounts

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Director | director@kcau.ac.ke | password123 |
| Technician | j.kamau@kcau.ac.ke | password123 |
| Technician | m.achieng@kcau.ac.ke | password123 |
| Technician | p.ochieng@kcau.ac.ke | password123 |
| Student | alice.wambui@student.kcau.ac.ke | password123 |

## Project Structure

```
kca-helpdesk/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeding
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Login/Register pages
│   │   ├── (dashboard)/   # Protected dashboard pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # Reusable UI primitives
│   │   ├── forms/         # Form components
│   │   ├── tickets/       # Ticket-specific components
│   │   ├── dashboard/     # Dashboard components
│   │   └── layout/        # Layout components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   ├── permissions.ts # Role-based access control
│   │   ├── validations/   # Zod schemas
│   │   ├── email/         # Email utilities
│   │   └── pdf/           # PDF generation
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript types
├── .env.example           # Environment template
├── tailwind.config.js     # Tailwind configuration
└── package.json
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript compiler check
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database with demo data
```

## Deployment

### Docker

```bash
docker build -t kca-helpdesk .
docker run -p 3000:3000 --env-file .env.production kca-helpdesk
```

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Traditional Server

```bash
pnpm build
pnpm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth (32+ chars) | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `SMTP_HOST` | SMTP server hostname | For emails |
| `SMTP_PORT` | SMTP server port | For emails |
| `SMTP_USER` | SMTP username | For emails |
| `SMTP_PASSWORD` | SMTP password | For emails |
| `EMAIL_FROM` | From email address | For emails |
| `UPLOAD_DIR` | File upload directory | For attachments |
| `MAX_FILE_SIZE` | Max upload size in bytes | For attachments |

## Design System

The application uses a custom design system based on KCA University's brand:

- **Primary Navy**: `#192C57` (oklch(28% 0.15 260))
- **Accent Gold**: `#CBAE2D` (oklch(68% 0.18 85))
- **Typography**: Poppins (display) + Lato (body) + JetBrains Mono (code)
- **Spacing**: 4pt base scale with semantic tokens
- **Border Radius**: 8px default, 12px for cards

## Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML5
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast ratios ≥ 4.5:1
- Reduced motion support
- Screen reader tested

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please contact the KCA University ICT Directorate.