/*
*    main.js
*/

d3.json("data/data.json").then(function(data) {
    console.log("Original data:", data);

    const formattedData = data.map(yearData => {
        return {
            year: +yearData.year,
            countries: yearData.countries
                .filter(country => country.income != null && country.life_exp != null)
                .map(country => {
                    return {
                        country: String(country.country || ""),
                        continent: String(country.continent || ""),
                        income: Number(country.income),
                        life_exp: Number(country.life_exp),
                        population: Number(country.population || 0)
                    };
                })
        };
    });

    console.log("Formatted data sample:", formattedData[0]);
    
    const firstYear = formattedData[0].year;
    const lastYear = formattedData[formattedData.length - 1].year;
    
    let yearIndex = 0;
    let selectedContinent = "All";
    let playing = false;
    let interval;
    
    const controls = d3.select("body")
        .append("div")
        .attr("class", "controls")
        .style("width", "1000px")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "10px")
        .style("margin-bottom", "20px");
    
    const playButton = controls.append("button")
        .attr("id", "play-button")
        .text("Play");
    
    const resetButton = controls.append("button")
        .attr("id", "reset-button")
        .text("Reset");
    
    const yearLabelUI = controls.append("div")
        .attr("id", "year-label")
        .text(`Year: ${firstYear}`)
        .style("margin-left", "20px")
        .style("margin-right", "10px");
    
    const slider = controls.append("input")
        .attr("type", "range")
        .attr("id", "year-slider")
        .attr("min", 0)
        .attr("max", formattedData.length - 1)
        .attr("value", 0)
        .style("flex-grow", "1");
    
    const continents = ["All"];
    formattedData.forEach(year => {
        year.countries.forEach(country => {
            if (country.continent && !continents.includes(country.continent)) {
                continents.push(country.continent);
            }
        });
    });
    
    const filterContainer = controls.append("div")
        .style("margin-left", "auto");
    
    filterContainer.append("select")
        .attr("id", "continent-filter")
        .style("padding", "7px")
        .selectAll("option")
        .data(continents)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
    
    const margin = { top: 10, right: 200, bottom: 100, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleLog()
        .domain([142, 150000])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 90])
        .range([height, 0]);
    
    const areaScale = d3.scaleLinear()
        .domain([2000, 1400000000])
        .range([25 * Math.PI, 1500 * Math.PI]);
    
    const colorScale = d3.scaleOrdinal(d3.schemePastel1);
    
    const xAxis = d3.axisBottom(xScale)
        .tickValues([400, 4000, 40000])
        .tickFormat(d => `$${d}`);
    
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    
    svg.append("g")
        .call(yAxis);
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("LIFE EXPECTANCY (YEARS)");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("GDP PER CAPITA ($)");
    
    const yearLabel = svg.append("text")
        .attr("x", width - 100)
        .attr("y", height - 10)
        .attr("font-size", "24px")
        .attr("fill", "black");
    
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("pointer-events", "none");
    
    function update(yearData) {
        console.log(`Updating to year ${yearData.year}, with ${yearData.countries.length} countries`);
        
        let filteredData = yearData.countries;
        
        if (selectedContinent !== "All") {
            filteredData = filteredData.filter(d => d.continent === selectedContinent);
        }
        
        if (filteredData.length > 0) {
            console.log("Sample country data:", filteredData[0]);
        } else {
            console.log("No countries match filter criteria");
        }
        
        const circles = svg.selectAll("circle")
            .data(filteredData, d => d.country);
            
        console.log("Debug círculos:", filteredData);
        
        circles.enter()
            .append("circle")
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI))
            .attr("fill", d => colorScale(d.continent))
            .each(function(d) {
                d3.select(this).datum(d);
            })
            .on("mouseover", function(event, d) {
                if (typeof d === "number") {
                    console.log("Recibido índice en lugar de datos:", d);
                    d = d3.select(this).datum();
                    console.log("Datos recuperados del elemento:", d);
                }
                
                const countryName = d.country || "NA";
                const continent = d.continent || "NA";
                const income = d.income ? `$${Math.round(d.income).toLocaleString()}` : "N/A";
                const lifeExp = d.life_exp ? `${d.life_exp.toFixed(1)} years` : "N/A";
                const population = d.population ? d.population.toLocaleString() : "N/A";
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <strong>${countryName}</strong><br/>
                    Continent: ${continent}<br/>
                    GDP per capita: ${income}<br/>
                    Life expectancy: ${lifeExp}<br/>
                    Population: ${population}
                `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
                
                d3.select(this)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                
                d3.select(this)
                    .attr("stroke", "none");
            })
            .merge(circles)
            .transition().duration(1000)
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));
        
        circles.exit().remove();
        
        yearLabel.text(yearData.year);
        yearLabelUI.text(`Year: ${yearData.year}`);
        
        slider.property("value", yearIndex);
    }
    
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 110}, 210)`);
    
    continents.filter(d => d !== "All").forEach((continent, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 25)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", colorScale(continent));
        
        legend.append("text")
            .attr("x", 30)
            .attr("y", i * 25 + 15)
            .text(continent)
            .attr("font-size", "14px")
            .attr("alignment-baseline", "middle");
    });
    
    playButton.on("click", function() {
        if (playing) {
            clearInterval(interval);
            playButton.text("Play");
        } else {
            interval = setInterval(() => {
                yearIndex = (yearIndex + 1) % formattedData.length;
                update(formattedData[yearIndex]);
            }, 1000);
            playButton.text("Pause");
        }
        playing = !playing;
    });
    
    resetButton.on("click", function() {
        yearIndex = 0;
        update(formattedData[yearIndex]);
        
        if (playing) {
            clearInterval(interval);
            playing = false;
            playButton.text("Play");
        }
    });
    
    slider.on("input", function() {
        yearIndex = +this.value;
        update(formattedData[yearIndex]);
    });
    
    d3.select("#continent-filter").on("change", function() {
        selectedContinent = this.value;
        update(formattedData[yearIndex]);
    });
    
    update(formattedData[0]);
});