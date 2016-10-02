GChart = function(divId, type) {
    this.chart     = null;
    this.divId     = divId;
    this.chartType = type;
    this.columns   = [];
    this.rows      = [];
    this.data      = null;
    this.listeners = {};
    this.options   = {
        tooltip:{isHtml:true},
        legend: {
            'position': 'top',
            'maxLines': 2
        }
    };
    this.beenDrawn = false;
    var self       = this;
    
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

GChart.prototype.clear = function() {
    this.rows    = [];
    this.columns = [];
};

GChart.prototype.fadeOut = function() {
    var elem              = document.getElementById(this.divId);
    var opacity           = (elem.style.opacity == '' ? 1.0:elem.style.opacity);
    var self              = this;
    var timeoutTime       = 5;
    var opacityDifference = 0.005;

    if(opacity > 0.0) {
        window.setTimeout(function() {
            elem.style.opacity = opacity - opacityDifference;
            self.fadeOut();
        }, timeoutTime);
    }
    else if(this.listeners.animationfinish) {
            this.listeners.animationfinish.func();
    }
};

GChart.prototype.addOption = function(key, value) {
    this.options[key] = value;
};

GChart.prototype.addOptions = function(options) {
    var keys = Object.keys(options);
    for(var i = 0; i < keys.length; i++)
        this.options[keys[i]] = options[keys[i]];
};

GChart.prototype.addListener = function(name, func, overwrite) {
    if(this.listeners[name] && overwrite)
        this.removeListener(name);

    this.listeners[name] = {
        func:func,
        event:google.visualization.events.addListener(this.chart, name, func)
    };
};

GChart.prototype.removeListener = function(name) {
    if(this.listeners[name]) {
        google.visualization.events.removeListener(this.listeners[name].event);
        delete this.listeners[name];
    }
};

GChart.prototype.getRowTitleElements = function() {
    var textDivs = [];
    var temp     = document.querySelectorAll('#' + this.divId + ' text');
    for(var i = 0; i < temp.length; i++)
        textDivs.push(temp[i]);

    return textDivs.slice(textDivs.length-this.rows.length, textDivs.length);
};

GChart.prototype.createRowTitleLinks = function() {
    var titleElements = this.getRowTitleElements();
    var onClick = function(url) {
        return function() {
            window.open(url, '_blank');
        };
    };

    var mouseover = function() {
        document.body.style.cursor = 'pointer';
    };

    var mouseout = function() {
        document.body.style.cursor = 'default';
    };

    for(var i = 0; i < titleElements.length; i++) {
        if(this.rows[i].titleUrl) {
            var elem     = titleElements[i];
            elem.onclick = onClick(this.rows[i].titleUrl);
            elem.addEventListener('mouseover', mouseover);
            elem.addEventListener('mouseout', mouseout);
        }
    }
};

GChart.prototype.draw = function() {
    var self  = this;
    this.data = new google.visualization.DataTable();

    for(var i = 0; i < this.columns.length; i++) {
        if(Array.isArray(this.columns[i]))
            this.data.addColumn(this.columns[i][0], this.columns[i][1]);
        else this.data.addColumn(this.columns[i]);
    }

    for(var j = 0; j < this.rows.length; j++) {
        var row     = this.rows[j];
        var tempArr = [row.title];
        for(var k = 0; k < row.values.length; k++) {
            tempArr.push(row.values[k]);
            if(row.tooltips)
                tempArr.push(row.tooltips[k]);
        }

        this.data.addRow(tempArr);
    }

    if(this.chartType == 'BarChart' || this.chartType == 'ColumnChart') {
        this.addListener('animationfinish', function() {
            var rects = document.getElementsByTagName('rect');
            for(var i = 0; i < rects.length; i++) {
                var rect       = rects[i];
                var rectWidth  = (rect.width.baseVal.value ? rect.width.baseVal.value:100);
                var rectHeight = (rect.height.baseVal.value ? rect.height.baseVal.value:100);
                if(rectWidth == 0.5 || rectHeight == 0.5) {
                    rect.style.display = 'none';
                }
            }

            window.setTimeout(self.createRowTitleLinks(), 100);
            console.log('animationfinish complete');
        });
    }

    this.chart.draw(this.data, this.options);
    this.beenDrawn = true;
};