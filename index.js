var mapSvg, tooltip, mapttstring, sliderSvg, piechartdiv;

var mapData;
var animalType, procedures, severity, totals;
var colorchoice = "orange";
var drawborder = true;
var margin = { left: 80, right: 80, top: 50, bottom: 50 };
var curYear = 2017;

let audict = {
  Victoria: "VIC",
  "New South Wales": "NSW",
  "South Australia": "SA",
  Tasmania: "TAS",
  Queensland: "QLD",
  "Australian Capital Territory": "ACT",
  "Western Australia": "WA",
  "Northern Territory": "NT",
};

(width = 510 - margin.left - margin.right),
  (height = 500 - margin.top - margin.bottom);
// This runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  mapSvg = d3.select("#dataviz");
  tooltip = d3.select(".tooltip");
  sliderSvg = d3.select("#slider");
  piechartdiv = d3.select("#piecharts");
  // set the dimensions of the svg
  mapSvg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  // Load both files before doing anything else
  drawSlider();

  getDataandDraw();
});
function getDataandDraw(y) {
  Promise.all([
    d3.json("australia.geojson"),
    d3.csv(`data/Final Project Data - at${curYear}.csv`),
    d3.csv(`data/Final Project Data - s${curYear}.csv`),
    d3.csv(`data/Final Project Data - p${curYear}.csv`),
  ]).then(function (values) {
    mapData = values[0];
    animalType = values[1];
    procedures = values[2];
    severity = values[3];
    console.log(animalType);
    drawMap();
    drawCountryPieCharts();
  });
}
// Draw the map in the #map svg
function drawMap() {
  mapSvg.selectAll("*").remove();
  // create the map projection and geoPath
  let projection = d3
    .geoMercator()
    .scale(400)
    .center(d3.geoCentroid(mapData))
    .translate([
      +mapSvg.style("width").replace("px", "") / 2,
      +mapSvg.style("height").replace("px", "") / 2.3,
    ])
    // make projection bigger
    .scale(700);
  let path = d3.geoPath().projection(projection);
  console.log(animalType);

  // find array where 'ANIMAL TYPE' is 'TOTALS'
  totals = animalType.find((d) => d["ANIMAL TYPE"] == "TOTALS");

  // convert all numbers on totals to integers
  for (let key in totals) {
    if (key != "ANIMAL TYPE") {
      // remove commas from numbers
      totals[key] = parseInt(totals[key].replace(/,/g, ""));
      // if number is NaN, set it to 0
      if (isNaN(totals[key])) {
        totals[key] = 0;
      }
    }
  }
  console.log(totals);
  // find the extent of the totals
  // let extent = d3.extent(Object.values(totals).slice(1));
  // console.log(extent);
  // console.log(extent);
  // if (colorchoice == "orange") {
  //   var colorScale = d3.scaleSequential(d3.interpolateOrRd).domain(extent);
  // } else {
  //   var colorScale = d3.scaleSequential(d3.interpolateBlues).domain(extent);
  // }

  // draw the map on the #map svg
  let g = mapSvg.append("g");
  g.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", (d) => {
      return d.properties.name;
    })
    .attr("class", "countrymap")
    .style("fill", (d) => {
      //   let val = popData.filter((p) => {
      //     return p["GCT_STUB.target-geo-id"] == d.properties.GEO_ID;
      //   })[0]["Density per square mile of land area"];
      //   if (isNaN(val)) return "grey";
      //   return colorScale(val);
      return "grey";
    })
    .style("stroke", drawborder ? "black" : "none")
    .on("mouseover", function (d, i) {
      //   let val = popData.filter((p) => {
      //     return p["GCT_STUB.target-geo-id"] == d.properties.GEO_ID;
      //   })[0]["Density per square mile of land area"];
      if (drawborder)
        d3.select(this).style("stroke", "cyan").style("stroke-width", 4);
      console.log(d);
      mapttstring = `State: ${d.properties.STATE_NAME}`;
      tooltip.transition().duration(50).style("opacity", 1);
    })
    .on("mousemove", function (d, i) {
      tooltip
        .html(mapttstring)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 15 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).style("stroke", "black").style("stroke-width", 1);
      //Makes the new div disappear:
      tooltip.transition().duration("50").style("opacity", 0);
    })
    .on("click", function (d, i) {
      drawPieCharts(d.properties.STATE_NAME);
    });

  // draw the legend for the map
  // barWidth = 200;
  // barHeight = 20;
  // axisScale = d3.scaleLinear().domain(colorScale.domain()).range([10, 210]);

  // axisBottom = (g) =>
  //   g
  //     .attr("class", `x-axis`)
  //     .attr("transform", `translate(0,400)`)
  //     .call(d3.axisBottom(axisScale).ticks(4).tickSize(-barHeight));

  // const defs = mapSvg.append("defs");

  // const linearGradient = defs
  //   .append("linearGradient")
  //   .attr("id", "linear-gradient");

  // linearGradient
  //   .selectAll("stop")
  //   .data(
  //     colorScale.ticks().map((t, i, n) => ({
  //       offset: `${(100 * i) / n.length}%`,
  //       color: colorScale(t),
  //     }))
  //   )
  //   .enter()
  //   .append("stop")
  //   .attr("offset", (d) => d.offset)
  //   .attr("stop-color", (d) => d.color);

  // mapSvg
  //   .append("g")
  //   .attr("transform", `translate(0,380)`)
  //   .append("rect")
  //   .attr("transform", `translate(10, 0)`)
  //   .attr("width", 200)
  //   .attr("height", barHeight)
  //   .style("fill", "url(#linear-gradient)");
  // mapSvg.append("g").call(axisBottom);
}

