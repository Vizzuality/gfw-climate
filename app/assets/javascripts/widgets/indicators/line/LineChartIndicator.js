define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'widgets/models/IndicatorModel',
  'widgets/views/IndicatorView',
  'widgets/indicators/line/LineChart',
  'text!widgets/templates/indicators/no-data.handlebars',
], function(d3, moment, _, Handlebars, IndicatorModel, IndicatorView, LineChart, noDataTpl) {

  'use strict';

  var LineChartIndicator = IndicatorView.extend({

    template: Handlebars.compile(noDataTpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(setup) {
      this.constructor.__super__.initialize.apply(this);
      // Enable params when we have API data
      this.model = new IndicatorModel(setup.model);

      // Fetch values
      this.$el.addClass('is-loading');
      this.model.fetch({ data: setup.data }).done(function() {
        this._drawGraph();
        this.$el.removeClass('is-loading');
      }.bind(this));
    },

    _drawGraph: function() {
      var keys = { x: 'year', y: 'value' };
      var parseDate = d3.time.format("%Y").parse;
      var $graphContainer = this.$el[0];
      var data = _.compact(_.map(this.model.get('data'), function(d) {
        if (d && d.year && Number(d.year !== 0) && this.between(d.year,this.model.get('start_date'),this.model.get('end_date'),true)) {
          return {
            year: parseDate(d.year.toString()),
            value: d.value
          };
        }
        return null;
      }.bind(this)));

      if (!!data.length) {
        var lineChart = new LineChart({
          el: $graphContainer,
          unit: this.model.get('unit'),
          data: data,
          sizing: {top: 0, right: 0, bottom: 25, left: 0},
          innerPadding: { top: 10, right: 15, bottom: 0, left: 50 },
          keys: keys
        });

        lineChart.render();
      } else {
        this.$el.html(this.template());
      }

    },

    between: function(num, a, b, inclusive) {
      var min = Math.min(a, b),
          max = Math.max(a, b);
      return inclusive ? num >= min && num <= max : num > min && num < max;
    }

  });

  return LineChartIndicator;

});
