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

    status: new (Backbone.Model.extend()),

    defaults: {
      settings: {
        'reference_start_year': '2001',
        'reference_end_year': '2010',
        'monitor_start_year': '2011',
        'monitor_end_year': '2014',
        'thresh': '30',
        'above': 'true',
        'below': 'true',
        'primary_forest': 'false',
        'tree_plantations': 'false'
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
      var totalReference = this.data.emissions.reference.total;
      var totalMonitoring = this.data.emissions.monitor.total;
      var increase = Math.round(((totalMonitoring - totalReference) / totalReference) * 100);
      var hasIncreased = increase > -1;

      this.$el.removeClass('is-loading');
      this.$el.html(this.template({
        country: this.data.country,
        monitorStart: this.status.get('monitor_start_year'),
        monitorEnd: this.status.get('monitor_end_year'),
        referenceStart: this.status.get('reference_start_year'),
        referenceEnd: this.status.get('reference_end_year'),
        totalReference: totalReference.toFixed(2),
        totalMonitoring: totalMonitoring.toFixed(2),
        increase: increase,
        hasIncreased: hasIncreased
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
      this.summaryChart = new SummaryChartView({
        data: _.clone(this.data.emissions)
      });
    }
  });

  return CountryReportView;
});
