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
      // this._parseData(this.data);

      this.data = [];

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
      // this._setAxisScale();
      // this._setDomain();
      // this._drawAxis();
      // this._drawGraph();
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
     *  Sets up the SVG for the graph
     */
    _setUpGraph: function() {
      var el = this.el;
      var margin = this.defaults.margin;

      this.el.innerHTML = '';
      this.el.classList.add(this.defaults.chartClass);

      this.cWidth = el.clientWidth;
      this.cHeight = el.clientHeight;
      // this.domain = this._getDomain();
      this.cWidth = this.cWidth - margin.left - margin.right;
      this.cHeight = this.cHeight - margin.top - margin.bottom;

      var svg = d3.select(el).append('svg')
        .attr('width', this.cWidth + margin.left + margin.right + 'px')
        .attr('height', this.cHeight + margin.top + margin.bottom + 'px');

      this.svg = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
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
