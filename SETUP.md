# Quick Setup Guide

## Prerequisites

1. Install Node.js 18+
2. Install PostgreSQL or use a cloud database
3. Get Clerk account and API keys
4. Get OpenAI API key

## Setup Steps

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aaronotes"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start Backend (Optional)

If using the Python backend:

```bash
cd ../aaronotes-backend
pip install -r requirements.txt  # Create this with: torch, uvicorn, librosa, soundfile, fastapi, transformers
uvicorn main:app --reload
```

### 5. Start Frontend

```bash
npm run dev
```

## Features Available

✅ **Completed:**

- User authentication with Clerk
- Patient management (create, view)
- Dashboard with statistics
- Recording component with browser audio capture
- API routes for transcription and patient management
- Database schema with Prisma
- Responsive UI with shadcn/ui components

✅ **Core Flow:**

1. Sign up/in → Dashboard
2. Add patients → Patient list
3. Select patient → Patient profile
4. Start recording → Audio capture
5. Process audio → Transcription + AI structuring
6. Save encounter → Database storage

⚠️ **Requires Setup:**

- Database connection
- Clerk authentication keys
- OpenAI API key for note structuring
- Backend API for transcription (or modify to use client-side)

## Architecture

```
Frontend (Next.js) → API Routes → Database (PostgreSQL)
                  ↘ Python Backend → Medical Whisper → Transcription
                  ↘ OpenAI API → Structured Notes
```

## Next Steps

1. Set up your environment variables
2. Configure Clerk authentication
3. Set up your database
4. Test the recording functionality
5. Deploy to production
