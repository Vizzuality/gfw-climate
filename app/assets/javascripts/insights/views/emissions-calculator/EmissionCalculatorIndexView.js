define(
  [
    'backbone',
    'handlebars',
    'underscore',
    'services/CountryService',
    'services/ContinentService',
    'views/shared/GeoListView',
    'views/shared/SwitchView',
    'text!insights/templates/emissions-calculator/insights-emission-calculator-index.handlebars'
  ],
  function(
    Backbone,
    Handlebars,
    _,
    CountryService,
    ContinentService,
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
        this.render();
        this.cache();
        this.startCountries();
        this.$el.removeClass('is-loading');
      },

      cache: function() {
        this.continentsEl = this.$('#geo-continents-list');
        this.countriesEl = this.$('#geo-countries-list');
      },

      startCountries() {
        CountryService.getCountries({ geo: true })
          .then(this.onCountriesData.bind(this))
          .catch(this.startCountries);
      },

      onCountriesData: function(countryData) {
        this.renderCountries(countryData);
        this.startContinents();
        this.startSwitch();
        // https://github.com/petkaantonov/bluebird/blob/master/docs/docs/warning-explanations.md#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
        return null;
      },

      startSwitch: function() {
        this.switchView = new SwitchView({
          el: '#' + this.switch.el,
          param: this.switch.param,
          data: {
            label: this.switch.label,
            options: this.switch.options
          }
        });

        this.listenTo(
          this.switchView,
          'onSelectionchange',
          this.onSelectionChange.bind(this)
        );
      },

      renderCountries: function(countryData) {
        var countries = _.map(countryData, function(c) {
          c.href = '/countries/' + c.iso + '/report';
          return c;
        });
        this.countriesView = new GeoListView({
          el: this.countriesEl,
          data: countries
        });
        this.countriesEl.removeClass('is-loading');
      },

      startContinents() {
        ContinentService.getContinents({ geo: true })
          .then(this.onContinentsData.bind(this))
          .catch(this.startContinents);
      },

      onContinentsData(continentsData) {
        var continents = _.map(continentsData, function(c) {
          c.href = '/countries/' + c.iso + '/report';
          return c;
        });
        this.continentsView = new GeoListView({
          el: this.continentsEl,
          data: continents,
          placeholder: 'Type continent name'
        });
        this.continentsEl.removeClass('is-loading');
        return null;
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
