defmodule Sequence do
  def calculate(0), do: 1
  def calculate(1), do: 1
  def calculate(n), do: calculate(n - 1) + calculate(n - 2)

  def map([], _fun), do: []
  def map([head | tail], fun), do: [fun.(head) | map(tail, fun)]

  def pmap(collection, fun) do
    collection |> spawn_children(fun) |> collect_results
  end

  def spawn_children(collection, fun) do
    collection |> map(fn elem -> spawn_child(elem, fun) end)
  end

  def spawn_child(value, fun) do
    spawn(__MODULE__, :child, [value, fun, self()])
  end

  def child(value, fun, parent) do
    send(parent, {self(), fun.(value)})
  end

  def collect_results(pids) do
    pids |> map(fn pid -> collect_result_per_pid(pid) end)
  end

  def collect_result_per_pid(pid) do
    receive do
      {^pid, result} -> result
    end
  end
end

IO.inspect(
  Sequence.map([35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], fn n -> Sequence.calculate(n) end)
)
