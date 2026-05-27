# Project Tech Stack (Next.js Edition)

This document outlines the official technology stack for the Samson Dental project using a full-stack Next.js approach. 

> **Note:** If you want to change or swap out a technology, update it here first to ensure the AI and engineering teams are aligned.

## Core Technologies
- **Language**: TypeScript (End-to-End)
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS

## Backend & Architecture
- **API & Backend**: Next.js Server Actions & Route Handlers
- **Architecture Pattern**: Modular Monolith (Modulith) adapted for Next.js — Strict domain separation with Facades and Use-Cases within the `src/modules` directory.

## Database & Infrastructure (Supabase)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with `@supabase/ssr` (Server-Side Rendering support)
- **Storage**: Supabase Storage
- **Database Client**: `@supabase/supabase-js`

## Third-Party Services & Deployment
- **Email Delivery**: Resend (For transactional emails and notifications)
- **Hosting & Deployment**: Vercel (Handles both frontend and serverless backend)

## Workspace & Package Management
- **Package Manager**: pnpm

---

*Document version: 2.0 (Next.js Edition) – last updated 2026‑05‑25*
