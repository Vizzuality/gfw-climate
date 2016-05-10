define([
  'backbone',
  'd3'

], function(Backbone, d3) {

  'use strict';

  var GladAlertsVis = Backbone.View.extend({

    el: '#vis-glad',

    defaults: {
      chartClass: 'chart-pantropical-glad',
      interpolate: 'linear',
      paddingAxisLabels: 10,
      margin: {
        top: 75,
        right: 40,
        bottom: 65,
        left: 70
      },
      handleWidth: 1
    },

    initialize: function() {
      // Data parsing and initialization
      this._getData();
    },

    /**
     *  Sets the listeners for the component
     */
    setListeners: function() {
      this.refreshEvent = _.debounce(_.bind(this._update, this), 30);
      window.addEventListener('resize', this.refreshEvent, false);
    },

    unsetListeners: function() {
      window.removeEventListener('resize', this.refreshEvent, false);
    },

    _getData: function() {
      d3.csv('/data_glad.csv', function(data){
        this._parseData(data);
        this._start();
      }.bind(this));
    },

    _start: function() {
      if (this.chartData.length) {
        // Render the component on initialize
        this.render();

        // Sets listeners
        this.setListeners();
      } else {
        this._renderNoData();
      }
    },

    /**
     *  Parses the data for the chart
     */
    _parseData: function(data) {
      this.chartData = data;

      this.dotsData = _.filter(this.chartData, function(d){
        return d.alerts;
      });

      this.solidLineData = _.filter(this.chartData, function(d){
        return d.cumulative_emissions;
      });
    },

    render: function() {
      this._setUpGraph();
      this._setAxisScale();
      this._setDomain();
      this._drawGraph();
      this._drawAxis();
    },

    _renderNoData: function() {
      this.$el.html(this.template({}));
    },

    /**
     *  Renders the chart after a resize
     */
    _update: function() {
      this.remove();
      this.render();
      this.setListeners();
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

      this.svg = d3.select(el).append('svg')
        .attr('width', this.cWidth + margin.left + margin.right + 'px')
        .attr('height', this.cHeight + margin.top + margin.bottom + 'px')
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    },

    /**
     *  Sets the axis
     */
    _setAxisScale: function() {
      var _this = this;
      this.x = d3.scale.linear()
        .range([0, this.cWidth]).nice();

      this.y = d3.scale.linear()
        .range([this.cHeight, 0]).nice();

      this.y2 = d3.scale.linear()
        .range([this.cHeight, 0]).nice();

      this.r = d3.scale.linear()
        .range([6, 15]);

      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .innerTickSize(6)
        .ticks(15)
        .outerTickSize(0);

      this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .innerTickSize(0)
        .outerTickSize(0)
        .tickPadding(1);
    },

    /**
     *  Get the domain values
     */
    _getDomain: function() {
      var xValues = [];
      var yValues = [];
      var rValues = [];

      this.chartData.forEach(function(d) {
        xValues.push(d.week);
        yValues.push(d.alerts);
        rValues.push(d.alerts);
      });

      return {
        // x: d3.extent(xValues, function(d) { return d; }),
        // x: [0, 52],
        x: [1, 15],
        y: d3.extent(yValues, function(d) { return d; }),
        y2: [-3, 47],
        r: d3.extent(yValues, function(d) { return d; })
      };
    },

    /**
     *  Sets the domain
     */
    _setDomain: function() {
      this.x.domain(this.domain.x);
      this.y.domain(this.domain.y);
      this.y2.domain(this.domain.y2);
      this.r.domain(this.domain.r);
    },

    /**
     *  Draws the axis
     */
    _drawAxis: function() {
      var _this = this;

      // X Axis
      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (this.cHeight) + ')')
        .call(this.xAxis);;

      // Y Axis
      this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+ (-_this.defaults.paddingAxisLabels) + ','+ -_this.defaults.paddingAxisLabels + ')')
        .call(this.yAxis)
        .selectAll('text')
          .attr('x', -_this.defaults.paddingAxisLabels);

      // Custom domain
      this.svg.append('g')
        .attr('class', 'custom-domain-group')
        .attr('transform', 'translate(0, ' + this.cHeight +')')
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
      this._drawDashedLine();
      this._drawSolidLine();
      this._drawDots();
      this._drawBrush();
    },

    /**
     * Draws the dots
     */
    _drawDots: function() {
      var _this = this;
      var dotsGroup = this.svg.append('g')
        .attr('class', 'dots-group')
        .attr('transform', 'translate( 0,'+ -this.defaults.paddingAxisLabels + ')');

      dotsGroup.selectAll('.dot')
        .data(this.dotsData)
        .enter().append('circle')
          .attr('class', 'dot')
          .attr('r', function(d) {
            return _this.r(d.alerts)
          })
          .attr('cx', function(d) {
            return _this.x(d.week)
          })
          .attr('cy', function(d) {
            return _this.y(d.alerts)
          });
    },

    /**
     * Draws the dashed line
     */
    _drawDashedLine: function() {
      var _this = this;
      var dashedLine = this.svg.append('g')
        .attr('class', 'line-dashed-group')
        .attr('transform', 'translate( 0,'+ -this.defaults.paddingAxisLabels + ')');

      var line = d3.svg.line()
        .x(function(d) { return _this.x(d.week); })
        .y(function(d) { return _this.y2(d.target_emissions); })
        .interpolate(this.defaults.interpolate);

      dashedLine.append('path')
        .attr('d', line(this.chartData))
        .attr('class', 'dash-line-path');
    },

    /**
     * Draws the solid line
     */
    _drawSolidLine: function() {
      var _this = this;
      var solidLine = this.svg.append('g')
        .attr('class', 'line-solid-group')
        .attr('transform', 'translate( 0,'+ -this.defaults.paddingAxisLabels + ')');

      var line = d3.svg.line()
        .x(function(d) { return _this.x(d.week); })
        .y(function(d) { return _this.y2(d.cumulative_emissions); })
        .interpolate(this.defaults.interpolate);

      solidLine.append('path')
        .attr('d', line(this.solidLineData))
        .attr('class', 'line-solid-path');
    },

    /**
     * Sets up the brush feature
     * of the graph
     */
    _drawBrush: function() {
      var self = this;
      var domain = self._getDomain();
      var xDomain = domain.x;

      this.brush = d3.svg.brush()
        .x(this.x)
        .extent([0, 0])
        .on('brush', function() {
          if (d3.event.sourceEvent) {
            d3.event.sourceEvent.stopPropagation();
          }

          var value =  Math.round(self.brush.extent()[0]);

          if (d3.event.sourceEvent) {
            value = self.x.invert(d3.mouse(this)[0]);
            self.brush.extent([value, value]);
          }

          if (value < xDomain[0]) {
            value = xDomain[0];
          }

          if (value > xDomain[1]) {
            value = xDomain[1];
          }

          self.currentStep = value;
          self._setHandlePosition();
        })
        .on('brushend', function() {
          if (!d3.event.sourceEvent) return;
          var extent0 = self.brush.extent(),
              extent1 = extent0;
          var current = Math.round(extent1[0]);

          if (extent1 < xDomain[0]) {
            current = xDomain[0];
          }

          if (extent1 > xDomain[1]) {
            current = xDomain[1];
          }

          self.currentStep = current;

          d3.select(this).transition()
            .duration(0)
            .call(self.brush.extent(extent1))
            .call(self.brush.event);
        });

      this.slider = this.svg.append('g')
        .attr('class', 'handles')
        .call(this.brush);

      this.slider.selectAll('.extent,.resize')
        .remove();

      this.slider.select('.background')
        .attr('height', this.cHeight + this.defaults.margin.bottom);

      this.handle = this.slider.append('rect')
        .attr('class', 'handle')
        .attr('width', this.defaults.handleWidth)
        .attr('height', this.cHeight + (this.defaults.margin.top / 2));

      this._setHandlePosition();
    },

    /**
     * Set the handle position with the
     * current step of the brush
     */
    _setHandlePosition: function() {
      var self = this;

      if (!this.currentStep) {
        this.currentStep = 1;
      }

      this.handle.attr('transform', function() {
        return 'translate('+ (self.x(self.currentStep) -
          (self.defaults.handleWidth / 2)) + ', ' + -((self.defaults.margin.top / 2)) + ')';
      });
    },

    /**
     *  Removes the SVG
     */
    remove: function() {
      if(this.svg) {
        var svgContainer = this.el.querySelector('svg');

        this.svg.remove();
        this.svg = null;
        this.el.removeChild(svgContainer);
        this.unsetListeners();
      }
    },

  });

  return GladAlertsVis;

});
