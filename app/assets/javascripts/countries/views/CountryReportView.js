define([
  'backbone',
  'mps',
  'countries/services/ReportService',
  'countries/views/report/SummaryChartView',
  'text!countries/templates/countryReport.handlebars',
], function(
  Backbone,
  mps,
  ReportService,
  SummaryChartView,
  tpl
) {
  'use strict';

  var CountryReportView = Backbone.View.extend({

    el: '#report',

    template: Handlebars.compile(tpl),

    defaults: {
      settings: {
        'thresh': 30
      },

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
          slug: 'abovegroundCDensity'
        },
        {
          id: 39,
          slug: 'belowgroundCDensity'
        },
        {
          id: 5,
          slug: 'abovegroundCStocks'
        },
        {
          id: 7,
          slug: 'belowgroundCStocks'
        }
      ]
    },

    initialize: function(params) {
      this.options = _.extend(this.defaults, params);
      this.indicatorsList = this.options.indicators;
      this.defaultSettings= this.options.settings;
      this.iso = this.options.iso;
      this.indicatorsData = [];

      if (_.isEmpty(this.options.params)) {
        this._setDefaultParams();
      } else {
        this.render();
      }
    },

    render: function() {
      this.$el.removeClass('is-loading');
      this.$el.html(this.template({}));

      this._getIndicators();
      this._initModules();
    },

    _setDefaultParams: function() {
      mps.publish('Router/change', [this.defaultSettings]);
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
        iso: this.iso
      };

      ReportService.get(params)
        .then(function(data) {
          this.indicatorsData[indicator.slug] = data.values;
          $promise.resolve();
        }.bind(this));

      return $promise.promise();
    },

    _initModules: function() {
      this.summaryChart = new SummaryChartView();
    }
  });

  return CountryReportView;
});
