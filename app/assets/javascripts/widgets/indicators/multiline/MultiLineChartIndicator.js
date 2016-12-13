define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'widgets/models/IndicatorModel',
  'widgets/views/IndicatorView',
  'widgets/indicators/multiline/MultiLineChart',
  'text!widgets/templates/indicators/line/linechart.handlebars',
  'text!widgets/templates/indicators/line/linechart-legend.handlebars',
  'text!widgets/templates/indicators/no-data.handlebars',
], function(d3, moment, _, Handlebars, IndicatorModel, IndicatorView, MultiLineChart, Tpl, legendTpl, noDataTpl) {

  'use strict';

  var MultiLineChartIndicator = IndicatorView.extend({

    template: Handlebars.compile(Tpl),
    legendTemplate: Handlebars.compile(legendTpl),
    noDataTemplate: Handlebars.compile(noDataTpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function(setup) {
      this.constructor.__super__.initialize.apply(this, [setup]);

      this.tab = setup.tab;

      // CreateModel
      this.model = new (Backbone.Model.extend({ defaults: setup.model}));

      // Set Params
      var params = _.extend({}, setup.data);
      var paramsCompare = _.extend({},setup.data);

      if (this.model.get('location_compare')) {
        paramsCompare = _.extend(paramsCompare, { location: this.model.get('location_compare') });
      }

      $.when.apply(null, this.getPromises(params,paramsCompare)).then(_.bind(function() {
        this.$el.removeClass('is-loading');
        this.render();
      }, this));

    },

    fetchIndicator: function(params, type, slugw) {
      var r = new $.Deferred();
      var promises = [];

      // Fetch all the indicators of this tab
      _.each(this.model.get('indicators'), _.bind(function(i) {
        var deferred = new $.Deferred();
        new IndicatorModel({id: i.id})
            .fetch({
              data:this.setFetchParams(params)
            })
            .done(function(data){
              deferred.resolve(data);
            });
        promises.push(deferred.promise());
      }, this));

      // Fetch indicators complete!!
      $.when.apply(null, promises).then(_.bind(function() {
        var values = _.groupBy(_.flatten(_.pluck(Array.prototype.slice.call(arguments),'values')),'indicator_id');
        // if compare data exists, we will set 'data' and 'data_compare'
        this.model.set(type, values);
        r.resolve();
      }, this ));

      return r.promise();
    },

    render: function() {
      this.$el.html(this.template());
      this.cacheVars();
      this._drawGraph();
    },

    cacheVars: function() {
      this.$legend = this.$el.find('.linechart-legend');
    },

    _drawGraph: function() {
      var $graphContainer = this.$el.find('.linechart-graph')[0];
      // Set range
      if (this.model.get('lock')) {
        var data = this.getData('data'),
            dataCompare = this.getData('data_compare'),
            rangeX = this.getRangeX(data,dataCompare),
            rangeY = this.getRangeY(data,dataCompare);
      } else {
        var data = this.getData('data'),
            rangeX = this.getRangeX(data),
            rangeY = this.getRangeY(data);
      }

      // To show message when this widgets have negative vaules.
      var widgetId = _.pluck(this.model.get('indicators'), 'id').join('');
      if ( widgetId == 15 || widgetId == 16 ) {
        this._checkNegativeValues(data);
      }

      if (this.getDataLength(data)) {
        // Initialize Line Chart
        this.chart = new MultiLineChart({
          parent: this,
          el: $graphContainer,
          id: _.pluck(this.model.get('indicators'), 'id').join(''),
          data: data,
          indicators: this.model.get('indicators'),
          unit: this.model.get('unit'),
          unitname: this.model.get('unitname'),
          rangeX: rangeX,
          rangeY: rangeY,
          lock: this.model.get('lock'),
          slugw: this.model.get('slugw'),
          slugw_compare: this.model.get('slugw_compare'),
          sizing: {top: 10, right: 10, bottom: 20, left: 0},
          innerPadding: { top: 15, right: 10, bottom: 20, left: 50 },
          keys: { x: 'year', y: 'value' }
        });
        this.chart.render();
      } else {
        this.$el.html(this.noDataTemplate({ classname: 'line'}));
      }
    },

    _checkNegativeValues: function(data) {
      for(var key in data[0]) {
        var value = data[0][key].value;
        if ( value < 0 ) {
          this.$('.fao-note').removeClass('is-hidden');
          break
        }
      }
    },

    _drawAverage: function(averages) {
      this.tab.setAverage(averages);
    },

    _drawLegend: function(legend) {
      this.$legend.html(this.legendTemplate({ legend: legend }));
    },

    // Helpers for parse data
    getPromises: function(params,paramsCompare) {
      this.$el.addClass('is-loading');
      var slugw = this.model.get('slugw');
      var slugw_compare = this.model.get('slugw_compare');
      if(!!this.model.get('lock')) {
        return [this.fetchIndicator(params, 'data',slugw),this.fetchIndicator(paramsCompare, 'data_compare',slugw_compare)]
      } else {
        return [this.fetchIndicator(params, 'data',slugw)]
      }

    },

    // Helpers for parse data
    // As you see, the data now will be filtered by date, the function between
    getData: function(type) {
      var parseDate = d3.time.format("%Y").parse;
      return _.map(this.model.get(type), _.bind(function(indicator_values) {
        return _.compact(_.map(indicator_values, _.bind(function(d){
          if (d && d.year && Number(d.year !== 0) && this.between(d.year,this.model.get('start_date'),this.model.get('end_date'),true)){
            return {
              year: parseDate(d.year.toString()),
              value: (!isNaN(d.value)) ? d.value : 0
            };
          }
          return null;
        }, this )));
      }, this ));
    },

    // get the range of years;
    getRangeX: function() {
      var values = _.flatten(_.union(Array.prototype.slice.call(arguments)));
      var min = _.min(values, function(o){return o.year;}).year;
      var max = _.max(values, function(o){return o.year;}).year;
      return [min,max];
    },

    // get the range of values;
    getRangeY: function() {
      var values = _.flatten(_.union(Array.prototype.slice.call(arguments)));
      var min = _.min(values, function(o){return o.value;}).value;
      var max = _.max(values, function(o){return o.value;}).value;
      // We add the 20º part of the max and the min value to prevent the y-axis disappear,
      return [min - Math.abs(min/20), max + Math.abs(max/20)];
    },

    getDataLength: function() {
      return !!_.flatten(_.union(Array.prototype.slice.call(arguments))).length;
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

      this.stopListening();
      this.remove();
    },

  });

  return MultiLineChartIndicator;

});
