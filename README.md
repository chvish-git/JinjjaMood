# JinjjaMood

A mood tracking app built with React, TypeScript, and Supabase.

## Features

- **Real Mood Tracking**: Track your authentic feelings with 24 different mood options
- **Daily Limits**: Healthy boundaries with 5 mood logs per day
- **Analytics**: Beautiful charts and insights about your mood patterns
- **Secure Authentication**: Email/password authentication with Supabase
- **Real-time Sync**: Your data syncs across all devices
- **Dark/Light Mode**: Choose your preferred theme

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jinjjamood
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `.env.example` to `.env` and fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/20250630075947_old_shadow.sql`
   - Run the migration to create tables and policies

5. **Deploy the Edge Function (for account deletion)**
   - Install the Supabase CLI: `npm install -g supabase`
   - Login to Supabase: `supabase login`
   - Link your project: `supabase link --project-ref your-project-ref`
   - Deploy the function: `supabase functions deploy delete-account`

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Schema

### Users Table
- `id` (uuid) - Primary key, references auth.users
- `username` (text) - Unique username, 2-20 characters
- `email` (text) - User's email address
- `created_at` (timestamptz) - Account creation timestamp

### Mood Logs Table
- `id` (uuid) - Primary key
- `user_id` (uuid) - References users table
- `mood` (text) - One of 24 predefined mood options
- `mood_type` (enum) - positive, neutral, negative, or bonus
- `journal_entry` (text) - Optional journal entry
- `timestamp` (timestamptz) - When the mood was logged
- `day` (text) - Date in YYYY-MM-DD format for efficient querying
- `hour` (integer) - Hour of the day (0-23)
- `created_at` (timestamptz) - Record creation timestamp

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Authentication is handled by Supabase Auth
- All database operations are secured with proper policies
- Account deletion is handled securely via Edge Functions

## Deployment

### Prerequisites for Deployment

1. **Supabase Setup Complete**: Ensure your database schema is deployed and RLS policies are active
2. **Edge Function Deployed**: The `delete-account` function must be deployed for secure account deletion
3. **Environment Variables**: Set up your production environment variables

### Deployment Checklist

- ✅ Sign Up & Login work (with working auth + RLS rules)
- ✅ Username uniqueness enforced and validated
- ✅ Mood logging functional (daily limit + moodTypes)
- ✅ Supabase RLS rules secure each table
- ✅ No hard errors on page load
- ✅ Responsive design for mobile
- ✅ Fun & fast interactions (e.g., toasts, visuals)
- ✅ Secure account deletion via Edge Functions

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details