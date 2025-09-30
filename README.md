# Setlist Manager 🎵

A modern web application for managing band setlists, built with Next.js 15, Prisma, and NextAuth.

## Features

✨ **Song Management**
- Add, edit, and delete songs with title, key, and tempo
- Shared song library accessible to all band members

🎼 **Setlist Creation**
- Create setlists with multiple sets
- Autocomplete song search for quick addition
- Drag and reorder songs within sets
- Move songs between sets easily
- Add comments to individual songs
- Color-code songs with 5 predefined colors
- Edit mode and view mode for setlists

👥 **User Management**
- Secure authentication with NextAuth
- Admin role for adding new users
- All logged-in users can manage songs and setlists

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: CSS Modules (no Tailwind)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm/yarn
- A Neon database account (free tier)
- A Google Cloud Console project for OAuth (free)
- Vercel account for deployment (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
4. Set application type to "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret

**Note:** No specific Google APIs need to be enabled - the OAuth flow uses Google's standard OAuth 2.0 endpoints.

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-neon-database-url-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Initialize the Database

Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev --name init
```

### 5. Add Your First Admin User

You'll need to manually add your first admin user to the database. Run Prisma Studio:

```bash
npx prisma studio
```

Then:
1. Open the `User` model
2. Click "Add record"
3. Fill in:
   - **email**: your Gmail address
   - **name**: your name
   - **role**: `admin`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Gmail account.

## Usage Guide

### Adding Band Members (Admin Only)

1. Navigate to **Users** in the navigation bar
2. Click **+ Add Band Member**
3. Fill in name, Gmail address, and role (admin/user)
4. The band member can now sign in with their Gmail account

### Managing Songs

1. Go to **Songs**
2. Click **+ Add Song**
3. Enter title, key (optional), and tempo (optional)
4. Edit or delete songs as needed

### Creating Setlists

1. From the **Dashboard**, click **+ New Setlist**
2. Enter setlist name and number of sets
3. Click **Create Setlist** (redirects to edit mode)

### Editing Setlists

In edit mode, you can:
- **Add songs**: Use the search bar and click the set number to add
- **Reorder songs**: Use ▲▼ buttons to move up/down
- **Move between sets**: Use the dropdown to change sets
- **Add comments**: Type in the comment field for each song
- **Color-code**: Click color buttons to highlight songs
- **Remove songs**: Click the Remove button

### Viewing Setlists

View mode displays your setlist in a clean, performance-ready format with:
- All songs organized by set
- Song keys and tempos visible
- Comments displayed
- Color-coding applied

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (use your Vercel domain: `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. Click "Deploy"

### 3. Run Database Migrations

After deployment, you need to run migrations on production:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

## Project Structure

```
/app
  /api
    /auth/[...nextauth]    # NextAuth endpoints
    /songs                 # Song CRUD API
    /setlists              # Setlist CRUD API
    /users                 # User management API (admin)
  /dashboard
    /songs                 # Songs management page
    /users                 # User management page (admin)
    /setlists
      /new                 # Create setlist
      /[id]                # View setlist
      /[id]/edit           # Edit setlist
  /login                   # Login page
/components
  Navbar.tsx               # Navigation component
/lib
  auth.ts                  # NextAuth configuration
  prisma.ts                # Prisma client
/prisma
  schema.prisma            # Database schema
```

## Database Schema

### User
- id, email, name, role (admin/user)

### Song
- id, title, key, tempo, createdBy (User)

### Setlist
- id, name, numberOfSets, createdBy (User)

### SetlistSong
- id, setlistId, songId, setNumber, position, comments, backgroundColor

## Troubleshooting

### "Database does not exist" error
Run `npx prisma migrate dev`

### Cannot log in
Make sure your Gmail address is added to the database and you're using the correct Google OAuth credentials

### Vercel deployment issues
Ensure all environment variables are set correctly in Vercel dashboard, including Google OAuth credentials

### Google OAuth issues
Make sure your redirect URIs in Google Cloud Console match your domain exactly

## Support

For issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://authjs.dev)

## License

MIT
