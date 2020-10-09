/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'margin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winstate_inc',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 // 
        ////////////
        /**
         * Draw the legend for the bar chart.
         */

        // Add the legend to the center middle
        let legendSelect = d3.select("#marginAxis")
            .attr("height", this.vizHeight)
            .attr("width", this.vizWidth)
            
        for(let i = 0; i < 3; i++){
            legendSelect.append("text")
                .attr("x", x => this.scaleX((-1*i*25) - 25))
                .attr("y",this.smallVizHeight)
                .attr("class", "biden")
                .attr("text-anchor","middle")
                .text(function() {return "+"+(25 + i*25)});
        }
           
        legendSelect.append("rect")
            .attr("x", (3*this.vizWidth/6))
            .attr("height", this.vizHeight)
            .attr("width", 1);

        for(let i = 0; i < 3; i++){
            legendSelect.append("text")
                .attr("x", x => this.scaleX((i*25)+25))
                .attr("y", this.smallVizHeight)
                .attr("class","trump")
                .attr("text-anchor","middle")
                .text(function() {return "+"+(25 + i*25)});
        }

    }

    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, this.tableData.indexOf(d));
                }

            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class);


        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */

        // forecastSelection selects all rows within a table
        let vizSelection = forecastSelection.filter(d => d.type === 'viz');
        // this adds an svg to the central cell of the table in all rows 
        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);
        // adds a group to the svg of each row so multiple elements can be added more easily and transformed
        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        // i being set determines which of the groups is selected of the three present
        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));

        // portion that I have coded

        // forecastSelection has this.rowToCellDataTransform of this.tableData bound to it - this transforms the data and assigns
        // it cell by cell so all that needs be done is append the text - its even formated
        let textSelect = forecastSelection.filter(d => d.type === "text");
            textSelect.join("text")
                .text(d => d.value)
                
        
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: +d.margin_lo,
                margin: +d.margin,
                marginHigh: +d.margin_hi,
            }
        };
        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winstate_inc;
            const bidenWinChance = +d.winstate_chal;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */
        let that = this;

        let stateCol = d3.selectAll(".sortable").filter((d,i) => i === 0);
        let predCol = d3.selectAll(".sortable").filter((d,i) => i === 1);
        let winCol = d3.selectAll(".sortable").filter((d,i) => i === 2);

        stateCol.on("click", function(d,i){

            that.headerData[1].sorted = that.headerData[2].sorted = false;
            that.headerData[1].ascending = that.headerData[2].ascending= false;
            winCol.classed("sorting",false)
            winCol.select(".fas").classed("no-display",true).classed("fa-sort-down",false)            
            predCol.classed("sorting",false)
            predCol.select(".fas").classed("no-display",true).classed("fa-sort-down",false)

            if(that.headerData[0].sorted === false && that.headerData[0].ascending === false){
                    d3.select(this).classed("sorting",true)
                    d3.select(this).select(".fas").classed("no-display",false).classed("fa-sort-up",true)
                    that.headerData[0].sorted = true;
                    that.headerData[0].ascending = true;
                    that.attachSortHandlers();
            }   
            else if(that.headerData[0].sorted === true && that.headerData[0].ascending === true){
                d3.select(this).select(".fas").classed("fa-sort-up",false).classed("fa-sort-down",true)
                that.headerData[0].ascending = false;
                that.attachSortHandlers();
                that.headerData[0].sorted = false;
            }
        })
        
        predCol.on("click", function(d,i){

            that.headerData[0].sorted = that.headerData[2].sorted = false;
            that.headerData[0].ascending = that.headerData[2].ascending= false;
            stateCol.classed("sorting",false)
            stateCol.select(".fas").classed("no-display",true).classed("fa-sort-down",false)            
            winCol.classed("sorting",false)
            winCol.select(".fas").classed("no-display",true).classed("fa-sort-down",false)

            if(that.headerData[1].sorted === false && that.headerData[1].ascending === false){
                d3.select(this).classed("sorting",true)
                d3.select(this).select(".fas").classed("no-display",false).classed("fa-sort-up",true)
                that.headerData[1].sorted = true;
                that.headerData[1].ascending = true;
                that.attachSortHandlers();
            }   
            else if(that.headerData[1].sorted === true && that.headerData[1].ascending === true){
                d3.select(this).select(".fas").classed("fa-sort-up",false).classed("fa-sort-down",true)
                that.headerData[1].ascending = false;
                that.attachSortHandlers();
                that.headerData[1].sorted = false;
            }
        })

        winCol.on("click", function(d,i){

            that.headerData[0].sorted = that.headerData[1].sorted = false;
            that.headerData[0].ascending = that.headerData[1].ascending= false;
            stateCol.classed("sorting",false)
            stateCol.select(".fas").classed("no-display",true).classed("fa-sort-down",false)
            predCol.classed("sorting",false)
            predCol.select(".fas").classed("no-display",true).classed("fa-sort-down",false)

            if(that.headerData[2].sorted === false && that.headerData[2].ascending === false){
                d3.select(this).classed("sorting",true)
                d3.select(this).select(".fas").classed("no-display",false).classed("fa-sort-up",true)
                that.headerData[2].sorted = true;
                that.headerData[2].ascending = true;
                that.attachSortHandlers();
                
            }   
            else if(that.headerData[2].sorted === true && that.headerData[2].ascending === true){
                d3.select(this).select(".fas").classed("fa-sort-up",false).classed("fa-sort-down",true)
                that.headerData[2].ascending = false;
                that.attachSortHandlers();
                that.headerData[2].sorted = false;
            }
        })

    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */

        // Container select is using grouperSelect which selects the group that has been appended to the SVG of each row
        // Ticks are defining location of where gridlines should be

        containerSelect.selectAll("rect").data(ticks)
            .join("rect")
            .attr("x", d => this.scaleX(d))
            .attr("height", this.vizHeight)
            .attr("width", 1)
            .attr("fill", "#d1d1d1")
            .attr("class",(d,i) => "gridline-"+i)

        containerSelect.select(".gridline-3").attr("fill","black")
    
    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */

        let that = this
        containerSelect.filter(d => d.isForecast === false).selectAll("rect").data(d => [d])
            .join("rect")
            .attr("width",0)
        containerSelect.filter(d => d.isForecast === true).selectAll("rect").data(d => [d.value])
            .join("rect")
            .attr("x", function(d) {
                if((d.marginLow && d.marginHigh <= 0)||(d.marginHigh && d.marginLow >=0)){
                    return that.scaleX(d.marginLow);
                }
                else{
                    return that.scaleX(0);
                }
            })
            .attr("y",(this.vizHeight-this.smallVizHeight)/2)
            .attr("width", function(d) { 
                if((d.marginLow && d.marginHigh <= 0)||(d.marginHigh && d.marginLow >=0)){
                    return (that.scaleX(d.marginHigh) - that.scaleX(d.marginLow))
                }
                else{
                    return (that.scaleX(d.marginHigh) - that.scaleX(0))
                } 
            })
            .attr("height", this.smallVizHeight)
            .attr("class",function(d) {
                if((d.marginLow && d.marginHigh <= 0)||(d.marginHigh && d.marginLow >=0)){
                    if(d.margin > 0){
                        return "margin-bar trump"
                    }
                    else{
                        return "margin-bar biden"
                    }
                }
                else{
                    return "margin-bar trump"
                }
        });    
        containerSelect.data(d => [d.value])
            .append("rect")
            .attr("x", function(d) {
                if((d.marginLow <= 0) && (d.marginHigh >= 0)){
                    return  that.scaleX(d.marginLow)}
            })
            .attr("y",(this.vizHeight-this.smallVizHeight)/2)
            .attr("width", function(d){
                if((d.marginLow <= 0) && (d.marginHigh >= 0)){
                    return (that.scaleX(0)-that.scaleX(d.marginLow))
                }
            })
            .attr("height", this.smallVizHeight)
            .attr("class",function(d) {
                if((d.marginLow <= 0) && (d.marginHigh >= 0)){
                    return "margin-bar biden"
                }
                else{
                    return "no-display"
                }
            });
        

    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */
        containerSelect.filter(d => d.isForecast === false).selectAll("circle").data(d => [d])
            .join("circle")
            .attr("cx", d => this.scaleX(d.value.margin))
            .attr("cy", this.smallVizHeight/2)
            .attr("r", 3)
            .attr("class", function(d) {
                if(d.value.margin > 0){
                    return "margin-circle trump"
                }
                else{
                    return "margin-circle biden"
                }
            });

        containerSelect.filter(d => d.isForecast).selectAll("circle").data(d => [d])
            .join("circle")
            .attr("cx", d => this.scaleX(d.value.margin))
            .attr("cy", this.vizHeight/2)
            .attr("r", 5)
            .attr("class", function(d) {
                if(d.value.margin > 0){
                    return "margin-circle trump"
                }
                else{
                    return "margin-circle biden"
                }
            });
    }

    attachSortHandlers() 
    {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */
        this.collapseAll();

        let that = this;
        
        if(that.headerData[0].sorted === true && that.headerData[0].ascending === true){
            that.tableData.sort((a,b) => 
                    d3.ascending(a.state,b.state));
            that.drawTable()
        }   
        else if(that.headerData[0].sorted === true && that.headerData[0].ascending === false){
            that.tableData.sort((a,b) => 
                    d3.descending(a.state,b.state));
            that.drawTable()
        }

        if(that.headerData[1].sorted === true && that.headerData[1].ascending === true){
            that.tableData.sort((a,b) => 
                    d3.ascending(Math.abs(a.margin),Math.abs(b.margin)));
            that.drawTable()
        }   
        else if(that.headerData[1].sorted === true && that.headerData[1].ascending === false){
            that.tableData.sort((a,b) => 
                    d3.descending(Math.abs(a.margin),Math.abs(b.margin)));
            that.drawTable()
        }

        if(that.headerData[2].sorted === true && that.headerData[2].ascending === true){
            that.tableData.sort((a,b) => 
                    d3.ascending(+a.winstate_inc,+b.winstate_inc));
            that.drawTable()
        }   
        else if(that.headerData[2].sorted === true && that.headerData[2].ascending === false){
            that.tableData.sort((a,b) => 
                    d3.descending(+a.winstate_inc,+b.winstate_inc));
            that.drawTable()
        }
    }


    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */
        let that = this;

        if(rowData.isExpanded === true){
            this.tableData = this.tableData.filter(d => d.state !== rowData.state);
            this.tableData.splice(index,0,rowData)
            this.drawTable();
            this.tableData[index].isExpanded = false;
        }
        else if(rowData.isExpanded === false){
            this.tableData[index].isExpanded = true;
            let stateName = rowData.state;
            let statePolls = this.pollData.get(stateName);
            // let newTable = [];
            // for(let i = 0; i <= index; i++){
            //     newTable[i] = this.tableData[i];
            // }
            // for(let i = 0; i < statePolls.length; i++){
            //     newTable[index+1+i] = statePolls[i];
            // }
            // for(let i = index + 1; i < this.tableData.length; i++){
            //     newTable[statePolls.length + i] = this.tableData[i];
            // }
            // this.tableData = newTable;
            for(let i = 0; i < statePolls.length; i++){
                this.tableData.splice(index+1+i,0,statePolls[i]);
                this.tableData[index+i+1].isForecast = false;
            }
            this.drawTable();
        }

    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
