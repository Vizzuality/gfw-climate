define([
  'underscore',
  'd3',
  'handlebars',
  'countries/views/show/IndicatorView',
  'countries/helpers/GraphHelper',
  'text!countries/templates/indicators/pieChart.handlebars',
  'text!countries/templates/indicators/legend-example.handlebars'
], function(_, d3, Handleabars, IndicatorView, GraphHelper, tpl, legendTemplate) {

  'use strict';

  var PieChartIndicator = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
    },

    _addLegend: function(json) {


      var legend = document.createElement('div');


      var legendHTML = Handlebars.compile(legendTemplate);


      $('.piechart-container').append(legendHTML);


      // var legend = svg.append('g')
      //           .attr('class', 'legend')
      //           .call(GraphHelper.createLegend);

      // // Positioning the legend
      // var svgDOM = document.querySelector('svg'),
      //   legendDOM = document.querySelector('.legend rect'),
      //   legendWidth = parseInt(legendDOM.getAttribute('width'));

      // var x = -(svgDOM.getAttribute('width') / 2);
      // var y = 0;

      // legend.select('g')
      //   .attr('transform', 'translate(' + x + ', ' + y + ')');
    },

    _drawPieChart: function() {

      //  Delete in future
      var json = [

        {
          "name": "Aboveground",
          "value": 32
        },
        {
          "name": "Belowground",
          "value": 68
        }
      ];


      var width = 250,
        height = 250,
        radius = Math.min(width, height) / 2,
        arrayColor = ['#0098cf', '#b6b6ba'];

      var color = d3.scale.ordinal()
        .range(arrayColor);

      var arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(radius - 65);

      var pie = d3.layout.pie()
        // .padAngle('.01')
        .sort(null)
        .value(function(d) { return d.value})

      var svg = d3.select('.piechart-container').append('svg')
          .attr('width', width)
          .attr('height', height)
        .append('g')
          .attr('transform', 'translate(' + width / 2 + ', ' + height / 2 + ')');

      json.forEach(function(d) {
        d.value = +d.value;
      });

      var g = svg.selectAll('.arc')
          .data(pie(json))
        .enter().append('g')
          .attr('class', 'arc');

      g.append('path')
        .attr('d', arc)
        .style('fill', function(d) { return color(d.data.name); })
        .attr('data-legend', function(d) { return d.data.name })
        .attr('data-legend-color', function(d) { return color(d.data.name); });

      g.append('text')
        .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(function(d) { return d.data.value + '%'; });

      this._addLegend(json)
    },

    render: function() {

      var self = this;
      this.$el.append(this.template);
      setTimeout(function() {
        self._drawPieChart();
      }, 100);

      return this;
    }

  });

  return PieChartIndicator;

});
