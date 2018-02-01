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
        options: [
          { label: 'Continents', value: 'continents' },
          { label: 'Countries', value: 'countries', selected: true }
        ]
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
        this.switch = new SwitchView({
          el: '#' + this.switch.el,
          param: this.switch.param,
          data: {
            label: this.switch.label,
            options: this.switch.options
          }
        });

        this.listenTo(
          this.switch,
          'onSelectionchange',
          this.onSelectionChange.bind(this)
        );

        this.continentsEl = this.$('#geo-continents-list');
        this.countriesEl = this.$('#geo-countries-list');
        var continents = _.map(countryData, function(c) {
          c.href = '/countries/' + c.iso + '/report';
          return c;
        }).slice(1, 5);
        this.countryList = new GeoListView({
          el: this.continentsEl,
          data: continents,
          placeholder: 'Select continent name'
        });

        var countries = _.map(countryData, function(c) {
          c.href = '/countries/' + c.iso + '/report';
          return c;
        });
        this.countryList = new GeoListView({
          el: this.countriesEl,
          data: countries
        });
        this.$el.removeClass('is-loading');
      },

      onSelectionChange: function(i) {
        if (i === 'continents') {
          this.continentsEl.addClass('-active');
          this.countriesEl.removeClass('-active');
        } else {
          this.continentsEl.removeClass('-active');
          this.countriesEl.addClass('-active');
        }
      },

      render: function() {
        this.$el.html(this.template());
      }
    });

    return EmisionCalculatorIndex;
  }
);
