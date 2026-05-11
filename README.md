# Powow Pipeline Dashboard

A Next.js-based dashboard for the Agent Pipeline Backend v1. This application provides a user interface for managing and monitoring the agent pipeline system.

## Tech Stack

- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build

```bash
pnpm build
pnpm start
```

## Environment Variables

No environment variables are required for this application.

## Project Structure

```
├── app/                 # Next.js App Router
│   ├── page.tsx        # Home page
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
├── public/             # Static assets
├── styles/             # Global styles
├── package.json        # Project metadata and dependencies
└── tsconfig.json       # TypeScript configuration
```

## Deployment

This project is deployed on Vercel. Push to the main branch to trigger automatic deployments.

## License

MIT
