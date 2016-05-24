define([
  'backbone',
  'underscore',
  'd3',
  'moment'
], function(Backbone, _, d3, moment) {

  'use strict';

  var GladAlertsVis = Backbone.View.extend({

    el: '#vis-glad',

    defaults: {
      chartClass: 'chart-glad',
      interpolate: 'linear',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 20,
      paddingYAxisLabels: 30,
      dateFormat: '%b',
      margin: {
        top: 35,
        right: 75,
        bottom: 65,
        left: 60
      },
      circleRadiusRange: [6, 18],
      filter: 'carbon_emissions',
      chartConfig: {
        'carbon_emissions': {
          domain: {
            x: 'date',
            x2: 'week',
            y: [
              'cumulative_emissions',
              'emissions_target'
            ],
            y2: 'alerts',
            r: 'alerts'
          },
          dataColumns: {
            dots: {
              x: 'week',
              y: 'alerts',
              r: 'alerts'
            },
            line: {
              x: 'week',
              y: 'cumulative_emissions'
            },
            dashed: {
              x: 'week',
              y: 'emissions_target'
            }
          }
        },
        'deforestation': {
          domain: {
            x: 'date',
            x2: 'week',
            y: [
              'cumulative_deforestation',
              'deforestation_target'
            ],
            y2: 'alerts',
            r: 'alerts'
          },
          dataColumns: {
            dots: {
              x: 'week',
              y: 'alerts',
              r: 'alerts'
            },
            line: {
              x: 'week',
              y: 'cumulative_deforestation'
            },
            dashed: {
              x: 'week',
              y: 'deforestation_target'
            }
          }
        }
      },
      handleWidth: 1,
      timelineButtonRadius: 15
    },

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings.params);
      this.compact = this.defaults.compact || false;
      this.data = this.defaults.data;
      this.filter = this.defaults.filter;
      this.currentStep = 1;

      this._initChart();

      // Sets listeners
      this.setListeners();
    },

    /**
     * Sets the listeners for the component
     */
    setListeners: function() {
      this.refreshEvent = _.debounce(_.bind(this._update, this), 30);
      window.addEventListener('resize', this.refreshEvent, false);

      Backbone.Events.on('insights:glad:update', this._changeStepByValue.bind(this));
      Backbone.Events.on('insights:glad:updateByTimeline', this._changeStep.bind(this));
      Backbone.Events.on('insights:glad:setStep', this._setStep.bind(this));
    },

    unsetListeners: function() {
      window.removeEventListener('resize', this.refreshEvent, false);

      Backbone.Events.off('insights:glad:update', this._changeStepByValue.bind(this));
      Backbone.Events.off('insigh¡ts:glad:updateByTimeline', this._changeStep.bind(this));
    },

    _initChart: function() {
      // Data parsing and initialization
      this._parseData(this.data);
      this._start();
    },

    _start: function() {
      if (this.chartData.length) {
        // Render the component on initialize
        this.render();
      } else {
        this._renderNoData();
      }
    },

    /**
     *  Parses the data for the chart
     */
    _parseData: function(data) {
      this.chartData = data;
      this.dataColumns = this.defaults.chartConfig[this.filter].dataColumns;
      this.dataDomain = this.defaults.chartConfig[this.filter].domain;

      this.chartData.forEach(function(d) {
        d.date = moment().week(d.week).toDate();
      });

      this.dotsData = _.filter(this.chartData, function(d){
        return d[this.dataColumns.dots.r];
      }.bind(this));

      this.solidLineData = _.filter(this.chartData, function(d){
        return d[this.dataColumns.dots.y];
      }.bind(this));
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
      // this.setListeners();
    },

    /**
     *  Sets up the SVG for the graph
     */
    _setUpGraph: function() {
      var el = this.el;
      var margin = this.defaults.margin;

      this.el.innerHTML = '';
      this.el.classList.add(this.defaults.chartClass, this.filter);

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
      var xTickFormat = d3.time.format(_this.defaults.dateFormat);
      var yTickFormat = function(d) {
        return d > 999 ? (d / 1000).toFixed(1) + 'k' : d;
      };
      var yNumTicks = !this.compact ? 8 : 4;

      if (this.compact) {
        xTickFormat = '';
      }

      this.x = d3.time.scale()
        .range([0, this.cWidth]);

      this.x2 = d3.scale.linear()
        .range([0, this.cWidth]).nice();

      this.y = d3.scale.linear()
        .range([this.cHeight, 0]).nice();

      this.y2 = d3.scale.linear()
        .range([this.cHeight, 0]).nice();

      this.r = d3.scale.linear()
        .range(this.defaults.circleRadiusRange);

      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .innerTickSize(6)
        .tickValues(this.months)
        .outerTickSize(0)
        .tickFormat(xTickFormat);

      this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .innerTickSize(0)
        .outerTickSize(0)
        .ticks(yNumTicks)
        .tickFormat(yTickFormat);

      this.y2Axis = d3.svg.axis()
        .scale(this.y2)
        .orient('right')
        .innerTickSize(-this.cWidth)
        .outerTickSize(0)
        .ticks(yNumTicks)
        .tickFormat(yTickFormat);
    },

    /**
     *  Get the domain values
     */
    _getDomain: function() {
      var _this = this;
      var xValues = [];
      var x2Values = [];
      var yValues = [];
      var y2Values = [];
      var rValues = [];

      this.chartData.forEach(function(d) {
        xValues.push((d[_this.dataDomain.x] * 1));
        x2Values.push((d[_this.dataDomain.x2] * 1));
        y2Values.push((d[_this.dataDomain.y2] * 1));
        rValues.push((d[_this.dataDomain.r] * 1));
      });

      // Support for multiple columns for one axis
      _.each(_this.dataDomain.y, function(y) {
        var rawData = _.pluck(_this.chartData, y);
        _.each(rawData, function(d) {
          if (d && d !== '') {
            yValues.push((d * 1));
          }
        });
      });

      return {
        x: d3.extent(xValues, function(d) { return d; }),
        x2: d3.extent(x2Values, function(d) { return d; }),
        y: d3.extent(yValues, function(d) { return d; }),
        y2: d3.extent(y2Values, function(d) { return d; }),
        r: d3.extent(rValues, function(d) { return d; })
      };
    },

    /**
     * Sets the domain
     */
    _setDomain: function() {
      this.x.domain(this.domain.x);
      this.x2.domain(this.domain.x2);
      this.y.domain(this.domain.y);
      this.y2.domain(this.domain.y2);
      this.r.domain(this.domain.r);

      // Add extra padding to Y domain
      var numTicks = !this.compact ? 10 : 7;
      this.y.domain([this.domain.y[0], d3.max(this.y.ticks(numTicks)) + this.y.ticks(numTicks)[2]]);
      this.y2.domain([this.domain.y2[0], d3.max(this.y2.ticks(numTicks)) + this.y2.ticks(numTicks)[2]]);
    },

    /**
     * Draws the axis
     */
    _drawAxis: function() {
      var _this = this;

      // X Axis
      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (this.cHeight) + ')')
        .call(this.xAxis)
        .selectAll('text')
          .attr('x', _this.defaults.paddingXAxisLabels)
          .attr('y', _this.defaults.paddingYAxisLabels);

      // Y Axis
      this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+ (-_this.defaults.paddingAxisLabels) + ','+ -_this.defaults.paddingAxisLabels + ')')
        .call(this.yAxis)
        .selectAll('text')
          .attr('x', -_this.defaults.paddingAxisLabels);

      // Y2 Axis
      this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+ (_this.cWidth + (_this.defaults.margin.right / 2)) + ','+ -_this.defaults.paddingAxisLabels + ')')
        .call(this.y2Axis)
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
            return _this.r(d[_this.dataColumns.dots.r])
          })
          .attr('cx', function(d) {
            return _this.x2(d[_this.dataColumns.dots.x])
          })
          .attr('cy', function(d) {
            return _this.y2(d[_this.dataColumns.dots.y])
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
        .x(function(d) { return _this.x2(d[_this.dataColumns.dashed.x]); })
        .y(function(d) { return _this.y(d[_this.dataColumns.dashed.y]); })
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
        .x(function(d) { return _this.x2(d[_this.dataColumns.line.x]); })
        .y(function(d) { return _this.y(d[_this.dataColumns.line.y]); })
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
      var _this = this;
      var domain = _this._getDomain();
      var xDomain = domain.x2;

      this.brush = d3.svg.brush()
        .x(this.x2)
        .extent([0, 0])
        .on('brush', function() {
          if (d3.event.sourceEvent) {
            d3.event.sourceEvent.stopPropagation();
          }

          var value =  Math.round(_this.brush.extent()[0]);

          if (d3.event.sourceEvent) {
            value = _this.x2.invert(d3.mouse(this)[0]);
            _this.brush.extent([value, value]);
          }

          if (value < xDomain[0]) {
            value = xDomain[0];
          }

          if (value > xDomain[1]) {
            value = xDomain[1];
          }

          _this.currentStep = value;
          _this._setHandlePosition();
          Backbone.Events.trigger('insights:glad:update', Math.round(_this.currentStep));

        })
        .on('brushend', function() {
          if (!d3.event.sourceEvent) return;
          var extent0 = _this.brush.extent(),
              extent1 = extent0;
          var current = Math.round(extent1[0]);

          if (extent1 < xDomain[0]) {
            current = xDomain[0];
          }

          if (extent1 > xDomain[1]) {
            current = xDomain[1];
          }

          _this.currentStep = current;

          d3.select(this).transition()
            .duration(0)
            .call(_this.brush.extent(extent1))
            .call(_this.brush.event);
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

      this.handleLabel = this.slider.append('text')
        .attr('class', 'handle-label');

      this._setHandlePosition();
    },

    /**
     * Set the handle position with the
     * current step of the brush
     */
    _setHandlePosition: function() {
      var _this = this;

      this.handle.attr('transform', function() {
        return 'translate('+ (_this.x2(_this.currentStep) -
          (_this.defaults.handleWidth / 2)) + ', ' + -((_this.defaults.margin.top / 2)) + ')';
      });

      this.handleLabel.attr('transform', function() {
        return 'translate('+ (_this.x2(_this.currentStep) -
          (_this.defaults.handleWidth / 2)) + ', ' + (_this.cHeight + (_this.defaults.paddingXAxisLabels / 1.4)) + ')';
      });

      if (!this.compact) {
        this.handleLabel.text('Week ' + Math.round(this.currentStep));
      }
      this._updateDots();
    },

    _updateDots: function() {
      var _this = this;

      this.svg.selectAll('.dot')
        .style('fill-opacity', function(d) {
          if ((d.week * 1) > _this.currentStep) {
            return 0;
          } else {
            return 1;
          }
        })
        .style('transform', function(d) {
          if ((d.week * 1) > _this.currentStep) {
            return 'scale(0)';
          } else {
            return 'scale(1)';
          }
        });
    },

    _changeStep: function() {
      var domain = this._getDomain();
      var x2Domain = domain.x2;
      var current = this.currentStep;

      current++;

      // if (current > x2Domain[1]) {
      if (current > 18) {
        // this.currentStep = 1;
        this._setHandlePosition();
        Backbone.Events.trigger('insights:glad:stopTimeline');
      } else {
        this.currentStep = current;
        this._setHandlePosition();
      }
      Backbone.Events.trigger('insights:glad:currentStep', Math.round(this.currentStep));
    },

    _changeStepByValue: function(step) {
      this.currentStep = step;
      this._setHandlePosition();
    },

    updateByFilter: function(filter) {
      this.remove();

      this.filter = filter;
      this._initChart();
    },

    _setStep: function(step) {
      this.currentStep = step;
    },

    /**
     * Removes the SVG
     */
    remove: function() {
      if(this.svg) {
        var svgContainer = this.el.querySelector('svg');

        this.svg.remove();
        this.svg = null;
        this.currentStep = 1;
        this.el.classList.remove(this.filter);
        this.el.removeChild(svgContainer);
        // this.unsetListeners();
      }
    },

  });

  return GladAlertsVis;

});
