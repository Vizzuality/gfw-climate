define([
  'backbone',
  'mps',
  'nouislider',
  'countries/services/ReportService',
  'countries/views/report/SummaryChartView',
  'countries/views/report/HistoricalTrendChartView',
  'countries/views/report/PieChartView',
  'countries/views/report/ProvincesTopChartView',
  'countries/views/report/CountryGeoView',
  'text!countries/templates/countryReport.handlebars',
], function(
  Backbone,
  mps,
  nouislider,
  ReportService,
  SummaryChartView,
  HistoricalTrendChartView,
  PieChartView,
  ProvincesTopChartView,
  CountryGeoView,
  tpl
) {
  'use strict';

  var CARTO_ENDPOINT = 'https://wri-01.cartodb.com/api/v2/sql';

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
        'co2': 'true'
      },
      minYear: 2001,
      maxYear: 2014
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

    _cache: function() {
      this.yearSelector = this.el.querySelector('.js-year-selector');
      this.yearSelectorReference = this.el.querySelector('.js-reference-slider');
      this.yearSelectorMonitor = this.el.querySelector('.js-monitor-slider');
    },

    render: function() {
      var totalReference = Math.round(this.data.emissions.reference.average);
      var totalMonitoring = Math.round(this.data.emissions.monitor.average);
      var increase = Math.round(((totalMonitoring - totalReference) / totalReference) * 100);
      var increaseDisplay = Math.abs(increase);
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
        increaseDisplay: increaseDisplay,
        hasIncreased: hasIncreased,
        factorAbovegroundBiomass: factorAbovegroundBiomass,
        factorBelowgroundBiomass: factorBelowgroundBiomass ? factorBelowgroundBiomass : '',
        factorTotalEmission: factorTotalEmission,
        co2EmissionsByProvinces: this.co2EmissionsByProvinceData
      }));

      this.updateBox = this.$('.updates-box');
      this._cache();
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
          this._getProvinceEmissionsData();
        }.bind(this));
    },

    _getProvinceEmissionsData: function() {
      var indicator = 14;
      $.when(this._getProvincesData(indicator))
        .then(function(data) {
          this.co2EmissionsByProvinceData = data.rows;
          this.render();
        }.bind(this));
    },

    _initModules: function() {
      this._initSlides();

      this.summaryChart = new SummaryChartView({
        data: this.data.emissions
      });

      this.historicalTrendChart = new HistoricalTrendChartView({
        el: '#historical-trend-chart',
        data: this.data.forest_loss
      });

      this._forestLossByProvince();

      this.co2EmissionsByProvinceChart = new ProvincesTopChartView({
        el: '#co2-emissions-province-chart',
        data: this.co2EmissionsByProvinceData,
        customLabel: 'Mt CO2/yr'
      });

      this.forestRelatedEmissionsChart = new HistoricalTrendChartView({
        el: '#forest-related-emissions-chart',
        data: this.data.emissions,
        customLabel: 'Emissions (Mt CO2/yr)'
      });

      this.countryGeo = new CountryGeoView({
        el: '#report-country-geo',
        iso: this.iso,
        country: this.data.country,
        ha: this.data.area
      })
    },

    _initSlides: function() {
      this._initReferenceSlider();
      this._initMonitorSlider();
      this._initHeightSlider();
      this._initCrownSlider();
    },

    _initReferenceSlider: function() {
      this.referenceSlider = document.getElementById('reference-slider');
      var startYear = parseInt(this.status.get('reference_start_year'), 10);
      var endYear = parseInt(this.status.get('reference_end_year'), 10);

      this._setSliderWidth('reference');

      nouislider.create(this.referenceSlider, {
        start: [startYear, endYear],
      	animate: true,
        connect: true,
        margin: 1,
        step: 1,
      	range: {
          min: this.defaults.minYear,
          max: endYear
      	},
        pips: {
          mode: 'steps',
          stepped: false,
          density: 1
        }
      });

      this.referenceSlider.noUiSlider.on('slide', function(value) {
        var start = parseInt(value[0], 10);
        var end = parseInt(value[1], 10);
        var startMonitor = end + 1;

        this.status.set({
          reference_start_year: start.toString(),
          reference_end_year: end.toString(),
          monitor_start_year: startMonitor.toString()
        }, { silent: true });
      }.bind(this));

      this.referenceSlider.noUiSlider.on('change', function(value) {
        this.updateBox.removeClass('-hide');
        this.referenceSlider.noUiSlider.destroy();
        this.monitorSlider.noUiSlider.destroy();
        this._initReferenceSlider();
        this._initMonitorSlider();
      }.bind(this));
    },

    _initMonitorSlider: function() {
      this.monitorSlider = document.getElementById('monitor-slider');
      var startYear = parseInt(this.status.get('monitor_start_year'), 10);
      var endYear = parseInt(this.status.get('monitor_end_year'), 10);

      this._setSliderWidth('monitor');

      nouislider.create(this.monitorSlider, {
        start: [startYear, endYear],
      	animate: true,
        connect: true,
        margin: 1,
        step: 1,
      	range: {
          min: startYear,
          max: this.defaults.maxYear
      	},
        pips: {
          mode: 'steps',
          stepped: false,
          density: 1
        }
      });

      this.monitorSlider.noUiSlider.on('slide', function(value) {
        var start = parseInt(value[0], 10);
        var end = parseInt(value[1], 10);
        var endReference = start - 1;

        this.status.set({
          monitor_start_year: start.toString(),
          monitor_end_year: end.toString(),
          reference_end_year: endReference.toString()
        }, { silent: true });
      }.bind(this));

      this.monitorSlider.noUiSlider.on('change', function(value) {
        this.updateBox.removeClass('-hide');
        this.referenceSlider.noUiSlider.destroy();
        this.monitorSlider.noUiSlider.destroy();
        this._initReferenceSlider();
        this._initMonitorSlider();
      }.bind(this));
    },

    _setSliderWidth: function (type) {
      var totalYears = this.defaults.maxYear - this.defaults.minYear;
      var contentWidth = this.yearSelector.clientWidth;

      if (type === 'reference') {
        var numYears = this.status.get('reference_end_year') -
          this.defaults.minYear;

        var width = (numYears * contentWidth) / 100;
        this.yearSelectorReference.style.width = width + '%';
      } else if (type === 'monitor') {
        var numYears = this.defaults.maxYear -
          this.status.get('monitor_start_year');

        var width = (numYears * contentWidth) / 100;
        this.yearSelectorMonitor.style.width = width + '%';
      }
    },

    _initHeightSlider: function() {
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
    },

    _initCrownSlider: function() {
      this.crownSlider = document.getElementById('crown-cover-slider');
      nouislider.create(this.crownSlider, {
        start: this.status.get('thresh'),
      	animate: true,
        connect: [false, true],
        tooltips: {
      	  to: function ( value ) {
      		  return '> ' + value + '%';
      	  }
      	},
        snap: true,
      	range: {
          min: 10,
          '15%': 15,
          '20%': 20,
          '25%': 25,
          '30%': 30,
          '50%': 50,
          max: 75
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
      window.scrollTo(0, 0);
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
    },

    _forestLossByProvince: function() {
      var indicator = 1;
      $.when(this._getProvincesData(indicator))
        .then(function(data) {
          this.forestLossByProvinceChart = new ProvincesTopChartView({
            el: '#forest-loss-province-chart',
            data: data.rows
          });
      }.bind(this));
    },

    // To include in the API
    _getProvincesData: function(indicator) {
      var $deffered = jQuery.Deferred();
      var params = this.status.toJSON();

      var url = CARTO_ENDPOINT + '?q=with r as (select distinct on(sub_nat_id) sub_nat_id, avg(value) FILTER ( WHERE year < '+ params.monitor_start_year +' ) over (partition by sub_nat_id),  avg(value) FILTER ( WHERE year > '+ params.reference_end_year +' ) over (partition by sub_nat_id) as monitoring_avg, sum(value) FILTER ( WHERE year < 2011 ) over (partition by sub_nat_id) as total_reference, sum(value) FILTER ( WHERE year > 2010 ) over (partition by sub_nat_id) as total_monitoring, subnat.name_1 as province from indicators_values LEFT JOIN gadm27_adm1 AS subnat ON sub_nat_id  = subnat.id_1 AND indicators_values.iso = subnat.iso where indicator_id = '+ indicator +' and indicators_values.iso = \''+ this.iso +'\' and year !=0 and thresh= '+ params.thresh +' and sub_nat_id is not null and boundary =\'admin\') select avg, monitoring_avg, (((monitoring_avg-avg)/avg)*100) as delta_perc, (monitoring_avg-avg) as absolute, total_reference, total_monitoring, sub_nat_id, province from r where (((monitoring_avg-avg)/avg)*100) is not null order by 4 desc limit 5';

      $.ajax({
        url: url,
        success: function(data) {
          $deffered.resolve(data);
        }
      });

      return $deffered.promise();
    }
  });

  return CountryReportView;
});
