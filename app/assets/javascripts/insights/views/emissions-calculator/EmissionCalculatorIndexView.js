define(
  [
    'backbone',
    'handlebars',
    'underscore',
    'services/CountryService',
    'views/shared/GeoListView',
    'text!insights/templates/emissions-calculator/insights-emission-calculator-index.handlebars'
  ],
  function(Backbone, Handlebars, _, CountryService, GeoListView, tpl) {
    'use strict';

    var EmisionCalculatorIndex = Backbone.View.extend({
      el: '#insights',

      template: Handlebars.compile(tpl),

      initialize: function(settings) {
        this.defaults = _.extend({}, this.defaults, settings);

        CountryService.getCountries({ geo: true }).then(
          this.onCountriesData.bind(this)
        );
      },

      onCountriesData: function(countryData) {
        this.render();
        this.start(countryData);
      },

      start: function(countryData) {
        var data = _.map(countryData, function(c) {
          c.href = '/countries/' + c.iso + '/report';
          return c;
        });
        this.countryList = new GeoListView({
          el: '#geo-list',
          data: data
        });
        this.$el.removeClass('is-loading');
      },

      render: function() {
        this.$el.html(this.template());
      }
    });

    return EmisionCalculatorIndex;
  }
);
