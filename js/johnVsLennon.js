// import composer.json

// load data using promises
let promises2 = [
  d3.csv(
    "https://raw.githubusercontent.com/wahlforss/blaj/main/beatles_tracks_expanded.csv"
  ),
  d3.csv("https://raw.githubusercontent.com/wahlforss/blaj/main/composer.csv"),
];

let johnvsPaul = null;

Promise.all(promises2)
  .then(function (data) {
    // JohnVPaul(data);
    johnvsPaul = new JvP(data);
  })
  .catch(function (err) {
    console.log(err);
  });

// init Paul vs. John page

class JvP {
  constructor(data) {
    this.data = data;
    this.svg = null;
    this.composerWithExpanded = null;
    this.wrangleData();
    this.initVis();
  }
  updateVis() {
    console.log("updated", albumClicked);
    // remove old elements
    // remove everthing in visThree
    this.svg.selectAll("*").remove();
    this.initVis();
  }

  wrangleData() {
    this.svg = d3
      .select("#visThree")
      .append("svg")
      .attr("width", 1000)
      .attr("height", 1100);

    let data = this.data;
    let expanded = data[0];
    const composer = data[1];

    // parse Album data in expandend
    expanded = expanded.map((d) => {
      d.album = d.album.replaceAll("'", '"');
      try {
        d.album = JSON.parse(d.album);
        d.album.release_date_formatted = new Date(d.album.release_date);
        d.album.release_date_year =
          d.album.release_date_formatted.getFullYear();
        return d;
      } catch (e) {
        d.parsed = false;
        return d;
      }
    });

    const composerWithExpanded = composer.map((d) => {
      // regex to match names

      const expandedData = expanded.find((e) => {
        const replacedE = e.name
          .replace("'", "")
          .replace(".", "")
          .replace("´", "");
        const replacedD = d[0]
          .replace("'", "")
          .replace(".", "")
          .replace("´", "");
        return replacedE.includes(replacedD);
      });
      return { ...d, ...expandedData };
    });

    this.composerWithExpanded = composerWithExpanded;
  }
  initVis() {
    let svg = this.svg;
    console.log("init vis");
    // filter out songs with no data
    const filtered = this.composerWithExpanded.filter((d) => {
      if (albumClicked === "") {
        return d.name !== undefined;
      } else {
        console.log(d.album);
        return (
          d &&
          d.name !== undefined &&
          d.album &&
          d.album.name &&
          d.album.name.includes(albumClicked)
        );
      }
    });
    console.log(albumHex);
    const PaulSongs = filtered.filter((d) => d[1] === "McCartney");
    const JohnSongs = filtered.filter((d) => d[1] === "Lennon");

    this.paulSongs = PaulSongs;
    this.johnSongs = JohnSongs;
    const averagePopularityPaul = d3.mean(PaulSongs, (d) => +d.popularity);
    const averagePopularityJohn = d3.mean(JohnSongs, (d) => +d.popularity);
    const averageDurationPaul = d3.mean(PaulSongs, (d) => +d.duration_ms);
    const averageDurationJohn = d3.mean(JohnSongs, (d) => +d.duration_ms);

    // <div id="visThree"></div>

    // create a bar chart with the average popularity of paul vs john

    const barWidth = 100;
    const barHeight = 100;
    const barPadding = 10;
    let colorJohn = "#EDD003";
    let colorPaul = "#D0227B";

    if (albumClicked !== "") {
      colorJohn = albumHex[albumHex.length - 1];
      colorPaul = albumHex[albumHex.length - 2];
    }

    const barData = [
      { name: "Paul", value: averagePopularityPaul },
      { name: "John", value: averagePopularityJohn },
    ];

    const barScale = d3
      .scaleLinear()
      .domain([0, d3.max(barData, (d) => d.value)])
      .range([0, barHeight]);

    const barWrapper = svg.append("g").attr("transform", "translate(100, 100)");
    console.log(barWrapper);

    const bar = barWrapper
      .selectAll("g")
      .data(barData)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        return `translate(${i * (barWidth + barPadding)}, 0)`;
      });

    bar
      .append("rect")
      .attr("width", barWidth)
      .attr("height", (d) => barScale(d.value))
      // add color to bars depending on artist yellow for john and blue for paul
      .attr("fill", (d) => {
        if (d.name === "Paul") {
          return colorPaul;
        } else {
          return colorJohn;
        }
      })
      .attr("y", (d) => barHeight - barScale(d.value));

    // add text to bar chart
    bar
      .append("text")
      .attr("x", barWidth / 2 - 10)
      .attr("y", (d) => barHeight - barScale(d.value) - 30)
      .attr("dy", ".75em")
      .text((d) => {
        return Math.round(d.value);
      });

    // add x axis
    bar
      .append("text")
      .attr("x", barWidth / 2 - 30)
      .attr("y", barHeight + 10)
      .attr("font-size", "12px")
      .attr("dy", ".75em")
      .text((d) => {
        if (d.name === "Paul") {
          return "Paul McCartney";
        }
        return "John Lennon";
      });

    // add title to bars
    barWrapper
      .append("text")
      .attr("x", 0)
      .attr("y", -60)
      .attr("dy", ".75em")
      .attr("font-size", "12px")
      .text("Average Popularity of Songs (Spotify metric)");

    const pieChart = svg.append("g").attr("transform", "translate(400, 100)");

    const numberOfSongsPaul = PaulSongs.length;
    const numberOfSongsJohn = JohnSongs.length;

    const pieData = [
      { name: "Paul", value: numberOfSongsPaul },
      { name: "John", value: numberOfSongsJohn },
    ];
    console.log(numberOfSongsPaul, numberOfSongsJohn);

    const pieScale = d3
      .scaleLinear()
      .domain([0, d3.max(pieData, (d) => d.value)])
      .range([0, 2 * Math.PI]);

    var pie = d3.pie().value(function (d) {
      return d.value;
    });

    const pieArc = d3.arc().innerRadius(0).outerRadius(50);

    const pieWrapper = pieChart
      .selectAll("g")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("transform", "translate(50, 50)");

    pieWrapper
      .append("path")
      .attr("d", pieArc)
      .attr("fill", (d) => {
        if (d.data.name === "Paul") {
          return colorPaul;
        } else {
          return colorJohn;
        }
      });

    // add text to pie chart with the data
    pieWrapper
      .append("text")
      .attr("x", (d) => pieArc.centroid(d)[0])
      .attr("y", (d) => pieArc.centroid(d)[1])
      .attr("dy", ".75em")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .text((d) => {
        return `${d.data.value}`;
      });

    // add title to pie chart
    pieChart
      .append("text")
      .attr("x", 0)
      .attr("y", -60)
      .attr("dy", ".75em")
      .text("Songs per artist");

    // add a legend to the pie chart
    const legend = pieChart
      .append("g")
      .attr("transform", "translate(100, 100)")
      .selectAll("g")
      .data(pieData)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        return `translate(0, ${i * 20})`;
      });

    legend
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => {
        if (d.name === "Paul") {
          return colorPaul;
        } else {
          return colorJohn;
        }
      });

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 10)
      .attr("font-size", "12px")
      // .attr("dy", ".75em")
      .text((d) => {
        if (d.name === "Paul") {
          return "Paul McCartney";
        }
        return "John Lennon";
      });
    this.setupAdvanced();

    // add text inside the pie chart

    // center bar charts in div
  }
  setupAdvanced() {
    const paulImage =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Paul_McCartney_Headshot_%28cropped%29.jpg/340px-Paul_McCartney_Headshot_%28cropped%29.jpg";
    const johnImage =
      "https://cdn.britannica.com/01/136501-050-D9110414/John-Lennon.jpg";

    const svg = this.svg;

    const g = svg.append("g").attr("transform", "translate(100, 100)");

    // add texts above pics
    g.append("text")
      .attr("x", 50)
      .attr("y", 420)
      .attr("dy", ".75em")
      .text("Paul McCartney");

    g.append("text")
      .attr("x", 250)
      .attr("y", 420)
      .attr("dy", ".75em")
      .text("John Lennon");

    // add title : click on the image to see the top 10 songs
    const g2 = svg.append("g").attr("transform", "translate(0, 350)");
    g.append("text")
      .attr("x", 50)
      .attr("y", 170)
      .attr("dy", ".75em")
      .text("Click on the image to see the top 10 songs");
    const top10Paul = this.paulSongs
      .sort((a, b) => {
        return b.popularity - a.popularity;
      })
      .slice(0, 10);

    const allSongsPaul = this.paulSongs.map((song) => {
      return song[0];
    });

    // all songs by john
    const allSongsJohn = this.johnSongs.map((song) => {
      return song[0];
    });

    // top 10 songs by john
    const top10John = this.johnSongs
      .sort((a, b) => {
        return b.popularity - a.popularity;
      })
      .slice(0, 10);

    // add images to svg
    g.append("image")
      .attr("xlink:href", paulImage)
      .attr("width", 200)
      .attr("height", 200)
      .attr("x", 0)
      .attr("y", 200)
      .attr("opacity", 0.9)
      // make brighter when hovering
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.9);
      })
      .on("click", () => {
        this.showTable(top10Paul);
        this.wordCloud(allSongsPaul, g2, "Paul");
      });

    g.append("image")
      .attr("xlink:href", johnImage)
      .attr("width", 200)
      .attr("height", 200)
      .attr("x", 200)
      .attr("y", 200)
      // attr opacity
      .attr("opacity", 0.9)
      // make brighter when hovering
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.9);
      })
      .on("click", () => {
        this.showTable(top10John);
        this.wordCloud(allSongsJohn, g2, "John");
      });
    // top 10 songs by paul

    console.log(top10John);
    // all songs by paul

    console.log(allSongsPaul);
  }

  wordCloud(myWords, g2, name) {
    // CLEAR G2
    g2.selectAll("*").remove();
    // add title to word cloud : top songs by Paul
    g2.append("text")
      // position above the word cloud
      .attr("x", 50)
      .attr("y", 300)
      .attr("dy", ".75em")
      .text(`Top songs by ${name}`);

    // clear the word cloud
    console.log(myWords);

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 0, bottom: 10, left: 0 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // var svg = d3.select("#my_dataviz").append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform",
    //           "translate(" + margin.left + "," + margin.top + ")");

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    console.log("YO");
    var layout = d3.layout
      .cloud()
      .size([width, height])
      .words(
        myWords.map(function (d) {
          console.log("YO", d);
          console.log(d);
          return { text: d };
        })
      )
      .padding(2)
      .fontSize(10)
      .on("end", draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Better not to touch it. To change parameters, play with the 'layout' variable above
    function draw(words) {
      g2.append("g")
        .attr(
          "transform",
          "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
        )
        .selectAll("text")
        .data(words)
        .enter()
        // on hover color changes
        .append("text")
        .style("font-size", function (d) {
          return d.size + "px";
        })
        .on("mouseover", function (d) {
          d3.select(this).style("fill", albumHex[albumHex.length - 1] || "red");
          // larger
          d3.select(this).style("font-size", "20px");
        })
        .on("mouseout", function (d) {
          d3.select(this).style("fill", "black");
          // smaller
          d3.select(this).style("font-size", "10px");
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
          return d.text;
        });
    }
  }

  showTable(data) {
    // add table to the div

    const table = d3.select("#table");
    // reset table
    table.html("");

    // add table headers
    // popularity duration_ms explicit (converted to mm ss) name
    const headers = ["Song", "Artist", "Duration", "Popularity"];
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    thead
      .append("tr")
      .selectAll("th")
      .data(headers)
      .enter()
      .append("th")
      .text((d) => {
        return d;
      });

    tbody
      .selectAll("tr")
      .data(data)
      .enter()
      .append("tr")
      .html((d) => {
        // popularity duration_ms explicit (converted to mm ss) name
        // convert duration_ms to mm:ss
        const duration = d.duration_ms / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `<td>${d.name}</td><td>${d[1]}</td><td>${minutes}:${seconds}</td><td>${d.popularity}</td>`;
      });
  }
}

