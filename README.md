# Samson Dental Center Website

The Samson Dental Center website application lives in [`samson-nextjs`](samson-nextjs). It uses Next.js, React, TypeScript, Tailwind CSS, Supabase, and Resend.

## Local development

From the repository root:

```bash
cd samson-nextjs
pnpm install
pnpm dev
```

Open http://localhost:3000 to view the application. Configure the required environment variables for your development environment before using connected services; see the [deployment configuration](GIT_WORKFLOW_GUIDE.md#7-vercel-configuration) for the documented variable names.

## Available commands

Run these commands inside `samson-nextjs`:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the Vitest test suite |

## Project documentation

- [Git and deployment workflow](GIT_WORKFLOW_GUIDE.md)
- [Website design](websitedesign.md)
- [Appointment email specification](APPOINTMENT_EMAIL_SPECIFICATION.md)
- [Appointment request guide](appointment_request_vibe_guide.md)
- [Secretary V2 audit](SECRETARY_V2_AUDIT.md)

## Contributing

Create feature branches from `staging` and target `staging` when opening a pull request. Follow the [Git workflow guide](GIT_WORKFLOW_GUIDE.md) for the full contribution and deployment process.
