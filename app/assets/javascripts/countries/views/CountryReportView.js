define([
  'backbone',
  'countries/services/ReportService',
  'text!countries/templates/countryReport.handlebars',
], function(
  Backbone,
  ReportService,
  tpl
) {
  'use strict';

  var CountryReportView = Backbone.View.extend({

    el: '#report',

    template: Handlebars.compile(tpl),

    defaults: {
      indicators: [
        {
          id: 1,
          slug: 'loss'
        },
        {
          id: 14,
          slug: 'emissions'
        },
        {
          id: 11,
          slug: 'aboveground'
        },
        {
          id: 39,
          slug: 'biomass'
        }
      ]
    },

    initialize: function(params) {
      this.indicatorsList = this.defaults.indicators;
      this.indicatorsData = [];
      this.render();
    },

    render: function() {
      this.$el.removeClass('is-loading');
      this.$el.html(this.template({}));

      this._getIndicators();
    },

    _getIndicators: function() {
      var promises = [];
      this.indicatorsData = [];

      for (var x = 0; x < this.indicatorsList.length; x++) {
        promises.push(this._getIndicatorRequest(this.indicatorsList[x]));
      }

      $.when.apply($, promises).then(function(schemas) {
        console.log(this.indicatorsData);
      }.bind(this), function(e) {
        console.log('Error');
      });
    },

    _getIndicatorRequest: function(indicator) {
      var $promise = $.Deferred();
      var params = {
        indicator: indicator.id,
        thresh: 30,
        iso: 'BRA',
        id_1: '',
        area: ''
      };

      ReportService.get(params)
        .then(function(data) {
          this.indicatorsData[indicator.slug] = data.values;
          $promise.resolve();
        }.bind(this));

      return $promise.promise();
    }
  });

  return CountryReportView;
});
