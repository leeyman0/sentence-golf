import loader from "../../src/loader/loader.mjs";

let startTime = new Date();

loader.loadData().then(() => {
  let elapsedTime = new Date() - startTime;

  console.log("Elapsed time for loader:", elapsedTime, "ms");
});
