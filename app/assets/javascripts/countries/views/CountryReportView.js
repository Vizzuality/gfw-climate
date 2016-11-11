define([
  'backbone',
  'mps',
  'countries/services/ReportService',
  'countries/views/report/SummaryChartView',
  'countries/views/report/HistoricalTrendChartView',
  'countries/views/report/PieChartView',
  'countries/views/report/SlidersView',
  'text!countries/templates/countryReport.handlebars',
], function(
  Backbone,
  mps,
  ReportService,
  SummaryChartView,
  HistoricalTrendChartView,
  PieChartView,
  SlidersView,
  tpl
) {
  'use strict';

  var CountryReportView = Backbone.View.extend({

    el: '#report',

    template: Handlebars.compile(tpl),

    status: new (Backbone.Model.extend()),

    defaults: {
      settings: {
        'reference_start_year': '2001',
        'reference_end_year': '2010',
        'monitor_start_year': '2011',
        'monitor_end_year': '2014',
        'thresh': '30',
        'below': 'false',
        'primary_forest': 'false',
        'exclude_plantations': 'false'
      }
    },

    initialize: function(params) {
      this.options = _.extend(this.defaults, params);
      this.indicatorsList = this.options.indicators;
      this.defaultSettings= this.options.settings;
      this.iso = this.options.iso;

      if (_.isEmpty(this.options.params)) {
        this._setDefaultParams();
      } else {
        this.status.clear({ silent: true }).set(this.options.params);
        this._getData();
      }
    },

    render: function() {
      var totalReference = Math.round(this.data.emissions.reference.average);
      var totalMonitoring = Math.round(this.data.emissions.monitor.average);
      var increase = Math.round(((totalMonitoring - totalReference) / totalReference) * 100);
      var hasIncreased = increase > -1;
      var factorAbovegroundBiomass = Math.round(this.data.emission_factors.aboveground);
      var factorBelowgroundBiomass = Math.round(this.data.emission_factors.belowground);
      var factorTotalEmission = Math.round(this.data.emission_factors.total);

      this.$el.removeClass('is-loading');
      this.$el.html(this.template({
        country: this.data.country,
        monitorStart: this.status.get('monitor_start_year'),
        monitorEnd: this.status.get('monitor_end_year'),
        referenceStart: this.status.get('reference_start_year'),
        referenceEnd: this.status.get('reference_end_year'),
        totalReference: totalReference,
        totalMonitoring: totalMonitoring,
        increase: increase,
        hasIncreased: hasIncreased,
        factorAbovegroundBiomass: factorAbovegroundBiomass,
        factorBelowgroundBiomass: factorBelowgroundBiomass ? factorBelowgroundBiomass : '',
        factorTotalEmission: factorTotalEmission
      }));

      this._initModules();
    },

    _setDefaultParams: function() {
      mps.publish('Router/change', [this.defaultSettings]);
      this.status.clear({ silent: true }).set(this.defaultSettings);
    },

    _getData: function() {
      this.status.set({
        iso: this.iso
      }, { silent: true });

      ReportService.get(this.status.toJSON())
        .then(function(data) {
          this.data =  data;
          this.render();
        }.bind(this));
    },

    _initModules: function() {
      this.sliders = new SlidersView()

      this.summaryChart = new SummaryChartView({
        data: _.clone(this.data.emissions)
      });

      this.historicalTrendChart = new HistoricalTrendChartView({
        el: '#historical-trend-chart',
        data: _.clone(this.data.forest_loss)
      });

      this.historicalLosstByProvinceChart = new PieChartView({
        el: '#historical-loss-province-chart',
        data: _.clone(this.data.provinces.forest_loss.reference),
        legendLabels: {
          name: 'Province',
          value: 'Loss (ha)'
        }
      });

      this.cStocksByProvinceChart = new PieChartView({
        el: '#c-stock-province-chart',
        data: _.clone(this.data.provinces.c_stocks),
        legendLabels: {
          name: 'Province',
          value: 'C Stocks'
        }
      });

      this.forestRelatedEmissionsChart = new HistoricalTrendChartView({
        el: '#forest-related-emissions-chart',
        data: _.clone(this.data.emissions)
      });
    }
  });

  return CountryReportView;
});
