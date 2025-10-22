/** @file provides the external interface for the scorer */
import loader from "../loader/loader.mjs";

await loader.loadData();

const summaryData = loader.getCensusSummary();
const wordData = loader.getWordFrequencyData();
const lemmaData = loader.getLemmaFrequencyData();

// console.log(`summaryData: ${JSON.stringify(summaryData)}`);

const WORD_NOT_FOUND = -1;
const WORD_NOT_FOUND_POINT_PENALTY = 10;

const WORD_REF_POINT = Math.log10(summaryData.barewordCount);
const LEMMA_REF_POINT = Math.log10(summaryData.lemmaCount);
const WORD_LOG_ZERO =
  Math.log10(summaryData.barewordCount) - Math.log10(wordData[0][1].count);
const LEMMA_LOG_ZERO =
  Math.log10(summaryData.lemmaCount) - Math.log10(lemmaData[0][1].count);

// console.log(
//   `WORD_LOG_ZERO: ${WORD_LOG_ZERO}, LEMMA_LOG_ZERO: ${LEMMA_LOG_ZERO}`
// );

/**
 * Find the relative frequency of the word by adding the relative lemma frequency to the
 * word's component and then taking the average.
 * @param {string} word the word to search for
 * @returns {number}
 */
function calcualateRelativeFreq(word) {
  const entry = wordData.find(
    ([entryWord, _entry]) => word.toLowerCase() === entryWord
  )?.[1];
  // console.log(`Word entry is ${JSON.stringify(entry)}`);

  if (entry) {
    const relLemma = calculateRelativeLemmaFreq(entry.lemma);
    let wordComponent =
      WORD_REF_POINT - Math.log10(entry.count) - WORD_LOG_ZERO;
    // console.log(
    //   `word component: ${wordComponent}, lemma component ${relLemma}`
    // );
    if (relLemma !== WORD_NOT_FOUND) {
      return (wordComponent + relLemma) / 2;
    } else {
      return WORD_NOT_FOUND;
    }
  } else {
    return WORD_NOT_FOUND;
  }
}

/**
 * Find the relative lemma frequency.
 * @param {string} lemma the lemma to search for
 * @returns {number}
 */
function calculateRelativeLemmaFreq(lemma) {
  const entry = lemmaData.find(
    ([entryWord, _entry]) => lemma.toLowerCase() === entryWord
  )?.[1];
  // console.log(`Lemma entry is ${JSON.stringify(entry)}`);

  if (entry) {
    return LEMMA_REF_POINT - Math.log10(entry.count) - LEMMA_LOG_ZERO;
  } else {
    return WORD_NOT_FOUND;
  }
}

/**
 * turns a word into separate clitics
 * @param {string} word the word
 * @returns {string[]} a list of the base word and all clitics attached
 */
function separateClitics(word) {
  const enclitic = /(n't|s'|'(ve|d|s|ll|m))/gi;
  // Have to test this way to assert that the enclitic has been matched.
  if (enclitic.test(word)) {
    // From the top
    enclitic.lastIndex = 0;
    let matches = word.matchAll(enclitic);
    let tokens = [];
    for (let match of matches) {
      if (tokens.length === 0) {
        // Add the first one in addition to this one
        // special case s' counts only the apostrophe as the clitic
        // the s is added to the end of the base word.
        if (match[0] === "s'") {
          tokens.push(
            word.slice(0, match.index + 1),
            word.slice(match.index + 1, match.index + 2)
          );
        } else {
          tokens.push(word.slice(0, match.index), match[0]);
        }
      } else {
        tokens.push(match[0]);
      }
    }
    return tokens;
  } else {
    return [word];
  }
}

/**
 * Turns a sentence into a list of words.
 * @param {string} str the string to turn into a list of words
 * @returns {string[]} the list of words in the sentence
 */
function wordize(str) {
  return str.split(/[^a-z']+/gi).flatMap((word) => {
    return word !== "" ? separateClitics(word.toLowerCase()) : [];
  });
}

/**
 * Scores a string containing nothing but a single word
 * @param {string} word a string shaped like a word
 * @returns {number} the total score of the word
 */
function scoreWord(word) {
  let relFreq = calcualateRelativeFreq(word);
  if (relFreq !== WORD_NOT_FOUND) {
    return Math.floor(1 + relFreq);
  } else {
    return WORD_NOT_FOUND_POINT_PENALTY;
  }
}

/**
 * @typedef {{ properNouns?: string[], resultType?: "simple" | "detailed"}} ScoringOptions
 */

/**
 * @typedef {{ word: string, score: number, status: "FOUND" | "NOT FOUND" }} WordScore
 */

/**
 * @typedef {{ wordScores: WordScore[], totalScore: number }} DetailedScore
 */

/**
 * Scores a string for the purposes of the sport of sentence-golf.
 *
 * @param {string} str
 * @param {ScoringOptions} options
 * @returns {number | DetailedScore} the score of the string in total. If options.resultType is
 * "detailed", it comes with extra details
 */
function score(str, options = {}) {
  let score = 0;
  let wordScores = [];
  let returnType = options.resultType ?? "simple";
  let properNouns = (options.properNouns ?? []).map((noun) =>
    noun.toUpperCase()
  );

  let words = wordize(str);
  // console.log("words:", words);

  words
    .filter((word) => !properNouns.includes(word.toUpperCase())) // filter words that match proper nouns
    .forEach((word) => {
      let wordScore = scoreWord(word);

      if (returnType === "detailed") {
        wordScores.push({
          word,
          wordScore,
          status:
            wordScore === WORD_NOT_FOUND_POINT_PENALTY ? "NOT FOUND" : "FOUND",
        });
      }
      score += wordScore;
    });

  if (returnType === "detailed") {
    return {
      wordScores,
      totalScore: score,
    };
  } else {
    return score;
  }
}

export default Object.freeze({
  score,
  scoreWord,
  constants: Object.freeze({
    WORD_NOT_FOUND_POINT_PENALTY,
  }),
});
