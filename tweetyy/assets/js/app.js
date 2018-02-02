// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket"

const template = (tweet) => {
  return `
  <hr>
  <p> <span>${tweet.mood}</span></p>
      <p>${tweet.text}</p>
  `
}

const printTweet = (el, tweet) => {
  if (el.childNodes.length > 10) {
    el.removeChild(el.firstChild);
  }
  let listItem = document.createElement('li');
  listItem.style.listStyleType = 'none';
  listItem.innerHTML = template(tweet);
  el.appendChild(listItem);
}

window.startTermStream = (term, el) => {
  let tweets = [];
  let channel = socket.channel(`tweet_stream:${term}`, {})
  channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  channel.on("tweet:new", (tweet) => {
    printTweet(el, tweet, tweets);
  })
}
