define([
  'backbone',
  'underscore',
  'd3',
  'moment',
  'helpers/NumbersHelper',
  'text!insights/templates/insights-glad-alerts-tooltip.handlebars',
], function(Backbone, _, d3, moment, NumbersHelper, tplTooltip) {

  'use strict';

  var GladAlertsVis = Backbone.View.extend({

    el: '#vis-glad',

    templateTooltip: Handlebars.compile(tplTooltip),

    defaults: {
      chartClass: 'chart-glad',
      interpolate: 'linear',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 20,
      paddingYAxisLabels: 25,
      tooltipPadding: 22,
      dateFormat: '%b',
      margin: {
        top: 35,
        right: 15,
        bottom: 65,
        left: 60
      },
      circleRadius: 5,
      filter: 'carbon_emissions',
      chartConfig: {
        'carbon_emissions': {
          domain: {
            x: 'date',
            x2: 'week',
            y: [
              'cumulative_emissions',
              'emissions_target',
              'baseline_emissions'
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
              y: 'baseline_emissions'
            },
            semiDashed: {
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
              'deforestation_target',
              'deforestation_baseline'
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
              y: 'deforestation_baseline'
            },
            semiDashed: {
              x: 'week',
              y: 'deforestation_target'
            }
          }
        }
      },
      handleWidth: 1,
      timelineButtonRadius: 15,
      maxWidth: 600
    },

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings.params);
      this.data = this.defaults.data;
      this.filter = this.defaults.filter;
      this.currentStep = this.defaults.currentStep;
      this.iso = this.defaults.iso;

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
      this.chartData = data;
      this.dataColumns = this.defaults.chartConfig[this.filter].dataColumns;
      this.dataDomain = this.defaults.chartConfig[this.filter].domain;

      this.chartData.forEach(function(d) {
        d.date = moment().week(d.week).toDate();
      });

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
      this.remove({
        keepEvents: true
      });
      this._checkIsEmbed();
      this.render();
    },

    _checkIsEmbed: function() {
      if (document.body.clientWidth < this.defaults.maxWidth) {
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
      var yNumTicks = 8;
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
        .innerTickSize(6)
        .tickValues(this.months)
        .ticks(xNumTicks)
        .outerTickSize(0)
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
    },

    _drawSemiDashedLine: function() {
      var _this = this;
      var dashedLine = this.svg.append('g')
        .attr('class', 'line-semidashed-group')
        .attr('transform', 'translate( 0,' + -this.defaults.paddingAxisLabels + ')');

      var line = d3.svg.line()
        .x(function(d) { return _this.x2(d[_this.dataColumns.semiDashed.x]); })
        .y(function(d) { return _this.y(d[_this.dataColumns.semiDashed.y]); })
        .interpolate(this.defaults.interpolate);

      dashedLine.append('path')
        .attr('d', line(this.chartData))
        .attr('class', 'semidash-line-path');
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

    _renderTooltip: function() {
      d3.select(this.el)
        .insert('div', 'svg')
          .attr('class', 'tooltip')

      var tooltip = this.el.querySelector('.tooltip');
      tooltip.innerHTML = this.templateTooltip({});
      this.tooltip = this.el.querySelector('.insights-glad-alerts-tooltip');
    },

    _updateTooltip: function(step) {
      var data = _.findWhere(this.chartData, { week: step.toString() });

      if (data) {
        var tooltip = this.el.querySelector('.tooltip');
        tooltip.innerHTML = this.templateTooltip({
          value: NumbersHelper.addNumberDecimals(data.alerts),
          // image: window.gfw.config.GFW_DATA_S3
          image: 'http://gfw2-data.s3.amazonaws.com/climate/glad_maps/roc_2016_25.png'
        });
        this.tooltip = this.el.querySelector('.insights-glad-alerts-tooltip');
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
        Backbone.Events.trigger('insights:glad:update', this.currentStep);
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

      if (this.isEmbed) {
        Backbone.Events.trigger('insights:glad:update', current);
      }

      d3.select(element).transition()
        .duration(0)
        .call(this.brush.extent(extent1))
        .call(this.brush.event);
    },

    _setHoverEvent: function() {
      var _this = this;
      d3.select('svg .background')
        .on('mousemove', function() {
          if (!_this.isEmbed) {
            var value = Math.round(_this.x2.invert(d3.mouse(this)[0]));
            _this._changeStepByValue(value);
            _this._updateTooltip(value);

            d3.selectAll('svg .dot')
              .classed('hovered', false);

            Backbone.Events.trigger('insights:glad:update', value);

            var current = d3.select('svg .dot-'+value);
            if (current) {
              current.classed('hovered', true);

              if (current.node()) {
                var cords = current.node().getBBox();
                var left = cords.x + _this.defaults.margin.left + (cords.width / 2);
                var top = cords.y + _this.defaults.margin.top - (cords.height / 2);
                var width = _this.tooltip.clientWidth;
                var height = _this.tooltip.clientHeight;

                _this.tooltip.style.left = left - (width / 2) + 'px';
                _this.tooltip.style.top = top - height - _this.defaults.tooltipPadding + 'px';
                _this._showTooltip();
              } else {
                _this._hideTooltip();
              }
            } else {
              _this._hideTooltip();
            }
          }
        });
    },

    _drawHandle: function() {
      this.handleContainer = this.svg.append('g');

      this.handle = this.handleContainer.append('rect')
        .attr('class', 'handle')
        .attr('width', this.defaults.handleWidth + 'px')
        .attr('height', this.cHeight + (this.defaults.margin.top / 2));

      this.handleLabel = this.svg.append('text')
        .attr('class', 'handle-label');

      var triangle = d3.svg.symbol().type('triangle-down').size(90);

      this.handleContainer.append('path')
        .attr('class', 'handle-triangle')
        .attr('d', triangle)
    },

    /**
     * Set the handle position with the
     * current step of the brush
     */
    _setHandlePosition: function() {
      var _this = this;

      this.handleContainer.attr('transform', function() {
        return 'translate('+ (_this.x2(_this.currentStep) -
          (_this.defaults.handleWidth / 2)) + ', ' + -((_this.defaults.margin.top / 2)) + ')';
      });

      this.handleLabel.attr('transform', function() {
        return 'translate('+ (_this.x2(_this.currentStep) -
          (_this.defaults.handleWidth / 2)) + ', ' + (_this.cHeight + (_this.defaults.paddingXAxisLabels / 1.4)) + ')';
      });

      this.handleLabel.text('Week ' + Math.round(this.currentStep));
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
    },

  });

  return GladAlertsVis;

});
