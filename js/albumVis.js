/* * * * * * * * * * * * * *
 *      class AlbumVis      *
 * * * * * * * * * * * * * */

let albumClicked = "";
let albumHex = [];

class AlbumVis {
  constructor(parentElement, albumData) {
    this.parentElement = parentElement;
    this.albumData = albumData;

    this.initVis();
  }

  initVis() {
    let vis = this;

    console.log(vis.albumData);

    vis.margin = { top: 20, right: 20, bottom: 20, left: 40 };
    vis.width =
      document.getElementById(vis.parentElement).getBoundingClientRect().width -
      vis.margin.left -
      vis.margin.right;
    vis.height =
      document.getElementById(vis.parentElement).getBoundingClientRect()
        .height -
      vis.margin.top -
      vis.margin.bottom;

    // init drawing area
    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    vis.xScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5])
      .range([0, vis.width])
      .padding(0.1);

    // insert album images into svg
    vis.albums = vis.svg.selectAll("image").data(vis.albumData);

    vis.albums
      .enter()
      .append("svg:image")
      .attr("x", (d) => vis.xScale(parseInt(d.place)) + 50)
      .attr("y", function (d, i) {
        if (i < 6) {
          return vis.margin.top;
        } else {
          return vis.margin.top + vis.margin.bottom + 200;
        }
      })
      .attr("width", 150)
      .attr("height", 150)
      .attr("xlink:href", (d, i) => "img/" + i + ".jpg");

    // insert background rectangles for interacting with the album images
    vis.backGround = vis.svg.selectAll("rect").data(vis.albumData);

    vis.backGround
      .enter()
      .append("rect")
      .attr("x", (d) => vis.xScale(parseInt(d.place)) + 50)
      .attr("y", function (d, i) {
        if (i < 6) {
          return vis.margin.top;
        } else {
          return vis.margin.top + vis.margin.bottom + 200;
        }
      })
      .attr("width", 150)
      .attr("height", 150)
      .attr("fill", "black")
      .attr("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.25);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("opacity", 0);
      })
      .on("click", function (event, d) {
        console.log(d, "clicked");
        albumClicked = d.album;
        johnvsPaul.updateVis();
        vis.updatePalette(d);
      });

    // insert interactive album name labels
    vis.albumText = vis.svg.selectAll(".album-label").data(vis.albumData);

    vis.albumText
      .enter()
      .append("text")
      .attr("class", "alb-text")
      .attr("x", (d) => vis.xScale(parseInt(d.place)) + 50 + 75)
      .attr("y", function (d, i) {
        if (i < 6) {
          return vis.margin.top + 170;
        } else {
          return vis.margin.top + vis.margin.bottom + 370;
        }
      })
      .style("dominant-baseline", "middle")
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .text((d) => d.album)
      .on("mouseover", function (event, d) {
        d3.select(this).style("font-size", "12px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).style("font-size", "11px");
      })
      .on("click", function (event, d) {
        console.log(d, "clicked");
        albumClicked = d.album;
        johnvsPaul.updateVis();
        vis.updatePalette(d);
      });

    // insert interactive album year labels
    vis.yearText = vis.svg.selectAll(".year-label").data(vis.albumData);

    vis.yearText
      .enter()
      .append("text")
      .attr("class", "alb-text")
      .attr("x", (d) => vis.xScale(parseInt(d.place)) + 50 + 75)
      .attr("y", function (d, i) {
        if (i < 6) {
          return vis.margin.top + 185;
        } else {
          return vis.margin.top + vis.margin.bottom + 385;
        }
      })
      .style("dominant-baseline", "middle")
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .text((d) => "(" + d.year + ")")
      .on("mouseover", function (event, d) {
        d3.select(this).style("font-size", "12px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).style("font-size", "11px");
      })
      .on("click", function (event, d) {
        console.log(d, "clicked");
        albumClicked = d.album;
        johnvsPaul.updateVis();
        vis.updatePalette(d);
      });

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    console.log("data wrangled");
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    console.log("vis updated");
  }

  updatePalette(d) {
    let vis = this;

    // grab hex values in an array from album hex string
    let hexValues = d.hexValues.split(",");
    albumHex = hexValues;
    console.log(hexValues);

    // update title page to first color
    d3.select("#title-header").style("color", hexValues[0]);

    // update row background to second color
    d3.select(".row").style("background-color", hexValues[1]);

    d3.selectAll("h2").style("color", hexValues[2]);

    d3.selectAll("h3").style("color", hexValues[3]);

    d3.selectAll("p").style("color", hexValues[4]);

    d3.selectAll("table").style("color", hexValues[4]);

    d3.selectAll(".alb-text").style("fill", hexValues[4]);

    d3.selectAll(".axis text").style("fill", hexValues[4]);

    d3.selectAll(".axis line").style("stroke", hexValues[4]);

    d3.selectAll(".axis path").style("stroke", hexValues[4]);

    d3.selectAll("svg text").style("fill", hexValues[4]);

    d3.selectAll("svg g text").style("fill", hexValues[4]);

    // create palette at bottom of svg of all hex colors on selected album
    vis.paletteRect = vis.svg.selectAll(".palette-rect").data(hexValues);

    vis.paletteRect
      .enter()
      .append("rect")
      .attr("x", (d, i) => vis.width / 2 - 40 + i * 25)
      .attr("y", vis.height - 25)
      .attr("width", 25)
      .attr("height", 25)
      .attr("fill", (d) => d);
  }
}
