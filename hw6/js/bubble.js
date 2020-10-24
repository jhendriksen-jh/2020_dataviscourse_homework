class BubbleData {
    /**
     *
     * @param phrase phrase spoken
     * @param xVal x location of bubble
     * @param yVal y location of phrase
     * @param category category of phrase
     * @param total total number of times mentioned
     */
    constructor(phrase, xVal, yVal, category, total, moveX, moveY,freq,percD,percR) {
        this.phrase = phrase;
        this.xVal = +xVal;
        this.yVal = +yVal;
        this.xEx = +moveX;
        this.yEx = +moveY;
        this.category = category;
        this.total = +total;
        this.freq = +(freq/50)*100;
        this.percDem = +percD-percR;
        this.percRep = +percR-percD;
    }
    
}

class BubblePlot {

    constructor(data, updateTable, toggleClearFilter){
        this.data = data[0];
        this.updateTable = updateTable;
        this.toggleClearFilter = toggleClearFilter;
        this.bubbleData = [];
        let circleTotal = [];
        let catList = [];
        let xlist = [];
        let ylist = [];
        for(let i = 0; i < this.data.length; i++){
            let node = new BubbleData(this.data[i].phrase,this.data[i].sourceX,this.data[i].sourceY,
                this.data[i].category,this.data[i].total,this.data[i].moveX, this.data[i].moveY,
                this.data[i].total,this.data[i].percent_of_d_speeches,this.data[i].percent_of_r_speeches);
            this.bubbleData.push(node);
            this.bubbleData[i].freq = this.bubbleData[i].freq.toFixed(0);
            this.bubbleData[i].percDem = this.bubbleData[i].percDem.toFixed(2);
            this.bubbleData[i].percRep = this.bubbleData[i].percRep.toFixed(2);

            circleTotal.push(+this.data[i].total);
            catList.push(this.data[i].category);
            xlist.push(this.data[i].sourceX);
            ylist.push(this.data[i].sourceY);
        }


        this.scaleSize = d3.scaleSqrt()
            .domain([d3.min(circleTotal), d3.max(circleTotal)])
            .range([3,12]);
        this.catList = [...new Set(catList)];

        let catData = [];
        let bubbleCopy = [];
        this.extrema = [];
        for(let i = 0; i<this.catList.length; i++){
            bubbleCopy = [... this.bubbleData];
            catData = bubbleCopy.filter(d=> d.category == this.catList[i]);
            let catXval = [];
            for(let k = 0; k < catData.length; k++){
                catXval.push(catData[k].xVal);
            }
            let catMax = d3.max(catXval);
            let catMin = d3.min(catXval);
            let maxPhrase = [];
            let minPhrase = [];
            let ratioMax = [];
            let ratioMin = [];
            for(let j = 0; j < catData.length; j++){
                if(catData[j].xVal == catMax){
                    maxPhrase = catData[j].phrase;
                    ratioMax = catData[j].percRep;
                }
                else if(catData[j].xVal == catMin){
                    minPhrase = catData[j].phrase;
                    ratioMin = catData[j].percDem;
                }
            }
            let node = {
                category: this.catList[i],
                max: maxPhrase,
                min: minPhrase,
                ratioRep: ratioMax,
                ratioDem: ratioMin,  
            }
            this.extrema.push(node);
        }

        this.expansion = false;
        this.extremes = false;
        this.height = 185*this.catList.length;
        this.width = 750;
        this.margin = 25;
        this.yTranslate = 40;

        this.scaleColor = d3.scaleOrdinal()
            .domain(this.catList)
            .range(d3.schemeSet2);

        this.scaleX = d3.scaleLinear()
            .domain([d3.min(xlist), d3.max(xlist)])
            .range([this.margin,this.width-3*this.margin]);
        this.scaleY = d3.scaleLinear()
            .domain([d3.min(ylist), d3.max(ylist)])
            .range([this.margin,(this.height/this.catList.length)-this.margin]);     

    }

    drawBubbles(){
        d3.select("#bubble-chart").append("svg").attr("id","bubble-svg")
            .attr("width",this.width).attr("height",this.height);
        
        this.addAxis();

        d3.select("#bubble-svg").append("g").attr("id","mainGroup")
        let bubbleSVGgroups = d3.select("#mainGroup").selectAll("g");
        bubbleSVGgroups.data(this.catList).join("g")
            .attr("id", (d,i) => "bubble-group-"+i)
            .attr("class","bubbleGroups")
            .attr("fill","none")
            .attr("transform",(d,i) =>"translate(0,"+(this.yTranslate+(i*185))+")");

        this.bubbleBrushing();

        for(let i = 0; i < this.catList.length; i++){
            let drawGroup = d3.select("#bubble-group-"+i);
            this.addBubbles(drawGroup,this.catList[i],i);
        }

        this.showExtremes();
        this.addCatLabels();
        this.toggleExpand();
        this.addToolTips();
    }

