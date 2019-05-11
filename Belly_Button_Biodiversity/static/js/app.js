
function buildMetadata(sample) {

    //build the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    var url = "/metadata/" + sample

    // Use d3 to select the panel with id of `#sample-metadata`
    var metadata = d3.select('#sample-metadata');

    // Use `.html("") to clear any existing metadata
    metadata.html("");
    
    // Use `Object.entries` to add each key and value pair to the panel
    d3.json(url).then(function(response) {
        Object.entries(response).forEach(function([key,value]){
            d3.select('#sample-metadata')
            .append('div')
            .text(key + ":" + value)
            .style("font-size", "10px")
          });
    });



    // Build the Gauge Chart
    d3.json(url).then(function(response) {
    var level = response["WFREQ"] * 20

    // Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ 
      type: 'scatter',
      x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6',
                '4-5', '3-4','2-3','1-2','0-1',''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .7)', 'rgba(14, 127, 0, .5)', 
                            'rgba(110, 154, 22, .7)','rgba(110, 154, 22, .5)', 
                            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)','rgba(232, 226, 202, .7)', 
                            'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4','2-3','1-2','0-1',''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs Per Week',
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);
  });
}



function buildCharts(sample) {

    //Use `d3.json` to fetch the sample data for the plots
    var url = "/samples/" + sample;

    d3.json(url).then(function(response) {

      //Build a Bubble Chart using the sample data
      var trace1 = {
        x: response.otu_ids,
        y: response.sample_values,
        text: response.otu_labels,
        mode: 'markers',
        marker: {
          color: response.otu_ids,
          size: response.sample_values
        }
      };
      
      var data = [trace1];
      
      Plotly.newPlot('bubble', data);


      //Build a Pie Chart
        var sample_val = response.sample_values.slice(0,10);
        var ids = response.otu_ids.slice(0,10);
        var labels = response.otu_labels.slice(0,10);

        data = [{
            "values": sample_val,
            "labels": ids,
            "hovertext": labels,
            "type": "pie"
        }];

        layout = {
          height: 500,
          width: 500    
        };

        d3.select("#pie")
        Plotly.plot("pie", data, layout);
    });
}



function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}



// Initialize the dashboard
init();
