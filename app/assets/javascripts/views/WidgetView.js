define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'countries/views/indicators/GraphChartIndicator',
  'countries/views/indicators/MapIndicator',
  'countries/views/indicators/PieChartIndicator',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, CountryModel, GraphChartIndicator,
  MapIndicator, PieChartIndicator, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    el: '#reports',

    template: Handlebars.compile(tpl),

    events: {
      'click .close' : '_close',
      'click #info'   : '_info',
      'click #share'  : '_share'
      // 'click .indicators-grid__item': '_setCurrentIndicator'
    },

    initialize: function(data) {
      this.model = CountryModel;
      this.indicators = [];

      this._setIndicators();
      this._loadIndicator();
    },

    _setCurrentIndicator: function(e) {
      var indicatorTabs = document.getElementsByClassName('is-selected'),
        currentIndicator = e.currentTarget;

      $(indicatorTabs).toggleClass('is-selected');
      $(currentIndicator).addClass('is-selected');

      this._loadIndicator(currentIndicator);
    },

    _loadIndicator: function(indicator) {
      // var indicatorType = indicator.getAttribute('data-name');
      // TO-DO: API call
      var graphChart = new GraphChartIndicator();

    },

    _setIndicators: function() {

      console.log(this.model.attributes);

      for(var prop in this.model.attributes) {
        if (prop === 'umd') {
          this.indicators.push(prop);
        }

        if (prop === 'forests') {
          this.indicators.push(prop);
        }

        if (prop === 'tenure') {
          this.indicators.push(prop);
        }
      }

      this.render();

    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {
      this.$el.html(this.template({indicators: this.indicators}))
      $('.indicators-grid__item:first-child').trigger('click');

      // $(this.el).html(this.template({id: this.id}));
      // return this;
    }

  });

  return WidgetView;

});
