# AaroNotes - Clinical Documentation from Speech

An AI-powered clinical documentation system that converts speech to structured medical notes using advanced speech recognition and natural language processing.

## Features

- **User Authentication**: Secure authentication with Clerk
- **Patient Management**: Create and manage patient records
- **Voice Recording**: Record clinical encounters directly in the browser
- **AI Transcription**: Convert speech to text using Medical Whisper
- **Note Structuring**: Automatically structure transcripts into clinical format using GPT-4
- **Encounter History**: View and edit past clinical notes

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Backend**: FastAPI (Python) for speech processing
- **AI Services**:
  - Medical Whisper Large v3 for speech-to-text
  - OpenAI GPT-4 for note structuring

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database
- Clerk account
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Frontend setup
cd aaronotes
npm install

# Backend setup (if using the Python backend)
cd ../aaronotes-backend
pip install torch uvicorn librosa soundfile fastapi transformers
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From your Clerk dashboard
- `CLERK_SECRET_KEY`: From your Clerk dashboard
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_BACKEND_URL`: URL of your Python backend (default: http://localhost:8000)

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Clerk Authentication Setup

1. Create a Clerk application at [clerk.dev](https://clerk.dev)
2. Configure sign-in/sign-up URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### 5. Start the Applications

```bash
# Start the Next.js frontend
npm run dev

# Start the Python backend (in another terminal)
cd ../aaronotes-backend
uvicorn main:app --reload
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with Clerk
2. **Add Patients**: Navigate to the Patients page and add patient information
3. **Record Encounters**:
   - Select a patient
   - Click "Start Recording" to begin voice recording
   - Speak your clinical notes naturally
   - Click "Stop Recording" to process the audio
4. **Review & Edit**: The AI will structure your notes into standard clinical format
5. **Save**: Save the encounter to the patient's record

## Project Structure

```
aaronotes/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Main application pages
│   ├── api/                 # API routes
│   └── components/          # React components
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── RecordingComponent.tsx # Core recording functionality
├── lib/
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Utility functions
└── prisma/
    └── schema.prisma       # Database schema
```

## API Endpoints

- `GET /api/patients` - Get all patients for the current user
- `POST /api/patients` - Create a new patient
- `POST /api/transcribe` - Process audio recording and create structured note
- `POST /api/encounters` - Save a new encounter

## Development

### Adding New Components

```bash
# Add shadcn/ui components
npx shadcn@latest add [component-name]
```

### Database Changes

```bash
# After modifying schema.prisma
npx prisma db push
npx prisma generate
```

## Deployment

1. Set up a PostgreSQL database (e.g., Supabase, Railway, or Heroku Postgres)
2. Deploy the Next.js app to Vercel or similar platform
3. Deploy the Python backend to a platform that supports FastAPI
4. Update environment variables in production

## Security Considerations

- All API routes are protected with Clerk authentication
- Patient data is isolated per user
- Audio recordings are processed server-side and not stored permanently
- Structured notes are saved securely in the database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
