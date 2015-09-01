define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'countries/models/CountryModel',
  'countries/views/show/IndicatorView',
  'text!countries/templates/indicators/lineGraph.handlebars'
], function(d3, moment, _, Handlebars, CountryModel, IndicatorView, tpl) {

  'use strict';

  var GraphIndicator = IndicatorView.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.model = CountryModel;

      this._getData();
      this.render();
    },

    _getData: function() {
      // API call
      this.data = this.model.get('umd');

      this._drawGraph();
    },

    _drawGraph: function() {

      var margin = {
        top: 35,
        right: 20,
        bottom: 30,
        left: 58
      },
      width = 550 - margin.left - margin.right,
      height = 280 - margin.top - margin.bottom;

      // Ranges
      var x = d3.scale.linear().range([0, width]),
          y = d3.scale.linear().range([height, 0]);

      // Line
      var valueline = d3.svg.line()
          .interpolate("basis")
          .x(function(d) {
            return x(d.year);
          })
          .y(function(d) {
            return y(d.loss);
          });

      // SVG Canvas
      var svgElem = document.createElement('div');
      svgElem.setAttribute('class', 'line-graph-container');
      var svg = d3.select(svgElem)
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class', 'line-chart')
        .append('g')
          .attr('transform', 'translate(' + margin.left + ', 0)');

      // Data

      var data = [];

      this.data.forEach(function(d) {

        if (Number(d.year % 2) === 0) {

          data.push({
            year: moment(d.year + '-01-01'),
            loss: d.loss
          });
        }

      });

      // Axes
      var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(1)
        .ticks(data.length).tickSize(0).tickPadding(10).tickFormat(function(d) {
          return String(moment(d).format('YYYY')).replace(',', '');
        });

      var yAxis = d3.svg.axis().scale(y).orient('left').ticks(data.length).tickSize(0).tickPadding(10);

      // Scale range of the data
      x.domain(d3.extent(data, function(d) {
        var fullYear = Number(d.year.format('YYYY'));
        if (fullYear % 2 === 0) {
          return d.year;
        }
      }));

      y.domain([0, d3.max(data, function(d) { return d.loss; })]);


      // Add valueline path
      svg.append('path')
        .attr('class', 'line')
        .attr('d', valueline(data));

      // Add X axis
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      // Add Y axis
      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      return svgElem.innerHTML;
    },

    render: function() {
      var lineChart = this._drawGraph();

      this.$el.html(this.template({
        svg: lineChart
      }));

      // this.$el.find('.sub-options').prepend(lineChart.innerHTML);
    }

  });

  return GraphIndicator;

});