function togglePieChart() {
    drawCountryPieCharts();
}

function togglecolor() {
  if (colorchoice == "orange") {
    colorchoice = "blue";
  } else {
    colorchoice = "orange";
  }
  drawMap();
}

function toggleborder() {
  drawborder = !drawborder;
  drawMap();
}

function drawCountryPieCharts()
{
    let countryDataAT = [];
    let countryDataProced = [];
    let countryDataPurp = [];
    console.log("BROOO");
    // for each animal in animalType save the data for all of Australia
    animalType.forEach((d) => {
      // if the animal type is'TOTALS' exit out of the loop
      if (d["ANIMAL TYPE"] == "TOTALS") return;
      // find the total value
      let totalVal = d["TOTAL"];
      totalVal = parseInt(totalVal.replace(/,/g, ""));
      // if the value is not a number, set it to 0
      if (isNaN(totalVal)) totalVal = 0;
      countryDataAT.push({
        animal: d["ANIMAL TYPE"],
        value: totalVal,
      });
    });
    procedures.forEach((d) => {
      // if the procedure is 'TOTALS' exit out of the loop
      if (d["SEVERITY OF PROCEDURE"] == "TOTALS") return;
      // find the total value
      let totalVal2 = d["TOTAL"];
      totalVal2 = parseInt(totalVal2.replace(/,/g, ""));
      // if the value is not a number, set it to 0
      if (isNaN(totalVal2)) totalVal2 = 0;
      countryDataProced.push({
        animal: d["SEVERITY OF PROCEDURE"],
        value: totalVal2,
      });
    });
    severity.forEach((d) => {
    console.log(d);
    // if the purpose is 'TOTALS'
    if (d["PURPOSE "] == "TOTALS") return;
    // find the total value
    let totalVal3 = d["TOTAL"];
    totalVal3 = parseInt(totalVal3.replace(/,/g, ""));
    // if the value is not a number, set it to 0
    if (isNaN(totalVal3)) totalVal3 = 0;
    // save the data
    countryDataPurp.push({
      animal: d["PURPOSE "],
      value: totalVal3,
    });
  });
  var piechartdiv = d3.select("#piecharts");
  piechartdiv.selectAll("*").remove();
  drawPieChart(piechartdiv, countryDataAT, "Animal");
  drawPieChart(piechartdiv, countryDataProced, "Purpose");
  drawPieChart(piechartdiv, countryDataPurp, "Severity");
  console.log(countryDataAT);
}

// Add titles for the pie Charts
const para = document.createElement("p");
const node = document.createTextNode("This is new.");
para.appendChild(node);

const element = document.getElementById("div1");
const child = document.getElementById("p1");
element.insertBefore(para, child);

