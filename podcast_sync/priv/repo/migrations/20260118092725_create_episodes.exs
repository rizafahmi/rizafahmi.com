defmodule PodcastSync.Repo.Migrations.CreateEpisodes do
  use Ecto.Migration

  def change do
    create table(:episodes) do
      add :video_id, :string, null: false
      add :title, :string, null: false
      add :description, :text
      add :audio_filename, :string
      add :duration_seconds, :integer
      add :file_size_bytes, :integer
      add :published_at, :utc_datetime

      timestamps()
    end

    create unique_index(:episodes, [:video_id])
  end
end
