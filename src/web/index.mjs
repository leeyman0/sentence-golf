const scoreTextArea = document.getElementById("sentence-input");
const scoreButton = document.getElementById("score-button");
const hideButton = document.getElementById("hide-button");
const resultsDiv = document.getElementById("scoring-results");
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
  console.log("scoreGolfText called");
}

function showResults() {
  resultsDiv.style.display = "block";
}

function hideResults() {
  resultsDiv.style.display = "none";
}
