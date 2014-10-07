
console.log("ok");


// ************ DECLARATIONS

var margin = {top: 10, right: 100, bottom: 10, left: 10},
    width = window.innerWidth,
    width = width - margin.left - margin.right,
    height = d3.max([width * 1.3, 600]) - margin.top - margin.bottom;

var states,
    age;

var x = d3.scale.linear()
    .domain([0, 100])// Don't use max function. Hardcode 100 b/c 100 is the real-life maximum vaccination rate.
    .range([0, width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top")
    .tickSize(-height - margin.bottom);
    //.tickFormat(format);

var color = d3.scale.category10();

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis");

var menu = d3.select("#menu select")
  .on("change", change);

// ******** END DECLARATIONS

// ********* LOAD DATA, SORT & FILTER

d3.csv("data/flu_vaccination.csv", function(data) {

  states = data;

  var ages = d3.keys(states[0]).filter(function(key) {
    return key != "State";
  });

  color.domain(ages);

  states.forEach(function(state) {
    ages.forEach(function(age) {
      state[age] = state[age];
    });
  });

   menu.selectAll("option")
      .data(ages)
    .enter().append("option")
      .text(function(d) { return d; });

  // ******* DATA SORTED, LOADED, FILTERED

  //******** LEGEND

  d3.select("window").on("resize", resize);

  redraw();
}); // CLOSE INITIAL FUNCTION

var altKey;

d3.select(window)
    .on("keydown", function() { altKey = d3.event.altKey; })
    .on("keyup", function() { altKey = false; });

// ******** CHANGE FUNCTION

function change() {

  d3.transition()
      .duration(altKey ? 7500 : 750)
      .each(redraw);
}

//********* DRAW FUNCTION

function redraw() {

    var age1 = menu.property("value"),
    top = states.sort(function(a, b) { return b[age1] - a[age1]; });

  y.domain(top.map(function(d) { return d.State; }));

  var bar = svg.selectAll(".bar")
      .data(top, function(d) { return d.State; })
      .attr("class", "bar");

  // entering transition

  var barEnter = bar.enter().insert("g", ".axis")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(0," + (y(d.State) + height) + ")"; })
      .style("fill-opacity", 0); // this is when it's flipping around

  barEnter.append("rect")
      .attr("width", 50)
      .attr("height", y.rangeBand());

  barEnter.append("text")
      .attr("class", "label")
      .attr("x", -3)
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      // string "District of Columbia" is too long.
      .text( function (d) {
        if (d.State == "District of Columbia") {return "DC";}
        {return d.State;}
      });

  barEnter.append("text") // This sets up to add "*" when there is N/A
    .attr("class", "footnote")
    .attr("x", -3)
    .attr("y", y.rangeBand()/2)
    .attr("dy", ".35em")
    .attr("text-anchor", "start");


  // first transition done, now drawing updated bar

  age = age1;

  var barUpdate = d3.transition(bar)
      //transform it a little further right for the labels
      .attr("transform", function(d) { return "translate(80," + (d.y0 = y(d.State)) + ")"; })
      .style("fill-opacity", 1.0); // this is the default

  barUpdate.select("rect")
      .attr("width", function (d) { return x(d[age]);})
      .attr("fill", function (d) {
        if (d.State == "Georgia") {return "goldenrod";} // Highlight Georgia
        else {return color(age); } ;})
      .attr("fill-opacity", function (d) {
        if (d.State == "United States") {return 0.6;} ;});// Highlight U.S. average


  barUpdate.select("text.footnote") // this adds "*" where there is N/A
    .attr("x", function (d) {
      return x(d[age]);
    })
    .text(function (d) {
      if(d[age] == "") {return "*";}
      else {return "";}
    });



  // now wiping away bars

  var barExit = d3.transition(bar.exit())
      .attr("transform", function(d) { return "translate(0," + (d.y0 + height) + ")"; })
      .style("fill-opacity", 1) //this is when it's flipping around
      .remove();

  barExit.select("rect")
      .attr("width", 50);

  barExit.select(".value")
      .attr("x", function(d) { return x(d[age]) - 3; })
      .text(function(d) { return format(d[age]); });

  d3.transition(svg).select(".axis")
      //again, translate a little further right for space for labels
      .attr("transform", function(d) { return "translate(80," + 0 + ")"; })
      .call(xAxis);
}
// ****** END DRAW FUNCTION

// ******** RESIZE FUNCTION

function resize() {
  width = window.innerWidth;
  width = width - margin.left - margin.right;

  x.range([0, width]);
}
