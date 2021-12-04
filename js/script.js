function drawLinePlot(data, name) {

    // set the dimensions and margins of the graph
    var size = 60;
    var m = 10;
    const margin = {top: m, right: m, bottom: m, left: m},
    width = size,
    height = size;
  
  // append the svg object to the body of the page
  const svg = d3.select("#viz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .on("mouseover", function(){
        d3.select(this).style('background', 'rgba(255,0,0,0.5)');
      })
      .on("mouseout", function(){
        d3.select(this).style('background', 'white');
      })
      .on("click", function(){
        console.log(name);
      })
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add X axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.lng; }))
    .range([ 0, width ]);

  // Add Y axis
  const y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.lat; }))
    .range([ height, 0 ]);

  // Draw the line
  svg.append("path")
      .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .curve(d3.curveStepAfter)
            .x(function(d) { return x(d.lng); })
            .y(function(d) { return y(d.lat); })
        );
}

function initMap(src) {
  d3.json(src).then(function(data) {
      data = data.filter(function(d) { return d.map.summary_polyline != null });
      data = data.filter(function(d) { return d.type == "Run" });

      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: { lat: 41.941770000000005, lng: -87.65117000000001 },
        mapTypeId: "terrain",
      });

      data.forEach(d => {
        var path = google.maps.geometry.encoding.decodePath(d.map.summary_polyline);

        const flightPlanCoordinates = [];
  
        path.forEach(d => {
            flightPlanCoordinates.push({lat: d.lat(), lng: d.lng()})
        });
    
        const flightPath = new google.maps.Polyline({
          path: flightPlanCoordinates,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });
      
        flightPath.setMap(map);
        drawLinePlot(flightPlanCoordinates, d.name);
      })
    });
  }

initMap("data/data.json");