define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'countries/models/IndicatorsModel',
  'countries/views/show/IndicatorView',
  'countries/views/indicators/LineChart',
  'text!countries/templates/indicators/LineGraphIndicator.handlebars'
], function(d3, moment, _, Handlebars, IndicatorsModel, IndicatorView, LineChart, tpl) {

  'use strict';

  var LineChartIndicator = IndicatorView.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.model = IndicatorsModel;
    },

    _getData: function(ind) {
      // API call
      return this.model.getByParams(ind);
    },

    _drawGraph: function(values, graphicId) {
      //Fixear keys. No magic numbers
      var keys = { x: 'year', y: 'loss' };
      var parseDate = d3.time.format("%Y").parse;
      var type = function(d) {
        d[keys.x] = parseDate(d[keys.x]);
        d[keys.y] = +d[keys.y];
        return d;
      }
      var data = [];

      values.values.forEach(function(d) {
        if (Number(d.year !== 0)) {

          var n = d.year.toString();

          data.push({
            year: parseDate(n),
            loss: ~~d.value
          });
        }
      });

      var graphContainer = this.$el.find('#' + graphicId + '.content')[0];

      var lineChart = new LineChart({
        graphcId: graphicId,
        data: data,
        el: graphContainer,
        sizing: {top: 0, right: 0, bottom: 20, left: 0},
        innerPadding: { top: 0, right: 15, bottom: 0, left: 30 },
        keys: keys
      });

      lineChart.render();
    },

    //When we will implement tabs functionality, we can take the 'ind' value
    //from the tab element and give it to this function.
    render: function(ind, graphicId) {
      this.$el.html(this.template({ 'graphicId' : graphicId }));
      var self = this;

      //Here, we retrieve the data for the first option in tabs
      var data = this._getData(ind);

      $.when($, data).done(function() {
        self._drawGraph(data.responseJSON, graphicId);
      });

      return this;
    }

  });

  return LineChartIndicator;

});
