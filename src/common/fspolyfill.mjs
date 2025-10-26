/** @file this file contains the fs polyfill for webpack. Specifically, the parts for the loader. */
import { Buffer } from "buffer";

/**
 * That's no moon, it's a space station!
 * @param {string} path the path to get from fetch
 * @returns {Buffer}
 */
function readFile(path) {
  // console.log(`readFile called with ${path}`);
  return fetch(path)
    .then((response) => {
      if (response.status === 200) {
        // console.log("SUCCESS");
        return response.arrayBuffer().then((ab) => {
          // console.log(ab);
          return Buffer.from(ab);
        });
      } else {
        throw new Error(
          `Response received: ${response.status} ${response.statusText}`
        );
      }
    })
    .catch((error) => {
      throw new Error(`Error getting file ${path}`, { cause: error });
    });
}

export default Object.freeze({
  open: () => Promise.resolve(), // This might be okay to just leave unimplemented.
  readFile,
});
