# SahaRa Frontend

A modern web application built with Next.js that serves as the user interface for the SahaRa platform. This frontend connects to the SahaRa backend API to provide a comprehensive collaborative environment.

## Features

- **Modern UI**: Built with Material UI components for a clean, responsive design
- **Rich Text Editing**: Integrated TipTap and TinyMCE editors for content creation
- **Interactive Calendar**: Event scheduling and management with React Scheduler
- **Authentication**: Secure user authentication and role-based access control
- **Data Visualization**: Charts and graphs using Recharts
- **Form Management**: Dynamic form creation and validation

## Tech Stack

- **Framework**: Next.js with TypeScript
- **UI Library**: Material UI (MUI v6)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT
- **Styling**: Emotion styled components and Tailwind CSS

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable UI components
- `src/contexts`: React context providers including authentication
- `src/utils`: Utility functions and helpers
- `src/types`: TypeScript type definitions
- `public`: Static assets

## Build and Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

To start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
