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

GChart.prototype.addColumn = function(col) {
    this.columns.push(col);
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

    for(var i = 0; i < this.tooltipPositions.length; i++) {
        rowArr.insert(this.tooltipPositions[i], row.tooltips[i]);
    }

    for(var i = 0; i < this.annotationPositions.length; i++) {
        rowArr.insert(this.annotationPositions[i], row.annotations[i]);
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
    this.beenDrawn = true;
};