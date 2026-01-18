# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :podcast_sync,
  ecto_repos: [PodcastSync.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :podcast_sync, PodcastSyncWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: PodcastSyncWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: PodcastSync.PubSub,
  live_view: [signing_salt: "k6/YO/6K"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
