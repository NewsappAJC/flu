

console.log("ok");

//YEAR,  WEEK,  ILITOTAL,  TOTAL PATIENTS,  NUM OF PROVIDERS,  PERCENT_WEIGHTED_ILI,  PERCENT_UNWEIGHTED_ILI

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = window.innerWidth - 20,
    width = width - margin.left - margin.right,
    // width = 768,
    height = d3.max([(width*0.4) - margin.top - margin.bottom, 200]);

var x = d3.scale.linear()
   .domain([0, 52])
   .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 7])
    .range([height, 0]);

var x_axis_labels = d3.scale.ordinal() // called on xAxis
  .rangePoints([0, width])
  .domain([" Aug.", " Sept.", " Oct.", " Nov.", " Dec.", " Jan.", " Feb.", " Mar.", " Apr.", " May", " June", " July"]);

var xAxis = d3.svg.axis()
    .scale(x_axis_labels)
    .tickSize(0)
    .orient("bottom")
    .ticks(12);

var yAxis = d3.svg.axis()
  .scale(y)
  .tickSize(0)

  .orient("left");

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var line = d3.svg.line()
  .interpolate("basis")
  .x(function (d) {return x(d.seasonal_week) ;})
  .y(function (d) {return y(d.rate); });

var color = d3.scale.category10();




var y2008_2009_string = d3.select(".explainerHolder").append("div")
  .attr("id", "y2008-2009")
  .attr("class", "explainer")
  .text("The novel 2009 H1N1 virus began appearing in the south in May.");

var y2009_2010_string = d3.select(".explainerHolder").append("div")
  .attr("id", "y2009-2010")
  .attr("class", "explainer")
  .text("Flu peaked early, in October. The DPH also saw unusual summer flu activity. They blame it on the then-novel 2009 H1N1 virus.");

var y2010_2011_string = d3.select(".explainerHolder").append("div")
  .attr("id", "y2010-2011")
  .attr("class", "explainer")
  .text("In early 2011, more of the positive flu tests the CDC saw were part of the H3 group, which is associated with more severe illness.");

var y2011_2012_string = d3.select(".explainerHolder").append("div")
  .attr("id", "y2011-2012")
  .attr("class", "explainer")
  .text("The predominant flu varied by region in 2011-2012. Hospitalization rates were lower than the year previous for all age groups.");

var y2012_2013_string = d3.select(".explainerHolder").append("div")
  .attr("id", "y2012-2013")
  .attr("class", "explainer")
  .text("The severe H3N2 virus predominated nationwide, according to the CDC, leading to higher rates of hospitlization and death than in recent years.");

var y2013_2014_string = d3.select(".explainerHolder").append("div")
  .attr("id", "y2013-2014")
  .attr("class", "explainer")
  .text("In Georgia, the H1N1 that first appeared in 2009 particularly impacted healthy young adults, according to the DPH.");

var menu = d3.select("#menu select")
    .on("change", change);



// ***** convert week enumeration into something we can use *******
// I want x=0 to be September, not January ... so that we keep the winter months, the flu months, together
// Flu season starts about week 30
// But weeks are numbered in their data .range([0, 52])
// How to graph ([30, 29_of_the_next_year])?
// How about convert the first week in January to Week 53?
// So range = ([30 - 82])

function seasonWeek(some_num) {
  //some_num is the numerical week of the year, as it comes in the raw data
  // what returns is the week of the flu year.
  if (some_num < 31) {return some_num + 31;}
  else {return some_num-31;}
;}

function seasonAssigner(num1, num2) {
  // numb 1 is calendar week, num 2 is year
  //output is a string representing the flu season, like "2008 2009"
  if (num1 < 31) {return (num2 -1) + "-" + num2;}
  else {return num2 + "-" + (num2+1);}
;}

// ***** close week enumeration converter ********

// ********* LOAD DATA

//CATCHMENT, NETWORK, SEASON,  MMWR-YEAR, MMWR-WEEK, AGE, CATEGORY,  RATE
d3.csv("data/flu_hospitalization.csv", function (south_error, south_data){


color.domain(d3.keys(south_data[0]).filter(function(key) {return key == 'YEAR'; }));


  south_data.forEach(function (d) {
    d.rate = +d.RATE,
    d.calendar_week = +d.WEEK,
    d.seasonal_week = seasonWeek(+d.WEEK),
    d.year = +d.YEAR,
    d.season = seasonAssigner(d.calendar_week, d.year)
    d.region = d.REGION;
  });

  //nest data by season

  south_data = d3.nest()
    .key(function (d) {return d.season; })
    .entries(south_data);

  //draw


  var south_seasons = svg.selectAll(".season")
    .data(south_data, function (d) {return d.key; })
    .enter().append("g")
    .attr("id", function (d) {return "y" + d.key;})
    .attr('class', 'line');

  south_seasons.append("path")
    .attr("class", "line")
    .attr("opacity", 0.5)
    .attr("d", function (d) { return line(d.values); })
    .style("stroke", function (d) {return color(d.key); })
        .on("mouseover", function (d) {
          d3.selectAll("#y" + d.key).select(".line").transition().delay(100).style("stroke-width", "5").style("opacity", 1);
          d3.selectAll("div#y" + d.key).transition().delay(100).style("opacity", 1); })
        .on("mouseout", function (d) {
          d3.selectAll("#y" + d.key).select(".line").transition().delay(200).style("stroke-width", "2").style("opacity", 0.5) ;
          d3.selectAll("div#y" + d.key).transition().delay(100).style("opacity", 0); });


  // Add axes
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0-margin.left)
      .attr("x", 0-height/2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("percent of hospital visits for influenza-like symptoms");

  menu.selectAll("option")
    .data(south_data)
    .enter().append("option")
    .text(function (d, i) {return south_data[i].key; });


  menu.property("value", "2008-2009");
  redraw_lines();
});

function change(){
  d3.transition()
  .duration(500)
  .each(redraw_lines);
}

function redraw_lines(){
 d3.selectAll("#legend div").transition().style("opacity", 0);

  var temp_var = menu.property("value");



  if (temp_var == "2008-2009") {(d3.selectAll("div#y2008-2009.explainer").transition().style("opacity", 1));}
  if (temp_var == "2009-2010") {(d3.selectAll("div#y2009-2010.explainer").transition().style("opacity", 1));}
  if (temp_var == "2010-2011") {(d3.selectAll("div#y2010-2011.explainer").transition().style("opacity", 1));}
  if (temp_var == "2011-2012") {(d3.selectAll("div#y2011-2012.explainer").transition().style("opacity", 1));}
  if (temp_var == "2012-2013") {(d3.selectAll("div#y2012-2013.explainer").transition().style("opacity", 1));}
  if (temp_var == "2013-2014") {(d3.selectAll("div#y2013-2014.explainer").transition().style("opacity", 1));}



  d3.selectAll(".line")
  //console.log(menu.property("value"))
  .style("opacity", function (d) {
    if (d.key == menu.property("value")) {return 1;}
    else {return 0.5;}
  });
}



