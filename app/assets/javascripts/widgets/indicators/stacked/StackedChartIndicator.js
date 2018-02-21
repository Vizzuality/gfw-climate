define([
  'backbone',
  'underscore',
  'd3',
  'handlebars',
  'widgets/views/IndicatorView',
  'widgets/models/IndicatorModel',
  'widgets/indicators/stacked/StackedChart',
  'text!widgets/templates/indicators/no-data.handlebars'
], function (Backbone, _, d3, Handlebars, IndicatorView, IndicatorModel, StackedChart, noDataTpl) {
  'use strict';

  var StackedChartIndicator = IndicatorView.extend({

    templates: {
      'noData': Handlebars.compile(noDataTpl)
    },

    events: function () {
      return _.extend({}, IndicatorView.prototype.events, {
        'change .section': 'changeSection'
      });
    },

    initialize: function (setup) {
      this.constructor.__super__.initialize.apply(this, [setup]);

      this.$el.addClass('is-loading');
      this.model = new (Backbone.Model.extend({
        defaults: setup.model
      }));
      this.fetchData(setup);
    },

    fetchData: function (setup) {
      var status = {
        promises: []
      };
      _.each(this.model.get('indicators'), _.bind(function (i) {
        var deferred = $.Deferred();
        new IndicatorModel({ id: i.id })
          .fetch({
            data: this.setFetchParams(setup.data)
          })
          .done(function (data) {
            deferred.resolve(data);
          });
        status.promises.push(deferred);
      }, this));

      // Promises of each country resolved
      $.when.apply(null, status.promises).then(_.bind(function () {
        this.$el.removeClass('is-loading');
        var args = Array.prototype.slice.call(arguments);
        var values = _.compact(_.map(args, function (i) {
          return i.values[0];
        }));

        if (!!values.length) {
          values = _.groupBy(values, 'indicator_id');

          var filtered = _.filter(this.model.get('indicators'), function(i){
            return values[i.id] && values[i.id][0]
          });
          var data = _.map(filtered, function (i) {
            var aux = values[i.id][0];
            var displayName = '';
            if (aux) {
              displayName = aux.id_1 ? aux.sub_nat_name : // eslint-disable-line
              (aux.boundary_id !== 1 ? aux.boundary_name : aux.country_name);
            }
            i.location_name = displayName;
            i.data = values[i.id];
            return i;
          });
          this.model.set('data', data);
          this.render();
        } else {
          this.$el.html(this.templates.noData({ classname: 'pie' }));
        }
      }, this));
    },

    render: function () {
      this.$el.html('<div id="stacked-graph" class="stacked-graph"></div>');
      this.cacheVars();
      this.setStatusValues();
      this.drawGraph();
      return this;
    },

    parseData: function () {
      var totalVal = _.findWhere(this.model.get('data'), { type: 'total' }).data[0].value;
      var shortened = d3.format(',.0f')(totalVal);
      var scientific = d3.format('.3s')(totalVal);
      return {
        sectionswitch: this.model.get('sectionswitch'),
        location_name: this.model.get('data')[0].location_name,
        total: totalVal > 1000 ? scientific : shortened,
        millionsTotal: shortened
      };
    },

    cacheVars: function () {
      this.$section = this.$el.find('.section');
      this.$section_name = this.$el.find('.section-name');
    },

    setStatusValues: function () {
      var t = this.model.toJSON();
      if (!!t.section) {
        this.$section.val(t.section);
        this.$section_name.text(t.section);
      }
    },

    // SELECT
    changeSection: function (e) {
      this.$section_name.text($(e.currentTarget).val());
    },

    // GRAPH
    drawGraph: function () {
      var data = this.getGraphData();
      var rangeX = this.getRangeX(data);
      var rangeY = this.getRangeY(data);
      var indicators = this.model.get('indicators');

      this.stackedChart = new StackedChart({
        parent: this,
        el: this.$el.find('#stacked-graph')[0],
        id: _.pluck(indicators, 'id').join(''),
        data: data,
        indicators: indicators,
        unit: this.model.get('unit'),
        unitname: this.model.get('unitname'),
        rangeX: rangeX,
        rangeY: rangeY,
        lock: this.model.get('lock'),
        sizing: {top: 10, right: 10, bottom: 20, left: 0},
        innerPadding: { top: 15, right: 10, bottom: 20, left: 50 },
        keys: { x: 'year', y: 'value' }
      });
      this.stackedChart.render();
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

    getGraphData: function () {
      var parseDate = d3.time.format("%Y").parse;
      var stackedIndicators = _.where(this.model.get('data'), { type: 'stacked' });
      return _.map(stackedIndicators, function (indicator) {
        return _.map(indicator.data, function (data) {
          return {
            year: parseDate(data.year.toString()),
            value: data.value
          };
        })
      });
    },

  });

  return StackedChartIndicator;
});
