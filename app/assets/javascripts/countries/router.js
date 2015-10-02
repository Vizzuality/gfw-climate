define([
  'backbone',
  'utils',
  'services/PlaceService',
  'countries/views/CountryIndexView',
  'countries/views/CountryShowView'
], function(Backbone, utils, PlaceService, CountryIndexView, CountryShowView) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      'countries'                           : '_initIndex',
      'pantropical'               : '_initPantropical',
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

    _initPantropical: function() {},

    // navigateTo: function(route, options) {
    //   this.navigate(route, options);
    // }

  });

  return Router;

});