// function JohnVPaul(data) {
//   let expanded = data[0];
//   const composer = data[1];

//   // parse Album data in expandend
//   expanded = expanded.map((d) => {
//     d.album = d.album.replaceAll("'", '"');
//     try {
//       d.album = JSON.parse(d.album);
//       d.album.release_date_formatted = new Date(d.album.release_date);
//       d.album.release_date_year = d.album.release_date_formatted.getFullYear();
//       return d;
//     } catch (e) {
//       d.parsed = false;
//       return d;
//     }
//   });

//   const composerWithExpanded = composer.map((d) => {
//     // regex to match names

//     const expandedData = expanded.find((e) => {
//       const replacedE = e.name
//         .replace("'", "")
//         .replace(".", "")
//         .replace("´", "");
//       const replacedD = d[0].replace("'", "").replace(".", "").replace("´", "");
//       return replacedE.includes(replacedD);
//     });
//     return { ...d, ...expandedData };
//   });

//   // filter out songs with no data
//   const filtered = composerWithExpanded.filter((d) => d.name !== undefined);
//   console.log(filtered);

//   const PaulSongs = filtered.filter((d) => d[1] === "McCartney");
//   const JohnSongs = filtered.filter((d) => d[1] === "Lennon");

//   const averagePopularityPaul = d3.mean(PaulSongs, (d) => +d.popularity);
//   const averagePopularityJohn = d3.mean(JohnSongs, (d) => +d.popularity);
//   const averageDurationPaul = d3.mean(PaulSongs, (d) => +d.duration_ms);
//   const averageDurationJohn = d3.mean(JohnSongs, (d) => +d.duration_ms);

