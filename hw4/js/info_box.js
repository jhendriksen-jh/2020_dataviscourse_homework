/** Data structure for the data associated with an individual country. */
class InfoBoxData {
    /**
     *
     * @param country name of the active country
     * @param region region of the active country
     * @param indicator_name the label name from the data category
     * @param value the number value from the active year
     */
    constructor(country, region, indicator_name, value) {
        this.country = country;
        this.region = region;
        this.indicator_name = indicator_name;
        this.value = value;
    }
}

/** Class representing the highlighting and selection interactivity. */
class InfoBox {
    /**
     * Creates a InfoBox Object
     * @param data the full data array
     */
    constructor(data) {

        //TODO - your code goes here -
        this.data = data;
    }

    /**
     * Renders the country description
     * @param activeCountry the IDs for the active country
     * @param activeYear the year to render the data for
     */
    updateTextDescription(activeCountry, activeYear) {
        // ******* TODO: PART 4 *******
        // Update the text elements in the infoBox to reflect:
        // Selected country, region, population and stats associated with the country.
        /*
         * You will need to get an array of the values for each category in your data object
         * hint: you can do this by using Object.values(this.data)
         * you will then need to filter just the activeCountry data from each array
         * you will then pass the data as paramters to make an InfoBoxData object for each category
         *
         */

        //TODO - your code goes here -

        let infoData = [];

        let dataKey = Object.keys(this.data);
        let dataValue = Object.values(this.data);

        for(let i = 0; i < 5; i++){
            for(let j = 0; j < dataValue[i].length; j++){
                if(activeCountry.id === dataValue[i][j].geo.toUpperCase()){
                    let node = new InfoBoxData (dataValue[i][j].country,
                        dataValue[i][j].region,
                        dataKey[i],
                        dataValue[i][j][activeYear]);
                    infoData.push(node);
                }
            }
        }
        d3.select("#country-detail").select("svg").remove();

        d3.select("#country-detail").append("svg").attr("id","detail-svg").attr("height",200).attr("width",780);

        let box = d3.select("#detail-svg").selectAll("text");
        box.remove();

        for(let i = 0; i < infoData.length; i++){
            d3.select("#detail-svg").append("text")
                .attr("y", 70+(i*25))
                .attr("x", 60)
                .text(function(d) {return infoData[i].indicator_name+": "+infoData[i].value+" "});
        }
        for(let j = 0; j < infoData.length; j++){
            d3.select("#detail-svg").append("circle")
                    .attr("cy", 65+(j*25))
                    .attr("cx", 50)
                    .attr("r",5)
                    .attr("class", (t) => {return infoData[0].region});
        }

        d3.select("#detail-svg").append("text")
            .attr("y", 20)
            .text(infoData[0].country)
            .attr("font-weight", "bold");
        d3.select("#detail-svg").append("text")
            .attr("y", 45)
            .attr("x", 30)
            .attr("font-weight", "bold")
            .text((t) => {return "Region: "+infoData[0].region});

    }

    /**
     * Removes or makes invisible the info box
     */
    clearHighlight() {

        //TODO - your code goes here -
    }

}