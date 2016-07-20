define([
  'backbone',
  'handlebars',
  'd3',
  'underscore',
  '_string',
  'insights/views/InsightsGladAlertsChartView',
  'views/ShareView',
  'views/SourceModalView',
  'helpers/NumbersHelper',
  'text!insights/templates/insights-glad-alerts.handlebars',
  'text!insights/templates/insights-glad-alerts-legend.handlebars',
], function(Backbone, Handlebars, d3, _, _string, InsightsGladAlertsChart,
  ShareView, SourceModalView, NumbersHelper, tpl, tplLegend) {

  'use strict';

  var API = window.gfw.config.GFW_API_HOST_V2;
  var ENDPOINT_CONFIG = '/query/b0c709f0-d1a6-42a0-a750-df8bdb0895f3?sql=SELECT * FROM data';
  var ENDPOINT_DATA = '/query/4447a410-78d4-41d6-9364-213cfa176313?sql=SELECT * FROM data WHERE country_iso in (\'%s\') and year in (\'%s\')';

  var InsightsGladAlerts = Backbone.View.extend({

    events: {
      'click .js-selector': '_changeVisualizations',
      'click .js-share': '_openShare',
      'change .js-country-selector': '_changeDataByCountry',
      'change .js-year-selector': '_changeDataByYear'
    },

    el: '#insights',

    template: Handlebars.compile(tpl),

    templateLegend: Handlebars.compile(tplLegend),

    defaults: {
      selectedClassEl: '-selected',
      filter: 'carbon_emissions',
      country: 'PER',
      year: 2016,
      weekStep: 1,
      desforestationFilter: 'deforestation',
      loadingClassEl: 'is-loading',
      mainVisSwitchEl: 'main-vis-switch',
      loadedClassEl: 'loaded',
      countryLabelClassEl: 'js-country-label',
      countrySelectorClassEl: 'js-country-selector',
      legendSelectoClassEl: 'js-legend',
      noDataClassEl: 'no-data'
    },

    initialize: function() {
      this.legends = [];
      this.chartConfig = [];
      this.locations = [];
      this.currentStep = this.defaults.weekStep;
      this.currentCountry = this.defaults.country;
      this.currentYear = this.defaults.year;
      this.filter = this.defaults.filter;

      // Get the visualization's configuration
      $.when(this._getConfig())
        .done(this._initVisualization.bind(this));
    },

    _getConfig: function() {
      return $.ajax({
        url: API + ENDPOINT_CONFIG,
        type: 'GET'
      });
    },

    _initVisualization: function(config) {
      this.config = this._parseConfig(config);
      this.render();
      this._setListeners();

      // Info window
      new SourceModalView();
    },

    _parseConfig: function(config) {
      var data = config && config.data &&
        config.data[0] ? config.data[0] : {};

      if (data) {
        this.chartConfig = JSON.parse(data.vizsetup);
        this.locations = JSON.parse(data.locations);
      }
    },

    render: function() {
      this.$el.html(this.template({
        locations: this.locations
      }));
      this.$el.removeClass(this.defaults.loadingClassEl);
      this.$el.addClass(this.defaults.loadedClassEl);

      // Set default selection from the config
      var defaultCountry = _.findWhere(this.locations, {
        iso: this.chartConfig.defaultSelection
      });

      if (defaultCountry) {
        this._setCurrentCountry(defaultCountry.name, defaultCountry.iso);
      }

      this._renderMainChart();
    },

    _setListeners: function() {
      Backbone.Events.on('insights:glad:update', this._updateLegends.bind(this));
    },

    _renderMainChart: function() {
      var el = this.el.querySelector('#visMain');
      var chartEl = el.querySelector('.chart');
      var iso = this.currentCountry;
      var year = this.currentYear;

      this._clearVisualization();

      chartEl.innerHTML = '';
      chartEl.classList.add(this.defaults.loadingClassEl);

      $.ajax({
        url: API + _.str.sprintf(ENDPOINT_DATA, iso, year),
        type: 'GET',
        success: function(res) {
          var data = res.data;

          if (data.length) {
            el.classList.remove(this.defaults.noDataClassEl);
            this._createVisualization(data);
          } else {
            el.classList.add(this.defaults.noDataClassEl);
            this._renderNoDataPlaceHolder();
          }

          chartEl.classList.remove(this.defaults.loadingClassEl);
        }.bind(this)
      });
    },

    _createVisualization: function(data) {
      var el = this.el.querySelector('#visMain');
      var chartEl = el.querySelector('.chart');
      var legendEl = el.querySelector('.legend');

      this._setMaxWeek(data);

      this.visMain = new InsightsGladAlertsChart({
        el: chartEl,
        params: {
          data: this._parseData(data),
          filter: this.filter,
          currentStep: this.currentStep,
          iso: this.currentCountry,
          year: this.currentYear
        }
      });

      el.classList.remove(this.defaults.loadingClassEl);
      this._createLegend(legendEl, data, 'main');
    },

    _renderNoDataPlaceHolder: function() {
      var el = this.el.querySelector('#visMain');
      var chartEl = el.querySelector('.chart');

      chartEl.innerHTML = 'There\'s no data available for this selection';
    },

    _parseData: function(data) {
      return _.map(data, function(d) {
        var locationData = _.findWhere(this.locations, {
          iso: d.country_iso
        });

        if (locationData) {
          d.carbon_average = locationData.targets['carbon_emissions'].average;
          d.carbon_target = locationData.targets['carbon_emissions'].target;
          d.deforestation_average = locationData.targets['deforestation'].average;
          d.deforestation_target = locationData.targets['deforestation'].target;
        }

        if (d.iso === this.chartConfig.defaultSelection) {
          d.selected = true;
        }

        return d;
      }.bind(this));
    },

    _setMaxWeek: function(data) {
      var lastAlertsValues = _.filter(data, function(d) {
        return d.alerts === '0' || d.alerts === '';
      });

      if (lastAlertsValues && lastAlertsValues[0]) {
        this.currentStep = (lastAlertsValues[0].week * 1) - 1;
      }
    },

    _createLegend: function(el, data, category) {
      this.legends.push({
        element: el,
        data: data,
        category: category,
        filter: this.filter
      });

      this._renderLegend(el, data, this.filter);
    },

    _renderLegend: function(el, data, filter) {
      var current = _.filter(data, function(d) {
        return (d.week * 1) === this.currentStep;
      }.bind(this))[0];

      if (current) {
        var target = Math.round(current.carbon_target * 1);
        var emissions = Math.round(current.cumulative_emissions * 1);
        var deforestation = Math.round(current.cumulative_deforestation * 1);
        var target_deforestation = Math.round(current.deforestation_target * 1);
        var alerts = Math.round(current.alerts);
        var annual_budget = Math.round(((emissions / target) * 100));
        var annual_budget_deforestation = Math.round(((deforestation / target_deforestation) * 100));
      }

      el.innerHTML = this.templateLegend({
        isDesforestation: filter === this.defaults.desforestationFilter,
        emissions: NumbersHelper.addNumberDecimals(emissions),
        annual_budget:  NumbersHelper.addNumberDecimals(annual_budget),
        annual_budget_deforestation: NumbersHelper.addNumberDecimals(annual_budget_deforestation),
        deforestation: NumbersHelper.addNumberDecimals(deforestation),
        alerts: NumbersHelper.addNumberDecimals(alerts)
      });
    },

    _updateLegends: function(step) {
      if (this.currentStep !== step) {
        this.currentStep = step;
        this.legends.forEach(function(legend) {
          this._renderLegend(legend.element, legend.data, legend.filter);
        }.bind(this));
      }
    },

    _changeVisualizations: function(ev) {
      var current = ev.currentTarget;
      var filter = current.dataset.filter;

      this._changeMainVis(filter);
    },

    _changeMainVis: function(filter) {
      this._toggleFilter(this.defaults.mainVisSwitchEl, filter);

      this.visMain.updateByFilter(filter);

      var legend = _.findWhere(this.legends, {
        category: 'main'
      });
      legend.filter = filter;

      this._renderLegend(legend.element, legend.data, legend.filter);
    },

    _clearVisualization: function() {
      if (this.visMain) {
        this.visMain.remove();
        this.legends = [];

        var legend = this.el.querySelector('.' + this.defaults.legendSelectoClassEl);
        legend.innerHTML = '';
      }
    },

    _changeDataByCountry: function(ev) {
      var current = ev.currentTarget;
      var value = current.value;
      var selected = current.querySelector('[data-iso="'+ value +'"]');

      this._setCurrentCountry(selected.text, value);
      this._renderMainChart();
    },

    _setCurrentCountry: function(text, iso) {
      var label = this.el.querySelector('.' + this.defaults.countryLabelClassEl);
      var selector = this.el.querySelector('.' + this.defaults.countrySelectorClassEl);
      label.innerHTML = text;
      selector.value = iso;

      this.currentCountry = iso;
    },

    _changeDataByYear: function(ev) {
      var current = ev.currentTarget;
      this.currentYear = parseInt(current.value, 10);

      this._renderMainChart();
    },

    _toggleFilter: function(element, filter) {
      var parent = this.el.querySelector('.' + element);
      var selected = parent.querySelector('.' + this.defaults.selectedClassEl);
      var newSelection = parent.querySelector('[data-filter="'+ filter +'"]');

      selected.classList.remove(this.defaults.selectedClassEl);
      newSelection.classList.add(this.defaults.selectedClassEl);
      this.filter = filter;
    },

    _openShare: function(event) {
      var shareView = new ShareView().share(event);
      $('body').append(shareView.el);
    },
  });

  return InsightsGladAlerts;

});