function drawPieCharts(state) {
  // draw a pie chart for the selected state
  // find the data for the selected state

  // loop though the animalType and save the data for the selected state
  let stateData = [];
  let purposeData = [];
  let severityData = [];
  let stateAbbr = audict[state];
  // for each animal type in animalType save the data
  animalType.forEach((d) => {
    // if the animal type is not 'TOTALS'
    if (d["ANIMAL TYPE"] == "TOTALS") return;
    // find the data for the selected state
    // get the abbreviation for the state
    // get the data for the state
    let stateVal = d[stateAbbr];
    // convert stateval to integer and remove commas
    stateVal = parseInt(stateVal.replace(/,/g, ""));
    // if the value is not a number, set it to 0
    if (isNaN(stateVal)) stateVal = 0;
    // save the data
    stateData.push({
      animal: d["ANIMAL TYPE"],
      value: stateVal,
    });
  });
  procedures.forEach((d) => {
    // if the purpose is not 'TOTALS'
    if (d["SEVERITY OF PROCEDURE"] == "TOTALS") return;
    // get the data for the state
    let stateVal = d[stateAbbr];
    // convert stateval to integer and remove commas
    stateVal = parseInt(stateVal.replace(/,/g, ""));
    // if the value is not a number, set it to 0
    if (isNaN(stateVal)) stateVal = 0;
    // save the data
    purposeData.push({
      animal: d["SEVERITY OF PROCEDURE"],
      value: stateVal,
    });
  });
  severity.forEach((d) => {
    console.log(d);
    // if the purpose is not 'TOTALS'
    if (d["PURPOSE "] == "TOTALS") return;
    // get the data for the state
    let stateVal = d[stateAbbr];
    // convert stateval to integer and remove commas
    stateVal = parseInt(stateVal.replace(/,/g, ""));
    // if the value is not a number, set it to 0
    if (isNaN(stateVal)) stateVal = 0;
    // save the data
    severityData.push({
      animal: d["PURPOSE "],
      value: stateVal,
    });
  });
  piechartdiv.selectAll("*").remove();
  drawPieChart(piechartdiv, stateData, "Animal");
  drawPieChart(piechartdiv, purposeData, "Purpose");
  drawPieChart(piechartdiv, severityData, "Severity");
  // draw pie chart in the #piechart svg
  // set the dimensions and margins of the graph
}

function drawPieChart(piechartdiv, stateData, n) {
  console.log(n, stateData);
  var width = 500;
  var height = 500;
  var margin = 40;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(width, height) / 2 - margin;
  piechartsvg = piechartdiv
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var colorpie = d3.scaleOrdinal().domain(stateData).range(d3.schemeSet2);

  var pie = d3.pie().value(function (d) {
    return d.value;
  });

  var arc_generator = d3.arc().innerRadius(0).outerRadius(radius);
  console.log();
  data_ready = pie(stateData);
  console.log(data_ready);
  piechartsvg
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc_generator)
    .attr("fill", function (d) {
      return colorpie(d.data.animal);
    })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .on("mouseover", function (d, i) {
      d3.select(this).style("stroke", "cyan").style("stroke-width", 4);
      console.log(d);
      mapttstring = `${n}: ${d.data.animal}`;
      // calculate the percentage of the total
      let total = 0;
      stateData.forEach((d) => {
        total += d.value;
      });
      let percent = (d.data.value / total) * 100;
      mapttstring += `<br/>
      Percent: ${percent.toFixed(2)}%`;
      let value = d.data.value.toLocaleString();
      mapttstring += `<br/>
      Value: ${value}`;
      tooltip.transition().duration(50).style("opacity", 1);
    })
    .on("mousemove", function (d, i) {
      tooltip
        .html(mapttstring)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 15 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).style("stroke", "black").style("stroke-width", 2);
      //Makes the new div disappear:
      tooltip.transition().duration(50).style("opacity", 0);
    });

  piechartsvg
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("text")
    .text(function (d) {
      if (d.endAngle - d.startAngle < 0.1) return "";
      let value = d.data.value.toLocaleString();
      return `${value} ${d.data.animal}`;
    })
    .attr("transform", function (d) {
      // return "translate(" + arc_generator.centroid(d) + ")";
      // if text doesn't fit, don't show it
      // rotate the text 45 degrees
      return "translate(" + arc_generator.centroid(d) + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", 13);
}

function drawSlider() {
  // Time
  var dataTime = d3.range(0, 5).map(function (d) {
    return new Date(2013 + d, 1, 1);
  });
  console.log(dataTime);

  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(300)
    .tickFormat(d3.timeFormat("%Y"))
    .tickValues(dataTime)
    .default(new Date(curYear, 1, 1))
    .on("onchange", (val) => {
      // d3.select("p#value-time").text(d3.timeFormat("%Y")(val));
      var newcurYear = d3.timeFormat("%Y")(val);
      if (newcurYear != curYear) {
        curYear = newcurYear;
        getDataandDraw();
        // clear pie chart
        piechartdiv.selectAll("*").remove();
      }
    });

  var gTime = d3
    .select("div#slider-time")
    .append("svg")
    .attr("width", 500)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gTime.call(sliderTime);

  // d3.select("p#value-time").text(d3.timeFormat("%Y")(sliderTime.value()));
}
