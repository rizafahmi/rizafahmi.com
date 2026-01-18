# PodcastSync - YouTube to Podcast Converter

**Status**: ✅ **SETUP COMPLETE - READY FOR IMPLEMENTATION**

## Overview

PodcastSync is a Phoenix application that automatically converts YouTube playlists into podcast RSS feeds. It periodically fetches videos from a YouTube playlist, downloads the audio, and serves them as a podcast feed that can be subscribed to in any podcast player.

## Technology Stack

- **Framework**: Phoenix 1.7.14
- **Language**: Elixir 1.14.0
- **Runtime**: Erlang/OTP 25
- **Database**: SQLite 3 (via Ecto)
- **HTTP Client**: Req 0.4.14
- **XML Generation**: XmlBuilder 2.4.0

## Project Structure

```
podcast_sync/
├── config/
│   ├── config.exs              # Base configuration
│   ├── dev.exs                 # Development config (port 4002)
│   ├── prod.exs                # Production config
│   ├── runtime.exs             # Environment variables
│   └── test.exs                # Test configuration
│
├── lib/
│   ├── podcast_sync/
│   │   ├── application.ex      # OTP application supervisor
│   │   ├── repo.ex             # Ecto repository
│   │   ├── episode.ex          # Episode schema/changeset
│   │   ├── youtube_client.ex   # YouTube API integration (TODO)
│   │   ├── audio_extractor.ex  # yt-dlp wrapper (TODO)
│   │   ├── rss_generator.ex    # RSS feed builder (TODO)
│   │   └── scheduler.ex        # Sync scheduler GenServer
│   │
│   └── podcast_sync_web/
│       ├── controllers/
│       │   ├── error_json.ex
│       │   └── feed_controller.ex  # RSS feed endpoint
│       ├── endpoint.ex
│       ├── router.ex               # Routes (/feed.rss)
│       ├── telemetry.ex
│       └── gettext.ex
│
├── priv/
│   ├── repo/
│   │   ├── migrations/
│   │   │   └── 20260118092725_create_episodes.exs
│   │   └── seeds.exs
│   └── static/
│       └── audio/                  # MP3 storage directory
│
├── test/
│   ├── support/
│   └── podcast_sync_web/
│
├── .env.example                    # Environment template
├── .formatter.exs                  # Code formatting config
├── .gitignore                      # Git ignore rules
├── mix.exs                         # Dependencies & config
├── README.md                       # User documentation
├── SETUP_SUMMARY.md                # Setup details
├── TASK_CHECKLIST.md               # Completion tracking
└── verify_setup.sh                 # Verification script
```

## Database Schema

### Episodes Table

```sql
CREATE TABLE episodes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id         TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  description      TEXT,
  audio_filename   TEXT,
  duration_seconds INTEGER,
  file_size_bytes  INTEGER,
  published_at     DATETIME,
  inserted_at      DATETIME NOT NULL,
  updated_at       DATETIME NOT NULL
);
CREATE UNIQUE INDEX episodes_video_id_index ON episodes (video_id);
```

## API Endpoints

- `GET /feed.rss` - Podcast RSS feed (XML)

## Configuration

Environment variables (see `.env.example`):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `YOUTUBE_API_KEY` | Yes | - | YouTube Data API v3 key |
| `YOUTUBE_PLAYLIST_ID` | Yes | - | Playlist to sync |
| `PODCAST_TITLE` | No | "My Podcast" | Feed title |
| `PODCAST_DESCRIPTION` | No | "A podcast synced from YouTube" | Feed description |
| `PODCAST_AUTHOR` | No | "Podcast Author" | Author name |
| `PODCAST_EMAIL` | No | "podcast@example.com" | Contact email |
| `BASE_URL` | No | "http://localhost:4002" | Server base URL |
| `PORT` | No | 4002 | Server port (production) |

## Quick Start

```bash
# 1. Navigate to project
cd podcast_sync

# 2. Install dependencies
mix deps.get

# 3. Set up database
mix ecto.create
mix ecto.migrate

# 4. Configure environment (copy and edit)
cp .env.example .env

# 5. Start server
mix phx.server

# 6. Access RSS feed
open http://localhost:4002/feed.rss
```

