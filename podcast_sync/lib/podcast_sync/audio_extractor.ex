defmodule PodcastSync.AudioExtractor do
  @moduledoc """
  Handles downloading and extracting audio from YouTube videos using yt-dlp.
  """

  @doc """
  Downloads audio from a YouTube video and saves it as an MP3 file.
  Returns {:ok, filename, duration_seconds, file_size_bytes} or {:error, reason}.
  """
  def extract_audio(_video_id) do
    # TODO: Implement audio extraction using yt-dlp
    {:error, :not_implemented}
  end
end
