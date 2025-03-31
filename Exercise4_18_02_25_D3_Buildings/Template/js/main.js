/*
*    main.js
*/

var svg = d3.select("#chart-area").append("svg")
	.attr("width", 1200)
	.attr("height", 500);

d3.json("data/buildings.json")
    .then(data => {

        data.forEach(d=>{
            d.height = +d.height;
        });

        console.log(data);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return i * 60 + 50;
            })
            .attr("y", function(d) {
                return 400 - d.height * 0.5;
            })
            .attr("width", 40)
            .attr("height", function(d) {
                return d.height * 0.5;
            })
            .attr("fill", "blue");
    });