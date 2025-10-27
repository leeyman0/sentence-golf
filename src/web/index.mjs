import scorer from "./build/scorer.mjs";

const scoreTextArea = document.getElementById("sentence-input");
const scoreButton = document.getElementById("score-button");
const hideButton = document.getElementById("hide-button");
const resultsDiv = document.getElementById("scoring-results");
const resultsInfoDiv = document.getElementById("results-info");
const resultsDetailsDiv = document.getElementById("results-details");
// Results are hidden
hideResults();
let resultsShown = false;

scoreButton.addEventListener("click", () => {
  let textToScore = scoreTextArea.value;
  scoreGolfText(textToScore);
  if (!resultsShown) {
    showResults();
    resultsShown = true;
  }
});

hideButton.addEventListener("click", () => {
  if (resultsShown) {
    hideResults();
    resultsShown = false;
  }
});

function scoreGolfText(text) {
  // get the score from the other part of the program compiled with webpack
  let score = scorer.score(text, { resultType: "detailed" });
  // console.log(score);
  resultsInfoDiv.innerText = `Total Score: ${score.totalScore}`;
  // Clear and add the details
  resultsDetailsDiv.innerHTML = "";
  score.wordScores.forEach((wordScore) => {
    resultsDetailsDiv.appendChild(makeWordScore(wordScore));
  });
  // Scroll to bottom so that the user can see the results
  window.scrollTo(0, document.body.scrollHeight);
}

function showResults() {
  resultsDiv.style.display = "block";
}

function hideResults() {
  resultsDiv.style.display = "none";
}

/**
 * Makes a word score from the scoring item.
 * @param {WordScore} param0 the word score object.
 * @returns {HTMLSpanElement} the detailed word
 */
function makeWordScore({ word, wordScore, status }) {
  let outerSpan = document.createElement("span");
  outerSpan.classList.add("word-score-shell");
  let scoreSpan = document.createElement("span");
  scoreSpan.classList.add("word-score-window");
  scoreSpan.innerText = wordScore;
  outerSpan.innerText = word;
  outerSpan.appendChild(scoreSpan);
  return outerSpan;
}
