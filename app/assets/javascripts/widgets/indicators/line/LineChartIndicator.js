define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'widgets/models/IndicatorModel',
  'widgets/views/IndicatorView',
  'widgets/indicators/line/LineChart',
  'text!widgets/templates/indicators/line/linechart.handlebars'
], function(d3, moment, _, Handlebars, IndicatorModel, IndicatorView, LineChart, tpl) {

  'use strict';

  var LineChartIndicator = IndicatorView.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(options) {
      this.constructor.__super__.initialize.apply(this);
      // Enable params when we have API data
      this.model = new IndicatorModel({
        id: options.id,
        iso: options.iso
      });

      this.model.fetch().done(function() {
        this.render();
        this._drawGraph();
      }.bind(this));
    },

    _drawGraph: function() {
      var keys = { x: 'year', y: 'value' };
      var parseDate = d3.time.format("%Y").parse;
      var $graphContainer = this.$el.find('#graphic-' + this.model.get('id'))[0];
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
      }

    },

    render: function() {
      this.$el.html(this.template({
        graphicId: 'graphic-'+this.model.get('id')
      }));
      return this;
    }

  });

  return LineChartIndicator;

});
