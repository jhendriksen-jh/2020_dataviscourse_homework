// wordsData = d3.json('.data/words.json');
Promise.all([d3.json('./data/words.json')]).then( data =>
    {
        function updateTable(selectedInd,catInd){
            if(selectedInd.length == 0){
                table.clearFilter();
            }
            else{
                table.filterTable(selectedInd,catInd);
            }
        }

        let table = new Table(data);
        let bubble = new BubblePlot(data,updateTable);

        table.drawTable();
        bubble.drawBubbles();

        document.addEventListener("click", function (e) {
            table.clearFilter();
        }, true);

    });

