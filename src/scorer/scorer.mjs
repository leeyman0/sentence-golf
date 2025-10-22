/** @file provides the external interface for the scorer */
import loader from "../loader/loader.mjs";

await loader.loadData();

const summaryData = loader.getCensusSummary();
const wordData = loader.getWordFrequencyData();
const lemmaData = loader.getLemmaFrequencyData();

// console.log(`summaryData: ${JSON.stringify(summaryData)}`);

const WORD_NOT_FOUND = -1;

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

function scoreWord(word) {
  let relFreq = calcualateRelativeFreq(word);

  return Math.floor(1 + relFreq);
}

/**
 * @typedef {{ properNouns?: string[], resultType?: "simple" | "detailed"}} ScoringOptions
 */

/**
 * Scores a string for the purposes of the sport of sentence-golf.
 *
 * @param {string} str
 * @param {ScoringOptions} options
 * @returns {number} the score of the string in total.
 */
function score(str, options = {}) {
  return 0;
}

export default Object.freeze({
  score,
  scoreWord,
});
