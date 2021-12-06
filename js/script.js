function initMap(src) {
  d3.json(src).then(function(data) {
      data = data.filter(function(d) { return d.map.summary_polyline != null });
      //data = data.filter(function(d) { return d.type == "Run" });

      data.forEach(d => {
        //var path = google.maps.geometry.encoding.decodePath(d.map.summary_polyline);

        // returns an array of lat, lon pairs
        var path = polyline.decode(d.map.summary_polyline);

        const activityCoordinates = [];
  
        path.forEach(d => {
          activityCoordinates.push({lat: d[0], lng: d[1]})
        });

        var lineColor = 'black';
        // activities starting in Chicago should be in different color
        // if (d.start_longitude > -87.815606 && d.start_longitude < -87.564981 && d.start_latitude > 41.783071 && 42.010512) {
        //     lineColor = 'blue';
        // }

        drawLinePlot(activityCoordinates, d.name, d.start_date, lineColor);
      });
    });
}

function drawLinePlot(data, name, date, lineColor) {

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
    .attr("stroke", lineColor)
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d) { return projection([d.lng,d.lat])[0]; })
        .y(function(d) { return projection([d.lng,d.lat])[1] })
    );
}

function svgToCanvas() {
  var svgs = document.querySelectorAll('svg');
  [...svgs].map((svg, i) => { drawOnCavas(svg, i) });
};

function drawOnCavas(svg, i) {
  var svgString = new XMLSerializer().serializeToString(svg);
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight * 2;
    var DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function() {
        // this will create rows with 25 activities. Move to a subsequent row when current row hits 25 activities.
        var png = canvas.toDataURL("image/png");
        ctx.drawImage(img, (i % 25) * 55, Math.floor(i / 25) * 55);
        document.querySelector('#viz').innerHTML = '<img src="'+png+'"/>';
        DOMURL.revokeObjectURL(png);    
    };
    img.src = url;
};

function download() {
  canvas.toBlob(function (blob) {
      let link = document.createElement('a');
      link.download = "test.png";
      link.href = URL.createObjectURL(blob);
      link.click();
  });
};

initMap("data/data.json");

document.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) { // 'enter' was pressed
    svgToCanvas();
    document.getElementById("downloader").style.display = 'block';
  }
});