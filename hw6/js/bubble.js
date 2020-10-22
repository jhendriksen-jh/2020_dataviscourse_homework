class BubbleData {
    /**
     *
     * @param phrase phrase spoken
     * @param xVal x location of bubble
     * @param yVal y location of phrase
     * @param category category of phrase
     * @param total total number of times mentioned
     */
    constructor(phrase, xVal, yVal, category, total, moveX, moveY) {
        this.phrase = phrase;
        this.xVal = +xVal;
        this.yVal = +yVal;
        this.xEx = +moveX;
        this.yEx = +moveY;
        this.category = category;
        this.total = +total;
    }
    
}

class BubblePlot {

    constructor(data, updateTable){
        this.data = data[0];
        this.updateTable = updateTable;
        this.bubbleData = [];
        let circleTotal = [];
        let catList = [];
        let xlist = [];
        let ylist = [];
        for(let i = 0; i < this.data.length; i++){
            let node = new BubbleData(this.data[i].phrase,this.data[i].sourceX,this.data[i].sourceY,
                this.data[i].category,this.data[i].total,this.data[i].moveX, this.data[i].moveY);
            this.bubbleData.push(node);
            circleTotal.push(+this.data[i].total);
            catList.push(this.data[i].category);
            xlist.push(this.data[i].sourceX);
            ylist.push(this.data[i].sourceY);
        }

        this.scaleSize = d3.scaleSqrt()
            .domain([d3.min(circleTotal), d3.max(circleTotal)])
            .range([3,12]);

        this.catList = [...new Set(catList)];

        this.expansion = false;
        this.height = 200*this.catList.length;
        this.width = 600;
        this.margin = 25;

        this.scaleColor = d3.scaleOrdinal()
            .domain(this.catList)
            .range(d3.schemeSet2);

        this.scaleX = d3.scaleLinear()
            .domain([d3.min(xlist), d3.max(xlist)])
            .range([this.margin,this.width-this.margin]);
        this.scaleY = d3.scaleLinear()
            .domain([d3.min(ylist), d3.max(ylist)])
            .range([this.margin,(this.height/this.catList.length)-this.margin]);     

    }

    drawBubbles(){
        d3.select("#bubble-chart").append("svg").attr("id","bubble-svg")
            .attr("width",this.width).attr("height",this.height);
        d3.select("#bubble-svg").append("g").attr("id","mainGroup")
        let bubbleSVGgroups = d3.select("#mainGroup").selectAll("g");
        bubbleSVGgroups.data(this.catList).join("g")
            .attr("id", (d,i) => "bubble-group-"+i)
            .attr("class","bubbleGroups")
            .attr("fill","none")
            .attr("transform",(d,i) =>"translate(0,"+i*175+")");
        for(let i = 0; i < this.catList.length; i++){
            let drawGroup = d3.select("#bubble-group-"+i);
            this.addBubbles(drawGroup,this.catList[i],i);
        }
        
        let axisVal = [60,50,40,30,20,10,0,10,20,30,40,50];

    
        let bubbleAxis = d3.axisTop(this.scaleX).ticks(11);
        let axisG = d3.select("#bubble-svg").append("g").attr("id","bubble-axis").attr("class","axis");
        axisG.call(bubbleAxis)
            .attr("transform","translate(0,"+this.margin+")");
        axisG.selectAll("text").data(axisVal).text(d=> ""+d)

        this.addExpLabels();
        this.addToolTips();
        this.toggleExpand();
        this.bubbleBrushing();
        this.showExtremes();
        

    }

    addBubbles(selection,category,groupNum){
        let currData = [... this.bubbleData];
        currData = currData.filter(d=>d.category == category);
        let bubbleSVG = selection.selectAll("circle").data(currData)
            .join("circle")
            .attr("r", d => this.scaleSize(d.total))
            .attr("fill", d => this.scaleColor(d.category))
            .attr("cx", d => this.scaleX(d.xVal))
            .attr("cy", d => this.scaleY(d.yVal))
            .attr("stroke", "black")
            .attr("transform","translate(0,"+groupNum*-175+")");
    }

    addExpLabels(){
        d3.select("#bubble-svg").append("g").attr("id","labels-group");
        let labelsSVG = d3.select("#labels-group").selectAll("text").data(this.catList)
            .join("text")
            .text(d => ""+d)
            .attr("class", "chart-label")
            .attr("y", (d,i) => this.margin + i*175)
            .attr("opacity",0);
    }

    toggleExpand(){
        let that = this;
        
        let toggleSelect = d3.select("#bubble-svg").selectAll("circle");
        let labelSelect= d3.select("#bubble-svg").selectAll("text");

        let toggleSwitch = d3.select("#toggle-switch");

        toggleSwitch.on("change",function(){
            if(that.expansion === false){
                toggleSelect
                    .attr("cx", d => that.scaleX(d.xVal))
                    .attr("cy", d => that.scaleY(d.yVal))
                    .transition()
                    .duration(1000)
                    .attr("cx", d => that.scaleX(d.xEx))
                    .attr("cy", d => that.scaleY(d.yEx));
                labelSelect
                    .attr("opacity",0)
                    .transition()
                    .duration(1000)
                    .attr("opacity",1)
                that.expansion = true;
            }
            else if(that.expansion === true){
                toggleSelect
                    .attr("cx", d => that.scaleX(d.xEx))
                    .attr("cy", d => that.scaleY(d.yEx))
                    .transition()
                    .duration(1000)
                    .attr("cx", d => that.scaleX(d.xVal))
                    .attr("cy", d => that.scaleY(d.yVal));
                that.expansion = false;
            }
        })
    }

    addToolTips(){
        let circleSelect = d3.select("#bubble-svg").selectAll("circle");
        circleSelect.on("mouseover",function(d){
            console.log(d)
            d3.select(".wrapper").append("div").selectAll("text").data(d).join("text").text(d => d.phrase);
        })
    }

    showExtremes(){
        let extSelect = d3.select("#extremes-button");
        extSelect.on("click",function(){
            let wrapSelect = d3.select(".wrapper");
            wrapSelect.append("div").attr("class","extremes-dim");
            let dimSelect = d3.select(".extremes-dim");
            // dimSelect.append("svg").attr("class","extremes-svg")
            //     .attr("width",this.width).attr("height",this.height).attr("y",-500);
            // let svgSelect = d3.select(".extremes-svg")
            // svgSelect.append("rect").attr("width",100).attr("height",100)
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
                    let selectedCircs = d3.select(this).selectAll("circle");
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
                    let seD3 = "bubble-group-"+i;
                    let thisD3 = d3.select(this).attr("id");
                    if(thisD3 == seD3){
                        catInd = i;
                    }
                }

                let brushDataGroup = brushData.filter(d => d.category == that.catList[catInd]);
                let selectedCircs = d3.select("#bubble-group-"+catInd).selectAll("circle");
                const selectedIndices = [];

                if(brSelect){
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
                    selectedCircs.classed("no-select",true);
                    selectedCircs.filter((_,i) => {
                        return selectedIndices.includes(i);
                    })
                        .classed("no-select",false);
                }
                that.updateTable(selectedIndices,catInd);
            });
            
        brushG1.on("click",brushG1.call(brushX));
    }
}