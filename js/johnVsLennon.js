// import composer.json

// load data using promises
let promises2 = [
  d3.csv(
    "https://raw.githubusercontent.com/wahlforss/blaj/main/beatles_tracks_expanded.csv"
  ),
  d3.csv("https://raw.githubusercontent.com/wahlforss/blaj/main/composer.csv"),
];

Promise.all(promises2)
  .then(function (data) {
    JohnVPaul(data);
  })
  .catch(function (err) {
    console.log(err);
  });

// init Paul vs. John page

function JohnVPaul(data) {
  let expanded = data[0];
  const composer = data[1];

  // parse Album data in expandend
  expanded = expanded.map((d) => {
    d.album = d.album.replaceAll("'", '"');
    try {
      d.album = JSON.parse(d.album);
      d.album.release_date_formatted = new Date(d.album.release_date);
      d.album.release_date_year = d.album.release_date_formatted.getFullYear();
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
      const replacedD = d[0].replace("'", "").replace(".", "").replace("´", "");
      return replacedE.includes(replacedD);
    });
    return { ...d, ...expandedData };
  });

  // filter out songs with no data
  const filtered = composerWithExpanded.filter((d) => d.name !== undefined);

  const PaulSongs = filtered.filter((d) => d[1] === "McCartney");
  const JohnSongs = filtered.filter((d) => d[1] === "Lennon");

  const averagePopularityPaul = d3.mean(PaulSongs, (d) => +d.popularity);
  const averagePopularityJohn = d3.mean(JohnSongs, (d) => +d.popularity);
  const averageDurationPaul = d3.mean(PaulSongs, (d) => +d.duration_ms);
  const averageDurationJohn = d3.mean(JohnSongs, (d) => +d.duration_ms);

  // <div id="visThree"></div>

  const svg = d3
    .select("#visThree")
    .append("svg")
    .attr("width", 600)
    .attr("height", 600);

  // create a bar chart with the average popularity of paul vs john

  const barWidth = 100;
  const barHeight = 100;
  const barPadding = 10;

  const barData = [
    { name: "Paul", value: averagePopularityPaul },
    { name: "John", value: averagePopularityJohn },
  ];

  const barScale = d3
    .scaleLinear()
    .domain([0, d3.max(barData, (d) => d.value)])
    .range([0, barHeight]);

  const barWrapper = svg.append("g").attr("transform", "translate(100, 100)");

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
        return "blue";
      } else {
        return "yellow";
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
    .attr("x", barWidth / 2)
    .attr("y", barHeight + 10)
    .attr("dy", ".75em")
    .text((d) => d.name);

  // add title to bars
  barWrapper
    .append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("dy", ".75em")
    .text("Average Popularity of Songs");

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
        return "blue";
      } else {
        return "yellow";
      }
    });

  // add title to pie chart
  pieChart
    .append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("dy", ".75em")
    .text("Number of Songs by Artist");

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
        return "blue";
      } else {
        return "yellow";
      }
    });

  legend
    .append("text")
    .attr("x", 15)
    .attr("y", 10)
    // .attr("dy", ".75em")
    .text((d) => d.name);

  // center bar charts in div
}
