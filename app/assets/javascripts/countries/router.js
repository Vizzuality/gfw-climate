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
      'embed/pantropical'                   : '_initPantropical',
      'countries(/)(:country)(/)(:view)'    : '_initShow'
    },

    initialize: function() {
      this.placeService = new PlaceService(this);
    },

    _initIndex: function() {
      new CountryIndexView();
    },

    _initShow: function(country, view) {

      new CountryShowView();

      var params = _.extend({
        country: country,
        view: view
      }, _.parseUrl());

      this.placeService.initPlace(params);
    },

    _initPantropical: function() {
      new CountryPantropicalView();
    }

  });

  return Router;

});
