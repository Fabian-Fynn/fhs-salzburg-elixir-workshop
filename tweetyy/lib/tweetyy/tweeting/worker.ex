defmodule Tweetyy.Tweeting.Worker do
  use GenServer

  def start_link(term) do
    GenServer.start_link(__MODULE__, term)
  end

  def init(term) do
    {:ok, term, 0}
  end

  def handle_info(:timeout, term) do
    start_stream(term)
    {:noreply, term}
  end

  def start_stream(term) do
    ExTwitter.stream_filter(track: term)
    |> Stream.map(fn tweet -> tweet.text end)
    |> Stream.reject(fn text -> String.match?(text, ~r/RT/) end)
    |> Stream.filter(fn text -> String.length(text) > 25 end)
    |> Enum.each(&analyse_tweet/1)
  end

  def print_tweet(tweet) do
    IO.puts(">>> #{tweet}")
  end

  def analyse_tweet(tweet) do
    mood = Veritaserum.analyze(tweet)
    value = cond do
      mood > 0 -> String.duplicate("👍", abs(mood))
      mood < 0 -> String.duplicate("👎", abs(mood))
      true -> "😐"
    end

    broadcast_tweet(value, tweet)
  end

  def broadcast_tweet(mood, tweet) do
    TweetyyWeb.Endpoint.broadcast("tweet_stream:trump", "tweet:new", %{text: tweet, mood: mood})
  end
end
