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
          ? buffer.toString("ascii", ci, next)
          : buffer.toString("ascii", ci);
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
/**
 * turns a table into a string to export as csv
 * @param {object[]} tabularData
 * @param {string[] | undefined} headers
 * @returns {string}
 */
function formatCsv(tabularData, headers) {
  let csvHeaders = headers ?? Object.keys(tabularData[0]);

  return tabularData.reduce((acc, entry) => {
    let line = csvHeaders.reduce((acc, col) => {
      return acc + "," + entry[col];
    }, "");
    return acc + line + "\r\n";
  }, "");
}
/**
 * writes an ini containing contents to path. It also truncates whatever was in there before.
 * @param {string} path the path to write the ini towards
 * @param {object} contents the contents of the ini
 * @returns {Promise<void>} returns when the ini is successfully written
 */
function writeIni(path, contents) {
  return fs
    .open(
      path,
      fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_WRONLY
    )
    .then((handle) => {
      return Object.entries(contents)
        .reduce((promise, [k, v]) => {
          return promise.then(() => handle.write(`${k}=${v}\n`));
        }, Promise.resolve())
        .finally(() => {
          return handle.close();
        });
    });
}

function loadIni(path) {
  return fs.readFile(path).then((buffer) => {
    return Object.fromEntries(
      buffer
        .toString()
        .split("\n")
        .map((line) => line.split("=").map((s) => s.trim()))
    );
  });
}

export default Object.freeze({
  loadCsv,
  formatCsv,
  writeIni,
  loadIni,
});
