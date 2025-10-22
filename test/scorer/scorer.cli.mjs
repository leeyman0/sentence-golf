import scorer from "../../src/scorer/scorer.mjs";

import readline from "node:readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("What word do you want to score? ")
  .then((line) => {
    let score = scorer.scoreWord(line.trim());
    return rl.write(`Score for ${line.trim()}: ${score}\n`);
  })
  .finally(() => {
    return rl.close();
  });
