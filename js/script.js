function initMap(src) {
  d3.json(src).then(function(data) {
      data = data.filter(function(d) { return d.map.summary_polyline != null });
      data = data.filter(function(d) { return d.type == "Run" });

      data.forEach(d => {
        //var path = google.maps.geometry.encoding.decodePath(d.map.summary_polyline);

        // returns an array of lat, lon pairs
        var path = polyline.decode(d.map.summary_polyline);

        const activityCoordinates = [];
  
        path.forEach(d => {
          activityCoordinates.push({lat: d[0], lng: d[1]})
        });

        drawLinePlot(activityCoordinates, d.name, d.start_date);
      });
    });
}

function drawLinePlot(data, name, date) {

  // set the dimensions and margins of the graph
  var size = 40;
  var m = 5;
  const margin = {top: m, right: m, bottom: m, left: m},
  width = size,
  height = size;

  // convert array of coordinates to geojson feature collection
  var features = data.map(function(d) {
    return {     
      "type": "Feature",
      "geometry": {
         "type": "Point",
         "coordinates": [d.lng, d.lat]
      }
    }
  });
  var featureCollection = { type:"FeatureCollection", features:features }

  // because we're plotting 3D data (lat, long position on earth) to 2D space, we need a projection
  var projection = d3.geoMercator()
  .translate([width/2,height/2])
  .fitSize([width,height], featureCollection);

  // append the svg object to the body of the page
  const svg = d3.select("#viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", function(){
      console.log(name, date);
    })
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Draw the line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("d", d3.line()
        .x(function(d) { return projection([d.lng,d.lat])[0]; })
        .y(function(d) { return projection([d.lng,d.lat])[1] })
    );
}

initMap("data/data.json");