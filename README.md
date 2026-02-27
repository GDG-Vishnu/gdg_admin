# GDG Admin Portal

A comprehensive administrative platform for managing Google Developer Group (GDG) community operations, events, members, and engagement.

## Overview

GDG Admin Portal is a full-stack web application designed to streamline the management of GDG chapters. It provides a robust suite of tools for community organizers to efficiently handle event planning, member management, form creation, and media galleries.

## Key Features

- **Event Management** - Create, update, and manage community events with complete CRUD operations
- **Member Administration** - Comprehensive member database with profile management and tracking
- **Dynamic Form Builder** - Custom form creation tool with response collection and analysis
- **Gallery Management** - Integrated image management powered by Cloudinary
- **Admin Dashboard** - Real-time analytics and insights for community metrics
- **Authentication & Authorization** - Secure role-based access control system
- **Public Forms** - Shareable forms for event registration and surveys

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Media Storage**: Cloudinary
- **UI Components**: shadcn/ui with Tailwind CSS
- **Authentication**: Custom session-based auth
- **TypeScript**: Full type safety across the application

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Protected admin routes
│   ├── api/               # API routes
│   └── forms/             # Public form pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   └── forms/            # Form components
├── lib/                   # Utility functions and services
├── prisma/               # Database schema and migrations
└── types/                # TypeScript type definitions
```

## Getting Started

Refer to [PRISMA_SETUP.md](PRISMA_SETUP.md) and [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for detailed setup instructions.

---

Built for GDG community organizers to focus on what matters most - building and growing their developer community.
