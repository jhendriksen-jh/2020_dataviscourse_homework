/**
 * Data structure for the data associated with an individual country.
 * the CountryData class will be used to keep the data for drawing your map.
 * You will use the region to assign a class to color the map!
 */
class CountryData {
    /**
     *
     * @param type refers to the geoJSON type- countries are considered features
     * @param properties contains the value mappings for the data
     * @param geometry contains array of coordinates to draw the country paths
     * @param region the country region
     */
    constructor(type, id, properties, geometry, region) {

        this.type = type;
        this.id = id;
        this.properties = properties;
        this.geometry = geometry;
        this.region = region;

        
    }
}

/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data the full dataset
     * @param updateCountry a callback function used to notify other parts of the program when the selected
     * country was updated (clicked)
     */
    constructor(data, updateCountry) {
        this.projection = d3.geoWinkel3().scale(140).translate([365, 225]);
        this.nameArray = data.population.map(d => d.geo.toUpperCase());
        this.populationData = data.population;
        this.updateCountry = updateCountry;
    }

    /**
     * Renders the map
     * @param world the json data with the shape of all countries and a string for the activeYear
     */
    drawMap(world) {
        //note that projection is global!

        // ******* TODO: PART I *******

        // Draw the background (country outlines; hint: use #map-chart)
        // Make sure to add a graticule (gridlines) and an outline to the map

        let path = d3.geoPath().projection(this.projection);

        d3.select("#map-chart").append("svg").attr("id","map-chart svg")

        let geoJSON = topojson.feature(world, world.objects.countries);

        let countryData = [];

        for(let i = 0; i < geoJSON.features.length; i++){
            let node = new CountryData(geoJSON.features[i].type,
                geoJSON.features[i].id,
                geoJSON.features[i].properties,
                geoJSON.features[i].geometry,
                geoJSON.features[i].region);
            countryData.push(node);
        }

        for(let i = 0; i < this.populationData.length; i++ ){
            for(let j = 0; j < countryData.length; j++){
                if(countryData[j].id === this.populationData[i].geo.toUpperCase()){
                    countryData[j].region = this.populationData[i].region;
                }
            }
        }

        for(let i = 0; i < countryData.length; i++){
            if(countryData[i].region === undefined){
                countryData[i].region = "countries";
            }
        }


        let map = d3.select("#map-chart svg");
            map.selectAll("path")
                .data(countryData)
                .enter()
                .append("path")
                .attr("d",path)
                .attr("id", (d) => d.id)
                .attr("class",(d) => ""+d.region+ " boundary");

        let graticule = d3.geoGraticule();    
            map.append("path")
                .datum(graticule)
                .attr("class","graticule")
                .attr("d",path);
            map.append("path")
                .datum(graticule.outline)
                .attr("class","stroke")
                .attr("d",path)

        let that = this;            
        let selectedCountry = d3.select("#map-chart").selectAll("svg").selectAll("path").data(countryData);

        selectedCountry.on("click",function(d){
        
            that.updateCountry(d);
        })
        

        // Hint: assign an id to each country path to make it easier to select afterwards
        // we suggest you use the variable in the data element's id field to set the id

        // Make sure and give your paths the appropriate class (see the .css selectors at
        // the top of the provided html file)

        // You need to match the country with the region. This can be done using .map()
        // We have provided a class structure for the data called CountryData that you should assign the paramters to in your mapping

        //TODO - your code goes here
    }

    /**
     * Highlights the selected conutry and region on mouse click
     * @param activeCountry the country ID of the country to be rendered as selected/highlighted
     */
    updateHighlightClick(activeCountry) {
        // ******* TODO: PART 3 *******
        // Assign selected class to the target country and corresponding region
        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for countries/regions, you can use
        // d3 selection and .classed to set these classes on here.

        //TODO - your code goes here

        let selectCountry = d3.selectAll("#"+activeCountry.id);
        selectCountry.classed("selected-country",true)
    }

    /**
     * Clears all highlights
     */
    clearHighlight() {
        // ******* TODO: PART 3 *******
        // Clear the map of any colors/markers; You can do this with inline styling or by
        // defining a class style in styles.css

        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for hosts/teams/winners, you can use
        // d3 selection and .classed to set these classes off here.

        //TODO - your code goes here
        
        d3.selectAll("path").classed("selected-country",false);
        d3.select("#detail-svg")
            .style("opacity",1)
            .transition()
            .duration(1500)
            .style("opacity",0)
            .remove();
    }
}
