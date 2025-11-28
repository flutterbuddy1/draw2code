# AppSketch Studio

AppSketch Studio is a web application that allows users to draw, describe, and generate app UIs and code using AI.

## Features

- **Draw Your App**: Sketch wireframes on an infinite canvas.
- **AI-Powered Coding**: Convert sketches and text prompts into React/Tailwind code.
- **Multilingual Support**: Generate apps in multiple languages.
- **Voice Commands**: Describe your app verbally.

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Auth**: NextAuth.js (Credentials)
- **Canvas**: tldraw

## Getting Started

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Set up environment variables**:
    Copy `.env.example` to `.env` (already done in setup).
    ```bash
    cp .env.example .env
    ```

3.  **Initialize Database**:
    ```bash
    npx prisma db push
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Project Structure

- `app/`: Next.js pages and API routes.
- `components/`: Reusable UI components.
- `lib/`: Utilities and services (Prisma, AI mock).
- `prisma/`: Database schema.

## Usage

1.  Sign up/Log in (use any email/password for mock auth if configured, or check `auth.ts`).
2.  Create a new project from the dashboard.
3.  Use the canvas to draw your app layout.
4.  Describe the app in the text area or use voice input.
5.  Click "Generate App" to see the AI-generated code.
