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
      // console.log(this.el);

      var container = $('#' + id + '.country-widget .content')[0];
      console.log($('#' + id + '.country-widget .content'))

      var lineChart = new LineChartIndicator({
        data: data,
        el: this.el,
        sizing: {top: 0, right: 0, bottom: 20, left: 0},
        innerPadding: { top: 0, right: 15, bottom: 0, left: 30 },
        keys: keys
      });

      lineChart.render();
    },

    //When we will implement tabs functionality, we can take the 'ind' value
    //from the tab element and give it to this function.
    render: function(ind) {
      //console.log(ind)
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
