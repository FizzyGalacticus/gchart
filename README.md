### GChart

This library was written in order to make creating charts using Google Charts more intuitive and to add additional functionality that doesn't currently exist.

For instance, if the data in a chart changes, or the window resizes, I wanted my chart to re-draw with the new data/dimensions. I also wanted to be able to add links to the row titles.

Instead of trying to wrap your head around adding data to a Google Chart, this library makes it much easier with functions like addColumn and addRow, which both take objects with meaningful keys.

For example, here is a basic chart:
```javascript
GChart.onLoad(function() {
    var myChart = new GChart('myChart', 'BarChart');
    myChart.addColumn({type:'string', title:'Year'});
    myChart.addColumn({type:'number', title:'Sales'});
    myChart.addColumn({type:'number', title:'Profits'});
    myChart.addColumn({type:'number', title:'Losses'});
    myChart.addRow({
            title:'2010',
            values:[600, 700, 300],
            titleUrl:'https://www.google.com/search?q=kittens&oq=kittens&aqs=chrome..69i57j0l5.1655j0j7&sourceid=chrome&ie=UTF-8'
        });
        
    myChart.addOptions({
        animation: {
            'duration': 750,
            'startup': true,
            'easing': 'out'
        }
    });

    myChart.draw();

    setTimeout(function() {
        myChart.addRow({
            title:'2015',
            values:[1350, 962, 1034],
            titleUrl:'https://www.youtube.com/watch?v=4LZo9ugJTWQ'
        });
    }, 2000);
});
```

The above code will look something like this:
![Basic Example](https://github.com/FizzyGalacticus/gchart/blob/master/demofiles/basicdemo.gif?raw=true)

To use this library, simply include the gchart.min.js script located in the ``dist`` folder of this repo. Everything that I've added uses Vanilla JS, so you shouldn't run into any issues with other libraries (unless Google uses non-vanilla code in the core charts library).