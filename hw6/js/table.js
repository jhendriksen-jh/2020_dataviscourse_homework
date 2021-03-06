class TableData {
    /**
     *
     * @param phrase phrase spoken
     * @param frequency number of speeches including phrase
     * @param category category of phrase
     * @param percDem percentage of democrats including
     * @param percRep percentage of republicans including
     * @param total total number of times mentioned
     */
    constructor(phrase, frequency, category, percDem, percRep, total) {
        this.phrase = phrase;
        this.frequency = +frequency;
        this.category = category;
        this.percDem = +percDem;
        this.percRep = +percRep;
        this.total = +total;
    }

}


class Table{
    /**
     * Creates a Table Object
     */
    constructor(data) {
        this.data = data[0];
        this.tableData = [];
        for (let i = 0; i < this.data.length; i++){
            let node = new TableData(this.data[i].phrase,this.data[i].total/50,this.data[i].category,this.data[i].percent_of_d_speeches,
                this.data[i].percent_of_r_speeches,this.data[i].total);
            this.tableData.push(node);
        }
        this.tableRenew = [...this.tableData];
        this.headerData = [
            {
                sorted: false,
                ascending: undefined,
                key: 'phrase'
            },
            {
                sorted: false,
                ascending: undefined,
                key: 'freq and total',
            },
            {
                sorted: false,
                ascending: undefined,
                dem: true,
                key: 'percentage',
            },
        ]

        this.vizWidth = 150;
        this.smallVizWidth = 130;
        this.pad = 10;
        this.vizHeight = 22;
        this.smallVizHeight = 20;
        this.axisDrawn = false;

        this.scaleF = d3.scaleLinear()
            .domain([0, 1])
            .range([this.pad, this.smallVizWidth]);

        this.scaleP = d3.scaleLinear()
            .domain([0,100])
            .range([this.pad, (this.smallVizWidth-this.pad)/2]);

        let catList = [];
        for(let i = 0; i < this.tableData.length; i++){
            catList.push(this.tableData[i].category);
        }
        this.catList = [...new Set(catList)];

        this.scaleColor = d3.scaleOrdinal()
            .domain(this.catList)
            .range(d3.schemeSet2);
    
    }

