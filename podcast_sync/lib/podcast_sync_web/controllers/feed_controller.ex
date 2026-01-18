defmodule PodcastSyncWeb.FeedController do
  use PodcastSyncWeb, :controller

  def rss(conn, _params) do
    rss_feed = PodcastSync.RssGenerator.generate_feed()

    conn
    |> put_resp_content_type("application/rss+xml")
    |> send_resp(200, rss_feed)
  end
end
