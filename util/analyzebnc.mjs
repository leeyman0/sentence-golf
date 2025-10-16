/** @file this script analyzes the british national corpus and puts it into a file for further usage */
import path from "node:path";
import fs from "node:fs/promises";
import * as cheerio from "cheerio";

// This program assumes that the bnc is inflated from the zip in a parallel directory to
// the source root directory (essentially, in ../bnctexts).
const MIN_COUNT = 5;

const BNC_TEXTS_DIR = path.join("..", "bnctexts", "download", "Texts");
const LOADER_STATIC_DIR = path.join("src", "loader", "static");
const LEMMA_CENSUS_OUTPUT = path.join(LOADER_STATIC_DIR, "lemmacensus.csv");
const BAREWORD_CENSUS_OUTPUT = path.join(
  LOADER_STATIC_DIR,
  "barewordcensus.csv"
);

// first, turn the path of the BNC directory into a list of its sub sub directories,
fs.readdir(BNC_TEXTS_DIR, { recursive: true })
  .then((filenames) => {
    return filenames.filter((filename) => filename.endsWith(".xml"));
  })
  .then((xmlFiles) => {
    let lemmaCensusData = new Map();
    let barewordCensusData = new Map();

    // For each filename, read the file into a buffer, and then
    return xmlFiles
      .reduce((promise, xmlFileName) => {
        return promise
          .then(() => fs.readFile(path.join(BNC_TEXTS_DIR, xmlFileName)))
          .then((buffer) => {
            console.log(`Extracting word frequency data from ${xmlFileName}`);
            let xml = cheerio.loadBuffer(buffer);
            try {
              // Extract the barewords and the lemmas
              readXml(xml, lemmaCensusData, barewordCensusData);
            } catch (error) {
              throw new Error(`Error parsing ${xmlFileName}`, { cause: error });
            }
          })
          .catch((error) => {
            // Just move on for now
            console.error(error);
          });
      }, Promise.resolve())
      .then(() => [lemmaCensusData, barewordCensusData]);
  })
  .then(async ([lemmaCensusData, barewordCensusData]) => {
    console.log(`Writing lemma data`);
    const creatrunc =
      fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_TRUNC;
    let lemmaFile = await fs.open(LEMMA_CENSUS_OUTPUT, creatrunc);
    // First, write header
    await lemmaFile.write("lemma,\tcount\n");
    for (const [lemma, entry] of lemmaCensusData) {
      if (entry.count >= MIN_COUNT) {
        let lemmaCol = (lemma + ",").padEnd(20);
        let countCol = ("" + entry.count).padStart(10);
        await lemmaFile.write(lemmaCol + countCol + "\r\n");
      }
    }
    await lemmaFile.close();
    console.log(`Writing word data`);
    let barewordFile = await fs.open(BAREWORD_CENSUS_OUTPUT, creatrunc);
    // First, write header
    await barewordFile.write("word,\tlemma,\tcount\n");
    for (const [word, entry] of barewordCensusData) {
      if (entry.count >= MIN_COUNT) {
        let wordCol = (word + ",").padEnd(20);
        let lemmaCol = (entry.lemma + ",").padEnd(20);
        let countCol = ("" + entry.count).padStart(10);
        await barewordFile.write(wordCol + lemmaCol + countCol + "\r\n");
      }
    }
    await barewordFile.close();
  })
  .catch((error) => {
    console.error(`Error reading ${BNC_TEXTS_DIR}`);
    console.error(error);
  });

/**
 * an entry for the bareword census
 * @typedef {{count: number, lemma: string, word: string}} BarewordCensusEntry
 */
/**
 * an entry for the lemma census
 * @typedef {{count: number, lemma: string}} LemmaCensusEntry
 */

/**
 * reads a cheerio xml object into the program, using the barewords.
 * @param {cheerio.CheerioAPI} xml the xml parsed by cheerio
 * @param {Map<string, LemmaCensusEntry>} lemmaCensusData the mapping of each lemma to information
 * @param {Map<string, BarewordCensusEntry>} barewordCensusData the mapping of each bareword to information
 */
function readXml(xml, lemmaCensusData, barewordCensusData) {
  xml("p w").each(function (_matchIndex) {
    // Not sure what to call this but matlock says ghuuuuuh
    // I hate jquery sometimes. But this was pretty easy to do at least.
    const matlock = xml(this);
    const bareword = matlock.text().trim().toLowerCase();
    const lemma = matlock.attr("hw").toLowerCase();

    let lemmaCensusEntry = lemmaCensusData.get(lemma);

    // Increment the count for the lemma
    if (lemmaCensusEntry) {
      ++lemmaCensusEntry.count;
    } else {
      lemmaCensusData.set(lemma, {
        count: 1,
        lemma,
      });
    }

    let barewordCensusEntry = barewordCensusData.get(bareword);

    // Increment the count for the bareword
    if (barewordCensusEntry) {
      ++barewordCensusEntry.count;
    } else {
      barewordCensusData.set(bareword, {
        count: 1,
        lemma,
        word: bareword,
      });
    }
  });
}
