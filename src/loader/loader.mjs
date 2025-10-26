/** @file loads data from static sources */
import path from "path";

import loadutils from "../common/loadutils.mjs";

/** @typedef {{ word: string, lemma: string, count: number }} WordEntry */

/** @typedef {{ lemma: string, count: number }} LemmaEntry */

/** @typedef {{ barewordCount: number, lemmaCount: number}} CensusSummary */

const thisModulesDirectory = import.meta.dirname ?? "./build";

// console.log(thisModulesDirectory);

const WORD_FREQ_PATH = path.join(
  thisModulesDirectory,
  "static",
  "barewordcensus.csv"
);

const LEMMA_FREQ_PATH = path.join(
  thisModulesDirectory,
  "static",
  "lemmacensus.csv"
);

const CENSUS_SUMMARY_PATH = path.join(
  thisModulesDirectory,
  "static",
  "censussummary.txt"
);

function loadData() {
  return loadutils
    .loadCsv(WORD_FREQ_PATH)
    .then((data) => {
      data.forEach((datum) => {
        datum.count = parseInt(datum.count);
      });
      _wordFrequencyData = data.map((datum) => [datum.word, datum]);
      _wordFrequencyMapping = new Map(_wordFrequencyData);
    })
    .then(() => loadutils.loadCsv(LEMMA_FREQ_PATH))
    .then((data) => {
      data.forEach((datum) => {
        datum.count = parseInt(datum.count);
      });
      _lemmaFrequencyData = data.map((datum) => [datum.lemma, datum]);
      _lemmaFrequencyMapping = new Map(_lemmaFrequencyData);
    })
    .then(() => loadutils.loadIni(CENSUS_SUMMARY_PATH))
    .then((census) => {
      census.barewordCount = parseInt(census.barewordCount);
      census.lemmaCount = parseInt(census.lemmaCount);
      _censusSummary = census;
    })
    .finally(() => {
      _dataLoaded = true;
    });
}

let _dataLoaded = false;

function dataLoaded() {
  return _dataLoaded;
}

/**
 * Makes a getter for a resource.
 * @param {string} name the name of the resource, used for debugging.
 * @template A the type of the resource
 * @param {() => A} getfn the function that returns the resource
 * @returns {() => A} the sanitized and safe getter
 */
function makeGetter(name, getfn) {
  return () => {
    if (!dataLoaded()) {
      throw new Error(`Data not loaded to loader, cannot get resource ${name}`);
    }
    return getfn();
  };
}

/** @type {[string, WordEntry][]} */
let _wordFrequencyData = null;

/** @type {[string, LemmaEntry][]} */
let _lemmaFrequencyData = null;

/** @type {Map<string, WordEntry>} */
let _wordFrequencyMapping = null;

/** @type {Map<string, LemmaEntry>} */
let _lemmaFrequencyMapping = null;

/** @type {CensusSummary} */
let _censusSummary = null;

/**
 * the raw data for calculating the word frequency data comes from the
 * British National Corpus:
 * @link http://www.natcorp.ox.ac.uk/
 */
const getWordFrequencyData = makeGetter(
  "word frequency data",
  () => _wordFrequencyData
);
/**
 * the raw data for calculating the lemma frequency data comes from the
 * British National Corpus:
 * @link http://www.natcorp.ox.ac.uk/
 */
const getLemmaFrequencyData = makeGetter(
  "lemma frequency data",
  () => _lemmaFrequencyData
);

/**
 * gets basic details about the word corpus census data
 */
const getCensusSummary = makeGetter("census summary", () => _censusSummary);

export default Object.freeze({
  loadData,
  dataLoaded,
  getWordFrequencyData,
  getLemmaFrequencyData,
  getCensusSummary,
});
