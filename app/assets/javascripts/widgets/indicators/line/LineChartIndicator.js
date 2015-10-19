define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'widgets/models/IndicatorModel',
  'countries/models/CountryModel',
  'widgets/views/IndicatorView',
  'widgets/indicators/line/LineChart',
  'text!widgets/templates/indicators/line/linechart.handlebars'
], function(d3, moment, _, Handlebars, IndicatorModel, CountryModel, IndicatorView, LineChart, tpl) {

  'use strict';

  var LineChartIndicator = IndicatorView.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(options) {
      this.constructor.__super__.initialize.apply(this);

      this.countryModel = CountryModel;
      this.model = new IndicatorModel({
        country: this.countryModel.get('iso'),
        id: options.indicator.id
      });

      this.model.fetch().done(function() {
        this.render();
        this._drawGraph(this.model.toJSON(), this.model.get('id'));
      }.bind(this));
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

      _.map(values, function(d) {
        if (d.year && Number(d.year !== 0)) {

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
    render: function() {
      this.$el.html(this.template({ graphicId : this.model.get('id') }));
      return this;
    }

  });

  return LineChartIndicator;

});
