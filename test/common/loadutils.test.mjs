/** @file contains tests for loadutils */

import path from "node:path";
import loadutils from "../../src/common/loadutils.mjs";

import { describe, it } from "node:test";
import assert from "node:assert/strict";

const EXAMPLE_CSV_PATH = path.join("test", "common", "static", "example.csv");

describe("loadutils", () => {
  describe("loadCsv", async () => {
    it("loads a csv correctly", async () => {
      let received = await loadutils.loadCsv(EXAMPLE_CSV_PATH);

      const expected = [
        { a: "1", b: "2", c: "efg" },
        { a: "4", b: "5", c: "qwert" },
        { a: "7", b: "8", c: "nothing-special" },
      ];

      assert.deepEqual(received, expected);
    });
  });
});
