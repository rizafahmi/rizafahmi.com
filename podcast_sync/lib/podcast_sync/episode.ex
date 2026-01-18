defmodule PodcastSync.Episode do
  use Ecto.Schema
  import Ecto.Changeset

  schema "episodes" do
    field :video_id, :string
    field :title, :string
    field :description, :string
    field :audio_filename, :string
    field :duration_seconds, :integer
    field :file_size_bytes, :integer
    field :published_at, :utc_datetime

    timestamps()
  end

  @doc false
  def changeset(episode, attrs) do
    episode
    |> cast(attrs, [:video_id, :title, :description, :audio_filename, :duration_seconds, :file_size_bytes, :published_at])
    |> validate_required([:video_id, :title])
    |> unique_constraint(:video_id)
  end
end
