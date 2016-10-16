Array.prototype.insert = function(index, item) {
    this.splice(index, 0, item);
};

GChart = function(divId, type) {
    this.chart               = null;
    this.divId               = divId;
    this.chartType           = type;
    this.columns             = [];
    this.rows                = [];
    this.tooltipPositions    = [];
    this.annotationPositions = [];
    this.data                = null;
    this.listeners           = {};
    this.options             = {
        tooltip:{isHtml:true},
        legend: {
            'position': 'top',
            'maxLines': 2
        }
    };
    this.beenDrawn        = false;
    this.somethingChanged = false;
    this.loaded           = false;
    var self              = this;
    
    this.chart = new google.visualization[this.chartType](document.getElementById(this.divId));
    window.addEventListener('resize', function() {
        if(self.beenDrawn) {
            self.somethingChanged = true;
            self.draw();
        }
    });
};

GChart.onLoad = function(callback) {
    if(!this.loaded) {
        var self = this;
        google.charts.load('current', {
            packages: ['corechart']
        });
        google.charts.setOnLoadCallback(function() {
            self.loaded = true;
            if(callback)
                callback();
        });
    }
    else if(callback) callback();
};

GChart.prototype.addColumn = function(col, triggerChange) {
    this.columns.push(col);
    this.somethingChanged = (triggerChange !== 'undefined' ? triggerChange:true);
};

GChart.prototype.addColumns = function(cols) {
    for(var i = 0; i < cols.length; i++)
        this.columns.push(cols[i], false);

    this.somethingChanged = true;
};

GChart.prototype.addRow = function(row, triggerChange) {
    this.rows.push(row);
    this.somethingChanged = (triggerChange !== undefined ? triggerChange:true);

    if(this.beenDrawn)
        this.draw();
};

GChart.prototype.addRows = function(rows) {
    for(var i = 0; i < rows.length; i++)
        this.addRow(rows[i], false);

    this.somethingChanged = true;
};

GChart.prototype.clear = function() {
    this.rows             = [];
    this.columns          = [];
    this.somethingChanged = true;
};

GChart.prototype.getColumnArray = function() {
    var colArr               = [];
    this.tooltipPositions    = [];
    this.annotationPositions = [];   
    for(var i = 0; i < this.columns.length; i++) {
        var col = this.columns[i];
        colArr.push(col.title || col.options);
        if(col.tooltip) {
            var tooltipIndex = (i+1);
            tooltipIndex += this.tooltipPositions.length;
            this.tooltipPositions.push(tooltipIndex);
            colArr.push({role:'tooltip'});
        }

        if(col.annotation) {
            var annotationIndex = (i+1);
            annotationIndex += this.annotationPositions.length + this.tooltipPositions.length;
            this.annotationPositions.push(annotationIndex);
            colArr.push({role:'annotation'});
        }
    }

    return colArr;
};

GChart.prototype.getRowArray = function(rowIndex) {
    var row = this.rows[rowIndex];
    var rowArr = [row.title];

    for(var i = 0; i < row.values.length; i++) {
        var value = row.values[i];
        rowArr.push(value);
    }

    for(var j = 0; j < this.tooltipPositions.length;j++) {
        rowArr.insert(this.tooltipPositions[j], row.tooltips[j]);
    }

    for(var k = 0; k < this.annotationPositions.length;k++) {
        rowArr.insert(this.annotationPositions[k], row.annotations[k]);
    }

    return rowArr;
};

GChart.prototype.getRowsArray = function() {
    var rowsArr = [];
    for(var i = 0; i < this.rows.length; i++) {
        rowsArr.push(this.getRowArray(i));
    }

    return rowsArr;
};

GChart.prototype.fadeOut = function() {
    var elem              = document.getElementById(this.divId);
    var opacity           = (elem.style.opacity === '' ? 1.0:elem.style.opacity);
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
    this.options[key]     = value;
    this.somethingChanged = true;
};

GChart.prototype.addOptions = function(options) {
    var keys = Object.keys(options);
    for(var i = 0; i < keys.length; i++)
        this.options[keys[i]] = options[keys[i]];

    this.somethingChanged = true;
};

GChart.prototype.addListener = function(name, func, overwrite) {
    if(this.listeners[name] && overwrite)
        this.removeListener(name);

    this.listeners[name] = {
        func:func,
        event:google.visualization.events.addListener(this.chart, name, func)
    };
    this.somethingChanged = true;
};

GChart.prototype.removeListener = function(name) {
    if(this.listeners[name]) {
        google.visualization.events.removeListener(this.listeners[name].event);
        delete this.listeners[name];
        this.somethingChanged = true;
    }
};

GChart.prototype.getRowTitleElements = function() {
    var textDivs = [];
    var temp     = document.querySelectorAll('#' + this.divId + ' text');
    for(var i = 0; i < temp.length; i++)
        textDivs.push(temp[i]);

    var startingIndex = textDivs.length - this.rows.length;
    if(this.annotationPositions.length > 0)
        startingIndex -= (this.annotationPositions.length * this.rows.length);

    return textDivs.slice(startingIndex, startingIndex + this.rows.length);
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
    if(this.somethingChanged) {
        var self  = this;
        var colArr = this.getColumnArray();
        var rowsArr = this.getRowsArray();
        rowsArr.unshift(colArr);

        this.data = new google.visualization.arrayToDataTable(rowsArr);

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

                window.setTimeout(self.createRowTitleLinks(), 50);
            });
        }

        this.chart.draw(this.data, this.options);
        this.beenDrawn        = true;
        this.somethingChanged = false;
    }
};