//   // <div id="visThree"></div>

//   const svg = d3
//     .select("#visThree")
//     .append("svg")
//     .attr("width", 600)
//     .attr("height", 600);

//   // create a bar chart with the average popularity of paul vs john

//   const barWidth = 100;
//   const barHeight = 100;
//   const barPadding = 10;

//   const barData = [
//     { name: "Paul McCartney", value: averagePopularityPaul },
//     { name: "John Lennon", value: averagePopularityJohn },
//   ];

//   const barScale = d3
//     .scaleLinear()
//     .domain([0, d3.max(barData, (d) => d.value)])
//     .range([0, barHeight]);

//   const barWrapper = svg.append("g").attr("transform", "translate(100, 100)");

//   const bar = barWrapper
//     .selectAll("g")
//     .data(barData)
//     .enter()
//     .append("g")
//     .attr("transform", (d, i) => {
//       return `translate(${i * (barWidth + barPadding)}, 0)`;
//     });

//   bar
//     .append("rect")
//     .attr("width", barWidth)
//     .attr("height", (d) => barScale(d.value))
//     // add color to bars depending on artist yellow for john and blue for paul
//     .attr("fill", (d) => {
//       if (d.name === "Paul") {
//         return colorPaul;
//       } else {
//         return colorJohn;
//       }
//     })
//     .attr("y", (d) => barHeight - barScale(d.value));