    addBubbles(selection,category,groupNum){
        let that = this;
        let currData = [... this.bubbleData];
        currData = currData.filter(d=>d.category == category);
        let bubbleSVG = selection.selectAll("circle").data(currData)
            .join("circle")
            .attr("r", d => this.scaleSize(d.total))
            .attr("fill", d => this.scaleColor(d.category))
            .attr("cx", d => this.scaleX(d.xVal))
            .attr("cy", d => this.scaleY(d.yVal+this.yTranslate))
            .attr("stroke", "black")
            .attr("class","bubbles")
            .attr("id",function(d){
                if(d.phrase == that.extrema[groupNum].max || d.phrase == that.extrema[groupNum].min){
                    return "extreme-"+d.phrase.substring(0,3)
                }
                else{
                    return 
                }
            })
            .attr("transform","translate(0,"+(-this.yTranslate+(groupNum*-185))+")");
    }

    addAxis(){
        let axisScale = d3.scaleLinear()
            .domain([-this.extrema[1].ratioDem,this.extrema[2].ratioRep])
            .range([this.margin,this.width-this.margin])
            .nice();
    
        let bubbleAxis = d3.axisBottom(axisScale).ticks(10).tickFormat(d => Math.abs(d));
        let axisG = d3.select("#bubble-svg").append("g").attr("id","bubble-axis").attr("class","axis");
        axisG.call(bubbleAxis)
            .attr("transform","translate(0,"+this.yTranslate+")");

        let axisSVG = d3.select("#bubble-svg")
        axisSVG.append("text")
            .attr("transform","translate(10,"+this.yTranslate/2+")")
            .attr("class","leaning-label")
            .attr("text-anchor","start")
            .text("Democratic Leaning");
        axisSVG.append("text")
            .attr("transform","translate("+(this.width-10)+","+this.yTranslate/2+")")
            .attr("class","leaning-label")
            .attr("text-anchor","end")
            .text("Republican Leaning");
        axisSVG.append("rect")
            .attr("class","midline")
            .attr("transform","translate(343.18,"+(this.yTranslate+20)+")")
            .attr("height",(this.height/this.catList.length))
            .attr("width",1);
    }

    addCatLabels(){
        d3.select("#bubble-svg").append("g").attr("id","labels-group");
        let labelsSVG = d3.select("#labels-group").selectAll("text").data(this.catList)
            .join("text")
            .text(d => ""+d)
            .attr("class", "chart-label")
            .attr("y", (d,i) => this.yTranslate+i*165)
            .attr("opacity",0);
        d3.select("#labels-group").attr("transform","translate(0,"+this.yTranslate+")")
    }

    toggleExpand(){
        let that = this;
        d3.select(".wrapper").append("div").attr("id","toggle-label").html("<h2> Grouped by Topic</h2>");
        let toggleSelect = d3.select("#bubble-svg").selectAll("circle");
        let labelSelect = d3.select("#labels-group").selectAll("text");
        let midSelect = d3.select(".midline");

        let toggleSwitch = d3.select("#toggle-switch");
        toggleSwitch.on("change",function(){
            
            d3.selectAll(".bubbleGroups").classed("brush",true).call(d3.brushX().extent([[0,0],[this.width,this.height/6]]).move,null);
            toggleSelect.classed("no-select",false);
            that.toggleClearFilter();

            if(that.expansion === false){
                toggleSelect
                    .transition()
                    .duration(1000)
                    .attr("cx", d => that.scaleX(d.xEx))
                    .attr("cy", d => that.scaleY(d.yEx+that.yTranslate));
                labelSelect
                    .attr("opacity",0)
                    .transition()
                    .duration(1000)
                    .attr("opacity",1)
                midSelect
                    .transition()
                    .duration(1000)
                    .attr("height",that.height)
                that.expansion = true;
            }
            else if(that.expansion === true){
                toggleSelect
                    .transition()
                    .duration(1000)
                    .attr("cx", d => that.scaleX(d.xVal))
                    .attr("cy", d => that.scaleY(d.yVal+that.yTranslate));
                labelSelect
                    .transition()
                    .duration(1000)
                    .attr("opacity",0);
                midSelect
                    .transition()
                    .duration(1000)
                    .attr("height",that.height/that.catList.length)
                that.expansion = false;
            }
            if(that.extremes === true){
                that.extremes = false;
                d3.select("#extremes-group").selectAll("div").remove();
                d3.select(".wrapper").selectAll('*').classed("hidden",false)
                    .selectAll(".bubbles").classed("rep",false).classed("dem",false);
            }
        })
    }

