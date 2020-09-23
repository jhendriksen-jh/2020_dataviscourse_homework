
/**
 * Makes the first bar chart appear as a staircase.
 *
 * Note: use only the DOM API, not D3!
 */

function staircase() {
  // ****** TODO: PART II ******
  
  document.getElementById("aBarChart");
  // initialize variables needed
  let chartRectsA = aBarChart.getElementsByTagName("rect");
  let currentWidthA = [];
  let currentWidthSort = [];
  let newWidthA = [];

  // find the current widths of the bars in both charts (bars from A are used in sorting)
  for(let i = 0; i < chartRectsA.length; i++){
    currentWidthA[i] = chartRectsA[i].getAttribute("width");
    currentWidthSort[i] = chartRectsA[i].getAttribute("width");
  }
  // sort the width of the bars in A from gratest to least
  // using the index of where the largest was bars in B are sorted so that dates continue to match
  for(i = 0; i < chartRectsA.length; i++){
    newWidthA[i] = Math.max(...currentWidthA);
    for(j = 0; j < chartRectsA.length; j++){
      if(currentWidthA[j] == newWidthA[i]){
        currentWidthA[j] = "0";
      }
    }
  }
  // reassign then width of the bars so widest is on the bottom 
  for(let i = 0; i < chartRectsA.length; i++){
    chartRectsA[i].setAttribute("width",newWidthA[(chartRectsA.length-1)-i]);
  }
  //  if there is a second barchart
    document.getElementById("bBarChart");
    // initialize variables needed
    let chartRectsB = bBarChart.getElementsByTagName("rect");
    let currentWidthB = [];
    let newWidthB = [];
    
    // find the current widths of the bars in chartB (bars from A are used in sorting)
    if(chartRectsB.length > 0){
      for(let i = 0; i < chartRectsA.length; i++){
        currentWidthB[i] = chartRectsB[i].getAttribute("width");
      }
      // sort the width of the bars in A from gratest to least
      // using the index of where the largest was bars in B are sorted so that dates continue to match
      for(i = 0; i < chartRectsA.length; i++){
        newWidthA[i] = Math.max(...currentWidthSort);
        for(j = 0; j < chartRectsA.length; j++){
          if(currentWidthSort[j] == newWidthA[i]){
            currentWidthSort[j] = "0";
            newWidthB[i] = currentWidthB[j];
          }
        }
      }
      // reassign then width of the bars so widest is on the bottom 
      for(let i = 0; i < chartRectsA.length; i++){
        chartRectsB[i].setAttribute("width",newWidthB[(chartRectsB.length-1)-i]);
      }
    }
  return
}

/**
 * Render the visualizations
 * @param data
 */
