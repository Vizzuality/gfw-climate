define([
  'backbone',
  'underscore',
  'd3'
], function(
  Backbone,
  _,
  d3
) {

  'use strict';

  var SummaryChart = Backbone.View.extend({

    el: '#summary-chart',

    defaults: {
      chartClass: 'js-summary-chart',
      interpolate: 'linear',
      dateFormat: '%Y',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 20,
      paddingYAxisLabels: 10,
      circleRadius: 5,
      margin: {
        top: 50,
        right: 55,
        bottom: 35,
        left: 55
      }
    },

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings);

      this._initChart();

      // Sets listeners
      this.setListeners();
    },

    _initChart: function() {
      // Data parsing and initialization
      this._parseData(this.data);

      this._start();
    },

    _start: function() {
      // if (this.chartData.length) {
        // Render the component on initialize
        this.render();
      // } else {
      //   this._renderNoData();
      // }
    },

    render: function() {
      this._setUpGraph();
      this._setAxisScale();
      this._setDomain();
      this._drawAxis();
      this._drawGraph();
     },

    _renderNoData: function() {
      this.$el.html(this.template({}));
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
    _parseData: function(data) {
      var dates = [];
      this.dotsData = [];
      this.chartData = [
        [
          {
            year: '2002',
            value: 140000
          },
          {
            year: '2003',
            value: 130000
          },
          {
            year: '2004',
            value: 120000
          },
          {
            year: '2005',
            value: 125000
          },
          {
            year: '2006',
            value: 110000
          },
          {
            year: '2007',
            value: 125000
          },
          {
            year: '2008',
            value: 130000
          },
          {
            year: '2009',
            value: 140000
          },
          {
            year: '2010',
            value: 145000
          }
        ],
        [
          {
            year: '2010',
            value: 145000
          },
          {
            year: '2011',
            value: 130000
          },
          {
            year: '2012',
            value: 120000
          },
          {
            year: '2013',
            value: 150000
          },
          {
            year: '2014',
            value: 160000
          }
        ]
      ];

      this.chartData.forEach(function(data) {
        data.forEach(function(current) {
          current.year = new Date(current.year);
          dates.push(current.year);
        });
        this.dotsData.push(data);
      }.bind(this));

      this.referenceData = this.chartData[0];
      this.monitoringData = this.chartData[1];
      this.dates = dates;
    },

    /**
     *  Sets up the SVG for the graph
     */
    _setUpGraph: function() {
      var el = this.el;
      var margin = this.defaults.margin;

      this.el.innerHTML = '';
      this.el.classList.add(this.defaults.chartClass);

      this.cWidth = el.clientWidth;
      this.cHeight = el.clientHeight;
      this.domain = this._getDomain();

      this.cWidth = this.cWidth - margin.left - margin.right;
      this.cHeight = this.cHeight - margin.top - margin.bottom;

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
      var _this = this;
      var xTickFormat = d3.time.format(_this.defaults.dateFormat);
      var yTickFormat = function(d) {
        return d > 999 ? (d / 1000) + 'k' : d;
      };
      var yNumTicks = 4;

      this.x = d3.time.scale()
        .range([0, this.cWidth]).nice();

      this.y = d3.scale.linear()
        .range([this.cHeight, 0]).nice();

      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .innerTickSize(-this.cHeight)
        .tickValues(this.dates)
        .outerTickSize(0)
        .tickPadding(10)
        .tickFormat(xTickFormat);

      this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .innerTickSize(0)
        .outerTickSize(0)
        .ticks(yNumTicks)
        .tickFormat(yTickFormat);
    },

    /**
     * Sets the domain
     */
    _setDomain: function() {
      this.x.domain(this.domain.x);
      this.y.domain(this.domain.y);

      // Add extra padding to Y domain
      // var numTicks = 12;
      // this.y.domain([this.domain.y[0], d3.max(this.y.ticks(numTicks)) + this.y.ticks(numTicks)[1]]);
    },

    /**
     *  Get the domain values
     */
    _getDomain: function() {
      var xValues = [];
      var yValues = [];

      this.chartData.forEach(function(data) {
        data.forEach(function(current) {
          xValues.push(current.year);
          yValues.push(current.value);
        });
      });

      return {
        x: d3.extent(xValues, function(d) { return d; }),
        y: d3.extent(yValues, function(d) { return d; })
      };
    },

    /**
     * Draws the axis
     */
    _drawAxis: function() {
      var _this = this;

      // X Axis
      var xAxis = this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (this.cHeight) + ')')
        .call(this.xAxis);

        xAxis.selectAll('text')
          .attr('x', _this.defaults.paddingXAxisLabels)
          .style('text-anchor', 'middle')
          .attr('y', _this.defaults.paddingYAxisLabels);

        xAxis.selectAll('line')
          .attr('x1', _this.defaults.paddingXAxisLabels)
          .attr('x2', _this.defaults.paddingXAxisLabels);


      // Y Axis
      var yAxis = this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+ (-_this.defaults.paddingAxisLabels) +
          ','+ -_this.defaults.paddingAxisLabels + ')');

      yAxis.append('g')
        .call(this.yAxis)
        .selectAll('text')
          .attr('x', 0);

      // Custom domain
      this.svg.append('g')
        .attr('class', 'custom-domain-group')
        .attr('transform', 'translate('+ _this.defaults.paddingXAxisLabels +', ' + this.cHeight +')')
        .append('line')
          .attr('class', 'curstom-domain')
          .attr('x1', -_this.defaults.paddingAxisLabels)
          .attr('x2', (this.cWidth  + _this.defaults.paddingAxisLabels))
          .attr('y1', 0)
          .attr('y2', 0);
    },

    /**
     * Draws the entire graph
     */
    _drawGraph: function() {
      this._drawSolidLine();
      this._drawDots();
    },

    /**
     * Draws the solid line
     */
    _drawSolidLine: function() {
      var _this = this;
      var solidLineGroup = this.svg.append('g')
        .attr('class', 'line-group')
        .attr('transform', 'translate('+ _this.defaults.paddingXAxisLabels +' ,'+ -this.defaults.paddingAxisLabels + ')');

      this.linePath = d3.svg.line()
        .x(function(d) { return _this.x(d.year); })
        .y(function(d) { return _this.y(d.value); })
        .interpolate(this.defaults.interpolate);

      this.graphLine = solidLineGroup.append('path')
        .attr('d', this.linePath(this.referenceData))
        .attr('class', 'line-reference');

      this.graphLine = solidLineGroup.append('path')
        .attr('d', this.linePath(this.monitoringData))
        .attr('class', 'line-monitoring');
    },

    /**
     * Draws the dots
     */
    _drawDots: function() {
      var _this = this;
      var dotsGroup = this.svg.append('g')
        .attr('class', 'dots-group')
        .attr('transform', 'translate('+ _this.defaults.paddingXAxisLabels +', '+ -this.defaults.paddingAxisLabels + ')');

      dotsGroup.selectAll('.dot.monitoring')
        .data(this.dotsData[1])
        .enter().append('circle')
          .attr('class', 'dot monitoring')
          .attr('r', _this.defaults.circleRadius)
          .attr('cx', function(d) {
            return _this.x(d.year)
          })
          .attr('cy', function(d) {
            return _this.y(d.value)
          });

      dotsGroup.selectAll('.dot.reference')
        .data(this.dotsData[0])
        .enter().append('circle')
          .attr('class', 'dot reference')
          .attr('r', _this.defaults.circleRadius)
          .attr('cx', function(d) {
            return _this.x(d.year)
          })
          .attr('cy', function(d) {
            return _this.y(d.value)
          });
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
        var svgContainer = this.el.querySelector('svg');

        if (params && !params.keepEvents) {
          this.unsetListeners();
          this.stopListening();
        }
        this.svg.remove();
        this.svg = null;
        this.el.removeChild(svgContainer);
      }
    }

  });

  return SummaryChart;

});
