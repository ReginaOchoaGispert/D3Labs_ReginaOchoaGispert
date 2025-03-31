/*
*    main.js
*/

d3.csv("data/ages.csv").then((data)=> {
	console.log(data);
});

d3.tsv("data/ages.tsv").then((data)=> {
	console.log(data);
});

var svg = d3.select("#chart-area").append("svg")
	.attr("width", 1200)
	.attr("height", 500);

d3.json("data/ages.json")
    .then(data => {
        data.forEach((d)=>{
            d.age = +d.age;
        });
        console.log(data);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => i * 120 + 100)
            .attr("cy", 250)
            .attr("r", d  => d.age * 4)
            .attr("fill", d => {
                return d.age > 10 ? "pink" : "blue";
            })
    })
    .catch(error => {
        console.error("Error loading the data:", error);
    });
	



