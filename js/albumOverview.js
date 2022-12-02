class AlbumOverview {


    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = []


        this.formatDate = d3.timeFormat("%Y"); // Returns: "2020"
        this.parseDate = d3.timeParse("%Y"); // Returns: Wed Jan 01 2020 00:00:00 GMT-0500 (EST)
        this.durationScale = d3.scaleLinear().domain([0, 0]).range([0, 20]);
// let color = d3.scaleLinear().range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);
        this.color = d3.scaleOrdinal().range(["goldenrod", "darkorange", "peachpuff", "lightpink", "navy", "royalblue", "teal", "mediumseagreen", "yellowgreen", "mediumvioletred", "rosybrown", "lightskyblue", "forestgreen"]);


        console.log("DATA: " + data)
        this.initVis()


    }


    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

        vis.width = 600; //document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500; // document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#visTwo").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");



        vis.xscale = d3.scaleTime().domain([0, 0]).range([0, vis.width]);
        vis.yscale = d3.scaleLinear().domain([0, 0]).range([vis.height, 0]);

        // Axes
        vis.xAxis = d3.axisBottom();
        vis.xAxis.scale(vis.xscale)
            .tickFormat(vis.formatDate)
            .ticks(3);

        vis.yAxis = d3.axisLeft();
        vis.yAxis.scale(vis.yscale);

        vis.xAxisGroup = vis.svg.append("g").attr("class", "axis x-axis")
            .attr("transform", "translate(0," + (vis.height +10) + ")");

        vis.yAxisGroup = vis.svg.append("g").attr("class", "axis y-axis")
            .attr("transform", "translate(-30,0)");

        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.width - 25) + " ," + (vis.height - 10) + ")")
            .style("text-anchor", "middle")
            .text("Year");

        vis.svg.append("text")
            .attr("id", "yaxislabel");

        vis.svg.append("text")
            .attr("id", "chartTitle");

        vis.plottype;

        // initialize UI items
        vis.slider = document.getElementById("time-period-slider");
        vis.lowerLabel = document.getElementById("lowerlabel");
        vis.upperLabel = document.getElementById("upperlabel");








        this.wrangleData()


    }


    wrangleData() {
        console.log("in wrangledata!")
        console.log(this.displayData)

        let vis = this

        vis.data.forEach(row => {
            row.year = vis.parseDate(row.year);
            // row.album = +row.album;
            row.tracks = +row.trackNum;
            row.track_number = +row.track_number;
            row.popularity = +row.popularity;
            row.song = row.song.toString();
        })


        vis.displayData = vis.data;
        console.log(this.displayData)



        // Set default load state
        vis.xscale.domain([d3.min(vis.displayData.map(d => d.year)), d3.max(vis.displayData.map(d => d.year))]);
        vis.yscale.domain([0, d3.max(vis.displayData.map(d => d.tracks))]);
        vis.durationScale.domain([0, d3.max(vis.displayData.map(d => (d.popularity)))]);
        vis.color.domain([vis.displayData.map(d => d.album)])

    // define slider functionality - notice that you need to provide the slider's location
        noUiSlider.create(vis.slider, {
            start: [vis.formatDate(d3.min(vis.data.map(d => d.year))), vis.formatDate(d3.max(vis.data.map(d => d.year)))],
            connect: true,
            behaviour: 'drag',
            step: 1,
            margin: 1,
            range: {
                'min': [parseInt(vis.formatDate(d3.min(vis.data.map(d => d.year))))],
                'max': [parseInt(vis.formatDate(d3.max(vis.data.map(d => d.year))))]
            }

        });

        // attach an event listener to the slider
        vis.slider.noUiSlider.on('slide', function (values, handle) {
            vis.plottype = d3.select("#plot-type").property("value");
            vis.updateFilters(vis.data, values)


        });

        // Listen for changes in rank selector
        d3.select("#plot-type").on("change", function () {
            vis.plottype = d3.select("#plot-type").property("value");
            vis.updateFilters(vis.data, vis.slider.noUiSlider.get());

        })


        this.updateVisualization("tracks");
    }



    // Render visualization
    updateVisualization(plottype) {

        let vis = this;
        console.log(plottype)

        vis.displayData.sort((a, b) => a.year - b.year);

        console.log(vis.displayData)

        let circles = vis.svg.selectAll("circle")
            .data(vis.displayData, d=>d.song);

        circles.exit().remove()

        console.log(circles)
        console.log("just printed circles")
        circles.enter()
            .append("circle")
            .attr("class", "track")
            .on("mouseover", function(event, d) {
                vis.showEdition(d);
            })
            .merge(circles)
            .transition()
            .duration(800)
            .attr("fill", d=>vis.color(d.album))
            // .attr("r", d => vis.durationScale(d.popularity))
            .attr("r", d=> +d.popularity/5)
            .attr("cx", d => vis.xscale(d.year))
            .attr("cy", d => vis.yscale(d[plottype]));


        // Update axes:
        vis.xAxis.scale(vis.xscale);
        vis.yAxis.scale(vis.yscale);
        vis.xAxisGroup.transition().duration(800).call(vis.xAxis);
        vis.yAxisGroup.transition().duration(800).call(vis.yAxis);


        // Modify ugly plottypes to short labels
        let plottypelabel = "";
        if (plottype === "tracks") {
            plottypelabel = "Number of Tracks";
        }
        else if (plottype === "popularity") {
            plottypelabel = "Popularity To Date";
        }
        else { plottypelabel = plottype; }


        // Update axis label for y axis
        vis.svg.select("#yaxislabel")
            .attr("transform","rotate(-90)")
            .attr("y", -10)
            .attr("x", 80-vis.height)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(plottypelabel);

        // Update chart title
        vis.svg.select("#chartTitle")
            .attr("transform","translate(" + (vis.width/2) + " ," + (-20) + ")")
            .style("text-anchor", "middle")
            .text(plottypelabel + " By Year");


    }


    // Show details for a specific Album

    showEdition(d){

    // Toggle visibility of placeholder and detail table
    d3.select("table")
        .style("visibility", "visible");

    d3.select("#albumdetail")
        .style("display", "block");

    d3.select("#placeholder")
        .style("visibility", "hidden");

    // Render selected album image
    d3.select("#albumcover")
        .attr("src", "img/" + d.image)
        .attr("width", 800)
        .attr("class", "detailImage");


    // Render detailed stats into table
    this.addElement("detailTitle", d.album.toString());
    this.addElement("detailDate", d3.timeFormat("%Y")(d.year));
    this.addElement("detailTrack",d.song.toString());
    this.addElement("detailTrackNum", d.track_number);
    this.addElement("detailPop", d.popularity);

    }


// Load in table elements by tag
    addElement(tagname, tagvalue) {
        let tempTag = document.getElementById(tagname);
        tempTag.innerText = tagvalue;
    }

    updateFilters(csv, values) {

        let vis = this;

        console.log("in updatefilters!")
        this.addElement("lowerlabel", Math.floor(values[0]));
        this.addElement("upperlabel", Math.floor(values[1]));

        // Filter dataset for elements between those years
        let rangeData = csv.filter(function(d) {
            if (parseInt(vis.formatDate(d.year)) < values[1]+1 && parseInt(vis.formatDate(d.year)) >= values[0]) {
                return d;
            }
        });

        // Update x and y scales of filtered data
        vis.xscale.domain([d3.min(rangeData.map(d=>d.year)),d3.max(rangeData.map(d=>d.year))]);
        vis.yscale.domain([0,d3.max(rangeData.map(d=>d[vis.plottype]))]);

        vis.displayData = rangeData;
        this.updateVisualization(vis.plottype);
    }


}