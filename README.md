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

- **Framework**: Next.js 16+ (App Router)
- **Database**: Firebase Firestore
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
│   └── firebase.ts       # Firebase Admin SDK configuration
└── types/                # TypeScript type definitions
```

## Environment Variables

Add the following to your `.env` file:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Getting Started

1. Set up your Firebase project and Firestore database
2. Generate a service account key from Firebase Console → Project Settings → Service Accounts
3. Copy the credentials to your `.env` file
4. Refer to [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for Cloudinary setup

## Firestore Collections

| Collection         | Description                          |
|--------------------|--------------------------------------|
| `events`           | Community events                     |
| `team_members`     | Team member profiles                 |
| `gallery`          | Gallery images                       |
| `users`            | Admin users                          |
| `forms`            | Dynamic forms                        |
| `form_responses`   | Submitted form responses             |

## Available Scripts

| Script              | Description                                |
|---------------------|--------------------------------------------|
| `npm run dev`       | Start development server                   |
| `npm run build`     | Build for production                       |
| `npm run add-admin` | Seed an admin user into Firestore          |
| `npm run seed-user` | Seed a dev user into Firestore             |
| `npm run db:verify` | Verify Firestore collections are accessible|

---

Built for GDG community organizers to focus on what matters most - building and growing their developer community.
