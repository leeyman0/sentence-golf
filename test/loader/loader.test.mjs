/** @file this tests to see that the loader loads all of the data */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

import loader from "../../src/loader/loader.mjs";

before(() => loader.loadData());
describe("loader", async () => {
  describe("word frequency data", () => {
    it("enables working on raw word array data", () => {
      let wordData = loader.getWordFrequencyData();

      assert.ok(Array.isArray(wordData));

      // Verify each and every word
      assert.ok(
        wordData.every(
          ([word, entry]) =>
            typeof word === "string" &&
            !!entry &&
            typeof entry.count === "number"
        )
      );
    });
  });
  describe("census summary data", () => {
    it("has summaries of the census", () => {
      const censusSummary = loader.getCensusSummary();

      assert.ok(typeof censusSummary.barewordCount === "number");
      assert.ok(typeof censusSummary.lemmaCount === "number");
    });
  });
});
