# Project Tech Stack

This document outlines the official technology stack for the Samson Dental project. It serves as a central reference for what tools and frameworks are approved for use. 

> **Note:** If you want to change or swap out a technology, update it here first to ensure the AI and engineering teams are aligned.

## Core Technologies
- **Language**: TypeScript (End-to-End for both Client and Server)
- **Frontend Framework**: React (Bootstrapped via Vite)
- **Styling**: Tailwind CSS

## Backend & Architecture
- **API Framework**: Express.js (Node.js)
- **Architecture Pattern**: Modular Monolith (Modulith) — Strict domain separation with Facades and Use-Cases.

## Database & Infrastructure (Supabase)
- **Database**: Supabase PostgreSQL (Direct interaction via SQL / SDK)
- **Authentication**: Supabase Auth (Email/Password, Magic Links, Role-based access)
- **Storage**: Supabase Storage (For user avatars, clinic files, generated invoices)
- **Database Client**: `@supabase/supabase-js` (Replacing heavy ORMs like Prisma for direct, performant access)

## Third-Party Services & Deployment
- **Email Delivery**: Resend (For transactional emails and notifications)
- **Backend Deployment**: Render

## Workspace & Package Management
- **Monorepo Tooling**: Turborepo (For workspace orchestration and fast builds)
- **Package Manager**: pnpm (For fast, disk space efficient package management)
