/** @file this file contains several utilities for loading file data from paths */
import fs from "node:fs/promises";

/**
 * Reads data from a csv file.
 * @param {string} path the string that contains the csv
 * @returns {Promise<object[]>} the data from the csv, organized into entries
 */
function loadCsv(path) {
  return fs.readFile(path).then((buffer) => {
    let csvEntries = [];
    // Get the first line, use these as the keys
    const headerEnd = buffer.indexOf("\n");
    // console.log("headerEnd:", headerEnd);
    const header = buffer.toString("utf-8", 0, headerEnd);

    const headerOrder = header.split(",").map((s) => s.trim());
    // console.log("headerOrder:", headerOrder);
    let next = -1;
    for (let ci = headerEnd + 1; ci > 0; ci = next + 1) {
      next = buffer.indexOf("\n", ci);
      let line =
        next > 0
          ? buffer.toString("utf-8", ci, next)
          : buffer.toString("utf-8", ci);
      if (line.trim() === "") {
        continue;
      }
      // console.log(`reading line: ${line}`);
      // Read another csv value
      let entryVals = line.split(",").map((s) => s.trim());
      let entry = Object.fromEntries(
        headerOrder.map((k, i) => [k, entryVals[i]])
      );
      csvEntries.push(entry);
    }

    return csvEntries;
  });
}

export default Object.freeze({
  loadCsv,
});
