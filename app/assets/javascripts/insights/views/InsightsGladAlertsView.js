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
  var ENDPOINT_DATA = '/query/9ed18255-89a9-4ccd-bdd6-fe7ffa1b1595?sql=SELECT sum(alerts::int) AS alerts, sum(cumulative_emissions::float) AS cumulative_emissions, sum(above_ground_carbon_loss::float) AS above_ground_carbon_loss, sum(percent_to_emissions_target::float) AS percent_to_emissions_target, sum(percent_to_deforestation_target::float) AS percent_to_deforestation_target, sum(loss::float) AS loss, sum(cumulative_deforestation::float) AS cumulative_deforestation, year::text as year, country_iso, week FROM data WHERE ((country_iso IN (\'%s\') OR state_iso IN (\'%s\')) AND year IN (\'%s\') AND week::int < 52) GROUP BY year, country_iso, week ORDER BY week::int ASC';

  var WEEKS_YEAR = 52;

  var InsightsGladAlerts = Backbone.View.extend({

    events: {
      'click .js-selector': '_changeVisualizations',
      'click .js-share': '_openShare',
      'click .js-year-nav': '_changeYear',
      'change .js-country-selector': '_changeDataByCountry',
      'change .js-year-selector': '_changeDataByYear'
    },

    el: '#insights',

    template: Handlebars.compile(tpl),

    templateLegend: Handlebars.compile(tplLegend),

    defaults: {
      selectedClassEl: '-selected',
      filter: 'carbon_emissions',
      country: 'BRA',
      year: 2016,
      weekStep: 1,
      desforestationFilter: 'deforestation',
      loadingClassEl: 'is-loading',
      mainVisSwitchEl: 'main-vis-switch',
      loadedClassEl: 'loaded',
      countryLabelClassEl: 'js-country-label',
      countrySelectorClassEl: 'js-country-selector',
      legendSelectoClassEl: 'js-legend',
      noDataClassEl: 'no-data',
      imageURI: window.gfw.config.GFW_DATA_S3 + 'climate/glad_maps'
    },

    initialize: function() {
      this.legends = [];
      this.chartConfig = [];
      this.locations = [];
      this.images = {};
      this.currentStep = this.defaults.weekStep;
      this.currentCountry = this.defaults.country;
      this.currentYear = this.defaults.year;
      this.filter = this.defaults.filter;
      this.imageURI = this.defaults.imageURI;

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
      var $el = this.el.querySelector('#visMain');
      var $vis = $el.querySelector('.visualization');
      var $chartEl = $el.querySelector('.chart');
      var iso = this.currentCountry;
      var year = this.currentYear;

      this._clearVisualization();

      $chartEl.innerHTML = '';
      $vis.classList.add(this.defaults.loadingClassEl);

      $.ajax({
        url: API + _.str.sprintf(ENDPOINT_DATA, iso, iso, year),
        type: 'GET',
        success: function(res) {
          var data = res.data;

          if (data.length) {
            $el.classList.remove(this.defaults.noDataClassEl);
            this._createVisualization(data);
          } else {
            $el.classList.add(this.defaults.noDataClassEl);
            this._renderNoDataPlaceHolder();
          }

          $vis.classList.remove(this.defaults.loadingClassEl);
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
          year: this.currentYear,
          desforestationFilter: this.defaults.desforestationFilter,
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
          iso: this.currentCountry
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
      var lastValue = data && data[data.length - 1] ?
        data[data.length - 1] : [];

      if (lastValue) {
        this.currentStep = (lastValue.week * 1);
      }
    },

    _getIso: function() {
      var country = this.currentCountry;
      var re = /(\d+)/g;
      var subst = '-$1';

      country = country.replace(re, subst);
      return country;
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
        var co2Equivalency = Math.round(((current.above_ground_carbon_loss * 1) * 10000000) / 4.7);

        var date = moment.utc().year(this.currentYear);
        var weeksInYear = date.weeksInYear();
        var currentWeek = weeksInYear > WEEKS_YEAR ? (this.currentStep + 1) : this.currentStep;
        var dateWithWeek = date.week(currentWeek);

        if (weeksInYear > WEEKS_YEAR) {
          dateWithWeek.subtract(1, 'days');
        } else {
          dateWithWeek.add(1, 'days');
        }

        var begin = dateWithWeek.clone().format('YYYY-MM-DD');
        var end = dateWithWeek.clone().add(6, 'days').format('YYYY-MM-DD');

        el.innerHTML = this.templateLegend({
          isDesforestation: filter === this.defaults.desforestationFilter,
          emissions: NumbersHelper.addNumberDecimals(emissions),
          deforestation: NumbersHelper.addNumberDecimals(deforestation),
          annual_budget:  NumbersHelper.addNumberDecimals(annual_budget),
          annual_budget_deforestation: NumbersHelper.addNumberDecimals(annual_budget_deforestation),
          alerts: NumbersHelper.addNumberDecimals(alerts),
          co2Equivalency: NumbersHelper.addNumberDecimals(co2Equivalency),
          begin: begin,
          end: end,
          iso: this._getIso(),
          week: this.currentStep
        });

        this.legendImage = el.querySelector('.image');
        this.showImage();
      }
    },

    _updateLegends: function(state) {
      if (this.currentStep !== state.step) {
        this.currentStep = state.step;
        this.maxData = state.maxData;
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
        this.images = {}

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

    _changeYear: function(ev) {
      var action = ev.currentTarget.dataset.action;
      var $parent = ev.currentTarget.parentNode;
      var $selector = $parent.querySelector('.js-year-selector');
      var options = $selector.options;
      var current = $selector.selectedIndex;
      var max = $selector.length - 1;
      var newIndex = current;
      var $add = $parent.querySelector('.-js-year-nav-right');
      var $sub = $parent.querySelector('.-js-year-nav-left');


      if (action === 'add') {
        newIndex++;
      } else if (action === 'sub') {
        newIndex--;
      }

      if (newIndex < 0) {
        newIndex = max;
      } else if (newIndex > max) {
        newIndex = 0;
      }

      if (newIndex < max) {
        $add.classList.remove('-disabled');
      } else {
        $add.classList.add('-disabled');
      }
      if (newIndex === 0) {
        $sub.classList.add('-disabled');
      } else {
        $sub.classList.remove('-disabled');
      }

      $selector.selectedIndex = newIndex;
      this.currentYear = parseInt(options[newIndex].text, 10);

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

    /**
     * Shows the image of the current step
     */
    showImage: function() {
      var maxData = this.maxData || this.currentStep;

      if (!this.images[this.currentStep] &&
        (this.currentStep <= maxData)) {
        var image = new Image();
        var currentStep = this.currentStep;

        image.onload = this._onImageLoad(currentStep, image);
        image.onerror = this._onImageError(currentStep);
        image.src = this.imageURI + '/' + this.currentCountry.toLowerCase() +
          '_' + this.currentYear + '_' +
          NumbersHelper.padNumberToTwo(this.currentStep) + '.png';
      } else {
        var img = this.images[this.currentStep];

        if (img && img.image) {
          this._renderLegendImage(img.image);
        } else {
          this._renderLegendImage(false);
        }
      }
    },

    /**
     * On image error
     * @param  {Number} current step
     */
    _onImageError: function(currentStep) {
      return (function(step) {
        return function(e) {
          this.images[step] = {
            loaded: false,
            image: null
          };

          if (step === this.currentStep) {
            this._renderLegendImage(false);
          }
        }.bind(this);
      }.bind(this))(currentStep);
    },

    /**
     * Updates the tooltip of the current step
     * @param  {Number} current step
     * @param  {Object} image object
     */
    _onImageLoad: function(currentStep, image) {
      return (function(step, image) {
        return function(e) {
          this.images[step] = {
            loaded: true,
            image: image
          };

          if (step === this.currentStep) {
            this._renderLegendImage(image);
          }
        }.bind(this);
      }.bind(this))(currentStep, image);
    },

    /**
     * Renders the image or the error message
     * @param  {Object} image object
     */
    _renderLegendImage: function(image) {
      this.legendImage.innerHTML = '';
      this.legendImage.classList.remove('-no-data');

      if (image) {
        this.legendImage.appendChild(image);
      } else {
        this.legendImage.innerHTML = 'Not available';
        this.legendImage.classList.add('-no-data');
      }
    },
  });

  return InsightsGladAlerts;

});
