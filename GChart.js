var getElementByText = function(text) {
    var elem = $('text').filter(function() {
          return($(this).text().trim() === text);
    });
    if(elem.length) return elem[0];
};

GChart = function(divId, type) {
    this.chart     = null;
    this.divId     = divId;
    this.chartType = type;
    this.columns   = [];
    this.rows      = [];
    this.data      = null;
    this.listeners = [];
    this.options = {
        tooltip:{isHtml:true},
        legend: {
            'position': 'top',
            'maxLines': 2
        }
    };
    this.beenDrawn = false;
    var self = this;
    
    this.chart = new google.visualization[this.chartType](document.getElementById(this.divId));
    window.addEventListener('resize', function() {
        if(self.beenDrawn)
            self.draw();
    });
};

GChart.onLoad = function(callback) {
    google.charts.load('current', {
        packages: ['corechart']
    });
    google.charts.setOnLoadCallback(function() {
        if(callback)
            callback();
    });
};

GChart.prototype.addColumn = function(type, title) {
    if(typeof type == 'string')
        this.columns.push([type, title]);
    else if(!title)
        this.columns.push(type); //Is actually Options object
    else throw 'Cannot determine column type.';

    if(this.beenDrawn)
        this.draw();
};

GChart.prototype.addRow = function(row) {
    this.rows.push(row);

    if(this.beenDrawn)
        this.draw();
};

GChart.prototype.addRows = function(rows) {
    for(var i = 0; i < rows.length; i++)
        this.addRow(rows[i]);
};

GChart.prototype.addOption = function(key, value) {
    this.options[key] = value;
};

/*GChart.prototype.getRowTextElements = function() {
    var textDivs = [];
    var temp = document.querySelectorAll('#' + this.divId + ' text');
    for(var i = 0; i < temp.length; i++)
        textDivs.push(temp[i]);

    return textDivs.slice(textDivs.length-this.rows.length+1, textDivs.length+2);
};*/

GChart.prototype.draw = function() {
    this.data = new google.visualization.DataTable();

    for(var i = 0; i < this.columns.length; i++) {
        if(Array.isArray(this.columns[i]))
            this.data.addColumn(this.columns[i][0], this.columns[i][1]);
        else this.data.addColumn(this.columns[i]);
    }

    for(var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        if(row.tooltip)
            this.data.addRow([row.title, row.value, row.tooltip]);
        else this.data.addRow([row.title, row.value]);
    }
    // this.data.addRows(this.rows);

    this.chart.draw(this.data, this.options);
    this.beenDrawn = true;
};