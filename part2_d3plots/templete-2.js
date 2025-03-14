// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {
      top: 25, 
      right: 35, 
      bottom: 60, 
      left: 60};

    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const bigWidth = 1000;
    const bigHeight = 600;

    // Create the SVG container

    let svg = d3.select("#boxplot").append("svg")
    .attr("width", bigWidth)
    .attr("height", bigHeight)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    

    // Set up scales for x and y axes

    // unique platforms
    const uniquePlatforms = [...new Set(data.map(d => d.Platform))];
    let xScale = d3.scaleBand()
    .domain(uniquePlatforms)
    .padding(0.2)
    .range([0, width]);

    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

    let yScale = d3.scaleLinear() // not categorical
    .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
    .range([height, 0]);

    svg.append("g")
    .call(d3.axisLeft(yScale));

    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    

    // Add scales     


    // Add x-axis label
    
    svg.append("text").attr("x", width / 2)
    .attr("y", height + margin.bottom - 15)
    .text("Platform");

    // Add y-axis label

    svg.append("text").attr("transform", "rotate(-90)")
    .attr("x", -height/2).attr("y", -margin.left + 15).text("Likes");
    

    const rollupFunction = function(groupData) {
      const values = groupData.map(d => d.Likes).sort(d3.ascending);

      const min = d3.min(values);
      const q1 = d3.quantile(values, 0.25);

      const median = d3.quantile(values, 0.5);

      const q3 = d3.quantile(values, 0.75);
      const max = d3.max(values);

      return {min, q1, median, q3, max};
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, Platform) => {


        const x = xScale(Platform);

        const widthOfBox = xScale.bandwidth();

        console.log("x:" + x);
        console.log("width box:" + x);

        // Draw vertical lines
        svg.append("line")
        .attr("x2", x + widthOfBox/2)
        .attr("y1", yScale(quantiles.min))
        .attr("y2", yScale(quantiles.max))
        .attr("x1", x + widthOfBox/2)
        .attr("stroke", "black");

        // Draw box
        svg.append("rect")
        .attr("width", widthOfBox)

        
        .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
        .attr("x", x)

        .attr("y", yScale(quantiles.q3))

        .attr("stroke", "black")

        .attr("fill", "red");


        // Draw median line
        svg.append("line").attr("y2", yScale(quantiles.median)).attr("x1", x)
        .attr("x2", x + widthOfBox)
        .attr("y1", yScale(quantiles.median))
        .attr("stroke", "black");
        
    });
});

