define([
  'backbone',
  'underscore',
  'd3',
  'helpers/NumbersHelper',
  'text!countries/templates/report/pie-chart.handlebars'
], function(
  Backbone,
  _,
  d3,
  NumbersHelper,
  tpl
) {

  'use strict';

  var PieChart = Backbone.View.extend({

    el: '#pie-chart',

    template: Handlebars.compile(tpl),

    defaults: {
      chartEl: 'pie-chart-svg',
      chartClass: 'js-pie-chart',
      paddingAxisLabels: 10,
      paddingXAxisLabels: 20,
      paddingYAxisLabels: 10,
      margin: {
        top: 20,
        right: 55,
        bottom: 35,
        left: 15
      },
      outerRadius: 5,
      innerRadius: 60,
      buckets: ['#647FA1', '#B1C0D1', '#E2B241', '#F0D9A2', '#555555', '#B6B6BA']
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
        hasData: this.chartData.length,
        data: this.chartData,
        labels: this.defaults.legendLabels
      }));

      this.render();
    },

    render: function() {
      this._setUpGraph();
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

      this.data.top_five.forEach(function(data, index) {
        data.color = this.defaults.buckets[index];
        data.name = data.province;
        data.displayValue = NumbersHelper.addNumberDecimals(Math.round(data.value));
        this.chartData.push(data);
      }.bind(this));

      // Others category
      var others = this.data.others;
      others.name = 'Others';
      others.displayValue = NumbersHelper.addNumberDecimals(Math.round(others.value));
      others.color = this.defaults.buckets[this.defaults.buckets.length - 1];
      this.chartData.push(others);
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
      this.cHeight = el.clientHeight;

      this.cWidth = this.cWidth - margin.left - margin.right;
      this.cHeight = this.cHeight - margin.top - margin.bottom;
      this.radius = Math.min(this.cWidth, this.cHeight) / 2;

      var svg = d3.select(el).append('svg')
        .attr('width', this.cWidth + margin.left + margin.right + 'px')
        .attr('height', this.cHeight + margin.top + margin.bottom + 'px');

      this.svg = svg.append('g')
        .attr('transform', 'translate(' + (this.cWidth + margin.left +  margin.right) / 2 +
          ',' + ((this.cHeight + margin.top + margin.bottom)) / 2 + ')');
    },

    /**
     * Draws the entire graph
     */
    _drawGraph: function() {
      this._drawPie();
    },

    /**
     * Draws the Pie chart
     */
    _drawPie: function() {
      var arc = d3.svg.arc()
        .outerRadius(this.radius - this.defaults.outerRadius)
        .innerRadius(this.radius - this.defaults.innerRadius);

      var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

      var pieGroup = this.svg.selectAll('.arc')
        .data(pie(this.chartData))
        .enter()
          .append('g')
            .attr('class', 'arc');

      pieGroup.append('path')
        .attr('class', 'path')
        .attr('d', arc)
        .style('fill', function(d) {
          return d.data.color;
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

  return PieChart;

});
