define([
  'backbone',
  'handlebars',
  'services/CountryService',
  'views/shared/GeoListView',
  'text!insights/templates/emissions-calculator/insights-emission-calculator-index.handlebars',
], function(Backbone, Handlebars, CountryService, GeoListView, tpl) {

  'use strict';

  var EmisionCalculatorIndex = Backbone.View.extend({

    el: '#insights',

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.defaults = _.extend({}, this.defaults, settings);

      CountryService.getCountries({ geo: true })
        .then(this.onCountriesData.bind(this));
    },

    onCountriesData: function(countryData) {
      this.render();
      this.start(countryData);
    },

    start: function(countryData) {
      this.countryList = new GeoListView({
        el: '#geo-list',
        data: countryData
      });
      this.$el.removeClass('is-loading');
    },

    render: function() {
      this.$el.html(this.template());
    }
  });

  return EmisionCalculatorIndex;

});
