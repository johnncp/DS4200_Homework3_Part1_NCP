// PART 2.1: Side-by-side Boxplot using socialMedia.csv
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

    // Create the SVG container
    const svg = d3.select("#boxplot").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const platforms = [...new Set(data.map(d => d.Platform))];
    const xScale = d3.scaleBand()
          .domain(platforms)
          .range([0, width])
          .paddingInner(0.2);
    const yScale = d3.scaleLinear()
          .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
          .range([height, 0]);

    // Add x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(xScale));
    // Add y-axis
    svg.append("g")
       .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 5)
       .style("text-anchor", "middle")
       .text("Platform");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -height/2)
       .attr("y", -margin.left + 15)
       .style("text-anchor", "middle")
       .text("Likes");

    // Function to calculate summary statistics for the boxplot:
    // We calculate min, q1, median, q3, and max for each platform.
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };

    // Roll up the data to compute summary statistics (min, q1, median, q3, max) for each platform.
    // d3.rollup groups the data by platform and applies the rollupFunction to compute these values.
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    // For each platform, set up the x position and box width for the boxplot elements.
    quantilesByGroups.forEach((quantiles, platform) => {
        const x = xScale(platform);
        const boxWidth = xScale.bandwidth();

        console.log(x);

        // Draw vertical line from the minimum to maximum value for each platform
        svg.append("line")
            .attr("x1", x + boxWidth/2)
            .attr("x2", x + boxWidth/2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Draw the rectangular box from Q1 to Q3; the fill color hides the vertical line behind
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "#ccc")
            .attr("stroke", "black");

        // Draw the horizontal line for the median
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "red");
    });

    // Adding comments for the following two lines as per instructions:
    // The first line uses d3.rollup to group the data by platform and calculate summary statistics (q1, median, q3, etc.) for each group.
    // The second line iterates over each group, setting the x position and box width for the boxplot elements for each platform.
});


// PART 2.2: Side-by-side Bar Plot using SocialMediaAvg.csv
// Prepare your data and load the data again. This data should contain three columns: Platform, PostType, and AvgLikes.
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin2 = {top: 20, right: 50, bottom: 50, left: 50};
    const width2 = 800 - margin2.left - margin2.right;
    const height2 = 500 - margin2.top - margin2.bottom;

    // Create the SVG container
    const svg2 = d3.select("#barplot").append("svg")
          .attr("width", width2 + margin2.left + margin2.right)
          .attr("height", height2 + margin2.top + margin2.bottom)
          .append("g")
          .attr("transform", `translate(${margin2.left},${margin2.top})`);

    // Define four scales:
    // x0: for the Platform (dividing the x-axis into four parts)
    // x1: for the PostType (dividing each platform's bandwidth into three parts)
    // y: for the average number of likes
    // color: for the PostType
    const platformsAvg = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    const x0 = d3.scaleBand()
          .domain(platformsAvg)
          .range([0, width2])
          .padding(0.05);

    const x1 = d3.scaleBand()
          .domain(postTypes)
          .range([0, x0.bandwidth()])
          .padding(0.05);

    const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.AvgLikes)])
          .nice()
          .range([height2, 0]);

    const color = d3.scaleOrdinal()
          .domain(postTypes)
          .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add x-axis and y-axis
    svg2.append("g")
         .attr("transform", `translate(0,${height2})`)
         .call(d3.axisBottom(x0));

    svg2.append("g")
         .call(d3.axisLeft(y));

    // Add x-axis label
    svg2.append("text")
         .attr("x", width2 / 2)
         .attr("y", height2 + margin2.bottom - 10)
         .style("text-anchor", "middle")
         .text("Platform");

    // Add y-axis label
    svg2.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -height2/2)
         .attr("y", -margin2.left + 15)
         .style("text-anchor", "middle")
         .text("Average Likes");

    // Group data by Platform so we can draw grouped bars for each post type
    const platformsData = Array.from(d3.group(data, d => d.Platform), ([key, values]) => ({Platform: key, values: values}));

    // Create group containers for each Platform
    const barGroups = svg2.selectAll(".bar-group")
                          .data(platformsData)
                          .enter()
                          .append("g")
                          .attr("class", "bar-group")
                          .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    // Draw bars for each PostType within each Platform group
    barGroups.selectAll("rect")
             .data(d => d.values)
             .enter()
             .append("rect")
             .attr("x", d => x1(d.PostType))
             .attr("y", d => y(d.AvgLikes))
             .attr("width", x1.bandwidth())
             .attr("height", d => height2 - y(d.AvgLikes))
             .attr("fill", d => color(d.PostType));

    // Add the legend. The legend has two parts: a colored square and text for each post type.
    const legend = svg2.append("g")
                       .attr("transform", `translate(${width2 - 150}, ${margin2.top})`);

    postTypes.forEach((type, i) => {
        // Add colored rectangle for legend
        legend.append("rect")
              .attr("x", 0)
              .attr("y", i * 20)
              .attr("width", 15)
              .attr("height", 15)
              .attr("fill", color(type));
        // Add text next to the rectangle
        legend.append("text")
              .attr("x", 20)
              .attr("y", i * 20 + 12)
              .text(type)
              .attr("alignment-baseline", "middle");
    });
});


// PART 2.3: Line Plot using SocialMediaTime.csv
// Prepare your data and load the data again. This data should contain two columns: Date and AvgLikes.
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers and parse dates
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
        // Extract the date part (assumes format "MM/DD/YYYY" possibly followed by extra info) and parse it
        d.DateParsed = d3.timeParse("%m/%d/%Y")(d.Date.split(" ")[0]);
    });

    // Define the dimensions and margins for the SVG
    const margin3 = {top: 20, right: 50, bottom: 70, left: 50};
    const width3 = 800 - margin3.left - margin3.right;
    const height3 = 500 - margin3.top - margin3.bottom;

    // Create the SVG container
    const svg3 = d3.select("#lineplot").append("svg")
          .attr("width", width3 + margin3.left + margin3.right)
          .attr("height", height3 + margin3.top + margin3.bottom)
          .append("g")
          .attr("transform", `translate(${margin3.left},${margin3.top})`);

    // Set up scales for x and y axes
    const xScaleTime = d3.scaleTime()
          .domain(d3.extent(data, d => d.DateParsed))
          .range([0, width3]);
    const yScaleTime = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.AvgLikes)])
          .nice()
          .range([height3, 0]);

    // Draw the x-axis with rotated labels to accommodate long date strings
    const xAxisTime = d3.axisBottom(xScaleTime)
                        .tickFormat(d3.timeFormat("%m/%d"));
    svg3.append("g")
         .attr("transform", `translate(0,${height3})`)
         .call(xAxisTime)
         .selectAll("text");

    // Draw the y-axis
    svg3.append("g")
         .call(d3.axisLeft(yScaleTime));

    // Add x-axis label
    svg3.append("text")
         .attr("x", width3/2)
         .attr("y", height3 + margin3.bottom - 10)
         .text("Date");

    // Add y-axis label
    svg3.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -height3/2)
         .attr("y", -margin3.left + 15)
         .style("text-anchor", "middle")
         .text("Average Likes");

    // Draw the line and path using curveNatural for a smooth curve
    const line = d3.line()
                   .curve(d3.curveNatural)
                   .x(d => xScaleTime(d.DateParsed))
                   .y(d => yScaleTime(d.AvgLikes));

    svg3.append("path")
         .datum(data)
         .attr("fill", "none")
         .attr("stroke", "steelblue")
         .attr("stroke-width", 2)
         .attr("d", line);
});