    addToolTips(){
        d3.select(".wrapper").append("div").attr("id","tooltip").attr("class","tooltip").style("opacity",0);
        let tooltipDiv = d3.select(".tooltip");

        d3.selectAll(".bubbles")
            .on("mouseover",function(d){
                let hoverCirc = d3.select(this);
                if(+d.percDem < 0){
                    hoverCirc.classed("hover rep",true)
                }
                else{
                    hoverCirc.classed("hover dem",true)
                }

                tooltipDiv.transition().duration(300).style("opacity",0.9);
                if(d.percDem>0){
                    tooltipDiv.html("<h2>"+d.phrase+"</h2><p>D+ "+d.percDem+"%<br/>In "+d.freq+"% of speeches</p>")
                        .style("left",(d3.event.pageX+10)+"px")
                        .style("top",(d3.event.pageY-50)+"px");
                }
                else{
                    tooltipDiv.html("<h2>"+d.phrase+"</h2><p>R+ "+d.percRep+"%<br/>In "+d.freq+"% of speeches</p>")
                        .style("left",(d3.event.pageX+10)+"px")
                        .style("top",(d3.event.pageY-50)+"px");
                }
            })
            .on("mouseout",function(){
                d3.select(this).classed("hover dem",false).classed("hover rep",false);
                tooltipDiv.transition().duration(300).style("opacity",0);
            })
    }

    showExtremes(){
        let that = this;
        let extSelect = d3.select("#extremes-button");
        d3.select("body").append("g").attr("id","extremes-group");
        let wrapSelect = d3.select("#extremes-group");
        let clickShow = false;

        extSelect.on("click",function(){

            d3.selectAll(".bubbleGroups").classed("brush",true).call(d3.brushX().extent([[0,0],[this.width,this.height/6]]).move,null);
            

            let coordMax = [];
            let coordMin = [];
            let scrollDown = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
            let scrollLeft = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft;

            if(that.expansion === true && that.extremes === false){
                d3.select("#phraseTable").selectAll("tr").classed("hidden",true);
                d3.select("#bubble-svg").selectAll("circle").classed("hidden",true).classed("no-select",false);

                for(let i = 0; i < that.extrema.length; i++){
                    d3.select("#extreme-"+that.extrema[i].max.substring(0,3)).classed("hidden",false).classed("rep",true);
                    d3.select("#extreme-"+that.extrema[i].min.substring(0,3)).classed("hidden",false).classed("dem",true);

                    let rectsMax = document.getElementById("extreme-"+that.extrema[i].max.substring(0,3));
                    let rectsMin = document.getElementById("extreme-"+that.extrema[i].min.substring(0,3));
                    coordMax = rectsMax.getBoundingClientRect();
                    coordMin = rectsMin.getBoundingClientRect();
                wrapSelect.append("div")
                        .html("<p> Republican mentioned <h2>"+that.extrema[i].max+"</h2> "+that.extrema[i].ratioRep+"% more frequently.")
                        .attr("class","rep extremes-label")
                        .style("top",""+(coordMax.bottom+15+scrollDown)+"px")
                        .style("left",""+(coordMax.left+scrollLeft)+"px")
                        ;
                wrapSelect.append("div")
                        .html("<p> Democrats mentioned <h2>"+that.extrema[i].min+"</h2> "+that.extrema[i].ratioDem+"% more frequently.")
                        .attr("class", "dem extremes-label")
                        .style("top",""+(coordMin.bottom+15+scrollDown)+"px")
                        .style("left",""+(coordMin.left-25+scrollLeft)+"px");
                    that.extremes = true;
                }
            }
            else if(that.expansion === false && that.extremes === false){
                d3.select("#phraseTable").selectAll("tr").classed("hidden",true);
                d3.select("#bubble-svg").selectAll("circle").classed("hidden",true).classed("no-select",false);
                d3.select("#extreme-pri").classed("hidden",false).classed("rep",true);
                d3.select("#extreme-cli").classed("hidden",false).classed("dem",true);
                
                let rectMax = document.getElementById("extreme-pri");              
                let rectMin = document.getElementById("extreme-cli")
                coordMax = rectMax.getBoundingClientRect();
                coordMin = rectMin.getBoundingClientRect();

                wrapSelect.append("div")
                        .html("<p> Republican mentioned <h2>"+that.extrema[2].max+"</h2> "+that.extrema[2].ratioRep+"% more frequently.")
                        .attr("class","rep extremes-label")
                        .style("top",""+(coordMax.bottom+15+scrollDown)+"px")
                        .style("left",""+(coordMax.left+scrollLeft)+"px")
                        ;
                wrapSelect.append("div")
                        .html("<p> Democrats mentioned <h2>"+that.extrema[1].min+"</h2> "+that.extrema[1].ratioDem+"% more frequently.")
                        .attr("class", "dem extremes-label")
                        .style("top",""+(coordMin.bottom+15+scrollDown)+"px")
                        .style("left",""+(coordMin.left-25+scrollLeft)+"px");
                that.extremes = true;
            }
            else if (that.extremes === true){
                that.extremes = false;
                wrapSelect.selectAll("div").remove();
                d3.select(".wrapper").selectAll('*').classed("hidden",false)
                    .selectAll(".bubbles").classed("rep",false).classed("dem",false).classed("no-select",false);
            }
        })

        document.addEventListener("click",function(e){
            if(e.path[0].type !== "button"){
                if(that.extremes === true){
                    that.extremes = false;
                    wrapSelect.selectAll("div").remove();
                    d3.select(".wrapper").selectAll('*').classed("hidden",false)
                        .selectAll(".bubbles").classed("rep",false).classed("dem",false).classed("no-select",false); 
                }
            }
        })

    }

