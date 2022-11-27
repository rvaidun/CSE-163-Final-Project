
var mapSvg, tooltip, mapttstring;

var mapData;
var animalType, procedures, severity, totals;
var colorchoice = "orange";
var drawborder = true;
var margin = { left: 80, right: 80, top: 50, bottom: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
// This runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  mapSvg = d3.select("#dataviz");
  tooltip = d3.select(".tooltip");
  // set the dimensions of the svg
  mapSvg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  // Load both files before doing anything else
  getDataandDraw(2017);
  
});
function getDataandDraw(y) {
  Promise.all([d3.json("australia.geojson"), d3.csv(`at${y}.csv`), d3.csv(`s${y}.csv`), d3.csv(`p${y}.csv`)]).then(function (
    values
  ) {
    mapData = values[0];
    animalType = values[1];
    procedures = values[2];
    severity = values[3];
    console.log(animalType);
    drawMap();
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
  console.log(animalType)

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
  let extent = d3.extent(Object.values(totals).slice(1));
  console.log(extent);
  // console.log(extent);
  if (colorchoice == "orange") {
    var colorScale = d3.scaleSequential(d3.interpolateOrRd).domain(extent);
  } else {
    var colorScale = d3.scaleSequential(d3.interpolateBlues).domain(extent);
  }

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
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1);
      //Makes the new div disappear:
      tooltip.transition().duration("50").style("opacity", 0);
    });
  // .on("click", function (d, i) {
  //   drawLineChart(d.properties.name);
  // })

  // draw the legend for the map
  barWidth = 200;
  barHeight = 20;
  axisScale = d3.scaleLinear().domain(colorScale.domain()).range([10, 210]);

  axisBottom = (g) =>
    g
      .attr("class", `x-axis`)
      .attr("transform", `translate(0,400)`)
      .call(d3.axisBottom(axisScale).ticks(4).tickSize(-barHeight));

  const defs = mapSvg.append("defs");

  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient
    .selectAll("stop")
    .data(
      colorScale.ticks().map((t, i, n) => ({
        offset: `${(100 * i) / n.length}%`,
        color: colorScale(t),
      }))
    )
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  mapSvg
    .append("g")
    .attr("transform", `translate(0,380)`)
    .append("rect")
    .attr("transform", `translate(10, 0)`)
    .attr("width", 200)
    .attr("height", barHeight)
    .style("fill", "url(#linear-gradient)");
  mapSvg.append("g").call(axisBottom);
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
