/**
 * This plugin is for only the path library.
 * It cannot be used for the fs module.
 * @link https://www.npmjs.com/package/node-polyfill-webpack-plugin#usage
 */
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const path = require("path");

/**
 * fs polyfill is not available.
 * So, I have implemented my own polyfill for the parts that I need.
 */

module.exports = {
  entry: "./src/scorer/scorer.mjs",
  mode: "development",
  output: {
    path: `${__dirname}/src/web/build`,
    filename: "scorer.mjs",
  },
  node: {
    __dirname: "mock",
  },
  plugins: [
    new NodePolyfillPlugin({
      onlyAliases: ["path", "buffer"],
    }),
  ],
  resolve: {
    fallback: {
      "fs/promises": path.resolve(__dirname, "src/common/fspolyfill.mjs"),
    },
  },
};
