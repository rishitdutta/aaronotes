# 🚀 Deployment Guide for AaroNotes

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (local or cloud)
- ✅ Clerk account and API keys
- ✅ OpenAI API key
- ✅ Python backend running (optional)

## 🔧 Environment Setup

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL and create database
createdb aaronotes_db
```

#### Option B: Cloud Database (Recommended)

- **Supabase**: Create a new project and get the connection string
- **Railway**: Deploy a PostgreSQL instance
- **Vercel Postgres**: Set up a database in Vercel dashboard

### 2. Clerk Authentication Setup

1. Go to [clerk.dev](https://clerk.dev) and create an account
2. Create a new application
3. Configure these URLs in Clerk dashboard:

   - **Authorized redirect URLs**: `http://localhost:3000/dashboard`, `https://your-domain.com/dashboard`
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/dashboard`

4. Copy your keys from the API Keys section

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your real values:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual credentials:

```env
# Database - Replace with your actual PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database"

# Clerk Authentication - Get these from your Clerk dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_actual_clerk_key_here"
CLERK_SECRET_KEY="sk_test_your_actual_clerk_secret_here"

# These should match your Clerk app configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI API - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-your_actual_openai_key_here"

# Backend API URL - Update if deploying backend elsewhere
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

## 🗄️ Database Migration

After setting up your database URL:

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) View your database
npx prisma studio
```

## 🏃‍♂️ Running Locally

### Frontend (Next.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend (Python - Optional)

```bash
cd ../aaronotes-backend

# Install Python dependencies
pip install torch uvicorn librosa soundfile fastapi transformers bitsandbytes

# Start the backend
uvicorn main:app --reload
```

## 🌐 Production Deployment

### Option 1: Vercel (Recommended for Frontend)

1. **Push to GitHub**:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/aaronotes.git
git push -u origin main
```

2. **Deploy to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in the Vercel dashboard
   - Deploy

3. **Add Environment Variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_BACKEND_URL`

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Add environment variables
3. Deploy both frontend and backend

### Option 3: DigitalOcean/AWS/Google Cloud

1. Set up a VPS or container service
2. Clone your repository
3. Set environment variables
4. Install dependencies and build
5. Use PM2 or similar for process management

## 🐍 Backend Deployment

### Option 1: Railway/Render

- Deploy the `aaronotes-backend` folder
- Set Python runtime
- Install requirements
- Expose port 8000

### Option 2: Google Cloud Run

```bash
# Create Dockerfile in aaronotes-backend/
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔒 Security Checklist

- ✅ Use environment variables for all secrets
- ✅ Enable CORS properly in production
- ✅ Use HTTPS in production
- ✅ Restrict database access
- ✅ Update Clerk authorized domains
- ✅ Monitor API usage and costs

## 🚨 Troubleshooting

### Common Issues:

1. **Clerk keys not working**:

   - Ensure keys are for the correct environment (test vs prod)
   - Check authorized domains in Clerk dashboard
   - Verify environment variable names

2. **Database connection failed**:

   - Check DATABASE_URL format
   - Ensure database is accessible
   - Run `npx prisma db push` to sync schema

3. **Build failures**:

   - Ensure all TypeScript errors are resolved
   - Check that all imports are correct
   - Verify environment variables are set

4. **Recording not working**:
   - Ensure HTTPS is used (required for microphone access)
   - Check browser permissions
   - Verify backend is running and accessible

## 📱 Testing the Application

1. **Sign Up**: Create a new account
2. **Add Patient**: Navigate to Patients → Add Patient
3. **Record Note**: Go to patient detail → Start Recording
4. **Verify**: Check that transcript and structured note are generated

## 🎯 Next Steps

After successful deployment:

1. **Customize Branding**: Update logos, colors, and text
2. **Add Analytics**: Integrate with Google Analytics or similar
3. **Monitor Performance**: Set up error tracking (Sentry)
4. **Scale**: Optimize for larger user bases
5. **Backup**: Set up database backups

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Review server logs
3. Verify all environment variables are set correctly
4. Test API endpoints individually

Your AaroNotes application is now ready for production! 🎉
