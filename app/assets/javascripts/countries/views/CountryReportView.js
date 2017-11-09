define([
  'backbone',
  'mps',
  'nouislider',
  'moment',
  'underscore',
  '_string',
  'helpers/NumbersHelper',
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
  moment,
  _,
  _string,
  NumbersHelper,
  ReportService,
  SummaryChartView,
  HistoricalTrendChartView,
  PieChartView,
  ProvincesTopChartView,
  CountryGeoView,
  tpl
) {
  'use strict';

  var ENDPOINT_ACCURACY = '/query/a1669972-d748-4542-8fa9-94f446f65c11?sql=SELECT * FROM data WHERE (iso IN (\'%s\'))';

  var CountryReportView = Backbone.View.extend({

    el: '#report',

    template: Handlebars.compile(tpl),

    status: new (Backbone.Model.extend()),

    defaults: {
      settings: {
        'reference_start_year': '2001',
        'reference_end_year': '2010',
        'monitor_start_year': '2011',
        'monitor_end_year': '2016',
        'thresh': '30',
        'below': 'false',
        'primary_forest': 'false',
        'exclude_plantations': 'false',
        'co2': 'true'
      },
      minYear: 2001,
      maxYear: 2016
    },

    events: {
      'change .js-report-param' : '_handleReportParamsChange',
      'click #update-report-btn' : '_updateReport',
      'click #report-updates-submit' : '_subscribeUpdates',
    },

    initialize: function(params) {
      this.options = this._getOptions(params);
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

    _getOptions: function(params) {
      var options = _.extend(this.defaults, params);
      if (!params.params.primary_forest && this._hasPrimaryForest(params.iso) && this._isDefaultPrimaryForest(params.iso)) {
        options.settings.primary_forest = 'true';
      }
      if (!params.params.exclude_plantations && this._hasPlantations(params.iso) && this._isDefaultExcludePlantations(params.iso)) {
        options.settings.exclude_plantations = 'true';
      }
      return options;
    },

    // TODO: make this dynamic !!!
    _hasPrimaryForest: function(iso) {
      var hasPrimaryForest = ['COD', 'IDN'];
      return hasPrimaryForest.indexOf(iso) >= 0;
    },

    _hasPlantations: function(iso) {
      var hasPlantations = ['BRA', 'IDN', 'MYS', 'COL', 'KHM', 'LBR', 'PER'];
      return hasPlantations.indexOf(iso) >= 0;
    },

    _isDefaultPrimaryForest: function(iso) {
      var primaryForestDefault = ['COD'];
      return primaryForestDefault.indexOf(iso) >= 0;
    },

    _isDefaultExcludePlantations: function(iso) {
      var excludePlantationsDefault = ['IDN', 'MYS', 'BRA'];
      return excludePlantationsDefault.indexOf(iso) >= 0;
    },

    _cache: function() {
      this.yearSelector = this.el.querySelector('.js-year-selector');
      this.yearSelectorReference = this.el.querySelector('.js-reference-slider');
      this.yearSelectorMonitor = this.el.querySelector('.js-monitor-slider');
    },

    render: function() {
      this.$el.removeClass('is-loading');
      this.$el.html(this.template(this.parseTemplate()));

      this.updateBox = this.$('.updates-box');
      this._cache();
      this._initModules();
      this._listenModules();
    },

    parseTemplate: function() {
      var currentDate = moment();
      var totalReference = NumbersHelper.round(this.data.emissions.reference.average, 6);
      var totalMonitoring = NumbersHelper.round(this.data.emissions.monitor.average, 6);
      var increase = Math.round(((totalMonitoring - totalReference) / totalReference) * 100);
      var factorBelowgroundBiomass = Math.round(this.data.emission_factors.belowground);
      return {
        country: this.data.country,
        date: currentDate.format('MM/DD/YYYY'),
        year: currentDate.year(),
        monitorStart: this.status.get('monitor_start_year'),
        monitorEnd: this.status.get('monitor_end_year'),
        referenceStart: this.status.get('reference_start_year'),
        referenceEnd: this.status.get('reference_end_year'),
        primaryForest: {
          disabled: !this._hasPrimaryForest(this.options.iso),
          checked: this.status.get('primary_forest') === 'true'
        },
        excludePlantations: {
          disabled: !this._hasPlantations(this.options.iso),
          checked: this.status.get('exclude_plantations') === 'true'
        },
        below: this.status.get('below') === 'true',
        co2: this.status.get('co2') === 'true' ,
        totalReference: totalReference,
        totalMonitoring: totalMonitoring,
        increase: increase,
        increaseDisplay: Math.abs(increase),
        hasIncreased: increase > -1,
        hasProvinces: this.data.provinces.emissions.top_five.length > 0,
        factorAbovegroundBiomass: Math.round(this.data.emission_factors.aboveground),
        factorBelowgroundBiomass: factorBelowgroundBiomass ? factorBelowgroundBiomass : '',
        factorTotalEmission: Math.round(this.data.emission_factors.total),
        co2EmissionsByProvinces: this.data.provinces.emissions.top_five,
        accuracyData: this.accuracyData
      }
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
          this._getAccuracyData();
        }.bind(this));
    },

    _getAccuracyData: function() {
      var url = window.gfw.config.GFW_API_HOST_V2 +  _.str.sprintf(ENDPOINT_ACCURACY, this.iso);
      $.when($.getJSON(url))
        .then(function(res) {
          this.accuracyData = res.data[0];
          this.render();
        }.bind(this));
    },

    _initModules: function() {
      this._initSlides();
      this.summaryChart = new SummaryChartView({
        data: this.data.emissions,
        country: this.data.country,
        startYear: parseInt(this.status.get('reference_start_year'), 10),
        endYear: parseInt(this.status.get('monitor_end_year'), 10),
        commonYear: this.status.get('reference_end_year'),
        minYear: this.defaults.minYear,
        maxYear: this.defaults.maxYear
      });

      this.historicalTrendChart = new HistoricalTrendChartView({
        el: '#historical-trend-chart',
        data: this.data.forest_loss
      });

      this.forestLossByProvinceChart = new ProvincesTopChartView({
        el: '#forest-loss-province-chart',
        data: this.data.provinces.forest_loss.top_five
      });

      this.co2EmissionsByProvinceChart = new ProvincesTopChartView({
        el: '#co2-emissions-province-chart',
        data: this.data.provinces.emissions.top_five,
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
      });
    },

    _listenModules: function() {
      this.listenTo(this.summaryChart, 'summary:slider:change', function(data) {
        this._updateYearsRange(data);
      }.bind(this));
    },

    _updateYearsRange: function(params) {
      this.status.set({
        reference_start_year: params.startYear.toString(),
        reference_end_year: params.commonYear.toString(),
        monitor_start_year: params.commonYear === params.endYear ? params.endYear.toString() : (params.commonYear + 1).toString(),
        monitor_end_year: params.endYear.toString()
      });
      this._setUpdateButtonVisibility(true);
    },

    _initSlides: function() {
      this._initHeightSlider();
      this._initCrownSlider();
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
      this.crownSlider.noUiSlider.on('change', function(value) {
        this.status.set({
          thresh: parseInt(value[0])
        }, { silent: true });
        this._setUpdateButtonVisibility(true);
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

      this._setUpdateButtonVisibility(this._checkInputsDiff());
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

    _setUpdateButtonVisibility:function(visible) {
      if (this.updateBox) {
        if (visible) {
          this.updateBox.removeClass('-hide')
        } else {
          this.updateBox.addClass('-hide')
        }
      }
    },

    _validateEmail:function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },

    _subscribeUpdates:function(ev) {
      ev.preventDefault();
      var btnContainer = this.$el.find('#report-updates-submit');
      btnContainer.addClass('is-loading');
      var emailInput = this.$el.find('#sign-up-email');
      var email = emailInput.val();
      if (this._validateEmail(email)) {
        emailInput.removeClass('error');
        btnContainer.prop('disabled', true);
        $.ajax({
          type: 'POST',
          url: window.gfw.config.CLIMATE_API_HOST + '/report-sign-up',
          crossDomain: true,
          data: {
            email: email
          },
          dataType: 'json',
          success: function(responseData) {
            btnContainer.addClass('-success');
          },
          error: function(responseData) {
            if (responseData.responseJSON && responseData.responseJSON.msg) alert(responseData.responseJSON.msg);
          },
          complete: function(responseData) {
            btnContainer.removeClass('is-loading');
          },
        });
      } else {
        emailInput.addClass('error');
        btnContainer.removeClass('is-loading');
      }
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
