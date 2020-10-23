// wordsData = d3.json('.data/words.json')
Promise.all([d3.json('./data/words.json')]).then( data =>
    {
        // console.log(data)
        function updateTable(selectedInd,catInd,expansion){
            if(selectedInd.length == 0){
                table.clearSelection();
            }
            else{
                table.filterTable(selectedInd,catInd,expansion);
            }
        }

        let table = new Table(data);
        let bubble = new BubblePlot(data,updateTable);

        table.drawTable();
        bubble.drawBubbles();

    });

