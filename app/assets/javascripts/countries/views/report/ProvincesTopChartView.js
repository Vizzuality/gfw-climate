define([
  'backbone',
  'underscore',
  'd3',
  'helpers/NumbersHelper',
  'text!countries/templates/report/provinces-top-chart.handlebars'
], function(
  Backbone,
  _,
  d3,
  NumbersHelper,
  tpl
) {

  'use strict';

  var ProvincesTopChart = Backbone.View.extend({

    el: '#provinces-top-chart',

    template: Handlebars.compile(tpl),

    defaults: {
      chartEl: 'provinces-top-chart-svg',
      chartClass: 'js-provinces-top-chart',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 10,
      paddingYAxisLabels: 10,
      margin: {
        top: 10,
        right: 0,
        bottom: 35,
        left: 0
      },
      rowHeight: 26,
      barHeight: 5,
      barMargin: 10,
      defaultZeroValue: 5,
      yAxisWidth: 30,
      labels: [
        {
          name: 'Province',
          footerName: '',
          slug: 'province',
          width: 20
        },
        {
          name: '',
          footerName: '',
          slug: 'average',
          width: 60
        },
        {
          name: 'ha/yr',
          footerName: '',
          slug: 'loss',
          width: 10
        },
        {
          name: 'Change',
          footerName: '',
          slug: 'deviation',
          width: 10
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
      this.$el.html(this.template({
        hasData: this.chartData.length
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
      this.chartData = this.data;
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
      this.cHeight = (this.chartData.length + 1) * (this.defaults.rowHeight * 2);
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

      this.x2 = d3.scale.linear()
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
      this.x2.domain(this.domain.x2);
      this.y.domain(this.domain.y);
    },

    /**
     *  Get the domain values
     */
    _getDomain: function() {
      var maxValues = [];
      maxValues.push({value: d3.max(this.chartData, function(d) { return d.avg; })});
      maxValues.push({value: d3.max(this.chartData, function(d) { return d.monitoring_avg; })});

      return {
        x: [0, d3.max(maxValues, function(d) { return d.value; })],
        x2: [0, d3.max(this.chartData, function(d) { return d.monitoring_avg; })],
        y: [0, this.chartData.length]
      };
    },

    /**
     * Draws the entire graph
     */
    _drawGraph: function() {
      this._drawProvinces();
      this._drawLoss();
      this._drawDeviation();
      this._drawBars();
    },

    _drawGrid: function() {
      // X Lines
      var numLines = this.chartData.length;
      var rowOffset = this.defaults.rowHeight;
      var linesGroup = this.svg.append('g')
        .attr('transform', 'translate(0, '+ this.defaults.rowHeight +')');

      for (var x = 0; x < numLines; x++) {
        linesGroup.append('rect')
          .attr('class', 'xAxis')
          .attr('width', this.cWidth)
          .attr('height', 1)
          .attr('x', 0)
          .attr('y', rowOffset * 2);

        rowOffset += this.defaults.rowHeight;
      }

      // Labels
      var marginOffset = 0;
      this.defaults.labels.forEach(function(label, index) {
        var margin = (label.width * this.cWidthGrid) / 100;
        var group = this.svg.append('g')
          .attr('transform', 'translate(' + marginOffset + ', 0)')
          .attr('class', label.slug);

        if (index === 0) {
          group.append('text')
            .attr('class', 'label')
            .attr('y', this.defaults.rowHeight / 2)
            .attr('x', 0)
            .style('text-anchor', 'start')
            .text(label.name);
        } else {
          group.append('text')
            .attr('class', 'label')
            .attr('y', this.defaults.rowHeight / 2)
            .attr('x', margin - this.defaults.paddingXAxisLabels)
            .text(label.name);
        }
        marginOffset += margin;
      }.bind(this));

      // Y Line
      var averageGroup = this.svg.select('.average');
      linesGroup.append('rect')
        .attr('class', 'yAxis')
        .attr('width', 3)
        .attr('height', this.chartData.length * (this.defaults.rowHeight * 2))
        .attr('x', d3.transform(averageGroup.attr('transform')).translate[0])
        .attr('y', 0);
    },

    _drawProvinces: function() {
      var provinceGroup = this.svg.select('.province');
      var provinceLabel = _.findWhere(this.defaults.labels, { slug: 'province' });
      var provinceLabelWidth = (provinceLabel.width * this.cWidthGrid) / 100;
      var provincesContent = this.svg.append('g')
        .attr('transform', 'translate('+
          (d3.transform(provinceGroup.attr('transform')).translate[0]) + ', ' +
          this.defaults.rowHeight + ')');

      var provincesGroup = provincesContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + ((this.defaults.rowHeight * 2) * i) + ')';
        }.bind(this));

      provincesGroup.append('text')
        .attr('class', 'province')
        .text(function(d) {
          return d.province;
        })
        .attr('dx', 0)
        .attr('dy', function() {
          return ((this.defaults.rowHeight * 2) / 2) + this.defaults.barHeight;
        }.bind(this));
    },

    _drawLoss: function() {
      var lossGroup = this.svg.select('.loss');
      var lossLabel = _.findWhere(this.defaults.labels, { slug: 'loss' });
      var lossLabelWidth = (lossLabel.width * this.cWidthGrid) / 100;
      var lossContent = this.svg.append('g')
        .attr('transform', 'translate('+
          (d3.transform(lossGroup.attr('transform')).translate[0]) + ', ' +
          this.defaults.rowHeight + ')');

      var lossGroup = lossContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + ((this.defaults.rowHeight * 2) * i) + ')';
        }.bind(this));

      lossGroup.append('text')
        .attr('class', 'value')
        .text(function(d) {
          return NumbersHelper.addNumberDecimals(Math.round(d.avg));
        })
        .attr('dx', function() {
          return lossLabelWidth - this.defaults.paddingXAxisLabels
        }.bind(this))
        .attr('dy', function() {
          return (this.defaults.rowHeight / 2) + this.defaults.barHeight + (this.defaults.barHeight / 2);
        }.bind(this));

      lossGroup.append('text')
        .attr('class', 'value')
        .text(function(d) {
          return NumbersHelper.addNumberDecimals(Math.round(d.monitoring_avg));
        })
        .attr('dx', function() {
          return lossLabelWidth - this.defaults.paddingXAxisLabels
        }.bind(this))
        .attr('dy', function() {
          return (this.defaults.rowHeight / 2) + (this.defaults.barHeight * 5);
        }.bind(this));
    },

    _drawDeviation: function() {
      var deviationGroup = this.svg.select('.deviation');
      var deviationLabel = _.findWhere(this.defaults.labels, { slug: 'deviation' });
      var deviationLabelWidth = (deviationLabel.width * this.cWidthGrid) / 100;
      var deviationContent = this.svg.append('g')
        .attr('transform', 'translate('+
          d3.transform(deviationGroup.attr('transform')).translate[0] + ', ' +
          (this.defaults.rowHeight) + ')');

      var deviationGroup = deviationContent.selectAll('g')
        .data(this.chartData)
        .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + ((this.defaults.rowHeight * 2) * i) + ')';
        }.bind(this));

      deviationGroup.append('text')
        .attr('class', 'value')
        .text(function(d) {
          var value = Math.round(d.delta_perc);
          var displayValue = value;

          if (value > 0) {
            displayValue = '+' + value;
          }
          return displayValue + '%';
        })
        .attr('dx', function() {
          return deviationLabelWidth - this.defaults.paddingXAxisLabels
        }.bind(this))
        .attr('dy', function() {
          return (this.defaults.rowHeight / 2) + (this.defaults.barHeight * 5);
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
          return 'translate(0, ' + ((this.defaults.rowHeight * 2) * i) + ')';
        }.bind(this));

      barGroup.append('rect')
        .attr('class', 'bar reference')
        .attr('height', this.defaults.barHeight)
        .attr('width', function(d) {
          return this.x(d.avg);
        }.bind(this))
        .attr('y', function() {
          return (this.defaults.rowHeight / 2) + (this.defaults.barHeight / 2);
        }.bind(this));

      barGroup.append('rect')
        .attr('class', 'bar monitor')
        .attr('height', this.defaults.barHeight)
        .attr('width', function(d) {
          return this.x(d.monitoring_avg);
        }.bind(this))
        .attr('y', function() {
          return (this.defaults.rowHeight / 2) + (this.defaults.barHeight / 2) + (this.defaults.barHeight * 2) ;
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

  return ProvincesTopChart;

});
