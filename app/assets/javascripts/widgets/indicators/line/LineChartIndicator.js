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
      this.model = new IndicatorModel({
        id: setup.id,
        iso: setup.iso
      });

      this.model.fetch({ data: setup.data}).done(function() {
        this._drawGraph();
      }.bind(this));
    },

    _drawGraph: function() {
      var keys = { x: 'year', y: 'value' };
      var parseDate = d3.time.format("%Y").parse;
      var $graphContainer = this.$el[0];
      var data = _.compact(_.map(this.model.get('data'), function(d) {
        if (d && d.year && Number(d.year !== 0)) {
          return {
            year: parseDate(d.year.toString()),
            value: ~~d.value
          };
        }
        return null;
      }));

      if (!!data.length) {
        var lineChart = new LineChart({
          graphicId: this.model.get('id'),
          data: data,
          el: $graphContainer,
          sizing: {top: 0, right: 0, bottom: 20, left: 0},
          innerPadding: { top: 0, right: 15, bottom: 0, left: 30 },
          keys: keys
        });

        lineChart.render();
      } else {
        this.$el.html(this.template());
      }

    },

  });

  return LineChartIndicator;

});
