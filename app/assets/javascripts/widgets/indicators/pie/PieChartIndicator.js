define([
  'underscore',
  'd3',
  'handlebars',
  'widgets/views/IndicatorView',
  'widgets/models/IndicatorModel',
  'widgets/indicators/pie/PieChart',
  'text!widgets/templates/indicators/pie/piechart.handlebars',
], function(_, d3, Handleabars, IndicatorView, IndicatorModel, PieChart, tpl) {

  'use strict';

  var PieChartIndicator = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(setup) {
      this.constructor.__super__.initialize.apply(this);

      this.$el.addClass('is-loading');

      this.model = new (Backbone.Model.extend({
        defaults: setup.model
      }));
      this.fetchData(setup);
    },

    fetchData: function(setup) {
      var status = {
        promises: []
      };
      _.each(this.model.get('indicators'), _.bind(function(i) {
        var deferred = $.Deferred();
        new IndicatorModel({id: i.id}).fetch({data:setup.data}).done(function(data){ deferred.resolve(data);});
        status.promises.push(deferred);
      }, this))

      // Promises of each country resolved
      $.when.apply(null, status.promises).then(_.bind(function() {
        var args = Array.prototype.slice.call(arguments);
        var values = _.groupBy(_.map(args, function(i){
          return i.values[0];
        }),'indicator_id');

        var data = _.map(this.model.get('indicators'), function(i){
          i.country_name = values[i.id][0].country_name
          i.data = values[i.id];
          return i;
        })
        this.model.set('data', data);
        this.$el.removeClass('is-loading');
        this.render();
      }, this ));
    },


    render: function() {
      this.$el.html(this.template(this.parseData()));
      this._drawGraph();
      return this;
    },

    parseData: function() {
      var parseValues = d3.format(".3s");
      return {
        country_name: this.model.get('data')[0].country_name,
        total: parseValues(_.findWhere(this.model.get('data'), {id:8}).data[0].value) + ' tons'
      }
    },

    _drawGraph: function() {
      var pieChart = new PieChart({
        el: this.$el.find('.pie-graph')[0],
        data: [{"name": "Aboveground","value": 32},{"name": "Belowground","value": 68}],
        sizing: {top: 0, right: 0, bottom: 0, left: 0},
        innerPadding: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      pieChart.render();
    },

  });

  return PieChartIndicator;

});