    bubbleBrushing(){
        let that = this;
        let brushG1 = d3.selectAll(".bubbleGroups").classed("brush",true);
        let brushData = [...this.bubbleData];
        let activeBrush = null;
        let activeBrushNode = null;
        
        let brushX = d3.brushX().extent([[0,0],[this.width,this.height/6]])
            .on("start", function(){
                if(activeBrush && d3.select(this) !== activeBrushNode){
                    let selectedCircs = d3.select("#bubble-svg").selectAll("circle");
                    selectedCircs.classed("no-select",false)
                    activeBrushNode.call(activeBrush.move,null);

                }
                activeBrush = brushX;
                activeBrushNode = d3.select(this);
            })
            .on("brush",function(){
                const brSelect = d3.brushSelection(this);
                
                let catInd = [];
                for(let i = 0; i<that.catList.length; i++){
                    let testID = "bubble-group-"+i;
                    let thisID = d3.select(this).attr("id");
                    if(thisID == testID){
                        catInd = i;
                    }
                }

                let brushDataGroup = [];
                let selectedCircs = null;
                const selectedIndices = [];

                if(brSelect){
                    if(that.expansion === true){ 
                        brushDataGroup = brushData.filter(d => d.category == that.catList[catInd]);
                        selectedCircs = d3.select("#bubble-group-"+catInd).selectAll("circle");
                    }
                    else if(that.expansion === false){
                        let dataGroup = [];
                        for(let i = 0; i < that.catList.length; i++){
                            dataGroup[i] = brushData.filter(d => d.category == that.catList[i]);
                        }
                        brushDataGroup = [].concat(dataGroup[0],dataGroup[1],dataGroup[2],dataGroup[3],dataGroup[4],dataGroup[5]);
                        selectedCircs = d3.select("#bubble-svg").selectAll("circle");
                    }

                    const [x1,x2] = brSelect;
                    brushDataGroup.forEach((d,i) =>{
                        if(that.expansion === true){
                            if(
                                d.xEx >= that.scaleX.invert(x1)&&
                                d.xEx <= that.scaleX.invert(x2)
                            ){
                                selectedIndices.push(i)
                            }
                        }
                        else if (that.expansion === false){
                            if(
                                d.xVal >= that.scaleX.invert(x1)&&
                                d.xVal <= that.scaleX.invert(x2)
                            ){
                                selectedIndices.push(i)
                            }
                        }
                    });
                }
                
                if(selectedIndices.length>0){
                    let allCircs = d3.select("#bubble-svg").selectAll("circle");
                    allCircs.classed("no-select",true);
                    selectedCircs.filter((_,i) => {
                        return selectedIndices.includes(i);
                    })
                        .classed("no-select",false);
                }
                that.updateTable(selectedIndices,catInd,that.expansion);
            });
            
        brushG1.on("click",brushG1.call(brushX));
    }
}