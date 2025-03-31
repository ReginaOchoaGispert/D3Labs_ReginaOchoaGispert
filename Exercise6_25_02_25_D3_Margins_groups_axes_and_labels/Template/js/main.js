/*
*    main.js
*/

const margin = {
    top: 10,
    right: 10,
    bottom: 100,
    left: 100
};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.json("data/buildings.json").then(data => {
    console.log(data);
    
    data.forEach(d => {
        d.height = +d.height;
    });
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, 828])
        .range([height, 0]);
    
    var rects = g.selectAll("rect").data(data);
    
    rects.enter()
        .append("rect")
        .attr("y", d => y(d.height))
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.height))
        .attr("fill", "gray");
    
    const xAxisCall = d3.axisBottom(x);
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxisCall)
        .selectAll("text")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");
    
    const yAxisCall = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `${d}m`);
    g.append("g")
        .attr("class", "y axis")
        .call(yAxisCall);
    
    g.append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + 100)
        .attr("text-anchor", "middle")
        .text("The World's Tallest Buildings");
    
    g.append("text")
        .attr("class", "y axis-label")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Height (m)");
});