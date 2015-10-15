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
    },

    _initIndex: function() {
      // new CountryIndexView();
    },

    _initShow: function(country, area) {

      var params = _.extend({
        country: country,
        area: area
      }, _.parseUrl());

      this.placeService.initPlace(params);
    },

    _initPantropical: function() {
      new CountryPantropicalView();
    }

  });

  return Router;

});