//   // add text to bar chart
//   bar
//     .append("text")
//     .attr("x", barWidth / 2 - 10)
//     .attr("y", (d) => barHeight - barScale(d.value) - 30)
//     .attr("dy", ".75em")
//     .text((d) => {
//       return Math.round(d.value);
//     });

//   // add x axis
//   bar
//     .append("text")
//     .attr("x", barWidth / 2)
//     .attr("y", barHeight + 10)
//     .attr("dy", ".75em")
//     .text((d) => d.name);

//   // add title to bars
//   barWrapper
//     .append("text")
//     .attr("x", 0)
//     .attr("y", -60)
//     .attr("dy", ".75em")
//     .text("Average Popularity of Songs (spotify metric)");

//   const pieChart = svg.append("g").attr("transform", "translate(400, 100)");

//   const numberOfSongsPaul = PaulSongs.length;
//   const numberOfSongsJohn = JohnSongs.length;

//   const pieData = [
//     { name: "Paul McCartney", value: numberOfSongsPaul },
//     { name: "John Lennon", value: numberOfSongsJohn },
//   ];
//   console.log(numberOfSongsPaul, numberOfSongsJohn);

//   const pieScale = d3
//     .scaleLinear()
//     .domain([0, d3.max(pieData, (d) => d.value)])
//     .range([0, 2 * Math.PI]);

//   var pie = d3.pie().value(function (d) {
//     return d.value;
//   });

//   const pieArc = d3.arc().innerRadius(0).outerRadius(50);

//   const pieWrapper = pieChart
//     .selectAll("g")
//     .data(pie(pieData))
//     .enter()
//     .append("g")
//     .attr("transform", "translate(50, 50)");

//   pieWrapper
//     .append("path")
//     .attr("d", pieArc)
//     .attr("fill", (d) => {
//       if (d.data.name === "Paul") {
//         return colorPaul;
//       } else {
//         return colorJohn;
//       }
//     });

//   // add title to pie chart
//   pieChart
//     .append("text")
//     .attr("x", 0)
//     .attr("y", -60)
//     .attr("dy", ".75em")
//     .text("Number of Songs by Artist");

//   // add a legend to the pie chart
//   const legend = pieChart
//     .append("g")
//     .attr("transform", "translate(100, 100)")
//     .selectAll("g")
//     .data(pieData)
//     .enter()
//     .append("g")
//     .attr("transform", (d, i) => {
//       return `translate(0, ${i * 20})`;
//     });

//   legend
//     .append("rect")
//     .attr("width", 10)
//     .attr("height", 10)
//     .attr("fill", (d) => {
//       if (d.name === "Paul") {
//         return colorPaul;
//       } else {
//         return colorJohn;
//       }
//     });

//   legend
//     .append("text")
//     .attr("x", 15)
//     .attr("y", 10)
//     // .attr("dy", ".75em")
//     .text((d) => {
//       if (d.name === "Paul") {
//         return "Paul McCartney";
//       }
//       return "John Lennon";
//     });

//   // center bar charts in div
// }
