define([
  'backbone',
  'handlebars',
  'd3',
  'insights/views/InsightsGladAlertsChartView',
  'views/ShareView',
  'views/SourceModalView',
  'helpers/NumbersHelper',
  'text!insights/templates/insights-glad-alerts.handlebars',
  'text!insights/templates/insights-glad-alerts-legend.handlebars',
], function(Backbone, Handlebars, d3, InsightsGladAlertsChart,
  ShareView, SourceModalView, NumbersHelper, tpl, tplLegend) {

  'use strict';

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
      countryLabelClassEl: 'js-country-label'
    },

    initialize: function() {
      this.legends = [];
      this.currentStep = this.defaults.weekStep;
      this.currentCountry = this.defaults.country;
      this.currentYear = this.defaults.year;
      this.filter = this.defaults.filter;
      this.render();
      this._setListeners();

      // Info window
      new SourceModalView();
    },

    render: function() {
      this.$el.html(this.template({}));
      this.$el.removeClass(this.defaults.loadingClassEl);
      this.$el.addClass(this.defaults.loadedClassEl);

      this._renderMainChart();
    },

    _setListeners: function() {
      Backbone.Events.on('insights:glad:update', this._updateLegends.bind(this));
    },

    _renderMainChart: function() {
      var el = this.el.querySelector('#visMain');
      var chartEl = el.querySelector('.chart');
      var legendEl = el.querySelector('.legend');

      d3.csv('/insights_glad_alerts/' + this.currentCountry + '_' + this.currentYear + '.csv', function(data) {
        if (this.visMain) {
          this.visMain.remove();
          this.legends = [];
        }

        this._setMaxWeek(data);

        this.visMain = new InsightsGladAlertsChart({
          el: chartEl,
          params: {
            data: data,
            filter: this.filter,
            currentStep: this.currentStep,
            iso: this.currentCountry,
            year: this.currentYear
          }
        });

        el.classList.remove(this.defaults.loadingClassEl);
        this._createLegend(legendEl, data, 'main');
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
        var average = Math.round(current['2001_2013_average'] * 1);
        var target = Math.round(current['2020_target'] * 1);
        var emissions = Math.round(current.cumulative_emissions * 1);
        var deforestation = Math.round(current.cumulative_deforestation * 1);
        var average_deforestation = Math.round(current['2001_2013_average_deforestation'] * 1);
        var target_deforestation = Math.round(current['2020_target_deforestation'] * 1);
        var alerts = Math.round(current.alerts);
        var annual_budget = Math.round(((emissions / target) * 100));
        var annual_budget_deforestation = Math.round(((deforestation / target_deforestation) * 100));
      }

      el.innerHTML = this.templateLegend({
        isDesforestation: filter === this.defaults.desforestationFilter,
        hasDifferentLabel: this.currentCountry === 'BRA',
        average: NumbersHelper.addNumberDecimals(average),
        target: NumbersHelper.addNumberDecimals(target),
        emissions: NumbersHelper.addNumberDecimals(emissions),
        annual_budget:  NumbersHelper.addNumberDecimals(annual_budget),
        annual_budget_deforestation: NumbersHelper.addNumberDecimals(annual_budget_deforestation),
        deforestation: NumbersHelper.addNumberDecimals(deforestation),
        average_deforestation:  NumbersHelper.addNumberDecimals(average_deforestation),
        target_deforestation:  NumbersHelper.addNumberDecimals(target_deforestation),
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

    _changeDataByCountry: function(ev) {
      var current = ev.currentTarget;
      var label = this.el.querySelector('.' + this.defaults.countryLabelClassEl);
      var value = current.value;
      var selected = current.querySelector('[data-iso="'+ value +'"]');

      label.innerHTML = selected.text;
      this.currentCountry = value;
      this._renderMainChart();
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
