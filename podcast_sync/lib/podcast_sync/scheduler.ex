defmodule PodcastSync.Scheduler do
  @moduledoc """
  GenServer that periodically syncs YouTube playlist to podcast episodes.
  """

  use GenServer
  require Logger

  @sync_interval :timer.hours(1)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_sync()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:sync, state) do
    Logger.info("Starting podcast sync...")
    # TODO: Implement sync logic
    schedule_sync()
    {:noreply, state}
  end

  defp schedule_sync do
    Process.send_after(self(), :sync, @sync_interval)
  end

  def sync_now do
    send(__MODULE__, :sync)
  end
end
