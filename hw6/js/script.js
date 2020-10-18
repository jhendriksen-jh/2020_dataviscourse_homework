// wordsData = d3.json('.data/words.json');
Promise.all([d3.json('./data/words.json')]).then( data =>
    {
        this.expansion = false;
        // console.log(data)
        let table = new Table(data);
        let bubble = new BubblePlot(data,this.expansion);
        // console.log(table)
        // console.log(bubble)
        table.drawTable();
        bubble.drawBubbles();

        document.getElementById("toggle-switch")
            .addEventListener("click",bubble.updateExpansion);
    });

