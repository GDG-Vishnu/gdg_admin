# Prisma Setup Guide

## Installation Complete ✅

Prisma ORM has been set up for your GDG Admin project.

## Database Configuration

1. Create a `.env.local` file in the root directory:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/gdg_admin?schema=public"
   ```

2. Replace the connection string with your actual database credentials:
   - `user` - your database username
   - `password` - your database password
   - `localhost:5432` - your database host and port
   - `gdg_admin` - your database name

## Prisma Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Create and apply migrations

```bash
npx prisma migrate dev --name init
```

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

### Reset database

```bash
npx prisma migrate reset
```

## Database Models

The schema includes the following models:

- **User** - Admin users with authentication
- **Event** - GDG events management
- **Member** - Community members
- **FormSubmission** - Form builder submissions
- **Image** - Cloudinary image uploads tracking

## Usage in API Routes

```typescript
import { prisma } from "@/lib/prisma";

// Example: Get all events
const events = await prisma.event.findMany();

// Example: Create a new member
const member = await prisma.member.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    role: "developer",
  },
});
```

## Next Steps

1. Add your `DATABASE_URL` to `.env.local`
2. Run `npx prisma migrate dev --name init` to create tables
3. Start using Prisma in your API routes
