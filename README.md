# Sentiment-Aware Smart Playlist Generator 🎵

A Next.js application that generates Spotify playlists based on your mood using sentiment analysis.

## Features

- 🎭 Mood-based playlist generation
- 🔍 Sentiment analysis of user input
- 🎵 Spotify integration
- 🎨 Beautiful, responsive UI
- 🔐 Secure authentication with Spotify
- 📊 PostgreSQL database for storing user preferences and playlists

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Spotify Developer account

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/song-suggester.git
   cd song-suggester
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/song_suggester"

   # Next Auth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"

   # Spotify
   SPOTIFY_CLIENT_ID="your-spotify-client-id"
   SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
   SPOTIFY_REDIRECT_URI="http://localhost:3000/api/auth/callback/spotify"
   ```

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add `http://localhost:3000/api/auth/callback/spotify` to the Redirect URIs
4. Copy the Client ID and Client Secret to your `.env` file

## Project Structure

```
src/
  ├── app/              # Next.js app router
  │   ├── api/         # API routes
  │   ├── (auth)/      # Authentication pages
  │   └── dashboard/   # Main application pages
  ├── components/      # React components
  ├── lib/            # Utility functions
  └── types/          # TypeScript types
```

## Technologies Used

- Next.js 14
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- Spotify Web API
- Tailwind CSS
- Sentiment Analysis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
