/**
 * The Feed view.
 */
define(
  [
    'jquery',
    'backbone',
    'underscore',
    'amplify',
    'd3',
    'mps',
    'services/CountryService',
    'views/shared/GeoListView'
  ],
  function($, Backbone, _, amplify, d3, mps, CountryService, GeoListView) {
    'use strict';

    var CountryListView = Backbone.View.extend({
      el: '#countryListView',

      initialize: function() {
        if (!this.$el.length) {
          return;
        }
        this.geoList = this.$('#geoListView');
        this.$searchBox = $('#searchCountry');
        this._drawCountries();
      },

      _drawCountries: function() {
        CountryService.getCountries({ geo: true }).then(
          function(countryData) {
            var data = _.map(countryData, function(c) {
              c.href = '/countries/' + c.iso;
              return c;
            });
            this.countryList = new GeoListView({
              el: this.geoList,
              data: data
            });
            this.geoList.removeClass('is-loading');
          }.bind(this)
        );
      }
    });

    return CountryListView;
  }
);
