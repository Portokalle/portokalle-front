# Portokalle Frontend

A Next.js frontend application.

## Architecture Overview

- **Frontend**: Next.js (App Router + Pages API routes).
- **Server**: Node.js runtime via `next dev` / `next start`, with server-side API routes in `pages/api/*` and `src/app/api/*`.
- **Database**: Firebase Firestore.
- **Auth**: Firebase Authentication (client SDK) + Admin SDK for privileged operations in API routes.
- **Analytics**: Google Analytics (gtag) via `NEXT_PUBLIC_GA_ID`.
- **Images**: DigitalOcean Spaces (S3-compatible) for profile photos.

## Image Storage (Profile Photos)

Profile photo uploads are handled by `pages/api/profile/upload-profile-picture.ts` and stored in **DigitalOcean Spaces** (S3-compatible).

Environment variables:
- `DO_SPACES_KEY`
- `DO_SPACES_SECRET`
- `DO_SPACES_BUCKET`
- Region: `fra1` (see `pages/api/profile/upload-profile-picture.ts`)

The uploaded public URL is stored on the user document as `profilePicture` in Firestore.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## Development

To run the development server:

```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The development server will start at [http://localhost:3000](http://localhost:3000).

## Building for Production

To create a production build:

```bash
# Create production build using production environment variables
npm run build:prod
# or
yarn build:prod
```

To test the production build locally:

```bash
# Start production server
npm run start:prod
# or
yarn start:prod
```

The production server will start at [http://localhost:3000](http://localhost:3000).

## Environment Variables

The project uses two environment files:
- `.env.development` - Used during development
- `.env.production` - Used for production builds

Make sure these files are properly configured before building or deploying.

Key variables used by the app:
- **Firebase (client SDK)**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- **Firebase Admin (server SDK)**: `FIREBASE_SERVICE_ACCOUNT` (JSON string)
- **Google Analytics**: `NEXT_PUBLIC_GA_ID`
- **DigitalOcean Spaces**: `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET`

## Deployment

1. First, build the project using production environment:
   ```bash
   npm run build:prod
   # or
   yarn build:prod
   ```

2. The build output will be generated in the `.next` directory

3. Deploy the application:
   - For Vercel deployment:
     ```bash
     vercel --prod
     ```
   - For other hosting platforms, follow their respective deployment guides using the production build output

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create a production build
- `npm run build:prod` - Create a production build with production env variables
- `npm run start` - Start production server
- `npm run start:prod` - Start production server with production env variables
- `npm run lint` - Run linting checks

## Project Structure

```
portokalle-frontend/
├── app/              # Next.js app directory
├── public/           # Static files
├── .env.development  # Development environment variables
├── .env.production   # Production environment variables
└── next.config.ts    # Next.js configuration
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
