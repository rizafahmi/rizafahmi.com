# PodcastSync

A Phoenix application that syncs YouTube playlists to a podcast RSS feed.

## Features

- Fetches videos from a YouTube playlist via YouTube Data API
- Downloads and converts videos to MP3 audio files
- Generates RSS feed compatible with podcast players
- Automatic synchronization on a schedule
- SQLite database for episode storage

## Setup

### Prerequisites

- Elixir 1.14+
- Erlang/OTP 25+
- yt-dlp (for audio extraction)
- YouTube Data API key

### Installation

1. Install dependencies:
```bash
mix deps.get
```

2. Create and migrate the database:
```bash
mix ecto.create
mix ecto.migrate
```

3. Set up environment variables (see Configuration below)

### Configuration

Set the following environment variables:

- `YOUTUBE_API_KEY` - Your YouTube Data API key (required)
- `YOUTUBE_PLAYLIST_ID` - The YouTube playlist ID to sync (required)
- `PODCAST_TITLE` - Podcast title (default: "My Podcast")
- `PODCAST_DESCRIPTION` - Podcast description (default: "A podcast synced from YouTube")
- `PODCAST_AUTHOR` - Podcast author name (default: "Podcast Author")
- `PODCAST_EMAIL` - Podcast contact email (default: "podcast@example.com")
- `BASE_URL` - Base URL for the podcast (default: "http://localhost:4000")
- `PORT` - Server port (default: 4000)

### Running

Start the Phoenix server:

```bash
mix phx.server
```

Or inside IEx:

```bash
iex -S mix phx.server
```

The RSS feed will be available at: `http://localhost:4000/feed.rss`

## Project Structure

- `lib/podcast_sync/`
  - `episode.ex` - Episode schema
  - `repo.ex` - Ecto repository
  - `youtube_client.ex` - YouTube API client (TODO)
  - `audio_extractor.ex` - Audio extraction with yt-dlp (TODO)
  - `rss_generator.ex` - RSS feed generation (TODO)
  - `scheduler.ex` - Periodic sync scheduler

- `lib/podcast_sync_web/`
  - `controllers/feed_controller.ex` - RSS feed endpoint
  - `router.ex` - Routes
  - `endpoint.ex` - Phoenix endpoint

- `priv/static/audio/` - Audio file storage

## Database Schema

### Episodes Table

- `id` - Primary key
- `video_id` - YouTube video ID (unique)
- `title` - Episode title
- `description` - Episode description
- `audio_filename` - MP3 filename
- `duration_seconds` - Audio duration
- `file_size_bytes` - File size
- `published_at` - YouTube publish date
- `inserted_at` - Record creation timestamp
- `updated_at` - Record update timestamp

## Next Steps

The following modules need implementation:

1. **YoutubeClient** - Integrate with YouTube Data API using Req
2. **AudioExtractor** - Implement yt-dlp integration for audio extraction
3. **RssGenerator** - Build RSS feed using xml_builder
4. **Scheduler** - Add sync logic to periodically fetch new videos

## License

Copyright (c) 2026
