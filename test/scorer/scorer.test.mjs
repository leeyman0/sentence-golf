/** @file contains tests for the scorer to make sure that it functions correctly */
import scorer from "../../src/scorer/scorer.mjs";

import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("scorer", () => {
  describe("scoreWord", () => {
    it("scores words that exist", () => {
      let result = scorer.scoreWord("sword");

      assert.notEqual(result, scorer.constants.WORD_NOT_FOUND_POINT_PENALTY);
    });
    it("scores the most common word 'the' as 1", () => {
      let result = scorer.scoreWord("the");

      assert.equal(result, 1);
    });
    it("scores 'grandiloquence', a word used around 7 total times in the BNC, as 6", () => {
      let result = scorer.scoreWord("grandiloquence");

      assert.equal(result, 6);
    });
    it("scores words found less than 5 times in the dataset as equal to the word not found penalty", () => {
      let result = scorer.scoreWord("hapax");

      assert.equal(result, scorer.constants.WORD_NOT_FOUND_POINT_PENALTY);
    });
  });
  describe("score", () => {
    function testEqualAgainstSumOfParts(whole, parts) {
      let result = scorer.score(whole);
      // Manually sum up the score
      let expected = parts
        .map((s) => scorer.scoreWord(s))
        .reduce((acc, x) => acc + x, 0);

      assert.equal(result, expected);
    }

    it("scores the total as equal to the sum of its parts", () => {
      testEqualAgainstSumOfParts("I ate the apple.", [
        "I",
        "ate",
        "the",
        "apple",
      ]);
    });
    it("divides hyphenated terms into parts", () => {
      testEqualAgainstSumOfParts("Bose-Einstein condensate", [
        "Bose",
        "Einstein",
        "condensate",
      ]);
    });

    it("breaks up clitics correctly", () => {
      testEqualAgainstSumOfParts("shouldn't've", ["should", "n't", "'ve"]);
      testEqualAgainstSumOfParts("parents' meeting", [
        "parents",
        "'",
        "meeting",
      ]);
      testEqualAgainstSumOfParts("he'd've", ["he", "'d", "'ve"]);
      testEqualAgainstSumOfParts(
        "He said, \"Don't you cry for me, I'll be back again someday.\"",
        [
          "He",
          "said",
          "Do",
          "n't",
          "you",
          "cry",
          "for",
          "me",
          "I",
          "'ll",
          "be",
          "back",
          "again",
          "someday",
        ]
      );
    });
  });
});
