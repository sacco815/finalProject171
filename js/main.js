/* * * * * * * * * * * * * *
 *           MAIN           *
 * * * * * * * * * * * * * */

// init global variables & switches
let albumVis;
let overviewVis;

// load data using promises
let promises = [
  d3.csv(
    "https://raw.githubusercontent.com/wahlforss/blaj/main/BeatlesAlbumCoverPalettes.csv"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/wahlforss/blaj/main/TheBeatlesCleaned.csv"
  ),
];

Promise.all(promises)
  .then(function (data) {
    initMainPage(data);
  })
  .catch(function (err) {
    console.log(err);
  });

// initMainPage
function initMainPage(dataArray) {
  // log data
  console.log("check out the data", dataArray);

  // init visualizations
  albumVis = new AlbumVis("visOne", dataArray[0]);
  overviewVis = new AlbumOverview("visTwo", dataArray[1]);
}
