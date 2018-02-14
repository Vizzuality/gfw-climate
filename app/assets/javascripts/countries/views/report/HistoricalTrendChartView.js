define(
  [
    'backbone',
    'handlebars',
    'underscore',
    'd3',
    'helpers/NumbersHelper',
    'text!countries/templates/report/historical-trend-chart.handlebars'
  ],
  function(Backbone, Handlebars, _, d3, NumbersHelper, tpl) {
    'use strict';

    var SummaryChart = Backbone.View.extend({
      el: '#historical-trend-chart',

      template: Handlebars.compile(tpl),

      defaults: {
        chartEl: 'historical-trend-chart-svg',
        chartClass: 'js-historical-trend-chart',
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
        underscriptPadding: 1.5,
        underscript: '2',
        labels: [
          {
            name: 'Year',
            footerName: '',
            slug: 'year',
            width: 16
          },
          {
            name: '',
            footerName: '',
            slug: 'average',
            width: 50
          },
          {
            name: 'Loss (ha/yr)',
            footerName: 'Average',
            slug: 'loss',
            width: 14
          },
          {
            name: 'Deviation',
            subtitle: 'from historical average',
            footerName: '',
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
        this.hasData = this.chartData && this.chartData.length;

        if (this.hasData) {
          this._setCustomLabels();
          this._start();
        } else {
          this._renderNoData();
        }
      },

      _setCustomLabels: function() {
        if (this.defaults.customLabels) {
          this.defaults.customLabels.forEach(
            function(custom) {
              var label = _.findWhere(this.defaults.labels, {
                slug: custom.slug
              });

              if (label) {
                label.name = custom.name;
              }
            }.bind(this)
          );
        }
      },

      _start: function() {
        this.$el.html(
          this.template({
            hasData: this.chartData.length
          })
        );

        this.render();
      },

      _renderNoData: function() {
        this.$el.html(
          this.template({
            hasData: this.hasData
          })
        );
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
        this.chartData = [];

        for (var indicator in this.data) {
          var current = this.data[indicator];
          if (current && current.values) {
            current.total = NumbersHelper.round(current.total, 6);
            current.values.forEach(
              function(data) {
                if (data) {
                  data.value = NumbersHelper.round(data.value, 6);
                  data.type = indicator;
                  this.chartData.push(data);
                }
              }.bind(this)
            );
          }
        }

        this.referenceData = (this.data && this.data.reference) || {};
        this.monitoringData = (this.data && this.data.monitor) || {};
        this.averageData = [
          {
            value: this.referenceData.average,
            type: 'reference'
          },
          {
            value: this.monitoringData.average,
            type: 'monitor'
          }
        ];
      },

      /**
       *  Sets up the SVG for the graph
       */
      _setUpGraph: function() {
        this.chartEl = this.el.querySelector('#' + this.defaults.chartEl);
        var el = this.chartEl;
        var margin = this.defaults.margin;

        el.innerHTML = '';
        el.classList.add(this.defaults.chartClass);

        this.cWidth = el.clientWidth;
        this.cHeight = (this.chartData.length + 6) * this.defaults.rowHeight;
        this.domain = this._getDomain();

        this.yAxisWidth = this.defaults.yAxisWidth;
        this.widthPadding = this.cWidth - this.yAxisWidth;

        this.cWidth = this.cWidth - margin.left - margin.right;
        this.cHeight = this.cHeight - margin.top - margin.bottom;
        this.cWidthGrid = this.cWidth - margin.left - margin.right;

        var svg = d3
          .select(el)
          .append('svg')
          .attr('width', this.cWidth + margin.left + margin.right + 'px')
          .attr('height', this.cHeight + margin.top + margin.bottom + 'px');

        this.svg = svg
          .append('g')
          .attr(
            'transform',
            'translate(' + margin.left + ',' + margin.top + ')'
          );
      },

      /**
       *  Sets the axis
       */
      _setAxisScale: function() {
        var average = _.findWhere(this.defaults.labels, { slug: 'average' });
        var barsContentWidth =
          average.width * this.cWidthGrid / 100 - this.defaults.barMargin * 2;

        this.x = d3.scale.linear().range([0, barsContentWidth]);

        this.x2 = d3.scale.linear().range([0, barsContentWidth]);

        this.y = d3.scale
          .linear()
          .range([0, this.cHeight])
          .nice();

        this.yAxis = d3.svg
          .axis()
          .scale(this.y)
          .orient('left')
          .innerTickSize(0)
          .outerTickSize(0)
          .ticks(this.chartData.length)
          .tickFormat(
            function(d, i) {
              if (this.chartData[i]) {
                return this.chartData[i].year;
              }
              return null;
            }.bind(this)
          );
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
        return {
          x: [
            0,
            d3.max(this.chartData, function(d) {
              return d.value;
            })
          ],
          x2: [
            0,
            d3.max(this.averageData, function(d) {
              return d.value;
            })
          ],
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
        this._drawGridFooter();
        this._drawFooterLabels();
        this._drawFooterBars();
        this._drawFooterAverages();
        this._drawFooterDeviation();
      },

      _drawGrid: function() {
        // X Lines
        var numLines = this.chartData.length;
        var rowOffset = this.defaults.rowHeight;
        var linesGroup = this.svg
          .append('g')
          .attr('transform', 'translate(0, ' + this.defaults.rowHeight + ')');

        for (var x = 0; x < numLines; x++) {
          linesGroup
            .append('rect')
            .attr('class', 'xAxis')
            .attr('width', this.cWidth)
            .attr('height', 1)
            .attr('x', 0)
            .attr('y', rowOffset);

          rowOffset += this.defaults.rowHeight;
        }

        // Labels
        var marginOffset = 0;
        this.defaults.labels.forEach(
          function(label) {
            var margin = label.width * this.cWidthGrid / 100;
            var group = this.svg
              .append('g')
              .attr('transform', 'translate(' + marginOffset + ', 0)')
              .attr('class', label.slug);

            if (!label.subtitle) {
              if (this.defaults.customLabel && label.slug === 'loss') {
                var customLabel = group
                  .append('text')
                  .attr('class', 'label')
                  .attr('y', this.defaults.rowHeight / 2)
                  .attr('x', margin - this.defaults.paddingXAxisLabels);

                this._setCustomLabel(this.defaults.customLabel, customLabel);
              } else {
                group
                  .append('text')
                  .attr('class', 'label')
                  .attr('y', this.defaults.rowHeight / 2)
                  .attr('x', margin - this.defaults.paddingXAxisLabels)
                  .text(label.name);
              }
            } else {
              group
                .append('text')
                .attr('class', 'label')
                .attr('y', 0)
                .attr('x', margin - this.defaults.paddingXAxisLabels)
                .text(label.name);

              group
                .append('text')
                .attr('class', 'label subtitle')
                .attr('y', this.defaults.rowHeight / 2)
                .attr('x', margin - this.defaults.paddingXAxisLabels)
                .text(label.subtitle);
            }
            marginOffset += margin;
          }.bind(this)
        );

        // Y Line
        var averageGroup = this.svg.select('.average');
        linesGroup
          .append('rect')
          .attr('class', 'yAxis')
          .attr('width', 3)
          .attr('height', this.chartData.length * this.defaults.rowHeight)
          .attr('x', d3.transform(averageGroup.attr('transform')).translate[0])
          .attr('y', 0);
      },

      _setCustomLabel: function(label, group) {
        if (label.search(this.defaults.underscript) !== -1) {
          var unit = label.split(this.defaults.underscript);
          for (var x = 0; x < unit.length; x++) {
            group.append('tspan').text(unit[x]);

            if (x === 0) {
              group
                .append('tspan')
                .attr('class', 'underscript')
                .attr('dy', this.defaults.underscriptPadding)
                .text(this.defaults.underscript);
            }
          }
        }
      },

      _drawYears: function() {
        var yearGroup = this.svg.select('.year');
        var yearLabel = _.findWhere(this.defaults.labels, { slug: 'year' });
        var yearLabelWidth = yearLabel.width * this.cWidthGrid / 100;
        var yearsContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' +
              d3.transform(yearGroup.attr('transform')).translate[0] +
              ', ' +
              this.defaults.rowHeight +
              ')'
          );

        var yearsGroup = yearsContent
          .selectAll('g')
          .data(this.chartData)
          .enter()
          .append('g')
          .attr(
            'transform',
            function(d, i) {
              return 'translate(0, ' + this.defaults.rowHeight * i + ')';
            }.bind(this)
          );

        yearsGroup
          .append('text')
          .attr('class', 'year')
          .text(function(d) {
            return d.year;
          })
          .attr(
            'dx',
            function() {
              return yearLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr(
            'dy',
            function() {
              return this.defaults.rowHeight / 2 + this.defaults.barHeight;
            }.bind(this)
          );
      },

      _drawLoss: function() {
        var lossGroup = this.svg.select('.loss');
        var lossLabel = _.findWhere(this.defaults.labels, { slug: 'loss' });
        var lossLabelWidth = lossLabel.width * this.cWidthGrid / 100;
        var lossContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' +
              d3.transform(lossGroup.attr('transform')).translate[0] +
              ', ' +
              this.defaults.rowHeight +
              ')'
          );

        lossGroup = lossContent
          .selectAll('g')
          .data(this.chartData)
          .enter()
          .append('g')
          .attr(
            'transform',
            function(d, i) {
              return 'translate(0, ' + this.defaults.rowHeight * i + ')';
            }.bind(this)
          );

        lossGroup
          .append('text')
          .attr('class', 'value')
          .text(function(d) {
            return NumbersHelper.addNumberDecimals(
              NumbersHelper.round(d.value, 6)
            );
          })
          .attr(
            'dx',
            function() {
              return lossLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr(
            'dy',
            function() {
              return this.defaults.rowHeight / 2 + this.defaults.barHeight;
            }.bind(this)
          );
      },

      _drawDeviation: function() {
        var total = _.reduce(
          this.referenceData.values,
          function(memo, data) {
            return memo + data.value;
          },
          0
        );
        var average = total / this.referenceData.values.length;
        var deviationGroup = this.svg.select('.deviation');
        var deviationLabel = _.findWhere(this.defaults.labels, {
          slug: 'deviation'
        });
        var deviationLabelWidth = deviationLabel.width * this.cWidthGrid / 100;

        var deviationContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' +
              d3.transform(deviationGroup.attr('transform')).translate[0] +
              ', ' +
              this.defaults.rowHeight * (this.referenceData.values.length + 1) +
              ')'
          );

        deviationGroup = deviationContent
          .selectAll('g')
          .data(this.monitoringData.values)
          .enter()
          .append('g')
          .attr(
            'transform',
            function(d, i) {
              return 'translate(0, ' + this.defaults.rowHeight * i + ')';
            }.bind(this)
          );

        deviationGroup
          .append('text')
          .attr('class', 'value')
          .text(function(d) {
            var value = Math.round((d.value - average) / average * 100);
            var displayValue = value;

            if (value > 0) {
              displayValue = '+' + value;
            }
            return displayValue + '%';
          })
          .attr(
            'dx',
            function() {
              return deviationLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr(
            'dy',
            function() {
              return this.defaults.rowHeight / 2 + this.defaults.barHeight;
            }.bind(this)
          );
      },

      _drawBars: function() {
        var averageGroup = this.svg.select('.average');
        var leftOffset =
          d3.transform(averageGroup.attr('transform')).translate[0] +
          this.defaults.barMargin;

        var barsContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' + leftOffset + ', ' + this.defaults.rowHeight + ')'
          );

        var barGroup = barsContent
          .selectAll('g')
          .data(this.chartData)
          .enter()
          .append('g')
          .attr(
            'transform',
            function(d, i) {
              return 'translate(0, ' + this.defaults.rowHeight * i + ')';
            }.bind(this)
          );

        barGroup
          .append('rect')
          .attr('class', function(d) {
            return 'bar ' + d.type;
          })
          .attr('height', this.defaults.barHeight)
          .attr(
            'width',
            function(d) {
              var value = this.x(d.value);
              if (value === 0) {
                return this.defaults.defaultZeroValue;
              }
              return this.x(d.value);
            }.bind(this)
          )
          .attr(
            'y',
            function() {
              return this.defaults.rowHeight / 2 - this.defaults.barHeight / 2;
            }.bind(this)
          );
      },

      _drawGridFooter: function() {
        var rowOffset = this.defaults.rowHeight * 2.5;

        var grid = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(0, ' +
              this.defaults.rowHeight * (this.chartData.length + 1.5) +
              ')'
          );

        // Labels
        var marginOffset = 0;
        this.defaults.labels.forEach(
          function(label) {
            var margin = label.width * this.cWidthGrid / 100;
            var group = grid
              .append('g')
              .attr('transform', 'translate(' + marginOffset + ', 0)')
              .attr('class', label.slug);

            group
              .append('text')
              .attr('class', 'label')
              .attr(
                'y',
                function() {
                  return this.defaults.rowHeight / 2;
                }.bind(this)
              )
              .attr(
                'x',
                function() {
                  return margin - this.defaults.paddingXAxisLabels;
                }.bind(this)
              )
              .style('text-anchor', 'end')
              .text(label.footerName);

            marginOffset += margin;
          }.bind(this)
        );

        grid
          .append('rect')
          .attr('class', 'xAxis')
          .attr('width', this.cWidth)
          .attr('height', 1)
          .attr('x', 0)
          .attr('y', rowOffset);

        // Y Line
        var averageGroup = this.svg.select('.average');
        grid
          .append('rect')
          .attr('class', 'yAxis')
          .attr('width', 3)
          .attr('height', rowOffset * 1.25)
          .attr('x', d3.transform(averageGroup.attr('transform')).translate[0])
          .attr('y', rowOffset / 2.5);
      },

      _drawFooterLabels: function() {
        var rowOffset = this.defaults.rowHeight;
        var yearLabel = _.findWhere(this.defaults.labels, { slug: 'year' });
        var yearLabelWidth = yearLabel.width * this.cWidthGrid / 100;
        var content = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(0, ' +
              (this.defaults.rowHeight * (this.chartData.length + 1.5) +
                rowOffset) +
              ')'
          );

        content
          .append('text')
          .attr('class', 'label subtitle')
          .attr(
            'dx',
            function() {
              return yearLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr('dy', this.defaults.rowHeight / 2)
          .text('Historical Average');

        content
          .append('text')
          .attr('class', 'label')
          .attr(
            'dx',
            function() {
              return yearLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr(
            'dy',
            function() {
              return this.defaults.rowHeight + this.defaults.barHeight;
            }.bind(this)
          )
          .text(
            this.referenceData.values[0].year +
              '-' +
              this.referenceData.values[this.referenceData.values.length - 1]
                .year
          );

        content
          .append('text')
          .attr('class', 'label subtitle')
          .attr(
            'dx',
            function() {
              return yearLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr(
            'dy',
            rowOffset * 2.5 -
              this.defaults.rowHeight / 2 +
              this.defaults.barHeight
          )
          .text('Monitoring period');

        content
          .append('text')
          .attr('class', 'label')
          .attr(
            'dx',
            function() {
              return yearLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr(
            'dy',
            function() {
              return (
                rowOffset * 2.5 +
                this.defaults.barHeight +
                this.defaults.barHeight / 2
              );
            }.bind(this)
          )
          .text(
            this.monitoringData.values[0].year +
              '-' +
              this.monitoringData.values[this.monitoringData.values.length - 1]
                .year
          );
      },

      _drawFooterBars: function() {
        var rowOffset = this.defaults.rowHeight;
        var averageGroup = this.svg.select('.average');
        var leftOffset =
          d3.transform(averageGroup.attr('transform')).translate[0] +
          this.defaults.barMargin;

        var barsContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' +
              leftOffset +
              ', ' +
              (this.defaults.rowHeight * (this.chartData.length + 1.5) +
                rowOffset) +
              ')'
          );

        var barGroup = barsContent
          .selectAll('g')
          .data(this.averageData)
          .enter()
          .append('g')
          .attr('transform', function(d, i) {
            return 'translate(0, ' + rowOffset * 1.5 * i + ')';
          });

        barGroup
          .append('rect')
          .attr('class', function(d) {
            return 'bar ' + d.type;
          })
          .attr('height', this.defaults.barHeight)
          .attr(
            'width',
            function(d) {
              return this.x(d.value);
            }.bind(this)
          )
          .attr('y', function() {
            return rowOffset * 1.25 / 2;
          });
      },

      _drawFooterAverages: function() {
        var rowOffset = this.defaults.rowHeight;
        var averageGroup = this.svg.select('.loss');
        var averageLabel = _.findWhere(this.defaults.labels, { slug: 'loss' });
        var averageLabelWidth = averageLabel.width * this.cWidthGrid / 100;

        var averageContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' +
              d3.transform(averageGroup.attr('transform')).translate[0] +
              ', ' +
              (this.defaults.rowHeight * (this.chartData.length + 1.5) +
                rowOffset) +
              ')'
          );

        var contentGroup = averageContent
          .selectAll('g')
          .data(this.averageData)
          .enter()
          .append('g')
          .attr(
            'transform',
            function(d, i) {
              return 'translate(0, ' + this.defaults.rowHeight * 1.8 * i + ')';
            }.bind(this)
          );

        contentGroup
          .append('text')
          .attr('class', 'value')
          .text(function(d) {
            return NumbersHelper.addNumberDecimals(
              NumbersHelper.round(d.value, 6)
            );
          })
          .attr(
            'dx',
            function() {
              return averageLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr('dy', function() {
            return rowOffset * 1.25 / 2;
          });
      },

      _drawFooterDeviation: function() {
        var rowOffset = this.defaults.rowHeight;
        var deviationGroup = this.svg.select('.deviation');
        var deviationLabel = _.findWhere(this.defaults.labels, {
          slug: 'deviation'
        });
        var deviationLabelWidth = deviationLabel.width * this.cWidthGrid / 100;
        var total = _.reduce(
          this.referenceData.values,
          function(memo, data) {
            return memo + data.value;
          },
          0
        );
        var average = total / this.referenceData.values.length;
        var deviationContent = this.svg
          .append('g')
          .attr(
            'transform',
            'translate(' +
              d3.transform(deviationGroup.attr('transform')).translate[0] +
              ', ' +
              (this.defaults.rowHeight * (this.chartData.length + 1.5) +
                rowOffset) +
              ')'
          );

        var contentGroup = deviationContent
          .selectAll('g')
          .data(this.averageData)
          .enter()
          .append('g')
          .attr(
            'transform',
            'translate(0, ' + this.defaults.rowHeight * 2.5 + ')'
          );

        contentGroup
          .append('text')
          .attr('class', 'value')
          .text(
            function() {
              var value = Math.round(
                (this.monitoringData.average - average) / average * 100
              );
              var displayValue = value;

              if (value > 0) {
                displayValue = '+' + value;
              }
              return displayValue + '%';
            }.bind(this)
          )
          .attr(
            'dx',
            function() {
              return deviationLabelWidth - this.defaults.paddingXAxisLabels;
            }.bind(this)
          )
          .attr('dy', 0);
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
        if (this.svg) {
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
  }
);
