// @TODO: YOUR CODE HERE!
var svgWidth = 700;
var svgHeight = 500;

var chartMargin = {
    top:20,
    right:40,
    bottom: 60,
    left: 100
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

var svg = d3.select("#scatter")
            .append("svg")
            .attr("height",svgHeight)
            .attr("width",svgWidth)
            .attr("class", "chart");

var chartGroup = svg.append("g")
                    .attr("transform",
                    `translate(${chartMargin.left},${chartMargin.top})`);

    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

  // updating the x-scale
    function xScale(csvData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([
            d3.min(csvData, d => d[chosenXAxis]) * 0.90,
            d3.max(csvData, d => d[chosenXAxis]) * 1.10
            ]) 
        .range([0, chartWidth]);

    return xLinearScale;
    }

    function yScale(csvData, chosenYAxis) {
        // creating the y-scale
        var yLinearScale = d3.scaleLinear()
            .domain([
                d3.min(csvData, d => d[chosenYAxis]) * 0.90 ,
                d3.max(csvData, d => d[chosenYAxis]) * 1.10 
            ]) 
            .range([chartHeight,-150]);
        return yLinearScale;
    }

    function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
    }
    function renderYAxes(newYScale, YAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    YAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return YAxis;
    }

    function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        console.log(chosenYAxis);
        console.log(circlesGroup.data())

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
    }

    function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]))
        // .attr("x",d=>d.happinessScore);

    return textGroup;
    
    }

    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        
        var toolTip = d3.tip()
            .attr("class", ".d3-tip")
            .offset([80,-60])
            .html(function(d) {
                if (chosenXAxis === "poverty") {
                    return (`${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
                }
                else if (chosenXAxis === "age") {
                    return (`${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}  <br>${chosenYAxis}: ${d[chosenYAxis]}`);
                }
                else {
                    return (`${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}  <br>${chosenYAxis}: ${d[chosenYAxis]}`);
                }
                });

         circlesGroup.call(toolTip);


         circlesGroup
          .on("mouseover", function(data){toolTip.show(data);})
          .on("mouseout", function(data,index) {toolTip.hide(data);});
    
        return circlesGroup;
          
      }


// loading csv file
d3.csv("assets/data/data.csv").then(function(csvData, err) {
    if(err) throw err;
        console.log(csvData)
        
        // povertyData.map(data => data.healthcare);
        // console.log("healthcare",healthcare)
        // nothing i request for console actually prints
        csvData.forEach(function(data) {
            data.smokes = +data.smokes;
            data.obesity = +data.obesity;
            data.healthcareLow = +data.healthcareLow;
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.abbr = +data.abbr;
            console.log("healthcare:", data.smokes);
            console.log("poverty:", data.obesity);
        });     
    
        var yLinearScale = yScale(csvData, chosenYAxis);

        var xLinearScale = xScale(csvData,chosenXAxis);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

            // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        var YAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        var circlesGroup = chartGroup.selectAll("circle")
            .data(csvData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 10)
            // .attr("opacity",".5")
            // .attr("stroke-width", "1")
            .attr("fill","pink");

        var textGroup = chartGroup.selectAll("text")
            .exit() //because enter() before, clear cache
            .data(csvData)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("font-size", "5px")
            .attr("text-anchor", "middle")
            .attr("class","stateText");

        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(-60,${chartHeight / 2})rotate(-90)`);
        
        var povertyLabel = xlabelsGroup.append("text")
            .attr("x",0)
            .attr("y", 20)
            .attr("value", "healthcareLow")
            .classed("active", true)
            .text("Lacks Healthcare (%)")

        var ageLabel = xlabelsGroup.append("text")
            .attr("x",0)
            .attr("y",40)
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("smokes");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x",0)
            .attr("y",60)
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("obesity");

        // setting the x scale info here
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

          // creating x axis group
        var obesityLabel = ylabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("axis-text", true)
            .text("in poverty");
        
        var smokeLabel = ylabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("axis-text", true)
            .text("age");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("axis-text", true)
            .text("income");

        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
        xlabelsGroup.selectAll("text")
        .on("click", function() {
    
          var value = d3.select(this).attr("value");
          
          if (value !== chosenXAxis) {
    
            chosenXAxis = value;
    
            xLinearScale = xScale(csvData, chosenXAxis);
            yLinearScale = yScale(csvData, chosenYAxis);
    
            xAxis = renderXAxes(xLinearScale, xAxis);
    
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            
            textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                .classed("active", true)
                .classed("inactive", false);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
                }
            else if (chosenXAxis === "age") {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", true)
                .classed("inactive", false);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
                }
            else {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        }
    
      });

      ylabelsGroup.selectAll("text")
    
        .on("click", function(){

        var value = d3.select(this).attr("value");
      // console.log(value);
      // console.log(chosenYAxis);
        if (value !== chosenYAxis) {

            chosenYAxis = value;

            xLinearScale = xScale(csvData, chosenXAxis);
            yLinearScale = yScale(csvData, chosenYAxis);

            YAxis = renderYAxes(yLinearScale, YAxis);

        
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            

            textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            
            if (chosenYAxis === "poverty") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
        });
    }).catch(function(error) {
    console.log(error);
})
