define(
  [
    'd3',
    'moment',
    'underscore',
    'handlebars',
    'widgets/models/IndicatorModel',
    'widgets/views/IndicatorView',
    'text!widgets/templates/indicators/list/listchart.handlebars'
  ],
  function(d3, moment, _, Handlebars, IndicatorModel, IndicatorView, Tpl) {
    'use strict';

    var MultiLineChartIndicator = IndicatorView.extend({
      template: Handlebars.compile(Tpl),

      events: function() {
        return _.extend({}, IndicatorView.prototype.events, {});
      },

      initialize: function(setup) {
        this.constructor.__super__.initialize.apply(this, [setup]);

        this.tab = setup.tab;

        // CeateModel
        this.model = new (Backbone.Model.extend({ defaults: setup.model }))();

        // Set Params
        var params = _.extend({}, setup.data, {});

        $.when.apply(null, this.getPromises(params)).then(
          _.bind(function() {
            this.$el.removeClass('is-loading');
            this.render();
          }, this)
        );
      },

      fetchIndicator: function(params, type, slugw) {
        var r = new $.Deferred();
        var promises = [];

        // Fetch all the indicators of this tab
        _.each(
          this.model.get('indicators'),
          _.bind(function(i) {
            var deferred = new $.Deferred();
            new IndicatorModel({ id: i.id })
              .fetch({
                data: this.setFetchParams(params)
              })
              .done(function(data) {
                deferred.resolve(data);
              });
            promises.push(deferred.promise());
          }, this)
        );

        // Fetch indicators complete!!
        $.when.apply(null, promises).then(
          _.bind(function() {
            var values = _.flatten(
              _.pluck(Array.prototype.slice.call(arguments), 'values')
            );
            this.model.set(type, values);
            r.resolve();
          }, this)
        );

        return r.promise();
      },

      render: function() {
        this.$el.html(this.template(this.parseData()));
      },

      parseData: function() {
        return { list: _.pluck(this.model.get('data'), 'text_value') };
      },

      // Helpers for parse data
      getPromises: function(params, paramsCompare) {
        this.$el.addClass('is-loading');
        var slugw = this.model.get('slugw');
        return [this.fetchIndicator(params, 'data', slugw)];
      },

      destroy: function() {
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
      }
    });

    return MultiLineChartIndicator;
  }
);