    drawTable(){
        d3.select(".freq-col").append("svg").attr("height", this.smallVizHeight).attr("width",this.vizWidth);
        d3.select(".perc-col").append("svg").attr("height", this.smallVizHeight).attr("width",this.vizWidth);

        let rows = d3.select('#phrase-table-body')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        let cols = rows.selectAll('td')
            .data(this.rowToCell)
            .join('td')
            .attr("width", 100)
            .attr('class', (d,i) => "col-"+i);
        
        let phraseCol = cols.filter((d,i) => i === 0)
            .data(d =>[d])
            .join("text")
            .text(d => d.phrase);
        let freqCol = cols.filter((d,i) => i === 1).selectAll("svg")
            .data(d =>[d])
            .join("svg")
            .attr("width",this.vizWidth)
            .attr("height",this.smallVizHeight);
        let percCol = cols.filter((d,i) => i === 2).selectAll("svg")
            .data(d =>[d])
            .join("svg")
            .attr("width",this.vizWidth)
            .attr("height",this.smallVizHeight)
            .selectAll("g")
            .data(d => [d,d])
            .join("g")
            .attr("class", (d,i) => "g"+i);
        let totalCol = cols.filter((d,i) => i === 3)
            .data(d =>[d])
            .join("text")
            .text(d => ""+d.total)
        
        this.addHeaderAxes();
        this.addRectFreq(freqCol);
        this.addRectPerc();
        this.sortTable();
    }
    rowToCell(d){
        let percInfo = {
            value: {
                perc_Dem: d.percDem,
                perc_Rep: d.percRep,
            }
        }
        let freqInfo = {
            value: d.frequency,
            category: d.category,
        }
        let dataList = [d.phrase,freqInfo,percInfo,d.total];
        return dataList;
    }
    addHeaderAxes(){
        if(this.axisDrawn === false){
            let freqScale = d3.scaleLinear().domain([0,1]).range([this.pad,this.smallVizWidth+this.pad]).nice();
            let freqAxis = d3.axisBottom(freqScale).ticks(3);
            d3.select(".freq-col").selectAll("svg").append("g").attr("class","axis").call(freqAxis)
                .call(g => g.select(".domain").remove());;

            let percScale = d3.scaleLinear().domain([-100,100]).range([this.pad,this.smallVizWidth+this.pad]).nice();
            let percAxis = d3.axisBottom(percScale).ticks(5).tickFormat(d => Math.abs(d));
            d3.select(".perc-col").selectAll("svg").append("g").attr("class","axis").call(percAxis)
                .call(g => g.select(".domain").remove());

            this.axisDrawn = true;
        }
    }
    addRectFreq(svgSelect){
        svgSelect.selectAll("rect").data(d => [d])
            .join("rect")
            .attr("width", d => this.scaleF(d.value))
            .attr("height", this.smallVizHeight)
            .attr("fill", d => this.scaleColor(d.category))
            .attr("x", this.pad);
        
    }
    addRectPerc(){
        d3.selectAll(".g0").selectAll("rect").data(d => [d.value])
            .join("rect")
            .attr("width", d => this.scaleP(d.perc_Dem))
            .attr("height", this.smallVizHeight)
            .attr("x", d => (this.vizWidth/2 - this.scaleP(d.perc_Dem)))
            .attr("class", "dem");
        d3.selectAll(".g1").selectAll("rect").data(d => [d.value])
            .join("rect")
            .attr("width", d => this.scaleP(d.perc_Rep))
            .attr("height", this.smallVizHeight)
            .attr("x", this.vizWidth/2)
            .attr("class", "rep");
        
    }
    sortTable(){
        let that = this;

        let phraseSort = d3.selectAll(".sortable").filter((d,i) => i === 0);
        let freqSort = d3.selectAll(".sortable").filter((d,i) => i === 3 || i === 1);
        let percSort = d3.selectAll(".sortable").filter((d,i) => i === 2);

        phraseSort.on("click", function(){
            that.headerData[1].sorted = that.headerData[2].sorted = false;
            that.headerData[1].ascending = that.headerData[2].ascending = undefined;
            if((that.headerData[0].sorted === false && that.headerData[0].ascending === undefined) ||
                (that.headerData[0].sorted === true && that.headerData[0].ascending === true)){
                    that.headerData[0].sorted = true;
                    that.headerData[0].ascending = false;
                    that.tableData.sort((a,b) =>
                        d3.descending(a.phrase,b.phrase));
                    that.drawTable();
            }
            else if(that.headerData[0].sorted === true && that.headerData[0].ascending === false){
                that.headerData[0].ascending = true;
                that.tableData.sort((a,b) =>
                    d3.ascending(a.phrase,b.phrase));
                that.drawTable();

            }
        })
        freqSort.on("click", function(){
            that.headerData[0].sorted = that.headerData[2].sorted = false;
            that.headerData[0].ascending = that.headerData[2].ascending = undefined;
            if((that.headerData[1].sorted === false && that.headerData[1].ascending === undefined) ||
                (that.headerData[1].sorted === true && that.headerData[1].ascending === true)){
                    that.headerData[1].sorted = true;
                    that.headerData[1].ascending = false;
                    that.tableData.sort((a,b) =>
                        d3.descending(a.total,b.total));
                    that.drawTable();
            }
            else if(that.headerData[1].sorted === true && that.headerData[1].ascending === false){
                that.headerData[1].ascending = true;
                that.tableData.sort((a,b) =>
                    d3.ascending(a.total,b.total));
                that.drawTable();

            }
        })
        percSort.on("click", function(){
            that.headerData[1].sorted = that.headerData[0].sorted = false;
            that.headerData[1].ascending = that.headerData[0].ascending = undefined;
            if(that.headerData[2].dem === true){
                if(that.headerData[2].sorted === false && that.headerData[2].ascending === undefined){
                        that.headerData[2].sorted = true;
                        that.headerData[2].ascending = false;
                        that.tableData.sort((a,b) =>
                            d3.descending(a.percDem,b.percDem));
                        that.drawTable();
                }
                else if(that.headerData[2].sorted === true && that.headerData[2].ascending === false){
                    that.headerData[2].ascending = true;
                    that.tableData.sort((a,b) =>
                        d3.ascending(a.percDem,b.percDem));
                    that.headerData[2].dem = that.headerData[2].sorted = false;
                    that.headerData[2].ascending = undefined;
                    that.drawTable();
                }
            }
            else if(that.headerData[2].dem === false){
                if(that.headerData[2].sorted === false && that.headerData[2].ascending === undefined){
                    that.headerData[2].sorted = true;
                    that.headerData[2].ascending = false;
                    that.tableData.sort((a,b) =>
                        d3.descending(a.percRep,b.percRep));
                    that.drawTable();
                }
                else if(that.headerData[2].sorted === true && that.headerData[2].ascending === false){
                    that.headerData[2].ascending = true;
                    that.tableData.sort((a,b) =>
                        d3.ascending(a.percRep,b.percRep));
                    that.drawTable();
                    that.headerData[2].dem = true;
                    that.headerData[2].sorted = false;
                    that.headerData[2].ascending = undefined;
                }
            }
        })        
    }

    filterTable(selectedInd,catInd,expansion){
        this.tableData = this.tableRenew;
        let that = this;
        let brushData = [... this.tableData];
        if(expansion === true){
            brushData = brushData.filter(d=>d.category === that.catList[catInd]);
            if(selectedInd.length>0){
                this.tableData = brushData.filter((_,i) => {
                    return selectedInd.includes(i);
                })
            }
        }
        else if(expansion === false){
            let brushDataGroup = [];
            let dataGroup = [];
            for(let i = 0; i < that.catList.length; i++){
                dataGroup[i] = brushData.filter(d => d.category == that.catList[i]);
            }
            brushDataGroup = [].concat(dataGroup[0],dataGroup[1],dataGroup[2],dataGroup[3],dataGroup[4],dataGroup[5]);
            if(selectedInd.length>0){
                this.tableData = brushDataGroup.filter((_,i) => {
                    return selectedInd.includes(i);
                })
            }
        }
        this.drawTable();
    }

    clearSelection(){
        this.tableData = this.tableRenew;
        this.drawTable();
        d3.select("#bubble-svg").selectAll("circle").classed("no-select",false);
    }

}