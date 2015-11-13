define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'widgets/models/IndicatorModel',
  'widgets/views/IndicatorView',
  'widgets/indicators/line/LineChart',
  'text!widgets/templates/indicators/line/linechart.handlebars',
  'text!widgets/templates/indicators/no-data.handlebars',
], function(d3, moment, _, Handlebars, IndicatorModel, IndicatorView, LineChart, Tpl, noDataTpl) {

  'use strict';

  var LineChartIndicator = IndicatorView.extend({

    template: Handlebars.compile(Tpl),
    noDataTemplate: Handlebars.compile(noDataTpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(setup) {
      this.constructor.__super__.initialize.apply(this, [setup]);

      this.tab = setup.tab;
      this.model = new IndicatorModel(setup.model);
      // Create model for compare indicator
      if(this.model.get('location_compare')) {
        this.modelCompare = new IndicatorModel(setup.model);
      }
      this.fetchIndicator(setup.data);
    },

    fetchIndicator: function(data) {
      // NEW
      var status = {
        promises: []
      };
      _.each(this.model.get('indicators'), _.bind(function(i) {
        var deferred = $.Deferred();
        new IndicatorModel({id: i.id})
            .fetch({
              data:this.setFetchParams(data)
            })
            .done(function(data){
              deferred.resolve(data);
            });
        status.promises.push(deferred);
      }, this))
      // Promises of each country resolved
      $.when.apply(null, status.promises).then(_.bind(function() {
        this.$el.removeClass('is-loading');
        var args = Array.prototype.slice.call(arguments);
        var values = _.groupBy(_.flatten(_.compact(_.map(args, function(i){
          return i.values;
        }))), 'indicator_id');
        var data = _.map(this.model.get('indicators'), function(i){
          i.data = values[i.id];
          return i;
        });
        this.model.set('data', data);
        this.render();
      }, this ));
    },

    render: function() {
      this.$el.html(this.template());
      this._drawGraph();
    },

    _drawGraph: function() {
      var keys = { x: 'year', y: 'value' };
      var parseDate = d3.time.format("%Y").parse;
      var $graphContainer = this.$el.find('.linechart-graph')[0];
      var data = _.map(this.model.get('data'), function(l) {
        return _.compact(_.map(l.data,_.bind(function(d){
          if (d && d.year && Number(d.year !== 0) && this.between(d.year,this.model.get('start_date'),this.model.get('end_date'),true)) {
            return {
              year: parseDate(d.year.toString()),
              value: (!isNaN(d.value)) ? d.value : 0
            };
          }
          return null;
        }, this )))
      }.bind(this));

      console.log(data);
      // if (!!data.length) {
      //   // Set range
      //   var arr = (this.model.get('location_compare')) ? _.union(this.model.get('data'), this.modelCompare.get('data')) : this.model.get('data');
      //   var range = [0, _.max(arr, function(o){return o.value;}).value];
      //   console.log(data);
      //   // var range = [_.min(arr, function(o){return o.value;}).value, _.max(arr, function(o){return o.value;}).value];
      //   this.chart = new LineChart({
      //     id: this.model.get('id'),
      //     el: $graphContainer,
      //     unit: this.model.get('unit'),
      //     data: data,
      //     range: range,
      //     slug: this.model.get('slug'),
      //     slug_compare: this.model.get('slug_compare'),
      //     sizing: {top: 10, right: 10, bottom: 20, left: 0},
      //     innerPadding: { top: 10, right: 10, bottom: 20, left: 50 },
      //     keys: keys
      //   });
      //   this.chart.render();
      //   this.changeAverage(data);

      // } else {
      //   this.$el.html(this.noDataTemplate({ classname: 'line'}));
      // }
    },

    changeAverage: function(data) {
      var average = _.reduce(data, function(memo, num) {
        return memo + num.value;
      }, 0) / data.length;
      this.tab.setAverage(average);
    },

    between: function(num, a, b, inclusive) {
      var min = Math.min(a, b),
          max = Math.max(a, b);
      return inclusive ? num >= min && num <= max : num > min && num < max;
    },

    destroy: function() {
      if (this.chart) {
       this.chart.destroy();
       this.chart = null;
      }
    },

    resize: function(){
      console.log('hello');
    }

  });

  return LineChartIndicator;

});
