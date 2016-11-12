define([
  'backbone',
  'mps',
  'nouislider',
  'countries/services/ReportService',
  'countries/views/report/SummaryChartView',
  'countries/views/report/HistoricalTrendChartView',
  'countries/views/report/PieChartView',
  'text!countries/templates/countryReport.handlebars',
], function(
  Backbone,
  mps,
  nouislider,
  ReportService,
  SummaryChartView,
  HistoricalTrendChartView,
  PieChartView,
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
        'exclude_plantations': 'false',
        'co2': 'false'
      }
    },

    events: {
      'change .js-report-param' : '_handleReportParamsChange',
      'click #update-report-btn' : '_updateReport',
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
        below: this.status.get('below') === 'true',
        co2: this.status.get('co2') === 'true' ,
        totalReference: totalReference,
        totalMonitoring: totalMonitoring,
        increase: increase,
        hasIncreased: hasIncreased,
        factorAbovegroundBiomass: factorAbovegroundBiomass,
        factorBelowgroundBiomass: factorBelowgroundBiomass ? factorBelowgroundBiomass : '',
        factorTotalEmission: factorTotalEmission
      }));

      this.updateBox = this.$('.updates-box');
      this._initModules();
    },

    _setDefaultParams: function() {
      mps.publish('Router/change', [this.defaultSettings]);
      this.status.clear({ silent: true }).set(this.defaultSettings);
    },

    _updateParams: function() {
      mps.publish('Router/change', [this.status.attributes]);
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
      this._initSlides();

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
    },

    _initSlides: function() {
      this.heightSlider = document.getElementById('height-slider');
      nouislider.create(this.heightSlider, {
        start: 5,
        step: 1,
        animate: true,
        orientation: 'vertical',
        connect: [false, true],
        tooltips: {
      	  to: function ( value ) {
      		  return value + 'm';
      	  }
      	},
      	range: {
      		min: 0,
      		max: 10
      	}
      });
      this.heightSlider.setAttribute('disabled', true);

      this.crownSlider = document.getElementById('crown-cover-slider');
      nouislider.create(this.crownSlider, {
        start: this.status.get('thresh'),
        step: 10,
      	animate: true,
        connect: [false, true],
        tooltips: {
      	  to: function ( value ) {
      		  return '> ' + (100 - value) + '%';
      	  }
      	},
      	range: {
      		min: 0,
      		max: 100
      	}
      });
      this.crownSlider.noUiSlider.on('change', function(value){
        this.status.set({
          thresh: parseInt(value[0])
        }, { silent: true });
        this.updateBox.removeClass('-hide');
      }.bind(this));
    },

    _handleReportParamsChange: function(e) {
      if (this.defaults.settings[e.target.name]) {
        var status = {};
        if (e.target.type === 'checkbox') {
          status[e.target.name] = e.target.checked;
        } else {
          status[e.target.name] = e.target.value;
        }
        this.status.set(status, { silent: true });
      }

      if (this.updateBox) {
        this._checkInputsDiff()
        ? this.updateBox.removeClass('-hide')
        : this.updateBox.addClass('');
      }
    },

    _checkInputsDiff:function() {
      //TODO: remove the update button if there aren't inputs changes
      return true;
    },

    _updateReport:function() {
      this._remove();
      this.$el.addClass('is-loading');
      this._updateParams();
      this._getData();
    },

    _remove() {
      this.$el.empty();
      this.summaryChart && this.summaryChart.remove();
      this.historicalTrendChart && this.historicalTrendChart.remove();
      this.historicalLosstByProvinceChart && this.historicalLosstByProvinceChart.remove();
      this.cStocksByProvinceChart && this.cStocksByProvinceChart.remove();
      this.forestRelatedEmissionsChart && this.forestRelatedEmissionsChart.remove();
    }
  });

  return CountryReportView;
});
