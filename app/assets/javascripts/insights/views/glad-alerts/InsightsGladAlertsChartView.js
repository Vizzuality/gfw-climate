define([
  'backbone',
  'handlebars',
  'underscore',
  'd3',
  'moment',
  'helpers/NumbersHelper',
  'text!insights/templates/glad-alerts/insights-glad-alerts-tooltip.handlebars',
], function(Backbone, Handlebars, _, d3, moment, NumbersHelper, tplTooltip) {

  'use strict';

  var WEEKS_YEAR = 53;

  var GladAlertsVis = Backbone.View.extend({

    el: '#vis-glad',

    templateTooltip: Handlebars.compile(tplTooltip),

    defaults: {
      chartClass: 'chart-glad',
      interpolate: 'linear',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 20,
      paddingYAxisLabels: 18,
      paddingLinesLabels: 6,
      tooltipPadding: 16,
      underscriptPadding: 1.5,
      dateFormat: '%b',
      underscript: '2',
      margin: {
        top: 50,
        right: 55,
        bottom: 35,
        left: 55
      },
      marginEmbed: {
        top: 50,
        right: 25,
        bottom: 35,
        left: 45
      },
      circleRadius: 6,
      triangleSize: 200,
      filter: 'carbon_emissions',
      chartConfig: {
        'carbon_emissions': {
          domain: {
            x: 'date',
            x2: 'week',
            y: [
              'cumulative_emissions',
              'carbon_average',
              'carbon_target'
            ],
            r: 'alerts'
          },
          dataColumns: {
            dots: {
              x: 'week',
              y: 'cumulative_emissions',
              r: 'alerts'
            },
            line: {
              x: 'week',
              y: 'cumulative_emissions'
            },
            dashed: {
              x: 'week',
              y: 'carbon_target'
            },
            semiDashed: {
              x: 'week',
              y: 'carbon_average'
            }
          }
        },
        'deforestation': {
          domain: {
            x: 'date',
            x2: 'week',
            y: [
              'cumulative_deforestation',
              'deforestation_average',
              'deforestation_target'
            ],
            r: 'alerts'
          },
          dataColumns: {
            dots: {
              x: 'week',
              y: 'cumulative_deforestation',
              r: 'alerts'
            },
            line: {
              x: 'week',
              y: 'cumulative_deforestation'
            },
            dashed: {
              x: 'week',
              y: 'deforestation_target'
            },
            semiDashed: {
              x: 'week',
              y: 'deforestation_average'
            }
          }
        }
      },
      units: {
        'carbon_emissions': 'Mt CO2/yr',
        'deforestation': 'ha/yr'
      },
      handleWidth: 1,
      timelineButtonRadius: 15,
      maxWidth: 600,
    },

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings.params);
      this.data = this.defaults.data;
      this.filter = this.defaults.filter;
      this.currentStep = this.defaults.currentStep;
      this.iso = this.defaults.iso;
      this.year = this.defaults.year;
      this.imageURI = this.defaults.imageURI;
      this.locations = this.defaults.locations;
      this.currentLocation = this.defaults.currentLocation;

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

      this.hoverEvent = this._onHoverOut.bind(this);
      this.$el.on('mouseleave', this.hoverEvent);
    },

    unsetListeners: function() {
      window.removeEventListener('resize', this.refreshEvent, false);

      this.$el.off('mouseleave', this.hoverEvent);

      this.refreshEvent = null;
      this.hoverEvent = null;
    },

    _initChart: function() {
      // Data parsing and initialization
      this._parseData(this.data);
      this._checkIsEmbed();
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
      var range = _.range(WEEKS_YEAR);
      this.chartData = data;
      this.dataColumns = this.defaults.chartConfig[this.filter].dataColumns;
      this.dataDomain = this.defaults.chartConfig[this.filter].domain;
      this.unit = this.defaults.units[this.filter];

      range.forEach(function(d) {
        var week = d + 1;
        var data = this.chartData[d];

        if (data) {
          data.date = moment().week(data.week).toDate();
        } else {
          var mainData = this.chartData[0];
          this.chartData.push({
            date: moment().week(week).toDate(),
            carbon_average: mainData.carbon_average,
            carbon_target: mainData.carbon_target,
            deforestation_average: mainData.deforestation_average,
            deforestation_target: mainData.deforestation_target,
            year: mainData.year,
            week: week.toString()
          });
        }
      }.bind(this));

      this.dotsData = _.filter(this.chartData, function(d) {
        var value = d[this.dataColumns.dots.r];
        return value && value > 0;
      }.bind(this));

      var maxDomainXData = this.dotsData[this.dotsData.length - 1];
      this.maxDomain = maxDomainXData[this.dataColumns.dots.x];

      this.solidLineData = _.filter(this.chartData, function(d){
        return d[this.dataColumns.dots.y];
      }.bind(this));
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
     *  Renders the chart after a resize
     */
    _update: function() {
      this.remove({
        keepEvents: true
      });
      this._checkIsEmbed();
      this.render();
    },

    _checkIsEmbed: function() {
      if (document.body.clientWidth <= this.defaults.maxWidth) {
        this.isEmbed = true;
      } else {
        this.isEmbed = false;
      }
    },

    /**
     *  Sets up the SVG for the graph
     */
    _setUpGraph: function() {
      var el = this.el;
      var margin = this.defaults.margin;
      var isDesforestation = this.filter === this.defaults.desforestationFilter;
      var label = 'Cumulative Emissions to Date (MtCO';

      if (isDesforestation) {
        label = 'Cumulative Area of Loss to Date (ha)';
      }

      if (this.isEmbed) {
        margin = this.defaults.marginEmbed;
      }

      this.el.innerHTML = '';
      this.el.classList.add(this.defaults.chartClass);
      this.el.classList.add(this.filter);

      this.cWidth = el.clientWidth;
      this.cHeight = el.clientHeight;
      this.domain = this._getDomain();
      this.cWidth = this.cWidth - margin.left - margin.right;
      this.cHeight = this.cHeight - margin.top - margin.bottom;

      var svg = d3.select(el).append('svg')
        .attr('width', this.cWidth + margin.left + margin.right + 'px')
        .attr('height', this.cHeight + margin.top + margin.bottom + 'px');

      var yAxisLabel = svg.append('g')
        .attr('transform', 'translate(0, 12)')
        .append('text')
        .attr('class', 'y-label')
        .text(label);

      if (!isDesforestation) {
        yAxisLabel.append('tspan')
          .attr('class', 'underscript')
          .attr('dy', this.defaults.underscriptPadding)
          .text(this.defaults.underscript);

        yAxisLabel.append('tspan')
          .text(')');
      }

      if (this.currentLocation && this.currentLocation.legend) {
        yAxisLabel.append('tspan')
          .attr('class', 'light')
          .text(' *' + this.currentLocation.legend);
      }

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
        return d > 999 ? (d / 1000).toFixed(1) + 'k' : d;
      };
      var yNumTicks = 4;
      var xNumTicks = this.isEmbed ? 5 : 12;

      this.x = d3.time.scale()
        .range([0, this.cWidth]);

      this.x2 = d3.scale.linear()
        .range([0, this.cWidth]).nice();

      this.y = d3.scale.linear()
        .range([this.cHeight, 0]).nice();

      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .innerTickSize(-this.cHeight)
        .tickValues(this.months)
        .ticks(xNumTicks)
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
     *  Get the domain values
     */
    _getDomain: function() {
      var _this = this;
      var xValues = [];
      var x2Values = [];
      var yValues = [];
      var rValues = [];

      this.chartData.forEach(function(d) {
        xValues.push((d[_this.dataDomain.x] * 1));
        x2Values.push((d[_this.dataDomain.x2] * 1));
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

      // Add extra padding to Y domain
      var numTicks = 10;
      this.y.domain([this.domain.y[0], d3.max(this.y.ticks(numTicks)) + this.y.ticks(numTicks)[2]]);
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
          .attr('y', -this.cHeight - _this.defaults.paddingYAxisLabels);

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
      this._drawHandle();
      this._drawSemiDashedLine();
      this._drawDashedLine();
      this._drawSolidLine();
      this._drawDots();
      this._drawBrush();
      this._renderTooltip();
      this._updateTooltip();
      this._setCurrentTooltip();
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
          .attr('class', function(d) {
            return 'dot dot-' + d.week;
          })
          .attr('r', _this.defaults.circleRadius)
          .attr('cx', function(d) {
            return _this.x2(d[_this.dataColumns.dots.x])
          })
          .attr('cy', function(d) {
            return _this.y(d[_this.dataColumns.dots.y])
          })
          .style('transform-origin', function(d) {
            return ( Math.round( _this.x2(d[_this.dataColumns.dots.x]) ) ) + 'px ' +
                   ( Math.round( _this.y(d[_this.dataColumns.dots.y]) ) ) + 'px';
          });
    },

    /**
     * Draws the dashed line
     */
    _drawDashedLine: function() {
      var _this = this;
      var allYData = _.pluck(this.chartData, this.dataColumns.dashed.y);
      var allXData = _.pluck(this.chartData, this.dataColumns.dashed.x);

      var dashedLine = this.svg.append('g')
        .attr('class', 'line-dashed-group')
        .attr('transform', 'translate( 0,' + -this.defaults.paddingAxisLabels + ')');

      var line = d3.svg.line()
        .x(function(d) { return _this.x2(d[_this.dataColumns.dashed.x]); })
        .y(function(d) { return _this.y(d[_this.dataColumns.dashed.y]); })
        .interpolate(this.defaults.interpolate);

      dashedLine.append('path')
        .attr('d', line(this.chartData))
        .attr('class', 'dash-line-path');

      var dashLineLabel = dashedLine.append('text')
        .attr('x', this.x2(allXData[allXData.length - 1]))
        .attr('y', this.y(_.max(allYData)))
        .attr('class', 'line-label')
        .attr('dy', -this.defaults.paddingLinesLabels)
        .text('2020 Target: ');

      this._addLineLabel(dashLineLabel, _.max(allYData));
    },

    _drawSemiDashedLine: function() {
      var _this = this;
      var allYData = _.pluck(this.chartData, this.dataColumns.semiDashed.y);
      var allXData = _.pluck(this.chartData, this.dataColumns.semiDashed.x);
      var label = '2001 - 2014 Average:';

      if (this.iso === 'BRA') {
        label = '2013 Average:';
      }

      var dashedLine = this.svg.append('g')
        .attr('class', 'line-semidashed-group')
        .attr('transform', 'translate( 0,' + -this.defaults.paddingLinesLabels + ')');

      var line = d3.svg.line()
        .x(function(d) { return _this.x2(d[_this.dataColumns.semiDashed.x]); })
        .y(function(d) { return _this.y(d[_this.dataColumns.semiDashed.y]); })
        .interpolate(this.defaults.interpolate);

      dashedLine.append('path')
        .attr('d', line(this.chartData))
        .attr('class', 'semidash-line-path');

      var dashLineLabel =  dashedLine.append('text')
        .attr('x', this.x2(allXData[allXData.length - 1]))
        .attr('y', this.y(_.max(allYData)))
        .attr('class', 'line-label')
        .attr('dy', -this.defaults.paddingLinesLabels)
        .text(label + ' ');

      this._addLineLabel(dashLineLabel, _.max(allYData));
    },

    /**
     * Draws the solid line
     */
    _drawSolidLine: function() {
      var _this = this;
      var solidLineGroup = this.svg.append('g')
        .attr('class', 'line-solid-group')
        .attr('transform', 'translate( 0,'+ -this.defaults.paddingAxisLabels + ')');

      this.linePath = d3.svg.line()
        .x(function(d) { return _this.x2(d[_this.dataColumns.line.x]); })
        .y(function(d) { return _this.y(d[_this.dataColumns.line.y]); })
        .interpolate(this.defaults.interpolate);

      this.graphLine = solidLineGroup.append('path')
        .attr('d', this.linePath(this.solidLineData))
        .attr('class', 'line-solid-path');
    },

    _addLineLabel: function(el, value) {
      var parsedValue = parseFloat((value * 1).toFixed(2));
      if (parsedValue > 1) {
        parsedValue = Math.round(parsedValue);
      }
      el.append('tspan')
        .text(NumbersHelper.addNumberDecimals(parsedValue) + ' ');

      if (this.unit.search(this.defaults.underscript) !== -1) {
        var unit = this.unit.split(this.defaults.underscript);
        for (var x = 0; x < unit.length; x++) {
          el.append('tspan')
            .text(unit[x]);

          if (x === 0) {
            el.append('tspan')
              .attr('class', 'underscript')
              .attr('dy', this.defaults.underscriptPadding)
              .text(this.defaults.underscript);
          }
        }
      } else {
        el.append('tspan')
          .text(this.unit);
      }
    },

    /**
     * Renders the tooltip of the visualization
     */
    _renderTooltip: function() {
      d3.select(this.el)
        .insert('div', 'svg')
          .attr('class', 'tooltip');

      var tooltip = this.el.querySelector('.tooltip');
      tooltip.innerHTML = this.templateTooltip({});
      this.tooltip = this.el.querySelector('.insights-glad-alerts-tooltip');
    },

    /**
     * Updates the tooltip of the current step
     * @param  {Number} current step
     */
    _updateTooltip: function(step) {
      var currentStep = step || this.currentStep;
      var data = _.findWhere(this.chartData, { week: currentStep });

      if (data) {
        var tooltip = this.el.querySelector('.tooltip');
        var emissions = parseFloat((data.cumulative_emissions * 1).toFixed(2));
        var deforestation = parseFloat((data.cumulative_deforestation * 1).toFixed(2));

        if (emissions > 1) {
          emissions = Math.round(emissions);
        }

        if (deforestation > 1) {
          deforestation = Math.round(deforestation);
        }

        tooltip.innerHTML = this.templateTooltip({
          isDesforestation: this.filter === this.defaults.desforestationFilter,
          emissions: NumbersHelper.addNumberDecimals(emissions),
          deforestation: NumbersHelper.addNumberDecimals(deforestation)
        });

        this.tooltip = this.el.querySelector('.insights-glad-alerts-tooltip');
      }
    },

    _getCurrentState: function(step) {
      return {
        step: step,
        maxData: this.maxDomain
      }
    },

    /**
     * Sets up the brush feature
     * of the graph
     */
    _drawBrush: function() {
      this.brush = d3.svg.brush()
        .x(this.x2)
        .extent([0, 0])
        .on('brush', function() {
          this._onBrush();
        }.bind(this))
        .on('brushend', function() {
          this._onBrushEnd();
        }.bind(this));

      this.slider = this.svg.append('g')
        .attr('class', 'handles')
        .call(this.brush);

      this.slider.selectAll('.extent,.resize')
        .remove();

      this.slider.select('.background')
        .attr('height', this.cHeight + this.defaults.margin.bottom);

      this._setHoverEvent();

      this._setHandlePosition();
    },

    _onBrush: function() {
      var domain = this._getDomain();
      var xDomain = domain.x2;
      var value =  Math.round(this.brush.extent()[0]);
      var element = this.el.querySelector('svg .handles');

      if (d3.event.sourceEvent) {
        d3.event.sourceEvent.stopPropagation();

        value = this.x2.invert(d3.mouse(element)[0]);
        this.brush.extent([value, value]);
      }

      if (value < xDomain[0]) {
        value = xDomain[0];
      }

      if (value > xDomain[1]) {
        value = xDomain[1];
      }

      this.currentStep = Math.round(value);

      if (this.isEmbed) {
        Backbone.Events.trigger('insights:glad:update', this._getCurrentState(this.currentStep));
      }

      this._setHandlePosition();
    },

    _onBrushEnd: function() {
      if (!d3.event.sourceEvent) return;
      var domain = this._getDomain();
      var xDomain = domain.x2;
      var element = this.el.querySelector('svg .handles');
      var extent0 = this.brush.extent(),
          extent1 = extent0;
      var current = Math.round(extent1[0]);

      if (extent1 < xDomain[0]) {
        current = xDomain[0];
      }

      if (extent1 > xDomain[1]) {
        current = xDomain[1];
      }

      this.currentStep = current;

      // if (this.isEmbed) {
        Backbone.Events.trigger('insights:glad:update', this._getCurrentState(current));
      // }

      d3.select(element).transition()
        .duration(0)
        .call(this.brush.extent(extent1))
        .call(this.brush.event);

      this._updateTooltip();
      this._setCurrentTooltip();
    },

    _setHoverEvent: function() {
      var _this = this;
      d3.select('svg .background')
        .on('mousemove', function() {
            var value = Math.round(_this.x2.invert(d3.mouse(this)[0]));
            _this._changeStepByValue(value);
            _this._updateTooltip(value);

            Backbone.Events.trigger('insights:glad:update', _this._getCurrentState(value));

            _this._setCurrentTooltip(value);
        });
    },

    _setCurrentTooltip: function(value) {
      var currentStep = value || this.currentStep;
      var current = d3.select('svg .dot-' + currentStep);

      d3.selectAll('svg .dot')
        .classed('hovered', false);

      if (current) {
        current.classed('hovered', true);

        if (current.node()) {
          var cords = current.node().getBBox();
          var left = cords.x + this.defaults.margin.left + cords.width;
          var width = this.tooltip.clientWidth;
          var height = this.tooltip.clientHeight;
          var leftPos = left - width - this.defaults.tooltipPadding;

          if (leftPos < 0) {
            leftPos = left + this.defaults.tooltipPadding;
            this.tooltip.classList.add('-right');
          } else {
            this.tooltip.classList.remove('-right');
          }

          if (this.isEmbed) {
            leftPos = leftPos - (this.defaults.tooltipPadding / 2);
          }

          this.tooltip.style.left = leftPos + 'px';
          this._showTooltip();
        } else {
          this._hideTooltip();
        }
      } else {
        this._hideTooltip();
      }
    },

    _drawHandle: function() {
      this.handleContainer = this.svg.append('g');

      this.handle = this.handleContainer.append('rect')
        .attr('class', 'handle')
        .attr('width', this.defaults.handleWidth + 'px')
        .attr('height', this.cHeight + (this.defaults.margin.top / 2));

      var triangle = d3.svg.symbol()
        .type('triangle-up')
        .size(this.defaults.triangleSize);

      this.handleContainer.append('path')
        .attr('class', 'handle-triangle')
        .attr('d', triangle)
        .attr('transform', 'translate(0, ' +
          (this.cHeight + (this.defaults.margin.bottom / 2)) +') scale(1.5, 1)');

      this.handleContainer.append('path')
        .attr('class', 'handle-triangle -fill')
        .attr('d', triangle)
        .attr('transform', 'translate(0, ' +
          (this.cHeight + (this.defaults.margin.bottom / 2) + 2) +') scale(1.5, 0.9)');
    },

    /**
     * Set the handle position with the
     * current step of the brush
     */
    _setHandlePosition: function() {
      var _this = this;

      this.handleContainer.attr('transform', function() {
        return 'translate('+ (_this.x2(_this.currentStep) -
          (_this.defaults.handleWidth / 2)) + ', 0)';
      });
    },

    _changeStepByValue: function(step) {
      this.currentStep = step;
      this._setHandlePosition();
    },

    updateByFilter: function(filter) {
      this.remove({
        keepEvents: true
      });

      this.filter = filter;
      this._initChart();
    },

    _onHoverOut: function() {
      this._hideTooltip();
    },

    _hideTooltip: function() {
      this.tooltip.classList.remove('-visible');

      d3.select('.' + this.defaults.chartClass)
        .classed('hovering', false);
    },

    _showTooltip: function() {
      this.tooltip.classList.add('-visible');

      d3.select('.' + this.defaults.chartClass)
        .classed('hovering', true);
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
        this.el.classList.remove(this.filter);
        this.el.removeChild(svgContainer);
      }
    }

  });

  return GladAlertsVis;

});
