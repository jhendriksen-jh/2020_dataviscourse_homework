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

    constructor(data,expansion){
        this.data = data[0];

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

        this.expansion = expansion;
        this.height = 200;
        this.width = 500;
        this.margin = 25;

        this.scaleSize = d3.scaleSqrt()
            .domain([d3.min(circleTotal), d3.max(circleTotal)])
            .range([3,12]);

        catList = [...new Set(catList)];
        this.scaleColor = d3.scaleOrdinal()
            .domain(catList)
            .range(d3.schemeSet2);

        this.scaleX = d3.scaleLinear()
            .domain([d3.min(xlist), d3.max(xlist)])
            .range([this.margin,this.width-this.margin]);
        this.scaleY = d3.scaleLinear()
            .domain([d3.min(ylist), d3.max(ylist)])
            .range([this.margin,this.height-this.margin]);

    }

    drawBubbles(){
        d3.select("#bubble-chart").append("svg").attr("id","bubble-svg")
            .attr("width",this.width).attr("height",this.height);

        this.addBubbles()
    }

    addBubbles(){
        let bubblesSVG = d3.select("#bubble-svg").selectAll("circle").data(this.bubbleData)
            .join("circle")
            .attr("r", d => this.scaleSize(d.total))
            .attr("fill", d => this.scaleColor(d.category))
            .attr("cx", d => this.scaleX(d.xVal))
            .attr("cy", d => this.scaleY(d.yVal))
            .attr("stroke", "black");
    }

    toggleExpand(){
        console.log(this.expansion)
        if(that.expansion === true){
        let toggleSelect = d3.select("#bubble-svg").selectAll("circle");
        toggleSelect
            .attr("cx", d => this.scaleX(d.xVal))
            .attr("cy", d => this.scaleY(d.yVal))
            .transition()
            .duration(1000)
            .attr("cx", d => this.scaleX(d.xEx))
            .attr("cy", d => this.scaleY(d.yEx));
        }
        else if(that.expansion === false){
            console.log("toggle expand is false")
        }
    }
    
    updateExpansion(){
        // toggleExpand();
        console.log(this.expansion)
    }
}