define([
  'backbone',
  'underscore',
  'd3',
  'helpers/NumbersHelper',
  'text!countries/templates/report/historical-trend-chart.handlebars'
], function(
  Backbone,
  _,
  d3,
  NumbersHelper,
  tpl
) {

  'use strict';

  var SummaryChart = Backbone.View.extend({

    el: '#historical-trend-chart',

    template: Handlebars.compile(tpl),

    defaults: {
      chartEl: 'historical-trend-chart-svg',
      chartClass: 'js-historical-trend-chart',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 20,
      paddingYAxisLabels: 10,
      margin: {
        top: 10,
        right: 35,
        bottom: 35,
        left: 20
      },
      rowHeight: 26,
      barHeight: 5,
      barMargin: 10,
      defaultZeroValue: 5,
      yAxisWidth: 30,
      labels: [
        {
          name: 'Year',
          slug: 'year',
          width: 10
        },
        {
          name: 'Average',
          slug: 'average',
          width: 70
        },
        {
          name: 'Loss (ha)',
          slug: 'loss',
          width: 10
        },
        {
          name: 'Deviation',
          slug: 'deviation',
          width: 20
        }
      ]
    },

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings);
      this.data = this.defaults.data;

      this._initChart();

      // Sets listeners
      this.setListeners();
    },

    _initChart: function() {
      // Data parsing and initialization
      this._parseData();

      this._start();
    },

    _start: function() {
      var referenceAvg = this.referenceData.average;
      var monitoringAvg = this.monitoringData.average;
      var increase = Math.round(((monitoringAvg - referenceAvg) / referenceAvg) * 100);
      var hasIncreased = increase > -1;

      this.$el.html(this.template({
        hasData: this.chartData.length,
        referenceAvg: referenceAvg.toFixed(2),
        monitoringAvg: monitoringAvg.toFixed(2),
        increase: increase,
        hasIncreased: hasIncreased
      }));

      this.render();
    },

    render: function() {
      this._setUpGraph();
      this._drawGrid();
      this._setAxisScale();
      this._setDomain();
      this._drawGraph();
     },

    /**
     * Sets the listeners for the component
     */
    setListeners: function() {
      this.refreshEvent = _.debounce(_.bind(this._update, this), 30);
      window.addEventListener('resize', this.refreshEvent, false);
    },

    unsetListeners: function() {
      window.removeEventListener('resize', this.refreshEvent, false);

      this.refreshEvent = null;
    },

    /**
     *  Parses the data for the chart
     */
    _parseData: function() {
      var dates = [];
      this.chartData = [];

      for (var indicator in this.data) {
        var current = this.data[indicator];
        if (current && current.values) {
          current.total = Math.round(current.total);

          current.values.forEach(function(data) {
            data.value = Math.round(data.value);
            data.type = indicator;
            this.chartData.push(data);
          }.bind(this));
        }
      }

      this.referenceData = this.data['reference'];
      this.monitoringData = this.data['monitor'];
    },

    /**
     *  Sets up the SVG for the graph
     */
    _setUpGraph: function() {
      this.chartEl = this.el.querySelector('#' + this.defaults.chartEl);
      var el = this.chartEl
      var margin = this.defaults.margin;

      el.innerHTML = '';
      el.classList.add(this.defaults.chartClass);

      this.cWidth = el.clientWidth;
      this.cHeight = (this.chartData.length + 4) * this.defaults.rowHeight;
      this.domain = this._getDomain();

      this.yAxisWidth = this.defaults.yAxisWidth;
      this.widthPadding = this.cWidth - this.yAxisWidth;

      this.cWidth = this.cWidth - margin.left - margin.right;
      this.cHeight = this.cHeight - margin.top - margin.bottom;
      this.cWidthGrid = this.cWidth - margin.left - margin.right;

      var svg = d3.select(el).append('svg')
        .attr('width', this.cWidth + margin.left + margin.right + 'px')
        .attr('height', this.cHeight + margin.top + margin.bottom + 'px');

      this.svg = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    },

    /**
     *  Sets the axis
     */
    _setAxisScale: function() {
      var average = _.findWhere(this.defaults.labels, { slug: 'average' });
      var barsContentWidth = ((average.width * this.cWidthGrid) / 100) -
        (this.defaults.barMargin * 2);

      this.x = d3.scale.linear()
        .range([0, barsContentWidth]);

      this.y = d3.scale.linear()
        .range([0, this.cHeight]).nice();

      this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .innerTickSize(0)
        .outerTickSize(0)
        .ticks(this.chartData.length)
        .tickFormat(function(d, i) {
          if (this.chartData[i]) {
            return this.chartData[i].year;
          }
        }.bind(this));
    },

    /**
     * Sets the domain
     */
    _setDomain: function() {
      this.x.domain(this.domain.x);
      this.y.domain(this.domain.y);
    },

    /**
     *  Get the domain values
     */
    _getDomain: function() {
      return {
        x: d3.extent(this.chartData, function(d) { return d.value; }),
        y: [0, this.chartData.length]
      };
    },

    /**
     * Draws the entire graph
     */
    _drawGraph: function() {
      this._drawYears();
      this._drawLoss();
      this._drawDeviation();
      this._drawBars();
      this._drawTotalYears();
      this._drawTotalLoss();
    },

    _drawGrid: function() {
      // X Lines
      var numLines = this.chartData.length + 1;
      var rowOffset = this.defaults.rowHeight;
      var linesGroup = this.svg.append('g')
        .attr('transform', 'translate(0, '+ this.defaults.rowHeight +')');

      for (var x = 0; x < numLines; x++) {
        linesGroup.append('rect')
          .attr('class', 'xAxis')
          .attr('width', this.cWidth)
          .attr('height', 1)
          .attr('x', 0)
          .attr('y', rowOffset);

        rowOffset += this.defaults.rowHeight;
      }

      // Labels
      var marginOffset = 0;
      this.defaults.labels.forEach(function(label) {
        var margin = (label.width * this.cWidthGrid) / 100;
        var group = this.svg.append('g')
          .attr('transform', 'translate(' + marginOffset + ', 0)')
          .attr('class', label.slug);

        group.append('text')
          .attr('class', 'label')
          .attr('y', function() {
            return this.defaults.rowHeight / 2;
          }.bind(this))
          .attr('x', function() {
            return margin / 2;
          }.bind(this))
          .style('text-anchor', 'start')
          .text(label.name);

        marginOffset += margin;
      }.bind(this));

      // Y Line
      var averageGroup = this.svg.select('.average');
      linesGroup.append('rect')
        .attr('class', 'yAxis')
        .attr('width', 3)
        .attr('height', this.chartData.length * this.defaults.rowHeight)
        .attr('x', d3.transform(averageGroup.attr('transform')).translate[0])
        .attr('y', 0);
    },

    _drawYears: function() {
      var yearLabel = _.findWhere(this.defaults.labels, { slug: 'year' });
      var yearsContent = this.svg.append('g')
        .attr('transform', 'translate('+ 0 +', ' + this.defaults.rowHeight + ')');

      var yearsGroup = yearsContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + (this.defaults.rowHeight * i) + ')';
        }.bind(this));

      yearsGroup.append('text')
        .attr('class', 'year')
        .text(function(d) {
          return d.year;
        })
        .attr('dx', function() {
          return ((yearLabel.width * this.cWidthGrid) / 100) / 2;
        }.bind(this))
        .attr('dy', function() {
          return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
        }.bind(this));
    },

    _drawLoss: function() {
      var lossGroup = this.svg.select('.loss');
      var lossLabel = _.findWhere(this.defaults.labels, { slug: 'loss' });
      var lossLabelWidth = (lossLabel.width * this.cWidthGrid) / 100;

      var lossContent = this.svg.append('g')
        .attr('transform', 'translate('+
          (d3.transform(lossGroup.attr('transform')).translate[0] + lossLabelWidth) + ', ' +
          this.defaults.rowHeight + ')');

      var lossGroup = lossContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + (this.defaults.rowHeight * i) + ')';
        }.bind(this));

      lossGroup.append('text')
        .attr('class', 'value')
        .text(function(d) {
          return NumbersHelper.addNumberDecimals(d.value);
        })
        .attr('dx', function() {
          return (((lossLabel.width * this.cWidthGrid) / 100) / 2) -
          (((lossLabel.width * this.cWidthGrid) / 100) / 3);
        }.bind(this))
        .attr('dy', function() {
          return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
        }.bind(this));
    },

    _drawDeviation: function() {
      var deviationGroup = this.svg.select('.deviation');
      var deviationLabel = _.findWhere(this.defaults.labels, { slug: 'deviation' });
      var deviationLabelWidth = (deviationLabel.width * this.cWidthGrid) / 100;

      var lossContent = this.svg.append('g')
        .attr('transform', 'translate('+
          (d3.transform(deviationGroup.attr('transform')).translate[0] + deviationLabelWidth) + ', ' +
          this.defaults.rowHeight + ')');

      var deviationGroup = lossContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + (this.defaults.rowHeight * i) + ')';
        }.bind(this));

      deviationGroup.append('text')
        .attr('class', 'value')
        .text(function(d) {
          return '';//'-';
        })
        .attr('dx', function() {
          return (((deviationLabel.width * this.cWidthGrid) / 100) / 2) -
          (((deviationLabel.width * this.cWidthGrid) / 100) / 1.5);
        }.bind(this))
        .attr('dy', function() {
          return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
        }.bind(this));
    },

    _drawBars: function() {
      var averageGroup = this.svg.select('.average');
      var leftOffset = d3.transform(averageGroup.attr('transform')).translate[0] +
        this.defaults.barMargin;

      var barsContent = this.svg.append('g')
        .attr('transform', 'translate('+ leftOffset +', ' + this.defaults.rowHeight + ')');

      var barGroup = barsContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + (this.defaults.rowHeight * i) + ')';
        }.bind(this));

      barGroup.append('rect')
        .attr('class', function(d) {
          return 'bar ' + d.type;
        })
        .attr('height', this.defaults.barHeight)
        .attr('width', function(d) {
          var value = this.x(d.value);
          if (value === 0) {
            return this.defaults.defaultZeroValue;
          } else {
            return this.x(d.value);
          }
        }.bind(this))
        .attr('y', function() {
          return (this.defaults.rowHeight / 2) - (this.defaults.barHeight / 2);
        }.bind(this));
    },

    _drawTotalYears: function() {
      var yearLabel = _.findWhere(this.defaults.labels, { slug: 'year' });

      this.svg.append('g')
        .attr('transform', 'translate('+ 0 +', ' + this.defaults.rowHeight * (this.chartData.length + 1) + ')')
        .append('text')
          .attr('class', 'year-total')
          .text(this.referenceData.values[0].year + '-' + this.referenceData.values[1].year)
          .attr('dx', function() {
            return ((yearLabel.width * this.cWidthGrid) / 100);
          }.bind(this))
          .attr('dy', function() {
            return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
          }.bind(this));

      this.svg.append('g')
        .attr('transform', 'translate('+ 0 +', ' + this.defaults.rowHeight * (this.chartData.length + 2) + ')')
        .append('text')
          .attr('class', 'year-total')
          .text(this.monitoringData.values[0].year + '-' + this.monitoringData.values[1].year)
          .attr('dx', function() {
            return ((yearLabel.width * this.cWidthGrid) / 100);
          }.bind(this))
          .attr('dy', function() {
            return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
          }.bind(this));
    },

    _drawTotalLoss: function() {
      var lossGroup = this.svg.select('.loss');
      var lossLabel = _.findWhere(this.defaults.labels, { slug: 'loss' });
      var lossLabelWidth = (lossLabel.width * this.cWidthGrid) / 100;

      this.svg.append('g')
        .attr('transform', 'translate('+
          (d3.transform(lossGroup.attr('transform')).translate[0] + lossLabelWidth) + ', ' +
          this.defaults.rowHeight * (this.chartData.length + 1) + ')')
        .append('text')
          .attr('class', 'value')
          .text(NumbersHelper.addNumberDecimals(this.referenceData.total))
          .attr('dx', function() {
            return (((lossLabel.width * this.cWidthGrid) / 100) / 2) -
            (((lossLabel.width * this.cWidthGrid) / 100) / 3);
          }.bind(this))
          .attr('dy', function() {
            return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
          }.bind(this));

      this.svg.append('g')
        .attr('transform', 'translate('+
          (d3.transform(lossGroup.attr('transform')).translate[0] + lossLabelWidth) + ', ' +
          this.defaults.rowHeight * (this.chartData.length + 2) + ')')
        .append('text')
          .attr('class', 'value')
          .text(NumbersHelper.addNumberDecimals(this.monitoringData.total))
          .attr('dx', function() {
            return (((lossLabel.width * this.cWidthGrid) / 100) / 2) -
            (((lossLabel.width * this.cWidthGrid) / 100) / 3);
          }.bind(this))
          .attr('dy', function() {
            return (this.defaults.rowHeight / 2) + this.defaults.barHeight;
          }.bind(this));
    },

    /**
     *  Renders the chart after a resize
     */
    _update: function() {
      this.remove({
        keepEvents: true
      });
      this.render();
    },

    /**
     * Removes the SVG
     */
    remove: function(params) {
      if(this.svg) {
        var svgContainer = this.chartEl.querySelector('svg');

        if (params && !params.keepEvents) {
          this.unsetListeners();
          this.stopListening();
        }
        this.svg.remove();
        this.svg = null;
        this.chartEl.removeChild(svgContainer);
      }
    }

  });

  return SummaryChart;

});
