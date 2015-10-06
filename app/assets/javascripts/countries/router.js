define([
  'backbone',
  'utils',
  'countries/services/PlaceService',
  'countries/views/CountryIndexView',
  'countries/views/CountryShowView',
  'countries/views/CountryPantropicalView'
], function(Backbone, utils, PlaceService, CountryIndexView, CountryShowView,CountryPantropicalView) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      'countries'                           : '_initIndex',
      'pantropical'                         : '_initPantropical',
      'countries/:country(/:area)(?params)' : '_initShow'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
      this.name = 'countries';
    },

    _initIndex: function() {
      // new CountryIndexView();
    },

    _initShow: function(country, area, params) {

      var params = {
        country: country,
        area: area,
        options: _.parseUrl()
      };

      this.placeService.initPlace(this.name, params);
    },

    _initPantropical: function() {
      new CountryPantropicalView();
    }

  });

  return Router;

});
