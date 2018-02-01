define(
  [
    'backbone',
    'handlebars',
    'underscore',
    'services/CountryService',
    'views/shared/GeoListView',
    'views/shared/SwitchView',
    'text!insights/templates/emissions-calculator/insights-emission-calculator-index.handlebars'
  ],
  function(
    Backbone,
    Handlebars,
    _,
    CountryService,
    GeoListView,
    SwitchView,
    tpl
  ) {
    'use strict';

    var EmisionCalculatorIndex = Backbone.View.extend({
      el: '#insights',

      switch: {
        el: 'countryInsighSwitch',
        param: 'pivot',
        label: 'Output Type',
        options: [{ label: 'Table', value: 0 }, { label: 'Pivot', value: 1 }]
      },

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
        this.switch = new SwitchView({
          el: '#' + this.switch.el,
          param: this.switch.param,
          data: {
            label: this.switch.label,
            options: this.switch.options
          }
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
