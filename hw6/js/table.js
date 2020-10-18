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
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'phrase'
            },
            {
                sorted: false,
                ascending: false,
                key: 'freq',
            },
            {
                sorted: false,
                ascending: false,
                key: 'percentage',
            },
            {
                sorted: false,
                ascending: false,
                key: 'total',
            },
        ]

        this.vizWidth = 100;
        this.vizHeight = 30;
        this.smallVizHeight = 15;

        this.scaleF = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.vizWidth]);

        let catList = [];
        for(let i = 0; i < this.tableData.length; i++){
            catList.push(this.tableData[i].category);
        }
        catList = [...new Set(catList)];

        this.scaleColor = d3.scaleOrdinal()
            .domain(catList)
            .range(d3.schemeSet2);
    
    }

    drawTable(){
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
            .join("g");
        let totalCol = cols.filter((d,i) => i === 3)
            .data(d =>[d])
            .join("text")
            .text(d => ""+d.total)
        this.addRect(freqCol);
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
    addRect(svgSelect){
        svgSelect.selectAll("rect").data(d => [d])
            .join("rect")
            .attr("width", d => this.scaleF(d.value))
            .attr("height", this.smallVizHeight)
            .attr("fill", d => this.scaleColor(d.category));
    }
}