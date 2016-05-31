define([
  'backbone',
  'handlebars',
  'd3',
  'insights/views/InsightsGladAlertsChartView',
  'text!insights/templates/insights-glad-alerts.handlebars',
  'text!insights/templates/insights-glad-alerts-legend.handlebars',
], function(Backbone, Handlebars, d3, InsightsGladAlertsChart, tpl, tplLegend) {

  'use strict';

  var InsightsGladAlerts = Backbone.View.extend({

    events: {
      'click .js-selector-main': '_changeMainVis',
      'click .js-selector-compare': '_changeCompareVis',
      'click .js-timeline-button': '_toggleTimeline'
    },

    el: '#vis-glad',

    template: Handlebars.compile(tpl),

    templateLegend: Handlebars.compile(tplLegend),

    defaults: {
      selectedClassEl: '-selected',
      filter: 'carbon_emissions',
      desforestationFilter: 'deforestation',
      isPlayingClassEl: '-is-playing',
      timelineClassEl: 'timeline-button',
      loadingClassEl: 'is-loading',
      loadedClassEl: 'loaded',
      timelineInterval: 500
    },

    initialize: function() {
      this.legends = [];
      this.compareVisList = [];
      this.currentStep = 1;
      this.isPlaying = false;
      this.render();
      this._setListeners();
    },

    render: function() {
      this.$el.html(this.template({}));
      this.$el.removeClass(this.defaults.loadingClassEl);
      this.$el.addClass(this.defaults.loadedClassEl);

      this._renderMainChart();
      this._renderCompareChart('#vis1', '/data_glad_brazil.csv');
      this._renderCompareChart('#vis2', '/data_glad_rep_of_congo.csv');
      this._renderCompareChart('#vis3', '/data_glad_kalimantan.csv');
    },

    _setListeners: function() {
      Backbone.Events.on('insights:glad:update', this._updateLegends.bind(this));
      Backbone.Events.on('insights:glad:currentStep', this._updateLegends.bind(this));
      Backbone.Events.on('insights:glad:stopTimeline', this._stopTimeline.bind(this));
    },

    _renderMainChart: function() {
      var el = this.el.querySelector('#visMain');
      var chartEl = el.querySelector('.chart');
      var legendEl = el.querySelector('.legend');

      d3.csv('/data_glad_peru.csv', function(data){
        this.visMain = new InsightsGladAlertsChart({
          el: chartEl,
          params: {
            data: data,
            filter: this.defaults.filter
          }
        });

        el.classList.remove(this.defaults.loadingClassEl);
        this._createLegend(legendEl, data, 'main');
      }.bind(this));
    },

    _renderCompareChart: function(el, url) {
      var el = this.el.querySelector(el);
      var chartEl = el.querySelector('.chart');
      var legendEl = el.querySelector('.legend');

      d3.csv(url, function(data){
        this.compareVisList.push(new InsightsGladAlertsChart({
          el: chartEl,
          params: {
            data: data,
            compact: true,
            filter: this.defaults.filter,
            circleRadiusRange: [3, 6],
            margin: {
              top: 35,
              right: 65,
              bottom: 35,
              left: 65
            },
          }
        }));

        this._createLegend(legendEl, data, 'compare');
      }.bind(this));
    },

    _createLegend: function(el, data, category) {
      this.legends.push({
        element: el,
        data: data,
        category: category,
        filter: this.defaults.filter
      });

      this._renderLegend(el, data, this.defaults.filter);
    },

    _renderLegend: function(el, data, filter) {
      var current = _.filter(data, function(d) {
        return (d.week * 1) === this.currentStep;
      }.bind(this))[0];

      el.innerHTML = this.templateLegend({
        isDesforestation: filter === this.defaults.desforestationFilter,
        emissions: (current.cumulative_emissions * 1).toFixed(2),
        annual_budget: (current.emissions_target * 1).toFixed(2),
        deforestation: this._toThousands(current.cumulative_deforestation),
        deforestation_cap: this._toThousands(current.deforestation_target),
        alerts: this._toThousands(current.alerts)
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

    _changeMainVis: function(ev) {
      var current = ev.currentTarget;
      var filter = current.dataset.filter;

      if (!current.classList.contains(this.defaults.selectedClassEl)) {
        this._toggleFilter(current);
        this.visMain.updateByFilter(filter);

        var legend = _.findWhere(this.legends, {
          category: 'main'
        });
        legend.filter = filter;

        this._renderLegend(legend.element, legend.data, legend.filter);
      }
    },

    _changeCompareVis: function(ev) {
      var current = ev.currentTarget;
      var filter = current.dataset.filter;


      if (!current.classList.contains(this.defaults.selectedClassEl)) {
        this._toggleFilter(current);
        var legends = _.where(this.legends, { category: 'compare' });
        this.compareVisList.forEach(function(vis, i) {
          vis.updateByFilter(filter);

          var legend = legends[i];
          legend.filter = filter;

          this._renderLegend(legend.element, legend.data, legend.filter);
        }.bind(this));
      }
    },

    _toggleFilter: function(element) {
      var previousSelected = element.parentNode.querySelector('.' + this.defaults.selectedClassEl);
      previousSelected.classList.remove(this.defaults.selectedClassEl);

      element.classList.add(this.defaults.selectedClassEl);

      this._stopTimeline();
      // Backbone.Events.trigger('insights:glad:setStep', 1);
    },

    _toThousands: function(number) {
      return number > 999 ? (number/ 1000).toFixed(1) + 'k' : (number * 1).toFixed(2);
    },

    _toggleTimeline: function(ev) {
      var timelineToggle = this.el.querySelector('.' + this.defaults.timelineClassEl);

      if (!this.isPlaying) {
        timelineToggle.classList.add(this.defaults.isPlayingClassEl);
        this.isPlaying = true;
      } else {
        timelineToggle.classList.remove(this.defaults.isPlayingClassEl);
        this.isPlaying = false;
      }

      this._togglePlay();
    },

    _stopTimeline: function() {
      var timelineToggle = this.el.querySelector('.' + this.defaults.timelineClassEl);
      timelineToggle.classList.remove(this.defaults.isPlayingClassEl);

      this._pause();
    },

    /**
     * Toggles the play / pause functionality
     */
    _togglePlay: function() {
      if (this.isPlaying) {
        this._play();
      } else {
        this._pause();
      }
    },

    /**
     * Starts the timeline animation
     */
    _play: function() {
      var _this = this;
      this.isPlaying = true;

      this._resetInterval();

      this.playInterval = setInterval(function() {
        Backbone.Events.trigger('insights:glad:updateByTimeline');
      }, this.defaults.timelineInterval);
    },

    /**
     * Stops the timeline animation
     */
    _pause: function() {
      this.isPlaying = false;

      this._resetInterval();
    },

    /**
     * Resets the animaton interval
     */
    _resetInterval: function() {
      if (this.playInterval) {
        clearInterval(this.playInterval);
        this.playInterval = null;
      }
    },
  });

  return InsightsGladAlerts;

});