// 2.2
// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {d.AvgLikes = +d.AvgLikes;});

    // Define the dimensions and margins for the SVG
    const margin2 = {
      top: 20, right: 20, 
      bottom: 60, left: 60};


    const width2 = 1000 - margin2.left - margin2.right;

    const height2 = 700 - margin2.top - margin2.bottom;

    // Create the SVG container
    const svgBarPlot = d3.select("#barplot").append("svg").attr("height", height2 + margin2.top + margin2.bottom)
    .attr("width", width2 + margin2.left + margin2.right)
    .append("g")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const averagePlatforms = Array.from(d3.group(data, d => d.Platform).keys());
    const typePost = Array.from(d3.group(data, d => d.PostType).keys());

    const x0 = d3.scaleBand()
    .domain(averagePlatforms)
    .range([0, width2])
    .padding(0.05);

    const x1 = d3.scaleBand()
    .domain(typePost)
    .range([0, x0.bandwidth()])
    .padding(0.05);

    const y = d3.scaleLinear().range([height2, 0])
    .domain([0, d3.max(data, d => d.AvgLikes)]);

    const color = d3.scaleOrdinal()
    .domain([...new Set(data.map(d => d.PostType))])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    svgBarPlot.append("g")
    .attr("transform", `translate(0,${height2})`)

    .call(d3.axisBottom(x0));
    svgBarPlot.append("g")
          .call(d3.axisLeft(y));

    svgBarPlot.append("text")
    .attr("x", -height2/2)
    .attr("transform", "rotate(-90)")
    .attr("y", -margin2.left + 30)
    .text("Avg. Likes");

    // Add x-axis label
    svgBarPlot.append("text")
    .text("Platform")
    .attr("x", width2 / 2)
    .attr("y", height2 + margin2.bottom - 10);

    // Add y-axis label
    const dataPlatforms = 
    Array.from(d3.group(data, d => d.Platform),
     ([key, values]) => ({Platform: key, values: values}));

  // Group container for bars
    const barGroups = svgBarPlot
    .selectAll(".bar-group")
      .data(dataPlatforms)
      .enter()
      .append("g").attr("class", "bar-group")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`)

  // Draw bars
    barGroups.selectAll("rect")
    .data(d => d.values)



    .enter()

    .append("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))

    .attr("width", x1.bandwidth())

    .attr("height", d => height2 - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType));
      

    // Add the legend
    const legend = svgBarPlot.append("g")
      .attr("transform", `translate(${width2 - 150}, ${margin2.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    typePost.forEach((type, i) => {

      legend.append("rect")
      .attr("fill", "#000")
      .attr("x", -2.5)
      .attr("height", 35)
      .attr("y", i * 70 - 2.5)
      .attr("width", 35);

      legend.append("rect")
      .attr("fill", color(type))
      .attr("x", 0)
      .attr("height", 30)
      .attr("y", i * 70)
      .attr("width", 30);

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
    .attr("x", 40)
    .attr("y", i * 70 + 15)
      .text(type)
    .attr("alignment-baseline", "middle");
  });

});

// 2.3
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
  const margin3 = {
    top: 20, right: 50,
    bottom: 70, left: 50};


    // Convert string values to numbers
    data.forEach(function(d) {d.AvgLikes = +d.AvgLikes;
      d.DateParsed = d3.timeParse("%m/%d/%Y")(d.Date.split(" ")[0]);});

    // Define the dimensions and margins for the SVG
    const width3 = 1000 - margin3.left - margin3.right;

    const height3 = 600 - margin3.top - margin3.bottom;

    const bigWidth3 = 1000; const bigHeight3 = 600;



    
    

    // Create the SVG container

    let svgLinePlot = d3.select("#lineplot").append("svg")
    .attr("width", bigWidth3)
    .attr("height", bigHeight3)
    .append("g").attr("transform", `translate(${margin3.left}, ${margin3.top})`);


    // Set up scales for x and y axes  
    const xScale3 = d3.scaleTime()
    .domain(d3.extent(data, d => d.DateParsed))
    .range([0, width3]);

    const yScale3 = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)])
    .nice()
    .range([height3, 0]);

    const xAxis3 = d3.axisBottom(xScale3)
    .tickFormat(d3.timeFormat("%m/%d"));

    // Draw the axis, you can rotate the text in the x-axis here

    svgLinePlot.append("g")
    .call(d3.axisLeft(yScale3));


    svgLinePlot.append("g")
    .attr("transform", `translate(0,${height3})`)
    .call(xAxis3)
    .selectAll("text");

    // Add x-axis label
    svgLinePlot.append("text")
    .attr("x", width3 / 2)
    .attr("y", height3 + margin3.bottom - 10)
    .text("Date");

    // Add y-axis label
    svgLinePlot.append("text").attr("x", - height3 / 2) // moidldle
    .attr("transform", "rotate(-90)")
    .text("Avg. Likes")
    .attr("y", -margin3.left + 15);


    // Draw the line and path. Remember to use curveNatural.
    const line = d3.line()
    .curve(d3.curveNatural)
    .x(d => xScale3(d.DateParsed))
    .y(d => yScale3(d.AvgLikes));

    // the path for lth line
    svgLinePlot.append("path")
    .attr("stroke-width", 5)
    .attr("stroke", "darkgreen")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none"); 

});
