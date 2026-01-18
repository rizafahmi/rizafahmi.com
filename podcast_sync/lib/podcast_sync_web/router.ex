defmodule PodcastSyncWeb.Router do
  use PodcastSyncWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", PodcastSyncWeb do
    get "/feed.rss", FeedController, :rss
  end

  scope "/api", PodcastSyncWeb do
    pipe_through :api
  end
end