## Development Commands

```bash
# Compile project
mix compile

# Run tests
mix test

# Start Phoenix server
mix phx.server

# Interactive shell with server
iex -S mix phx.server

# Create migration
mix ecto.gen.migration migration_name

# Run migrations
mix ecto.migrate

# Reset database
mix ecto.reset

# Verify setup
./verify_setup.sh
```

## Module Status

| Module | Status | Description |
|--------|--------|-------------|
| `PodcastSync.Episode` | ✅ Complete | Schema and changeset |
| `PodcastSync.Repo` | ✅ Complete | Database repository |
| `PodcastSync.Scheduler` | ⚠️ Partial | GenServer skeleton, needs sync logic |
| `PodcastSync.YoutubeClient` | 📝 Stub | Needs YouTube API integration |
| `PodcastSync.AudioExtractor` | 📝 Stub | Needs yt-dlp integration |
| `PodcastSync.RssGenerator` | 📝 Stub | Needs RSS XML generation |
| `PodcastSyncWeb.FeedController` | ✅ Complete | RSS endpoint |
| `PodcastSyncWeb.Router` | ✅ Complete | Routes configured |

## Implementation Roadmap

### Phase 1: RSS Feed Generation (Priority: High)
- [ ] Implement `RssGenerator.generate_feed/0`
- [ ] Query episodes from database
- [ ] Build RSS 2.0 XML structure
- [ ] Add iTunes podcast tags
- [ ] Add audio enclosures

### Phase 2: YouTube Integration (Priority: High)
- [ ] Implement `YoutubeClient.fetch_playlist_videos/1`
- [ ] Call YouTube Data API v3
- [ ] Parse video metadata
- [ ] Handle pagination
- [ ] Handle API errors

### Phase 3: Audio Extraction (Priority: Medium)
- [ ] Install yt-dlp dependency
- [ ] Implement `AudioExtractor.extract_audio/1`
- [ ] Download audio from YouTube
- [ ] Convert to MP3 format
- [ ] Calculate duration and file size
- [ ] Save to `priv/static/audio/`

### Phase 4: Sync Scheduler (Priority: Medium)
- [ ] Implement sync logic in `Scheduler.handle_info/2`
- [ ] Fetch new videos from YouTube
- [ ] Extract audio for new videos
- [ ] Insert/update episode records
- [ ] Handle sync errors gracefully
- [ ] Add logging

### Phase 5: Enhancements (Priority: Low)
- [ ] Add admin API endpoints
- [ ] Manual sync trigger endpoint
- [ ] Episode deletion/cleanup
- [ ] Better error handling
- [ ] Metrics and monitoring
- [ ] Docker containerization

## Verification Status

All setup requirements verified on **2026-01-18**:

- ✅ Phoenix project created
- ✅ Dependencies installed (xml_builder, req, ecto_sqlite3)
- ✅ Database created and migrated
- ✅ Episode schema defined
- ✅ Module stubs created
- ✅ Configuration structure complete
- ✅ Compilation successful (no warnings)
- ✅ Tests passing (2/2)
- ✅ Server starts successfully

## Testing

```bash
# Run all tests
mix test

# Run with coverage
mix test --cover

# Run specific test file
mix test test/podcast_sync_web/controllers/feed_controller_test.exs
```

## Deployment

For production deployment:

1. Set `MIX_ENV=prod`
2. Configure all required environment variables
3. Set `SECRET_KEY_BASE` (generate with `mix phx.gen.secret`)
4. Set `DATABASE_PATH` for SQLite location
5. Run `mix release` or deploy with Docker
6. Ensure yt-dlp is installed on production server

## Resources

- [Phoenix Documentation](https://hexdocs.pm/phoenix)
- [Ecto Documentation](https://hexdocs.pm/ecto)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Apple Podcasts RSS Requirements](https://help.apple.com/itc/podcasts_connect/)

## License

Copyright (c) 2026

---

**Ready for implementation!** 🚀

See `SETUP_SUMMARY.md` for detailed setup information and `TASK_CHECKLIST.md` for completion tracking.
