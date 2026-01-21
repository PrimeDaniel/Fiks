# Fiks - Home Repair Marketplace

A React Native mobile app built with Expo and TypeScript that connects homeowners with professional service providers.

## Project Overview

Fiks is a marketplace where:
- **Clients** post home-repair needs with details, photos, and price offers
- **Pros** (professionals) browse jobs and submit bids or accept offers
- Both parties can negotiate through counter-offers

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Storage**: Supabase Storage (for photos)

## Project Structure

```
Fiks/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable UI components
│   ├── services/       # API and Supabase client
│   ├── types/          # TypeScript type definitions
│   └── navigation/     # Navigation configuration
├── supabase/
│   └── migrations/     # Database migration files
├── assets/             # Images, fonts, etc.
├── App.tsx             # Main app component
└── app.json            # Expo configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrimeDaniel/Fiks.git
   cd Fiks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Supabase credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. **Run the database migrations**
   
   In your Supabase dashboard:
   - Go to SQL Editor
   - Copy the contents of `supabase/migrations/20260111_initial_schema.sql`
   - Run the migration

5. **Start the development server**
   ```bash
   npm start
   ```

## Database Schema

### Tables

#### `profiles`
- User profile information
- Links to Supabase Auth
- Fields: `id`, `full_name`, `role` (client/pro), `avatar_url`

#### `jobs`
- Job postings by clients
- Fields: `id`, `user_id`, `title`, `description`, `category`, `photos`, `price_offer`, `schedule_description`, `allow_counter_offers`, `status`
- Categories: Electricity, Plumbing, Assembly, Moving, Painting
- Status: Open, In Progress, Completed

#### `bids`
- Bids submitted by pros
- Fields: `id`, `job_id`, `pro_id`, `price`, `status`, `message`
- Status: Pending, Accepted, Rejected

### Security

Row Level Security (RLS) is enabled on all tables with policies that:
- Allow users to read their own data
- Restrict modifications to authorized users
- Ensure clients can only create jobs and pros can only create bids

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## Next Steps

1. Implement authentication screens (login/signup)
2. Create job listing and detail screens
3. Build bid submission and management UI
4. Add photo upload functionality
5. Implement real-time updates with Supabase subscriptions
6. Add push notifications

## License

ISC
