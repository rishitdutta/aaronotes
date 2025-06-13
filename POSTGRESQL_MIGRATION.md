# PostgreSQL Migration Guide

## Current Status

✅ Updated Prisma schema to use PostgreSQL
✅ Installed pg and @types/pg packages  
✅ Created .env file with Supabase connection string
⚠️ Prisma client generation having permission issues on Windows

## Next Steps to Complete Migration

### 1. Generate Prisma Client (Try these options)

Option A - Run as Administrator:

```powershell
# Right-click PowerShell -> "Run as Administrator"
cd "c:\Users\rishi\Coding\cyfuture\aaronotes"
npx prisma generate
```

Option B - Alternative method:

```powershell
# Delete node_modules and reinstall
Remove-Item -Path "node_modules" -Recurse -Force
npm install
npx prisma generate
```

Option C - Use WSL if available:

```bash
npx prisma generate
```

### 2. Push Schema to Supabase

```powershell
npx prisma db push
```

### 3. Verify Database Tables

Log into your Supabase dashboard and check that these tables were created:

- User
- Patient
- Encounter

### 4. Test the Application

```powershell
npm run dev
```

## Changes Made

### Updated Files:

1. **prisma/schema.prisma** - Changed from SQLite to PostgreSQL
2. **package.json** - Added pg and @types/pg dependencies
3. **.env** - Added DATABASE_URL for Supabase

### Database Schema (PostgreSQL):

```sql
-- Users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Patients table
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "contact" TEXT,
    "medicalId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- Encounters table
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawTranscript" TEXT,
    "structuredNote" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "duration" INTEGER,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);
```

## Troubleshooting

### If Prisma Client Generation Fails:

1. Close VS Code and any running dev servers
2. Delete `node_modules\.prisma` folder
3. Run `npx prisma generate` as administrator
4. If still fails, delete entire `node_modules` and run `npm install`

### If Database Connection Fails:

1. Verify Supabase connection string in .env
2. Check Supabase dashboard for database status
3. Ensure your IP is whitelisted in Supabase

### Environment Variables:

Make sure both `.env` and `.env.local` contain the DATABASE_URL:

```
DATABASE_URL=postgresql://postgres.dfskccyixcgodwwtrush:[exf6ipBL0mpKN7z8]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Benefits of PostgreSQL Migration

- ✅ Production-ready database
- ✅ Better performance for complex queries
- ✅ JSON support for structured notes
- ✅ Supabase hosting and management
- ✅ Real-time capabilities (future feature)
- ✅ Better data types and constraints
