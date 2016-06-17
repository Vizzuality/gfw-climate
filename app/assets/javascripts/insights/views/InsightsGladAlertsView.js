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
      'change .js-country-selector': '_changeDataByCountry'
    },

    el: '#insights',

    template: Handlebars.compile(tpl),

    templateLegend: Handlebars.compile(tplLegend),

    defaults: {
      selectedClassEl: '-selected',
      filter: 'carbon_emissions',
      country: 'COD',
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

      d3.csv('/data_glad_' + this.currentCountry + '.csv', function(data) {
        if (this.visMain) {
          this.visMain.remove();
        }

        this._setMaxWeek(data);

        this.visMain = new InsightsGladAlertsChart({
          el: chartEl,
          params: {
            data: data,
            filter: this.filter,
            currentStep: this.currentStep
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

      el.innerHTML = this.templateLegend({
        isDesforestation: filter === this.defaults.desforestationFilter,
        average: NumbersHelper.addNumberDecimals(Math.round(current.percent_to_emissions_target * 1)),
        target: NumbersHelper.addNumberDecimals(Math.round(current.baseline_emissions * 1)),
        emissions: NumbersHelper.addNumberDecimals(Math.round(current.cumulative_emissions * 1)),
        annual_budget: NumbersHelper.addNumberDecimals(Math.round(current.emissions_target * 1)),
        deforestation: NumbersHelper.addNumberDecimals(Math.round(current.cumulative_deforestation)),
        deforestation_cap: NumbersHelper.addNumberDecimals(Math.round(current.deforestation_target)),
        alerts: NumbersHelper.addNumberDecimals(Math.round(current.alerts))
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
