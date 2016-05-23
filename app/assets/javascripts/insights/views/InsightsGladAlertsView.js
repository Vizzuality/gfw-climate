define([
  'backbone',
  'handlebars',
  'd3',
  'insights/views/InsightsGladAlertsChartView',
  'text!insights/templates/insights-glad-alerts.handlebars',
  'text!insights/templates/insights-glad-alerts-legend.handlebars',
], function(Backbone, Handlebars, d3, InsightsGladAlertsChart, tpl, tplLegend) {

  'use strict';

  var InsightsGladAlerts = Backbone.View.extend({

    el: '#vis-glad',

    template: Handlebars.compile(tpl),

    templateLegend: Handlebars.compile(tplLegend),

    defaults: {

    },

    initialize: function() {
      this.legends = [];
      this.currentStep = 1;
      this.render();
      this._setListeners();
    },

    render: function() {
      this.$el.html(this.template({}));

      this._renderMainChart();
      this._renderCompareChart('#vis1', '/data_glad_brazil.csv');
      this._renderCompareChart('#vis2', '/data_glad_rep_of_congo.csv');
      this._renderCompareChart('#vis3', '/data_glad_kalimantan.csv');
    },

    _setListeners: function() {
      Backbone.Events.on('pantropical:glad:update', this._updateLegends.bind(this));
    },

    _renderMainChart: function() {
      var el = this.el.querySelector('#visMain');
      var chartEl = el.querySelector('.chart');
      var legendEl = el.querySelector('.legend');

      d3.csv('/data_glad_peru.csv', function(data){
        this.visMain = new InsightsGladAlertsChart({
          el: chartEl,
          params: {
            data: data
          }
        });

        this._createLegend(legendEl, data);
      }.bind(this));
    },

    _renderCompareChart: function(el, url) {
      var el = this.el.querySelector(el);
      var chartEl = el.querySelector('.chart');
      var legendEl = el.querySelector('.legend');

      d3.csv(url, function(data){
        this.vis1 = new InsightsGladAlertsChart({
          el: chartEl,
          params: {
            data: data,
            compact: true,
            circleRadiusRange: [3, 6]
          }
        });

        this._createLegend(legendEl, data);
      }.bind(this));
    },

    _createLegend: function(el, data) {
      this.legends.push({
        element: el,
        data: data
      });

      this._renderLegend(el, data);
    },

    _renderLegend: function(el, data) {
      var current = _.filter(data, function(d) {
        return (d.week * 1) === this.currentStep;
      }.bind(this))[0];

      el.innerHTML = this.templateLegend({
        emissions: (current.cumulative_emissions * 1).toFixed(2),
        annual_budget: (current.emissions_target * 1).toFixed(2),
        alerts: current.alerts > 999 ? (current.alerts / 1000).toFixed(1) + 'k' : current.alerts
      });
    },

    _updateLegends: function(step) {
      if (this.currentStep !== step) {
        this.currentStep = step;
        this.legends.forEach(function(legend) {
          this._renderLegend(legend.element, legend.data);
        }.bind(this));
      }
    }
  });

  return InsightsGladAlerts;

});