function update(data) {
  /**
   * D3 loads all CSV data as strings. While Javascript is pretty smart
   * about interpreting strings as numbers when you do things like
   * multiplication, it will still treat them as strings where it makes
   * sense (e.g. adding strings will concatenate them, not add the values
   * together, or comparing strings will do string comparison, not numeric
   * comparison).
   *
   * We need to explicitly convert values to numbers so that comparisons work
   * when we call d3.max()
   **/

  for (let d of data) {
    d.cases = +d.cases; //unary operator converts string to number
    d.deaths = +d.deaths; //unary operator converts string to number
  }

  // Set up the scales
  let barChart_width = 345;
  let areaChart_width = 295;
  let maxBar_width = 240;
  let data_length = 15;
  let aScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.cases)])
    .range([0, maxBar_width]);
  let bScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.deaths)])
    .range([0, maxBar_width]);
  let iScale_line = d3
    .scaleLinear()
    .domain([0, data.length])
    .range([10, 500]);
  let iScale_area = d3
    .scaleLinear()
    .domain([0, data_length])
    .range([0, 260]);
  
  // Draw axis for Bar Charts, Line Charts and Area Charts (You don't need to change this part.)
  d3.select("#aBarChart-axis").attr("transform", "translate(0,210)").call(d3.axisBottom(d3.scaleLinear().domain([0, d3.max(data, d => d.cases)]).range([barChart_width, barChart_width-maxBar_width])).ticks(5));
  d3.select("#aAreaChart-axis").attr("transform", "translate(0,245)").call(d3.axisBottom(d3.scaleLinear().domain([0, d3.max(data, d => d.cases)]).range([areaChart_width, areaChart_width-maxBar_width])).ticks(5));
  d3.select("#bBarChart-axis").attr("transform", "translate(5,210)").call(d3.axisBottom(bScale).ticks(5));
  d3.select("#bAreaChart-axis").attr("transform", "translate(5,245)").call(d3.axisBottom(bScale).ticks(5));
  let aAxis_line = d3.axisLeft(aScale).ticks(5);
  d3.select("#aLineChart-axis").attr("transform", "translate(50,15)").call(aAxis_line);
  d3.select("#aLineChart-axis").append("text").text("New Cases").attr("transform", "translate(50, -3)")
  let bAxis_line = d3.axisRight(bScale).ticks(5);
  d3.select("#bLineChart-axis").attr("transform", "translate(550,15)").call(bAxis_line);
  d3.select("#bLineChart-axis").append("text").text("New Deaths").attr("transform", "translate(-50, -3)")

  // ****** TODO: PART III (you will also edit in PART V) ******

  // TODO: Select and update the 'a' bar chart bars

  let groupA = d3.select("#aBarChart");
  let barsRemove = groupA.selectAll("rect");
  barsRemove.remove();

  let barsA = groupA.selectAll("rect").data(data);

  barsA.exit()
    .attr("opacity",1)
    .transition()
    .duration(1000)
    .attr("opacity",0)
    .remove();
    
  barsA = barsA.enter()
    .append("rect")
    .merge(barsA);
  barsA.attr("height",12)
    .attr("y", (d,i) => i*14)
    .attr("transform", "scale(-1,1)")
    .transition()
    .duration(1250)
    .attr("width", d => aScale(d.cases))

  // TODO: Select and update the 'b' bar chart bars

  let groupB = d3.select("#bBarChart");
  let barsB = groupB.selectAll("rect").data(data);
  
  barsB.exit()
    .attr("opacity",1)
    .transition()
    .duration(1000)
    .attr("opacity",0)
    .attr("width",0)
    .remove();

  barsB = barsB.enter()
    .append("rect")
    .merge(barsB);
  barsB.attr("height", 12)
    .attr("y", (d,i) => i*14)
    .transition()
    .duration(1250)
    .attr("width", d => bScale(d.deaths));
     

  // TODO: Select and update the 'a' line chart path using this line generator
  let aLineGenerator = d3
    .line()
    .x((d, i) => iScale_line(i))
    .y(d => aScale(d.cases));

    let lineA = d3.select("#aLineChart");
    lineA.datum(data)
      .transition()
      .duration(750)
      .attr("d",aLineGenerator);

  // TODO: Select and update the 'b' line chart path (create your own generator)

  let bLineGenerator = d3.line().x((d,i) => iScale_line(i)).y(d => bScale(d.deaths));
    
    let lineB = d3.select("#bLineChart");
    lineB.datum(data)
      .transition()
      .duration(750)
      .attr("d",bLineGenerator);

  // TODO: Select and update the 'a' area chart path using this area generator
  let aAreaGenerator = d3
    .area()
    .x((d, i) => iScale_area(i))
    .y0(0)
    .y1(d => aScale(d.cases));

    let areaA = d3.select("#aAreaChart");
    areaA.datum(data)
      .transition()
      .duration(750)
      .attr("d",aAreaGenerator);

  // TODO: Select and update the 'b' area chart path (create your own generator)

  let bAreaGenerator = d3.area()
    .x((d,i) => iScale_area(i))
    .y0(0)
    .y1(d => bScale(d.deaths));
  
  let areaB = d3.select("#bAreaChart");
  areaB.datum(data)
    .transition()
    .duration(750)
    .attr("d",bAreaGenerator);

  // TODO: Select and update the scatterplot points
  
  //  drawing axes for the scatter plot
  let bAxis_Scatter = d3.axisLeft(bScale).ticks(5);
  let aAxis_Scatter = d3.axisBottom(aScale).ticks(5);
  d3.select("#y-axis").call(bAxis_Scatter);
  d3.select("#x-axis").call(aAxis_Scatter);
  // add in the circles for data points 
  let scatterPlotSvg = d3.select(".scatter-plot");
  let scatterP = scatterPlotSvg.select(".labels").selectAll("g").data(data);
  
  let groupCircle = scatterP.selectAll("circle");
  groupCircle.attr("opacity",1)
    .transition()
    .duration(750)
    .attr("opacity",0)
    .remove();
  let groupTitle = scatterP.selectAll("title");
  groupTitle.remove();
  
  
  scatterP.exit()
    .attr("opacity",1)
    .transition()
    .duration(750)
    .attr("opacity",0)
    .remove();


  scatterP = scatterP.enter().append("g").merge(scatterP)
  scatterP.append("circle")
    .transition()
    .duration(1250)
    .attr("cx",d => aScale(d.cases))
    .attr("cy", d => bScale(d.deaths))
    .attr("r",5)
  scatterP.append("title")
      .text((d)=>{
        return d.date+": ("+d.cases+","+d.deaths+")"
      })

  // prior attempt at creating vanishing data labels

      // scatterPlotSvg.append("g").attr("class","labels");
      // labels = scatterPlotSvg.select(".labels").selectAll("text").data(data)
      // // labels.exit().remove()
      // labels.enter().append("text").text((d) => d.date)
      //   .attr("transform","translate(180,10)")
      //   .attr("x", d=> aScale(d.cases))
      //   .attr("y", d => bScale(d.deaths))
      //   .attr("class","dataLabel")
      //   .style("opacity",0)


  // ****** TODO: PART IV ******

  // For barchart A
    // barchart A is handled with calling barHover() 
      barHover();
  // For barchart B
  barsB.on("mouseover",(d,i,g) =>{
    d3.select(g[i]).classed("hovered",true);
  })
  barsB.on("mouseout",(d,i,g) =>{
    d3.select(g[i]).classed("hovered",false);
  })

  // For the scatter plot

  scatterP.on("click",(d,i,g) =>{
    function lab() {return "("+d.cases+","+d.deaths+")\nCases:"+d.cases + " Deaths:" +d.deaths};
    console.log(lab());
  })
}

function barHover(){
  // This function exists only so that the hover color change works for the initial bar chart before data is changed
   let groupA = d3.select("#aBarChart");
   let barsA = groupA.selectAll("rect");
   barsA.on("mouseover",(d,i,g) =>{
     d3.select(g[i]).classed("hovered",true);
   })
   barsA.on("mouseout",(d,i,g) =>{
     d3.select(g[i]).classed("hovered",false);
   })
}


/**
 * Update the data according to document settings
 */
async function changeData() {
  //  Load the file indicated by the select menu
  let dataFile = document.getElementById("dataset").value;
  try {
    const data = await d3.csv("data/" + dataFile + ".csv");
    if (document.getElementById("random").checked) {
      // if random
      update(randomSubset(data)); // update w/ random subset of data
    } else {
      // else
      update(data); // update w/ full data
    }
  } catch (error) {
    console.log(error)
    alert("Could not load the dataset!");
  }
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset(data) {
  return data.filter(d => Math.random() > 0.5);
}
