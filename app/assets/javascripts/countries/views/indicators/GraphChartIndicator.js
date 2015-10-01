define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'countries/models/IndicatorsModel',
  'countries/views/show/IndicatorView',
  'countries/views/indicators/LineChartIndicator',
  'text!countries/templates/indicators/lineGraph.handlebars'
], function(d3, moment, _, Handlebars, IndicatorsModel, IndicatorView, LineChartIndicator, tpl) {

  'use strict';

  var GraphIndicator = IndicatorView.extend({

    el: '.graph-container',

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

    _drawGraph: function(values) {

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
            loss: d.value
          });
        }
      });

      //TODO fix el element.

      var lineChart = new LineChartIndicator({
        data: data,
        el: this.el,
        sizing: {top: 35, right: 20, bottom: 30, left: 10},
        innerPadding: { top: 25, right: 20, bottom: 0, left: 0 },
        keys: keys
      });

      lineChart.render();
    },

    render: function(ind) {
      this.$el.html(this.template);
      var self = this;

      //Here, we retrieve the data for the first option in tabs
      var data = this._getData(ind);

      $.when($, data).done(function() {
        self._drawGraph(data.responseJSON);
      });


      return this;
    }

  });

  return GraphIndicator;

});
